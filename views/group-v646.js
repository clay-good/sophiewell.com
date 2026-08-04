// spec-v646 §2: renderer for mccormack-lsc — the McCormack Load-Sharing
// Classification of spine fractures (Clinical Scoring & Risk, Group G). The
// short-segment-fixation companion to the built tlics-score.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three
// component selects (each 1-3) sum to 3-9; a total >= 7 predicts short-segment
// posterior fixation failure. A blank form reports the complete-the-fields message.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mccormack-v646.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Load-Sharing score is computed from the CT/radiographic grades you entered; it predicts short-segment posterior fixation failure but does not itself choose the operation. It complements the operative-vs-nonoperative decision (see TLICS); the surgical plan stays with the surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const FIELDS = [
  { key: 'comminution', dom: 'mcc-comm', label: 'Comminution of the vertebral body (CT)', opts: [['1', '1 — ≤ 30% comminuted'], ['2', '2 — 30-60% comminuted'], ['3', '3 — > 60% comminuted']] },
  { key: 'apposition', dom: 'mcc-app', label: 'Apposition / spread of the fragments (axial CT)', opts: [['1', '1 — minimal displacement (< 2 mm)'], ['2', '2 — ≥ 2 mm over ≥ half the fracture surface'], ['3', '3 — wide spread of fragments']] },
  { key: 'kyphosis', dom: 'mcc-kyph', label: 'Kyphosis to be corrected (sagittal)', opts: [['1', '1 — ≤ 3°'], ['2', '2 — 4-9°'], ['3', '3 — ≥ 10°']] },
];

export const renderers = {
  'mccormack-lsc'(root) {
    note(root, 'McCormack Load-Sharing Classification (McCormack 1994): grades how much load a fractured vertebral body can share, to predict whether short-segment posterior fixation will hold. Three CT/radiographic components each 1-3, total 3-9. ≤ 6 → short-segment posterior fixation likely suffices; ≥ 7 → predicts failure, anterior support or a longer construct advised. Companion tile: tlics-score.');
    for (const f of FIELDS) root.appendChild(selectField(f.label, f.dom, CHOICE(f.opts)));
    const ids = FIELDS.map((f) => f.dom);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const f of FIELDS) input[f.key] = selVal(f.dom);
      const r = M.mccormackLsc(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/9` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
