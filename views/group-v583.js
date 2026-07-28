// spec-v583: renderer for the NAC / Gillmore ATTR cardiac amyloidosis stage. Group G. Sections are h2 (an h3
// under the page h1 is a heading-level skip). Both versions are shown side by side rather than the newer one
// replacing the older, because they disagree for a defined and clinically real group of patients
// (lib/nac-attr-stage-v583.js).
//
// Per spec-v11 section 5.3 this stages a patient who already has the diagnosis; it never diagnoses
// amyloidosis, never separates transthyretin from light-chain disease, and never selects or withholds
// tafamidis.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/nac-attr-stage-v583.js';
import { resultRow } from '../lib/result-copy.js';

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
  'nac-attr-stage'(root) {
    note(root, 'For a patient who already has a diagnosis of transthyretin cardiac amyloidosis. Both the original three-stage system and the 2024 four-stage expansion are reported, because they disagree for a real group of patients: stage 4 is defined irrespective of eGFR, so it cuts across the original stages rather than extending stage 3.');

    heading(root, 'Biomarkers');
    root.appendChild(number(`NT-proBNP (ng/L — pg/mL is numerically identical) — the original threshold is ${M.NTPROBNP_THRESHOLD}, the stage 4 threshold ${M.STAGE4_THRESHOLD}`, 'nac-bnp'));
    root.appendChild(number(`eGFR (ml/min) — the threshold is ${M.EGFR_THRESHOLD}`, 'nac-egfr'));
    note(root, M.EGFR_EQUATION_NOTE);

    const o = out(); root.appendChild(o);
    wire(['nac-bnp', 'nac-egfr'], () => safe(o, () => {
      const r = M.nacAttrStage({ ntProBnp: val('nac-bnp'), egfr: val('nac-egfr') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: '2024 expansion', value: `Stage ${r.expandedStage}` },
        { label: 'Original system', value: `Stage ${r.originalStage}` },
        { label: '1-year mortality', value: `${r.oneYearMortalityPercent}%` },
        { label: 'Median survival', value: r.medianSurvivalMonths === null ? 'not reached' : `${r.medianSurvivalMonths} months` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'How the two versions differ');
    note(root, M.OVERLAP_NOTE);
    note(root, M.CUTPOINT_NOTE);
    postureNote(root);
  },
};
