// The field-to-envelope map for lib/bounds.js, shared by the finder that drives each field past
// its envelope through the agent surface (scripts/probe-envelope-unbounded.mjs) and the page-side
// test that does the same in the browser (test/integration/envelope-refused-on-page.spec.js).
// One map, so the two surfaces cannot disagree about which field holds which quantity.

import { allCalculators } from '../../mcp/catalog.js';
import { BOUNDS } from '../../lib/bounds.js';
import { META } from '../../lib/meta.js';

// A quantity in another compartment, another substance, or a derived figure is
// not the envelope's subject. Each term here was earned: the three at the front
// by the self-check below, the rest by reading the labels they exclude.
export const EXCLUDE = /\bair\b|additive|ambient|outdoor|wind|room |bag |infusate|\burine|urinary|csf|cerebrospinal|dialysate|drain|ascit|pleural|stool|saliva|sweat|24-?h|fractional|excret|clearance|ratio|same unit|delta|change|target|goal|desired|corrected|expected|predicted|per kg|dose|rate|infusion/i;

// label pattern, and the unit that confirms the quantity is in the envelope's
// own unit rather than a convertible one.
export const MAP = [
  ['scr', /\b(serum )?creatinine\b/i, /mg\/dL/i],
  ['sodium', /\bsodium\b|\bNa\b/i, /mmol\/L|mEq\/L/i],
  ['potassium', /\bpotassium\b|\bK\+?\b/i, /mmol\/L|mEq\/L/i],
  ['bicarbonate', /bicarbonate|HCO3/i, /mmol\/L|mEq\/L/i],
  ['albumin', /\balbumin\b/i, /g\/dL/i],
  ['bilirubin', /bilirubin/i, /mg\/dL/i],
  ['hemoglobin', /h(a)?emoglobin|\bHb\b/i, /g\/dL/i],
  ['hematocrit', /h(a)?ematocrit|\bHct\b/i, /%/],
  ['lactate', /\blactate\b/i, /mmol\/L/i],
  ['glucose', /\bglucose\b/i, /mg\/dL/i],
  ['paO2', /PaO2|arterial oxygen tension/i, /mmHg/i],
  ['paCO2', /PaCO2/i, /mmHg/i],
  ['pH', /\bpH\b/i, /^$|arterial/i],
  ['hr', /heart rate|pulse/i, /bpm|beats/i],
  ['sbp', /systolic/i, /mmHg/i],
  ['dbp', /diastolic/i, /mmHg/i],
  ['temperature', /temperature/i, /°?C\b|celsius/i],
  ['rr', /respiratory rate/i, /\/min|breaths/i],
  ['platelets', /platelet/i, /10\^?9|10⁹|10\^?3|10³|thousand/i],
  ['wbc', /white (cell|blood)|\bWBC\b|leu[ck]ocyte/i, /10\^?9|10⁹|10\^?3|10³|thousand/i],
  // spec-v1404: weight was never mapped, and 29 fields answered from a 5,000 kg weight or asked
  // for one that had been typed. The unit must be kg exactly: a lb field is converted first.
  ['weightKg', /\bweight\b/i, /^kg$/i],
  // Height is entered in cm and the envelope is in metres, so it carries a scale of 100. A bare
  // "length" is an organ or a fetal bone (its first run mis-mapped five), so only crown-heel counts.
  ['heightM', /\bheight\b|\bstature\b|crown.heel/i, /^cm$/i, 100],
  // spec-v1406: the rest of lib/bounds.js. Element symbols (Mg, Ca, Cl) are left out on purpose:
  // matched case-insensitively against "label unit", \bMg\b is the "mg" in every "mg/dL".
  ['ageYears', /\bage\b/i, /^(yr|yrs|years?)$/i],
  ['qtMs', /\bQTc?\b|QT interval/i, /^ms$/i],
  ['chloride', /chloride/i, /mmol\/L|mEq\/L/i],
  ['calcium', /calcium/i, /mg\/dL/i],
  ['magnesium', /magnesium/i, /mg\/dL/i],
  ['phosphate', /phosph/i, /mg\/dL/i],
  ['inr', /\bINR\b/i, /^$|INR/i],
  ['fio2', /FiO2|FiO₂|inspired oxygen/i, /fraction/i],
  ['fio2', /FiO2|FiO₂|inspired oxygen/i, /^%$/i, 100],
  ['bun', /\bBUN\b|urea nitrogen/i, /mg\/dL/i],
  ['eGFR', /eGFR|\bGFR\b/i, /mL\/min/i],
  ['bmi', /\bBMI\b|body mass index/i, /kg\/m/i],
];

// Tools whose "Height" or "Length" is an organ's dimension, labelled with the bare word.
export const NOT_A_BODY = new Set(['testicular-volume']);

export function candidates({ onlyKey = null } = {}) {
  const rows = [];
  for (const tool of allCalculators()) {
    if (NOT_A_BODY.has(tool.id)) continue;
    for (const f of (tool.fields || [])) {
      if (f.kind !== 'number' || Array.isArray(f.values)) continue;
      const text = `${f.label || ''} ${f.unit || ''}`;
      if (EXCLUDE.test(text)) continue;
      for (const [key, labRe, unitRe, scale = 1] of MAP) {
        if (onlyKey && key !== onlyKey) continue;
        if (labRe.test(text) && unitRe.test(String(f.unit || ''))) {
          rows.push({
            id: tool.id, dom: f.dom, key, scale,
            label: String(f.label || '').slice(0, 44), unit: f.unit,
            ex: META[tool.id]?.example?.fields?.[f.dom],
          });
          break;
        }
      }
    }
  }
  return rows;
}

// The envelope in the FIELD's unit: `scale` converts the envelope's unit to the field's (a height
// entered in cm against the metre envelope is 100). Every use below goes through this.
export function envelope(r) {
  const b = BOUNDS[r.key];
  return { min: b.min * r.scale, max: b.max * r.scale, unit: b.unit };
}
