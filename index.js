import express from "express";
import helmet from "helmet";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import esbuild from "esbuild";
import Database from "better-sqlite3";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const PORT = Number(process.env.PORT || 3000);
const SERVER_SECRET = process.env.SERVER_SECRET;
if (!SERVER_SECRET) {
  console.error("Missing SERVER_SECRET. Set it in Replit Secrets.");
  process.exit(1);
}

// ---- build client bundles (no CDN, no libsodium) ----
async function buildClient() {
  const opts = {
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    sourcemap: false,
    logLevel: "silent"
  };

  await esbuild.build({
    ...opts,
    entryPoints: ["client/create_entry.js"],
    outfile: "public/create.bundle.js"
  });

  await esbuild.build({
    ...opts,
    entryPoints: ["client/view_entry.js"],
    outfile: "public/view.bundle.js"
  });

  console.log("Client bundles built.");
}

await buildClient();

// ---- DB (SQLite) ----
const db = new Database("ghostnote.db");
db.exec(`
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  decoy TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER,
  views_left INTEGER NOT NULL,
  ip_lock INTEGER NOT NULL,
  first_ip_hash TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_notes_expires_at ON notes(expires_at);
`);

function nowSec() { return Math.floor(Date.now() / 1000); }

function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  const s = Array.isArray(xf) ? xf[0] : (xf || "");
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
        frameAncestors: ["'none'"]
      }
    }
  })
);

// serve argon2-browser bundle from node_modules (no external CDN)
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

app.get("/healthz", (req, res) => res.json({ ok: true }));

// ---- API ----
const MAX_PAYLOAD_BYTES = 350_000;
const MAX_DECOY_CHARS = 5_000;
const MAX_TTL_SECONDS = 30 * 24 * 3600;
const MAX_VIEWS = 100;

app.post("/api/notes", (req, res) => {
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
    if (typeof decoy !== "string") return res.status(400).json({ error: "decoy must be string" });
    if (decoy.length > MAX_DECOY_CHARS) return res.status(400).json({ error: "decoy too long" });
    decoyVal = decoy;
  }

  const id = nanoid(40).replace(/[-_]/g, "").slice(0, 32);
  const created = nowSec();
  const expires = created + ttl;

  db.prepare(`
    INSERT INTO notes (id, payload, decoy, created_at, expires_at, views_left, ip_lock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, payload, decoyVal, created, expires, views, lock ? 1 : 0);

  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.json({ id });
});

const fetchTx = db.transaction((id, clientIpHash, tnow) => {
  const note = db.prepare(`SELECT * FROM notes WHERE id = ?`).get(id);
  if (!note || note.deleted) return null;

  if (note.expires_at != null && note.expires_at <= tnow) {
    db.prepare(`UPDATE notes SET deleted=1, deleted_at=? WHERE id=?`).run(tnow, id);
    return null;
  }
  if (note.views_left <= 0) {
    db.prepare(`UPDATE notes SET deleted=1, deleted_at=? WHERE id=?`).run(tnow, id);
    return null;
  }

  if (note.ip_lock) {
    if (!note.first_ip_hash) {
      db.prepare(`UPDATE notes SET first_ip_hash=? WHERE id=?`).run(clientIpHash, id);
    } else {
      if (!safeEq(note.first_ip_hash, clientIpHash)) return null;
    }
  }

  // burn-on-view on fetch
  const nextViews = note.views_left - 1;
  if (nextViews <= 0) {
    db.prepare(`UPDATE notes SET views_left=0, deleted=1, deleted_at=? WHERE id=?`).run(tnow, id);
  } else {
    db.prepare(`UPDATE notes SET views_left=? WHERE id=?`).run(nextViews, id);
  }

  return { payload: note.payload, decoy: note.decoy };
});

app.get("/api/notes/:id", (req, res) => {
  const id = String(req.params.id || "");
  if (id.length !== 32) return res.sendStatus(404);

  const ipHash = ipHmacHex(getClientIp(req));
  const data = fetchTx(id, ipHash, nowSec());
  if (!data) return res.sendStatus(404);

  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.json(data);
});

app.listen(PORT, () => console.log(`GhostNote running on port ${PORT}`));
