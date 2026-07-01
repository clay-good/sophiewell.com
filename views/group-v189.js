// spec-v189 §2: renderers for four heme / rheum / anticoagulation / comorbidity
// tiles — mSMART myeloma risk, IMPEDE VTE score, SAMe-TT2R2 VKA-control
// prediction, and the Elixhauser (van Walraven) comorbidity index. Group G
// (classification / score). The fifth proposed tile (BVAS v3) is deferred (see
// lib/heme-risk-v189.js header and docs/scope-post-parity.md).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the therapy / thromboprophylaxis /
// anticoagulation decision to the treating team (spec-v11 §5.3) — these stratify
// risk and predict suitability, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/heme-risk-v189.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
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
function subhead(root, text) { root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The risk group or score is the cited source’s, computed from the inputs you enter. The therapy, thromboprophylaxis, and anticoagulation decisions stay with the treating team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const MSMART_FIELDS = [
  ['t(4;14)', 'msmart-t414'],
  ['t(14;16)', 'msmart-t1416'],
  ['t(14;20)', 'msmart-t1420'],
  ['del(17p) / p53', 'msmart-del17p'],
  ['gain(1q) / del(1p)', 'msmart-gain1q'],
  ['High plasma-cell S-phase', 'msmart-sphase'],
  ['R-ISS III / high LDH', 'msmart-rissIII'],
];
const SAME_FIELDS = [
  ['Female sex', 'same-female'],
  ['Age < 60 years', 'same-ageUnder60'],
  ['Medical history (≥ 2 comorbidities)', 'same-medicalHistory'],
  ['Treatment with interacting drugs', 'same-interactingDrugs'],
  ['Tobacco use within 2 years', 'same-tobacco'],
  ['Race (non-white)', 'same-nonWhite'],
];
const DEX_OPTS = [
  { value: 'none', text: '— none —' },
  { value: 'low', text: 'Low-dose (< 160 mg/month) — +2' },
  { value: 'high', text: 'High-dose (≥ 160 mg/month) — +4' },
];
const PROPH_OPTS = [
  { value: 'none', text: '— none —' },
  { value: 'aspirin', text: 'Aspirin — −3' },
  { value: 'therapeutic', text: 'Therapeutic anticoagulation — −4' },
];
// Elixhauser conditions grouped for readability; keys match lib/heme-risk-v189.js.
const ELIX_GROUPS = [
  ['Cardiovascular', [
    ['Congestive heart failure (+7)', 'elix-chf'],
    ['Cardiac arrhythmias (+5)', 'elix-arrhythmia'],
    ['Valvular disease (−1)', 'elix-valvular'],
    ['Pulmonary circulation disorders (+4)', 'elix-pulmCirc'],
    ['Peripheral vascular disorders (+2)', 'elix-pvd'],
    ['Hypertension (0)', 'elix-hypertension'],
  ]],
  ['Neuro / respiratory', [
    ['Paralysis (+7)', 'elix-paralysis'],
    ['Other neurological disorders (+6)', 'elix-neuro'],
    ['Chronic pulmonary disease (+3)', 'elix-chronicPulm'],
  ]],
  ['Endocrine / renal / hepatic / GI', [
    ['Diabetes ± complications (0)', 'elix-diabetes'],
    ['Hypothyroidism (0)', 'elix-hypothyroid'],
    ['Renal failure (+5)', 'elix-renal'],
    ['Liver disease (+11)', 'elix-liver'],
    ['Peptic ulcer disease (0)', 'elix-pud'],
  ]],
  ['Oncologic / immune', [
    ['AIDS / HIV (0)', 'elix-hiv'],
    ['Lymphoma (+9)', 'elix-lymphoma'],
    ['Metastatic cancer (+12)', 'elix-metastatic'],
    ['Solid tumor without metastasis (+4)', 'elix-solidTumor'],
    ['Rheumatoid arthritis / collagen vascular (0)', 'elix-rheum'],
    ['Coagulopathy (+3)', 'elix-coagulopathy'],
  ]],
  ['Nutrition / hematologic / behavioral', [
    ['Obesity (−4)', 'elix-obesity'],
    ['Weight loss (+6)', 'elix-weightLoss'],
    ['Fluid and electrolyte disorders (+5)', 'elix-fluidLyte'],
    ['Blood-loss anemia (−2)', 'elix-bloodLossAnemia'],
    ['Deficiency anemia (−2)', 'elix-deficiencyAnemia'],
    ['Alcohol abuse (0)', 'elix-alcohol'],
    ['Drug abuse (−7)', 'elix-drugAbuse'],
    ['Psychoses (0)', 'elix-psychoses'],
    ['Depression (−3)', 'elix-depression'],
  ]],
];

export const renderers = {
  // ----- 2.1 msmart ----------------------------------------------------------
  msmart(root) {
    note(root, 'mSMART myeloma risk (Mikhael 2013; 3.0): high-risk if any high-risk cytogenetic/lab feature is present; two features = double hit, ≥ 3 = triple hit; standard risk otherwise. Near-neighbors: impede-vte.');
    for (const [label, id] of MSMART_FIELDS) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    wire(MSMART_FIELDS.map((f) => f[1]), () => safe(o, () => {
      const r = M.msmart({ t414: chk('msmart-t414'), t1416: chk('msmart-t1416'), t1420: chk('msmart-t1420'), del17p: chk('msmart-del17p'), gain1q: chk('msmart-gain1q'), sphase: chk('msmart-sphase'), rissIII: chk('msmart-rissIII') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Risk', value: r.highRisk ? 'high' : 'standard' },
        { label: 'High-risk features', value: `${r.features}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 impede-vte ------------------------------------------------------
  'impede-vte'(root) {
    note(root, 'IMPEDE VTE score (Sanfilippo 2019): weighted VTE-risk factors in myeloma. Bands: ≤ 3 low, 4–7 intermediate, ≥ 8 high. Framed for a thromboprophylaxis discussion. Near-neighbors: msmart.');
    root.appendChild(checkField('Immunomodulatory agent (+4)', 'impede-imid'));
    root.appendChild(checkField('BMI ≥ 25 (+1)', 'impede-bmi25'));
    root.appendChild(checkField('Pelvic / hip / femur fracture (+4)', 'impede-fracture'));
    root.appendChild(checkField('Erythropoietin-stimulating agent (+1)', 'impede-esa'));
    root.appendChild(selectField('Dexamethasone', 'impede-dexamethasone', DEX_OPTS));
    root.appendChild(checkField('Doxorubicin (+3)', 'impede-doxorubicin'));
    root.appendChild(checkField('Asian ethnicity (−3)', 'impede-asian'));
    root.appendChild(checkField('Prior VTE (+5)', 'impede-vteHistory'));
    root.appendChild(checkField('Tunneled line / central catheter (+2)', 'impede-tunneledLine'));
    root.appendChild(selectField('Existing thromboprophylaxis', 'impede-thromboprophylaxis', PROPH_OPTS));
    const o = out(); root.appendChild(o);
    wire(['impede-imid', 'impede-bmi25', 'impede-fracture', 'impede-esa', 'impede-dexamethasone', 'impede-doxorubicin', 'impede-asian', 'impede-vteHistory', 'impede-tunneledLine', 'impede-thromboprophylaxis'], () => safe(o, () => {
      const r = M.impedeVte({ imid: chk('impede-imid'), bmi25: chk('impede-bmi25'), fracture: chk('impede-fracture'), esa: chk('impede-esa'), dexamethasone: val('impede-dexamethasone'), doxorubicin: chk('impede-doxorubicin'), asian: chk('impede-asian'), vteHistory: chk('impede-vteHistory'), tunneledLine: chk('impede-tunneledLine'), thromboprophylaxis: val('impede-thromboprophylaxis') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
        { label: 'Risk', value: r.risk },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 same-tt2r2 ------------------------------------------------------
  'same-tt2r2'(root) {
    note(root, 'SAMe-TT2R2 (Apostolakis 2013): predicts INR-control quality on a vitamin-K antagonist. Score 0–1 favors a VKA; ≥ 2 favors a DOAC or closer monitoring. Near-neighbors: rosendaal-ttr.');
    for (const [label, id] of SAME_FIELDS) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    wire(SAME_FIELDS.map((f) => f[1]), () => safe(o, () => {
      const r = M.sameTt2r2({ female: chk('same-female'), ageUnder60: chk('same-ageUnder60'), medicalHistory: chk('same-medicalHistory'), interactingDrugs: chk('same-interactingDrugs'), tobacco: chk('same-tobacco'), nonWhite: chk('same-nonWhite') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 elixhauser ------------------------------------------------------
  elixhauser(root) {
    note(root, 'Elixhauser comorbidity index, van Walraven weighting (Elixhauser 1998; van Walraven 2009): each present condition adds its signed weight (−7 to +12); a higher total predicts higher in-hospital mortality. A complement to charlson. Near-neighbors: charlson.');
    const ids = [];
    for (const [heading, items] of ELIX_GROUPS) {
      subhead(root, heading);
      for (const [label, id] of items) { root.appendChild(checkField(label, id)); ids.push(id); }
    }
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const inp = {};
      for (const id of ids) inp[id.replace(/^elix-/, '')] = chk(id);
      const r = M.elixhauser(inp);
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}` },
        { label: 'Conditions', value: `${r.count}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
