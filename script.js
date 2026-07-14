/* ============================================================
   Fukaimori · An Archive
   Layout is fullscreen-fluid via CSS (vw / %). This script only
   handles graceful fallbacks when image assets are missing:
     - hide the .photo layer if BGLP.png fails to load
     - draw a CSS logo (.no-logo) if Subtract.png fails to load
   ============================================================ */
(function () {
  "use strict";

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
       - click / Enter => play the enter transition, then
         navigate to the next page
       (hover effect removed by request)
     -------------------------------------------------------- */
  var portal = document.getElementById("portal");
  if (canvas && portal) {
    // The next page to open when the portal is entered.
    var NEXT_PAGE = portal.getAttribute("data-next") || "archive.html";

    var entering = false;

    var enter = function () {
      if (entering) return;
      entering = true;
      canvas.classList.add("portal-active", "portal-entering");

      var reduce = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var delay = reduce ? 0 : 1000;

      window.setTimeout(function () {
        window.location.href = NEXT_PAGE;
      }, delay);
    };

    portal.addEventListener("click", enter);
  }
})();


