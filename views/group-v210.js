// spec-v210 §2: renderers for the ischemic-stroke & ICH prognosis instruments —
// SPAN-100, ASTRAL, and PLAN. Group G. Shipped one tile at a time. (func-score
// is already live from spec-v206; iscore remains deferred — neither is rendered.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the thrombolysis / thrombectomy /
// goals-of-care decision to the clinician and the patient (spec-v11 §5.3) — these
// prognosticate and must not justify early care limitation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/stroke-prognosis-v210.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The thrombolysis, thrombectomy, and goals-of-care decisions stay with the clinician and the patient; this score must not justify early care limitation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.3 span-100 --------------------------------------------------------
  'span-100'(root) {
    note(root, 'SPAN-100 index (Saposnik 2013): the simplest validated age-plus-severity stroke-prognostic index — SPAN-100 = age + NIHSS, dichotomized at 100. Positive (≥ 100) patients have substantially worse prognosis and much lower favorable-outcome rates. A prognostic index for counseling, not a treatment-eligibility rule. Near-neighbors: nihss, mrs.');
    root.appendChild(num('Age (years)', 'span-age', { min: '0' }));
    root.appendChild(num('NIHSS (0–42)', 'span-nihss', { min: '0', max: '42' }));
    const o = out(); root.appendChild(o);
    const ids = ['span-age', 'span-nihss'];
    wire(ids, () => safe(o, () => {
      const r = M.spanScore({ age: val('span-age'), nihss: val('span-nihss') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'SPAN-100', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
