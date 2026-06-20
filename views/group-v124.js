// spec-v124 §2: renderers for the six hepatology function-and-fibrosis
// instruments (albi-grade, meld-xi, forns-index, bard-score, fatty-liver-index,
// lok-index). albi-grade and bard-score read in Clinical Scoring & Risk (Group G);
// the rest are Clinical Math & Conversions (Group E). v124 opens Wave 5 of the
// spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a grade,
// score, or probability, not management; none authors a treatment order in
// Sophie's voice (spec-v11 §5.3). The log-ratio / logistic tiles surface a
// complete-the-fields fallback rather than a number from ln(0).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hep-v124.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The grade, score, or probability is the cited instrument’s, computed from the lab values you entered. The diagnosis and management decision stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

export const renderers = {
  // ----- 2.1 albi-grade -------------------------------------------------
  'albi-grade'(root) {
    note(root, 'Albumin-Bilirubin (ALBI) grade (Johnson 2015): an objective liver-function grade from albumin and bilirubin alone — no subjective ascites/encephalopathy terms. Enter US-customary units (g/dL, mg/dL); the tile converts internally. Grade 1 (≤ −2.60) is best, 2 intermediate, 3 (> −1.39) worst.');
    root.appendChild(field('Serum albumin (g/dL)', 'al-alb', { step: '0.1', min: 0, placeholder: 'e.g. 3.5' }));
    root.appendChild(field('Total bilirubin (mg/dL)', 'al-bili', { step: '0.1', min: 0, placeholder: 'e.g. 1.0' }));
    const o = out(); root.appendChild(o);
    wire(['al-alb', 'al-bili'], () => safe(o, () => {
      const r = M.albiGrade({ albumin: optNum('al-alb'), bilirubin: optNum('al-bili') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ALBI grade', value: String(r.grade) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 meld-xi ----------------------------------------------------
  'meld-xi'(root) {
    note(root, 'MELD-XI — MELD excluding INR (Heuman 2007): the INR-independent MELD for the anticoagulated patient whose INR is uninterpretable (mechanical valve, LVAD). Enter bilirubin and creatinine in mg/dL; each is floored at 1.0 before the log so the score cannot go negative.');
    root.appendChild(field('Total bilirubin (mg/dL)', 'mx-bili', { step: '0.1', min: 0, placeholder: 'e.g. 2.0' }));
    root.appendChild(field('Serum creatinine (mg/dL)', 'mx-creat', { step: '0.1', min: 0, placeholder: 'e.g. 1.5' }));
    const o = out(); root.appendChild(o);
    wire(['mx-bili', 'mx-creat'], () => safe(o, () => {
      const r = M.meldXi({ bilirubin: optNum('mx-bili'), creatinine: optNum('mx-creat') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MELD-XI', value: String(r.score) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 forns-index ------------------------------------------------
  'forns-index'(root) {
    note(root, 'Forns index for HCV fibrosis (Forns 2002): a four-variable serum estimate. Enter age, GGT, platelets, and total cholesterol in mg/dL. Below 4.2 rules out significant fibrosis; above 6.9 rules it in; between is indeterminate.');
    root.appendChild(field('Age (years)', 'fo-age', { step: '1', min: 0, placeholder: 'e.g. 50' }));
    root.appendChild(field('GGT (U/L)', 'fo-ggt', { step: '1', min: 0, placeholder: 'e.g. 80' }));
    root.appendChild(field('Platelet count (×10⁹/L)', 'fo-plt', { step: '1', min: 0, placeholder: 'e.g. 150' }));
    root.appendChild(field('Total cholesterol (mg/dL)', 'fo-chol', { step: '1', min: 0, placeholder: 'e.g. 200' }));
    const o = out(); root.appendChild(o);
    wire(['fo-age', 'fo-ggt', 'fo-plt', 'fo-chol'], () => safe(o, () => {
      const r = M.fornsIndex({ age: optNum('fo-age'), ggt: optNum('fo-ggt'), platelets: optNum('fo-plt'), cholesterol: optNum('fo-chol') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Forns', value: String(r.score) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 bard-score -------------------------------------------------
  'bard-score'(root) {
    note(root, 'BARD score for NAFLD advanced fibrosis (Harrison 2008): BMI ≥ 28 (+1), AST/ALT ratio ≥ 0.8 (+2), and diabetes (+1). A score of 2-4 leaves advanced fibrosis in play; 0-1 robustly rules it out.');
    root.appendChild(field('BMI (kg/m²)', 'bd-bmi', { step: '0.1', min: 0, placeholder: 'e.g. 30' }));
    root.appendChild(field('AST (U/L)', 'bd-ast', { step: '1', min: 0, placeholder: 'e.g. 45' }));
    root.appendChild(field('ALT (U/L)', 'bd-alt', { step: '1', min: 0, placeholder: 'e.g. 40' }));
    root.appendChild(checkField('Diabetes mellitus', 'bd-dm'));
    const o = out(); root.appendChild(o);
    wire(['bd-bmi', 'bd-ast', 'bd-alt', 'bd-dm'], () => safe(o, () => {
      const r = M.bardScore({ bmi: optNum('bd-bmi'), ast: optNum('bd-ast'), alt: optNum('bd-alt'), diabetes: chk('bd-dm') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'BARD', value: `${r.total}/4` },
      ]);
      note(o, `Components: ${r.counted}${r.ratio != null ? ` (AST/ALT ratio ${r.ratio})` : ''}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 fatty-liver-index ------------------------------------------
  'fatty-liver-index'(root) {
    note(root, 'Fatty Liver Index (Bedogni 2006): a logistic steatosis-probability index. Enter triglycerides (mg/dL), BMI, GGT (U/L), and waist circumference (cm). FLI < 30 rules steatosis out; ≥ 60 rules it in; 30-60 is indeterminate.');
    root.appendChild(field('Triglycerides (mg/dL)', 'fl-tg', { step: '1', min: 0, placeholder: 'e.g. 150' }));
    root.appendChild(field('BMI (kg/m²)', 'fl-bmi', { step: '0.1', min: 0, placeholder: 'e.g. 30' }));
    root.appendChild(field('GGT (U/L)', 'fl-ggt', { step: '1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('Waist circumference (cm)', 'fl-waist', { step: '1', min: 0, placeholder: 'e.g. 100' }));
    const o = out(); root.appendChild(o);
    wire(['fl-tg', 'fl-bmi', 'fl-ggt', 'fl-waist'], () => safe(o, () => {
      const r = M.fattyLiverIndex({ tg: optNum('fl-tg'), bmi: optNum('fl-bmi'), ggt: optNum('fl-ggt'), waist: optNum('fl-waist') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'FLI', value: String(r.fli) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 lok-index --------------------------------------------------
  'lok-index'(root) {
    note(root, 'Lok index for cirrhosis (Lok 2005, HALT-C): a logistic probability from platelets, the AST/ALT ratio, and INR. Below 0.2 rules cirrhosis out; above 0.5 rules it in; between is indeterminate.');
    root.appendChild(field('Platelet count (×10⁹/L)', 'lk-plt', { step: '1', min: 0, placeholder: 'e.g. 120' }));
    root.appendChild(field('AST (U/L)', 'lk-ast', { step: '1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('ALT (U/L)', 'lk-alt', { step: '1', min: 0, placeholder: 'e.g. 50' }));
    root.appendChild(field('INR', 'lk-inr', { step: '0.1', min: 0, placeholder: 'e.g. 1.2' }));
    const o = out(); root.appendChild(o);
    wire(['lk-plt', 'lk-ast', 'lk-alt', 'lk-inr'], () => safe(o, () => {
      const r = M.lokIndex({ platelets: optNum('lk-plt'), ast: optNum('lk-ast'), alt: optNum('lk-alt'), inr: optNum('lk-inr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Lok index', value: String(r.probability) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
