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



