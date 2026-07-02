// spec-v205 §2: renderers for the pulmonology, COPD & sleep severity
// instruments — CAT, LENT, ADO, DOSE, and SACS-OSA. Group G. Shipped one tile at
// a time.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// point sums are bounded and finite-guarded in lib/pulm-copd-v205.js. Per the
// spec-v50 §3 posture note each tile defers the pleurodesis / inhaler / oxygen /
// polysomnography decision to the clinician and the patient (spec-v11 §5.3) —
// these stratify and screen, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pulm-copd-v205.js';
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
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const opt of options) sel.appendChild(el('option', { value: opt.value, text: opt.text }));
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
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The pleurodesis, inhaler, oxygen, and sleep-study decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.4 cat-copd --------------------------------------------------------
  'cat-copd'(root) {
    note(root, 'COPD Assessment Test (Jones 2009): eight patient-completed items, each 0–5; total 0–40. Impact: low < 10, medium 10–20, high 21–30, very high > 30. GOLD uses ≥ 10 as the "more symptoms" threshold. Score each item 0 (no impact) to 5 (most impact). Near-neighbors: mmrc-dyspnea, gold-spirometry, decaf-score.');
    const items = [
      ['cat-cough', 'Cough (0 never – 5 all the time)'],
      ['cat-phlegm', 'Phlegm / mucus (0 none – 5 chest full)'],
      ['cat-chest', 'Chest tightness (0 none – 5 very tight)'],
      ['cat-breathless', 'Breathless walking up hills/stairs (0 not – 5 very)'],
      ['cat-activity', 'Activity limitation at home (0 not – 5 very limited)'],
      ['cat-confidence', 'Confidence leaving home (0 confident – 5 not at all)'],
      ['cat-sleep', 'Sleep (0 sound – 5 poor due to COPD)'],
      ['cat-energy', 'Energy (0 lots – 5 none)'],
    ];
    for (const [id, label] of items) root.appendChild(num(label, id, { min: '0', max: '5' }));
    const o = out(); root.appendChild(o);
    const ids = items.map((i) => i[0]);
    wire(ids, () => safe(o, () => {
      const r = M.cat({
        cough: val('cat-cough'), phlegm: val('cat-phlegm'), chest: val('cat-chest'), breathless: val('cat-breathless'),
        activity: val('cat-activity'), confidence: val('cat-confidence'), sleep: val('cat-sleep'), energy: val('cat-energy'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CAT', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.1 lent-score ------------------------------------------------------
  'lent-score'(root) {
    note(root, 'LENT score (Clive 2014): the first effusion-specific survival score for malignant pleural effusion — pleural-fluid LDH, ECOG, serum neutrophil-to-lymphocyte ratio, and tumor type; total 0–7. Risk: low 0–1 (≈ 319 days), moderate 2–4 (≈ 130 days), high 5–7 (≈ 44 days). Near-neighbors: rapid-pleural, ecog-karnofsky.');
    root.appendChild(num('Pleural-fluid LDH (IU/L)', 'lent-ldh', { min: '0' }));
    root.appendChild(selectField('ECOG performance status', 'lent-ecog', [
      { value: '0', text: '0 — fully active (+0)' },
      { value: '1', text: '1 — restricted strenuous activity (+1)' },
      { value: '2', text: '2 — ambulatory, no work (+2)' },
      { value: '3-4', text: '3–4 — limited/no self-care (+3)' },
    ]));
    root.appendChild(num('Serum neutrophil-to-lymphocyte ratio', 'lent-nlr', { min: '0' }));
    root.appendChild(selectField('Tumor type', 'lent-tumor', [
      { value: 'low', text: 'Mesothelioma / hematologic (+0)' },
      { value: 'moderate', text: 'Breast / gynecologic / renal (+1)' },
      { value: 'high', text: 'Lung / other (+2)' },
    ]));
    const o = out(); root.appendChild(o);
    const ids = ['lent-ldh', 'lent-ecog', 'lent-nlr', 'lent-tumor'];
    wire(ids, () => safe(o, () => {
      const r = M.lent({ pleuralLdh: val('lent-ldh'), ecog: val('lent-ecog'), nlr: val('lent-nlr'), tumorType: val('lent-tumor') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'LENT', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 ado-index -------------------------------------------------------
  'ado-index'(root) {
    note(root, 'ADO index (Puhan 2009): a primary-care-friendly COPD mortality index needing no 6-minute walk test — age, mMRC dyspnea, and FEV₁ % predicted; total 0–10. Higher scores predict higher 3-year all-cause mortality. Near-neighbors: bode-index, gold-spirometry, mmrc-dyspnea.');
    root.appendChild(num('Age (years)', 'ado-age', { min: '0' }));
    root.appendChild(selectField('mMRC dyspnea grade', 'ado-mmrc', [
      { value: '0', text: '0 — breathless with strenuous exercise (+0)' },
      { value: '1', text: '1 — short of breath hurrying/slight hill (+0)' },
      { value: '2', text: '2 — walks slower than peers / stops (+1)' },
      { value: '3', text: '3 — stops after ~100 m / few minutes (+2)' },
      { value: '4', text: '4 — too breathless to leave house / dressing (+3)' },
    ]));
    root.appendChild(num('FEV₁ (% predicted)', 'ado-fev1', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['ado-age', 'ado-mmrc', 'ado-fev1'];
    wire(ids, () => safe(o, () => {
      const r = M.adoIndex({ age: val('ado-age'), mmrc: val('ado-mmrc'), fev1: val('ado-fev1') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'ADO', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 dose-index ------------------------------------------------------
  'dose-index'(root) {
    note(root, 'DOSE index (Jones 2009): a four-item composite for routine primary-care COPD review — dyspnea (mMRC), obstruction (FEV₁ % predicted), current smoking, and exacerbations in the past year; total 0–8. A score ≥ 4 marks markedly higher mortality and admission risk. Near-neighbors: bode-index, ado-index, pack-years.');
    root.appendChild(selectField('mMRC dyspnea grade', 'dose-mmrc', [
      { value: '0', text: '0 — strenuous exercise only (+0)' },
      { value: '1', text: '1 — hurrying / slight hill (+0)' },
      { value: '2', text: '2 — walks slower than peers / stops (+1)' },
      { value: '3', text: '3 — stops after ~100 m / few minutes (+2)' },
      { value: '4', text: '4 — too breathless to leave house / dressing (+3)' },
    ]));
    root.appendChild(num('FEV₁ (% predicted)', 'dose-fev1', { min: '0' }));
    root.appendChild(checkField('Current smoker (+1)', 'dose-smoker'));
    root.appendChild(num('Exacerbations in the past year', 'dose-exac', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['dose-mmrc', 'dose-fev1', 'dose-smoker', 'dose-exac'];
    wire(ids, () => safe(o, () => {
      const r = M.doseIndex({ mmrc: val('dose-mmrc'), fev1: val('dose-fev1'), smoker: chk('dose-smoker'), exacerbations: val('dose-exac') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'DOSE', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 sacs-osa --------------------------------------------------------
  'sacs-osa'(root) {
    note(root, 'Sleep Apnea Clinical Score (Flemons 1994): adjusted neck circumference = measured neck (cm) + 4 (hypertension) + 3 (habitual snoring) + 3 (nocturnal gasping/choking). Bands: ≤ 43 low, 43–48 intermediate, > 48 high pretest probability of OSA. An anthropometry-driven triage rule. Near-neighbors: stop-bang, berlin-osa, nosas-score.');
    root.appendChild(num('Measured neck circumference (cm)', 'sacs-neck', { min: '20', max: '80' }));
    root.appendChild(checkField('Hypertension (+4)', 'sacs-htn'));
    root.appendChild(checkField('Habitual snoring (+3)', 'sacs-snore'));
    root.appendChild(checkField('Nocturnal gasping / choking (+3)', 'sacs-choke'));
    const o = out(); root.appendChild(o);
    const ids = ['sacs-neck', 'sacs-htn', 'sacs-snore', 'sacs-choke'];
    wire(ids, () => safe(o, () => {
      const r = M.sacsOsa({ neck: val('sacs-neck'), hypertension: chk('sacs-htn'), snoring: chk('sacs-snore'), choking: chk('sacs-choke') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'SACS', value: `${r.score} cm` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
