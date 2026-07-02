// spec-v199 §2: renderers for the five myeloid-neoplasm & transplant prognostic
// tiles — ELTS, MIPSS70, GIPSS, MYSEC-PM, and the HCT-CI. Groups E / G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// continuous edges (ELTS cubic + inverse-sqrt, MYSEC-PM linear age term) are
// finite-guarded in lib/myeloid-prognosis-v199.js. Per the spec-v50 §3 posture
// note each tile defers the transplant / conditioning / chemotherapy / timing
// decision to the hematologist, the transplant team, and the patient
// (spec-v11 §5.3) — these stratify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/myeloid-prognosis-v199.js';
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
  for (const opt of options) sel.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(sel);
  return wrap;
}
function num(label, id, attrs = {}) {
  return field(label, id, { type: 'number', min: '0', step: 'any', inputmode: 'decimal', ...attrs });
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The transplant, conditioning, chemotherapy, and timing decisions stay with the hematologist, the transplant team, and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.2 mipss70 ---------------------------------------------------------
  mipss70(root) {
    note(root, 'MIPSS70 (Guglielmelli 2018): transplantation-age prognostic model for primary myelofibrosis. Weighted items → 0–12; low 0–1, intermediate 2–4, high ≥ 5. Near-neighbors: dipss-plus-mf, gipss.');
    root.appendChild(checkField('Hemoglobin < 10 g/dL (+1)', 'mipss-hb'));
    root.appendChild(checkField('Leukocytes > 25 ×10⁹/L (+2)', 'mipss-wbc'));
    root.appendChild(checkField('Platelets < 100 ×10⁹/L (+2)', 'mipss-plt'));
    root.appendChild(checkField('Circulating blasts ≥ 2% (+1)', 'mipss-blasts'));
    root.appendChild(checkField('Bone-marrow fibrosis grade ≥ 2 (+1)', 'mipss-fibrosis'));
    root.appendChild(checkField('Constitutional symptoms (+1)', 'mipss-constit'));
    root.appendChild(checkField('Absence of CALR type-1/like mutation (+1)', 'mipss-nocalr'));
    root.appendChild(selectField('High-molecular-risk (HMR) mutations', 'mipss-hmr', [
      { value: 'none', text: 'None (0)' },
      { value: 'one', text: 'One HMR mutation (+1)' },
      { value: 'twoPlus', text: '≥ 2 HMR mutations (+3)' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['mipss-hb', 'mipss-wbc', 'mipss-plt', 'mipss-blasts', 'mipss-fibrosis', 'mipss-constit', 'mipss-nocalr', 'mipss-hmr'];
    wire(ids, () => safe(o, () => {
      const r = M.mipss70({ hb: chk('mipss-hb'), wbc: chk('mipss-wbc'), plt: chk('mipss-plt'), blasts: chk('mipss-blasts'), fibrosis: chk('mipss-fibrosis'), constitutional: chk('mipss-constit'), noCalr: chk('mipss-nocalr'), hmr: val('mipss-hmr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'MIPSS70', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 gipss -----------------------------------------------------------
  gipss(root) {
    note(root, 'GIPSS (Tefferi 2018): mutation-and-karyotype-only companion to MIPSS70. Karyotype + CALR/ASXL1/SRSF2/U2AF1 → 0–6; low 0, int-1 1, int-2 2, high ≥ 3. Near-neighbors: mipss70, dipss-plus-mf.');
    root.appendChild(selectField('Karyotype', 'gipss-karyo', [
      { value: 'favorable', text: 'Favorable / normal (0)' },
      { value: 'unfavorable', text: 'Unfavorable (+1)' },
      { value: 'vhr', text: 'Very-high-risk (+2)' },
    ]));
    root.appendChild(checkField('Absence of CALR type-1/like mutation (+1)', 'gipss-nocalr'));
    root.appendChild(checkField('ASXL1 mutation (+1)', 'gipss-asxl1'));
    root.appendChild(checkField('SRSF2 mutation (+1)', 'gipss-srsf2'));
    root.appendChild(checkField('U2AF1 Q157 mutation (+1)', 'gipss-u2af1'));
    const o = out(); root.appendChild(o);
    const ids = ['gipss-karyo', 'gipss-nocalr', 'gipss-asxl1', 'gipss-srsf2', 'gipss-u2af1'];
    wire(ids, () => safe(o, () => {
      const r = M.gipss({ karyotype: val('gipss-karyo'), noCalr: chk('gipss-nocalr'), asxl1: chk('gipss-asxl1'), srsf2: chk('gipss-srsf2'), u2af1: chk('gipss-u2af1') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'GIPSS', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 mysec-pm --------------------------------------------------------
  'mysec-pm'(root) {
    note(root, 'MYSEC-PM (Passamonti 2017): dedicated model for post-PV / post-ET (secondary) myelofibrosis. 0.15·age + weighted items; low < 11, int-1 ≥ 11 to < 14, int-2 ≥ 14 to < 16, high ≥ 16. Near-neighbors: dipss-plus-mf, mipss70.');
    root.appendChild(num('Age (years)', 'mysec-age'));
    root.appendChild(checkField('Hemoglobin < 11 g/dL (+2)', 'mysec-hb'));
    root.appendChild(checkField('Circulating blasts ≥ 3% (+2)', 'mysec-blasts'));
    root.appendChild(checkField('CALR-unmutated (+2)', 'mysec-nocalr'));
    root.appendChild(checkField('Platelets < 150 ×10⁹/L (+1)', 'mysec-plt'));
    root.appendChild(checkField('Constitutional symptoms (+1)', 'mysec-constit'));
    const o = out(); root.appendChild(o);
    const ids = ['mysec-age', 'mysec-hb', 'mysec-blasts', 'mysec-nocalr', 'mysec-plt', 'mysec-constit'];
    wire(ids, () => safe(o, () => {
      const r = M.mysecPm({ age: val('mysec-age'), hb: chk('mysec-hb'), blasts: chk('mysec-blasts'), noCalr: chk('mysec-nocalr'), plt: chk('mysec-plt'), constitutional: chk('mysec-constit') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'MYSEC-PM', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 hct-ci ----------------------------------------------------------
  'hct-ci'(root) {
    note(root, 'HCT-CI (Sorror 2005): pre-transplant non-relapse-mortality risk before allogeneic HCT. Weighted comorbidity grid; low 0, intermediate 1–2, high ≥ 3. Near-neighbors: charlson.');
    root.appendChild(checkField('Arrhythmia (+1)', 'hct-arrhythmia'));
    root.appendChild(checkField('Cardiac — CAD / CHF / MI / EF ≤ 50% (+1)', 'hct-cardiac'));
    root.appendChild(checkField('Inflammatory bowel disease (+1)', 'hct-ibd'));
    root.appendChild(checkField('Diabetes on treatment (+1)', 'hct-diabetes'));
    root.appendChild(checkField('Cerebrovascular disease (+1)', 'hct-cva'));
    root.appendChild(checkField('Psychiatric disturbance (+1)', 'hct-psych'));
    root.appendChild(checkField('Obesity (BMI > 35) (+1)', 'hct-obesity'));
    root.appendChild(checkField('Infection — antibiotics past day 0 (+1)', 'hct-infection'));
    root.appendChild(checkField('Rheumatologic disease (+2)', 'hct-rheum'));
    root.appendChild(checkField('Peptic ulcer needing treatment (+2)', 'hct-ulcer'));
    root.appendChild(checkField('Moderate renal — Cr > 2 mg/dL / dialysis / transplant (+2)', 'hct-renal'));
    root.appendChild(checkField('Prior solid tumor (+3)', 'hct-tumor'));
    root.appendChild(checkField('Heart-valve disease (+3)', 'hct-valve'));
    root.appendChild(selectField('Hepatic disease', 'hct-hepatic', [
      { value: 'none', text: 'None (0)' },
      { value: 'mild', text: 'Mild — chronic hepatitis / bilirubin ≤ 1.5× ULN (+1)' },
      { value: 'severe', text: 'Moderate/severe — cirrhosis / bilirubin > 1.5× ULN (+3)' },
    ]));
    root.appendChild(selectField('Pulmonary disease', 'hct-pulmonary', [
      { value: 'none', text: 'None (0)' },
      { value: 'moderate', text: 'Moderate — DLCO/FEV1 66–80% or dyspnea on activity (+2)' },
      { value: 'severe', text: 'Severe — DLCO/FEV1 ≤ 65% or dyspnea at rest / O₂ (+3)' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['hct-arrhythmia', 'hct-cardiac', 'hct-ibd', 'hct-diabetes', 'hct-cva', 'hct-psych', 'hct-obesity', 'hct-infection', 'hct-rheum', 'hct-ulcer', 'hct-renal', 'hct-tumor', 'hct-valve', 'hct-hepatic', 'hct-pulmonary'];
    wire(ids, () => safe(o, () => {
      const r = M.hctCi({
        arrhythmia: chk('hct-arrhythmia'), cardiac: chk('hct-cardiac'), ibd: chk('hct-ibd'), diabetes: chk('hct-diabetes'),
        cerebrovascular: chk('hct-cva'), psychiatric: chk('hct-psych'), obesity: chk('hct-obesity'), infection: chk('hct-infection'),
        rheumatologic: chk('hct-rheum'), pepticUlcer: chk('hct-ulcer'), renalModerate: chk('hct-renal'),
        solidTumor: chk('hct-tumor'), heartValve: chk('hct-valve'), hepatic: val('hct-hepatic'), pulmonary: val('hct-pulmonary'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'HCT-CI', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
