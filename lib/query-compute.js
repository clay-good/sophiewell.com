// answer-shaped-results task 3.1-3.2: pure inline-compute parser. When a hero
// query already carries everything a small, high-frequency, unambiguous compute
// needs ("bmi 180 lb 5'10", "map 120/80"), answer with the number instead of a
// link. No DOM, no fetch, no AI -- just number+unit parsing over an allow-list,
// reusing the tile's own lib compute so the inline value matches the tile.
//
// queryCompute(query) -> { tile, label, value, text, unit, inputs } | null
//   tile   the target tile id (for routing / prefill)
//   value  the primary numeric result (as the lib returns it)
//   text   a display string ("25.8 (Overweight)")
//   inputs the tile's field-keyed inputs, in the tile's canonical units, ready
//          for hash-state prefill (rendering + routing land in tasks 3.3-3.4)
// A template with any missing or ambiguous field returns null -- it never
// guesses; the caller falls back to normal routing.

import { bmi, bsaDuBois, bsaMosteller, map } from './clinical.js';

const LB_TO_KG = 0.45359237;
const IN_TO_M = 0.0254;

function round(x, n) {
  const f = 10 ** n;
  return Math.round(x * f) / f;
}

// A mass with an explicit unit: "180 lb", "180lbs", "82 kg", "82 kilograms".
// Bare numbers are rejected (a mass without a unit is ambiguous).
function parseMassKg(q) {
  const m = q.match(/(\d+(?:\.\d+)?)\s*(kg|kilograms?|kilos?|lbs?|pounds?)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return /^(kg|kilo)/.test(m[2]) ? n : n * LB_TO_KG;
}

// A height, returned in meters. Accepts feet-inches ("5'10", "5 ft 10 in",
// "5'10\""), feet only ("5 ft", "5'"), inches ("70 in", "70\""), centimeters
// ("178 cm"), or meters ("1.78 m"). Bare numbers are rejected.
function parseHeightM(q) {
  // feet-inches, apostrophe form: 5'10  5’10  5' 10"
  let m = q.match(/(\d+)\s*['’]\s*(\d+(?:\.\d+)?)\s*(?:"|''|in\b|inch\b|inches\b)?/);
  if (m) return round((Number(m[1]) * 12 + Number(m[2])) * IN_TO_M, 4);
  // feet-inches, word form: 5 ft 10 in / 5 feet 10
  m = q.match(/(\d+)\s*(?:ft|feet)\b\s*(\d+(?:\.\d+)?)\s*(?:in\b|inch\b|inches\b)?/);
  if (m) return round((Number(m[1]) * 12 + Number(m[2])) * IN_TO_M, 4);
  // feet only: 5 ft / 5'
  m = q.match(/(\d+(?:\.\d+)?)\s*(?:ft\b|feet\b|['’])(?!\s*\d)/);
  if (m) return round(Number(m[1]) * 12 * IN_TO_M, 4);
  // inches: 70 in / 70"
  m = q.match(/(\d+(?:\.\d+)?)\s*(?:"|in\b|inch\b|inches\b)/);
  if (m) return round(Number(m[1]) * IN_TO_M, 4);
  // centimeters: 178 cm
  m = q.match(/(\d+(?:\.\d+)?)\s*cm\b/);
  if (m) return round(Number(m[1]) / 100, 4);
  // meters: 1.78 m
  m = q.match(/(\d+(?:\.\d+)?)\s*m\b/);
  if (m) {
    const v = Number(m[1]);
    if (v > 0.3 && v < 3) return round(v, 4);
  }
  return null;
}

// A blood-pressure pair "120/80" -> { sbp, dbp } with a plausibility guard.
function parseBP(q) {
  const m = q.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!m) return null;
  const sbp = Number(m[1]);
  const dbp = Number(m[2]);
  if (!(sbp > dbp && sbp >= 40 && sbp <= 300 && dbp >= 20 && dbp <= 200)) return null;
  return { sbp, dbp };
}

const TEMPLATES = [
  {
    triggers: ['bmi', 'body mass index'],
    parse(q) {
      const kg = parseMassKg(q);
      const hM = parseHeightM(q);
      if (kg == null || hM == null) return null;
      let r;
      try { r = bmi({ weightKg: kg, heightM: hM }); } catch { return null; }
      return {
        tile: 'bmi', label: 'BMI', value: r.bmi, text: `${r.bmi} (${r.category})`,
        unit: 'kg/m^2', inputs: { w: round(kg, 2), h: round(hM, 3) },
      };
    },
  },
  {
    triggers: ['bsa', 'body surface area'],
    parse(q) {
      const kg = parseMassKg(q);
      const hM = parseHeightM(q);
      if (kg == null || hM == null) return null;
      const heightCm = round(hM * 100, 1);
      let du;
      let mo;
      try {
        du = bsaDuBois({ weightKg: kg, heightCm });
        mo = bsaMosteller({ weightKg: kg, heightCm });
      } catch { return null; }
      return {
        tile: 'bsa', label: 'BSA', value: du, text: `Du Bois ${du} m^2; Mosteller ${mo} m^2`,
        unit: 'm^2', inputs: { w: round(kg, 2), h: heightCm },
      };
    },
  },
  {
    triggers: ['map', 'mean arterial'],
    parse(q) {
      const bp = parseBP(q);
      if (!bp) return null;
      let v;
      try { v = map({ sbp: bp.sbp, dbp: bp.dbp }); } catch { return null; }
      return {
        tile: 'map', label: 'MAP', value: v, text: `${v} mmHg`,
        unit: 'mmHg', inputs: { s: bp.sbp, d: bp.dbp },
      };
    },
  },
];

export function queryCompute(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return null;
  for (const t of TEMPLATES) {
    if (!t.triggers.some((tr) => q.includes(tr))) continue;
    const r = t.parse(q);
    if (r) return r;
  }
  return null;
}

export const _testing = { parseMassKg, parseHeightM, parseBP, TEMPLATES };
