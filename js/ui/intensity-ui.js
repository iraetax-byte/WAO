// js/ui/intensity-ui.js
// WÃO JOÃO — bottom bubbles, collapsible panels & custom intensity line.

import { $ } from "../utils/dom.js";
import { getAudioData } from "../audio-analyzer.js";

function initBottomPanels() {
  const modesToggle = $("#modes-toggle");
  const modesPanel = $("#modes-panel");

  const intensityToggle = $("#intensity-toggle");
  const intensityPanel = $("#intensity-panel");

  if (modesToggle && modesPanel) {
    modesToggle.addEventListener("click", () => {
      const isOpen = modesPanel.classList.toggle("open");
      modesPanel.classList.toggle("collapsed", !isOpen);
    });
  }

  if (intensityToggle && intensityPanel) {
    intensityToggle.addEventListener("click", () => {
      const isOpen = intensityPanel.classList.toggle("open");
      intensityPanel.classList.toggle("collapsed", !isOpen);
    });
  }

  // OJO: el botón de parámetros #panel-toggle
  // lo sigue manejando floating-panel.js.
  // Aquí no hacemos nada con él para no interferir.
}

function initIntensityLine() {
  const intensitySlider = $("#intensity-slider");
  const line = $("#intensity-line");
  const thumb = $("#intensity-thumb");

  if (!intensitySlider || !line || !thumb) return;

  const updateThumb = (ratio) => {
    const r = Math.max(0, Math.min(1, ratio || 0));
    thumb.style.left = `${r * 100}%`;
  };

  const applyFromClientX = (clientX) => {
    const rect = line.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = (clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, ratio));
    const value = Math.round(clamped * 100);
    intensitySlider.value = String(value);
    // Disparamos el mismo evento que usaría el <input> nativo
    intensitySlider.dispatchEvent(new Event("input", { bubbles: true }));
    updateThumb(clamped);
  };

  line.addEventListener("pointerdown", (ev) => {
    line.setPointerCapture(ev.pointerId);
    applyFromClientX(ev.clientX);
  });

  line.addEventListener("pointermove", (ev) => {
    if (ev.buttons & 1) {
      applyFromClientX(ev.clientX);
    }
  });

  line.addEventListener("pointerup", (ev) => {
    try {
      line.releasePointerCapture(ev.pointerId);
    } catch (_) {
      // ignore
    }
  });

  // Posición inicial desde el slider oculto
  const initial = parseInt(intensitySlider.value, 10) || 50;
  updateThumb(initial / 100);
}

function initBpmIndicator() {
  const bpmInline = $("#bpm-indicator");
  const topTrackBpmEl = $("#top-track-bpm");

  if (!bpmInline && !topTrackBpmEl) return;

  let lastEnergy = 0;
  let lastBeatTime = 0;
  let threshold = 0.12;
  let bpmSmoothed = null;
  let lastUpdateText = 0;

  const loop = (now) => {
    let data = null;
    try {
      data = getAudioData ? getAudioData() : null;
    } catch {
      data = null;
    }

    if (data) {
      const energy = typeof data.energy === "number" ? data.energy : 0;

      const isAbove = energy > threshold;
      const wasBelow = lastEnergy <= threshold;

      if (isAbove && wasBelow) {
        if (lastBeatTime > 0) {
          const intervalMs = now - lastBeatTime;
          if (intervalMs > 200 && intervalMs < 1200) {
            const instantBpm = 60000 / intervalMs;
            if (instantBpm > 60 && instantBpm < 180) {
              if (!bpmSmoothed) bpmSmoothed = instantBpm;
              else bpmSmoothed += (instantBpm - bpmSmoothed) * 0.18;
            }
          }
        }
        lastBeatTime = now;
      }

      // Adaptamos el umbral lentamente hacia la energía media
      threshold = threshold * 0.995 + energy * 0.005;
      lastEnergy = energy;

      if (bpmSmoothed && Number.isFinite(bpmSmoothed)) {
        // Actualizamos texto ~10 veces por segundo
        if (now - lastUpdateText > 100) {
          const rounded = Math.round(bpmSmoothed);
          const label = `BPM ${rounded}`;
          if (bpmInline) bpmInline.textContent = label;
          if (topTrackBpmEl) topTrackBpmEl.textContent = label;
          lastUpdateText = now;
        }
      }
    }

    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);
}

function boot() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initBottomPanels();
      initIntensityLine();
      initBpmIndicator();
    });
  } else {
    initBottomPanels();
    initIntensityLine();
    initBpmIndicator();
  }
}

boot();