import express from "express";
import helmet from "helmet";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import esbuild from "esbuild";
import { nanoid } from "nanoid";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const PORT = Number(process.env.PORT || 3000);
const SERVER_SECRET = process.env.SERVER_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SERVER_SECRET) {
  console.error("Missing SERVER_SECRET. Set it in Secrets/env.");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL (Neon). Set it in Secrets/env.");
  process.exit(1);
}

// ---- build client bundles ----
async function buildClient() {
  const opts = {
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    sourcemap: false,
    logLevel: "silent",
  };

  await esbuild.build({
    ...opts,
    entryPoints: ["client/create_entry.js"],
    outfile: "public/create.bundle.js",
  });

  await esbuild.build({
    ...opts,
    entryPoints: ["client/view_entry.js"],
    outfile: "public/view.bundle.js",
  });

  console.log("Client bundles built.");
}
await buildClient();

// ---- Neon Postgres ----
// Neon requires TLS; this config works well on hosted environments.
// (If you ever get TLS errors locally, set rejectUnauthorized=true with proper CA.)
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      decoy TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      views_left INT NOT NULL,
      ip_lock BOOLEAN NOT NULL DEFAULT FALSE,
      first_ip_hash TEXT,
      deleted BOOLEAN NOT NULL DEFAULT FALSE,
      deleted_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_notes_expires_at ON notes(expires_at);
  `);

  // Optional: opportunistic cleanup (keeps DB tidy)
  await pool.query(
    `DELETE FROM notes WHERE expires_at <= NOW() OR deleted = TRUE;`,
  );
  console.log("DB initialized.");
}
await initDb();

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  const s = Array.isArray(xf) ? xf[0] : xf || "";
  const ip = s.split(",")[0].trim();
  return ip || req.socket.remoteAddress || "";
}

function ipHmacHex(ip) {
  return crypto.createHmac("sha256", SERVER_SECRET).update(ip).digest("hex");
}

function safeEq(a, b) {
  const aa = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

// ---- server ----
const app = express();
app.set("trust proxy", true);

app.use(express.json({ limit: "450kb" }));

app.use(
  helmet({
    referrerPolicy: { policy: "no-referrer" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
        styleSrc: ["'self'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'"],
        baseUri: ["'none'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  }),
);

// serve argon2-browser locally from node_modules
app.get("/vendor/argon2-bundled.min.js", (req, res) => {
  const p = require.resolve("argon2-browser/dist/argon2-bundled.min.js");
  res.type("application/javascript");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile(p);
});

app.use(express.static(path.join(__dirname, "public"), { etag: true }));

app.get("/", (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/n/:id", (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.sendFile(path.join(__dirname, "public", "note.html"));
});

app.get("/healthz", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// ---- API ----
const MAX_PAYLOAD_BYTES = 350_000;
const MAX_DECOY_CHARS = 5_000;
const MAX_TTL_SECONDS = 30 * 24 * 3600;
const MAX_VIEWS = 100;

app.post("/api/notes", async (req, res) => {
  try {
    const { payload, ttlSeconds, burnViews, ipLock, decoy } = req.body || {};

    if (typeof payload !== "string" || !payload.trim()) {
      return res.status(400).json({ error: "payload required" });
    }
    if (Buffer.byteLength(payload, "utf8") > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({ error: "payload too large" });
    }

    const ttl = Number(ttlSeconds ?? 86400);
    const views = Number(burnViews ?? 1);
    const lock = !!ipLock;

    if (!Number.isFinite(ttl) || ttl < 60 || ttl > MAX_TTL_SECONDS) {
      return res.status(400).json({ error: "ttlSeconds out of range" });
    }
    if (!Number.isFinite(views) || views < 1 || views > MAX_VIEWS) {
      return res.status(400).json({ error: "burnViews out of range" });
    }

    let decoyVal = null;
    if (decoy != null) {
      if (typeof decoy !== "string")
        return res.status(400).json({ error: "decoy must be string" });
      if (decoy.length > MAX_DECOY_CHARS)
        return res.status(400).json({ error: "decoy too long" });
      decoyVal = decoy;
    }

    const id = nanoid(40).replace(/[-_]/g, "").slice(0, 32);
    const expiresAt = new Date(Date.now() + ttl * 1000);

    await pool.query(
      `
      INSERT INTO notes (id, payload, decoy, expires_at, views_left, ip_lock)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [id, payload, decoyVal, expiresAt, views, lock],
    );

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/notes/:id", async (req, res) => {
  const id = String(req.params.id || "");
  if (id.length !== 32) return res.sendStatus(404);

  const ipHash = ipHmacHex(getClientIp(req));
  const tnow = new Date();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the row to enforce burn-on-view atomically
    const r = await client.query(
      `SELECT * FROM notes WHERE id = $1 FOR UPDATE`,
      [id],
    );

    if (r.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.sendStatus(404);
    }

    const note = r.rows[0];

    if (note.deleted || note.expires_at <= tnow || note.views_left <= 0) {
      await client.query(`DELETE FROM notes WHERE id = $1`, [id]);
      await client.query("COMMIT");
      return res.sendStatus(404);
    }

    if (note.ip_lock) {
      if (!note.first_ip_hash) {
        await client.query(
          `UPDATE notes SET first_ip_hash = $1 WHERE id = $2`,
          [ipHash, id],
        );
      } else {
        if (!safeEq(note.first_ip_hash, ipHash)) {
          await client.query("ROLLBACK");
          return res.sendStatus(404);
        }
      }
    }

    const nextViews = Number(note.views_left) - 1;
    if (nextViews <= 0) {
      await client.query(`DELETE FROM notes WHERE id = $1`, [id]);
    } else {
      await client.query(`UPDATE notes SET views_left = $1 WHERE id = $2`, [
        nextViews,
        id,
      ]);
    }

    await client.query("COMMIT");

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.json({ payload: note.payload, decoy: note.decoy });
  } catch {
    try {
      await client.query("ROLLBACK");
    } catch {}
    res.sendStatus(404);
  } finally {
    client.release();
  }
});

app.listen(PORT, () => console.log(`GhostNote running on port ${PORT}`));
