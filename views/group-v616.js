// spec-v616: renderer for the Frisen papilledema scale. Group G. Sections are h2 (an h3 under the page h1 is
// a heading-level skip). The grade is DERIVED from the findings rather than picked from a list, so the
// cumulative rule is enforced and contradictions are surfaced (lib/frisen-v616.js).
//
// Per spec-v11 section 5.3 this grades a disc appearance; it never diagnoses, never measures intracranial
// pressure, and never decides imaging, lumbar puncture or treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/frisen-v616.js';
import { resultRow } from '../lib/result-copy.js';

const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];

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

const aid = (k) => `frisen-${k}`;

export const renderers = {
  frisen(root) {
    note(root, M.CUMULATIVE_NOTE);

    heading(root, 'The peripapillary halo');
    root.appendChild(select('Halo appearance', 'frisen-halo',
      [['', '--'], ...M.HALO_STATES.map((h) => [h.value, h.text])]));
    note(root, M.TEMPORAL_GAP_NOTE);

    heading(root, 'Vessel obscuration — total, not partial');
    for (const v of M.VESSEL_FINDINGS) root.appendChild(select(v.text, aid(v.key), YN));
    note(root, M.PARTIAL_NOTE);

    const o = out(); root.appendChild(o);
    const ids = ['frisen-halo', ...M.VESSEL_FINDINGS.map((v) => aid(v.key))];
    wire(ids, () => safe(o, () => {
      const input = { halo: val('frisen-halo') };
      for (const v of M.VESSEL_FINDINGS) input[v.key] = val(aid(v.key));
      const r = M.frisenGrade(input);
      if (!r.valid) { note(o, r.message); return; }
      const row = [{ text: r.bandLabel }];
      if (r.grade !== null) row.push({ label: 'Grade', value: `${r.grade}` });
      row.push({ label: 'Consistent', value: r.consistent ? 'Yes' : 'No' });
      resultRow(o, row);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'Where the grades divide');
    note(root, M.LOCATION_NOTE);
    note(root, M.SPARED_NOTE);
    heading(root, 'What the grade is not');
    note(root, M.NOT_PRESSURE_NOTE);
    postureNote(root);
  },
};
