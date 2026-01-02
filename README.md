GhostNote (Node.js)
- Zero-knowledge: server stores only ciphertext JSON, keys stay client-side in URL fragment (#k=...)
- Client crypto: libsodium-wrappers-sumo -> XChaCha20-Poly1305 + Argon2id (crypto_pwhash)

Run (Replit/Local):
1) Set env var SERVER_SECRET (Replit Secrets recommended)
2) npm install
3) npm start

Open:
- http://localhost:3000/
