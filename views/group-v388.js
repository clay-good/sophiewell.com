// spec-v388: renderer for the Brodsky tonsil grading scale (grades 0-4). Group G. The clinician picks the
// grade; the tile reports the grade, its oropharyngeal-width description, and whether it is an obstructive
// (grade 3-4) size.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Brodsky grade; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/brodsky-tonsil-v388.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/brodsky-tonsil-v388.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the treating team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'brodsky-tonsil'(root) {
    note(root, 'Brodsky grading scale for palatine tonsil size, by the percentage of the oropharyngeal width the tonsils occupy. Pick the grade. 0: within the fossa; 1: <25%; 2: 25-50%; 3: 50-75%; 4: >75% ("kissing tonsils"). Grades 3-4 are obstructive. Near-neighbors: stop-bang.');
    root.appendChild(select('Brodsky grade', 'brodsky-grade', [
      ['0', 'Grade 0 - within the tonsillar fossa'],
      ['1', 'Grade 1 - < 25% of the width'],
      ['2', 'Grade 2 - 25-50%'],
      ['3', 'Grade 3 - 50-75%'],
      ['4', 'Grade 4 - > 75% (kissing tonsils)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['brodsky-grade'], () => safe(o, () => {
      const r = M.brodskyTonsil({ grade: val('brodsky-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
