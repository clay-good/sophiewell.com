// spec-v125 §2: renderers for the five hepatology severity and encephalopathy
// instruments (peld-score, clif-c-aclf, gahs, west-haven-he,
// hepatic-steatosis-index). All five home in Clinical Scoring & Risk (Group G).
// v125 continues Wave 5 of the spec-v100 program.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it frames a score or
// grade, not management; none authors a listing, steroid, or treatment order in
// Sophie's voice (spec-v11 §5.3). The log tiles surface a complete-the-fields
// fallback rather than a number from ln(0).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hep-v125.js';
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
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score or grade is the cited instrument’s, computed from the values you entered. The listing, steroid, and management decisions stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }

const OF3 = (l1, l2, l3) => [
  { value: '1', text: `1 — ${l1}` },
  { value: '2', text: `2 — ${l2}` },
  { value: '3', text: `3 — ${l3}` },
];

export const renderers = {
  // ----- 2.1 peld-score -------------------------------------------------
  'peld-score'(root) {
    note(root, 'Pediatric End-Stage Liver Disease (PELD, McDiarmid 2002): the under-12 transplant-listing score (adult MELD does not apply to small children). Enter albumin (g/dL), bilirubin (mg/dL), and INR; mark age under 1 year and growth failure. Labs are floored at 1.0 before the log.');
    root.appendChild(field('Albumin (g/dL)', 'pe-alb', { step: '0.1', min: 0, placeholder: 'e.g. 3.0' }));
    root.appendChild(field('Total bilirubin (mg/dL)', 'pe-bili', { step: '0.1', min: 0, placeholder: 'e.g. 4.0' }));
    root.appendChild(field('INR', 'pe-inr', { step: '0.1', min: 0, placeholder: 'e.g. 1.5' }));
    root.appendChild(checkField('Age under 1 year (+4.36)', 'pe-age'));
    root.appendChild(checkField('Growth failure, > 2 SD below mean (+6.67)', 'pe-growth'));
    const o = out(); root.appendChild(o);
    wire(['pe-alb', 'pe-bili', 'pe-inr', 'pe-age', 'pe-growth'], () => safe(o, () => {
      const r = M.peldScore({ albumin: optNum('pe-alb'), bilirubin: optNum('pe-bili'), inr: optNum('pe-inr'), ageUnder1: chk('pe-age'), growthFailure: chk('pe-growth') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'PELD', value: String(r.score) },
      ]);
      note(o, `Bonus points: ${r.counted}.`);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 clif-c-aclf ------------------------------------------------
  'clif-c-aclf'(root) {
    note(root, 'CLIF-C ACLF score (Jalan 2014): mortality in acute-on-chronic liver failure. Score each of the six CLIF organ systems 1-3 (the CLIF-OF sub-score, 6-18), then enter age and white-cell count. CLIF-C ACLF = 10 × [0.33 × CLIF-OF + 0.04 × age + 0.63 × ln(WBC) − 2], 0-100.');
    root.appendChild(selectField('Liver — bilirubin (mg/dL)', 'cl-liver', OF3('< 6', '6 to 12', '> 12')));
    root.appendChild(selectField('Kidney — creatinine (mg/dL)', 'cl-kidney', OF3('< 2', '2 to < 3.5', '≥ 3.5 or renal replacement')));
    root.appendChild(selectField('Brain — West Haven HE grade', 'cl-brain', OF3('grade 0', 'grade 1–2', 'grade 3–4')));
    root.appendChild(selectField('Coagulation — INR', 'cl-coag', OF3('< 2.0', '2.0 to < 2.5', '≥ 2.5')));
    root.appendChild(selectField('Circulation — MAP / pressors', 'cl-circ', OF3('MAP ≥ 70', 'MAP < 70', 'vasopressors')));
    root.appendChild(selectField('Respiratory — PaO₂/FiO₂', 'cl-resp', OF3('> 300', '> 200 to ≤ 300', '≤ 200')));
    root.appendChild(field('Age (years)', 'cl-age', { step: '1', min: 0, placeholder: 'e.g. 55' }));
    root.appendChild(field('White-cell count (×10⁹/L)', 'cl-wbc', { step: '0.1', min: 0, placeholder: 'e.g. 12' }));
    const o = out(); root.appendChild(o);
    wire(['cl-liver', 'cl-kidney', 'cl-brain', 'cl-coag', 'cl-circ', 'cl-resp', 'cl-age', 'cl-wbc'], () => safe(o, () => {
      const r = M.clifCAclf({
        liver: selVal('cl-liver'), kidney: selVal('cl-kidney'), brain: selVal('cl-brain'),
        coag: selVal('cl-coag'), circ: selVal('cl-circ'), resp: selVal('cl-resp'),
        age: optNum('cl-age'), wbc: optNum('cl-wbc'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'CLIF-C ACLF', value: String(r.score) },
        { label: 'CLIF-OF', value: `${r.clifOF}/18` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 gahs -------------------------------------------------------
  gahs(root) {
    note(root, 'Glasgow Alcoholic Hepatitis Score (Forrest 2005): five banded items. Note the UK/SI units — blood urea in mmol/L and bilirubin in µmol/L (not BUN or mg/dL). Total 5-12; ≥ 9 marks higher 28/84-day mortality and the corticosteroid-benefit cohort.');
    root.appendChild(field('Age (years)', 'ga-age', { step: '1', min: 0, placeholder: 'e.g. 55' }));
    root.appendChild(field('White-cell count (×10⁹/L)', 'ga-wbc', { step: '0.1', min: 0, placeholder: 'e.g. 16' }));
    root.appendChild(field('Blood urea (mmol/L)', 'ga-urea', { step: '0.1', min: 0, placeholder: 'e.g. 8' }));
    root.appendChild(field('INR (or PT ratio)', 'ga-inr', { step: '0.1', min: 0, placeholder: 'e.g. 2.2' }));
    root.appendChild(field('Bilirubin (µmol/L)', 'ga-bili', { step: '1', min: 0, placeholder: 'e.g. 300' }));
    const o = out(); root.appendChild(o);
    wire(['ga-age', 'ga-wbc', 'ga-urea', 'ga-inr', 'ga-bili'], () => safe(o, () => {
      const r = M.gahs({ age: optNum('ga-age'), wbc: optNum('ga-wbc'), urea: optNum('ga-urea'), inr: optNum('ga-inr'), bilirubin: optNum('ga-bili') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'GAHS', value: `${r.total}/12` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 west-haven-he ----------------------------------------------
  'west-haven-he'(root) {
    note(root, 'West Haven (Conn) criteria (Conn 1977): the canonical 0-4 hepatic-encephalopathy grade. Select the grade matching the clinical state. Grades 2 and above are overt encephalopathy.');
    root.appendChild(selectField('Clinical state', 'wh-grade', [
      { value: '0', text: '0 — minimal (no detectable change; testing only)' },
      { value: '1', text: '1 — trivial unawareness, euphoria/anxiety, impaired addition' },
      { value: '2', text: '2 — lethargy/apathy, disorientation to time, asterixis' },
      { value: '3', text: '3 — somnolence to semi-stupor, responsive, gross disorientation' },
      { value: '4', text: '4 — coma' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['wh-grade'], () => safe(o, () => {
      const r = M.westHavenHe({ grade: selVal('wh-grade') });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'West Haven', value: `Grade ${r.grade}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 hepatic-steatosis-index ------------------------------------
  'hepatic-steatosis-index'(root) {
    note(root, 'Hepatic Steatosis Index (Lee 2010): a NAFLD screen, HSI = 8 × (ALT/AST) + BMI + 2 (female) + 2 (diabetes). Below 30 rules NAFLD out; above 36 rules it in; 30-36 is indeterminate.');
    root.appendChild(field('ALT (U/L)', 'hs-alt', { step: '1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(field('AST (U/L)', 'hs-ast', { step: '1', min: 0, placeholder: 'e.g. 30' }));
    root.appendChild(field('BMI (kg/m²)', 'hs-bmi', { step: '0.1', min: 0, placeholder: 'e.g. 30' }));
    root.appendChild(checkField('Female', 'hs-female'));
    root.appendChild(checkField('Diabetes mellitus', 'hs-dm'));
    const o = out(); root.appendChild(o);
    wire(['hs-alt', 'hs-ast', 'hs-bmi', 'hs-female', 'hs-dm'], () => safe(o, () => {
      const r = M.hepaticSteatosisIndex({ alt: optNum('hs-alt'), ast: optNum('hs-ast'), bmi: optNum('hs-bmi'), female: chk('hs-female'), diabetes: chk('hs-dm') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'HSI', value: String(r.hsi) },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
