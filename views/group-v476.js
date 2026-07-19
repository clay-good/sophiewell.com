// spec-v476: renderer for the Nash-Moe vertebral rotation grading (grades 0-4). Group G. The clinician picks
// the grade; the tile reports the grade and its pedicle-position description. As a grade descriptor it reports
// the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Nash-Moe grade; it never asserts a diagnosis, a treatment decision, or a
// prognosis (lib/nash-moe-rotation-v476.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nash-moe-rotation-v476.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the orthopedic / spine team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'nash-moe-rotation'(root) {
    note(root, 'The Nash-Moe method of grading vertebral rotation in scoliosis, by the position of the convex-side pedicle on the AP radiograph. Pick the grade. 0: symmetric pedicles (no rotation); 1: convex pedicle slightly toward the midline; 2: convex pedicle in the middle third; 3: convex pedicle central, near the midline; 4: convex pedicle past the midline. Reports the grade the clinician has determined, not a diagnosis or a treatment decision. Near-neighbor: risser-sign.');
    root.appendChild(select('Nash-Moe grade', 'nash-moe-grade', [
      ['0', '0 - symmetric pedicles (no rotation)'],
      ['1', '1 - convex pedicle slightly toward the midline'],
      ['2', '2 - convex pedicle in the middle third'],
      ['3', '3 - convex pedicle central, near the midline'],
      ['4', '4 - convex pedicle past the midline'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['nash-moe-grade'], () => safe(o, () => {
      const r = M.nashMoeRotation({ grade: val('nash-moe-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
