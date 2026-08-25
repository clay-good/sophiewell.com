// spec-v588: renderer for the ESHRE Bologna criteria. Group G. Sections are h2 (an h3 under the page h1 is a
// heading-level skip). The two ovarian-reserve cutoffs are their own inputs with NO preselected value,
// because the consensus publishes ranges rather than numbers and defaulting one would hide the choice
// (lib/bologna-por-v588.js).
//
// Per spec-v11 section 5.3 this applies a definition; it never sets a stimulation protocol or a dose, and is
// never presented as a reason to decline treatment.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/bologna-por-v588.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
  return wrap;
}
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
const YN = [['', '--'], ['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  'bologna-por'(root) {
    note(root, `At least ${M.CRITERIA_REQUIRED} of three criteria — with an override that needs only one. The POSEIDON classification on this site was proposed because these criteria group women with very different prognoses.`);

    heading(root, 'Criterion 1 — advanced maternal age, or any other risk factor');
    root.appendChild(number('Age (years)', 'bol-age', '1'));
    root.appendChild(select('Any other risk factor for poor ovarian response?', 'bol-risk', YN));
    note(root, M.AGE_CRITERION_NOTE);

    heading(root, 'Criterion 2 — a previous poor response');
    root.appendChild(select(`Previous cycle yielding ${M.PREVIOUS_POR_OOCYTES} or fewer oocytes after a CONVENTIONAL stimulation protocol?`, 'bol-prev', YN));
    note(root, M.PROTOCOL_NOTE);
    root.appendChild(number('Episodes of poor response after MAXIMAL stimulation', 'bol-episodes', '1'));
    note(root, M.OVERRIDE_NOTE);

    heading(root, 'Criterion 3 — an abnormal ovarian reserve test');
    note(root, M.RANGE_NOTE);
    root.appendChild(number('Antral follicle count', 'bol-afc', '1'));
    root.appendChild(number(`Your center’s antral follicle count cutoff (published range ${M.AFC_CUTOFF_RANGE.low} to ${M.AFC_CUTOFF_RANGE.high})`, 'bol-afc-cut', '1'));
    root.appendChild(number('AMH (ng/mL)', 'bol-amh', 'any'));
    root.appendChild(number(`Your center’s AMH cutoff in ng/mL (published range ${M.AMH_CUTOFF_RANGE.low} to ${M.AMH_CUTOFF_RANGE.high})`, 'bol-amh-cut', 'any'));

    const ids = ['bol-age', 'bol-risk', 'bol-prev', 'bol-episodes', 'bol-afc', 'bol-afc-cut', 'bol-amh', 'bol-amh-cut'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.bolognaPor({
        age: val('bol-age'), otherRiskFactor: val('bol-risk'),
        previousPorConventional: val('bol-prev'),
        maximalStimulationPorEpisodes: val('bol-episodes'),
        afc: val('bol-afc'), afcCutoff: val('bol-afc-cut'),
        amh: val('bol-amh'), amhCutoff: val('bol-amh-cut'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Criteria met', value: `${r.criteriaMet} of 3` },
        { label: 'Required', value: `${r.criteriaRequired} of 3, or the override` },
        { label: 'Qualified by override', value: r.qualifiedByOverride ? 'yes' : 'no' },
        { label: 'Cutoff-sensitive', value: r.cutoffSensitive ? 'YES — would flip under another permissible cutoff' : 'no' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
