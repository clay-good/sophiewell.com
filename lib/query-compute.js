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

import {
  bmi, bsaDuBois, bsaMosteller, map, anionGap, correctedCalcium, correctedSodium, cockcroftGault,
} from './clinical.js';
import { ibwDevine } from './clinical-v4.js';

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

// A named lab value: "na 140", "sodium 140", "hco3: 24", "albumin=4". `names` is
// a regex alternation (longest names first). Returns the number or null.
function parseAnalyte(q, names) {
  const m = q.match(new RegExp(`\\b(?:${names})\\b\\s*[:=]?\\s*(\\d+(?:\\.\\d+)?)`));
  return m ? Number(m[1]) : null;
}

// Age in years: "age 60", "60 yo", "60 year old". Returns null if absent.
function parseAge(q) {
  const named = parseAnalyte(q, 'age');
  if (named != null) return named;
  const m = q.match(/(\d+)\s*(?:yo|y\/o|yrs?|years?\s*old|year old)\b/);
  return m ? Number(m[1]) : null;
}

// Biological sex for sex-specific formulas: 'M' | 'F' | null. Requires an
// explicit word ("male"/"female"/"man"/"woman"); a bare "m"/"f" is too ambiguous
// in free text. Check female before male ("female" contains "male").
function parseSex(q) {
  if (/\b(?:female|woman|women)\b/.test(q)) return 'F';
  if (/\b(?:male|man|men)\b/.test(q)) return 'M';
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
  {
    triggers: ['anion gap'],
    parse(q) {
      const na = parseAnalyte(q, 'sodium|na');
      const cl = parseAnalyte(q, 'chloride|cl');
      const hco3 = parseAnalyte(q, 'bicarbonate|bicarb|hco3|tco2|co2');
      if (na == null || cl == null || hco3 == null) return null;
      const alb = parseAnalyte(q, 'albumin|alb');
      let r;
      try { r = anionGap({ sodium: na, chloride: cl, bicarbonate: hco3, albuminGdl: alb ?? undefined }); } catch { return null; }
      const inputs = { na, cl, hco3 };
      if (alb != null) inputs.alb = alb;
      const text = r.correctedAnionGap != null
        ? `AG ${r.anionGap}; albumin-corrected ${r.correctedAnionGap}`
        : `AG ${r.anionGap}`;
      return { tile: 'anion-gap', label: 'Anion gap', value: r.anionGap, text, unit: 'mmol/L', inputs };
    },
  },
  {
    triggers: ['corrected calcium', 'calcium correction'],
    parse(q) {
      const ca = parseAnalyte(q, 'calcium|ca');
      const alb = parseAnalyte(q, 'albumin|alb');
      if (ca == null || alb == null) return null;
      let v;
      try { v = correctedCalcium({ measuredCa: ca, albuminGdl: alb }); } catch { return null; }
      return {
        tile: 'corrected-calcium', label: 'Corrected calcium', value: v, text: `${v} mg/dL (corrected)`,
        unit: 'mg/dL', inputs: { ca, alb },
      };
    },
  },
  {
    triggers: ['corrected sodium', 'sodium for glucose', 'sodium for hyperglycemia'],
    parse(q) {
      const na = parseAnalyte(q, 'sodium|na');
      const glucose = parseAnalyte(q, 'glucose|glu|bg|sugar');
      if (na == null || glucose == null) return null;
      let r;
      try { r = correctedSodium({ measuredNa: na, glucose }); } catch { return null; }
      return {
        tile: 'corrected-sodium', label: 'Corrected sodium', value: r.naBy1_6,
        text: `${r.naBy1_6} (1.6x); ${r.naBy2_4} (2.4x)`, unit: 'mmol/L', inputs: { na, g: glucose },
      };
    },
  },
  {
    triggers: ['ideal body weight', 'ibw'],
    parse(q) {
      const hM = parseHeightM(q);
      const sex = parseSex(q);
      if (hM == null || !sex) return null;
      const heightInches = round(hM / IN_TO_M, 1);
      let v;
      try { v = ibwDevine({ heightInches, sex }); } catch { return null; }
      v = round(v, 1);
      return {
        tile: 'bw-bsa-suite', label: 'Ideal body weight', value: v, text: `${v} kg (Devine)`,
        unit: 'kg', inputs: { 'bw-hin': heightInches, 'bw-sex': sex },
      };
    },
  },
  {
    triggers: ['creatinine clearance', 'cockcroft', 'crcl'],
    parse(q) {
      const age = parseAge(q);
      const weightKg = parseMassKg(q);
      const scr = parseAnalyte(q, 'creatinine|scr|cr');
      const sex = parseSex(q);
      if (age == null || weightKg == null || scr == null || !sex) return null;
      let v;
      try { v = cockcroftGault({ age, weightKg, scr, sex }); } catch { return null; }
      if (!Number.isFinite(v)) return null;
      return {
        tile: 'cockcroft-gault', label: 'CrCl', value: v, text: `${v} mL/min (Cockcroft-Gault)`,
        unit: 'mL/min', inputs: { age, w: round(weightKg, 2), scr, sex },
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

export const _testing = { parseMassKg, parseHeightM, parseBP, parseAnalyte, TEMPLATES };
