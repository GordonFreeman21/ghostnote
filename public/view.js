// public/view.js
// GhostNote viewer (no-bundle version).
// Supports URLs:
//   1) /n/<id>#k=...
//   2) /note.html?id=<id>#k=...
//
// Expects crypto helpers on window.GN (from /crypto.js).
// Works with the Digital Vapour note.html IDs:
//   status, decoyWrap/decoyText, passWrap/pass, revealBtn, secretWrap/secretText, frost

(() => {
  const $ = (id) => document.getElementById(id);

  const statusEl = $("status");
  const decoyWrap = $("decoyWrap");
  const decoyText = $("decoyText");
  const passWrap = $("passWrap");
  const passEl = $("pass");
  const revealBtn = $("revealBtn");
  const secretWrap = $("secretWrap");
  const secretText = $("secretText");
  const frost = $("frost");

  // Optional badge text (if present)
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

    // Preferred: /n/<id> (match anywhere in path)
    const m = u.pathname.match(/\/n\/([^\/?#]+)/);
    if (m && m[1]) return m[1];

    // Fallback: /note.html?id=<id>
    const qs = u.searchParams;
    return qs.get("id") || qs.get("note") || qs.get("nid") || null;
  }

  function renderBadLink(reason) {
    if (badgeLabel) badgeLabel.textContent = "Invalid link";

    hide(decoyWrap);
    hide(passWrap);
    hide(revealBtn);
    hide(secretWrap);
    frost?.classList.remove("isMelted");

    status(
      "Invalid GhostNote link.\n\n" +
        reason +
        "\n\n" +
        "Use a real note link like:\n" +
        "/n/<id>#k=...\n\n" +
        "Tip: the #k= fragment is required to decrypt.",
    );
  }

  async function fetchNote(id) {
    const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
      method: "GET",
    });
    if (!res.ok) return null;
    return res.json();
  }

  function getCrypto() {
    const GN = window.GN;
    if (!GN) return null;

    // parseFragmentKey
    const parseKey = GN.parseFragmentKey || GN.parseFragment;

    // master key derivation
    const deriveKey =
      GN.buildMasterKeyRaw || GN.deriveMasterKey || GN.buildMasterKey;

    // decrypt
    const decrypt = GN.decryptNote || GN.decryptXChaCha || GN.decryptPayload;

    if (!parseKey || !deriveKey || !decrypt) return null;

    return { GN, parseKey, deriveKey, decrypt };
  }

  let payloadObj = null;
  let linkKey = null;

  async function reveal(cryptoApi) {
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

      // Melt frost overlay (UI)
      frost?.classList.add("isMelted");

      status("decrypting locally...");

      // Some implementations want (linkKey, passphrase, kdf) and tolerate kdf=null.
      const masterKey = await cryptoApi.deriveKey(
        linkKey,
        passphrase,
        kdf || {},
      );

      const pt = await cryptoApi.decrypt(payloadObj, masterKey);

      show(secretWrap);
      if (secretText) secretText.textContent = String(pt);

      hide(decoyWrap);
      hide(passWrap);
      hide(revealBtn);

      status("done.");
    } catch {
      status("decrypt failed (wrong key/passphrase or tampered ciphertext).");
    }
  }

  async function main() {
    const cryptoApi = getCrypto();
    if (!cryptoApi) {
      renderBadLink(
        "Crypto engine not loaded (missing window.GN from /crypto.js).",
      );
      return;
    }

    const id = noteIdFromUrl();
    if (!id) {
      renderBadLink("No note id found in the URL.");
      return;
    }

    linkKey = cryptoApi.parseKey();
    if (!linkKey) {
      renderBadLink("Missing #k=... fragment key.");
      return;
    }

    if (badgeLabel) badgeLabel.textContent = "Recipient View";

    status("fetching note (burn-on-view happens now)...");
    const data = await fetchNote(id);

    if (!data) {
      status("note not found / expired / burned / IP-locked.");
      hide(decoyWrap);
      hide(passWrap);
      hide(revealBtn);
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

    // Cipher payload JSON
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

    revealBtn?.addEventListener("click", () => reveal(cryptoApi));
    passEl?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") reveal(cryptoApi);
    });
  }

  main().catch(() => renderBadLink("Viewer crashed."));
})();
