#!/usr/bin/env bash
set -euo pipefail

# Creates/overwrites README.md in the current directory.

cat > README.md <<'EOF'
# GhostNote (Node.js) — Neon + Render ready

GhostNote is a zero‑knowledge message vault for anonymous-style sharing: the server stores only encrypted payloads. Decryption happens in the browser.

Built by K7 Digital.

## Security model (what this does / doesn’t do)

### What it does
- **Zero‑knowledge storage:** server stores ciphertext + minimal metadata.
- **Client-side encryption:** encryption/decryption occurs in the browser.
- **Link key in URL fragment:** the key is stored after `#k=...` so it is not sent to the server in HTTP requests (URL fragments are client-side).
- **Authenticated encryption:** uses XChaCha20‑Poly1305 (AEAD) so tampering is detected.
- **Optional passphrase:** if set, decryption requires both the link key and passphrase (derived via Argon2id).

### What it doesn’t do
- It cannot protect you if the **device/browser is compromised** (malware, malicious extensions).
- If an attacker gets the **full link** (including the `#k=` fragment), they can decrypt (unless you also set a passphrase).
- “Burn-on-view” is best-effort: users can screenshot/copy; prefetching can consume a view.

## Features
- XChaCha20‑Poly1305 encryption in the browser
- Optional Argon2id passphrase
- Decoy text (plaintext)
- Burn-on-view (N views)
- IP lock (opt-in)
- TTL expiration (1h / 24h / 7d)

## Tech stack
- Node.js + Express
- Neon Postgres (`pg`)
- Client bundles built with `esbuild`

## Environment variables
Set these in Replit Secrets and/or Render:

- `SERVER_SECRET` — long random string used to HMAC-hash IP addresses for IP lock (server never stores raw IP)
- `DATABASE_URL` — Neon Postgres connection string (use `sslmode=require`)
- `PORT` — optional (Render sets this automatically)

Example:

```bash
SERVER_SECRET="a-very-long-random-string"
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
PORT=3000