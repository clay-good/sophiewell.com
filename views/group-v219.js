// spec-v219 §2: renderers for the metabolic & hepatic indices — ADA/Bang and
// Cambridge diabetes-risk, Lipid Accumulation Product, Visceral Adiposity Index,
// Conicity Index, AST/ALT ratio, and the GGT-to-platelet ratio. Group G/E.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the screening / diagnostic decision
// to the clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/metabolic-hepatic-v219.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The screening, diagnostic, and biopsy decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel, value) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'ada-diabetes-risk-test'(root) {
    note(root, 'ADA / Bang diabetes-risk score (Bang 2009): age band, male, prior GDM, family history, hypertension, inactivity, BMI band (0-13). >= 5 = high risk, screen. Near-neighbors: findrisc, tyg-index.');
    root.appendChild(num('Age (years)', 'ada-age', { min: '0' }));
    root.appendChild(num('BMI (kg/m²)', 'ada-bmi', { min: '0' }));
    root.appendChild(check('Male sex (+1)', 'ada-male'));
    root.appendChild(check('Prior gestational diabetes (+1)', 'ada-gdm'));
    root.appendChild(check('First-degree relative with diabetes (+1)', 'ada-rel'));
    root.appendChild(check('Hypertension (+1)', 'ada-htn'));
    root.appendChild(check('Physically inactive (+1)', 'ada-inactive'));
    const o = out(); root.appendChild(o);
    wire(['ada-age', 'ada-bmi', 'ada-male', 'ada-gdm', 'ada-rel', 'ada-htn', 'ada-inactive'], () => safe(o, () => {
      const r = M.adaDiabetesRisk({ age: val('ada-age'), bmi: val('ada-bmi'), male: chk('ada-male'), gdm: chk('ada-gdm'), relative: chk('ada-rel'), hypertension: chk('ada-htn'), inactive: chk('ada-inactive') });
      render(o, r, 'ADA', `${r.score}`);
    }));
    postureNote(root);
  },
  'cambridge-diabetes-risk'(root) {
    note(root, 'Cambridge Diabetes Risk Score (Griffin 2000): logistic probability of undiagnosed type 2 diabetes from age, sex, BMI, family history, smoking, antihypertensive / steroid use. Near-neighbors: findrisc, ada-diabetes-risk-test.');
    root.appendChild(num('Age (years)', 'camb-age', { min: '0' }));
    root.appendChild(num('BMI (kg/m²)', 'camb-bmi', { min: '0' }));
    root.appendChild(check('Female sex', 'camb-female'));
    root.appendChild(check('On antihypertensive medication', 'camb-htn'));
    root.appendChild(check('On corticosteroid medication', 'camb-steroid'));
    root.appendChild(select('Family history of diabetes', 'camb-fhx', [['0', 'None (0)'], ['1', 'Parent or sibling (1)'], ['2', 'Both parent and sibling (2)']]));
    root.appendChild(select('Smoking status', 'camb-smoke', [['0', 'Non-smoker (0)'], ['1', 'Ex-smoker (1)'], ['2', 'Current smoker (2)']]));
    const o = out(); root.appendChild(o);
    wire(['camb-age', 'camb-bmi', 'camb-female', 'camb-htn', 'camb-steroid', 'camb-fhx', 'camb-smoke'], () => safe(o, () => {
      const r = M.cambridgeDiabetes({ age: val('camb-age'), bmi: val('camb-bmi'), female: chk('camb-female'), antihypertensive: chk('camb-htn'), steroids: chk('camb-steroid'), familyHistory: val('camb-fhx'), smoking: val('camb-smoke') });
      render(o, r, 'Probability', r.probability !== undefined ? `${r.probability}%` : '');
    }));
    postureNote(root);
  },
  'lipid-accumulation-product'(root) {
    note(root, 'Lipid Accumulation Product (Kahn 2005): Men (waist - 65) × TG; Women (waist - 58) × TG (mmol/L). Higher = greater central lipid accumulation. Near-neighbors: tyg-index, visceral-adiposity-index.');
    root.appendChild(num('Waist circumference (cm)', 'lap-wc', { min: '0' }));
    root.appendChild(num('Triglycerides (mmol/L)', 'lap-tg', { min: '0' }));
    root.appendChild(check('Female sex', 'lap-female'));
    const o = out(); root.appendChild(o);
    wire(['lap-wc', 'lap-tg', 'lap-female'], () => safe(o, () => {
      const r = M.lap({ waist: val('lap-wc'), triglycerides: val('lap-tg'), female: chk('lap-female') });
      render(o, r, 'LAP', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
  'visceral-adiposity-index'(root) {
    note(root, 'Visceral Adiposity Index (Amato 2010): sex-specific function of waist, BMI, triglycerides, and HDL (mmol/L). ~ 1 in healthy non-obese adults. Near-neighbors: lipid-accumulation-product, tyg-index.');
    root.appendChild(num('Waist circumference (cm)', 'vai-wc', { min: '0' }));
    root.appendChild(num('BMI (kg/m²)', 'vai-bmi', { min: '0' }));
    root.appendChild(num('Triglycerides (mmol/L)', 'vai-tg', { min: '0' }));
    root.appendChild(num('HDL cholesterol (mmol/L)', 'vai-hdl', { min: '0' }));
    root.appendChild(check('Female sex', 'vai-female'));
    const o = out(); root.appendChild(o);
    wire(['vai-wc', 'vai-bmi', 'vai-tg', 'vai-hdl', 'vai-female'], () => safe(o, () => {
      const r = M.vai({ waist: val('vai-wc'), bmi: val('vai-bmi'), triglycerides: val('vai-tg'), hdl: val('vai-hdl'), female: chk('vai-female') });
      render(o, r, 'VAI', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
  'conicity-index'(root) {
    note(root, 'Conicity Index (Valdez 1991): CI = waist(m) / (0.109 × √(weight(kg) / height(m))). Higher = greater central adiposity. Near-neighbors: waist-hip, visceral-adiposity-index.');
    root.appendChild(num('Waist circumference (cm)', 'con-wc', { min: '0' }));
    root.appendChild(num('Weight (kg)', 'con-wt', { min: '0' }));
    root.appendChild(num('Height (cm)', 'con-ht', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['con-wc', 'con-wt', 'con-ht'], () => safe(o, () => {
      const r = M.conicity({ waist: val('con-wc'), weight: val('con-wt'), height: val('con-ht') });
      render(o, r, 'Conicity', r.value !== undefined ? `${r.value}` : '');
    }));
    postureNote(root);
  },
  'ast-alt-ratio'(root) {
    note(root, 'AST/ALT (De Ritis) ratio (De Ritis 1957): AAR = AST / ALT. < 1 NAFLD/viral/acute; 1-2 advanced fibrosis; > 2 classic alcoholic liver disease. Near-neighbors: fib4, apri.');
    root.appendChild(num('AST (IU/L)', 'aar-ast', { min: '0' }));
    root.appendChild(num('ALT (IU/L)', 'aar-alt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['aar-ast', 'aar-alt'], () => safe(o, () => {
      const r = M.astAltRatio({ ast: val('aar-ast'), alt: val('aar-alt') });
      render(o, r, 'AST/ALT', r.ratio !== undefined ? `${r.ratio}` : '');
    }));
    postureNote(root);
  },
  'ggt-platelet-ratio'(root) {
    note(root, 'GGT-to-platelet ratio (Lemoine 2016): GPR = (GGT/ULN)/platelets × 100. A cutoff of 0.32 predicts significant fibrosis. Near-neighbors: apri, fib4.');
    root.appendChild(num('GGT (IU/L)', 'gpr-ggt', { min: '0' }));
    root.appendChild(num('Upper limit of normal for GGT (IU/L)', 'gpr-uln', { min: '0' }));
    root.appendChild(num('Platelet count (×10⁹/L)', 'gpr-plt', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['gpr-ggt', 'gpr-uln', 'gpr-plt'], () => safe(o, () => {
      const r = M.ggtPlatelet({ ggt: val('gpr-ggt'), ggtUln: val('gpr-uln'), platelets: val('gpr-plt') });
      render(o, r, 'GPR', r.gpr !== undefined ? `${r.gpr}` : '');
    }));
    postureNote(root);
  },
};
