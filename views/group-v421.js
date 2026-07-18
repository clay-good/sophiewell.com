// spec-v421: renderer for the SUN anterior chamber cell grade (0/0.5+/1+/2+/3+/4+). Group G. The clinician
// picks the grade (from the cell count observed at the slit lamp); the tile reports the grade and its
// defining cell-count range. As a grade descriptor it reports the grade the clinician has observed.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the SUN anterior chamber cell grade; it never asserts a diagnosis, a
// treatment decision, or a prognosis (lib/sun-ac-cell-v421.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sun-ac-cell-v421.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the ophthalmology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'sun-ac-cell'(root) {
    note(root, 'SUN (Standardization of Uveitis Nomenclature) anterior chamber cell grade, the grading of anterior-chamber inflammatory cells by the number counted in a 1 mm by 1 mm slit-lamp beam field. Pick the grade. 0: <1 cell; 0.5+: 1-5; 1+: 6-15; 2+: 16-25; 3+: 26-50; 4+: >50. Grades cells (activity), a separate scale from anterior chamber flare. Near-neighbor: shaffer-angle.');
    root.appendChild(select('SUN anterior chamber cell grade', 'sun-cell', [
      ['0', '0 - less than 1 cell'],
      ['0.5+', '0.5+ - 1 to 5 cells'],
      ['1+', '1+ - 6 to 15 cells'],
      ['2+', '2+ - 16 to 25 cells'],
      ['3+', '3+ - 26 to 50 cells'],
      ['4+', '4+ - more than 50 cells'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['sun-cell'], () => safe(o, () => {
      const r = M.sunAcCell({ grade: val('sun-cell') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
