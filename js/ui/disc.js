// js/ui/disc.js
// Central WÃO disc behavior (click, play state, pulse).

import { $, pulse } from "../utils/dom.js";
import { playClick } from "../sfx.js";

let discEl = null;

export function initDiscUI({ onDiscClick } = {}) {
  discEl = $("#wao-disc");
  if (!discEl) {
    console.warn("[WÃO] Disc UI: #wao-disc no encontrado");
    return;
  }

  discEl.addEventListener("click", (ev) => {
    ev.preventDefault();
    playClick();
    if (typeof onDiscClick === "function") {
      onDiscClick();
    }
  });
}

export function setDiscPlaying(isPlaying) {
  if (!discEl) discEl = $("#wao-disc");
  if (!discEl) return;
  discEl.classList.toggle("playing", !!isPlaying);
}

export function pulseDisc() {
  if (!discEl) discEl = $("#wao-disc");
  if (!discEl) return;
  pulse(discEl);
}