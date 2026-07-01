// spec-v187 §2: renderers for the five solid-tumor staging / response /
// inflammation-prognosis tiles — BCLC stage, IMDC & MSKCC metastatic-RCC risk,
// RECIST 1.1 response, and the modified Glasgow Prognostic Score. Groups G
// (classification / score) and E (RECIST math).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. RECIST
// guards the baseline / nadir divisors in lib/onc-staging-v187.js. Per the
// spec-v50 §3 posture note each tile defers the therapy / allocation decision to
// the tumor board and patient (spec-v11 §5.3) — these stage and prognosticate,
// they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/onc-staging-v187.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, ...attrs }));
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function pickField(label, id, options) {
  return selectField(label, id, [{ value: '', text: '— choose —' }, ...options]);
}
function num(label, id) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal' });
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The stage, risk group, or response category is the cited source’s, computed from the inputs you enter. The therapy and transplant-allocation decisions stay with the tumor board and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ECOG_OPTS = [
  { value: '0', text: '0 — fully active' },
  { value: '1', text: '1 — restricted, ambulatory' },
  { value: '2', text: '2 — ambulatory, up > 50%' },
  { value: '3', text: '3 — limited self-care' },
  { value: '4', text: '4 — completely disabled' },
];
const CHILD_OPTS = [
  { value: 'A', text: 'A — preserved' },
  { value: 'B', text: 'B — moderate dysfunction' },
  { value: 'C', text: 'C — decompensated' },
];
const BURDEN_OPTS = [
  { value: 'very-early', text: 'Single nodule ≤ 2 cm' },
  { value: 'early', text: 'Single > 2 cm or ≤ 3 nodules each ≤ 3 cm' },
  { value: 'intermediate', text: 'Multinodular, no invasion / spread' },
  { value: 'advanced', text: 'Portal invasion or extrahepatic spread' },
];

export const renderers = {
  // ----- 2.1 bclc-hcc --------------------------------------------------------
  'bclc-hcc'(root) {
    note(root, 'Barcelona Clinic Liver Cancer stage (Llovet 1999; 2022 update): maps ECOG performance status, tumor burden, and Child-Pugh liver function to stage 0/A/B/C/D with the guideline-linked strategy. Near-neighbors: meld-childpugh.');
    root.appendChild(pickField('ECOG performance status', 'bclc-ecog', ECOG_OPTS));
    root.appendChild(pickField('Child-Pugh class', 'bclc-child', CHILD_OPTS));
    root.appendChild(pickField('Tumor burden', 'bclc-burden', BURDEN_OPTS));
    const o = out(); root.appendChild(o);
    wire(['bclc-ecog', 'bclc-child', 'bclc-burden'], () => safe(o, () => {
      const r = M.bclcHcc({ ecog: val('bclc-ecog'), child: val('bclc-child'), burden: val('bclc-burden') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stage', value: r.stage },
        { label: 'Strategy', value: r.strategy },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 imdc-rcc --------------------------------------------------------
  'imdc-rcc'(root) {
    note(root, 'IMDC (Heng) metastatic RCC risk: six factors, 1 point each (Karnofsky < 80%, dx-to-therapy < 1 y, anemia, hypercalcemia, neutrophilia, thrombocytosis). Favorable 0, intermediate 1–2, poor ≥ 3. Near-neighbors: mskcc-rcc.');
    root.appendChild(checkField('Karnofsky performance status < 80%', 'imdc-karnofsky'));
    root.appendChild(checkField('< 1 year from diagnosis to systemic therapy', 'imdc-dxToTx'));
    root.appendChild(checkField('Anemia (Hb below normal)', 'imdc-anemia'));
    root.appendChild(checkField('Hypercalcemia (corrected Ca above normal)', 'imdc-hypercalcemia'));
    root.appendChild(checkField('Neutrophilia (above normal)', 'imdc-neutrophilia'));
    root.appendChild(checkField('Thrombocytosis (above normal)', 'imdc-thrombocytosis'));
    const o = out(); root.appendChild(o);
    wire(['imdc-karnofsky', 'imdc-dxToTx', 'imdc-anemia', 'imdc-hypercalcemia', 'imdc-neutrophilia', 'imdc-thrombocytosis'], () => safe(o, () => {
      const r = M.imdcRcc({ karnofsky: chk('imdc-karnofsky'), dxToTx: chk('imdc-dxToTx'), anemia: chk('imdc-anemia'), hypercalcemia: chk('imdc-hypercalcemia'), neutrophilia: chk('imdc-neutrophilia'), thrombocytosis: chk('imdc-thrombocytosis') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Factors', value: `${r.score}` },
        { label: 'Risk group', value: r.group },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 mskcc-rcc -------------------------------------------------------
  'mskcc-rcc'(root) {
    note(root, 'MSKCC (Motzer) metastatic RCC risk: five factors, 1 point each (Karnofsky < 80%, LDH > 1.5× ULN, low hemoglobin, high corrected calcium, dx-to-treatment < 1 y). Favorable 0, intermediate 1–2, poor ≥ 3. The historical comparator to IMDC. Near-neighbors: imdc-rcc.');
    root.appendChild(checkField('Karnofsky performance status < 80%', 'mskcc-karnofsky'));
    root.appendChild(checkField('LDH > 1.5× upper limit of normal', 'mskcc-ldh'));
    root.appendChild(checkField('Low hemoglobin (below normal)', 'mskcc-anemia'));
    root.appendChild(checkField('High corrected calcium', 'mskcc-hypercalcemia'));
    root.appendChild(checkField('< 1 year from diagnosis to treatment', 'mskcc-dxToTx'));
    const o = out(); root.appendChild(o);
    wire(['mskcc-karnofsky', 'mskcc-ldh', 'mskcc-anemia', 'mskcc-hypercalcemia', 'mskcc-dxToTx'], () => safe(o, () => {
      const r = M.mskccRcc({ karnofsky: chk('mskcc-karnofsky'), ldh: chk('mskcc-ldh'), anemia: chk('mskcc-anemia'), hypercalcemia: chk('mskcc-hypercalcemia'), dxToTx: chk('mskcc-dxToTx') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Factors', value: `${r.score}` },
        { label: 'Risk group', value: r.group },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 recist ----------------------------------------------------------
  recist(root) {
    note(root, 'RECIST 1.1 tumor response (Eisenhauer 2009): CR (target sum 0); PR (≥ 30% decrease from baseline); PD (≥ 20% increase from nadir and ≥ 5 mm absolute, or a new lesion / non-target progression); SD otherwise. Consumes entered diameters. Near-neighbors: none.');
    root.appendChild(num('Baseline sum of target-lesion diameters (mm)', 'recist-baseline'));
    root.appendChild(num('Current sum of diameters (mm)', 'recist-current'));
    root.appendChild(num('Nadir (smallest recorded) sum of diameters (mm)', 'recist-nadir'));
    root.appendChild(checkField('A new lesion has appeared', 'recist-newLesion'));
    root.appendChild(checkField('Unequivocal non-target progression', 'recist-nonTarget'));
    const o = out(); root.appendChild(o);
    wire(['recist-baseline', 'recist-current', 'recist-nadir', 'recist-newLesion', 'recist-nonTarget'], () => safe(o, () => {
      const r = M.recist({ baseline: val('recist-baseline'), current: val('recist-current'), nadir: val('recist-nadir'), newLesion: chk('recist-newLesion'), nonTarget: chk('recist-nonTarget') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Category', value: r.category },
        { label: 'From baseline', value: `${r.pctBaseline}%` },
        { label: 'From nadir', value: `${r.pctNadir}%` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 glasgow-prognostic-score ----------------------------------------
  'glasgow-prognostic-score'(root) {
    note(root, 'Modified Glasgow Prognostic Score (McMillan 2013): CRP ≤ 10 → 0; CRP > 10 with albumin ≥ 3.5 → 1; CRP > 10 and albumin < 3.5 → 2. A systemic-inflammation-based cancer prognostic score. Near-neighbors: pni-onodera, conut.');
    root.appendChild(num('C-reactive protein (mg/L)', 'mgps-crp'));
    root.appendChild(num('Serum albumin (g/dL)', 'mgps-albumin'));
    const o = out(); root.appendChild(o);
    wire(['mgps-crp', 'mgps-albumin'], () => safe(o, () => {
      const r = M.glasgowPrognosticScore({ crp: val('mgps-crp'), albumin: val('mgps-albumin') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'mGPS', value: `${r.score}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
