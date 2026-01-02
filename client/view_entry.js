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
