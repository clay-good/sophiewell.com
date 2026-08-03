// spec-v639 §2: renderer for gpa-acr-eular-2022 — the 2022 ACR/EULAR
// Classification Criteria for Granulomatosis with Polyangiitis (Clinical Scoring
// & Risk, Group G). The third 2022 ACR/EULAR vasculitis tile, after
// gca-acr-eular-2022 and takayasu-acr-eular-2022 (group-v148.js / group-v638.js).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two items
// carry NEGATIVE weights (positive pANCA/MPO, blood eosinophilia); the labels show
// the sign. There is no absolute-requirement gate: the items sum directly, and the
// note states the small/medium-vessel-vasculitis context in which the rule applies.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gpa-v639.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The classification is the cited criteria set’s, computed from the bounded inputs you entered — the tile takes your read, it does not interpret a scan, lab, or biopsy on its own. Classification criteria are built to standardize study cohorts, not to diagnose an individual; the diagnosis and the management decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gpa-acr-eular-2022'(root) {
    note(root, '2022 ACR/EULAR granulomatosis-with-polyangiitis classification (Robson 2022): apply only after a small/medium-vessel-vasculitis diagnosis with mimics excluded. Ten weighted items sum to a range of -5 to +17; ≥ 5 classifies as GPA. Two items are negative (positive pANCA/MPO, blood eosinophilia) because they point toward MPA and EGPA. Companion tiles: gca-acr-eular-2022, takayasu-acr-eular-2022.');
    root.appendChild(checkField('Nasal involvement — bloody discharge, ulcers, crusting, congestion, blockage, or septal defect/perforation (+3)', 'gpa-nasal'));
    root.appendChild(checkField('Cartilaginous involvement — ear/nose cartilage, hoarse voice or stridor, endobronchial, or saddle nose deformity (+2)', 'gpa-cartilage'));
    root.appendChild(checkField('Conductive or sensorineural hearing loss (+1)', 'gpa-hearing'));
    root.appendChild(checkField('Positive cANCA or anti-PR3 antibody (+5)', 'gpa-canca'));
    root.appendChild(checkField('Pulmonary nodules, mass, or cavitation on chest imaging (+2)', 'gpa-pulm'));
    root.appendChild(checkField('Granuloma, extravascular granulomatous inflammation, or giant cells on biopsy (+2)', 'gpa-granuloma'));
    root.appendChild(checkField('Inflammation, consolidation, or effusion of the nasal/paranasal sinuses, or mastoiditis on imaging (+1)', 'gpa-sinus'));
    root.appendChild(checkField('Pauci-immune glomerulonephritis on biopsy (+1)', 'gpa-gn'));
    root.appendChild(checkField('Positive pANCA or anti-MPO antibody (-1)', 'gpa-panca'));
    root.appendChild(checkField('Blood eosinophil count ≥ 1 x10^9/L (-4)', 'gpa-eos'));
    const ids = ['gpa-nasal', 'gpa-cartilage', 'gpa-hearing', 'gpa-canca', 'gpa-pulm', 'gpa-granuloma', 'gpa-sinus', 'gpa-gn', 'gpa-panca', 'gpa-eos'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.gpaAcrEular2022({
        nasal: chk('gpa-nasal'), cartilage: chk('gpa-cartilage'), hearingLoss: chk('gpa-hearing'),
        cAnca: chk('gpa-canca'), pulmNodule: chk('gpa-pulm'), granuloma: chk('gpa-granuloma'),
        sinus: chk('gpa-sinus'), pauciGn: chk('gpa-gn'), pAnca: chk('gpa-panca'), eosinophilia: chk('gpa-eos'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/17` },
        { label: 'Result', value: r.bandLabel },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
