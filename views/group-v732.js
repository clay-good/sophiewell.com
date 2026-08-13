// spec-v732 §2: renderer for fss — the Fatigue Severity Scale (Clinical Scoring & Risk,
// Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Nine 1-7 selects;
// the mean 1-7 maps to a fatigue-significance band. Neutral item-topic labels (statement
// wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fss-v732.js';
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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The FSS is a self-report screen of fatigue impact; it is not a diagnosis. It supports rather than replaces the clinical evaluation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [{ value: '', text: '— 1-7 —' }, { value: '1', text: '1 (strongly disagree)' }, { value: '2', text: '2' }, { value: '3', text: '3' }, { value: '4', text: '4' }, { value: '5', text: '5' }, { value: '6', text: '6' }, { value: '7', text: '7 (strongly agree)' }];

const ROWS = [
  ['Item 1 - motivation is lower when fatigued', 'fss-q1'],
  ['Item 2 - exercise brings on fatigue', 'fss-q2'],
  ['Item 3 - easily fatigued', 'fss-q3'],
  ['Item 4 - fatigue interferes with physical functioning', 'fss-q4'],
  ['Item 5 - fatigue causes frequent problems', 'fss-q5'],
  ['Item 6 - fatigue prevents sustained physical functioning', 'fss-q6'],
  ['Item 7 - fatigue interferes with duties and responsibilities', 'fss-q7'],
  ['Item 8 - fatigue is among the most disabling symptoms', 'fss-q8'],
  ['Item 9 - fatigue interferes with work, family, or social life', 'fss-q9'],
];

export const renderers = {
  'fss'(root) {
    note(root, 'Fatigue Severity Scale (Krupp 1989): rate nine statements 1 (strongly disagree) to 7 (strongly agree). The score is the mean of the nine ratings; a mean of 4 or greater indicates clinically significant fatigue.');
    for (const [label, id] of ROWS) root.appendChild(selectField(label, id, RATE));
    const ids = ROWS.map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.fss({ q1: val('fss-q1'), q2: val('fss-q2'), q3: val('fss-q3'), q4: val('fss-q4'), q5: val('fss-q5'), q6: val('fss-q6'), q7: val('fss-q7'), q8: val('fss-q8'), q9: val('fss-q9') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Mean', value: `${r.meanText}/7` },
        { label: 'Sum', value: `${r.sum}/63` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
