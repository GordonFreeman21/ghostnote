(() => {
  const $ = (id) => document.getElementById(id);

  // Splash
  const splash = $("splash");
  const username = $("username");
  const helloUser = $("helloUser");
  const splashContinue = $("splashContinue");
  const splashSkip = $("splashSkip");

  const USER_KEY = "gn_username_v1";
  const SEEN_KEY = "gn_splash_seen_v1";

  function setHello() {
    const u = (localStorage.getItem(USER_KEY) || "").trim();
    if (helloUser) {
      helloUser.hidden = !u;
      helloUser.textContent = u ? `Hi, ${u}` : "";
    }
  }

  function openSplash() {
    if (!splash) return;
    splash.classList.add("isOpen");
    splash.setAttribute("aria-hidden", "false");
    if (username) username.value = localStorage.getItem(USER_KEY) || "";
    setTimeout(() => username?.focus(), 50);
  }

  function closeSplash() {
    if (!splash) return;
    splash.classList.remove("isOpen");
    splash.setAttribute("aria-hidden", "true");
  }

  function commitUser() {
    const v = (username?.value || "")
      .trim()
      .replace(/[^\w.\- ]+/g, "")
      .slice(0, 24);
    if (v) localStorage.setItem(USER_KEY, v);
    else localStorage.removeItem(USER_KEY);
    localStorage.setItem(SEEN_KEY, "1");
    setHello();
    closeSplash();
  }

  splashContinue?.addEventListener("click", commitUser);
  splashSkip?.addEventListener("click", () => {
    localStorage.setItem(SEEN_KEY, "1");
    setHello();
    closeSplash();
  });
  username?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commitUser();
    if (e.key === "Escape") splashSkip?.click();
  });

  if (localStorage.getItem(SEEN_KEY) !== "1") openSplash();
  setHello();

  // Info drawer
  const info = $("info");
  const infoOpen = $("infoOpen");
  const infoClose = $("infoClose");

  function openInfo() {
    if (!info) return;
    info.classList.add("isOpen");
    info.setAttribute("aria-hidden", "false");
  }
  function closeInfo() {
    if (!info) return;
    info.classList.remove("isOpen");
    info.setAttribute("aria-hidden", "true");
  }

  infoOpen?.addEventListener("click", openInfo);
  infoClose?.addEventListener("click", closeInfo);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeInfo();
  });

  // Composer UI helpers (won't break if elements missing)
  const msg = $("msg");
  const noiseOverlay = $("noiseOverlay");
  const vaultBox = $("vaultBox");
  const cipherOverlay = $("cipherOverlay");

  function setNoise() {
    if (!msg || !noiseOverlay) return;
    const len = (msg.value || "").length;
    const op = Math.max(0, Math.min(0.32, (len / 900) * 0.32));
    noiseOverlay.style.setProperty("--noise", String(op));
  }
  msg?.addEventListener("input", setNoise);
  setNoise();

  // Burn-on-read -> set views=1
  const burnOnRead = $("burnOnRead");
  const views = $("views");
  const burnWarn = $("burnWarn");

  function syncBurn() {
    if (!burnOnRead || !views) return;
    if (burnOnRead.checked) {
      views.value = "1";
      if (burnWarn) burnWarn.hidden = false;
    } else {
      views.value = "100";
      if (burnWarn) burnWarn.hidden = true;
    }
  }
  burnOnRead?.addEventListener("change", syncBurn);
  syncBurn();

  // Passphrase toggle
  const passToggle = $("passToggle");
  const passWrap = $("passWrap");
  const pass = $("pass");
  function syncPass() {
    if (!passToggle || !passWrap) return;
    passWrap.hidden = !passToggle.checked;
    if (!passToggle.checked && pass) pass.value = "";
  }
  passToggle?.addEventListener("change", syncPass);
  syncPass();

  // Small "matrix shuffle" while create runs (visual only)
  const createBtn = $("createBtn");
  const out = $("out");

  const RAND =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=~<>?/\\|{}[]()_-:;.,";
  const randChar = () => RAND[(Math.random() * RAND.length) | 0];

  function startShuffle() {
    if (!vaultBox || !cipherOverlay || !msg) return;
    const plain = msg.value || "";
    if (!plain.trim()) return;

    vaultBox.classList.add("isProcessing");
    cipherOverlay.setAttribute("aria-hidden", "false");

    const base = plain.slice(0, Math.min(900, plain.length));
    const maxFrames = 12;
    let frame = 0;

    const tick = () => {
      frame++;
      const t = frame / maxFrames;
      let outStr = "";
      for (let i = 0; i < base.length; i++) {
        outStr += Math.random() > t ? base[i] : randChar();
      }
      cipherOverlay.textContent = outStr;

      if (frame < maxFrames) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function stopShuffle() {
    if (!vaultBox || !cipherOverlay) return;
    vaultBox.classList.remove("isProcessing");
    cipherOverlay.textContent = "";
    cipherOverlay.setAttribute("aria-hidden", "true");
  }

  createBtn?.addEventListener("click", () => {
    startShuffle();
    setTimeout(stopShuffle, 1200);
  });

  if (out) {
    const mo = new MutationObserver(() => {
      if (!out.hidden) stopShuffle();
    });
    mo.observe(out, { attributes: true, attributeFilter: ["hidden"] });
  }

  // Viewer: melt frost when clicking unlock
  const revealBtn = $("revealBtn");
  const frost = $("frost");
  revealBtn?.addEventListener("click", () => frost?.classList.add("isMelted"));
})();
