// spec-v778 §2: renderer for sixcit — the Six-item Cognitive Impairment Test
// (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three checkboxes
// and three error-count selects; an inverse weighted total 0-28 maps to a referral band.
// Neutral task labels (the Kingshill Version 2000 wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sixcit-v778.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
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
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The 6CIT is a screening test that flags the need for a fuller assessment. It does not diagnose dementia or any of its causes.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ERRORS_3 = [
  { value: '0', text: 'Correct (0)' },
  { value: '1', text: 'One error (2)' },
  { value: '2', text: 'More than one error (4)' },
];
const ADDRESS = [
  { value: '0', text: 'All five recalled (0)' },
  { value: '1', text: 'One component missed (2)' },
  { value: '2', text: 'Two missed (4)' },
  { value: '3', text: 'Three missed (6)' },
  { value: '4', text: 'Four missed (8)' },
  { value: '5', text: 'All five missed (10)' },
];

export const renderers = {
  sixcit(root) {
    note(root, '6CIT (Brooke and Bullock 1999), Kingshill Version 2000: an inverse score, so points are earned for errors and higher is worse. Six weighted tasks give a maximum of 28. Bands: 0 to 7 normal, 8 to 9 consider referral, 10 to 28 refer.');
    root.appendChild(checkField('Names the year incorrectly (4)', 'sixcit-year'));
    root.appendChild(checkField('Names the month incorrectly (3)', 'sixcit-month'));
    root.appendChild(checkField('Estimates the time incorrectly, outside one hour (3)', 'sixcit-time'));
    root.appendChild(selectField('Counting backward from 20 to 1', 'sixcit-count', ERRORS_3));
    root.appendChild(selectField('Saying the months of the year in reverse', 'sixcit-months', ERRORS_3));
    root.appendChild(selectField('Recall of the five-part address', 'sixcit-address', ADDRESS));
    const ids = ['sixcit-year', 'sixcit-month', 'sixcit-time', 'sixcit-count', 'sixcit-months', 'sixcit-address'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.sixcit({
        yearWrong: checked('sixcit-year'),
        monthWrong: checked('sixcit-month'),
        timeWrong: checked('sixcit-time'),
        countErrors: val('sixcit-count'),
        monthsErrors: val('sixcit-months'),
        addressErrors: val('sixcit-address'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/28` },
      ]);
      note(o, r.parts.length ? `Points from: ${r.parts.join(', ')}.` : 'No errors (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
