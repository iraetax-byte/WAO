// js/config/globals.js
// 10 global parameters: 5 static, 5 dynamic

export const GLOBAL_PARAMS = [
  // STATIC: light & texture (do not depend on rhythm directly)
  {
    id: "glowWidth",
    label: "Glow Width",
    group: "static",
    min: 0,
    max: 1,
    default: 0.4,
    description: "Global halo softness around shapes."
  },
  {
    id: "creamTint",
    label: "Cream Tint",
    group: "static",
    min: 0,
    max: 1,
    default: 0.5,
    description: "Subtle shift within warm cream tones."
  },
  {
    id: "softGrain",
    label: "Soft Grain",
    group: "static",
    min: 0,
    max: 1,
    default: 0.25,
    description: "Analog film / dust texture amount."
  },
  {
    id: "softBend",
    label: "Soft Bend",
    group: "static",
    min: 0,
    max: 1,
    default: 0.5,
    description: "Elasticity of shapes, rigid vs organic."
  },
  {
    id: "contrastVeil",
    label: "Contrast Veil",
    group: "static",
    min: 0,
    max: 1,
    default: 0.45,
    description: "Warm contrast wash to calm the image."
  },

  // DYNAMIC: movement & energy (audio/BPM reactive)
  {
    id: "pulseDepth",
    label: "Pulse Depth",
    group: "dynamic",
    min: 0,
    max: 1,
    default: 0.6,
    description: "Strength of energy-based pulsing."
  },
  {
    id: "rippleMagnitude",
    label: "Ripple Magnitude",
    group: "dynamic",
    min: 0,
    max: 1,
    default: 0.5,
    description: "Circular ripples from center, driven by lows."
  },
  {
    id: "heatRipple",
    label: "Heat Ripple",
    group: "dynamic",
    min: 0,
    max: 1,
    default: 0.4,
    description: "Subtle heat-like distortion linked to energy."
  },
  {
    id: "dustTrails",
    label: "Dust Trails",
    group: "dynamic",
    min: 0,
    max: 1,
    default: 0.35,
    description: "Persistence and trails of movement."
  },
  {
    id: "bpmLock",
    label: "BPM Lock",
    group: "dynamic",
    min: 0,
    max: 1,
    default: 0.5,
    description: "Strength of BPM-based sync (with neutral marker)."
  }
];

/**
 * Convenience helpers:
 */

export const STATIC_GLOBALS = GLOBAL_PARAMS.filter(p => p.group === "static");
export const DYNAMIC_GLOBALS = GLOBAL_PARAMS.filter(p => p.group === "dynamic");