// spec-v549: renderer for the POSEIDON classification of low-prognosis patients in assisted reproduction.
// Group G. Inputs under an h2 section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The two reserve markers are ALTERNATIVES, so both fields are optional individually and the lib requires
// only one of them. The prior-cycle question and the oocyte count matter only when reserve is adequate,
// because groups 3 and 4 are assignable with no prior cycle at all; the fields are always shown and the lib
// asks for what it still needs, so the form never silently drops an input the reader already typed
// (lib/poseidon-v549.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile assigns a descriptive
// research group; it never diagnoses infertility and never selects a stimulation protocol.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/poseidon-v549.js';
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
function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
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
  poseidon(root) {
    note(root, 'The POSEIDON classification stratifies low-prognosis patients in assisted reproduction on two axes — age and ovarian reserve — into four groups. Only groups 1 and 2 are subdivided into a and b by the oocyte yield of a prior cycle; there is no group 3a or 4b. Groups 1 and 2 require a prior conventional-stimulation cycle, because their defining feature is an unexpectedly poor response; groups 3 and 4 need none, because poor reserve is measurable up front. Adequate reserve with 10 or more oocytes is not a POSEIDON group at all — the scheme describes low-prognosis patients, and a normal responder falls outside it.');

    heading(root, 'Age and ovarian reserve');
    root.appendChild(number('Age (years) — the classification splits at 35', 'poseidon-age', '1'));
    note(root, 'The two reserve markers are alternatives, not both required: the criterion is an antral follicle count of 5 or more and/or anti-Mullerian hormone of 1.2 ng/mL or more. Enter either one, or both. If both are entered and they disagree, reserve is graded adequate and the disagreement is reported.');
    root.appendChild(number('Antral follicle count (follicles) — optional if anti-Mullerian hormone is given', 'poseidon-afc', '1'));
    root.appendChild(number('Anti-Mullerian hormone (ng/mL) — optional if the antral follicle count is given', 'poseidon-amh', '0.01'));

    heading(root, 'Prior stimulation cycle');
    note(root, 'Needed only when reserve is adequate. Groups 3 and 4 are assignable with no prior cycle.');
    root.appendChild(select('Has a prior conventional-stimulation cycle been done?', 'poseidon-prior',
      [['', 'Select'], ['no', 'No'], ['yes', 'Yes']]));
    root.appendChild(number('Oocytes retrieved in that cycle', 'poseidon-oocytes', '1'));

    const o = out(); root.appendChild(o);
    wire(['poseidon-age', 'poseidon-afc', 'poseidon-amh', 'poseidon-prior', 'poseidon-oocytes'], () => safe(o, () => {
      const r = M.poseidon({
        age: val('poseidon-age'), afc: val('poseidon-afc'), amh: val('poseidon-amh'),
        priorCycle: val('poseidon-prior'), oocytes: val('poseidon-oocytes'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Group', value: r.classified ? r.groupLabel : r.groupLabel },
        { label: 'Ovarian reserve', value: r.adequateReserve ? 'adequate' : 'poor' },
        { label: 'Markers agree', value: r.markersDiscordant ? 'no — one adequate, one poor' : 'yes, or only one marker given' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
