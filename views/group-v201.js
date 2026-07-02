// spec-v201 §2: renderers for the five hepatology & upper-GI-bleeding
// prognostic tiles — Glasgow-Blatchford, CLIF-C AD, Hepamet, CLIP, and Agile
// 3+. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// The logistic models (CLIF-C AD, Hepamet, Agile 3+) take ln() of labs and are
// finite-guarded in lib/hepatology-gibleed-v201.js. Per the spec-v50 §3 posture
// note each tile defers the transfusion / endoscopy / biopsy / transplant /
// disposition decision to the clinician and the patient (spec-v11 §5.3) — these
// triage and stratify, they do not order.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hepatology-gibleed-v201.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The score is the cited source’s, computed from the inputs you enter. The transfusion, endoscopy, biopsy, transplant, and disposition decisions stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  // ----- 2.1 glasgow-blatchford ----------------------------------------------
  'glasgow-blatchford'(root) {
    note(root, 'Glasgow-Blatchford Score (Blatchford 2000): a pre-endoscopy upper-GI-bleed risk score from first-contact data. A score of 0 (or ≤ 1 by the BSG extension) flags a candidate for outpatient management; ≥ 6 a > 50% chance of needing intervention. Near-neighbors: rockall, aims65.');
    root.appendChild(selectField('Urea unit', 'gbs-ureaunit', [
      { value: 'mmol', text: 'Blood urea (mmol/L)' },
      { value: 'mgdl', text: 'BUN (mg/dL)' },
    ]));
    root.appendChild(num('Blood urea / BUN (in the unit selected above)', 'gbs-urea', { min: '0' }));
    root.appendChild(selectField('Sex', 'gbs-sex', [
      { value: 'male', text: 'Male' },
      { value: 'female', text: 'Female' },
    ]));
    root.appendChild(num('Hemoglobin (g/dL)', 'gbs-hb', { min: '1', max: '25' }));
    root.appendChild(num('Systolic BP (mmHg)', 'gbs-sbp', { min: '20' }));
    root.appendChild(checkField('Pulse ≥ 100 /min (+1)', 'gbs-pulse'));
    root.appendChild(checkField('Presentation with melena (+1)', 'gbs-melena'));
    root.appendChild(checkField('Presentation with syncope (+2)', 'gbs-syncope'));
    root.appendChild(checkField('Hepatic disease (+2)', 'gbs-hepatic'));
    root.appendChild(checkField('Cardiac failure (+2)', 'gbs-cardiac'));
    const o = out(); root.appendChild(o);
    const ids = ['gbs-ureaunit', 'gbs-urea', 'gbs-sex', 'gbs-hb', 'gbs-sbp', 'gbs-pulse', 'gbs-melena', 'gbs-syncope', 'gbs-hepatic', 'gbs-cardiac'];
    wire(ids, () => safe(o, () => {
      const r = M.glasgowBlatchford({
        ureaUnit: val('gbs-ureaunit'), urea: val('gbs-urea'), sex: val('gbs-sex'), hb: val('gbs-hb'), sbp: val('gbs-sbp'),
        pulseHigh: chk('gbs-pulse'), melena: chk('gbs-melena'), syncope: chk('gbs-syncope'), hepatic: chk('gbs-hepatic'), cardiac: chk('gbs-cardiac'),
      });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'GBS', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 clif-c-ad -------------------------------------------------------
  'clif-c-ad'(root) {
    note(root, 'CLIF-C AD score (Jalan 2015): a mortality model for the hospitalised decompensated cirrhotic without acute-on-chronic liver failure. CLIF-C ADs = 10 × [0.03·age + 0.66·ln(creatinine) + 1.71·ln(INR) + 0.88·ln(WBC) − 0.05·sodium + 8]. Bands: < 50 low, 50–59 intermediate, ≥ 60 high. Near-neighbors: clif-c-aclf, meld-na.');
    root.appendChild(num('Age (years)', 'clifad-age', { min: '0' }));
    root.appendChild(num('Creatinine (mg/dL)', 'clifad-creat', { min: '0' }));
    root.appendChild(num('INR', 'clifad-inr', { min: '0' }));
    root.appendChild(num('WBC (×10⁹/L)', 'clifad-wbc', { min: '0' }));
    root.appendChild(num('Sodium (mmol/L)', 'clifad-na', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['clifad-age', 'clifad-creat', 'clifad-inr', 'clifad-wbc', 'clifad-na'];
    wire(ids, () => safe(o, () => {
      const r = M.clifcAd({ age: val('clifad-age'), creatinine: val('clifad-creat'), inr: val('clifad-inr'), wbc: val('clifad-wbc'), sodium: val('clifad-na') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CLIF-C AD', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 hepamet-fibrosis ------------------------------------------------
  'hepamet-fibrosis'(root) {
    note(root, 'Hepamet Fibrosis Score (Ampuero 2020): a non-invasive advanced-fibrosis score for NAFLD from age, sex, AST, albumin, HOMA-IR, diabetes, and platelets. Cut-points: < 0.12 rules OUT, ≥ 0.47 rules IN, 0.12–0.47 indeterminate. Built to shrink the FIB-4 / NFS gray zone. Near-neighbors: fib4, nafld-fibrosis.');
    root.appendChild(num('Age (years)', 'hep-age', { min: '0' }));
    root.appendChild(selectField('Sex', 'hep-sex', [
      { value: 'male', text: 'Male' },
      { value: 'female', text: 'Female' },
    ]));
    root.appendChild(num('AST (IU/L)', 'hep-ast', { min: '0' }));
    root.appendChild(num('Albumin (g/dL)', 'hep-alb', { min: '0' }));
    root.appendChild(num('Platelets (×10⁹/L)', 'hep-plt', { min: '0' }));
    root.appendChild(checkField('Diabetes mellitus (if checked, HOMA-IR is not needed)', 'hep-dm'));
    root.appendChild(num('HOMA-IR (non-diabetic only)', 'hep-homa', { min: '0' }));
    const o = out(); root.appendChild(o);
    const ids = ['hep-age', 'hep-sex', 'hep-ast', 'hep-alb', 'hep-plt', 'hep-dm', 'hep-homa'];
    wire(ids, () => safe(o, () => {
      const r = M.hepamet({ age: val('hep-age'), sex: val('hep-sex'), ast: val('hep-ast'), albumin: val('hep-alb'), platelets: val('hep-plt'), diabetes: chk('hep-dm'), homa: val('hep-homa') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Hepamet', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 clip-hcc --------------------------------------------------------
  'clip-hcc'(root) {
    note(root, 'CLIP score (CLIP Investigators 1998): an HCC prognostic score summing four items 0–6 — Child-Pugh stage, tumor morphology, AFP, and portal-vein thrombosis. Median survival falls from ≈ 36 months at 0 to ≈ 3 months at 4–6. Complementary to BCLC. Near-neighbors: bclc-hcc, albi-grade, meld-childpugh.');
    root.appendChild(selectField('Child-Pugh stage', 'clip-child', [
      { value: 'A', text: 'A (+0)' },
      { value: 'B', text: 'B (+1)' },
      { value: 'C', text: 'C (+2)' },
    ]));
    root.appendChild(selectField('Tumor morphology', 'clip-morph', [
      { value: 'uni', text: 'Uninodular and ≤ 50% liver (+0)' },
      { value: 'multi', text: 'Multinodular and ≤ 50% liver (+1)' },
      { value: 'massive', text: 'Massive or > 50% liver (+2)' },
    ]));
    root.appendChild(num('Alpha-fetoprotein (ng/mL)', 'clip-afp', { min: '0' }));
    root.appendChild(checkField('Portal-vein thrombosis (+1)', 'clip-pvt'));
    const o = out(); root.appendChild(o);
    const ids = ['clip-child', 'clip-morph', 'clip-afp', 'clip-pvt'];
    wire(ids, () => safe(o, () => {
      const r = M.clip({ childPugh: val('clip-child'), morphology: val('clip-morph'), afp: val('clip-afp'), pvt: chk('clip-pvt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'CLIP', value: `${r.score}` }]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
