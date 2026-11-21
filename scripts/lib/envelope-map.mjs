// The field-to-envelope map for lib/bounds.js, shared by the finder that drives each field past
// its envelope through the agent surface (scripts/probe-envelope-unbounded.mjs) and the page-side
// test that does the same in the browser (test/integration/envelope-refused-on-page.spec.js).
// One map, so the two surfaces cannot disagree about which field holds which quantity.

import { allCalculators } from '../../mcp/catalog.js';
import { BOUNDS } from '../../lib/bounds.js';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';

// A quantity in another compartment, another substance, or a derived figure is
// not the envelope's subject. Each term here was earned: the three at the front
// by the self-check below, the rest by reading the labels they exclude.
// spec-v1742: a bare `rate` term excluded every HEART rate and RESPIRATORY rate field (and ESR) along with the
// infusion and flow rates it was written for; the vital signs and the sedimentation rate are let through now.
// spec-v1743: an upper limit of normal is not the measurement.
// spec-v1752: `ratio` matched inside "satuRATIOn" and hid every oxygen-saturation field; SpO2 "on room air" is a
// blood saturation, not the air or room the `air` and `room` terms were written for.
export const EXCLUDE = /(?<!room )\bair\b|additive|ambient|outdoor|wind|room (?!air)|bag |infusate|\burine|urinary|csf|cerebrospinal|dialysate|drain|ascit|pleural|stool|saliva|sweat|24-?h|fractional|excret|clearance|\bratio\b|same unit|delta|change|target|goal|desired|corrected|expected|predicted|per kg|dose|(?<!heart |respiratory |breathing |pulse |sedimentation )\brate\b|infusion|upper limit|\bULN\b/i;

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
  // spec-v1742: ESR (spec-v1735's envelope), once the `rate` exclusion stopped hiding it.
  ['esr', /sedimentation rate|\bESR\b/i, /mm\s*\/?\s*h|mm per hour/i],
  // spec-v1743: spec-v1734's sourced envelopes were applied by hand and never mapped, so the finder and the page
  // test could not hold them. GCS is the TOTAL only: an eye, verbal or motor component is not on 3-15.
  ['triglycerides', /^(?!.*fibrinogen).*triglyceride/i, /mg\/dL/i],  // HLH-2004's fibrinogen label names triglycerides
  ['alt', /\bALT\b|alanine aminotransferase/i, /^U\/L$|IU\/L/i],
  ['ast', /\bAST\b|aspartate aminotransferase/i, /^U\/L$|IU\/L/i],
  // spec-v1747: base excess and base deficit (the same quantity with the sign turned).
  ['baseExcess', /base excess/i, /mmol\/L|mEq\/L/i],
  ['baseDeficit', /base deficit/i, /mmol\/L|mEq\/L/i],
  // spec-v1752: oxygen saturation in percent (SpO2, SaO2, ScvO2, SvO2).
  ['spo2', /\bSpO2\b|SpO₂|\bSaO2\b|SaO₂|\bS[cv]+O2\b|oxygen saturation|O2 saturation/i, /^%$|percent/i],
  ['gcs', /^(?!.*\b(eye|verbal|motor|component|pediatric|modified)\b).*(\bGCS\b|Glasgow Coma)/i, /^$|points|score|3.?15/i],
  // spec-v1735. ESR is not mapped: EXCLUDE drops every label with "rate" (sedimentation RATE);
  // its tools are pinned in test/unit/bounds-sourced-v1735.test.js instead.
  ['sixMinuteWalkM', /6-?minute walk|six-?minute walk|\b6MWD?\b/i, /^m$|met(er|re)s?/i],
  ['hcg', /\bhCG\b|chorionic gonadotropin/i, /mIU\/mL|IU\/L/i],
];

// Tools whose "Height" or "Length" is an organ's dimension, labelled with the bare word.
export const NOT_A_BODY = new Set(['testicular-volume']);
// spec-v1741: one field that takes EITHER of two quantities (a hematocrit in % or a hemoglobin in g/dL), so no
// single envelope is its own.
export const NOT_ONE_QUANTITY = new Set(['max-allowable-blood-loss']);
// Tools whose "pH" is a solution's or a compartment's (0 to 14), not arterial blood's.
export const NOT_BLOOD_PH = new Set(['percent-ionized']);
// spec-v1758: fields whose tool sets a wider range on purpose, with the reason. hypothermia-rewarm refuses
// potassium outside 0-30 mmol/L because its ECPR exclusion fires above 12 mmol/L (ERC 2021, Lott 2021);
// the serum envelope's 10 would make that branch unreachable.
export const OWN_RANGE = new Set(['hypothermia-rewarm|hyp-k']);

export function candidates({ onlyKey = null } = {}) {
  const rows = [];
  for (const tool of allCalculators()) {
    if (NOT_A_BODY.has(tool.id)) continue;
    if (NOT_ONE_QUANTITY.has(tool.id)) continue;
    for (const f of (tool.fields || [])) {
      if (f.kind !== 'number' || Array.isArray(f.values)) continue;
      // spec-v1741: some adapters carry the unit only in the label ("Heart rate (beats/min)"), and the unit test
      // below read an empty string, so every such field was invisible here (FGSI's nine vitals and labs). The
      // trailing parenthetical stands in for a missing unit.
      const unit = f.unit || ((String(f.label || '').match(/\(([^()]*)\)\s*$/) || [])[1] || '');
      const text = `${f.label || ''} ${unit}`;
      if (EXCLUDE.test(text)) continue;
      if (OWN_RANGE.has(`${tool.id}|${f.dom}`)) continue;
      for (const [key, labRe, unitRe, scale = 1] of MAP) {
        if (onlyKey && key !== onlyKey) continue;
        if (key === 'pH' && NOT_BLOOD_PH.has(tool.id)) continue;
        if (labRe.test(text) && unitRe.test(unit)) {
          rows.push({
            id: tool.id, dom: f.dom, key, scale,
            label: String(f.label || '').slice(0, 44), unit,
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

// spec-v1758: a value inside the envelope for a field the worked example leaves blank -- the first of a few the
// tool answers from -- or null when none does (the field conflicts with one the example fills, as kinetic-egfr's
// maximum creatinine rise does with its weight). The finder and the page test both drive only filled fields.
export function fillFor(r) {
  const ex = META[r.id]?.example?.fields;
  if (!ex) return null;
  const b = envelope(r);
  for (const at of [0.05, 0.2, 0.5, 0.01]) {
    const fill = String(Number((b.min + (b.max - b.min) * at).toPrecision(4)));
    if (computeCalculator({ id: r.id, inputs: { ...ex, [r.dom]: fill } }).valid !== false) return fill;
  }
  return null;
}
