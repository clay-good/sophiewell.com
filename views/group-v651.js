// spec-v651 §2: renderer for fnclcc-grade — the FNCLCC histologic grade for adult
// soft-tissue sarcoma (Clinical Scoring & Risk, Group G). Companion to the built
// oncologic staging tiles (Enneking, Gleason grade group).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two 1-3 / 0-2
// component selects plus one raw mitotic-count number input; the count is binned to a
// 1-3 score, and the three scores sum to 2-8 -> grade 1/2/3.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fnclcc-grade-v651.js';
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
function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The FNCLCC grade is a pathologist’s grading computed from the three component scores; it is read with the full pathology report, and grading a core biopsy can underestimate the resection grade. The diagnosis and staging stay with the pathologist and team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const DIFF_OPTS = [['1', '1 — resembles normal adult mesenchyme'], ['2', '2 — histologic typing certain'], ['3', '3 — embryonal/undifferentiated, synovial, doubtful']];
const NEC_OPTS = [['0', '0 — no necrosis'], ['1', '1 — < 50% necrosis'], ['2', '2 — ≥ 50% necrosis']];

export const renderers = {
  'fnclcc-grade'(root) {
    note(root, 'FNCLCC grade (Trojani 1984, Coindre 2006) for adult soft-tissue sarcoma: tumor differentiation (1-3) + mitotic count score (0-9=1, 10-19=2, ≥20=3) + tumor necrosis (0-2), total 2-8. Grade 1 (2-3), grade 2 (4-5), grade 3 (6-8).');
    root.appendChild(selectField('Tumor differentiation', 'fnclcc-diff', CHOICE(DIFF_OPTS)));
    root.appendChild(numberField('Mitotic count (mitoses per 10 high-power fields)', 'fnclcc-mitoses'));
    root.appendChild(selectField('Tumor necrosis', 'fnclcc-necrosis', CHOICE(NEC_OPTS)));
    const ids = ['fnclcc-diff', 'fnclcc-mitoses', 'fnclcc-necrosis'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.fnclccGrade({ differentiation: val('fnclcc-diff'), mitoticCount: val('fnclcc-mitoses'), necrosis: val('fnclcc-necrosis') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/8` },
        { label: 'Grade', value: `G${r.grade}` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
