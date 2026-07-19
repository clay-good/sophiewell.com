// spec-v432: renderer for the Baden-Walker prolapse grade (0-4). Group G. The clinician picks the grade; the
// tile reports the grade and its examination description. As a grade descriptor it reports the grade the
// clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the Baden-Walker grade; it never asserts a diagnosis, a treatment decision,
// or a prognosis (lib/baden-walker-v432.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/baden-walker-v432.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the gynecology / urogynecology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'baden-walker'(root) {
    note(root, 'The Baden-Walker halfway system for grading pelvic organ prolapse, by the position of the leading edge relative to the hymen at maximum strain. Pick the grade. 0: normal position; 1: halfway to the hymen; 2: to the hymen; 3: halfway past the hymen; 4: maximum descent (complete prolapse / procidentia). Reports the grade the clinician has determined, not a diagnosis or a treatment decision.');
    root.appendChild(select('Baden-Walker grade', 'bw-grade', [
      ['0', '0 - normal position, no descent'],
      ['1', '1 - descent halfway to the hymen'],
      ['2', '2 - descent to the hymen'],
      ['3', '3 - descent halfway past the hymen'],
      ['4', '4 - maximum descent (procidentia)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['bw-grade'], () => safe(o, () => {
      const r = M.badenWalker({ grade: val('bw-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
