// spec-v600: renderer for the original Fisher grade. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The compartment question is asked FIRST and separately from the subarachnoid
// description, because grade 4 is decided by WHERE the blood is rather than how much there is
// (lib/fisher-grade-v600.js).
//
// Per spec-v11 section 5.3 this grades a scan appearance; it never diagnoses subarachnoid hemorrhage, never
// grades clinical severity, and never indicates or relaxes vasospasm monitoring.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/fisher-grade-v600.js';
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
  'fisher-grade'(root) {
    note(root, 'The grades are NOT ordinal for vasospasm risk: risk rises from grade 1 to grade 3, and grade 4 does not continue the trend. The modified Fisher scale on this site is a different construction, not a renumbering.');

    heading(root, 'The compartment — this decides grade 4');
    root.appendChild(select('Intracerebral or intraventricular blood?', 'fish-ivh',
      [['', '--'], ['no', 'No'], ['yes', 'Yes']]));
    note(root, M.COMPARTMENT_NOTE);

    heading(root, 'The subarachnoid blood');
    root.appendChild(select('Subarachnoid blood on CT', 'fish-sah', [
      ['', '--'],
      ['none', 'None detected'],
      ['thin', `Diffuse or vertical layer less than ${M.THICKNESS_THRESHOLD_MM} mm thick`],
      ['thick-or-localized-clot', `Localized clot, or a vertical layer ${M.THICKNESS_THRESHOLD_MM} mm thick or more`],
    ]));
    note(root, M.CT_ERA_NOTE);

    const o = out(); root.appendChild(o);
    wire(['fish-ivh', 'fish-sah'], () => safe(o, () => {
      const r = M.fisherGrade({
        intracerebralOrIntraventricular: val('fish-ivh'),
        subarachnoidBlood: val('fish-sah'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Compartment', value: r.compartment },
        { label: 'Graded by compartment', value: r.gradedByCompartment ? 'yes' : 'no' },
        { label: 'Highest vasospasm risk on the scale', value: r.carriesHighestVasospasmRisk ? 'YES' : 'no' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Why the numbers do not order the risk');
    note(root, M.NON_ORDINAL_NOTE);
    note(root, M.SPECK_NOTE);
    note(root, M.NO_MAPPING_NOTE);
    postureNote(root);
  },
};
