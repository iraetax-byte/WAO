// js/ui/mode-selector.js
// Bottom bar: 12 modes selector.

import { $, el } from "../utils/dom.js";
import { MODES } from "../config/modes.js";
import { playModeChange } from "../sfx.js";

let stripEl = null;
let onModeChangeCb = null;
let activeModeId = "mist";

export function initModeSelectorUI({ onModeChange } = {}) {
  stripEl = $("#modes-strip");
  onModeChangeCb = onModeChange;

  if (!stripEl) return;
  renderModes();
}

function renderModes() {
  stripEl.innerHTML = "";
  MODES.forEach((mode, index) => {
    const btn = el("button", "mode-button", mode.name);
    btn.type = "button";
    btn.dataset.modeId = mode.id;

    if (index === 0) {
      btn.classList.add("active");
      activeModeId = mode.id;
    }

    btn.addEventListener("click", () => {
      if (mode.id === activeModeId) return;
      setActiveMode(mode.id);
      playModeChange();
      if (onModeChangeCb) {
        onModeChangeCb(mode);
      }
    });

    stripEl.appendChild(btn);
  });
}

export function setActiveMode(modeId) {
  activeModeId = modeId;
  const buttons = stripEl.querySelectorAll(".mode-button");
  buttons.forEach((b) => {
    if (b.dataset.modeId === modeId) b.classList.add("active");
    else b.classList.remove("active");
  });
}

export function getActiveModeConfig() {
  return MODES.find((m) => m.id === activeModeId) || MODES[0];
}