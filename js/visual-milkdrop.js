// visual-milkdrop.js
// Integración de Butterchurn (Milkdrop-like) para WÃO

let milkdropVisualizer = null;
let milkdropRunning = false;
let milkdropAnalyser = null;
let milkdropAudioContext = null;

// Inicializa Butterchurn sobre el canvas y el audio element
export function initMilkdrop(canvasEl, audioEl) {
  try {
    // Compatibilidad con distintas formas de exponer butterchurn en window
    const butter = window.butterchurn?.default || window.butterchurn;

    if (!butter) {
      console.error("[WÃO] Butterchurn no está disponible en window.butterchurn.");
      return;
    }

    if (typeof butter.createVisualizer !== "function") {
      console.error(
        "[WÃO] butterchurn.createVisualizer no es una función. Objeto recibido:",
        butter
      );
      return;
    }

    // 1) Intentar SIEMPRE reutilizar el contexto/nodos globales de WÃO
    let audioCtx = window.waoAudioContext || window.audioContext || null;
    let globalAnalyser = window.waoAnalyserNode || window.waoAnalyser || null;

    if (audioCtx && globalAnalyser) {
      // Usamos directamente el analyser global; no creamos otro
      milkdropAudioContext = audioCtx;
      milkdropAnalyser = globalAnalyser;

      milkdropVisualizer = butter.createVisualizer(audioCtx, canvasEl, {
        width: canvasEl.width,
        height: canvasEl.height,
        pixelRatio: window.devicePixelRatio || 1,
      });

      if (typeof milkdropVisualizer.connectAudio === "function") {
        milkdropVisualizer.connectAudio(milkdropAnalyser);
      } else {
        console.warn(
          "[WÃO] milkdropVisualizer.connectAudio no está disponible. Revisa versión de Butterchurn."
        );
      }

      milkdropRunning = true;
      console.log("[WÃO] Butterchurn inicializado reutilizando analyser global.");
      return;
    }

    // 2) Si NO hay contexto/analyser global, plan B: crear uno local
    console.warn(
      "[WÃO] No hay analyser global disponible; creando AudioContext local para Butterchurn."
    );

    // Intentamos usar el AudioContext global de WÃO si existe, o creamos uno nuevo
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        console.error("[WÃO] AudioContext no soportado en este navegador.");
        return;
      }
      audioCtx = new AC();
      console.log("[WÃO] Creado AudioContext local para Butterchurn.");
    }

    if (!audioEl) {
      audioEl = document.getElementById("audio-element");
    }

    if (!audioEl) {
      console.error("[WÃO] No se pudo crear sourceNode: audioEl es null.");
      return;
    }

    let sourceNode = null;

    try {
      sourceNode = audioCtx.createMediaElementSource(audioEl);
      console.log("[WÃO] Creado MediaElementSource local para Butterchurn.");
    } catch (e) {
      console.error(
        "[WÃO] Error creando MediaElementSource: el <audio> ya está asociado a otro MediaElementSource en este AudioContext.",
        e
      );
      console.error(
        "[WÃO] Solución recomendada: expón analyser y sourceNode globales (window.waoAudioContext, window.waoAnalyserNode, window.waoSourceNode) "+
        "desde tu pipeline principal y deja que Butterchurn los reutilice."
      );
      return;
    }

    milkdropAudioContext = audioCtx;

    // Analyser específico para Butterchurn
    milkdropAnalyser = audioCtx.createAnalyser();
    milkdropAnalyser.fftSize = 2048;

    // Conexión: source -> analyser -> destino
    sourceNode.connect(milkdropAnalyser);
    if (audioCtx.destination) {
      milkdropAnalyser.connect(audioCtx.destination);
    }

    // Creamos el visualizador
    milkdropVisualizer = butter.createVisualizer(audioCtx, canvasEl, {
      width: canvasEl.width,
      height: canvasEl.height,
      pixelRatio: window.devicePixelRatio || 1,
    });

    // Conectamos el analyser al visualizador
    if (typeof milkdropVisualizer.connectAudio === "function") {
      milkdropVisualizer.connectAudio(milkdropAnalyser);
    } else {
      console.warn(
        "[WÃO] milkdropVisualizer.connectAudio no está disponible. Revisa versión de Butterchurn."
      );
    }

    milkdropRunning = true;

    console.log("[WÃO] Butterchurn inicializado correctamente (contexto local).");
  } catch (err) {
    console.error("[WÃO] Error inicializando Butterchurn:", err);
  }
}

// Detiene/destruye el visualizador Butterchurn
export function stopMilkdrop() {
  if (milkdropVisualizer && milkdropRunning) {
    try {
      if (typeof milkdropVisualizer.destroy === "function") {
        milkdropVisualizer.destroy();
      }
    } catch (e) {
      console.warn("[WÃO] Error al destruir visualizador Butterchurn:", e);
    }
  }

  milkdropVisualizer = null;
  milkdropRunning = false;
  milkdropAnalyser = null;
  // No destruimos el AudioContext global para no romper el resto de la app

  console.log("[WÃO] Butterchurn detenido.");
}

// Carga un preset por clave
export function loadMilkdropPreset(presetKey) {
  if (!milkdropVisualizer) {
    console.warn("[WÃO] No hay visualizador Butterchurn activo para cargar preset.");
    return;
  }

  try {
    // Buscamos en varios sitios posibles
    const groupPresets =
      window.butterchurnPresets?.classic ||
      window.butterchurnPresets?.default ||
      window.butterchurnPresets?.community ||
      null;

    const fromGlobalMap = window.waoMilkdropPresets?.[presetKey];
    const fromGroup = groupPresets ? groupPresets[presetKey] : null;

    const preset = fromGlobalMap || fromGroup;

    if (!preset) {
      console.warn(
        "[WÃO] No se encontró preset Milkdrop con key:",
        presetKey,
        "en waoMilkdropPresets ni butterchurnPresets."
      );
      return;
    }

    milkdropVisualizer.loadPreset(preset, 1.0);
    console.log("[WÃO] Preset Milkdrop cargado:", presetKey);
  } catch (e) {
    console.error("[WÃO] Error cargando preset Milkdrop:", e);
  }
}

// Llamar cuando cambie el tamaño del canvas
export function resizeMilkdrop(width, height) {
  if (!milkdropVisualizer) return;

  try {
    milkdropVisualizer.setSize(width, height);
  } catch (e) {
    console.warn("[WÃO] Error redimensionando visualizador Butterchurn:", e);
  }
}

// Indica si el motor Milkdrop está activo
export function isMilkdropActive() {
  return milkdropRunning;
}

// Renderiza un frame de Butterchurn (se llama desde el loop principal)
export function renderMilkdropFrame() {
  if (!milkdropVisualizer || !milkdropRunning) return;

  try {
    // Butterchurn normalmente sólo necesita un render() por frame
    milkdropVisualizer.render();
  } catch (e) {
    console.warn("[WÃO] Error renderizando frame de Butterchurn:", e);
  }
}