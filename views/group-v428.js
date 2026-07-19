// spec-v428: renderer for the MRC muscle-power grade (0-5). Group G. The clinician picks the grade; the tile
// reports the grade and its examination description. As a power-grade descriptor it reports the grade the
// clinician has elicited.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the MRC muscle-power grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/mrc-power-v428.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mrc-power-v428.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'mrc-power'(root) {
    note(root, 'The Medical Research Council (MRC) muscle-power grade, the standard 0-5 bedside grading of the strength of a single muscle or movement. Pick the grade. 0: no contraction; 1: a flicker or trace; 2: active movement with gravity eliminated; 3: against gravity; 4: against gravity and resistance; 5: normal power. Grade 4 is sometimes subdivided (4-/4/4+). It is the unit the MRC sum score aggregates. Near-neighbor: mrc-sum-score.');
    root.appendChild(select('MRC muscle-power grade', 'mrc-grade', [
      ['0', '0 - no contraction'],
      ['1', '1 - a flicker or trace of contraction'],
      ['2', '2 - active movement, gravity eliminated'],
      ['3', '3 - active movement against gravity'],
      ['4', '4 - active movement against gravity and resistance'],
      ['5', '5 - normal power'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['mrc-grade'], () => safe(o, () => {
      const r = M.mrcPower({ grade: val('mrc-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
