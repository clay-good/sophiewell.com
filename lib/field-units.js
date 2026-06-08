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
import { lbToKg } from './unit-convert.js';

// Weight: canonical kg, with the US-bedside lb alternate.
export const WEIGHT_UNITS = [
  { unit: 'kg', toCanonical: (v) => v },
  { unit: 'lb', toCanonical: lbToKg },
];

export function unitField(label, id, units, opts = {}) {
  const wrap = el('p', { class: 'unit-field' });
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const row = el('span', { class: 'unit-field-row' });
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
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
