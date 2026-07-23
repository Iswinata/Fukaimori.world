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

  /* --------------------------------------------------------
     Mobile moon portal — klik .moon-photo → ripple waves
     (gelombang ring ungu mengembang seperti hover desktop)
     lalu page-transition gelap → navigate ke archive-mobile.html
     -------------------------------------------------------- */
  (function initMoonPortal() {
    var btn = document.getElementById("moonPortalBtn");
    if (!btn) return;

    function isMobile() { return window.matchMedia("(max-width: 768px)").matches; }

    btn.addEventListener("click", function () {
      if (!isMobile()) return;

      // Posisi tengah tombol di viewport untuk asal gelombang
      var rect = btn.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var size = Math.max(rect.width, rect.height);

      // Buat 3 gelombang ring dengan delay bertahap
      for (var i = 0; i < 3; i++) {
        (function (delay) {
          var ring = document.createElement("div");
          ring.style.cssText = [
            "position:fixed",
            "border-radius:50%",
            "border:2px solid rgba(160,80,255,0.85)",
            "box-shadow:0 0 10px 3px rgba(160,80,255,0.5),inset 0 0 6px 2px rgba(160,80,255,0.3)",
            "pointer-events:none",
            "z-index:98",
            "left:" + cx + "px",
            "top:" + cy + "px",
            "width:" + size + "px",
            "height:" + size + "px",
            "margin-left:" + (-size / 2) + "px",
            "margin-top:" + (-size / 2) + "px",
            "transform:scale(1)",
            "opacity:1",
            "transition:none"
          ].join(";");
          document.body.appendChild(ring);

          // Trigger expand animation after delay
          setTimeout(function () {
            ring.style.transition = "transform 1.0s ease-out, opacity 1.0s ease-out, border-color 1.0s ease-out";
            ring.style.transform = "scale(4.5)";
            ring.style.opacity = "0";
            ring.style.borderColor = "rgba(120,60,220,0)";
          }, delay);

          // Remove ring after it finishes
          setTimeout(function () { ring.remove(); }, delay + 1100);
        })(i * 280);
      }

      // Navigate after all ripples play out (last ripple starts at 560ms, lasts 1000ms)
      setTimeout(function () {
        var overlay = document.querySelector(".page-transition");
        if (overlay) {
          overlay.classList.remove("is-entering");
          overlay.classList.add("is-leaving");
          overlay.addEventListener("animationend", function onLeft() {
            overlay.removeEventListener("animationend", onLeft);
            window.location.href = "archive-mobile.html";
          });
        } else {
          window.location.href = "archive-mobile.html";
        }
      }, 650);
    });
  })();

  /* --------------------------------------------------------
     Mobile brand click — navigasi ke archive-mobile.html
     (hanya aktif di mobile, desktop tidak terpengaruh)
     -------------------------------------------------------- */
  (function initMobBrand() {
    var brand = document.getElementById("brand");
    if (!brand) return;

    function isMobile() { return window.matchMedia("(max-width: 768px)").matches; }

    function navigateToArchive() {
      if (!isMobile()) return;
      var overlay = document.querySelector(".page-transition");
      if (overlay) {
        overlay.classList.remove("is-entering");
        overlay.classList.add("is-leaving");
        overlay.addEventListener("animationend", function onLeft() {
          overlay.removeEventListener("animationend", onLeft);
          window.location.href = "archive-mobile.html";
        });
      } else {
        window.location.href = "archive-mobile.html";
      }
    }

    brand.addEventListener("click", navigateToArchive);
    brand.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateToArchive(); }
    });
  })();

  (function setupScaler() {
    var stageCanvas = document.getElementById("canvas");
    if (!stageCanvas) return;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    function designSize() {
      var cs = getComputedStyle(stageCanvas);
      var w = parseFloat(cs.getPropertyValue("--design-w")) || 2168;
      var h = parseFloat(cs.getPropertyValue("--design-h")) || 1080;
      return { w: w, h: h };
    }

    function applyScale() {
      // On mobile, CSS handles layout — skip JS scaling
      if (isMobile() && stageCanvas.classList.contains("landing-canvas")) {
        stageCanvas.style.setProperty("--scale-x", "1");
        stageCanvas.style.setProperty("--scale-y", "1");
        stageCanvas.classList.remove("reflow");
        document.documentElement.classList.remove("reflow-active");
        return;
      }
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var d  = designSize();
      var scaleX = vw / d.w;
      var scaleY = vh / d.h;
      var scale  = Math.max(scaleX, scaleY);
      stageCanvas.style.setProperty("--scale-x", String(scale));
      stageCanvas.style.setProperty("--scale-y", String(scale));
      stageCanvas.classList.remove("reflow");
      document.documentElement.classList.remove("reflow-active");
    }

    applyScale();
    window.addEventListener("resize", applyScale);
    window.addEventListener("orientationchange", applyScale);
    window.addEventListener("load", applyScale);
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
     Page transition — radial wipe, origin adapts per page:
       - landing & archive: dari bulan (49.9% 45.7%)
       - droppoint: dari tengah canvas (50% 50%)
     On click: expand dark overlay → navigate.
     On load:  overlay starts full → collapse away.
     -------------------------------------------------------- */
  (function initPageTransition() {
    var overlay = document.querySelector(".page-transition");
    if (!overlay) return;

    // Safety reset: jika overlay masih dalam state is-leaving (stuck), langsung clear
    if (overlay.classList.contains("is-leaving")) {
      overlay.classList.remove("is-leaving");
      overlay.style.opacity = "0";
      overlay.style.animation = "none";
      void overlay.offsetWidth;
      overlay.style.opacity = "";
      overlay.style.animation = "";
    }

    // On page LOAD — fade in (overlay starts opaque → fades out)
    overlay.classList.add("is-entering");
    overlay.addEventListener("animationend", function onEntered() {
      overlay.classList.remove("is-entering");
      overlay.removeEventListener("animationend", onEntered);
    });

    // Handle browser back/forward (bfcache restore) — reset overlay state
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        // Page restored from back-forward cache — immediately clear overlay
        overlay.classList.remove("is-leaving");
        overlay.classList.remove("is-entering");
        overlay.style.opacity = "0";
        overlay.style.animation = "none";
        void overlay.offsetWidth; // force reflow
        overlay.style.opacity = "";
        overlay.style.animation = "";
        // Then do normal enter animation
        overlay.classList.add("is-entering");
        overlay.addEventListener("animationend", function onRestored() {
          overlay.classList.remove("is-entering");
          overlay.removeEventListener("animationend", onRestored);
        });
      }
    });

    // Intercept all nav links (data-transition, arc-nav, dp-close, dp-assist-link)
    var links = document.querySelectorAll(
      "a[data-transition], .arc-nav[href], .dp-close[href], .dp-assist-link[href]"
    );
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
     Mobile feather particles — same as desktop but drawn
     inside the m-frame canvas (.m-starfield), sized 474×814.
     -------------------------------------------------------- */
  (function initMobileFeathers() {
    var cvs = document.querySelector(".m-starfield");
    if (!cvs) return;

    var ctx = cvs.getContext("2d");
    cvs.width  = 474;
    cvs.height = 814;
    var W = 474, H = 814;
    var feathers = [];
    var NUM = 45;

    var palette = [
      [180,100,255],[210,140,255],[150,70,230],
      [220,160,255],[130,50,210],[255,200,255],[170,90,255]
    ];

    function randomFeather() {
      var drift = Math.random() * Math.PI * 2;
      var len   = Math.random() * 18 + 7;
      var col   = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: Math.random() * W, y: Math.random() * H,
        angle: Math.random() * Math.PI * 2,
        drift: drift,
        spin:  (Math.random() - 0.5) * 0.018,
        speed: Math.random() * 0.22 + 0.05,
        len:   len,
        width: Math.random() * 1.4 + 0.4,
        col:   col,
        baseAlpha:     Math.random() * 0.55 + 0.35,
        twinklePeriod: Math.random() * 180 + 80,
        twinklePhase:  Math.random() * Math.PI * 2
      };
    }

    for (var i = 0; i < NUM; i++) feathers.push(randomFeather());

    var frame = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      frame++;
      for (var j = 0; j < feathers.length; j++) {
        var f = feathers[j];
        f.x += Math.cos(f.drift) * f.speed;
        f.y += Math.sin(f.drift) * f.speed;
        f.angle += f.spin;
        if (f.x < -f.len) f.x = W + f.len;
        if (f.x > W + f.len) f.x = -f.len;
        if (f.y < -f.len) f.y = H + f.len;
        if (f.y > H + f.len) f.y = -f.len;
        var tw = Math.sin(frame / f.twinklePeriod * Math.PI * 2 + f.twinklePhase);
        var fa = Math.max(0.08, Math.min(0.95, f.baseAlpha + tw * 0.3));
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);
        var grad = ctx.createLinearGradient(-f.len/2, 0, f.len/2, 0);
        grad.addColorStop(0,    "rgba("+f.col+",0)");
        grad.addColorStop(0.25, "rgba("+f.col+","+(fa*0.5).toFixed(2)+")");
        grad.addColorStop(0.5,  "rgba("+f.col+","+fa.toFixed(2)+")");
        grad.addColorStop(0.75, "rgba("+f.col+","+(fa*0.5).toFixed(2)+")");
        grad.addColorStop(1,    "rgba("+f.col+",0)");
        ctx.shadowColor = "rgba("+f.col+","+(fa*0.9).toFixed(2)+")";
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.moveTo(-f.len/2, 0);
        ctx.lineTo(f.len/2, 0);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = f.width * 2.5;
        ctx.stroke();
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.moveTo(-f.len/3, 0);
        ctx.lineTo(f.len/3, 0);
        ctx.strokeStyle = "rgba("+f.col+","+Math.min(1,fa+0.25).toFixed(2)+")";
        ctx.lineWidth   = f.width * 0.7;
        ctx.stroke();
        ctx.restore();
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* --------------------------------------------------------
     Glowing feather particles — garis bulu berpendar ungu,
     berterbangan acak ke segala arah.
     -------------------------------------------------------- */
  (function initFeathers() {
    var cvs = document.querySelector(".starfield");
    if (!cvs) return;

    var ctx = cvs.getContext("2d");
    var W, H;
    var feathers = [];
    var NUM = 65;

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
      var len   = Math.random() * 28 + 10;
      var col   = palette[Math.floor(Math.random() * palette.length)];
      return {
        x:             Math.random() * (W || 2168),
        y:             Math.random() * (H || 1080),
        angle:         Math.random() * Math.PI * 2,
        drift:         drift,
        spin:          (Math.random() - 0.5) * 0.018,
        speed:         Math.random() * 0.22 + 0.05,
        len:           len,
        width:         Math.random() * 1.6 + 0.5,
        col:           col,
        baseAlpha:     Math.random() * 0.55 + 0.35,
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

        f.x += Math.cos(f.drift) * f.speed;
        f.y += Math.sin(f.drift) * f.speed;
        f.angle += f.spin;

        if (f.x < -f.len) f.x = W + f.len;
        if (f.x > W + f.len) f.x = -f.len;
        if (f.y < -f.len) f.y = H + f.len;
        if (f.y > H + f.len) f.y = -f.len;

        var tw = Math.sin(frame / f.twinklePeriod * Math.PI * 2 + f.twinklePhase);
        var fa = Math.max(0.08, Math.min(0.95, f.baseAlpha + tw * 0.3));

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);

        var grad = ctx.createLinearGradient(-f.len / 2, 0, f.len / 2, 0);
        grad.addColorStop(0,    "rgba(" + f.col + ",0)");
        grad.addColorStop(0.25, "rgba(" + f.col + "," + (fa * 0.5).toFixed(2) + ")");
        grad.addColorStop(0.5,  "rgba(" + f.col + "," + fa.toFixed(2) + ")");
        grad.addColorStop(0.75, "rgba(" + f.col + "," + (fa * 0.5).toFixed(2) + ")");
        grad.addColorStop(1,    "rgba(" + f.col + ",0)");

        ctx.shadowColor = "rgba(" + f.col + "," + (fa * 0.9).toFixed(2) + ")";
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.moveTo(-f.len / 2, 0);
        ctx.lineTo(f.len / 2, 0);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = f.width * 2.5;
        ctx.stroke();

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
     Drop Point — sequence input auto-advance, backspace,
     VERIFY button validation (correct: CR7SIU)
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
        // Allow Enter to trigger verify
        if (e.key === "Enter") {
          var btn = document.querySelector(".dp-verify");
          if (btn) btn.click();
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

    // VERIFY button
    var verifyBtn = document.querySelector(".dp-verify");
    var seqRow = document.querySelector(".dp-seq");
    var SECRET = "CR7SIU000"; // 9-char placeholder — update when final code is decided

    if (verifyBtn) {
      verifyBtn.addEventListener("click", function () {
        var entered = Array.from(boxes).map(function (b) { return b.value; }).join("");
        if (entered === SECRET) {
          // Correct — fade out then navigate to granted.html
          var overlay = document.querySelector(".page-transition");
          if (overlay) {
            overlay.classList.remove("is-entering");
            overlay.classList.add("is-leaving");
            overlay.addEventListener("animationend", function onLeft() {
              overlay.removeEventListener("animationend", onLeft);
              window.location.href = "granted.html";
            });
          } else {
            window.location.href = "granted.html";
          }
        } else {
          // Wrong or empty — shake + red highlight, then clear
          if (seqRow) {
            seqRow.classList.remove("shake");
            void seqRow.offsetWidth; // Force reflow to restart animation
            seqRow.classList.add("shake");
          }
          boxes.forEach(function (b) {
            // Mark every box red — empty boxes get it too
            b.classList.add("wrong");
          });
          setTimeout(function () {
            boxes.forEach(function (b) {
              b.classList.remove("wrong");
              b.value = "";
            });
            if (boxes[0]) boxes[0].focus();
          }, 900);
        }
      });
    }
  })();

  /* --------------------------------------------------------
     Archive file pop-up
       - clicking the first card (AW-01 / Seshomaru) opens a
         modal with the file details
       - close via the × button, the backdrop, or the Esc key
     -------------------------------------------------------- */
  (function initArcModal() {
    var modal   = document.getElementById("arc-modal");
    var trigger = document.querySelector('.arc-card[data-entry="seshomaru"]');
    if (!modal || !trigger) return;

    var lastFocusedModal = null;

    /* Modal is position:absolute inside the canvas — no extra scaling needed */
    function applyModalScale() { /* no-op */ }

    function openModal() {
      lastFocusedModal = document.activeElement;
      applyModalScale();
      history.pushState({ modal: "arc-modal" }, "");
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var closeBtn = modal.querySelector(".arc-modal-close");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocusedModal && typeof lastFocusedModal.focus === "function") {
        lastFocusedModal.focus();
      }
    }

    window.addEventListener("popstate", function (e) {
      if (modal.classList.contains("open")) {
        closeModal();
      }
    });

    trigger.addEventListener("click", openModal);
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal();
      }
    });

    // Close on backdrop click (outside the panel) or × button
    modal.addEventListener("click", function (e) {
      var panel = modal.querySelector(".arc-modal-panel");
      if (panel && !panel.contains(e.target)) closeModal();
    });
    var closeBtn = modal.querySelector(".arc-modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Recalculate scale on resize while modal is open
    window.addEventListener("resize", function () {
      if (modal.classList.contains("open")) applyModalScale();
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  })();

  /* --------------------------------------------------------
     Archive Notes overlay (droppoint.html)
     Opens when #open-archive-notes is clicked.
     Closes via #an-close button, the backdrop, or Escape.
     -------------------------------------------------------- */
  (function initArchiveNotes() {
    var overlay  = document.getElementById("an-overlay");
    var openBtn  = document.getElementById("open-archive-notes");
    var closeBtn = document.getElementById("an-close");
    var backdrop = document.getElementById("an-backdrop");
    if (!overlay || !openBtn) return;

    var lastFocusedNotes = null;

    function openNotes() {
      lastFocusedNotes = document.activeElement;
      history.pushState({ modal: "an-overlay" }, "");
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      if (closeBtn) closeBtn.focus();
    }

    function closeNotes() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      if (lastFocusedNotes && typeof lastFocusedNotes.focus === "function") {
        lastFocusedNotes.focus();
      }
    }

    openBtn.addEventListener("click", openNotes);
    if (closeBtn)  closeBtn.addEventListener("click", closeNotes);
    if (backdrop)  backdrop.addEventListener("click", closeNotes);

    window.addEventListener("popstate", function () {
      if (overlay.classList.contains("is-open")) {
        closeNotes();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        closeNotes();
      }
    });
  })();

})();
