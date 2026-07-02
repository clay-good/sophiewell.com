// spec-v196 §2: renderers for the five chronic-liver-disease prognostic tiles —
// ABIC, GLOBE, UK-PBC risk, PAGE-B, and the revised Mayo PSC model. Groups E
// (continuous math) and G (PAGE-B point score).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. The
// log-domain and [0,1] edges are guarded in lib/liver-v196.js. Per the spec-v50
// §3 posture note each tile defers the treatment / listing / allocation decision
// to the hepatology and transplant team and patient (spec-v11 §5.3) — these
// prognosticate, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/liver-v196.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The UDCA / second-line, transplant-listing, HCC-surveillance, and antiviral decisions stay with the hepatology and transplant team and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
const SEX_OPTS = [{ value: 'female', text: 'Female' }, { value: 'male', text: 'Male' }];

export const renderers = {
  // ----- 2.1 abic-score ------------------------------------------------------
  'abic-score'(root) {
    note(root, 'ABIC score for alcoholic hepatitis (Dominguez 2008): 0.1×age + 0.08×bilirubin + 0.3×creatinine + 0.8×INR. 90-day survival: < 6.71 ~100%, 6.71–< 9.0 ~70%, ≥ 9.0 ~25%. Near-neighbors: maddrey-lille, gahs, meld-na.');
    root.appendChild(num('Age (years)', 'abic-age'));
    root.appendChild(num('Serum bilirubin (mg/dL)', 'abic-bili'));
    root.appendChild(num('Serum creatinine (mg/dL)', 'abic-creat'));
    root.appendChild(num('INR', 'abic-inr'));
    const o = out(); root.appendChild(o);
    wire(['abic-age', 'abic-bili', 'abic-creat', 'abic-inr'], () => safe(o, () => {
      const r = M.abicScore({ age: val('abic-age'), bilirubin: val('abic-bili'), creatinine: val('abic-creat'), inr: val('abic-inr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'ABIC', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 globe-score -----------------------------------------------------
  'globe-score'(root) {
    note(root, 'GLOBE score for PBC on UDCA (Lammers 2015): from age and 1-year bilirubin (×ULN), ALP (×ULN), albumin (×LLN), platelets (×10⁹/L). A score > 0.30 marks a non-responder. Near-neighbors: uk-pbc-risk, albi-grade.');
    root.appendChild(num('Age (years)', 'globe-age'));
    root.appendChild(num('Bilirubin (× ULN)', 'globe-bili'));
    root.appendChild(num('Alkaline phosphatase (× ULN)', 'globe-alp'));
    root.appendChild(num('Albumin (× LLN)', 'globe-alb'));
    root.appendChild(num('Platelet count (× 10⁹/L)', 'globe-plt'));
    const o = out(); root.appendChild(o);
    wire(['globe-age', 'globe-bili', 'globe-alp', 'globe-alb', 'globe-plt'], () => safe(o, () => {
      const r = M.globeScore({ age: val('globe-age'), bili: val('globe-bili'), alp: val('globe-alp'), albumin: val('globe-alb'), platelets: val('globe-plt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'GLOBE', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 uk-pbc-risk -----------------------------------------------------
  'uk-pbc-risk'(root) {
    note(root, 'UK-PBC risk score (Carbone 2016): from ALP, transaminase, bilirubin (each ×ULN at 12 mo) plus baseline albumin and platelets (×LLN), predicts 5/10/15-year risk of end-stage liver disease. Near-neighbors: globe-score.');
    root.appendChild(num('Alkaline phosphatase (× ULN, 12 mo)', 'ukpbc-alp'));
    root.appendChild(num('Transaminase ALT or AST (× ULN, 12 mo)', 'ukpbc-trans'));
    root.appendChild(num('Bilirubin (× ULN, 12 mo)', 'ukpbc-bili'));
    root.appendChild(num('Baseline albumin (× LLN)', 'ukpbc-alb'));
    root.appendChild(num('Baseline platelets (× LLN)', 'ukpbc-plt'));
    const o = out(); root.appendChild(o);
    wire(['ukpbc-alp', 'ukpbc-trans', 'ukpbc-bili', 'ukpbc-alb', 'ukpbc-plt'], () => safe(o, () => {
      const r = M.ukPbcRisk({ alp: val('ukpbc-alp'), transaminase: val('ukpbc-trans'), bili: val('ukpbc-bili'), albumin: val('ukpbc-alb'), platelets: val('ukpbc-plt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: '5-yr', value: `${r.r5}%` }, { label: '10-yr', value: `${r.r10}%` }, { label: '15-yr', value: `${r.r15}%` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 page-b ----------------------------------------------------------
  'page-b'(root) {
    note(root, 'PAGE-B score for HCC risk in treated chronic hepatitis B (Papatheodoridis 2016): age, sex, and platelets → ≤ 9 low, 10–17 intermediate, ≥ 18 high (5-year HCC risk). Near-neighbors: bclc-hcc.');
    root.appendChild(num('Age (years)', 'pageb-age'));
    root.appendChild(pickField('Sex', 'pageb-sex', SEX_OPTS));
    root.appendChild(num('Platelet count (× 10⁹/L)', 'pageb-plt'));
    const o = out(); root.appendChild(o);
    wire(['pageb-age', 'pageb-sex', 'pageb-plt'], () => safe(o, () => {
      const r = M.pageB({ age: val('pageb-age'), sex: val('pageb-sex'), platelets: val('pageb-plt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Score', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 mayo-psc-risk ---------------------------------------------------
  'mayo-psc-risk'(root) {
    note(root, 'Revised Mayo PSC natural-history model (Kim 2000): R = 0.03×age + 0.54×ln(bilirubin) + 0.54×ln(AST) + 1.24×(variceal bleed) − 0.84×albumin. Higher = worse. Near-neighbors: meld-na, kings-college.');
    root.appendChild(num('Age (years)', 'mayopsc-age'));
    root.appendChild(num('Bilirubin (mg/dL)', 'mayopsc-bili'));
    root.appendChild(num('Albumin (g/dL)', 'mayopsc-alb'));
    root.appendChild(num('AST (U/L)', 'mayopsc-ast'));
    root.appendChild(checkField('History of variceal bleeding', 'mayopsc-var'));
    const o = out(); root.appendChild(o);
    wire(['mayopsc-age', 'mayopsc-bili', 'mayopsc-alb', 'mayopsc-ast', 'mayopsc-var'], () => safe(o, () => {
      const r = M.mayoPscRisk({ age: val('mayopsc-age'), bilirubin: val('mayopsc-bili'), albumin: val('mayopsc-alb'), ast: val('mayopsc-ast'), variceal: chk('mayopsc-var') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'R', value: `${r.value}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
