// spec-v694 §2: renderer for cobb-angle — Cobb angle scoliosis severity interpretation
// (Clinical Scoring & Risk, Group G). Companion to the built Risser sign (skeletal
// maturity that drives the bracing decision).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One angle
// number input classifies the curve into a severity band with advisory management context.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cobb-angle-v694.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: '180', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The band classifies the measured curve; bracing and surgery cut-points are advisory and depend on skeletal maturity, growth remaining, curve pattern, and documented progression. The management decision rests with the treating specialist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'cobb-angle'(root) {
    note(root, 'Cobb angle (Cobb 1948; Scoliosis Research Society): a curve of ≥ 10° defines scoliosis. Bands: < 10° not scoliosis, 10–24° mild, 25–44° moderate, ≥ 45° severe. Bracing is typically considered ~25–40° in a growing child; surgery ~45–50°+.');
    root.appendChild(numberField('Measured Cobb angle (degrees)', 'cobb-angle'));
    const ids = ['cobb-angle'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.cobbAngle({ angle: val('cobb-angle') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.category },
        { label: 'Scoliosis', value: r.isScoliosis ? 'yes (≥ 10°)' : 'no (< 10°)' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
