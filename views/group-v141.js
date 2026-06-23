// spec-v141 §2: renderers for the four pediatric growth / developmental-age
// tiles shipped this wave (peds-bmi-percentile, who-growth-zscore are Clinical
// Math & Conversions, Group E; mid-parental-height and corrected-age are Group E
// too). v141 is the fourth and final feature spec of Wave 7 of the spec-v100
// program. (peds-weight-est is skipped -- already live from spec-v149; gail-bcrat
// is deferred -- see lib/peds-growth-v141.js header.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it reports a
// percentile / z-score / target / corrected age, not management; none authors a
// feeding, growth, or referral order in Sophie's voice (spec-v11 §5.3). Each
// compute surfaces a complete-the-fields fallback rather than a number from a bad
// input (lib/peds-growth-v141.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/peds-growth-v141.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The percentile, z-score, target height, or corrected age is the cited instrument’s, computed from the values you entered. The growth, feeding, and referral decisions stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
const SEX = [{ value: '', text: '— sex —' }, { value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }];

export const renderers = {
  // ----- 2.1 peds-bmi-percentile ----------------------------------------
  'peds-bmi-percentile'(root) {
    note(root, 'CDC 2000 BMI-for-age (Kuczmarski 2002), ages 2–20 y. Enter BMI directly, or enter weight and height to compute it. The percentile and z-score come from the CDC LMS transform; the band is the CDC weight-status cutoff.');
    root.appendChild(selectField('Sex', 'bm-sex', SEX));
    root.appendChild(field('Age (years)', 'bm-age', { step: '0.1', min: 2, max: 20, placeholder: 'e.g. 16' }));
    root.appendChild(field('BMI (kg/m²) — optional if weight + height given', 'bm-bmi', { step: '0.1', min: 0, placeholder: 'e.g. 30' }));
    root.appendChild(field('Weight (kg)', 'bm-wt', { step: '0.1', min: 0, placeholder: 'e.g. 85' }));
    root.appendChild(field('Height (cm)', 'bm-ht', { step: '0.1', min: 0, placeholder: 'e.g. 168' }));
    const o = out(); root.appendChild(o);
    wire(['bm-sex', 'bm-age', 'bm-bmi', 'bm-wt', 'bm-ht'], () => safe(o, () => {
      const r = M.pedsBmiPercentile({ sex: selVal('bm-sex'), ageYears: optNum('bm-age'), bmi: optNum('bm-bmi'), weightKg: optNum('bm-wt'), heightCm: optNum('bm-ht') });
      if (!r.valid) { showInvalid(o, r); return; }
      const rows = [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Percentile', value: `${r.percentile}` },
        { label: 'z-score', value: `${r.z}` },
      ];
      if (r.derived) rows.push({ label: 'BMI (computed)', value: `${r.bmi} kg/m²` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 who-growth-zscore ------------------------------------------
  'who-growth-zscore'(root) {
    note(root, 'WHO 2006 weight-for-age and length-for-age (WHO MGRS 2006), ages 0–24 months. Choose the measurement, enter the value, and the WHO LMS transform returns the z-score and percentile with the WHO low/severe bands.');
    root.appendChild(selectField('Sex', 'wz-sex', SEX));
    root.appendChild(selectField('Measurement', 'wz-measure', [
      { value: '', text: '— measurement —' },
      { value: 'weight', text: 'Weight-for-age (kg)' },
      { value: 'length', text: 'Length-for-age (cm)' },
    ]));
    root.appendChild(field('Age (months)', 'wz-age', { step: '0.5', min: 0, max: 24, placeholder: 'e.g. 6' }));
    root.appendChild(field('Measured value (kg or cm)', 'wz-val', { step: '0.1', min: 0, placeholder: 'e.g. 7.5' }));
    const o = out(); root.appendChild(o);
    wire(['wz-sex', 'wz-measure', 'wz-age', 'wz-val'], () => safe(o, () => {
      const r = M.whoGrowthZscore({ sex: selVal('wz-sex'), measure: selVal('wz-measure'), ageMonths: optNum('wz-age'), value: optNum('wz-val') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'z-score', value: `${r.z}` },
        { label: 'Percentile', value: `${r.percentile}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 mid-parental-height ----------------------------------------
  'mid-parental-height'(root) {
    note(root, 'Mid-parental target height (Tanner 1970): the predicted adult height from the parents’ heights with a 13 cm sex adjustment, plus the ± 8.5 cm target range. A genetic-potential estimate, not a guarantee.');
    root.appendChild(selectField('Child’s sex', 'mp-sex', SEX));
    root.appendChild(field('Mother’s height (cm)', 'mp-mom', { step: '0.1', min: 100, max: 230, placeholder: 'e.g. 165' }));
    root.appendChild(field('Father’s height (cm)', 'mp-dad', { step: '0.1', min: 100, max: 230, placeholder: 'e.g. 180' }));
    const o = out(); root.appendChild(o);
    wire(['mp-sex', 'mp-mom', 'mp-dad'], () => safe(o, () => {
      const r = M.midParentalHeight({ sex: selVal('mp-sex'), motherCm: optNum('mp-mom'), fatherCm: optNum('mp-dad') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Target height', value: `${r.targetHeight} cm` },
        { label: 'Target range', value: `${r.rangeLow}–${r.rangeHigh} cm` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 corrected-age ----------------------------------------------
  'corrected-age'(root) {
    note(root, 'Corrected (adjusted) gestational age (AAP / Engle 2004): corrected age = chronological age − (40 − gestational age at birth). Conventionally applied through about 24 months.');
    root.appendChild(field('Chronological age (months)', 'ca-age', { step: '0.1', min: 0, placeholder: 'e.g. 6' }));
    root.appendChild(field('Gestational age at birth (weeks)', 'ca-ga', { step: '0.1', min: 22, max: 42, placeholder: 'e.g. 28' }));
    const o = out(); root.appendChild(o);
    wire(['ca-age', 'ca-ga'], () => safe(o, () => {
      const r = M.correctedAge({ chronoMonths: optNum('ca-age'), gaWeeks: optNum('ca-ga') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Corrected age', value: `${r.correctedMonths} months` },
        { label: 'Prematurity', value: `${r.prematurityWeeks} weeks` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
