// spec-v208 §2: renderers for the nutrition-status assessment & maternal-
// neonatal risk instruments — Ponderal Index, sFlt-1/PlGF, SGA, GLIM, and
// PG-SGA. Group G. Shipped one tile at a time.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the feeding / delivery / magnesium /
// disposition decision to the clinician and the patient (spec-v11 §5.3) — these
// assess and stratify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nutrition-maternal-v208.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The feeding, delivery, magnesium, and disposition decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.5 ponderal-index --------------------------------------------------
  'ponderal-index'(root) {
    note(root, 'Neonatal Ponderal Index / Rohrer\'s index (Miller & Hassanein 1971): PI = [weight (g) / length (cm)³] × 100, the proportionality of weight to length at birth. Normal ≈ 2.0–3.0; < 2.0 signals disproportionate wasting (asymmetric IUGR); > 3.0 is heavy-for-length. Near-neighbors: peds-bmi-percentile, cdc-weight-for-age.');
    root.appendChild(num('Birth weight (g)', 'pi-weight', { min: '0' }));
    root.appendChild(num('Crown-heel length (cm)', 'pi-length', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['pi-weight', 'pi-length'];
    wire(ids, () => safe(o, () => {
      const r = M.ponderalIndex({ weightG: val('pi-weight'), lengthCm: val('pi-length') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'PI', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
