// spec-v137 §2: renderers for the five infectious-disease risk-score tiles --
// isaric-4c-mortality, covid-gram, candida-score, vacs-index, regiscar-dress
// (all Clinical Scoring & Risk, Group G) -- beside curb-65 / psi.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a
// score/probability, not management (spec-v11 §5.3). Each compute surfaces a
// complete-the-fields fallback rather than a bad value; covid-gram clamps its
// logistic exponent and vacs-index guards the FIB-4 platelet/ALT denominators
// (lib/id-v137.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/id-v137.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score or probability is the cited instrument’s, computed from the values you entered. The management decision — admit or escalate, start empiric antifungal or antiviral therapy, diagnose DRESS — stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const BLANK = { value: '', text: 'Select…' };
const YN = [BLANK, { value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

export const renderers = {
  // ----- 2.1 isaric-4c-mortality ---------------------------------------------
  'isaric-4c-mortality'(root) {
    note(root, 'ISARIC 4C Mortality Score (Knight 2020): additive 0–21 for adults admitted with COVID-19 — age, male sex, comorbidity count, respiratory rate, SpO₂ on room air, GCS, urea, CRP. Risk groups: low 0–3 (1.2%), intermediate 4–8 (9.9%), high 9–14 (31.4%), very high ≥15 (61.5%) in-hospital mortality (derivation cohort). Cross-links CURB-65.');
    root.appendChild(field('Age (years)', 'is4c-age', { min: 0, max: 130, placeholder: 'e.g. 62' }));
    root.appendChild(selectField('Sex at birth', 'is4c-sex', [BLANK, { value: 'female', text: 'Female' }, { value: 'male', text: 'Male' }]));
    root.appendChild(field('Number of comorbidities', 'is4c-com', { min: 0, max: 20, placeholder: 'e.g. 2' }));
    root.appendChild(field('Respiratory rate (breaths/min)', 'is4c-rr', { min: 0, max: 80, placeholder: 'e.g. 22' }));
    root.appendChild(field('SpO₂ on room air (%)', 'is4c-spo2', { min: 0, max: 100, placeholder: 'e.g. 95' }));
    root.appendChild(field('Glasgow Coma Scale (3–15)', 'is4c-gcs', { min: 3, max: 15, placeholder: 'e.g. 15' }));
    root.appendChild(field('Urea / BUN', 'is4c-urea', { step: '0.1', min: 0, placeholder: 'e.g. 5' }));
    root.appendChild(selectField('Urea unit', 'is4c-ureaunit', [BLANK, { value: 'mmol', text: 'Urea mmol/L' }, { value: 'bun-mgdl', text: 'BUN mg/dL' }]));
    root.appendChild(field('C-reactive protein (mg/L)', 'is4c-crp', { step: '0.1', min: 0, placeholder: 'e.g. 30' }));
    const o = out(); root.appendChild(o);
    wire(['is4c-age', 'is4c-sex', 'is4c-com', 'is4c-rr', 'is4c-spo2', 'is4c-gcs', 'is4c-urea', 'is4c-ureaunit', 'is4c-crp'], () => safe(o, () => {
      const r = M.isaric4cMortality({
        age: optNum('is4c-age'), sex: selVal('is4c-sex'), comorbidities: optNum('is4c-com'),
        rr: optNum('is4c-rr'), spo2: optNum('is4c-spo2'), gcs: optNum('is4c-gcs'),
        urea: optNum('is4c-urea'), ureaUnit: selVal('is4c-ureaunit'), crp: optNum('is4c-crp'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'ISARIC 4C', value: `${r.total} / 21 (${r.group})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 covid-gram ------------------------------------------------------
  'covid-gram'(root) {
    note(root, 'COVID-GRAM (Liang 2020): logistic estimate of critical-illness probability in hospitalized COVID-19. Inputs: chest-imaging abnormality, age, hemoptysis, dyspnea, unconsciousness, comorbidity count, cancer history, neutrophil-to-lymphocyte ratio, LDH, direct bilirubin. The paper publishes odds ratios, not betas — betas here are ln(OR) and the intercept is ln of the paper’s rounded constant, so the absolute probability is approximate. The authors define no risk tiers. Cross-links the ISARIC 4C score.');
    root.appendChild(selectField('Chest-imaging abnormality', 'cg-xray', YN));
    root.appendChild(field('Age (years)', 'cg-age', { min: 0, max: 130, placeholder: 'e.g. 60' }));
    root.appendChild(selectField('Hemoptysis', 'cg-hemo', YN));
    root.appendChild(selectField('Dyspnea', 'cg-dysp', YN));
    root.appendChild(selectField('Unconsciousness', 'cg-unc', YN));
    root.appendChild(field('Number of comorbidities', 'cg-com', { min: 0, max: 20, placeholder: 'e.g. 1' }));
    root.appendChild(selectField('Cancer history', 'cg-cancer', YN));
    root.appendChild(field('Neutrophil-to-lymphocyte ratio', 'cg-nlr', { step: '0.1', min: 0, placeholder: 'e.g. 3.5' }));
    root.appendChild(field('Lactate dehydrogenase (U/L)', 'cg-ldh', { step: '1', min: 0, placeholder: 'e.g. 300' }));
    root.appendChild(field('Direct bilirubin (µmol/L)', 'cg-db', { step: '0.1', min: 0, placeholder: 'e.g. 5' }));
    const o = out(); root.appendChild(o);
    wire(['cg-xray', 'cg-age', 'cg-hemo', 'cg-dysp', 'cg-unc', 'cg-com', 'cg-cancer', 'cg-nlr', 'cg-ldh', 'cg-db'], () => safe(o, () => {
      const r = M.covidGram({
        xray: selVal('cg-xray'), age: optNum('cg-age'), hemoptysis: selVal('cg-hemo'),
        dyspnea: selVal('cg-dysp'), unconscious: selVal('cg-unc'), comorbidities: optNum('cg-com'),
        cancer: selVal('cg-cancer'), nlr: optNum('cg-nlr'), ldh: optNum('cg-ldh'), db: optNum('cg-db'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Critical-illness probability', value: `${r.probability}%` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 candida-score ---------------------------------------------------
  'candida-score'(root) {
    note(root, 'Candida score (León 2006): bedside risk of invasive candidiasis in non-neutropenic ICU patients with Candida colonization — TPN (1), surgery on ICU admission (1), multifocal Candida colonization (1), severe sepsis (2), total 0–5. A score ≥ 3 (original > 2.5 cut-off) flags likely invasive candidiasis; < 3 carried only ~2.3% probability of proven IC in validation.');
    root.appendChild(selectField('Total parenteral nutrition', 'cand-tpn', YN));
    root.appendChild(selectField('Surgery on ICU admission', 'cand-surg', YN));
    root.appendChild(selectField('Multifocal Candida colonization', 'cand-col', YN));
    root.appendChild(selectField('Severe sepsis', 'cand-sep', YN));
    const o = out(); root.appendChild(o);
    wire(['cand-tpn', 'cand-surg', 'cand-col', 'cand-sep'], () => safe(o, () => {
      const r = M.candidaScore({ tpn: selVal('cand-tpn'), surgery: selVal('cand-surg'), colonization: selVal('cand-col'), sepsis: selVal('cand-sep') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Candida score', value: `${r.total} / 5` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 vacs-index ------------------------------------------------------
  'vacs-index'(root) {
    note(root, 'VACS Index 1.0 (Tate / Justice 2013): additive 0–164 mortality index for people with HIV on ART — age, CD4, HIV-1 RNA, hemoglobin, FIB-4 (from age, AST, ALT, platelets), eGFR, hepatitis-C co-infection. Higher = greater 5-year all-cause mortality along a continuous curve (anchors: 0 ~1.8%, 164 ~>85.8%); no per-band lookup. Cross-links FIB-4.');
    root.appendChild(field('Age (years)', 'vacs-age', { min: 0, max: 130, placeholder: 'e.g. 55' }));
    root.appendChild(field('CD4 count (cells/µL)', 'vacs-cd4', { min: 0, placeholder: 'e.g. 250' }));
    root.appendChild(field('HIV-1 RNA (copies/mL)', 'vacs-rna', { min: 0, placeholder: 'e.g. 1000' }));
    root.appendChild(field('Hemoglobin (g/dL)', 'vacs-hgb', { step: '0.1', min: 0, placeholder: 'e.g. 11' }));
    root.appendChild(field('AST (U/L)', 'vacs-ast', { min: 0, placeholder: 'e.g. 40' }));
    root.appendChild(field('ALT (U/L)', 'vacs-alt', { min: 0, placeholder: 'e.g. 30' }));
    root.appendChild(field('Platelets (×10⁹/L)', 'vacs-plt', { min: 0, placeholder: 'e.g. 150' }));
    root.appendChild(field('eGFR (mL/min)', 'vacs-egfr', { min: 0, placeholder: 'e.g. 70' }));
    root.appendChild(selectField('Hepatitis-C co-infection', 'vacs-hcv', YN));
    const o = out(); root.appendChild(o);
    wire(['vacs-age', 'vacs-cd4', 'vacs-rna', 'vacs-hgb', 'vacs-ast', 'vacs-alt', 'vacs-plt', 'vacs-egfr', 'vacs-hcv'], () => safe(o, () => {
      const r = M.vacsIndex({
        age: optNum('vacs-age'), cd4: optNum('vacs-cd4'), rna: optNum('vacs-rna'), hgb: optNum('vacs-hgb'),
        ast: optNum('vacs-ast'), alt: optNum('vacs-alt'), platelets: optNum('vacs-plt'), egfr: optNum('vacs-egfr'), hepC: selVal('vacs-hcv'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'VACS Index', value: `${r.total} / 164` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 regiscar-dress --------------------------------------------------
  'regiscar-dress'(root) {
    note(root, 'RegiSCAR score for DRESS (Kardaun 2013): weighted −4 to +9 diagnostic-certainty score. Eosinophilia scores the absolute count or (if leukopenic) the percentage — alternatives, max +2. Rash-suggestive and biopsy can score −1. Bands: < 2 no case, 2–3 possible, 4–5 probable, > 5 definite DRESS.');
    root.appendChild(selectField('Fever ≥ 38.5 °C', 'rd-fever', YN));
    root.appendChild(selectField('Enlarged lymph nodes (≥ 2 sites)', 'rd-nodes', YN));
    root.appendChild(selectField('Eosinophilia', 'rd-eos', [BLANK, { value: '0', text: 'None / unknown (0)' }, { value: '1', text: '700–1,499/µL or 10–19.9% (+1)' }, { value: '2', text: '≥ 1,500/µL or ≥ 20% (+2)' }]));
    root.appendChild(selectField('Atypical lymphocytes', 'rd-atyp', YN));
    root.appendChild(selectField('Skin rash > 50% body surface area', 'rd-ext', YN));
    root.appendChild(selectField('Rash suggestive of DRESS', 'rd-sugg', [BLANK, { value: 'no', text: 'No, not suggestive (−1)' }, { value: 'unknown', text: 'Unknown (0)' }, { value: 'yes', text: 'Yes, suggestive (+1)' }]));
    root.appendChild(selectField('Skin biopsy', 'rd-biopsy', [BLANK, { value: 'compatible', text: 'Compatible / unknown (0)' }, { value: 'against', text: 'Suggests other diagnosis (−1)' }]));
    root.appendChild(selectField('Internal-organ involvement', 'rd-organ', [BLANK, { value: '0', text: 'None / unknown (0)' }, { value: '1', text: '1 organ (+1)' }, { value: '2plus', text: '≥ 2 organs (+2)' }]));
    root.appendChild(selectField('Resolution > 15 days', 'rd-res', YN));
    root.appendChild(selectField('Other causes excluded (≥ 3 tests, all negative)', 'rd-other', YN));
    const o = out(); root.appendChild(o);
    wire(['rd-fever', 'rd-nodes', 'rd-eos', 'rd-atyp', 'rd-ext', 'rd-sugg', 'rd-biopsy', 'rd-organ', 'rd-res', 'rd-other'], () => safe(o, () => {
      const r = M.regiscarDress({
        fever: selVal('rd-fever'), nodes: selVal('rd-nodes'), eos: selVal('rd-eos'), atypical: selVal('rd-atyp'),
        skinExtent: selVal('rd-ext'), rashSuggestive: selVal('rd-sugg'), biopsy: selVal('rd-biopsy'),
        organ: selVal('rd-organ'), resolution: selVal('rd-res'), otherCauses: selVal('rd-other'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'RegiSCAR', value: `${r.total} (${r.classification})` }]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
