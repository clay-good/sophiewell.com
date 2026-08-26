// spec-v806 §2: renderer for pss10 — the Perceived Stress Scale (Clinical Scoring & Risk,
// Group G). Joins cbi and olbi in the wellbeing family opened by spec-v780.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Ten 0-4 selects.
// The dom ids are written as literals rather than built in a loop, the same rule spec-v785
// established, so the pre-rendered page resolves each select's option text.
//
// The item wording is distributed under licence and is not reproduced; each item carries
// its number and its scoring direction, which is what a scorer needs.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pss10-v806.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This measures a self-reported appraisal over the past month. It is not a diagnosis, and a high score is not by itself a disorder.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const RATE = [
  { value: '', text: '\u2014 not answered \u2014' },
  { value: '0', text: '0 (never)' },
  { value: '1', text: '1 (almost never)' },
  { value: '2', text: '2 (sometimes)' },
  { value: '3', text: '3 (fairly often)' },
  { value: '4', text: '4 (very often)' },
];

export const renderers = {
  pss10(root) {
    note(root, 'Ten items scored 0 to 4, total 0 to 40, higher meaning more perceived stress. Items 4, 5, 7 and 8 are positively worded and are REVERSE scored, so answering every item the same way does not give a uniform total. Enter the answer as given and the direction is applied for you.');
    root.appendChild(selectField('Item 1 (scored as worded)', 'pss-q1', RATE));
    root.appendChild(selectField('Item 2 (scored as worded)', 'pss-q2', RATE));
    root.appendChild(selectField('Item 3 (scored as worded)', 'pss-q3', RATE));
    root.appendChild(selectField('Item 4 (reverse scored)', 'pss-q4', RATE));
    root.appendChild(selectField('Item 5 (reverse scored)', 'pss-q5', RATE));
    root.appendChild(selectField('Item 6 (scored as worded)', 'pss-q6', RATE));
    root.appendChild(selectField('Item 7 (reverse scored)', 'pss-q7', RATE));
    root.appendChild(selectField('Item 8 (reverse scored)', 'pss-q8', RATE));
    root.appendChild(selectField('Item 9 (scored as worded)', 'pss-q9', RATE));
    root.appendChild(selectField('Item 10 (scored as worded)', 'pss-q10', RATE));
    const ids = Array.from({ length: 10 }, (_, i) => `pss-q${i + 1}`);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const id of ids) args[id.replace('pss-', '')] = val(id);
      const r = M.pss10(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: `${r.score}/40` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
