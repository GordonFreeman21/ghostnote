#!/usr/bin/env bash
set -euo pipefail

mkdir -p public client

cat > package.json <<'EOF'
{
  "name": "ghostnote",
  "private": true,
  "type": "module",
  "engines": { "node": ">=18" },
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@stablelib/xchacha20poly1305": "1.0.1",
    "better-sqlite3": "11.5.0",
    "esbuild": "0.24.2",
    "express": "4.19.2",
    "helmet": "7.1.0",
    "nanoid": "5.0.9",
    "argon2-browser": "1.18.0"
  }
}
EOF

cat > .gitignore <<'EOF'
node_modules/
ghostnote.db
*.log
.env
EOF

cat > .env.example <<'EOF'
SERVER_SECRET=put-a-long-random-string-here
PORT=3000
EOF

cat > index.js <<'EOF'
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
EOF

cat > public/index.html <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>GhostNote</title>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body>
    <main class="wrap">
      <header class="top">
        <div class="brand">
          <span class="led"></span>
          <div>
            <div class="name">GhostNote</div>
            <div class="tag">zero-knowledge message vault</div>
          </div>
        </div>
        <div class="by">built by K7 Digital</div>
      </header>

      <section class="card">
        <div class="row2">
          <div>
            <div class="label">SECRET</div>
            <textarea id="msg" spellcheck="false" placeholder="type your secret..."></textarea>
          </div>
          <div>
            <div class="label">DECOY (optional, stored plaintext)</div>
            <textarea id="decoy" spellcheck="false" placeholder="decoy shown first..."></textarea>
          </div>
        </div>

        <div class="grid">
          <label class="field">
            <span>TTL</span>
            <select id="ttl">
              <option value="3600">1 hour</option>
              <option value="86400" selected>24 hours</option>
              <option value="604800">7 days</option>
            </select>
          </label>

          <label class="field">
            <span>Burn views</span>
            <input id="views" type="number" min="1" max="100" value="1" />
          </label>

          <label class="field chk">
            <input id="ipLock" type="checkbox" />
            <span>IP lock (advanced)</span>
          </label>

          <label class="field">
            <span>Passphrase (optional)</span>
            <input id="pass" type="password" autocomplete="off" placeholder="if set, required to decrypt" />
          </label>
        </div>

        <button id="createBtn" class="btn">CREATE ENCRYPTED NOTE</button>

        <div id="out" class="out" hidden>
          <div class="label">SHARE LINK (contains key after #)</div>
          <div class="outRow">
            <input id="link" readonly />
            <button id="copyBtn" class="btn2">COPY</button>
          </div>
          <div class="warn">
            Anyone with the full link can decrypt. If you set a passphrase, share it separately.
          </div>
        </div>

        <pre id="log" class="log"></pre>
      </section>
    </main>

    <script src="/vendor/argon2-bundled.min.js"></script>
    <script src="/create.bundle.js"></script>
  </body>
</html>
EOF

cat > public/note.html <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>GhostNote / view</title>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body>
    <main class="wrap">
      <header class="top">
        <div class="brand">
          <span class="led blue"></span>
          <div>
            <div class="name">GhostNote</div>
            <div class="tag">viewer</div>
          </div>
        </div>
        <div class="by">built by K7 Digital</div>
      </header>

      <section class="card">
        <pre id="status" class="log"></pre>

        <div id="decoyWrap" hidden>
          <div class="label">DECOY</div>
          <pre id="decoyText" class="panel"></pre>
        </div>

        <div id="passWrap" hidden>
          <div class="label">PASSPHRASE REQUIRED</div>
          <input id="pass" type="password" autocomplete="off" placeholder="enter passphrase" />
        </div>

        <button id="revealBtn" class="btn" hidden>REVEAL SECRET</button>

        <div id="secretWrap" hidden>
          <div class="label">SECRET</div>
          <pre id="secretText" class="panel"></pre>
        </div>
      </section>
    </main>

    <script src="/vendor/argon2-bundled.min.js"></script>
    <script src="/view.bundle.js"></script>
  </body>
</html>
EOF

cat > public/app.css <<'EOF'
:root{
  --bg:#050607;
  --card:#07090c;
  --fg:#e7e7e7;
  --muted:#9aa0a6;
  --line:#1b2026;
  --accent:#8cff9a;
  --blue:#66d9ff;
  --shadow: rgba(0,0,0,.55);
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0;
  color:var(--fg);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  background:
    radial-gradient(1200px 600px at 20% -10%, rgba(102,217,255,.10), transparent 55%),
    radial-gradient(900px 500px at 110% 20%, rgba(140,255,154,.10), transparent 60%),
    linear-gradient(180deg, #040506, #050607 40%, #040506);
}

.wrap{ max-width: 1050px; margin: 0 auto; padding: 18px; }

.top{
  display:flex; justify-content:space-between; align-items:center; gap:12px;
  padding: 14px 16px;
  border:1px solid var(--line);
  background: linear-gradient(180deg, #07090c, #050607);
  box-shadow: 0 12px 28px var(--shadow);
}

.brand{ display:flex; align-items:center; gap:12px; }
.led{
  width:10px; height:10px; border-radius:999px;
  background: var(--accent);
  box-shadow: 0 0 18px rgba(140,255,154,.35);
}
.led.blue{ background: var(--blue); box-shadow: 0 0 18px rgba(102,217,255,.35); }
.name{ font-weight:800; letter-spacing:.6px; }
.tag{ color:var(--muted); font-size:12px; margin-top:2px; }
.by{ color:var(--muted); font-size:12px; }

.card{
  margin-top: 14px;
  border: 1px solid var(--line);
  background: rgba(7,9,12,.78);
  backdrop-filter: blur(6px);
  padding: 16px;
  box-shadow: 0 12px 28px var(--shadow);
}

.label{ color: var(--muted); font-size: 12px; margin: 12px 0 6px; letter-spacing: .4px; }

textarea, input, select{
  width:100%;
  background: rgba(5,6,7,.92);
  border: 1px solid var(--line);
  color: var(--fg);
  padding: 11px 12px;
  outline: none;
  border-radius: 10px;
}
textarea{ min-height: 180px; resize: vertical; }

textarea:focus, input:focus, select:focus{
  border-color: rgba(140,255,154,.65);
  box-shadow: 0 0 0 3px rgba(140,255,154,.10);
}

.row2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.field{ display:flex; flex-direction:column; gap:6px; }
.field > span{ color: var(--muted); font-size: 12px; }
.field.chk{ flex-direction:row; align-items:center; gap:10px; padding-top: 18px; }
.field.chk input{ width:auto; }

.btn{
  margin-top: 14px;
  width: 100%;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(140,255,154,.35);
  background: linear-gradient(180deg, rgba(140,255,154,.12), rgba(140,255,154,.05));
  color: var(--accent);
  cursor: pointer;
  letter-spacing: .5px;
  font-weight: 800;
}
.btn:hover{
  border-color: rgba(140,255,154,.85);
  box-shadow: 0 0 0 3px rgba(140,255,154,.10);
}

.btn2{
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(102,217,255,.35);
  background: linear-gradient(180deg, rgba(102,217,255,.12), rgba(102,217,255,.05));
  color: var(--blue);
  cursor: pointer;
  font-weight: 800;
}

.out{ margin-top: 12px; }
.outRow{ display:grid; grid-template-columns: 1fr auto; gap: 10px; align-items:center; }

.warn{
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
  border-left: 3px solid rgba(102,217,255,.35);
  padding-left: 10px;
}

.log{
  margin-top: 10px;
  color: var(--muted);
  white-space: pre-wrap;
  border-left: 3px solid rgba(102,217,255,.35);
  padding-left: 10px;
}

.panel{
  border:1px solid var(--line);
  padding: 12px;
  background: rgba(5,6,7,.92);
  white-space: pre-wrap;
  border-radius: 12px;
}

@media (max-width: 860px){
  .row2{ grid-template-columns: 1fr; }
  .grid{ grid-template-columns: 1fr; }
  .outRow{ grid-template-columns: 1fr; }
}
EOF

cat > client/crypto.js <<'EOF'
import { XChaCha20Poly1305 } from "@stablelib/xchacha20poly1305";

const te = new TextEncoder();
const td = new TextDecoder();

export function b64u(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
export function unb64u(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

export function parseFragmentKey() {
  const h = (location.hash || "").replace(/^#/, "");
  const params = new URLSearchParams(h);
  const k = params.get("k");
  if (!k) return null;
  return unb64u(k);
}

async function hkdfSha256(ikmRaw, salt, infoStr, outLen) {
  const key = await crypto.subtle.importKey("raw", ikmRaw, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: te.encode(infoStr) },
    key,
    outLen * 8
  );
  return new Uint8Array(bits);
}

function requireArgon2() {
  const a = globalThis.argon2;
  if (!a || !a.hash) throw new Error("argon2 not loaded");
  return a;
}

export function makeKdf(passphrase) {
  if (!passphrase) return null;
  return {
    name: "argon2id",
    salt: b64u(randomBytes(16)),
    // mem is KiB in argon2-browser
    params: { m: 65536, t: 3, p: 1 }
  };
}

async function argon2idKey(passphrase, saltBytes, params) {
  const argon2 = requireArgon2();
  const res = await argon2.hash({
    pass: passphrase,
    salt: saltBytes,
    type: argon2.ArgonType.Argon2id,
    mem: params.m,
    time: params.t,
    parallelism: params.p,
    hashLen: 32
  });
  return new Uint8Array(res.hash);
}

export async function deriveMasterKey(linkKey, passphrase, kdf) {
  if (!passphrase) return linkKey;

  const salt = unb64u(kdf.salt);
  const pwKey = await argon2idKey(passphrase, salt, kdf.params);

  // HKDF over linkKey || pwKey
  const ikm = new Uint8Array(linkKey.length + pwKey.length);
  ikm.set(linkKey, 0);
  ikm.set(pwKey, linkKey.length);

  return hkdfSha256(ikm, salt, "ghostnote:v1:master", 32);
}

export function encryptXChaCha(plaintext, masterKey) {
  if (!(masterKey instanceof Uint8Array) || masterKey.length !== 32) {
    throw new Error("masterKey must be 32 bytes");
  }
  const aead = new XChaCha20Poly1305(masterKey);
  const nonce = randomBytes(24);
  const aad = te.encode("GN1");
  const pt = te.encode(plaintext);
  const ct = aead.seal(nonce, pt, aad); // includes tag
  return { v: 1, alg: "XChaCha20-Poly1305", nonce: b64u(nonce), ct: b64u(ct) };
}

export function decryptXChaCha(payloadObj, masterKey) {
  const aead = new XChaCha20Poly1305(masterKey);
  const nonce = unb64u(payloadObj.nonce);
  const ct = unb64u(payloadObj.ct);
  const aad = te.encode("GN1");
  const pt = aead.open(nonce, ct, aad);
  if (!pt) throw new Error("decrypt failed");
  return td.decode(pt);
}
EOF

cat > client/create_entry.js <<'EOF'
import { b64u, randomBytes, makeKdf, deriveMasterKey, encryptXChaCha } from "./crypto.js";

const msgEl = document.getElementById("msg");
const ttlEl = document.getElementById("ttl");
const viewsEl = document.getElementById("views");
const ipLockEl = document.getElementById("ipLock");
const decoyEl = document.getElementById("decoy");
const passEl = document.getElementById("pass");
const createBtn = document.getElementById("createBtn");
const out = document.getElementById("out");
const linkEl = document.getElementById("link");
const copyBtn = document.getElementById("copyBtn");
const logEl = document.getElementById("log");

function log(s) { logEl.textContent = s; }

createBtn.addEventListener("click", async () => {
  try {
    const plaintext = (msgEl.value || "").trim();
    if (!plaintext) return log("error: message empty");

    const ttlSeconds = Number(ttlEl.value);
    const burnViews = Number(viewsEl.value);
    const ipLock = !!ipLockEl.checked;
    const decoy = (decoyEl.value || "").trim() || null;
    const passphrase = (passEl.value || "").trim();

    const linkKey = randomBytes(32); // goes into #k=
    const kdf = makeKdf(passphrase);

    log("deriving key + encrypting locally (XChaCha20-Poly1305)...");
    const masterKey = await deriveMasterKey(linkKey, passphrase, kdf || {});
    const payloadObj = encryptXChaCha(plaintext, masterKey);
    if (kdf) payloadObj.kdf = kdf;

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: JSON.stringify(payloadObj),
        ttlSeconds,
        burnViews,
        ipLock,
        decoy
      })
    });

    if (!res.ok) throw new Error(await res.text());
    const { id } = await res.json();

    const url = `${location.origin}/n/${id}#k=${encodeURIComponent(b64u(linkKey))}`;
    out.hidden = false;
    linkEl.value = url;

    log(passphrase
      ? "created. share link + passphrase separately (both required)."
      : "created. share the link (anyone with the full link can decrypt)."
    );
  } catch (e) {
    log(String(e?.message || e));
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(linkEl.value);
  log("copied.");
});
EOF

cat > client/view_entry.js <<'EOF'
import { parseFragmentKey, deriveMasterKey, decryptXChaCha } from "./crypto.js";

const statusEl = document.getElementById("status");
const passWrap = document.getElementById("passWrap");
const passEl = document.getElementById("pass");
const decoyWrap = document.getElementById("decoyWrap");
const decoyText = document.getElementById("decoyText");
const revealBtn = document.getElementById("revealBtn");
const secretWrap = document.getElementById("secretWrap");
const secretText = document.getElementById("secretText");

function status(s) { statusEl.textContent = s; }

function noteIdFromPath() {
  const m = location.pathname.match(/^\/n\/([^/]+)$/);
  return m ? m[1] : null;
}

async function fetchNote(id) {
  const res = await fetch(`/api/notes/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json();
}

let payloadObj = null;
let linkKey = null;

async function reveal() {
  try {
    const kdf = payloadObj.kdf || null;
    const needsPass = !!(kdf && kdf.name === "argon2id");
    const passphrase = needsPass ? (passEl.value || "").trim() : "";

    if (needsPass && !passphrase) return status("passphrase required.");

    status("deriving key + decrypting locally...");
    const masterKey = await deriveMasterKey(linkKey, passphrase, kdf);
    const pt = decryptXChaCha(payloadObj, masterKey);

    secretWrap.hidden = false;
    secretText.textContent = pt;
    passWrap.hidden = true;
    decoyWrap.hidden = true;
    revealBtn.hidden = true;
    status("done.");
  } catch {
    status("decrypt failed (wrong key/passphrase or tampered ciphertext).");
  }
}

(async function main() {
  const id = noteIdFromPath();
  if (!id) return status("bad URL");

  linkKey = parseFragmentKey();
  if (!linkKey) return status("missing #k=... fragment key.");

  status("fetching note (burn-on-view happens now)...");
  const data = await fetchNote(id);
  if (!data) return status("note not found / expired / burned / IP-locked.");

  try { payloadObj = JSON.parse(data.payload); }
  catch { return status("corrupt payload"); }

  if (data.decoy) {
    decoyWrap.hidden = false;
    decoyText.textContent = data.decoy;
  }

  const kdf = payloadObj.kdf || null;
  if (kdf && kdf.name === "argon2id") passWrap.hidden = false;

  revealBtn.hidden = false;
  revealBtn.addEventListener("click", reveal);
  status("ready. click REVEAL SECRET.");
})();
EOF

echo "GhostNote scaffold created."
echo "Next:"
echo "  1) Set SERVER_SECRET in Replit Secrets"
echo "  2) npm install"
echo "  3) npm start"