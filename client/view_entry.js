// client/view_entry.js
// GhostNote viewer
// Supports:
//   - /n/<id>#k=...
//   - /note.html?id=<id>#k=...
//
// Requires client/crypto.js exports:
//   - parseFragmentKey()
//   - deriveMasterKey(linkKey, passphrase, kdf)
//   - decryptXChaCha(payloadObj, masterKey)

import { parseFragmentKey, deriveMasterKey, decryptXChaCha } from "./crypto.js";

const statusEl = document.getElementById("status");

const passWrap = document.getElementById("passWrap");
const passEl = document.getElementById("pass");

const decoyWrap = document.getElementById("decoyWrap");
const decoyText = document.getElementById("decoyText");

const revealBtn = document.getElementById("revealBtn");

const secretWrap = document.getElementById("secretWrap");
const secretText = document.getElementById("secretText");

const frost = document.getElementById("frost");

// top-right badge label (optional)
const badgeLabel = document.querySelector(".badge span:last-child");

function status(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function show(el) {
  if (el) el.hidden = false;
}
function hide(el) {
  if (el) el.hidden = true;
}

function noteIdFromUrl() {
  const u = new URL(location.href);

  // Match /n/<id> anywhere in the path (not only at the end)
  const m = u.pathname.match(/\/n\/([^\/?#]+)/);
  if (m && m[1]) return m[1];

  // Fallback: /note.html?id=<id>
  const qs = u.searchParams;
  return (
    qs.get("id") ||
    qs.get("note") ||
    qs.get("nid") ||
    null
  );
}

function renderBadLink(reason) {
  // Keep page but make it obvious it's invalid
  if (badgeLabel) badgeLabel.textContent = "Invalid link";

  hide(decoyWrap);
  hide(passWrap);
  hide(revealBtn);
  hide(secretWrap);
  frost?.classList.remove("isMelted");

  const msg =
    `Invalid GhostNote link.\n\n` +
    `${reason}\n\n` +
    `Open a real note link like:\n` +
    `/n/<id>#k=...\n\n` +
    `Tip: the #k= part is required to decrypt.`;

  status(msg);

  // Add a "Go to Composer" button once
  const card = document.getElementById("recipientCard") || document.body;
  if (!document.getElementById("goHomeBtn")) {
    const a = document.createElement("a");
    a.id = "goHomeBtn";
    a.href = "/";
    a.className = "btn btn--ghost";
    a.style.display = "inline-flex";
    a.style.marginTop = "12px";
    a.textContent = "Go to Composer";
    card.appendChild(a);
  }
}

async function fetchNote(id) {
  const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, { method: "GET" });
  if (!res.ok) return null;
  return res.json();
}

let payloadObj = null;
let linkKey = null;
let noteId = null;

async function reveal() {
  try {
    if (!payloadObj || !linkKey) {
      status("missing payload/key.");
      return;
    }

    const kdf = payloadObj.kdf || null;
    const needsPass = !!(kdf && kdf.name === "argon2id");
    const passphrase = needsPass ? (passEl?.value || "").trim() : "";

    if (needsPass && !passphrase) {
      status("passphrase required.");
      passEl?.focus();
      return;
    }

    frost?.classList.add("isMelted");

    status("decrypting locally...");
    const masterKey = await deriveMasterKey(linkKey, passphrase, kdf);
    const pt = decryptXChaCha(payloadObj, masterKey);

    show(secretWrap);
    if (secretText) secretText.textContent = pt;

    hide(decoyWrap);
    hide(passWrap);
    hide(revealBtn);

    status("done.");
  } catch {
    status("decrypt failed (wrong key/passphrase or tampered ciphertext).");
  }
}

async function main() {
  noteId = noteIdFromUrl();

  if (!noteId) {
    renderBadLink("No note id found in the URL path or query string.");
    return;
  }

  linkKey = parseFragmentKey();
  if (!linkKey) {
    renderBadLink("Missing #k=... fragment key.");
    return;
  }

  status("fetching note (burn-on-view happens now)...");
  const data = await fetchNote(noteId);

  if (!data) {
    status("note not found / expired / burned / IP-locked.");
    hide(revealBtn);
    hide(passWrap);
    hide(decoyWrap);
    hide(secretWrap);
    return;
  }

  // Decoy (plaintext)
  if (data.decoy) {
    show(decoyWrap);
    if (decoyText) decoyText.textContent = data.decoy;
  } else {
    hide(decoyWrap);
  }

  // Cipher payload
  try {
    payloadObj = JSON.parse(data.payload);
  } catch {
    status("corrupt payload.");
    hide(revealBtn);
    return;
  }

  const kdf = payloadObj.kdf || null;
  const needsPass = !!(kdf && kdf.name === "argon2id");

  if (needsPass) {
    show(passWrap);
    passEl?.focus();
  } else {
    hide(passWrap);
  }

  show(revealBtn);
  status("ready. click UNLOCK to decrypt locally.");

  revealBtn?.addEventListener("click", reveal);
  passEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") reveal();
  });
}

main().catch(() => {
  renderBadLink("Viewer crashed.");
});