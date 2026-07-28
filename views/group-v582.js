// spec-v582: renderer for the HLH-2004 diagnostic criteria. Group G. Sections are h2 (an h3 under the page
// h1 is a heading-level skip). The molecular question is deliberately placed FIRST and in its own section,
// because it is an alternative path that establishes the diagnosis on its own
// (lib/hlh-2004-v582.js).
//
// Per spec-v11 section 5.3 the tile applies diagnostic criteria from a treatment protocol; it never starts
// chemotherapy or immunosuppression, and it never reports a pending assay as a failed criterion.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hlh-2004-v582.js';
import { resultRow } from '../lib/result-copy.js';

const TRI = [['', '--'], ['yes', 'Yes'], ['no', 'No'], ['pending', 'Pending / not done']];
const YN = [['', '--'], ['yes', 'Yes'], ['no', 'No']];

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
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
  'hlh-2004'(root) {
    note(root, `HLH-2004 establishes the diagnosis if EITHER a molecular diagnosis is present OR ${M.CRITERIA_REQUIRED} of ${M.CRITERIA_TOTAL} criteria are met. Leave a send-out assay as "pending" rather than answering no — pending is not the same as not met, and this tool keeps them apart. (Distinct from the HScore in this catalog, which returns a probability of reactive hemophagocytic syndrome in adults.)`);

    heading(root, 'The alternative path');
    root.appendChild(select('Molecular diagnosis consistent with HLH?', 'hlh-molecular', YN));
    note(root, 'This establishes the diagnosis on its own, with none of the eight criteria.');

    heading(root, 'Clinical criteria');
    root.appendChild(select('Fever', 'hlh-fever', TRI));
    note(root, M.FEVER_NOTE);
    root.appendChild(select('Splenomegaly', 'hlh-spleen', TRI));
    root.appendChild(select('Hemophagocytosis in bone marrow, spleen or lymph nodes', 'hlh-hemophag', TRI));

    heading(root, 'Cytopenias — one criterion, requiring 2 of 3 lineages');
    root.appendChild(select('Infant under 4 weeks old?', 'hlh-infant', YN));
    root.appendChild(number(`Hemoglobin (g/dL) — low is under ${M.HB_THRESHOLD}, or under ${M.HB_THRESHOLD_INFANT} in infants under 4 weeks`, 'hlh-hb'));
    root.appendChild(number(`Platelets (x10^9/L) — low is under ${M.PLT_THRESHOLD}`, 'hlh-plt'));
    root.appendChild(number(`Neutrophils (x10^9/L) — low is under ${M.ANC_THRESHOLD}`, 'hlh-anc'));

    heading(root, 'Triglycerides and/or fibrinogen — one criterion, met by either');
    root.appendChild(number(`Fasting triglycerides (mg/dL) — meets at ${M.TRIG_THRESHOLD} or above`, 'hlh-trig'));
    root.appendChild(number(`Fibrinogen (mg/dL) — meets at ${M.FIBRINOGEN_THRESHOLD} or below`, 'hlh-fib'));

    heading(root, 'Send-out assays');
    root.appendChild(select('NK-cell activity low or absent, by local laboratory reference?', 'hlh-nk', TRI));
    note(root, M.NK_NOTE);
    root.appendChild(number(`Ferritin (micrograms/L, numerically the same as ng/mL) — meets at ${M.FERRITIN_THRESHOLD} or above`, 'hlh-ferritin'));
    root.appendChild(select('Soluble CD25 result available?', 'hlh-scd25-status',
      [['', '--'], ['resulted', 'Resulted'], ['pending', 'Pending / not done']]));
    root.appendChild(number(`Soluble CD25 (U/mL) — meets at ${M.SCD25_THRESHOLD} or above`, 'hlh-scd25'));
    note(root, 'The one assay in the set whose turnaround is routinely measured in days. Mark it pending rather than answering it low — pending is not the same as not met.');

    heading(root, 'Reported but not counted');
    root.appendChild(select('No evidence of malignancy?', 'hlh-malignancy', YN));
    note(root, M.MALIGNANCY_NOTE);

    const ids = ['hlh-molecular', 'hlh-fever', 'hlh-spleen', 'hlh-hemophag', 'hlh-infant', 'hlh-hb',
      'hlh-plt', 'hlh-anc', 'hlh-trig', 'hlh-fib', 'hlh-nk', 'hlh-ferritin', 'hlh-scd25-status', 'hlh-scd25', 'hlh-malignancy'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.hlh2004({
        molecularDiagnosis: val('hlh-molecular'), fever: val('hlh-fever'), splenomegaly: val('hlh-spleen'),
        hemophagocytosis: val('hlh-hemophag'), infantUnder4Weeks: val('hlh-infant'),
        hemoglobin: val('hlh-hb'), platelets: val('hlh-plt'), neutrophils: val('hlh-anc'),
        triglycerides: val('hlh-trig'), fibrinogen: val('hlh-fib'), nkCellActivity: val('hlh-nk'),
        ferritin: val('hlh-ferritin'), scd25: val('hlh-scd25'), scd25Status: val('hlh-scd25-status'),
        noEvidenceOfMalignancy: val('hlh-malignancy'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Criteria met', value: `${r.criteriaMet} of ${r.criteriaTotal}` },
        { label: 'Required', value: `${r.criteriaRequired} of ${r.criteriaTotal}` },
        { label: 'Pending', value: r.pendingCriteria.length ? r.pendingCriteria.join(', ') : 'none' },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
