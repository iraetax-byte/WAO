// main.js
// WÃO – entry point principal de la app

import { $ } from "./utils/dom.js";
import { initDisk } from "./disk.js";
import { initModeSelector, getSelectedModeId } from "./mode-selector.js";
import { initParamsPanel, syncParamsForMode } from "./params-panel.js";
import { initSfxPanel, getSfxState } from "./sfx.js";
import {
  initVisualEngine,
  setMode,
  renderVisual,
  setGlobalParam,
  setModeParam
} from "./visual-engine.js";

// --------------------------------------------------
// 1. Estado global mínimo
// --------------------------------------------------
let audioElement = null;
let audioContext = null;
let audioAnalyser = null;
let audioSourceNode = null;
let rafId = null;

// --------------------------------------------------
// 2. Utilidades de audio / analyser
// --------------------------------------------------
function initAudioAnalyzer() {
  audioElement = document.getElementById("audio-element");

  if (!audioElement) {
    console.error("[WÃO] No se encontró #audio-element en el DOM.");
    return null;
  }

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) {
    console.error("[WÃO] AudioContext no soportado en este navegador.");
    return null;
  }

  // Reutilizamos si ya existe
  if (!audioContext) {
    audioContext = new AC();
    window.waoAudioContext = audioContext;
  }

  if (!audioSourceNode) {
    try {
      audioSourceNode = audioContext.createMediaElementSource(audioElement);
    } catch (e) {
      console.warn(
        "[WÃO] El <audio> ya tenía un MediaElementSource en este AudioContext. Reutilizando el existente si es posible.",
        e
      );
    }
  }

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const waveformData = new Float32Array(bufferLength);
  const spectrumData = new Uint8Array(bufferLength);

  audioAnalyser = {
    analyser,
    waveformData,
    spectrumData,
  };

  // Conexión básica: source -> analyser -> destino
  if (audioSourceNode) {
    audioSourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
  }

  // Exponer algunos nodos globales para otros módulos (Milkdrop, etc.)
  window.waoAnalyserNode = analyser;
  window.waoAnalyser = analyser;
  window.waoSourceNode = audioSourceNode;

  console.log("[WÃO] Audio analyzer inicializado correctamente.");
  return audioAnalyser;
}

function getAudioData() {
  if (!audioAnalyser) return null;

  const { analyser, waveformData, spectrumData } = audioAnalyser;

  analyser.getFloatTimeDomainData(waveformData);
  analyser.getByteFrequencyData(spectrumData);

  return {
    waveform: waveformData,
    spectrum: spectrumData,
  };
}

// --------------------------------------------------
// 3. Control de reproducción de audio
// --------------------------------------------------
function setupTransportControls() {
  const btnPlay = $("#btn-play");
  const btnPause = $("#btn-pause");

  if (!audioElement) {
    audioElement = $("#audio-element");
  }

  if (!audioElement) {
    console.warn("[WÃO] No se encontró el elemento de audio para los transport controls.");
    return;
  }

  btnPlay?.addEventListener("click", async () => {
    try {
      if (audioContext && audioContext.state === "suspended") {
        await audioContext.resume();
      }
      await audioElement.play();
    } catch (e) {
      console.error("[WÃO] Error al reproducir audio:", e);
    }
  });

  btnPause?.addEventListener("click", () => {
    audioElement.pause();
  });
}

// --------------------------------------------------
// 4. Cambio de modo & sincronización con UI
// --------------------------------------------------
function handleModeChange() {
  const modeId = getSelectedModeId();
  if (!modeId) return;

  setMode(modeId);

  // Sincronizar panel de parámetros con el modo activo
  const modeConfig = window.WAO_MODES?.find((m) => m.id === modeId) || null;
  if (modeConfig) {
    syncParamsForMode(modeConfig);
  }

  console.log("[WÃO] Modo cambiado a:", modeId);
}

// --------------------------------------------------
// 5. Eventos para sliders de parámetros
// --------------------------------------------------
function setupParamHandlers() {
  const paramsContainer = $("#params-container");
  if (!paramsContainer) return;

  paramsContainer.addEventListener("input", (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.dataset.paramId) {
      const paramId = target.dataset.paramId;
      const value = parseFloat(target.value);
      setModeParam(paramId, value);
    }
  });
}

// --------------------------------------------------
// 6. Render loop para el motor visual WÃO
// --------------------------------------------------
function ensureRenderLoop() {
  if (rafId !== null) return;

  const loop = (timestamp) => {
    const audioData = getAudioData();
    renderVisual(audioData, timestamp);
    rafId = requestAnimationFrame(loop);
  };

  rafId = requestAnimationFrame(loop);
}

// --------------------------------------------------
// 7. Punto de entrada: cuando el DOM está listo
// --------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  console.log("[WÃO] DOMContentLoaded – iniciando app WÃO.");

  // 1) Inicializar disco y selector de modos
  initDisk();
  initModeSelector({
    onModeChange: handleModeChange,
  });

  // 2) Panel de parámetros y SFX
  initParamsPanel();
  initSfxPanel();

  // 3) Inicializar analyser de audio
  const analyser = initAudioAnalyzer();
  if (!analyser) {
    console.warn("[WÃO] No se pudo inicializar el analyser de audio.");
  }

  // 4) Inicializar motor visual con el canvas principal
  const canvas = document.getElementById("visual-canvas");
  if (!canvas) {
    console.warn("[WÃO] No se encontró #visual-canvas al iniciar.");
  } else {
    initVisualEngine(canvas);
  }

  // 5) Transport controls (play/pause)
  setupTransportControls();

  // 6) Empezar el bucle de render
  ensureRenderLoop();

  console.log("[WÃO] App WÃO inicializada.");
});