// spec-v653 §2: renderer for who-isup-renal-grade — the WHO/ISUP nucleolar grade for
// renal cell carcinoma (Clinical Scoring & Risk, Group G). Companion to leibovich-rcc
// and the histologic-grading vein (nottingham-grade, fnclcc-grade, gleason-grade-group).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One nucleoli
// select (grade 1-3 basis) plus a grade-4-feature checkbox that overrides to grade 4.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/who-isup-renal-grade-v653.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The WHO/ISUP grade is a pathologist’s grading driven by nucleolar prominence at magnification (with grade-4 features overriding); it applies to clear-cell and papillary RCC, not chromophobe, and is read with the full pathology report. The diagnosis and grading stay with the pathologist and team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const NUCLEOLI_OPTS = [
  { value: '', text: '— choose —' },
  { value: 'inconspicuous', text: 'Grade 1 — inconspicuous at 400x' },
  { value: 'conspicuous-400', text: 'Grade 2 — conspicuous at 400x, not at 100x' },
  { value: 'conspicuous-100', text: 'Grade 3 — conspicuous at 100x' },
];

export const renderers = {
  'who-isup-renal-grade'(root) {
    note(root, 'WHO/ISUP nucleolar grade for renal cell carcinoma (Delahunt/ISUP 2013, WHO 2016; replaced Fuhrman). Grade set by nucleolar prominence at magnification; a grade-4 feature (extreme pleomorphism, giant cells, rhabdoid, and/or sarcomatoid) overrides to grade 4. For clear-cell and papillary RCC, not chromophobe.');
    root.appendChild(selectField('Nucleolar prominence', 'isup-nucleoli', NUCLEOLI_OPTS));
    root.appendChild(checkField('Grade-4 feature: extreme pleomorphism, tumor giant cells, rhabdoid, and/or sarcomatoid', 'isup-grade4'));
    const ids = ['isup-nucleoli', 'isup-grade4'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.whoIsupRenalGrade({ nucleoli: selVal('isup-nucleoli'), grade4Features: chk('isup-grade4') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: `G${r.grade}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
