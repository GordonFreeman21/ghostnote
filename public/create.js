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
    if (!plaintext) return log("error: message is empty");

    const ttlSeconds = Number(ttlEl.value);
    const burnViews = Number(viewsEl.value);
    const ipLock = !!ipLockEl.checked;
    const decoy = (decoyEl.value || "").trim() || null;

    const passphrase = (passEl.value || "").trim();

    const linkKey = GN.randomLinkKey();
    const kdf = await GN.makeKdfIfPassphrase(passphrase);

    log("encrypting client-side (XChaCha20-Poly1305)...");
    const masterKey = await GN.buildMasterKeyRaw(linkKey, passphrase, kdf || {});
    const payloadObj = await GN.encryptNote(plaintext, masterKey);
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

    const url = `${location.origin}/n/${id}#k=${encodeURIComponent(GN.b64u(linkKey))}`;
    out.hidden = false;
    linkEl.value = url;

    log(passphrase
      ? "created. share link + passphrase separately (both required)."
      : "created. share the link (anyone with full link can decrypt)."
    );
  } catch (e) {
    log(String(e?.message || e));
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(linkEl.value);
  log("copied.");
});
