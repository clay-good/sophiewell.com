// spec-v61 §2 A4: shared per-field unit-toggle helpers.
//
// A numeric input gains an adjacent unit <select>; each option carries a
// `toCanonical` converter (driven by lib/unit-convert.js), and unitNum(id)
// returns the value already converted to the unit the compute function
// expects — so no compute path changes. US bedside charts enter weight in lb;
// SI labs report creatinine in µmol/L. The first option is always the
// canonical unit (identity converter). An entry tagged `default: true` is the
// unit pre-selected at render — the US-customary happy path (lb, in, °F) —
// while applyExample (app.js) resets an example-filled field's select back to
// the canonical option 0, so every META.example and deep-link hash still
// reproduces a calculation byte-identically. The <select> rides the existing
// input/change listeners and the trackHashState/input-persist machinery for
// free, and the .unit-field-row CSS wraps so the pair never forces horizontal
// scroll on a narrow phone.
//
// Pure DOM — no innerHTML, no third-party deps.

import { el } from './dom.js';
import { lbToKg, labConvert, fToC, inchesToCm } from './unit-convert.js';

// Weight: canonical kg; the US-bedside lb alternate is pre-selected
// (spec-v283: US customary is the happy path, metric one click away).
export const WEIGHT_UNITS = [
  { unit: 'kg', toCanonical: (v) => v },
  { unit: 'lb', toCanonical: lbToKg, default: true },
];

// spec-v184 §4.4: Height — canonical cm, with the US-customary inch alternate
// pre-selected (spec-v283). Canonical (cm) stays first so every META.example
// and deep-link hash reproduces byte-identically.
export const HEIGHT_UNITS = [
  { unit: 'cm', toCanonical: (v) => v },
  { unit: 'in', toCanonical: inchesToCm, default: true },
];

// spec-v184 §4.3: Temperature — canonical °C, with the US-bedside °F alternate
// pre-selected (spec-v283). A US nurse charts Tmax in °F; unitNum() still
// returns °C to the compute path.
export const TEMP_UNITS = [
  { unit: '°C', toCanonical: (v) => v },
  { unit: '°F', toCanonical: fToC, default: true },
];

// spec-v62 §2 A4: SI<->conventional lab-input toggles. The first (default)
// option is always the conventional US unit the compute function already
// expects, so every META.example and deep-link hash reproduces byte-identically;
// the SI option converts the entered value back to that canonical unit via
// labConvert(kind, v, 'fromSi'). One array per analyte, reused across tiles.
const siToConventional = (kind) => (v) => labConvert(kind, v, 'fromSi');

export const GLUCOSE_UNITS = [
  { unit: 'mg/dL', toCanonical: (v) => v },
  { unit: 'mmol/L', toCanonical: siToConventional('glucose') },
];
export const BUN_UNITS = [
  { unit: 'mg/dL', toCanonical: (v) => v },
  { unit: 'mmol/L', toCanonical: siToConventional('bun') },
];
export const CALCIUM_UNITS = [
  { unit: 'mg/dL', toCanonical: (v) => v },
  { unit: 'mmol/L', toCanonical: siToConventional('calcium') },
];
export const ALBUMIN_UNITS = [
  { unit: 'g/dL', toCanonical: (v) => v },
  { unit: 'g/L', toCanonical: siToConventional('albumin') },
];
export const HEMOGLOBIN_UNITS = [
  { unit: 'g/dL', toCanonical: (v) => v },
  { unit: 'g/L', toCanonical: siToConventional('hemoglobin') },
];
export const MAGNESIUM_UNITS = [
  { unit: 'mg/dL', toCanonical: (v) => v },
  { unit: 'mmol/L', toCanonical: siToConventional('magnesium') },
];
export const BILIRUBIN_UNITS = [
  { unit: 'mg/dL', toCanonical: (v) => v },
  { unit: 'umol/L', toCanonical: siToConventional('bilirubin') },
];
// Lactate and the CRRT ionised/total-calcium fields take the SI unit (mmol/L)
// as the compute/canonical unit, so here the DEFAULT (identity) option is the
// SI mmol/L and the alternate converts the conventional mg/dL value UP to
// mmol/L via labConvert(kind, v, 'toSi') -- the inverse direction from the
// analytes above whose canonical unit is the conventional one. Calcium reuses
// the existing `calcium` LAB factor (elemental Ca: 1 mmol/L = 4 mg/dL), so
// both the ionised and total CRRT calcium fields share this one array.
export const LACTATE_UNITS = [
  { unit: 'mmol/L', toCanonical: (v) => v },
  { unit: 'mg/dL', toCanonical: (v) => labConvert('lactate', v, 'toSi') },
];
export const CALCIUM_MMOL_UNITS = [
  { unit: 'mmol/L', toCanonical: (v) => v },
  { unit: 'mg/dL', toCanonical: (v) => labConvert('calcium', v, 'toSi') },
];

export function unitField(label, id, units, opts = {}) {
  const wrap = el('p', { class: 'unit-field' });
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const row = el('span', { class: 'unit-field-row' });
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  // spec-v62 A4 (final wave): some tiles ship a prefilled default lab value
  // (MELD, Maddrey/Lille). The default must be the canonical unit's value so
  // the documented example/deep link stays byte-identical.
  if (opts.value != null) inp.value = String(opts.value);
  row.appendChild(inp);
  const sel = el('select', { id: `${id}-unit`, 'aria-label': `${label} unit` });
  let defaultIdx = -1;
  units.forEach((u, i) => {
    const opt = el('option', { value: u.unit, text: u.unit });
    opt._toCanonical = u.toCanonical || ((v) => v);
    sel.appendChild(opt);
    if (u.default) defaultIdx = i;
  });
  // spec-v283: pre-select the tagged US-customary option. Canonical stays
  // option 0, so applyExample's reset-to-canonical keeps examples and MCP
  // round-trips byte-identical.
  if (defaultIdx > 0) sel.selectedIndex = defaultIdx;
  row.appendChild(sel);
  wrap.appendChild(row);
  return wrap;
}

// Read a unitField value already converted to its canonical unit.
export function unitNum(id) {
  const v = Number(document.getElementById(id).value);
  const sel = document.getElementById(`${id}-unit`);
  const opt = sel ? sel.options[sel.selectedIndex] : null;
  const conv = opt && typeof opt._toCanonical === 'function' ? opt._toCanonical : (x) => x;
  return conv(v);
}

// spec-v184 §4.3/§4.4: blank-safe optional reader. Returns null for an empty
// input (mirroring the optNum readers in the view modules) so a blank weight,
// height, or temperature still surfaces the complete-the-fields fallback rather
// than computing as a converted zero. Otherwise identical to unitNum.
export function unitNumOpt(id) {
  const n = document.getElementById(id);
  if (!n || n.value === '') return null;
  const sel = document.getElementById(`${id}-unit`);
  const opt = sel ? sel.options[sel.selectedIndex] : null;
  const conv = opt && typeof opt._toCanonical === 'function' ? opt._toCanonical : (x) => x;
  return conv(Number(n.value));
}
