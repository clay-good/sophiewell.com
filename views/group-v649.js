// spec-v649 §2: renderer for nottingham-grade — the Nottingham histologic grade for
// breast cancer (Elston-Ellis modified SBR) (Clinical Scoring & Risk, Group G). The
// histologic grade that feeds the built nottingham-prognostic-index.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three
// component selects (each 1-3) sum to 3-9 and map to grade 1/2/3. The mitotic
// component is the pathologist's 1-3 score, entered directly.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nottingham-grade-v649.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Nottingham grade is a pathologist’s grading computed from the three component scores you entered; it is the histologic grade, not the Nottingham Prognostic Index, and is read with the full pathology report. The diagnosis and staging stay with the pathologist and team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const FIELDS = [
  { key: 'tubules', dom: 'nott-tubules', label: 'Tubule / gland formation', opts: [['1', '1 — > 75% of tumor'], ['2', '2 — 10-75%'], ['3', '3 — < 10%']] },
  { key: 'pleomorphism', dom: 'nott-pleo', label: 'Nuclear pleomorphism', opts: [['1', '1 — small, regular, uniform'], ['2', '2 — moderate variation'], ['3', '3 — marked variation']] },
  { key: 'mitoses', dom: 'nott-mitoses', label: 'Mitotic count score (field-size-dependent; enter the 1-3 score)', opts: [['1', '1 — lowest tier'], ['2', '2 — intermediate tier'], ['3', '3 — highest tier']] },
];

export const renderers = {
  'nottingham-grade'(root) {
    note(root, 'Nottingham histologic grade (Elston-Ellis 1991, modified Scarff-Bloom-Richardson): tubule formation + nuclear pleomorphism + mitotic score, each 1-3, total 3-9. Grade 1 (3-5) well differentiated, grade 2 (6-7) moderately, grade 3 (8-9) poorly. This is the grade, not the prognostic index. Companion tile: nottingham-prognostic-index.');
    for (const f of FIELDS) root.appendChild(selectField(f.label, f.dom, CHOICE(f.opts)));
    const ids = FIELDS.map((f) => f.dom);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const f of FIELDS) input[f.key] = selVal(f.dom);
      const r = M.nottinghamGrade(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.total}/9` },
        { label: 'Grade', value: `G${r.grade}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
