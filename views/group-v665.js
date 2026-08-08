// spec-v665 §2: renderer for cleveland-constipation — the Cleveland Clinic (Wexner)
// Constipation Score (Clinical Scoring & Risk, Group G). Distinct from the built Wexner
// fecal incontinence score.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Eight ordinal
// selects (seven 0-4, assistance 0-2) sum to 0-30; the > 15 cutoff is advisory.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cleveland-constipation-v665.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The total estimates constipation severity; the > 15 cutoff comes from the derivation cohort and varies across sources, so it is advisory. This is the constipation score, distinct from the Wexner fecal incontinence score. The assessment stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const FIELDS = [
  { key: 'frequency', dom: 'cccs-frequency', label: 'Frequency of bowel movements', opts: [['0', '0 — 1-2 per 1-2 days'], ['1', '1 — 2 per week'], ['2', '2 — once per week'], ['3', '3 — < once per week'], ['4', '4 — < once per month']] },
  { key: 'difficulty', dom: 'cccs-difficulty', label: 'Difficulty (painful evacuation effort)', opts: [['0', '0 — never'], ['1', '1 — rarely'], ['2', '2 — sometimes'], ['3', '3 — usually'], ['4', '4 — always']] },
  { key: 'completeness', dom: 'cccs-completeness', label: 'Feeling of incomplete evacuation', opts: [['0', '0 — never'], ['1', '1 — rarely'], ['2', '2 — sometimes'], ['3', '3 — usually'], ['4', '4 — always']] },
  { key: 'pain', dom: 'cccs-pain', label: 'Abdominal pain', opts: [['0', '0 — never'], ['1', '1 — rarely'], ['2', '2 — sometimes'], ['3', '3 — usually'], ['4', '4 — always']] },
  { key: 'time', dom: 'cccs-time', label: 'Time in lavatory per attempt', opts: [['0', '0 — < 5 min'], ['1', '1 — 5-10 min'], ['2', '2 — 10-20 min'], ['3', '3 — 20-30 min'], ['4', '4 — > 30 min']] },
  { key: 'assistance', dom: 'cccs-assistance', label: 'Type of assistance', opts: [['0', '0 — without assistance'], ['1', '1 — stimulant laxatives'], ['2', '2 — digital assistance or enema']] },
  { key: 'failure', dom: 'cccs-failure', label: 'Unsuccessful attempts per 24 h', opts: [['0', '0 — never'], ['1', '1 — rarely'], ['2', '2 — sometimes'], ['3', '3 — usually'], ['4', '4 — always']] },
  { key: 'history', dom: 'cccs-history', label: 'Duration of constipation', opts: [['0', '0 — 0 years'], ['1', '1 — 1-5 years'], ['2', '2 — 5-10 years'], ['3', '3 — 10-20 years'], ['4', '4 — > 20 years']] },
];

export const renderers = {
  'cleveland-constipation'(root) {
    note(root, 'Cleveland Clinic (Wexner) Constipation Score (Agachan 1996): eight items summed 0-30 (seven scored 0-4, assistance 0-2). Higher = more severe constipation; a score above 15 is the commonly cited cutoff. This is the constipation score, distinct from the Wexner fecal incontinence score.');
    for (const f of FIELDS) root.appendChild(selectField(f.label, f.dom, CHOICE(f.opts)));
    const ids = FIELDS.map((f) => f.dom);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const f of FIELDS) input[f.key] = val(f.dom);
      const r = M.clevelandConstipation(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/30` },
      ]);
      note(o, r.thresholdNote);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
