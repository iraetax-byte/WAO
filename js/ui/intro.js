// js/ui/intro.js
// Simple intro overlay: se desvanece tras un tiempo o un click.

import { $ } from "../utils/dom.js";

let overlay = null;

export function initIntro({ onFinished } = {}) {
  overlay = $("#intro-overlay");
  if (!overlay) {
    if (typeof onFinished === "function") onFinished();
    return;
  }

  const finish = () => {
    overlay.classList.add("intro-hidden");
    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (typeof onFinished === "function") onFinished();
    }, 400);
  };

  // Clic en la intro → saltar
  overlay.addEventListener("click", finish);

  // Auto-skip tras 2 segundos
  setTimeout(finish, 2000);
}