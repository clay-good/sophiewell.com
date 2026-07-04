// spec-v238 §2: renderers for the anthropometric / metabolic estimators — RFM,
// the body roundness index, the US Navy body-fat estimate, and eGDR. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/anthro-v238.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}
const SEX = [['male', 'Male'], ['female', 'Female']];

export const renderers = {
  'relative-fat-mass'(root) {
    note(root, 'RFM (Woolcott 2018) = 64 - 20 x (height / waist) + 12 x sex (female = 1). Estimates whole-body fat %. Near-neighbors: deurenberg-body-fat, navy-body-fat.');
    root.appendChild(numInput('Height (cm or in)', 'rfm-height', { min: '0' }));
    root.appendChild(numInput('Waist circumference (same units)', 'rfm-waist', { min: '0' }));
    root.appendChild(select('Sex', 'rfm-sex', SEX));
    const o = out(); root.appendChild(o);
    wire(['rfm-height', 'rfm-waist', 'rfm-sex'], () => safe(o, () => {
      render(o, M.relativeFatMass({ height: val('rfm-height'), waist: val('rfm-waist'), sex: val('rfm-sex') }), 'RFM');
    }));
    postureNote(root);
  },
  'body-roundness-index'(root) {
    note(root, 'BRI (Thomas 2013) = 364.2 - 365.5 x sqrt(1 - ((waist/(2·pi))/(0.5·height))^2). Higher = more central adiposity. Near-neighbors: relative-fat-mass.');
    root.appendChild(numInput('Waist circumference (cm)', 'bri-waist', { min: '0' }));
    root.appendChild(numInput('Height (cm)', 'bri-height', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['bri-waist', 'bri-height'], () => safe(o, () => {
      render(o, M.bodyRoundnessIndex({ waist: val('bri-waist'), height: val('bri-height') }), 'BRI');
    }));
    postureNote(root);
  },
  'navy-body-fat'(root) {
    note(root, 'US Navy body fat (Hodgdon-Beckett 1984), measurements in inches. Men use neck + waist; women add hip. Near-neighbors: relative-fat-mass, deurenberg-body-fat.');
    root.appendChild(select('Sex', 'navy-sex', SEX));
    root.appendChild(numInput('Height (in)', 'navy-height', { min: '0' }));
    root.appendChild(numInput('Neck (in)', 'navy-neck', { min: '0' }));
    root.appendChild(numInput('Waist (in)', 'navy-waist', { min: '0' }));
    root.appendChild(numInput('Hip (in, women only)', 'navy-hip', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['navy-sex', 'navy-height', 'navy-neck', 'navy-waist', 'navy-hip'], () => safe(o, () => {
      render(o, M.navyBodyFat({ sex: val('navy-sex'), height: val('navy-height'), neck: val('navy-neck'), waist: val('navy-waist'), hip: val('navy-hip') }), 'Body fat %');
    }));
    postureNote(root);
  },
  'egdr'(root) {
    note(root, 'eGDR (Williams 2000) = 21.158 - 0.09·waist(cm) - 3.407·hypertension - 0.551·HbA1c. Lower = more insulin resistant. Near-neighbors: homa-ir, tyg-index.');
    root.appendChild(numInput('Waist circumference (cm)', 'egdr-waist', { min: '0' }));
    root.appendChild(check('Hypertension (treated or BP >= 140/90)', 'egdr-htn'));
    root.appendChild(numInput('HbA1c (%)', 'egdr-a1c', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['egdr-waist', 'egdr-htn', 'egdr-a1c'], () => safe(o, () => {
      render(o, M.egdr({ waist: val('egdr-waist'), hypertension: chk('egdr-htn'), a1c: val('egdr-a1c') }), 'eGDR');
    }));
    postureNote(root);
  },
};
