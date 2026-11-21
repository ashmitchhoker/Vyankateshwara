/* ═══════════════════════════════════════════════════════════════════════
   Vyankateshwara Café — scroll-driven virtual walkthrough (restaurant.html)

   • Coarse-to-fine loading across the WHOLE walkthrough: every 24th frame
     first (≈36 frames), so every part of the tour is viewable within
     seconds, then refines to full smoothness in the background.
   • Loading screen only waits for that first coarse pass (with a failsafe).
   • Steady download queue (no batch stalls), one retry on failure.
   • Frames are kept in the browser's Cache Storage, so repeat visits are
     near-instant.
   • Displayed frame eases toward the scroll position for smooth motion and
     never goes blank — the nearest loaded frame is shown meanwhile.
   • Phones: more frames than before (every 4th), full-width "cinematic" fit.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // ───────── CONFIGURATION ─────────
  var TOTAL_FRAMES = 840;
  var FRAME_PATH =
    "https://pub-76140f0b462a4fbbae20599ae9583eae.r2.dev/assets/work/cafe_webp/1%20-%20MERGE%20-%20Videobolt.net_";
  var FRAME_EXT = ".webp";
  var CACHE_NAME = "vyankateshwara-frames-v1";

  var isMobile =
    window.matchMedia("(max-width: 767px)").matches ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var conn = navigator.connection || {};
  var lite = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Finest frame step ever loaded (1 = every frame).
  var FINEST_STEP = lite ? 8 : isMobile ? 4 : 2;
  var PASSES = [24, 8, 4, 2, 1].filter(function (s) { return s >= FINEST_STEP; });
  var CONCURRENCY = lite ? 3 : isMobile ? 4 : 6;
  var DPR_CAP = isMobile ? 1.2 : 2;
  var LOADER_FAILSAFE_MS = 8000;

  // ───────── DOM ─────────
  var canvas = document.getElementById("frameCanvas");
  var section = document.getElementById("frameScrollSection");
  if (!canvas || !section) return;
  var ctx = canvas.getContext("2d", { alpha: false });
  var canvasWrap = document.getElementById("frameCanvasWrap");
  var loader = document.getElementById("frameLoader");
  var loaderBar = document.getElementById("loaderBarFill");
  var loaderText = document.getElementById("loaderText");
  var overlayContent = document.getElementById("overlayContent");
  var scrollHint = document.getElementById("scrollHint");
  var progressBar = document.getElementById("frameProgress");

  function framePath(i) {
    return FRAME_PATH + String(i + 1).padStart(6, "0") + FRAME_EXT;
  }

  // ───────── FRAME STORE ─────────
  var frames = new Array(TOTAL_FRAMES);
  var ready = new Uint8Array(TOTAL_FRAMES);
  var requested = new Uint8Array(TOTAL_FRAMES);
  var frameW = 1920, frameH = 1080;

  // ───────── LOAD QUEUE (coarse → fine across the whole tour) ─────────
  var queue = [];
  var queued = new Uint8Array(TOTAL_FRAMES);
  function enqueue(i) {
    if (i < 0 || i >= TOTAL_FRAMES || queued[i]) return;
    queued[i] = 1;
    queue.push(i);
  }
  PASSES.forEach(function (step) {
    for (var i = 0; i < TOTAL_FRAMES; i += step) enqueue(i);
    enqueue(TOTAL_FRAMES - 1);
  });
  var firstPassTotal = Math.ceil(TOTAL_FRAMES / PASSES[0]) + 1;
  var firstPassLoaded = 0;
  var firstPassSet = new Uint8Array(TOTAL_FRAMES);
  for (var k = 0; k < firstPassTotal; k++) firstPassSet[queue[k]] = 1;

  // ───────── CACHE STORAGE (persists frames across visits) ─────────
  var frameCache = null;
  var cacheReady = ("caches" in window)
    ? caches.open(CACHE_NAME).then(function (c) { frameCache = c; }, function () {})
    : Promise.resolve();

  function fetchBlob(url) {
    var lookup = frameCache ? frameCache.match(url).catch(function () { return null; }) : Promise.resolve(null);
    return lookup.then(function (hit) {
      if (hit) return hit.blob();
      return fetch(url, { mode: "cors" }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        if (frameCache) frameCache.put(url, res.clone()).catch(function () {});
        return res.blob();
      });
    });
  }

  function decodeImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.decoding = "async";
      img.src = src;
      if (img.decode) img.decode().then(function () { resolve(img); }, function () { resolve(null); });
      else { img.onload = function () { resolve(img); }; img.onerror = function () { resolve(null); }; }
    });
  }

  function tryLoad(url) {
    return fetchBlob(url)
      .then(function (blob) { return decodeImage(URL.createObjectURL(blob)); })
      .catch(function () { return decodeImage(url); }); // plain <img> fallback (no CORS / no Cache API)
  }

  function loadFrame(i) {
    if (requested[i]) return Promise.resolve(false);
    requested[i] = 1;
    var url = framePath(i);
    return tryLoad(url).then(function (img) {
      if (img) return img;
      // Host briefly refused (e.g. rate limiting): wait, then retry once.
      return new Promise(function (r) { setTimeout(r, 1200); }).then(function () { return decodeImage(url + "?retry=1"); });
    }).then(function (img) {
      if (!img) return false;
      frames[i] = img;
      ready[i] = 1;
      if (frameW === 1920 && img.naturalWidth) { frameW = img.naturalWidth; frameH = img.naturalHeight; }
      if (firstPassSet[i]) { firstPassLoaded++; updateLoader(); }
      requestTick();
      return true;
    });
  }

  var active = 0;
  function pump() {
    while (active < CONCURRENCY && queue.length) {
      var i = queue.shift();
      active++;
      loadFrame(i).then(function () { active--; pump(); });
    }
  }

  // ───────── LOADING SCREEN ─────────
  var introDone = false;
  function updateLoader() {
    var pct = Math.min(100, Math.round((firstPassLoaded / firstPassTotal) * 100));
    if (loaderBar) loaderBar.style.width = pct + "%";
    if (loaderText) loaderText.textContent = "Loading experience... " + pct + "%";
    if (firstPassLoaded >= firstPassTotal) finishIntro();
  }
  function finishIntro() {
    if (introDone) return;
    introDone = true;
    resize();
    setTimeout(function () { if (overlayContent) overlayContent.classList.add("visible"); }, 200);
    setTimeout(function () { if (loader) loader.classList.add("loaded"); }, 400);
    onScroll();
  }

  // ───────── DRAWING ─────────
  function nearestReady(i) {
    if (ready[i]) return i;
    for (var d = 1; d < TOTAL_FRAMES; d++) {
      if (i - d >= 0 && ready[i - d]) return i - d;
      if (i + d < TOTAL_FRAMES && ready[i + d]) return i + d;
    }
    return -1;
  }

  var fit = null;
  function computeFit(cw, ch) {
    var ir = frameW / frameH, cr = cw / ch;
    if (isMobile) {
      // Cinematic fit: full image width, bars top/bottom.
      var dh = cw / ir;
      fit = { sx: 0, sy: 0, sw: frameW, sh: frameH, dx: 0, dy: (ch - dh) / 2, dw: cw, dh: dh };
    } else if (ir > cr) {
      var sw = frameH * cr;
      fit = { sx: (frameW - sw) / 2, sy: 0, sw: sw, sh: frameH, dx: 0, dy: 0, dw: cw, dh: ch };
    } else {
      var sh = frameW / cr;
      fit = { sx: 0, sy: (frameH - sh) / 2, sw: frameW, sh: sh, dx: 0, dy: 0, dw: cw, dh: ch };
    }
  }

  var lastDrawn = -1;
  var viewW = 0, viewH = 0;
  function draw(force) {
    var idx = nearestReady(Math.round(current));
    if (idx < 0 || (idx === lastDrawn && !force)) return;
    if (!fit) computeFit(viewW, viewH);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.drawImage(frames[idx], fit.sx, fit.sy, fit.sw, fit.sh, fit.dx, fit.dy, fit.dw, fit.dh);
    lastDrawn = idx;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    canvas.style.width = viewW + "px";
    canvas.style.height = viewH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fit = null;
    draw(true);
  }

  // ───────── MOTION: ease displayed frame toward scroll target ─────────
  var target = 0, current = 0, rafId = null;
  function tick() {
    rafId = null;
    var diff = target - current;
    if (reducedMotion || Math.abs(diff) < 0.35) current = target;
    else current += diff * 0.16;
    draw(false);
    if (current !== target) rafId = requestAnimationFrame(tick);
  }
  function requestTick() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  // ───────── SCROLL: pinning, overlay, progress ─────────
  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateScroll);
  }
  function updateScroll() {
    scrollQueued = false;
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight;
    var range = section.offsetHeight - vh;
    if (range <= 0) return;

    // Hybrid pinning (works even when ancestors restrict overflow/sticky).
    if (rect.top > 0) {
      canvasWrap.classList.remove("is-fixed", "is-bottom");
    } else if (rect.bottom <= vh) {
      canvasWrap.classList.remove("is-fixed");
      canvasWrap.classList.add("is-bottom");
    } else {
      canvasWrap.classList.add("is-fixed");
      canvasWrap.classList.remove("is-bottom");
    }

    var progress = Math.max(0, Math.min(1, -rect.top / range));
    if (progressBar) progressBar.style.width = progress * 100 + "%";
    if (overlayContent && introDone) overlayContent.classList.toggle("visible", progress < 0.08);
    if (scrollHint) scrollHint.classList.toggle("hidden", progress > 0.02);

    target = progress * (TOTAL_FRAMES - 1);
    requestTick();
  }

  // ───────── RESIZE (debounced) ─────────
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(); onScroll(); }, 150);
  }

  // ───────── INIT ─────────
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  resize();
  updateScroll();
  setTimeout(finishIntro, LOADER_FAILSAFE_MS);
  cacheReady.then(pump);
})();
