// js/modes.js
// ------------------------------------------------------
// Definición de modos WÃO + modos especiales Milkdrop.
// Cada modo tiene:
//   - id        : identificador interno
//   - name      : nombre visible en la UI
//   - type      : "wao" (por defecto) o "milkdrop"
//   - presetKey : para modos milkdrop (clave usada en visual-milkdrop.js)
//   - params    : hasta 3 parámetros exclusivos del modo
//
// Los sliders de los modos milkdrop se desactivan en visual-milkdrop.js
// ------------------------------------------------------

export const MODES = [
  // --------------------------------------------------
  // --------------------------------------------------
  // MODOS MILKDROP EXCLUSIVOS (presets externos)
  // --------------------------------------------------
  {
    id: "md_royal197",
    name: "MD: Royal 197",
    type: "milkdrop",
    presetKey: "$$$ Royal - Mashup (197)",
    params: []
  },
  {
    id: "md_geiss_artifact",
    name: "MD: Geiss Artifact",
    type: "milkdrop",
    presetKey: "_Geiss - Artifact 01",
    params: []
  },
  {
    id: "md_desert_rose",
    name: "MD: Desert Rose",
    type: "milkdrop",
    presetKey: "_Geiss - Desert Rose 2",
    params: []
  },
  {
    id: "md_neverending_fire",
    name: "MD: Red Liquid Fire",
    type: "milkdrop",
    presetKey: "Cope - The Neverending Explosion of Red Liquid Fire",
    params: []
  },
  {
    id: "md_skylight",
    name: "MD: Skylight",
    type: "milkdrop",
    presetKey: "Eo.S. + Zylot - skylight (Stained Glass Majesty mix)",
    params: []
  },

  // --------------------------------------------------
  // MODOS WÃO NATIVOS
  // --------------------------------------------------

  // MIST – niebla suave, flotante
  {
    id: "mist",
    name: "Mist",
    type: "wao",
    params: [
      {
        id: "density",
        label: "Density",
        min: 0,
        max: 1,
        default: 0.5
      },
      {
        id: "diffusion",
        label: "Diffusion",
        min: 0,
        max: 1,
        default: 0.7
      },
      {
        id: "drift",
        label: "Drift",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  },

  // PILLARS – columnas verticales reactivas
  {
    id: "pillars",
    name: "Pillars",
    type: "wao",
    params: [
      {
        id: "thickness",
        label: "Thickness",
        min: 0,
        max: 1,
        default: 0.5
      },
      {
        id: "tension",
        label: "Tension",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "spread",
        label: "Spread",
        min: 0,
        max: 1,
        default: 0.4
      }
    ]
  },

  // HORIZON – línea de horizonte ondulante
  {
    id: "horizon",
    name: "Horizon",
    type: "wao",
    params: [
      {
        id: "curvature",
        label: "Curvature",
        min: 0,
        max: 1,
        default: 0.5
      },
      {
        id: "drift",
        label: "Drift",
        min: 0,
        max: 1,
        default: 0.4
      },
      {
        id: "depth",
        label: "Depth",
        min: 0,
        max: 1,
        default: 0.6
      }
    ]
  },

  // TERRA – placas y fracturas cálidas
  {
    id: "terra",
    name: "Terra",
    type: "wao",
    params: [
      {
        id: "fracture",
        label: "Fracture",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "weight",
        label: "Weight",
        min: 0,
        max: 1,
        default: 0.4
      },
      {
        id: "grain",
        label: "Grain",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  },

  // AQUA – líquido / agua
  {
    id: "aqua",
    name: "Aqua",
    type: "wao",
    params: [
      {
        id: "flow",
        label: "Flow",
        min: 0,
        max: 1,
        default: 0.5
      },
      {
        id: "wave",
        label: "Wave",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "foam",
        label: "Foam",
        min: 0,
        max: 1,
        default: 0.4
      }
    ]
  },

  // FLAME – llamas y ascenso
  {
    id: "flame",
    name: "Flame",
    type: "wao",
    params: [
      {
        id: "emission",
        label: "Emission",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "riseSpeed",
        label: "Rise Speed",
        min: 0,
        max: 1,
        default: 0.7
      },
      {
        id: "embers",
        label: "Embers",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  },

  // AURORA – cortinas de luz
  {
    id: "aurora",
    name: "Aurora",
    type: "wao",
    params: [
      {
        id: "bands",
        label: "Bands",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "fold",
        label: "Fold",
        min: 0,
        max: 1,
        default: 0.5
      },
      {
        id: "glow",
        label: "Glow",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  },

  // CRYSTAL – geometría cristalina
  {
    id: "crystal",
    name: "Crystal",
    type: "wao",
    params: [
      {
        id: "facets",
        label: "Facets",
        min: 0,
        max: 1,
        default: 0.7
      },
      {
        id: "cut",
        label: "Cut",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "sparkle",
        label: "Sparkle",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  },

  // GALAXY – campo de estrellas
  {
    id: "galaxy",
    name: "Galaxy",
    type: "wao",
    params: [
      {
        id: "field",
        label: "Field",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "twinkle",
        label: "Twinkle",
        min: 0,
        max: 1,
        default: 0.4
      },
      {
        id: "swirl",
        label: "Swirl",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  },

  // WIND – flujo / turbulencia de aire
  {
    id: "wind",
    name: "Wind",
    type: "wao",
    params: [
      {
        id: "gustStrength",
        label: "Gust",
        min: 0,
        max: 1,
        default: 0.5
      },
      {
        id: "turbulence",
        label: "Turbulence",
        min: 0,
        max: 1,
        default: 0.4
      },
      {
        id: "shear",
        label: "Shear",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  },

  // MIRAGE – distorsión / espejismo
  {
    id: "mirage",
    name: "Mirage",
    type: "wao",
    params: [
      {
        id: "distortion",
        label: "Distortion",
        min: 0,
        max: 1,
        default: 0.5
      },
      {
        id: "tremor",
        label: "Tremor",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "ghost",
        label: "Ghost",
        min: 0,
        max: 1,
        default: 0.4
      }
    ]
  },

  // LAVA – magma / viscosidad
  {
    id: "lava",
    name: "Lava",
    type: "wao",
    params: [
      {
        id: "viscosity",
        label: "Viscosity",
        min: 0,
        max: 1,
        default: 0.7
      },
      {
        id: "pressure",
        label: "Pressure",
        min: 0,
        max: 1,
        default: 0.6
      },
      {
        id: "splatter",
        label: "Splatter",
        min: 0,
        max: 1,
        default: 0.5
      }
    ]
  }
];

export default MODES;