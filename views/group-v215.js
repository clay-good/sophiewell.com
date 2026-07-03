// spec-v215 §2: renderers for the lipid / device / oncology risk scores — DLCN
// and Simon Broome FH classifiers, the PADIT CIED-infection score, the GRIm-Score
// and Lung Immune Prognostic Index, and the ONKOTEV and PROTECHT cancer-VTE
// scores. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the statin / device / chemotherapy /
// thromboprophylaxis decision to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/risk-scores-v215.js';
import { resultRow } from '../lib/result-copy.js';

function num(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The statin, device, chemotherapy, and thromboprophylaxis decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: r.score !== undefined ? `${r.score}` : r.bandLabel }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'dlcn-fh-score'(root) {
    note(root, 'Dutch Lipid Clinic Network score (Nordestgaard 2013): family history, clinical history, physical exam, untreated LDL-C band, and DNA mutation. > 8 definite, 6-8 probable, 3-5 possible FH. Near-neighbors: simon-broome-fh, ldl-calc.');
    root.appendChild(select('Family history', 'dlcn-fam', [['0', 'None (0)'], ['1', '1st-degree relative with premature CHD/vascular OR LDL > 95th pct (1)'], ['2', 'Relative with tendon xanthoma/arcus OR child < 18 y LDL > 95th pct (2)']]));
    root.appendChild(select('Personal clinical history', 'dlcn-clin', [['0', 'None (0)'], ['1', 'Premature cerebral / peripheral vascular disease (1)'], ['2', 'Premature coronary heart disease (2)']]));
    root.appendChild(select('Physical examination', 'dlcn-exam', [['0', 'None (0)'], ['4', 'Corneal arcus before age 45 (4)'], ['6', 'Tendon xanthoma (6)']]));
    root.appendChild(num('Untreated LDL-C (mmol/L)', 'dlcn-ldl', { min: '0' }));
    root.appendChild(check('Causative DNA mutation in LDLR / APOB / PCSK9 (+8)', 'dlcn-dna'));
    const o = out(); root.appendChild(o);
    wire(['dlcn-fam', 'dlcn-clin', 'dlcn-exam', 'dlcn-ldl', 'dlcn-dna'], () => safe(o, () => {
      render(o, M.dlcnFh({ familyHistory: val('dlcn-fam'), clinicalHistory: val('dlcn-clin'), physicalExam: val('dlcn-exam'), ldl: val('dlcn-ldl'), dnaMutation: chk('dlcn-dna') }), 'DLCN');
    }));
    postureNote(root);
  },
  'simon-broome-fh'(root) {
    note(root, 'Simon Broome criteria (1991): a cholesterol criterion (adult TC > 7.5 or LDL > 4.9; child TC > 6.7 or LDL > 4.0 mmol/L) plus tendon xanthoma / DNA mutation (definite) or family history of premature MI / raised cholesterol (possible). Near-neighbors: dlcn-fh-score, ldl-calc.');
    root.appendChild(num('Total cholesterol (mmol/L)', 'sb-tc', { min: '0' }));
    root.appendChild(num('LDL-C (mmol/L)', 'sb-ldl', { min: '0' }));
    root.appendChild(check('Child (< 16 years) thresholds', 'sb-child'));
    root.appendChild(check('Tendon xanthoma (patient or relative)', 'sb-xanthoma'));
    root.appendChild(check('Causative DNA mutation (LDLR / APOB / PCSK9)', 'sb-dna'));
    root.appendChild(check('Family history of premature myocardial infarction', 'sb-mi'));
    root.appendChild(check('Family history of raised cholesterol', 'sb-chol'));
    const o = out(); root.appendChild(o);
    wire(['sb-tc', 'sb-ldl', 'sb-child', 'sb-xanthoma', 'sb-dna', 'sb-mi', 'sb-chol'], () => safe(o, () => {
      render(o, M.simonBroomeFh({ totalChol: val('sb-tc'), ldl: val('sb-ldl'), child: chk('sb-child'), tendonXanthoma: chk('sb-xanthoma'), dnaMutation: chk('sb-dna'), famMi: chk('sb-mi'), famChol: chk('sb-chol') }), 'Simon Broome');
    }));
    postureNote(root);
  },
  'padit-score'(root) {
    note(root, 'PADIT score (Birnie 2019): prior procedures, age band, eGFR < 30, immunocompromised, procedure type. Low 0-4, intermediate 5-6, high >= 7 for CIED infection. Near-neighbors: nnis, sofa.');
    root.appendChild(select('Prior CIED procedures', 'padit-prior', [['0', 'None (0)'], ['1', '1 prior (1)'], ['4', '>= 2 prior (4)']]));
    root.appendChild(num('Age (years)', 'padit-age', { min: '0' }));
    root.appendChild(select('Procedure type', 'padit-type', [['0', 'Generator change / de novo pacemaker (0)'], ['2', 'ICD (2)'], ['4', 'CRT (4)'], ['5', 'Revision / upgrade (5)']]));
    root.appendChild(check('Depressed renal function (eGFR < 30) (+1)', 'padit-egfr'));
    root.appendChild(check('Immunocompromised (+3)', 'padit-immuno'));
    const o = out(); root.appendChild(o);
    wire(['padit-prior', 'padit-age', 'padit-type', 'padit-egfr', 'padit-immuno'], () => safe(o, () => {
      render(o, M.padit({ priorProcedures: val('padit-prior'), age: val('padit-age'), procedureType: val('padit-type'), egfrLow: chk('padit-egfr'), immunocompromised: chk('padit-immuno') }), 'PADIT');
    }));
    postureNote(root);
  },
  'grim-score'(root) {
    note(root, 'GRIm-Score (Bigot 2017): one point each for LDH > ULN, albumin < 3.5 g/dL, NLR > 6. Low 0-1, high 2-3 predicts worse survival on immunotherapy. Near-neighbors: lipi, nlr.');
    root.appendChild(num('Serum albumin (g/dL)', 'grim-alb', { min: '0' }));
    root.appendChild(num('Neutrophil-to-lymphocyte ratio', 'grim-nlr', { min: '0' }));
    root.appendChild(check('LDH above upper limit of normal (+1)', 'grim-ldh'));
    const o = out(); root.appendChild(o);
    wire(['grim-alb', 'grim-nlr', 'grim-ldh'], () => safe(o, () => {
      render(o, M.grimScore({ albumin: val('grim-alb'), nlr: val('grim-nlr'), ldhHigh: chk('grim-ldh') }), 'GRIm');
    }));
    postureNote(root);
  },
  'lipi'(root) {
    note(root, 'Lung Immune Prognostic Index (Mezquita 2018): dNLR = ANC / (WBC - ANC); one point each for dNLR > 3 and LDH > ULN. Good 0, intermediate 1, poor 2. Near-neighbors: grim-score, nlr.');
    root.appendChild(num('Absolute neutrophil count (×10⁹/L)', 'lipi-anc', { min: '0' }));
    root.appendChild(num('Total WBC (×10⁹/L)', 'lipi-wbc', { min: '0' }));
    root.appendChild(check('LDH above upper limit of normal (+1)', 'lipi-ldh'));
    const o = out(); root.appendChild(o);
    wire(['lipi-anc', 'lipi-wbc', 'lipi-ldh'], () => safe(o, () => {
      render(o, M.lipi({ anc: val('lipi-anc'), wbc: val('lipi-wbc'), ldhHigh: chk('lipi-ldh') }), 'LIPI');
    }));
    postureNote(root);
  },
  'onkotev-score'(root) {
    note(root, 'ONKOTEV score (Cella 2017): one point each for Khorana > 2, metastatic disease, macroscopic vascular/lymphatic compression, previous VTE. Low 0, intermediate 1, high >= 2. Near-neighbors: khorana, protecht-score.');
    root.appendChild(check('Khorana score > 2 (+1)', 'onk-khorana'));
    root.appendChild(check('Metastatic disease (+1)', 'onk-mets'));
    root.appendChild(check('Macroscopic vascular or lymphatic compression (+1)', 'onk-comp'));
    root.appendChild(check('Previous VTE (+1)', 'onk-vte'));
    const o = out(); root.appendChild(o);
    wire(['onk-khorana', 'onk-mets', 'onk-comp', 'onk-vte'], () => safe(o, () => {
      render(o, M.onkotev({ khoranaHigh: chk('onk-khorana'), metastatic: chk('onk-mets'), compression: chk('onk-comp'), previousVte: chk('onk-vte') }), 'ONKOTEV');
    }));
    postureNote(root);
  },
  'protecht-score'(root) {
    note(root, 'PROTECHT score (Verso 2012): Khorana base (cancer site, platelets >= 350, Hb < 10/ESA, WBC > 11, BMI >= 35) plus platinum and gemcitabine chemotherapy. High risk >= 3. Near-neighbors: khorana, onkotev-score.');
    root.appendChild(select('Cancer site', 'prot-site', [['0', 'Other (0)'], ['1', 'High risk: lung, lymphoma, gynecologic, bladder, testicular (1)'], ['2', 'Very high risk: stomach, pancreas (2)']]));
    root.appendChild(check('Platelet count >= 350 ×10⁹/L (+1)', 'prot-plt'));
    root.appendChild(check('Hemoglobin < 10 g/dL or ESA use (+1)', 'prot-hb'));
    root.appendChild(check('WBC > 11 ×10⁹/L (+1)', 'prot-wbc'));
    root.appendChild(check('BMI >= 35 kg/m² (+1)', 'prot-bmi'));
    root.appendChild(check('Platinum-based chemotherapy (+1)', 'prot-plat'));
    root.appendChild(check('Gemcitabine-based chemotherapy (+1)', 'prot-gem'));
    const o = out(); root.appendChild(o);
    wire(['prot-site', 'prot-plt', 'prot-hb', 'prot-wbc', 'prot-bmi', 'prot-plat', 'prot-gem'], () => safe(o, () => {
      render(o, M.protecht({ cancerSite: val('prot-site'), plateletsHigh: chk('prot-plt'), hbLowEsa: chk('prot-hb'), wbcHigh: chk('prot-wbc'), bmiHigh: chk('prot-bmi'), platinum: chk('prot-plat'), gemcitabine: chk('prot-gem') }), 'PROTECHT');
    }));
    postureNote(root);
  },
};
