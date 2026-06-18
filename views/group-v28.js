// spec-v103 §2: renderers for the six cardiovascular-risk / atherogenic-lipid
// tiles (score2, score2-op, mesa-chd, framingham-cvd, reynolds-risk in Group G;
// non-hdl-remnant in Group E).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each tile
// renders the spec-v50 §3 clinical posture note and frames its output as the cited
// model's risk / fraction -- none authors a statin-start, ezetimibe, PCSK9, or
// imaging order in Sophie's voice (spec-v11 §5.3). Each cross-links the existing
// ascvd / prevent / ldl-calc tiles so the clinician picks the right engine.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cvrisk-v103.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) {
  const n = document.getElementById(id);
  return n && n.value !== '' ? Number(n.value) : null;
}
function selVal(id) { return document.getElementById(id).value; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function isMale(id) { return selVal(id) === '1'; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The 10-year risk, vascular age, and cholesterol fractions are the cited model’s, computed from the inputs you entered; they estimate, not guarantee, an outcome. These engines complement -- never replace -- the US Pooled-Cohort (ascvd) / PREVENT tools; the statin, ezetimibe, PCSK9, and imaging decisions stay with the clinician and guideline.' }));
}
const SEX_OPTS = [{ value: '1', text: 'Male' }, { value: '0', text: 'Female' }];
const REGION_OPTS = [
  { value: 'low', text: 'Low-risk region' },
  { value: 'moderate', text: 'Moderate-risk region' },
  { value: 'high', text: 'High-risk region' },
  { value: 'very-high', text: 'Very-high-risk region' },
];
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 score2 ------------------------------------------------------
  score2(root) {
    root.appendChild(field('Age (years, 40-69)', 's2-age', { min: 40, max: 69, placeholder: '50' }));
    root.appendChild(selectField('Sex', 's2-sex', SEX_OPTS));
    root.appendChild(checkField('Current smoker', 's2-smoke'));
    root.appendChild(field('Systolic BP (mmHg)', 's2-sbp', { min: 60, max: 250, placeholder: '140' }));
    root.appendChild(field('Total cholesterol (mmol/L)', 's2-tc', { min: 1, max: 20, step: '0.1', placeholder: '5.5' }));
    root.appendChild(field('HDL cholesterol (mmol/L)', 's2-hdl', { min: 0.2, max: 5, step: '0.1', placeholder: '1.3' }));
    root.appendChild(selectField('European risk region', 's2-region', REGION_OPTS));
    const o = out(); root.appendChild(o);
    const ids = ['s2-age', 's2-sex', 's2-smoke', 's2-sbp', 's2-tc', 's2-hdl', 's2-region'];
    wire(ids, () => safe(o, () => {
      const r = M.score2({
        age: optNum('s2-age'), male: isMale('s2-sex'), smoker: chk('s2-smoke'),
        sbp: optNum('s2-sbp'), totalChol: optNum('s2-tc'), hdl: optNum('s2-hdl'), region: selVal('s2-region'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.category === 'very-high' ? 'warn' : null },
        { label: '10-year CVD risk', value: `${r.risk}%` },
        { label: 'ESC category', value: r.category },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 score2-op ---------------------------------------------------
  'score2-op'(root) {
    root.appendChild(field('Age (years, >= 70)', 'op-age', { min: 70, max: 100, placeholder: '75' }));
    root.appendChild(selectField('Sex', 'op-sex', SEX_OPTS));
    root.appendChild(checkField('Current smoker', 'op-smoke'));
    root.appendChild(checkField('Diabetes', 'op-dm'));
    root.appendChild(field('Systolic BP (mmHg)', 'op-sbp', { min: 60, max: 250, placeholder: '150' }));
    root.appendChild(field('Total cholesterol (mmol/L)', 'op-tc', { min: 1, max: 20, step: '0.1', placeholder: '5.5' }));
    root.appendChild(field('HDL cholesterol (mmol/L)', 'op-hdl', { min: 0.2, max: 5, step: '0.1', placeholder: '1.4' }));
    root.appendChild(selectField('European risk region', 'op-region', REGION_OPTS));
    const o = out(); root.appendChild(o);
    const ids = ['op-age', 'op-sex', 'op-smoke', 'op-dm', 'op-sbp', 'op-tc', 'op-hdl', 'op-region'];
    wire(ids, () => safe(o, () => {
      const r = M.score2Op({
        age: optNum('op-age'), male: isMale('op-sex'), smoker: chk('op-smoke'), diabetes: chk('op-dm'),
        sbp: optNum('op-sbp'), totalChol: optNum('op-tc'), hdl: optNum('op-hdl'), region: selVal('op-region'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.category === 'very-high' ? 'warn' : null },
        { label: '10-year CVD risk', value: `${r.risk}%` },
        { label: 'ESC category', value: r.category },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 mesa-chd ----------------------------------------------------
  'mesa-chd'(root) {
    root.appendChild(field('Age (years)', 'mesa-age', { min: 45, max: 85, placeholder: '60' }));
    root.appendChild(selectField('Sex', 'mesa-sex', SEX_OPTS));
    root.appendChild(selectField('Race / ethnicity', 'mesa-race', [
      { value: 'white', text: 'White (reference)' },
      { value: 'chinese', text: 'Chinese-American' },
      { value: 'black', text: 'African-American' },
      { value: 'hispanic', text: 'Hispanic' },
    ]));
    root.appendChild(field('Total cholesterol (mg/dL)', 'mesa-tc', { min: 50, max: 600, placeholder: '200' }));
    root.appendChild(field('HDL cholesterol (mg/dL)', 'mesa-hdl', { min: 5, max: 200, placeholder: '50' }));
    root.appendChild(field('Systolic BP (mmHg)', 'mesa-sbp', { min: 60, max: 300, placeholder: '125' }));
    root.appendChild(field('Agatston CAC score (optional)', 'mesa-cac', { min: 0, max: 10000, placeholder: '100' }));
    root.appendChild(checkField('Diabetes', 'mesa-dm'));
    root.appendChild(checkField('Current smoker', 'mesa-smoke'));
    root.appendChild(checkField('On lipid-lowering medication', 'mesa-lipid'));
    root.appendChild(checkField('On antihypertensive medication', 'mesa-bp'));
    root.appendChild(checkField('Family history of heart attack', 'mesa-fh'));
    const o = out(); root.appendChild(o);
    const ids = ['mesa-age', 'mesa-sex', 'mesa-race', 'mesa-tc', 'mesa-hdl', 'mesa-sbp', 'mesa-cac', 'mesa-dm', 'mesa-smoke', 'mesa-lipid', 'mesa-bp', 'mesa-fh'];
    wire(ids, () => safe(o, () => {
      const r = M.mesaChd({
        age: optNum('mesa-age'), male: isMale('mesa-sex'), race: selVal('mesa-race'),
        totalChol: optNum('mesa-tc'), hdl: optNum('mesa-hdl'), sbp: optNum('mesa-sbp'), cac: optNum('mesa-cac'),
        diabetes: chk('mesa-dm'), smoker: chk('mesa-smoke'), lipidMed: chk('mesa-lipid'), bpMed: chk('mesa-bp'), familyHx: chk('mesa-fh'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const rows = [
        { text: r.band, cls: (r.riskWithCac != null ? r.riskWithCac : r.riskNoCac) >= 20 ? 'warn' : null },
        { label: '10-year CHD risk (without CAC)', value: `${r.riskNoCac}%` },
      ];
      if (r.riskWithCac != null) rows.push({ label: '10-year CHD risk (with CAC)', value: `${r.riskWithCac}%` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 framingham-cvd ----------------------------------------------
  'framingham-cvd'(root) {
    root.appendChild(field('Age (years, 30-74)', 'fr-age', { min: 30, max: 74, placeholder: '55' }));
    root.appendChild(selectField('Sex', 'fr-sex', SEX_OPTS));
    root.appendChild(field('Total cholesterol (mg/dL)', 'fr-tc', { min: 50, max: 600, placeholder: '213' }));
    root.appendChild(field('HDL cholesterol (mg/dL)', 'fr-hdl', { min: 5, max: 200, placeholder: '50' }));
    root.appendChild(field('Systolic BP (mmHg)', 'fr-sbp', { min: 60, max: 300, placeholder: '120' }));
    root.appendChild(checkField('On antihypertensive medication', 'fr-bp'));
    root.appendChild(checkField('Current smoker', 'fr-smoke'));
    root.appendChild(checkField('Diabetes', 'fr-dm'));
    const o = out(); root.appendChild(o);
    const ids = ['fr-age', 'fr-sex', 'fr-tc', 'fr-hdl', 'fr-sbp', 'fr-bp', 'fr-smoke', 'fr-dm'];
    wire(ids, () => safe(o, () => {
      const r = M.framinghamCvd({
        age: optNum('fr-age'), male: isMale('fr-sex'), totalChol: optNum('fr-tc'), hdl: optNum('fr-hdl'),
        sbp: optNum('fr-sbp'), bpTreated: chk('fr-bp'), smoker: chk('fr-smoke'), diabetes: chk('fr-dm'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk >= 20 ? 'warn' : null },
        { label: '10-year general-CVD risk', value: `${r.risk}%` },
        { label: 'Vascular age', value: r.vascularAge != null ? `${r.vascularAge} years` : '--' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 reynolds-risk -----------------------------------------------
  'reynolds-risk'(root) {
    root.appendChild(field('Age (years)', 'rr-age', { min: 30, max: 100, placeholder: '55' }));
    root.appendChild(selectField('Sex', 'rr-sex', SEX_OPTS));
    root.appendChild(field('Systolic BP (mmHg)', 'rr-sbp', { min: 60, max: 300, placeholder: '125' }));
    root.appendChild(field('Total cholesterol (mg/dL)', 'rr-tc', { min: 50, max: 600, placeholder: '200' }));
    root.appendChild(field('HDL cholesterol (mg/dL)', 'rr-hdl', { min: 5, max: 200, placeholder: '50' }));
    root.appendChild(field('hsCRP (mg/L)', 'rr-crp', { min: 0.01, max: 100, step: '0.1', placeholder: '2.0' }));
    root.appendChild(checkField('Current smoker', 'rr-smoke'));
    root.appendChild(checkField('Parent with MI before age 60', 'rr-fh'));
    root.appendChild(checkField('Diabetic', 'rr-dm'));
    root.appendChild(field('HbA1c (%, women if diabetic)', 'rr-a1c', { min: 0, max: 25, step: '0.1', placeholder: '7.0' }));
    const o = out(); root.appendChild(o);
    const ids = ['rr-age', 'rr-sex', 'rr-sbp', 'rr-tc', 'rr-hdl', 'rr-crp', 'rr-smoke', 'rr-fh', 'rr-dm', 'rr-a1c'];
    wire(ids, () => safe(o, () => {
      const r = M.reynoldsRisk({
        age: optNum('rr-age'), male: isMale('rr-sex'), sbp: optNum('rr-sbp'), totalChol: optNum('rr-tc'),
        hdl: optNum('rr-hdl'), hsCrp: optNum('rr-crp'), smoker: chk('rr-smoke'), familyHx: chk('rr-fh'),
        diabetic: chk('rr-dm'), hba1c: optNum('rr-a1c'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.risk >= 20 ? 'warn' : null },
        { label: '10-year cardiovascular risk', value: `${r.risk}%` },
      ]);
      if (r.diabeticManNote) note(o, r.diabeticManNote);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 non-hdl-remnant ---------------------------------------------
  'non-hdl-remnant'(root) {
    root.appendChild(selectField('Units', 'nh-unit', [
      { value: 'mg', text: 'mg/dL' },
      { value: 'mmol', text: 'mmol/L' },
    ]));
    root.appendChild(field('Total cholesterol', 'nh-tc', { min: 0, max: 1000, step: '0.1', placeholder: '200' }));
    root.appendChild(field('HDL cholesterol', 'nh-hdl', { min: 0, max: 500, step: '0.1', placeholder: '50' }));
    root.appendChild(field('LDL cholesterol (optional, for remnant)', 'nh-ldl', { min: 0, max: 1000, step: '0.1', placeholder: '120' }));
    const o = out(); root.appendChild(o);
    const ids = ['nh-unit', 'nh-tc', 'nh-hdl', 'nh-ldl'];
    wire(ids, () => safe(o, () => {
      const r = M.nonHdlRemnant({
        totalChol: optNum('nh-tc'), hdl: optNum('nh-hdl'), ldl: optNum('nh-ldl'), unit: selVal('nh-unit'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const rows = [
        { text: r.band, cls: r.implausible || r.nonHdl >= r.target ? 'warn' : null },
        { label: 'Non-HDL cholesterol', value: `${r.nonHdl} ${r.unit}` },
      ];
      if (r.remnant != null && !r.implausible) rows.push({ label: 'Remnant cholesterol', value: `${r.remnant} ${r.unit}` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
