// spec-v390: renderer for the Knosp grading of cavernous sinus invasion by a pituitary adenoma (grades
// 0-4). Group G. The clinician picks the grade; the tile reports the grade, its ICA-landmark description,
// and whether cavernous-sinus invasion is likely (grade 3-4).
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Knosp grade; it never asserts a diagnosis, a treatment decision, or
// a prognosis (lib/knosp-adenoma-v390.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/knosp-adenoma-v390.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the neurosurgical / endocrine team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'knosp-adenoma'(root) {
    note(root, 'Knosp grading of cavernous sinus invasion by a pituitary adenoma, on coronal MRI, using the internal carotid artery as the landmark. Pick the grade. 0: medial to the medial tangent; 1: past the medial tangent, not past the intercarotid line; 2: past the intercarotid line, not past the lateral tangent; 3: lateral to the lateral tangent (3A/3B); 4: total ICA encasement. Grades 3-4 predict invasion. Near-neighbors: koos-schwannoma.');
    root.appendChild(select('Knosp grade', 'knosp-grade', [
      ['0', 'Grade 0 - medial to the medial tangent'],
      ['1', 'Grade 1 - to the intercarotid line'],
      ['2', 'Grade 2 - to the lateral tangent'],
      ['3', 'Grade 3 - lateral to the lateral tangent (3A/3B)'],
      ['4', 'Grade 4 - total ICA encasement'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['knosp-grade'], () => safe(o, () => {
      const r = M.knospAdenoma({ grade: val('knosp-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
