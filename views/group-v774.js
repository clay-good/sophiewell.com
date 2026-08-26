// spec-v774 §2: renderer for bctq — the Boston Carpal Tunnel Questionnaire (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Nineteen 1-5
// selects across two independent scales; each scale scores as the mean of its own items.
// Neutral item-topic labels (questionnaire wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bctq-v774.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The BCTQ measures severity and function to follow change over time. It is not a diagnostic test, not a substitute for nerve conduction studies, and not an order for splinting, injection or surgery.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [{ value: '', text: '— 1-5 —' }, { value: '1', text: '1 (none or no difficulty)' }, { value: '2', text: '2 (mild)' }, { value: '3', text: '3 (moderate)' }, { value: '4', text: '4 (severe)' }, { value: '5', text: '5 (very severe)' }];

const SSS_ROWS = [
  ['Symptom 1 - severity of hand or wrist pain at night', 'bctq-s1'],
  ['Symptom 2 - how often pain wakes you at night', 'bctq-s2'],
  ['Symptom 3 - severity of hand or wrist pain during the day', 'bctq-s3'],
  ['Symptom 4 - how often daytime pain occurs', 'bctq-s4'],
  ['Symptom 5 - average length of a daytime pain episode', 'bctq-s5'],
  ['Symptom 6 - numbness in the hand', 'bctq-s6'],
  ['Symptom 7 - weakness in the hand or wrist', 'bctq-s7'],
  ['Symptom 8 - tingling in the hand', 'bctq-s8'],
  ['Symptom 9 - severity of numbness or tingling at night', 'bctq-s9'],
  ['Symptom 10 - how often numbness or tingling wakes you at night', 'bctq-s10'],
  ['Symptom 11 - difficulty grasping and using small objects', 'bctq-s11'],
];
const FSS_ROWS = [
  ['Activity 1 - writing', 'bctq-f1'],
  ['Activity 2 - fastening buttons', 'bctq-f2'],
  ['Activity 3 - holding a book while reading', 'bctq-f3'],
  ['Activity 4 - gripping a telephone handset', 'bctq-f4'],
  ['Activity 5 - opening jars', 'bctq-f5'],
  ['Activity 6 - household chores', 'bctq-f6'],
  ['Activity 7 - carrying grocery bags', 'bctq-f7'],
  ['Activity 8 - bathing and dressing', 'bctq-f8'],
];

export const renderers = {
  bctq(root) {
    note(root, 'Boston Carpal Tunnel Questionnaire (Levine 1993): rate 11 symptom items and 8 everyday hand activities from 1 to 5. Each scale scores as the mean of its own items, so both run 1 to 5 and higher is more severe. The two scales are reported separately, never added together.');
    root.appendChild(el('h2', { text: 'Symptom Severity Scale (11 items)' }));
    for (const [label, id] of SSS_ROWS) root.appendChild(selectField(label, id, RATE));
    root.appendChild(el('h2', { text: 'Functional Status Scale (8 activities)' }));
    for (const [label, id] of FSS_ROWS) root.appendChild(selectField(label, id, RATE));
    const ids = [...SSS_ROWS, ...FSS_ROWS].map((r) => r[1]);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [, id] of SSS_ROWS) args[id.replace('bctq-', '')] = val(id);
      for (const [, id] of FSS_ROWS) args[id.replace('bctq-', '')] = val(id);
      const r = M.bctq(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Symptom severity', value: `${r.sssText}/5 (sum ${r.sssSum}/55)` },
        { label: 'Functional status', value: `${r.fssText}/5 (sum ${r.fssSum}/40)` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
