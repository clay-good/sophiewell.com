// spec-v276 §2: renderer for the Buzby Nutritional Risk Index (NRI). Group E. It joins
// the nutrition tiles beside GNRI / PNI / CONUT.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note the tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nutrition-v276.js';
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
  'nri'(root) {
    note(root, 'Nutritional Risk Index (Buzby, VA-TPN) = 1.519 × albumin (g/L) + 41.7 × (current / usual weight). Lower marks greater risk. Enter albumin in g/L (multiply a g/dL value by 10). Near-neighbors: gnri, pni-onodera, conut.');
    root.appendChild(num('Serum albumin (g/L)', 'nri-alb', { min: '0' }));
    root.appendChild(num('Current body weight', 'nri-current', { min: '0' }));
    root.appendChild(num('Usual body weight (same unit)', 'nri-usual', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['nri-alb', 'nri-current', 'nri-usual'], () => safe(o, () => {
      render(o, M.nri({ albumin: val('nri-alb'), currentWeight: val('nri-current'), usualWeight: val('nri-usual') }), 'NRI');
    }));
    postureNote(root);
  },
};
