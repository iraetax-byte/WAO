// visual-engine.js
// Motor visual principal de WÃO (sin Milkdrop aquí directamente)

import { getSfxState } from "./sfx.js";

// --------------------------------------------------
// 1. Estado interno del motor
// --------------------------------------------------
let canvas = null;
let ctx = null;
let dpr = window.devicePixelRatio || 1;

let canvasWidth = 0;
let canvasHeight = 0;
let centerX = 0;
let centerY = 0;
let baseRadius = 0;

let currentModeId = "mist";
let currentModeConfig = null;

// Historial para efectos tipo raVe
const historyLength = 120;
const bassHistory = new Float32Array(historyLength);
const midHistory = new Float32Array(historyLength);
const trebleHistory = new Float32Array(historyLength);
let historyIndex = 0;

// Parámetros globales (actúan sobre todos los modos)
const globalParams = {
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
};

// Parámetros específicos por modo
const modeParams = new Map();

// Flag para inicialización única
let hasStarted = false;

// --------------------------------------------------
// 2. Utilidades matemáticas y color
// --------------------------------------------------
function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

function toRgbString(c, alpha = 1) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}

// --------------------------------------------------
// 3. Modos WÃO (estructura mínima)
// --------------------------------------------------
export const MODES = [
  {
    id: "mist",
    name: "Mist",
    family: "wao",
    params: [
      { id: "density", label: "Density", min: 0, max: 1, step: 0.01, default: 0.5 },
      { id: "spread", label: "Spread", min: 0, max: 1, step: 0.01, default: 0.6 },
      { id: "motion", label: "Motion", min: 0, max: 1, step: 0.01, default: 0.4 },
    ],
  },
  {
    id: "pillars",
    name: "Pillars",
    family: "wao",
    params: [
      { id: "count", label: "Count", min: 1, max: 64, step: 1, default: 24 },
      { id: "height", label: "Height", min: 0, max: 1, step: 0.01, default: 0.8 },
      { id: "sway", label: "Sway", min: 0, max: 1, step: 0.01, default: 0.3 },
    ],
  },
  {
    id: "horizon",
    name: "Horizon",
    family: "wao",
    params: [
      { id: "lineThickness", label: "Line", min: 0.5, max: 8, step: 0.1, default: 2 },
      { id: "glow", label: "Glow", min: 0, max: 1, step: 0.01, default: 0.7 },
      { id: "parallax", label: "Parallax", min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
  },
];

// --------------------------------------------------
// 4. Inicialización del canvas
// --------------------------------------------------
function resizeCanvas() {
  if (!canvas || !ctx) return;

  const { clientWidth, clientHeight } = canvas;
  const width = clientWidth * dpr;
  const height = clientHeight * dpr;

  if (width === canvasWidth && height === canvasHeight) return;

  canvasWidth = width;
  canvasHeight = height;

  canvas.width = width;
  canvas.height = height;

  centerX = width / 2;
  centerY = height / 2;
  baseRadius = Math.min(width, height) * 0.28;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  console.log("[WÃO] Canvas resized:", width, height);
}

export function initVisualEngine(canvasElement) {
  canvas = canvasElement;

  if (!canvas) {
    console.warn("[WÃO] initVisualEngine: no canvas element provided.");
    return;
  }

  ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("[WÃO] No se pudo obtener contexto 2D del canvas.");
    return;
  }

  dpr = window.devicePixelRatio || 1;
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  hasStarted = true;
  console.log("[WÃO] Motor visual WÃO inicializado.");
}

// --------------------------------------------------
// 5. Gestión de modos y parámetros
// --------------------------------------------------
export function setMode(modeId) {
  const found = MODES.find((m) => m.id === modeId);
  if (!found) {
    console.warn("[WÃO] setMode: modo no encontrado:", modeId);
    return;
  }

  currentModeId = modeId;
  currentModeConfig = found;

  if (!modeParams.has(modeId)) {
    const defaults = {};
    found.params.forEach((p) => {
      defaults[p.id] = p.default;
    });
    modeParams.set(modeId, defaults);
  }

  console.log("[WÃO] Modo WÃO activo:", modeId);
}

export function setGlobalParam(paramId, value) {
  if (!(paramId in globalParams)) return;
  globalParams[paramId] = value;
}

export function setModeParam(paramId, value) {
  if (!currentModeId) return;
  const params = modeParams.get(currentModeId) || {};
  params[paramId] = value;
  modeParams.set(currentModeId, params);
}

export function getActiveModeConfig() {
  return currentModeConfig;
}

// --------------------------------------------------
// 6. Helpers de audio (bass/mid/treble)
// --------------------------------------------------
function extractBandsFromSpectrum(spectrum) {
  if (!spectrum || spectrum.length === 0) {
    return { bass: 0, mid: 0, treble: 0 };
  }

  const len = spectrum.length;
  const bassEnd = Math.floor(len * 0.15);
  const midEnd = Math.floor(len * 0.5);

  let bassSum = 0;
  for (let i = 0; i < bassEnd; i++) bassSum += spectrum[i];
  let midSum = 0;
  for (let i = bassEnd; i < midEnd; i++) midSum += spectrum[i];
  let trebleSum = 0;
  for (let i = midEnd; i < len; i++) trebleSum += spectrum[i];

  const bass = bassSum / bassEnd / 255;
  const mid = midSum / (midEnd - bassEnd) / 255;
  const treble = trebleSum / (len - midEnd) / 255;

  return {
    bass: clamp01(bass),
    mid: clamp01(mid),
    treble: clamp01(treble),
  };
}

function pushHistory(bass, mid, treble) {
  bassHistory[historyIndex] = bass;
  midHistory[historyIndex] = mid;
  trebleHistory[historyIndex] = treble;
  historyIndex = (historyIndex + 1) % historyLength;
}

// --------------------------------------------------
// 7. Dibujados de cada modo
// --------------------------------------------------
function renderMist(audioInfo, timestamp) {
  const { bass, mid, treble } = audioInfo.bands;
  const params = modeParams.get("mist") || {};
  const density = params.density ?? 0.5;
  const spread = params.spread ?? 0.6;
  const motion = params.motion ?? 0.4;

  const sfx = getSfxState();
  const glow = sfx.glow;

  ctx.save();
  ctx.translate(centerX, centerY);

  const baseColor = [255, 192, 128];
  const innerColor = [255, 220, 180];

  const layers = 24;
  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1);
    const radius =
      baseRadius * (0.6 + spread * t + 0.15 * bass * Math.sin(timestamp * 0.001 + t * 4));
    const alpha = 0.16 * (1 - t) * (0.7 + density);

    const color = mixColor(baseColor, innerColor, t);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = toRgbString(color, alpha * (glow ? 1.2 : 1));
    ctx.lineWidth = 2 + 4 * (1 - t) * (0.5 + motion * bass);
    ctx.stroke();
  }

  ctx.restore();
}

function renderPillars(audioInfo, timestamp) {
  const { bass, mid, treble } = audioInfo.bands;
  const params = modeParams.get("pillars") || {};
  const count = params.count ?? 24;
  const height = params.height ?? 0.8;
  const sway = params.sway ?? 0.3;

  const sfx = getSfxState();
  const glow = sfx.glow;

  ctx.save();
  ctx.translate(centerX, centerY);

  const angleStep = (Math.PI * 2) / count;
  const baseColor = [255, 180, 120];
  const tipColor = [255, 240, 210];

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const t = i / (count - 1 || 1);

    const bandFactor =
      i < count / 3 ? bass : i < (2 * count) / 3 ? mid : treble;

    const pillarHeight =
      baseRadius * (0.4 + height * bandFactor * 1.6);

    const swayOffset = Math.sin(timestamp * 0.0015 + t * 8) * sway * 24;

    const color = mixColor(baseColor, tipColor, t);
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle + swayOffset * 0.001) * (baseRadius * 0.45),
      Math.sin(angle + swayOffset * 0.001) * (baseRadius * 0.45)
    );
    ctx.lineTo(
      Math.cos(angle + swayOffset * 0.0015) * (baseRadius * 0.45 + pillarHeight),
      Math.sin(angle + swayOffset * 0.0015) * (baseRadius * 0.45 + pillarHeight)
    );
    ctx.strokeStyle = toRgbString(color, glow ? 0.9 : 0.7);
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  ctx.restore();
}

function renderHorizon(audioInfo, timestamp) {
  const { bass, mid, treble } = audioInfo.bands;
  const params = modeParams.get("horizon") || {};
  const lineThickness = params.lineThickness ?? 2;
  const glow = params.glow ?? 0.7;
  const parallax = params.parallax ?? 0.5;

  const sfx = getSfxState();

  ctx.save();

  const horizonY =
    centerY +
    (bass - treble) * baseRadius * 0.3 +
    Math.sin(timestamp * 0.0004) * baseRadius * 0.12;

  const baseColor = [255, 190, 140];
  const skyColor = [250, 230, 210];

  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, toRgbString(skyColor, 1));
  gradient.addColorStop(
    0.5,
    toRgbString(mixColor(skyColor, baseColor, 0.4), 1)
  );
  gradient.addColorStop(1, "rgba(10, 5, 0, 1)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const bandRadius = baseRadius * 0.3 * (1 + bass * 0.8);
  ctx.beginPath();
  ctx.arc(centerX, horizonY, bandRadius, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = toRgbString(baseColor, glow ? 0.9 : 0.6);
  ctx.lineWidth = lineThickness * (1 + bass * 0.8);
  ctx.stroke();

  const layers = 5;
  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1 || 1);
    const y =
      horizonY +
      (i + 1) * lineThickness * 4 +
      Math.sin(timestamp * 0.0006 + t * 4) *
        baseRadius *
        0.04 *
        (1 + parallax * mid);

    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvasWidth; x += 8) {
      const localT = x / canvasWidth;
      const h =
        Math.sin(localT * Math.PI * 4 + timestamp * 0.001 * (1 + t)) *
        baseRadius *
        0.03 *
        (1 + bass * 0.5);
      ctx.lineTo(x, y + h);
    }
    const waterColor = mixColor(baseColor, [120, 90, 70], 0.3 + t * 0.4);
    ctx.strokeStyle = toRgbString(waterColor, 0.7 - t * 0.3);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  if (sfx.grain) {
    const grainIntensity = 0.12;
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 255 * grainIntensity;
      data[i] += n;
      data[i + 1] += n;
      data[i + 2] += n;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  ctx.restore();
}

// --------------------------------------------------
// 8. Render frame principal
// --------------------------------------------------
export function renderVisual(audioData, timestamp) {
  if (!hasStarted || !canvas || !ctx) return;

  if (canvasWidth === 0 || canvasHeight === 0) {
    resizeCanvas();
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const spectrum = audioData?.spectrum || null;
  const bands = extractBandsFromSpectrum(spectrum);
  pushHistory(bands.bass, bands.mid, bands.treble);

  const audioInfo = {
    bands,
    waveform: audioData?.waveform || null,
    spectrum,
  };

  if (!currentModeConfig) {
    const defaultMode = MODES.find((m) => m.id === currentModeId) || MODES[0];
    currentModeConfig = defaultMode;
  }

  switch (currentModeId) {
    case "mist":
      renderMist(audioInfo, timestamp);
      break;
    case "pillars":
      renderPillars(audioInfo, timestamp);
      break;
    case "horizon":
      renderHorizon(audioInfo, timestamp);
      break;
    default:
      renderMist(audioInfo, timestamp);
      break;
  }
}