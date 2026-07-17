// spec-v363: renderer for the Shaffer gonioscopy angle grade (grades 0-4). Group G. The clinician picks
// the grade; the tile reports the grade, its angle-width description, and whether it is a narrow
// (grade 0-2, angle-closure-risk) angle.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Shaffer grade; it never asserts a diagnosis, a treatment
// decision, or a prognosis (lib/shaffer-angle-v363.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/shaffer-angle-v363.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the ophthalmologist.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'shaffer-angle'(root) {
    note(root, 'Shaffer gonioscopy grading (Shaffer 1960) of the anterior chamber (drainage) angle. Pick the grade. A higher grade is a wider, safer angle. 4: wide open (~35-45 deg); 3: open (~20-35 deg); 2: moderately narrow (~20 deg), closure possible; 1: very narrow (~10 deg), closure probable; 0: closed. Grades 0-2 are at risk of angle-closure glaucoma. Near-neighbors: icdr-retinopathy.');
    root.appendChild(select('Shaffer grade', 'shaffer-grade', [
      ['4', 'Grade 4 - wide open (~35-45 deg)'],
      ['3', 'Grade 3 - open (~20-35 deg)'],
      ['2', 'Grade 2 - moderately narrow (~20 deg), closure possible'],
      ['1', 'Grade 1 - very narrow (~10 deg), closure probable'],
      ['0', 'Grade 0 - closed (0 deg)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['shaffer-grade'], () => safe(o, () => {
      const r = M.shafferAngle({ grade: val('shaffer-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
