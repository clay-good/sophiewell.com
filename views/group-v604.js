// spec-v604: renderer for the Bilsky ESCC scale. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The grade is a select of LABELS, never a number input, because 1a, 1b and 1c are
// distinct grades that all parse to the integer 1 (lib/bilsky-escc-v604.js).
//
// Per spec-v11 section 5.3 this grades an imaging appearance; it never diagnoses the clinical syndrome,
// never measures neurological function, and never indicates surgery, radiotherapy or steroids.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bilsky-escc-v604.js';
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
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'bilsky-escc'(root) {
    note(root, `Assessed on ${M.SEQUENCE}. The other spine tools here grade stability and survival; this one grades the cord.`);

    heading(root, 'The grade');
    root.appendChild(select('ESCC grade', 'escc-grade',
      [['', '--'], ...M.GRADES.map((g) => [g.grade, `${g.grade} — ${g.text}`])]));
    note(root, M.NOT_NUMERIC_NOTE);
    note(root, M.SPLIT_NOTE);

    heading(root, 'Spinal level — optional, and not part of the grade');
    root.appendChild(select('Level', 'escc-level',
      [['', '-- not specified --'], ...M.LEVELS.map((l) => [l.value, `${l.text} (threshold grade ${l.paralysisThresholdGrade})`])]));
    note(root, M.LEVEL_NOTE);

    const o = out(); root.appendChild(o);
    wire(['escc-grade', 'escc-level'], () => safe(o, () => {
      const r = M.bilskyEscc({ grade: val('escc-grade'), level: val('escc-level') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Severity', value: r.severity },
        { label: 'Level', value: r.level || 'not specified' },
        { label: 'At or above the level threshold', value: r.atOrAboveLevelThreshold === null ? 'level not given' : (r.atOrAboveLevelThreshold ? 'YES' : 'no') },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'What the grade does not tell you');
    note(root, M.NEUROLOGY_NOTE);
    note(root, M.IMAGING_NOTE);
    postureNote(root);
  },
};
