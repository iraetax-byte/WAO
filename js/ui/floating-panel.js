// js/ui/floating-panel.js
// Dancing floating panel: Suggested, Global params, Mode settings.

import { $, el } from "../utils/dom.js";
import { STATIC_GLOBALS, DYNAMIC_GLOBALS } from "../config/globals.js";
import { playClick, playPanelToggle } from "../sfx.js";

let panelEl = null;
let toggleEl = null;
let globalsBodyEl = null;
let modeBodyEl = null;
let activeModeNameEl = null;

let onGlobalChangeCb = null;
let onModeParamChangeCb = null;

export function initFloatingPanelUI({
  onGlobalChange,
  onModeParamChange
} = {}) {
  panelEl = $("#floating-panel");
  toggleEl = $("#panel-toggle");
  globalsBodyEl = $("#globals-body");
  modeBodyEl = $("#mode-body");
  activeModeNameEl = $("#active-mode-name");

  onGlobalChangeCb = onGlobalChange;
  onModeParamChangeCb = onModeParamChange;

  if (!panelEl || !toggleEl) return;

  toggleEl.addEventListener("click", () => {
    playPanelToggle();
    const isVisible = panelEl.classList.contains("visible");
    if (isVisible) hideFloatingPanel();
    else showFloatingPanel();
  });

  document.addEventListener("click", (ev) => {
    if (!panelEl || !toggleEl) return;
    if (
      !panelEl.contains(ev.target) &&
      ev.target !== toggleEl &&
      panelEl.classList.contains("visible")
    ) {
      hideFloatingPanel();
    }
  });

  renderGlobalParams();
}

/**
 * Render static + dynamic global parameters as sliders.
 */
function renderGlobalParams() {
  if (!globalsBodyEl) globalsBodyEl = $("#globals-body");
  if (!globalsBodyEl) return;

  globalsBodyEl.innerHTML = "";

  const groups = [
    { label: "Light & Texture", list: STATIC_GLOBALS },
    { label: "Motion & Energy", list: DYNAMIC_GLOBALS }
  ];

  groups.forEach((group) => {
    const subtitle = el("div", "panel-subtitle", group.label);
    globalsBodyEl.appendChild(subtitle);

    group.list.forEach((param) => {
      const row = el("div", "control-row");
      const label = el("label", "", param.label);
      const input = el("input");
      input.type = "range";
      input.min = 0;
      input.max = 100;
      input.value = param.default * 100;
      input.dataset.paramId = param.id;

      input.addEventListener("input", () => {
        const valueNorm = input.value / 100;
        if (onGlobalChangeCb) {
          onGlobalChangeCb(param.id, valueNorm);
        }
      });

      row.appendChild(label);
      row.appendChild(input);
      globalsBodyEl.appendChild(row);
    });
  });
}

/**
 * Render the 3 mode-exclusive parameters for the active mode.
 */
export function renderModeParams(mode) {
  if (!modeBodyEl) modeBodyEl = $("#mode-body");
  if (!activeModeNameEl) activeModeNameEl = $("#active-mode-name");
  if (!modeBodyEl) return;

  activeModeNameEl.textContent = (mode.name || "").toUpperCase();
  modeBodyEl.innerHTML = "";

  if (!mode.params) return;

  mode.params.forEach((p) => {
    const row = el("div", "control-row");
    const label = el("label", "", p.label);
    const input = el("input");
    input.type = "range";
    input.min = 0;
    input.max = 100;
    input.value = p.default * 100;
    input.dataset.modeId = mode.id;
    input.dataset.paramId = p.id;

    input.addEventListener("input", () => {
      const valueNorm = input.value / 100;
      if (onModeParamChangeCb) {
        onModeParamChangeCb(mode.id, p.id, valueNorm);
      }
    });

    row.appendChild(label);
    row.appendChild(input);
    modeBodyEl.appendChild(row);
  });
}

export function showFloatingPanel() {
  if (!panelEl) panelEl = $("#floating-panel");
  if (!panelEl) return;
  panelEl.classList.remove("hidden");
  panelEl.classList.add("visible");
}

export function hideFloatingPanel() {
  if (!panelEl) panelEl = $("#floating-panel");
  if (!panelEl) return;
  panelEl.classList.remove("visible");
  panelEl.classList.add("hidden");
}