/* ============================================================
   Fukaimori · An Archive
   Layout is fullscreen-fluid via CSS (vw / %). This script only
   handles graceful fallbacks when image assets are missing:
     - hide the .photo layer if BGLP.png fails to load
     - draw a CSS logo (.no-logo) if Subtract.png fails to load
   ============================================================ */
(function () {
  "use strict";

  /* --------------------------------------------------------
     Fit-the-screen scaler (CONTAIN): the design canvas has a
     fixed size (1920x1050). We scale it as a single unit by the
     SMALLER axis ratio so the WHOLE design always fits inside the
     viewport on every device/browser/aspect-ratio — nothing is
     ever cropped — while keeping the original proportions (the
     background photo is never stretched and every element stays
     aligned). Any leftover space around the canvas is filled by
     the viewport's matching dark background, so there are no
     jarring black bars.
     -------------------------------------------------------- */

  (function setupScaler() {
    var stageCanvas = document.getElementById("canvas");
    if (!stageCanvas) return;

    // Read the design size from the CSS custom properties, with a
    // sensible fallback if they aren't set yet.
    function designSize() {
      var cs = getComputedStyle(stageCanvas);
      var w = parseFloat(cs.getPropertyValue("--design-w")) || 1920;
      var h = parseFloat(cs.getPropertyValue("--design-h")) || 1080;
      return { w: w, h: h };
    }

    // On phones / portrait tablets / very short windows, a wide
    // landscape design scaled to cover would crop too much to be
    // usable. There we drop the transform and let CSS reflow the
    // page into a fluid, scrollable mobile layout (.reflow class).
    var reflowMQ = window.matchMedia(
      "(max-width: 1024px), (orientation: portrait), (max-height: 500px)"
    );

    // Root element gets a matching flag so the CSS can switch the
    // page into its scrollable mobile layout WITHOUT relying on the
    // :has() selector (which older Safari / Firefox don't support).
    var root = document.documentElement;

    function applyScale() {
      if (reflowMQ.matches) {
        stageCanvas.classList.add("reflow");
        root.classList.add("reflow-active");
        stageCanvas.style.removeProperty("--scale");
        return;
      }
      stageCanvas.classList.remove("reflow");
      root.classList.remove("reflow-active");
      var d = designSize();
      // FILL scale: scale each axis independently so the canvas
      // stretches to the EXACT viewport size. The whole design is
      // always visible edge-to-edge — nothing is ever cropped and
      // there are no blurred bars — on any laptop / desktop screen.
      var scaleX = window.innerWidth / d.w;
      var scaleY = window.innerHeight / d.h;
      // Use CONTAIN: pick the smaller scale so nothing is ever cropped.
      var scale  = Math.min(scaleX, scaleY);
      stageCanvas.style.setProperty("--scale-x", String(scale));
      stageCanvas.style.setProperty("--scale-y", String(scale));

    }

    applyScale();
    window.addEventListener("resize", applyScale);
    window.addEventListener("orientationchange", applyScale);
    // Recompute once fonts/images settle in case the viewport shifts.
    window.addEventListener("load", applyScale);
    if (reflowMQ.addEventListener) {
      reflowMQ.addEventListener("change", applyScale);
    } else if (reflowMQ.addListener) {
      reflowMQ.addListener(applyScale);
    }
  })();






  function urlFromBg(el) {


    if (!el) return "";
    var style = getComputedStyle(el);
    var match = /url\((['"]?)(.*?)\1\)/.exec(style.backgroundImage || "");
    return match ? match[2] : "";
  }

  // Background photo fallback
  var photo = document.querySelector(".photo");
  var photoUrl = urlFromBg(photo);
  if (photo) {
    if (photoUrl) {
      var bg = new Image();
      bg.onerror = function () { photo.style.display = "none"; };
      bg.src = photoUrl;
    } else {
      photo.style.display = "none";
    }
  }

  // Logo fallback: if Subtract.png can't load, use the CSS-drawn mark
  var canvas = document.getElementById("canvas");
  var mark = document.querySelector(".brand-mark");
  var logoUrl = urlFromBg(mark);
  if (canvas && logoUrl) {
    var logo = new Image();
    logo.onerror = function () { canvas.classList.add("no-logo"); };
    logo.src = logoUrl;
  } else if (canvas) {
    canvas.classList.add("no-logo");
  }

  /* --------------------------------------------------------
     Page transition — radial wipe from moon center
     On click: expand dark overlay → navigate.
     On load: overlay starts full → collapse away.
     -------------------------------------------------------- */
  (function initPageTransition() {
    var overlay = document.querySelector(".page-transition");
    if (!overlay) return;

    // On page LOAD — play the collapse (enter) animation
    overlay.classList.add("is-entering");
    overlay.addEventListener("animationend", function onEntered() {
      overlay.classList.remove("is-entering");
      overlay.removeEventListener("animationend", onEntered);
    });

    // Intercept all links with data-transition (and .arc-nav back link too)
    var links = document.querySelectorAll("a[data-transition], .arc-nav[href]");
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href === "#") return;
        e.preventDefault();
        overlay.classList.remove("is-entering");
        overlay.classList.add("is-leaving");
        overlay.addEventListener("animationend", function onLeft() {
          overlay.removeEventListener("animationend", onLeft);
          window.location.href = href;
        });
      });
    });
  })();

  /* --------------------------------------------------------
     Glowing feather particles — no stars, only feathers.
     Warna ungu menyala, banyak, berterbangan acak.
     -------------------------------------------------------- */
  (function initFeathers() {
    var cvs = document.querySelector(".starfield");
    if (!cvs) return;

    var ctx = cvs.getContext("2d");
    var W, H;
    var feathers = [];
    var NUM = 65;  // banyak bulu

    // Palette ungu menyala
    var palette = [
      [180, 100, 255],
      [210, 140, 255],
      [150,  70, 230],
      [220, 160, 255],
      [130,  50, 210],
      [255, 200, 255],
      [170,  90, 255]
    ];

    function resize() {
      var parent = cvs.parentElement;
      W = cvs.width  = parent ? parent.offsetWidth  : window.innerWidth;
      H = cvs.height = parent ? parent.offsetHeight : window.innerHeight;
    }

    function randomFeather() {
      var drift = Math.random() * Math.PI * 2;
      var len   = Math.random() * 28 + 10;   // 10–38px
      var col   = palette[Math.floor(Math.random() * palette.length)];
      return {
        x:            Math.random() * (W || 2168),
        y:            Math.random() * (H || 1080),
        angle:        Math.random() * Math.PI * 2,
        drift:        drift,
        spin:         (Math.random() - 0.5) * 0.018,
        speed:        Math.random() * 0.22 + 0.05,
        len:          len,
        width:        Math.random() * 1.6 + 0.5,
        col:          col,
        baseAlpha:    Math.random() * 0.55 + 0.35,
        twinklePeriod: Math.random() * 180 + 80,
        twinklePhase:  Math.random() * Math.PI * 2
      };
    }

    function initAll() {
      feathers = [];
      for (var i = 0; i < NUM; i++) feathers.push(randomFeather());
    }

    var frame = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      frame++;

      for (var j = 0; j < feathers.length; j++) {
        var f = feathers[j];

        // Move
        f.x += Math.cos(f.drift) * f.speed;
        f.y += Math.sin(f.drift) * f.speed;
        f.angle += f.spin;

        // Wrap
        if (f.x < -f.len) f.x = W + f.len;
        if (f.x > W + f.len) f.x = -f.len;
        if (f.y < -f.len) f.y = H + f.len;
        if (f.y > H + f.len) f.y = -f.len;

        // Twinkle
        var tw = Math.sin(frame / f.twinklePeriod * Math.PI * 2 + f.twinklePhase);
        var fa = Math.max(0.08, Math.min(0.95, f.baseAlpha + tw * 0.3));

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);

        // Outer glow
        var grad = ctx.createLinearGradient(-f.len / 2, 0, f.len / 2, 0);
        grad.addColorStop(0,   "rgba(" + f.col + ",0)");
        grad.addColorStop(0.25,"rgba(" + f.col + "," + (fa * 0.5).toFixed(2) + ")");
        grad.addColorStop(0.5, "rgba(" + f.col + "," + fa.toFixed(2) + ")");
        grad.addColorStop(0.75,"rgba(" + f.col + "," + (fa * 0.5).toFixed(2) + ")");
        grad.addColorStop(1,   "rgba(" + f.col + ",0)");

        ctx.shadowColor = "rgba(" + f.col + "," + (fa * 0.9).toFixed(2) + ")";
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.moveTo(-f.len / 2, 0);
        ctx.lineTo(f.len / 2, 0);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = f.width * 2.5;
        ctx.stroke();

        // Bright core streak
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.moveTo(-f.len / 3, 0);
        ctx.lineTo(f.len / 3, 0);
        ctx.strokeStyle = "rgba(" + f.col + "," + Math.min(1, fa + 0.25).toFixed(2) + ")";
        ctx.lineWidth   = f.width * 0.7;
        ctx.stroke();

        ctx.restore();
      }

      requestAnimationFrame(draw);
    }

    resize();
    initAll();
    draw();
    window.addEventListener("resize", function () { resize(); initAll(); });
  })();

  /* --------------------------------------------------------
     Drop Point — sequence input auto-advance & backspace
     -------------------------------------------------------- */
  (function initSeqInput() {
    var boxes = document.querySelectorAll(".dp-seq-box");
    if (!boxes.length) return;

    boxes.forEach(function (box, i) {
      box.addEventListener("input", function () {
        var val = box.value;
        if (val.length >= 1) {
          box.value = val[val.length - 1].toUpperCase();
          if (i < boxes.length - 1) boxes[i + 1].focus();
        }
      });
      box.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !box.value && i > 0) {
          boxes[i - 1].focus();
          boxes[i - 1].value = "";
        }
      });
      box.addEventListener("paste", function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData("text").toUpperCase();
        var chars = text.replace(/\s/g, "").split("");
        chars.forEach(function (ch, j) {
          if (i + j < boxes.length) boxes[i + j].value = ch;
        });
        var next = Math.min(i + chars.length, boxes.length - 1);
        boxes[next].focus();
      });
    });
  })();

  /* --------------------------------------------------------
     Archive file pop-up
       - clicking the first card (AW-01 / Seshomaru) opens a
         modal with the file details
       - close via the × button, the backdrop, or the Esc key
     -------------------------------------------------------- */
  var modal = document.getElementById("arc-modal");
  var trigger = document.querySelector('.arc-card[data-entry="seshomaru"]');

  if (modal && trigger) {
    var lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      var closeBtn = modal.querySelector(".arc-modal-close");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    trigger.addEventListener("click", openModal);
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal();
      }
    });

    // Close on backdrop / × button (any element marked data-close)
    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) closeModal();
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

})();



