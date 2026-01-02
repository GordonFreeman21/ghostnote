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
