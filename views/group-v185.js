// spec-v185 §2: renderers for the eight gap-filling calculators — Fick cardiac
// output, Gorlin valve area, Qp/Qs shunt ratio, LVOT-VTI stroke volume,
// VTE-BLEED, Matsuda index, Rosendaal TTR, and Janmahasatian lean body weight.
// All Clinical Math & Conversions (Group E) except vte-bleed (Group G score).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each
// compute is closed-form arithmetic (or a bounded point score) over
// finite-checked inputs; every division / square-root / denominator is guarded
// in lib/gaps-v185.js (a blank / non-finite / zero-denominator input renders a
// surfaced complete-the-fields fallback, never NaN / Infinity). Per the
// spec-v50 §3 posture note each tile defers the management decision to the
// clinician (spec-v11 §5.3); vte-bleed additionally renders the
// weigh-against-recurrence framing as first-class output.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gaps-v185.js';
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
function textareaField(label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const ta = el('textarea', { id, rows: '4', autocomplete: 'off' });
  if (placeholder) ta.setAttribute('placeholder', placeholder);
  wrap.appendChild(ta);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function showInvalid(o, r) { note(o, r.message || 'Complete the remaining fields.'); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The value and its interpretation are the cited source’s, computed from the inputs you enter; measurement conditions and clinical context apply. The management decision stays with the treating clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SEX_OPTS = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
];
const FICK_METHOD_OPTS = [
  { value: 'measured', text: 'Measured VO₂' },
  { value: 'estimated', text: 'Estimated VO₂ (LaFarge)' },
];
const VALVE_OPTS = [
  { value: 'aortic', text: 'Aortic (systolic ejection period, K = 44.3)' },
  { value: 'mitral', text: 'Mitral (diastolic filling period, K = 37.7)' },
];

export const renderers = {
  // ----- 2.1 fick-cardiac-output --------------------------------------------
  'fick-cardiac-output'(root) {
    note(root, 'Cardiac output by the Fick principle (Fick 1870; LaFarge estimated VO₂ 1970). CO = VO₂ / [1.36·Hb·(SaO₂ − SvO₂)·10]; CI = CO/BSA (normal 2.5–4.0). Choose a measured VO₂ or estimate it from age, sex, and heart rate. Near-neighbors: hemodynamic-suite, cao2-do2, aortic-valve-area.');
    root.appendChild(selectField('VO₂ source', 'fick-method', FICK_METHOD_OPTS));
    root.appendChild(num('Measured VO₂ (mL/min) — for the measured method', 'fick-vo2'));
    root.appendChild(field('Age (years) — for the estimate', 'fick-age', { type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
    root.appendChild(pickField('Sex — for the estimate', 'fick-sex', SEX_OPTS));
    root.appendChild(num('Heart rate (bpm) — for the estimate', 'fick-hr'));
    root.appendChild(num('Hemoglobin (g/dL)', 'fick-hb'));
    root.appendChild(num('Arterial O₂ saturation SaO₂ (%)', 'fick-sao2'));
    root.appendChild(num('Mixed-venous O₂ saturation SvO₂ (%)', 'fick-svo2'));
    root.appendChild(num('Body surface area BSA (m²)', 'fick-bsa'));
    const o = out(); root.appendChild(o);
    wire(['fick-method', 'fick-vo2', 'fick-age', 'fick-sex', 'fick-hr', 'fick-hb', 'fick-sao2', 'fick-svo2', 'fick-bsa'], () => safe(o, () => {
      const r = M.fickCardiacOutput({ method: val('fick-method'), vo2: val('fick-vo2'), age: val('fick-age'), sex: val('fick-sex'), hr: val('fick-hr'), hb: val('fick-hb'), sao2: val('fick-sao2'), svo2: val('fick-svo2'), bsa: val('fick-bsa') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Cardiac output', value: `${r.co} L/min` },
        { label: 'Cardiac index', value: `${r.ci} L/min/m²` },
        { label: 'a–v O₂ diff', value: `${r.avDiff} mL/dL` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 gorlin ----------------------------------------------------------
  gorlin(root) {
    note(root, 'Gorlin valve area (Gorlin 1951): area = flow / (K·√mean gradient); flow = CO(mL/min) / (period·HR). K = 44.3 with the systolic ejection period (aortic), 37.7 with the diastolic filling period (mitral). Severity (cm²): severe < 1.0, moderate 1.0–1.5. Near-neighbors: aortic-valve-area, hemodynamic-suite.');
    root.appendChild(pickField('Valve', 'gorlin-valve', VALVE_OPTS));
    root.appendChild(num('Cardiac output (L/min)', 'gorlin-co'));
    root.appendChild(num('Heart rate (bpm)', 'gorlin-hr'));
    root.appendChild(num('Ejection / filling period (s per beat)', 'gorlin-period'));
    root.appendChild(num('Mean pressure gradient (mmHg)', 'gorlin-grad'));
    const o = out(); root.appendChild(o);
    wire(['gorlin-valve', 'gorlin-co', 'gorlin-hr', 'gorlin-period', 'gorlin-grad'], () => safe(o, () => {
      const r = M.gorlin({ valve: val('gorlin-valve'), co: val('gorlin-co'), hr: val('gorlin-hr'), period: val('gorlin-period'), grad: val('gorlin-grad') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Valve area', value: `${r.area} cm²` },
        { label: 'Flow', value: `${r.flow} mL/s` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 qp-qs -----------------------------------------------------------
  'qp-qs'(root) {
    note(root, 'Pulmonary-to-systemic flow ratio (Wilkinson 2001): Qp/Qs = (SaO₂ − MvO₂)/(PvO₂ − PaO₂). ≈ 1 no net shunt; small 1.1–1.5, moderate 1.5–2.0, large > 2.0 (closure often considered); < 1 net right-to-left. Near-neighbors: gorlin, hemodynamic-suite.');
    root.appendChild(num('Systemic-arterial (aortic) SaO₂ (%)', 'qpqs-sao2'));
    root.appendChild(num('Mixed-venous MvO₂ (%)', 'qpqs-mvo2'));
    root.appendChild(num('Pulmonary-vein PvO₂ (%) — defaults to 98', 'qpqs-pvo2'));
    root.appendChild(num('Pulmonary-artery PaO₂ (%)', 'qpqs-pao2'));
    const o = out(); root.appendChild(o);
    wire(['qpqs-sao2', 'qpqs-mvo2', 'qpqs-pvo2', 'qpqs-pao2'], () => safe(o, () => {
      const r = M.qpQs({ sao2: val('qpqs-sao2'), mvo2: val('qpqs-mvo2'), pvo2: val('qpqs-pvo2'), pao2: val('qpqs-pao2') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Qp/Qs', value: `${r.ratio}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 lvot-stroke-volume ---------------------------------------------
  'lvot-stroke-volume'(root) {
    note(root, 'Doppler stroke volume & cardiac output (ASE/EACVI, Lang 2015): LVOT area = π·(D/2)²; SV = area·VTI; CO = SV·HR/1000; SVI = SV/BSA (normal 35–47 mL/m²); CI = CO/BSA. Near-neighbors: hemodynamic-suite, fick-cardiac-output.');
    root.appendChild(num('LVOT diameter (cm)', 'lvot-d'));
    root.appendChild(num('LVOT velocity-time integral VTI (cm)', 'lvot-vti'));
    root.appendChild(num('Heart rate (bpm)', 'lvot-hr'));
    root.appendChild(num('Body surface area BSA (m²)', 'lvot-bsa'));
    const o = out(); root.appendChild(o);
    wire(['lvot-d', 'lvot-vti', 'lvot-hr', 'lvot-bsa'], () => safe(o, () => {
      const r = M.lvotStrokeVolume({ d: val('lvot-d'), vti: val('lvot-vti'), hr: val('lvot-hr'), bsa: val('lvot-bsa') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Stroke volume', value: `${r.sv} mL` },
        { label: 'Cardiac output', value: `${r.co} L/min` },
        { label: 'Cardiac index', value: `${r.ci} L/min/m²` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 vte-bleed -------------------------------------------------------
  'vte-bleed'(root) {
    note(root, 'VTE-BLEED bleeding risk on stable anticoagulation (Klok 2016). Points: active cancer 2; male with uncontrolled hypertension 1; anemia, history of bleeding, age ≥ 60, and renal dysfunction 1.5 each. ≥ 2 = elevated. Near-neighbors: hasbled, atria-bleeding, orbit-bleeding.');
    root.appendChild(checkField('Active cancer (2)', 'vte-cancer'));
    root.appendChild(checkField('Male with uncontrolled hypertension (1)', 'vte-maleHtn'));
    root.appendChild(checkField('Anemia (1.5)', 'vte-anemia'));
    root.appendChild(checkField('History of bleeding (1.5)', 'vte-bleeding'));
    root.appendChild(checkField('Age ≥ 60 years (1.5)', 'vte-age60'));
    root.appendChild(checkField('Renal dysfunction, CrCl 30–60 (1.5)', 'vte-renal'));
    const o = out(); root.appendChild(o);
    wire(['vte-cancer', 'vte-maleHtn', 'vte-anemia', 'vte-bleeding', 'vte-age60', 'vte-renal'], () => safe(o, () => {
      const r = M.vteBleed({ cancer: chk('vte-cancer'), maleHtn: chk('vte-maleHtn'), anemia: chk('vte-anemia'), bleeding: chk('vte-bleeding'), age60: chk('vte-age60'), renal: chk('vte-renal') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'VTE-BLEED', value: `${r.score}` },
      ]);
      note(o, r.detail);
      note(o, 'Weigh against recurrence risk; an elevated score does not by itself stop anticoagulation.');
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 matsuda-index ---------------------------------------------------
  'matsuda-index'(root) {
    note(root, 'Matsuda whole-body insulin-sensitivity index (Matsuda & DeFronzo 1999): ISI = 10000/√(fasting glucose·fasting insulin·mean glucose·mean insulin), glucose mg/dL, insulin µU/mL. Lower = more insulin resistant. Complements fasting HOMA-IR / QUICKI. Near-neighbors: homa-ir, quicki.');
    root.appendChild(num('Fasting glucose (mg/dL)', 'matsuda-g0'));
    root.appendChild(num('Fasting insulin (µU/mL)', 'matsuda-i0'));
    root.appendChild(num('Mean OGTT glucose (mg/dL)', 'matsuda-gmean'));
    root.appendChild(num('Mean OGTT insulin (µU/mL)', 'matsuda-imean'));
    const o = out(); root.appendChild(o);
    wire(['matsuda-g0', 'matsuda-i0', 'matsuda-gmean', 'matsuda-imean'], () => safe(o, () => {
      const r = M.matsudaIndex({ g0: val('matsuda-g0'), i0: val('matsuda-i0'), gMean: val('matsuda-gmean'), iMean: val('matsuda-imean') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Matsuda index', value: `${r.index}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.7 rosendaal-ttr ---------------------------------------------------
  'rosendaal-ttr'(root) {
    note(root, 'Time in therapeutic range (Rosendaal 1993): an INR is linearly interpolated across the days between measurements; TTR = days-in-range / total-days. Good control commonly ≥ 65%. Near-neighbors: warfarin dosing tiles.');
    root.appendChild(textareaField('Dated INR values — one per line, "YYYY-MM-DD INR"', 'ttr-series', '2026-01-01 1.5\n2026-01-11 2.5\n2026-01-21 2.8'));
    root.appendChild(field('Target INR low', 'ttr-low', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: '2.0' }));
    root.appendChild(field('Target INR high', 'ttr-high', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: '3.0' }));
    const o = out(); root.appendChild(o);
    wire(['ttr-series', 'ttr-low', 'ttr-high'], () => safe(o, () => {
      const r = M.rosendaalTtr({ series: val('ttr-series'), low: val('ttr-low'), high: val('ttr-high') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'TTR', value: `${r.ttr} %` },
        { label: 'Days in range', value: `${r.inRange} / ${r.total}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.8 lean-body-weight ------------------------------------------------
  'lean-body-weight'(root) {
    note(root, 'Lean body weight (Janmahasatian 2005): LBW = 9270·TBW/(6680 + 216·BMI) for men, 9270·TBW/(8780 + 244·BMI) for women; BMI = weight/height². Many anesthetic induction agents dose to LBW. Near-neighbors: bw-bsa-suite.');
    root.appendChild(pickField('Sex', 'lbw-sex', SEX_OPTS));
    root.appendChild(num('Total body weight (kg)', 'lbw-weight'));
    root.appendChild(num('Height (cm)', 'lbw-height'));
    const o = out(); root.appendChild(o);
    wire(['lbw-sex', 'lbw-weight', 'lbw-height'], () => safe(o, () => {
      const r = M.leanBodyWeight({ sex: val('lbw-sex'), weight: val('lbw-weight'), height: val('lbw-height') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Lean body weight', value: `${r.lbw} kg` },
        { label: 'BMI', value: `${r.bmi}` },
      ]);
      note(o, r.detail); note(o, r.note);
    }));
    postureNote(root);
  },
};
