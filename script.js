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
     Fill-the-screen scaler (COVER): the design canvas has a
     fixed size (e.g. 1920x1080 or 1512x982). We scale it as a
     single unit by the LARGER axis ratio so it always fills the
     whole viewport on every device/browser — no black bars — while
     keeping the original proportions, so the background photo is
     never stretched and every element stays aligned. Overflow at
     the edges is simply cropped by the viewport.
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
      "(max-width: 820px), (orientation: portrait), (max-height: 480px)"
    );

    function applyScale() {
      if (reflowMQ.matches) {
        stageCanvas.classList.add("reflow");
        stageCanvas.style.removeProperty("--scale");
        return;
      }
      stageCanvas.classList.remove("reflow");
      var d = designSize();
      // Cover scale: the bigger of the two ratios guarantees the
      // canvas fully covers the viewport without distorting it.
      var scale = Math.max(window.innerWidth / d.w, window.innerHeight / d.h);
      stageCanvas.style.setProperty("--scale", String(scale));
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




  /* --------------------------------------------------------
     Parallax: ONLY the background photo shifts subtly with the
     pointer (and device tilt) to give the landing scene a sense
     of depth. Clouds and fog are intentionally left out.
     -------------------------------------------------------- */
  (function setupParallax() {
    var stage = document.getElementById("canvas");
    if (!stage) return;

    var photoEl = stage.querySelector(".photo");
    if (!photoEl) return;

    // Skip parallax when the user prefers reduced motion.
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    // Target and current offsets (-1..1), eased for smoothness.
    var tx = 0, ty = 0, cx = 0, cy = 0;
    var raf = null;

    function render() {
      // Ease current toward target.
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;

      // Background drifts slightly; scale keeps edges covered.
      photoEl.style.transform =
        "translate(" + (cx * 16) + "px," + (cy * 12) + "px) scale(1.04)";

      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(render);
      } else {
        raf = null;
      }
    }


    function schedule() {
      if (raf === null) raf = requestAnimationFrame(render);
    }

    window.addEventListener("pointermove", function (e) {
      // Normalize pointer to -1..1 around the viewport center.
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    });

    // Ease back to center when the pointer leaves the window.
    window.addEventListener("pointerout", function () {
      tx = 0; ty = 0; schedule();
    });

    // Device tilt (mobile) drives parallax too.
    window.addEventListener("deviceorientation", function (e) {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 45));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
      schedule();
    });
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
     Moon portal interaction
       - click / Enter => navigate directly to the next page
       (hover effect and enter animation removed by request)
     -------------------------------------------------------- */
  var portal = document.getElementById("portal");
  if (canvas && portal) {
    // The next page to open when the portal is entered.
    var NEXT_PAGE = portal.getAttribute("data-next") || "archive.html";

    portal.addEventListener("click", function () {
      window.location.href = NEXT_PAGE;
    });
  }

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



