// spec-v733 §2: renderer for chalder-fatigue — the Chalder Fatigue Scale / CFQ-11
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Eleven 0-3
// selects; the bimodal sum 0-11 maps to a fatigue-caseness band. Neutral item-topic
// labels (item wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/chalder-fatigue-v733.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The CFQ-11 is a self-report screen of fatigue; it is not a diagnosis. It supports rather than replaces the clinical evaluation.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [{ value: '', text: '— 0-3 —' }, { value: '0', text: '0 (less than usual)' }, { value: '1', text: '1 (no more than usual)' }, { value: '2', text: '2 (more than usual)' }, { value: '3', text: '3 (much more than usual)' }];

const ROWS = [
  ['Item 1 - tiredness (physical)', 'cfq-q1'],
  ['Item 2 - need to rest more (physical)', 'cfq-q2'],
  ['Item 3 - sleepy or drowsy (physical)', 'cfq-q3'],
  ['Item 4 - difficulty starting things (physical)', 'cfq-q4'],
  ['Item 5 - lacking energy (physical)', 'cfq-q5'],
  ['Item 6 - less strength in muscles (physical)', 'cfq-q6'],
  ['Item 7 - feeling weak (physical)', 'cfq-q7'],
  ['Item 8 - difficulty concentrating (mental)', 'cfq-q8'],
  ['Item 9 - slips of the tongue when speaking (mental)', 'cfq-q9'],
  ['Item 10 - difficulty finding the right word (mental)', 'cfq-q10'],
  ['Item 11 - memory (mental)', 'cfq-q11'],
];

export const renderers = {
  'chalder-fatigue'(root) {
    note(root, 'Chalder Fatigue Scale (Chalder 1993): rate eleven items 0-3 relative to feeling well. Likert scoring sums 0-33; bimodal scoring (0/1 to 0, 2/3 to 1) sums 0-11, and a bimodal total of 4 or more indicates fatigue caseness.');
    for (const [label, id] of ROWS) root.appendChild(selectField(label, id, RATE));
    const ids = ROWS.map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.chalderFatigue({ q1: val('cfq-q1'), q2: val('cfq-q2'), q3: val('cfq-q3'), q4: val('cfq-q4'), q5: val('cfq-q5'), q6: val('cfq-q6'), q7: val('cfq-q7'), q8: val('cfq-q8'), q9: val('cfq-q9'), q10: val('cfq-q10'), q11: val('cfq-q11') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Bimodal', value: `${r.bimodal}/11` },
        { label: 'Likert', value: `${r.likert}/33` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
