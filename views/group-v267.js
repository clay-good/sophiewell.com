// spec-v267 §2: renderer for the HALP score — the composite hemoglobin / albumin
// / lymphocyte / platelet prognostic index. Group G. It joins the spec-v229/v230
// inflammation-index family beside NLR/PLR/SII/LMR/SIRI/PIV.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/inflam-v267.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'halp-score'(root) {
    note(root, 'HALP score = hemoglobin x albumin x ALC / platelets (Chen 2015). A LOWER value is less favorable. Enter hemoglobin and albumin in g/L (multiply a g/dL value by 10). Near-neighbors: pni-onodera, gnri, lmr.');
    root.appendChild(num('Hemoglobin (g/L)', 'halp-hgb', { min: '0' }));
    root.appendChild(num('Serum albumin (g/L)', 'halp-alb', { min: '0' }));
    root.appendChild(num('Absolute lymphocyte count (10⁹/L)', 'halp-alc', { min: '0' }));
    root.appendChild(num('Platelet count (10⁹/L)', 'halp-plt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['halp-hgb', 'halp-alb', 'halp-alc', 'halp-plt'], () => safe(o, () => {
      render(o, M.halp({ hgb: val('halp-hgb'), albumin: val('halp-alb'), alc: val('halp-alc'), plt: val('halp-plt') }), 'HALP');
    }));
    postureNote(root);
  },
};
