// spec-v211 §2: renderers for the hematology-oncology risk-stratification
// instruments — EUTOS, IMPROVEDD, COMPASS-CAT, and ELN 2022 AML. Group G.
// Shipped one tile at a time. (hct-ci is already live from spec-v199 — not
// rendered here.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the chemotherapy / transplant /
// thromboprophylaxis decision to the clinician and the patient (spec-v11 §5.3) —
// these stratify risk, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heme-onc-risk-v211.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', step: 'any', inputmode: 'decimal', ...attrs });
}
function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The chemotherapy, transplant, and thromboprophylaxis decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 eutos -----------------------------------------------------------
  eutos(root) {
    note(root, 'EUTOS score (Hasford 2011): a simple two-variable prognostic score for CML on front-line imatinib — EUTOS = 7 × basophils (%) + 4 × spleen size (cm below the costal margin). > 87 high risk, ≤ 87 low risk, for the 18-month complete cytogenetic response and progression-free survival. Near-neighbors: sokal-cml, ipss-r-mds.');
    root.appendChild(num('Basophils (% of peripheral blood)', 'eutos-baso', { min: '0' }));
    root.appendChild(num('Spleen size (cm below costal margin; 0 if not palpable)', 'eutos-spleen', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['eutos-baso', 'eutos-spleen'];
    wire(ids, () => safe(o, () => {
      const r = M.eutos({ basophils: val('eutos-baso'), spleenCm: val('eutos-spleen') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'EUTOS', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 improvedd -------------------------------------------------------
  improvedd(root) {
    note(root, 'IMPROVEDD VTE risk score (Gibson 2017): the D-dimer-augmented inpatient medical-VTE stratifier — the seven IMPROVE items plus D-dimer ≥ 2× ULN (+2); total 0–14. Risk: low 0–1, moderate 2–3, high ≥ 4; a total ≥ 2 is the threshold for discussing extended thromboprophylaxis. Near-neighbors: improve-vte, improve-bleeding.');
    const items = [
      ['imdd-vte', 'Previous VTE (+3)'],
      ['imdd-thromb', 'Known thrombophilia (+2)'],
      ['imdd-paralysis', 'Current lower-limb paralysis (+2)'],
      ['imdd-cancer', 'Active cancer (+2)'],
      ['imdd-immob', 'Immobilization ≥ 7 days (+1)'],
      ['imdd-icu', 'ICU / CCU stay (+1)'],
      ['imdd-age', 'Age > 60 (+1)'],
      ['imdd-ddimer', 'D-dimer ≥ 2× upper limit of normal (+2)'],
    ];
    for (const [id, label] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = items.map((i) => i[0]);
    wire(ids, () => safe(o, () => {
      const r = M.improvedd({
        previousVte: chk('imdd-vte'), thrombophilia: chk('imdd-thromb'), paralysis: chk('imdd-paralysis'), cancer: chk('imdd-cancer'),
        immobilization: chk('imdd-immob'), icu: chk('imdd-icu'), ageOver60: chk('imdd-age'), dDimer: chk('imdd-ddimer'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'IMPROVEDD', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 compass-cat -----------------------------------------------------
  'compass-cat'(root) {
    note(root, 'COMPASS-CAT (Gerotziafas 2017): a VTE risk-assessment model for ambulatory patients with breast, colorectal, lung, or ovarian cancer on active treatment; total 0–28, dichotomized 0–6 low/intermediate vs ≥ 7 high 6-month VTE risk. A complement to Khorana. Near-neighbors: khorana, padua.');
    const items = [
      ['cc-antihorm', 'Anti-hormonal or anthracycline therapy (+6)'],
      ['cc-diag6mo', 'Cancer diagnosis ≤ 6 months ago (+4)'],
      ['cc-cvc', 'Central venous catheter (+3)'],
      ['cc-stage', 'Advanced-stage cancer (+2)'],
      ['cc-cvrisk', 'Cardiovascular risk factors (+5)'],
      ['cc-hosp', 'Recent hospitalization for acute medical illness (+5)'],
      ['cc-vte', 'Personal history of VTE (+1)'],
      ['cc-plt', 'Platelet count ≥ 350 ×10⁹/L (+2)'],
    ];
    for (const [id, label] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = items.map((i) => i[0]);
    wire(ids, () => safe(o, () => {
      const r = M.compassCat({
        antiHormonalAnthracycline: chk('cc-antihorm'), diagWithin6mo: chk('cc-diag6mo'), cvc: chk('cc-cvc'), advancedStage: chk('cc-stage'),
        cvRiskFactors: chk('cc-cvrisk'), recentHospitalization: chk('cc-hosp'), priorVte: chk('cc-vte'), platelets350: chk('cc-plt'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'COMPASS-CAT', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
