// sfx.js
// Panel de efectos / "special FX" para WÃO

import { $ } from "./utils/dom.js";

const SFX_DEFAULT_STATE = {
  glow: true,
  blur: false,
  grain: false,
};

let currentState = { ...SFX_DEFAULT_STATE };

export function initSfxPanel() {
  const panel = $("#sfx-panel");
  if (!panel) {
    console.warn("[WÃO] No se encontró #sfx-panel en el DOM.");
    return;
  }

  const glowCheckbox = $("#sfx-glow");
  const blurCheckbox = $("#sfx-blur");
  const grainCheckbox = $("#sfx-grain");

  if (glowCheckbox) {
    glowCheckbox.checked = currentState.glow;
    glowCheckbox.addEventListener("change", () => {
      currentState.glow = glowCheckbox.checked;
      notifySfxChange();
    });
  }

  if (blurCheckbox) {
    blurCheckbox.checked = currentState.blur;
    blurCheckbox.addEventListener("change", () => {
      currentState.blur = blurCheckbox.checked;
      notifySfxChange();
    });
  }

  if (grainCheckbox) {
    grainCheckbox.checked = currentState.grain;
    grainCheckbox.addEventListener("change", () => {
      currentState.grain = grainCheckbox.checked;
      notifySfxChange();
    });
  }

  console.log("[WÃO] Panel SFX inicializado.");
}

function notifySfxChange() {
  // Exponemos el estado en window por ahora
  window.WAO_SFX_STATE = { ...currentState };
}

export function getSfxState() {
  return { ...currentState };
}