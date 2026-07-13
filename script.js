/* ============================================================
   Fukaimori · An Archive
   Layout is now fullscreen-fluid via CSS (vw / %), so no
   JS scaling is needed. This only hides the background image
   if it fails to load, letting the CSS fallback scene show.
   ============================================================ */
(function () {
  "use strict";

  var photo = document.querySelector(".photo");
  if (!photo) return;

  var style = getComputedStyle(photo);
  var match = /url\((['"]?)(.*?)\1\)/.exec(style.backgroundImage || "");

  if (match && match[2]) {
    var probe = new Image();
    probe.onerror = function () { photo.style.display = "none"; };
    probe.src = match[2];
  } else {
    photo.style.display = "none";
  }
})();
