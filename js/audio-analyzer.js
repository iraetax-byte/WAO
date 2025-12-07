// js/audio-analyzer.js
// WÃO JOÃO – Audio analyser for <audio> element
// ---------------------------------------------
// API pública esperada por main.js:
//   initAudioAnalyzer(audioElement)
//   getAudioData()
//
// Devuelve:
// {
//   low, mid, high, energy,        // bandas 0..1
//   bpm, bpmConfidence,            // placeholders por ahora
//   clipping,                      // placeholder
//   spectrum: Float32Array|null,   // N bins 0..1 (p.ej. 96)
//   waveform: Float32Array|null    // forma de onda [-1..1]
// }

let audioCtx = null;
let analyser = null;
let sourceNode = null;

let freqData = null;
let timeData = null;

// Buffers reusables para no generar basura en cada frame
const NUM_BANDS = 96;
let spectrumBuf = new Float32Array(NUM_BANDS);
let waveformBuf = new Float32Array(256);

// FFT y ajustes del analizador
const FFT_SIZE = 2048;
const MIN_DB = -90;
const MAX_DB = -10;
const SMOOTHING = 0.8;

// Suavizado de bandas
let lowSm = 0;
let midSm = 0;
let highSm = 0;
let energySm = 0;

const DEFAULT_DATA = Object.freeze({
  low: 0,
  mid: 0,
  high: 0,
  energy: 0,
  bpm: null,
  bpmConfidence: 0,
  clipping: false,
  spectrum: null,
  waveform: null
});

function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

// ---------------------------------------------
// initAudioAnalyzer(audioElement)
// ---------------------------------------------
export function initAudioAnalyzer(audioElement) {
  if (!audioElement) return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    console.warn("[WÃO] WebAudio no soportado, visuales en modo stub.");
    return;
  }

  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }

  if (!analyser) {
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.minDecibels = MIN_DB;
    analyser.maxDecibels = MAX_DB;
    analyser.smoothingTimeConstant = SMOOTHING;

    freqData = new Uint8Array(analyser.frequencyBinCount);
    timeData = new Uint8Array(analyser.fftSize);
  }

  try {
    // Si ya había un sourceNode (otro <audio>), lo desconectamos
    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch (e) {
        // por si acaso
      }
    }

    // Conectar el <audio> al grafo de audio
    sourceNode = audioCtx.createMediaElementSource(audioElement);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch (err) {
    // En algunos navegadores sólo puedes crear una vez el MediaElementSource
    console.warn("[WÃO] Error al crear MediaElementSource:", err);
  }

  // Aseguramos que el contexto se reanuda en el primer play (gesto de usuario)
  audioElement.addEventListener(
    "play",
    () => {
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch((err) => {
          console.warn("[WÃO] Error al reanudar AudioContext:", err);
        });
      }
    },
    { once: true }
  );
}

// ---------------------------------------------
// getAudioData()
// ---------------------------------------------
export function getAudioData() {
  if (!audioCtx || !analyser || !freqData || !timeData) {
    return DEFAULT_DATA;
  }

  // Rellenamos los buffers
  analyser.getByteFrequencyData(freqData);
  analyser.getByteTimeDomainData(timeData);

  const n = freqData.length;
  if (!n) return DEFAULT_DATA;

  // Repartimos en bandas: graves / medios / agudos (aprox por porcentaje de bins)
  const iLowEnd = Math.floor(n * 0.15);  // ~0–15% graves
  const iMidEnd = Math.floor(n * 0.55);  // ~15–55% medios

  let sumLow = 0;
  let sumMid = 0;
  let sumHigh = 0;
  let countLow = 0;
  let countMid = 0;
  let countHigh = 0;
  let sumAll = 0;

  for (let i = 0; i < n; i++) {
    const v = freqData[i] / 255; // 0..1
    sumAll += v;

    if (i < iLowEnd) {
      sumLow += v;
      countLow++;
    } else if (i < iMidEnd) {
      sumMid += v;
      countMid++;
    } else {
      sumHigh += v;
      countHigh++;
    }
  }

  const lowRaw = countLow ? sumLow / countLow : 0;
  const midRaw = countMid ? sumMid / countMid : 0;
  const highRaw = countHigh ? sumHigh / countHigh : 0;
  const energyRaw = sumAll / n;

  // Suavizado simple (one-pole)
  const SMOOTH = 0.35;
  lowSm += (lowRaw - lowSm) * SMOOTH;
  midSm += (midRaw - midSm) * SMOOTH;
  highSm += (highRaw - highSm) * SMOOTH;
  energySm += (energyRaw - energySm) * SMOOTH;

  const low = clamp01(lowSm);
  const mid = clamp01(midSm);
  const high = clamp01(highSm);
  const energy = clamp01(energySm);

  // Espectro reducido a NUM_BANDS bandas (máximo en cada banda)
  const bands = spectrumBuf;
  const binsPerBand = n / NUM_BANDS;

  for (let b = 0; b < NUM_BANDS; b++) {
    const start = Math.floor(b * binsPerBand);
    const end = Math.min(n, Math.floor((b + 1) * binsPerBand));
    let max = 0;
    for (let i = start; i < end; i++) {
      const v = freqData[i] / 255;
      if (v > max) max = v;
    }
    bands[b] = clamp01(max);
  }

  // Waveform reducido (muestra cada "step")
  const wLen = waveformBuf.length;
  const step = Math.floor(timeData.length / wLen) || 1;
  for (let i = 0; i < wLen; i++) {
    const sample = timeData[i * step] / 128 - 1; // 0..255 -> -1..1
    waveformBuf[i] = sample;
  }

  // Por ahora BPM / clipping son placeholders
  return {
    low,
    mid,
    high,
    energy,
    bpm: null,
    bpmConfidence: 0,
    clipping: false,
    spectrum: bands,
    waveform: waveformBuf
  };
}