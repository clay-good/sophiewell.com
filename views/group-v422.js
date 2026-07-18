// spec-v422: renderer for the SUN anterior chamber flare grade (0/1+/2+/3+/4+). Group G. The clinician picks
// the grade (from the aqueous flare observed at the slit lamp); the tile reports the grade and its
// description. As a grade descriptor it reports the grade the clinician has observed.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 §5.3 the tile reports the SUN anterior chamber flare grade; it never asserts a diagnosis, a
// treatment decision, or a prognosis (lib/sun-ac-flare-v422.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/sun-ac-flare-v422.js';
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
  'sun-ac-flare'(root) {
    note(root, 'SUN (Standardization of Uveitis Nomenclature) anterior chamber flare grade, the grading of aqueous flare (the scatter of the slit-lamp beam by anterior-chamber protein). Pick the grade. 0: none; 1+: faint; 2+: moderate (iris and lens details clear); 3+: marked (iris and lens details hazy); 4+: intense (fibrin or plasmoid aqueous). Grades flare (protein leak), a separate scale from anterior chamber cells. Near-neighbors: sun-ac-cell, shaffer-angle.');
    root.appendChild(select('SUN anterior chamber flare grade', 'sunf-grade', [
      ['0', '0 - none'],
      ['1+', '1+ - faint'],
      ['2+', '2+ - moderate (iris and lens details clear)'],
      ['3+', '3+ - marked (iris and lens details hazy)'],
      ['4+', '4+ - intense (fibrin or plasmoid aqueous)'],
    ]));

    const o = out(); root.appendChild(o);
    wire(['sunf-grade'], () => safe(o, () => {
      const r = M.sunAcFlare({ grade: val('sunf-grade') });
      resultRow(o, [
        { text: r.band },
        { label: 'Grade', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
