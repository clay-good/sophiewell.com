// spec-v782 §2: renderer for fabq — the Fear-Avoidance Beliefs Questionnaire (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. All sixteen
// statements are shown, because all sixteen are administered, but only eleven are scored
// and the other five say so on their own label. Neutral item-topic labels.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fabq-v782.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This measures beliefs about activity and work, not physical capacity or tissue damage. No threshold is asserted, because the 1993 source publishes none.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [
  { value: '', text: '— not answered —' },
  { value: '0', text: '0 (completely disagree)' },
  { value: '1', text: '1' },
  { value: '2', text: '2' },
  { value: '3', text: '3 (unsure)' },
  { value: '4', text: '4' },
  { value: '5', text: '5' },
  { value: '6', text: '6 (completely agree)' },
];

const ITEMS = [
  [1, 'Pain was caused by physical activity', 'none'],
  [2, 'Physical activity makes the pain worse', 'pa'],
  [3, 'Physical activity might harm the back', 'pa'],
  [4, 'Should not do activities that might make the pain worse', 'pa'],
  [5, 'Cannot do activities that might make the pain worse', 'pa'],
  [6, 'Pain was caused by work or by an accident at work', 'work'],
  [7, 'Work made the pain worse', 'work'],
  [8, 'Has a compensation claim for the pain', 'none'],
  [9, 'The work is too heavy', 'work'],
  [10, 'Work makes or would make the pain worse', 'work'],
  [11, 'Work might harm the back', 'work'],
  [12, 'Should not do normal work with the pain as it is', 'work'],
  [13, 'Cannot do normal work with the pain as it is', 'none'],
  [14, 'Cannot do normal work until the pain is treated', 'none'],
  [15, 'Does not expect to be back at normal work within 3 months', 'work'],
  [16, 'Does not expect to ever return to that work', 'none'],
];
const TAG = { pa: ' [physical activity subscale]', work: ' [work subscale]', none: ' [asked but not scored]' };

export const renderers = {
  fabq(root) {
    note(root, 'FABQ (Waddell 1993): rate all sixteen statements 0 (completely disagree) to 6 (completely agree). Only eleven are scored: four make the physical activity subscale (0 to 24) and seven make the work subscale (0 to 42). The other five are asked but count toward neither, and the two subscales are never added together.');
    for (const [n, label, group] of ITEMS) {
      root.appendChild(selectField(`${n}. ${label}${TAG[group]}`, `fabq-q${n}`, RATE));
    }
    const ids = ITEMS.map(([n]) => `fabq-q${n}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const id of ids) args[id.replace('fabq-', '')] = val(id);
      const r = M.fabq(args);
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band, cls: r.abnormal ? 'warn' : null }];
      if (r.physicalActivity !== null) rows.push({ label: 'Physical activity', value: `${r.physicalActivity}/24` });
      if (r.work !== null) rows.push({ label: 'Work', value: `${r.work}/42` });
      resultRow(o, rows);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
