// spec-v61 §2 A4: shared per-field unit-toggle helpers.
//
// A numeric input gains an adjacent unit <select>; each option carries a
// `toCanonical` converter (driven by lib/unit-convert.js), and unitNum(id)
// returns the value already converted to the unit the compute function
// expects — so no compute path changes. US bedside charts enter weight in lb;
// SI labs report creatinine in µmol/L. The first (default) option is always the
// canonical unit, so every META.example and deep-link hash reproduces a
// calculation byte-identically. The <select> rides the existing
// input/change listeners and the trackHashState/input-persist machinery for
// free, and the .unit-field-row CSS wraps so the pair never forces horizontal
// scroll on a narrow phone.
//
// Pure DOM — no innerHTML, no third-party deps.

import { el } from './dom.js';
import { lbToKg, labConvert } from './unit-convert.js';

// Weight: canonical kg, with the US-bedside lb alternate.
export const WEIGHT_UNITS = [
  { unit: 'kg', toCanonical: (v) => v },
  { unit: 'lb', toCanonical: lbToKg },
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
  for (const u of units) {
    const opt = el('option', { value: u.unit, text: u.unit });
    opt._toCanonical = u.toCanonical || ((v) => v);
    sel.appendChild(opt);
  }
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
