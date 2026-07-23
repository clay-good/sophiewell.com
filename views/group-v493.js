// spec-v493: renderer for the Lown grading of ventricular ectopy (grades 0-5, with 4A/4B). Group G. The
// clinician picks the grade; the tile reports the grade and its ectopy description. As a grade descriptor it
// reports the grade the clinician has determined.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile reports the Lown grade; it never asserts a diagnosis, an antiarrhythmic
// decision, or a sudden-death risk prediction (lib/lown-ectopy-v493.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lown-ectopy-v493.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the cardiology team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'lown-ectopy'(root) {
    note(root, 'The Lown grading system for ventricular ectopy on an ambulatory ECG (Holter) recording, by the frequency and form of the ventricular ectopic beats. Pick the grade. 0: none; 1: occasional isolated beats (fewer than 30 per hour); 2: frequent beats (30 or more per hour); 3: multiform beats; 4A: couplets; 4B: salvos (three or more consecutive beats); 5: the R-on-T phenomenon. Reports the grade the clinician has determined, not a diagnosis or an antiarrhythmic decision. Near-neighbor: vaughan-williams.');
    root.appendChild(select('Lown grade', 'lown-grade', [
      ['0', '0 - no ventricular ectopic beats'],
      ['1', '1 - occasional, isolated (fewer than 30 per hour)'],
      ['2', '2 - frequent (30 or more per hour)'],
      ['3', '3 - multiform (polymorphic)'],
      ['4A', '4A - couplets (two consecutive)'],
      ['4B', '4B - salvos (three or more consecutive)'],
      ['5', '5 - R-on-T phenomenon'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['lown-grade'], () => safe(o, () => {
      const r = M.lownEctopy({ grade: val('lown-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
