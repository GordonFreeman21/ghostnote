function b64u(bytes) {
  const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function unb64u(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}
function randomLinkKey() {
  return crypto.getRandomValues(new Uint8Array(32));
}
function parseFragmentKey() {
  const h = (location.hash || "").replace(/^#/, "");
  const params = new URLSearchParams(h);
  const k = params.get("k");
  if (!k) return null;
  return unb64u(k);
}

async function sodiumReady() {
  if (!window.sodium) throw new Error("libsodium not loaded (check /vendor route)");
  // libsodium-wrappers exposes a Promise
  await window.sodium.ready;
  return window.sodium;
}

// Argon2id + XChaCha20-Poly1305 are provided by libsodium (sumo build).
async function makeKdfIfPassphrase(passphrase) {
  const sodium = await sodiumReady();
  if (!passphrase) return null;

  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    name: "argon2id",
    salt: b64u(salt),
    // interactive defaults; tune later if you want it slower
    params: {
      opslimit: sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      memlimit: sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
    }
  };
}

async function buildMasterKeyRaw(linkKeyRaw, passphrase, kdf) {
  const sodium = await sodiumReady();
  if (!passphrase) return linkKeyRaw;

  const salt = unb64u(kdf.salt);
  const opslimit = Number(kdf.params.opslimit);
  const memlimit = Number(kdf.params.memlimit);

  const pwKey = sodium.crypto_pwhash(
    32,
    passphrase,
    salt,
    opslimit,
    memlimit,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );

  // Combine link key + pwKey using BLAKE2b (generichash), domain-separated.
  const labelKey = sodium.from_string("ghostnote:v1:master-key");
  const msg = concatBytes(concatBytes(salt, linkKeyRaw), pwKey);
  return sodium.crypto_generichash(32, msg, labelKey);
}

async function encryptNote(plaintext, masterKeyRaw) {
  const sodium = await sodiumReady();

  const nonce = crypto.getRandomValues(
    new Uint8Array(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES) // 24
  );
  const aad = sodium.from_string("GN1");
  const msg = sodium.from_string(plaintext);

  const ct = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    msg,
    aad,
    null,
    nonce,
    masterKeyRaw
  );

  return {
    v: 1,
    alg: "XChaCha20-Poly1305",
    nonce: b64u(nonce),
    ct: b64u(ct)
  };
}

async function decryptNote(payloadObj, masterKeyRaw) {
  const sodium = await sodiumReady();

  if (payloadObj.alg !== "XChaCha20-Poly1305") throw new Error("unsupported alg");
  const nonce = unb64u(payloadObj.nonce);
  const ct = unb64u(payloadObj.ct);
  const aad = sodium.from_string("GN1");

  const pt = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ct,
    aad,
    nonce,
    masterKeyRaw
  );

  return sodium.to_string(pt);
}

// expose to other scripts
window.GN = {
  b64u, unb64u,
  randomLinkKey, parseFragmentKey,
  makeKdfIfPassphrase, buildMasterKeyRaw,
  encryptNote, decryptNote
};
