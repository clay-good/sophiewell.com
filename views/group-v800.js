// spec-v800 §2: renderer for hughes-gbs — the Hughes Functional Grading Scale (Clinical
// Scoring & Risk, Group G). The outcome scale the GBS prognostic tiles are built around.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. One select whose
// option text carries the full grade definition, so the scale is readable on the page.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hughes-gbs-v800.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This records a functional state at one moment. It is not a prognosis or a treatment decision, and it does not capture sensory symptoms or pain at all.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const GRADE = [
  { value: '0', text: '0 - healthy, no symptoms attributable to the illness' },
  { value: '1', text: '1 - minor symptoms, able to run' },
  { value: '2', text: '2 - walks 10 meters or more without support, unable to run' },
  { value: '3', text: '3 - walks 10 meters only with help' },
  { value: '4', text: '4 - bedridden or wheelchair-bound' },
  { value: '5', text: '5 - requires assisted ventilation' },
  { value: '6', text: '6 - death' },
];

export const renderers = {
  'hughes-gbs'(root) {
    note(root, 'The standard measure of disability in Guillain-Barre syndrome, from 0 to 6 with higher meaning worse. Grade 3 is the threshold that matters: it is where independent walking is lost, and grades 3 and above are what the literature counts as disability.');
    root.appendChild(selectField('Functional grade', 'hughes-grade', GRADE));
    const ids = ['hughes-grade'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.hughesGbs({ grade: val('hughes-grade') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: `${r.grade}/6` },
        { label: 'Independent walking', value: r.disabled ? 'lost' : 'retained' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
