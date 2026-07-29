// spec-v612: renderer for the University of Texas diabetic foot wound classification. Group G. Sections are
// h2 (an h3 under the page h1 is a heading-level skip). Grade and stage are two SEPARATE selects, never one
// combined list, because the point of this classification is that the two axes are read together
// (lib/ut-diabetic-foot-v612.js).
//
// Per spec-v11 section 5.3 this describes an ulcer; it never diagnoses infection or ischemia and never
// decides antibiotics, revascularization or amputation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ut-diabetic-foot-v612.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  s.appendChild(el('option', { value: '', text: '--' }));
  for (const o of options) s.appendChild(el('option', { value: o.value, text: `${o.value} - ${o.text}` }));
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
  'ut-diabetic-foot'(root) {
    note(root, M.MATRIX_NOTE);

    heading(root, 'Grade — how deep the ulcer reaches');
    root.appendChild(select('Grade', 'utdf-grade', M.GRADES));
    note(root, M.LADDER_NOTE);

    heading(root, 'Stage — infection and ischemia');
    root.appendChild(select('Stage', 'utdf-stage', M.STAGES));
    note(root, M.STAGE_NOTE);

    const o = out(); root.appendChild(o);
    wire(['utdf-grade', 'utdf-stage'], () => safe(o, () => {
      const r = M.utDiabeticFoot({ grade: val('utdf-grade'), stage: val('utdf-stage') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Grade', value: r.grade },
        { label: 'Stage', value: r.stage },
        { label: 'Infection', value: r.infection ? 'Yes' : 'No' },
        { label: 'Ischemia', value: r.ischemia ? 'Yes' : 'No' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Grade 0 is not "no problem"');
    note(root, M.GRADE_ZERO_NOTE);
    heading(root, 'On Wagner, and on outcome figures');
    note(root, M.WAGNER_NOTE);
    note(root, M.OUTCOME_NOTE);
    postureNote(root);
  },
};
