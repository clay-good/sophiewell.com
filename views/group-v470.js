// spec-v470: renderer for the Larsen RA radiographic grading (grades 0-5). Group G. The clinician picks the
// grade; the tile reports the grade and its radiographic-damage description. As a grade descriptor it reports
// the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Larsen grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/larsen-ra-v470.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/larsen-ra-v470.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the rheumatology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'larsen-ra'(root) {
    note(root, 'The Larsen (Larsen-Dale-Eek) radiographic grading of joint damage in rheumatoid arthritis, by erosion and joint-space change. Pick the grade. 0: normal; 1: slight (swelling, osteoporosis, slight narrowing); 2: definite early (erosion and narrowing); 3: medium destructive (marked erosions); 4: severe destructive (extensive erosions, gross deformity); 5: mutilating (articular surfaces lost). Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: steinbrocker-ra.');
    root.appendChild(select('Larsen grade', 'larsen-grade', [
      ['0', '0 - normal'],
      ['1', '1 - slight (swelling, osteoporosis, slight narrowing)'],
      ['2', '2 - definite early (erosion and narrowing)'],
      ['3', '3 - medium destructive (marked erosions)'],
      ['4', '4 - severe destructive (gross deformity)'],
      ['5', '5 - mutilating (articular surfaces lost)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['larsen-grade'], () => safe(o, () => {
      const r = M.larsenRa({ grade: val('larsen-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
