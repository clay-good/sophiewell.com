// spec-v1656: occupational and employee health rules as arithmetic.
// osha-noise-dose, osha-standard-threshold-shift, osha-lead-medical-removal, fmcsa-bp-certification,
// fmcsa-hearing-standard, osha-lead-airborne-pel-shift.

import { el, clear } from '../lib/dom.js';
import { segmentedFromSelect } from '../lib/components.js';
import { resultRow } from '../lib/result-copy.js';
import * as OND from '../lib/osha-noise-dose-v1656.js';
import * as STS from '../lib/osha-standard-threshold-shift-v1656.js';
import * as OLM from '../lib/osha-lead-medical-removal-v1656.js';
import * as FBP from '../lib/fmcsa-bp-certification-v1656.js';
import * as FHS from '../lib/fmcsa-hearing-standard-v1656.js';
import * as OLP from '../lib/osha-lead-airborne-pel-shift-v1656.js';

const NA = { value: '', text: '— choose —' };
const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', placeholder, ...attrs }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder, ...attrs }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
function tool(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

// The audiogram grid: per ear, the baseline and the recent threshold at 2000, 3000 and 4000 Hz.
const STS_PAIRS = [];
for (const [ear, Ear] of [['right', 'Right'], ['left', 'Left']]) {
  for (const [k, when] of [['b', 'baseline'], ['r', 'recent']]) {
    for (const hz of [2, 3, 4]) {
      STS_PAIRS.push([`sts-${ear}-${k}${hz}`, `${ear}${k.toUpperCase()}${hz}`, `${Ear} ear, ${when}, ${hz}000 Hz (dB)`]);
    }
  }
}

export const renderers = {
  'osha-noise-dose'(root) {
    areaField(root, 'Exposures, one per line: sound level in dBA (slow response), then hours or hours:minutes', 'ond-segments', '95, 4\n90, 4');
    numField(root, 'Or a dosimeter dose in percent (used only when no exposures are entered)', 'ond-dose', 'e.g. 91', { min: '0' });
    selectField(root, 'Impulsive or impact noise above 140 dB peak', 'ond-impulse', YES_NO);
    tool(root, [['ond-segments', 'segments'], ['ond-dose', 'dosimeterDose'], ['ond-impulse', 'impulseOver140']], OND.oshaNoiseDose);
  },
  'osha-standard-threshold-shift'(root) {
    note(root, 'Enter one or both ears. The shift is defined on 2000, 3000 and 4000 Hz.');
    for (const [dom, , label] of STS_PAIRS) numField(root, label, dom, '');
    selectField(root, 'Apply the Appendix F age correction', 'sts-correct', YES_NO);
    selectField(root, 'Sex (selects Table F-1 or F-2)', 'sts-sex', [{ value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }]);
    segmentedFromSelect(root.querySelector('#sts-sex'));
    numField(root, 'Age at the baseline audiogram (years)', 'sts-baseline-age', 'e.g. 27', { min: '0' });
    numField(root, 'Age at the recent audiogram (years)', 'sts-recent-age', 'e.g. 32', { min: '0' });
    tool(root, [
      ...STS_PAIRS.map(([dom, arg]) => [dom, arg]),
      ['sts-correct', 'ageCorrection'], ['sts-sex', 'sex'], ['sts-baseline-age', 'baselineAge'], ['sts-recent-age', 'recentAge'],
    ], STS.oshaStandardThresholdShift);
  },
  'osha-lead-medical-removal'(root) {
    areaField(root, 'Blood lead results, one per line: test date (YYYY-MM-DD), then the result in µg/100 g', 'olm-results', '2026-03-02, 62\n2026-03-12, 61', { 'data-private': '' });
    selectField(root, 'The last result is the follow-up test of the one before it', 'olm-followup', YES_NO);
    selectField(root, 'Currently removed for an elevated blood lead', 'olm-removed', YES_NO);
    tool(root, [['olm-results', 'results'], ['olm-followup', 'lastIsFollowUp'], ['olm-removed', 'currentlyRemoved']], OLM.oshaLeadMedicalRemoval);
  },
  'fmcsa-bp-certification'(root) {
    numField(root, 'Systolic pressure (mmHg)', 'fbp-systolic', 'e.g. 150', { min: '0' });
    numField(root, 'Diastolic pressure (mmHg)', 'fbp-diastolic', 'e.g. 92', { min: '0' });
    selectField(root, 'Which examination', 'fbp-context', FBP.CONTEXTS);
    selectField(root, 'Treatment well tolerated (after Stage 2 or 3)', 'fbp-tolerated', YES_NO);
    tool(root, [['fbp-systolic', 'systolic'], ['fbp-diastolic', 'diastolic'], ['fbp-context', 'context'], ['fbp-tolerated', 'treatmentTolerated']], FBP.fmcsaBpCertification);
  },
  'fmcsa-hearing-standard'(root) {
    numField(root, 'Forced whisper first perceived in the better ear at (feet)', 'fhs-whisper', 'e.g. 5', { min: '0' });
    numField(root, 'Better ear, 500 Hz (dB)', 'fhs-500', '');
    numField(root, 'Better ear, 1,000 Hz (dB)', 'fhs-1000', '');
    numField(root, 'Better ear, 2,000 Hz (dB)', 'fhs-2000', '');
    selectField(root, 'Audiometer calibration', 'fhs-calibration', [{ value: 'ansi', text: 'ANSI' }, { value: 'iso', text: 'ISO (converted to ANSI)' }]);
    tool(root, [['fhs-whisper', 'whisperFeet'], ['fhs-500', 'hz500'], ['fhs-1000', 'hz1000'], ['fhs-2000', 'hz2000'], ['fhs-calibration', 'calibration']], FHS.fmcsaHearingStandard);
  },
  'osha-lead-airborne-pel-shift'(root) {
    numField(root, 'Hours worked in the day', 'olp-hours', 'e.g. 10', { min: '0' });
    numField(root, 'Measured airborne lead, TWA for the day (µg/m³, optional)', 'olp-measured', 'e.g. 45', { min: '0' });
    tool(root, [['olp-hours', 'hours'], ['olp-measured', 'measuredTwa']], OLP.oshaLeadAirbornePelShift);
  },
};
