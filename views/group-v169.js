// spec-v169 §2: renderers for the two CDC growth-percentile tiles shipped this
// feature spec (cdc-stature-for-age, cdc-weight-for-age). Both sit in Clinical
// Math & Conversions (Group E) alongside their siblings peds-bmi-percentile and
// who-growth-zscore so the growth-percentile family is discoverable together.
// (pediatric-bp-percentile is deferred on sourcing grounds -- see
// lib/peds-percentile-v169.js header.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 clinical-posture note, each tile renders that it reports a
// percentile / z-score, not a diagnosis; neither authors a growth or referral
// order in Sophie's voice (spec-v11 §5.3). Each compute surfaces a
// complete-the-fields fallback rather than a number from a bad input.

import { el, clear } from '../lib/dom.js';
import { unitField, unitNumOpt, WEIGHT_UNITS } from '../lib/field-units.js';
import * as M from '../lib/peds-percentile-v169.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The percentile and z-score are the CDC growth-chart instrument’s, computed from the values you entered. A single percentile is not a diagnosis; serial growth and the clinical picture inform that, and the growth and referral decisions stay with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
const SEX = [{ value: '', text: '— sex —' }, { value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }];

export const renderers = {
  // ----- 2.2 cdc-stature-for-age ----------------------------------------
  'cdc-stature-for-age'(root) {
    note(root, 'CDC 2000 stature-for-age (Kuczmarski 2002), ages 2–20 y. Enter the child’s sex, age, and standing height; the CDC LMS transform returns the percentile and z-score with the 5th/95th reference flags.');
    root.appendChild(selectField('Sex', 'cs-sex', SEX));
    root.appendChild(field('Age (years)', 'cs-age', { step: '0.1', min: 2, max: 20, placeholder: 'e.g. 10' }));
    root.appendChild(field('Standing height (cm)', 'cs-ht', { step: '0.1', min: 0, placeholder: 'e.g. 138' }));
    const o = out(); root.appendChild(o);
    wire(['cs-sex', 'cs-age', 'cs-ht'], () => safe(o, () => {
      const r = M.cdcStatureForAge({ sex: selVal('cs-sex'), ageYears: optNum('cs-age'), heightCm: optNum('cs-ht') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Percentile', value: `${r.percentile}` },
        { label: 'z-score', value: `${r.z}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 cdc-weight-for-age -----------------------------------------
  'cdc-weight-for-age'(root) {
    note(root, 'CDC 2000 weight-for-age (Kuczmarski 2002), ages 2–20 y. Enter the child’s sex, age, and weight; the CDC LMS transform returns the percentile and z-score with the 5th/95th reference flags. Beyond about 10 y the CDC pairs weight with BMI-for-age.');
    root.appendChild(selectField('Sex', 'cw-sex', SEX));
    root.appendChild(field('Age (years)', 'cw-age', { step: '0.1', min: 2, max: 20, placeholder: 'e.g. 8' }));
    root.appendChild(unitField('Weight', 'cw-wt', WEIGHT_UNITS, { placeholder: 'e.g. 25' }));
    const o = out(); root.appendChild(o);
    wire(['cw-sex', 'cw-age', 'cw-wt', 'cw-wt-unit'], () => safe(o, () => {
      const r = M.cdcWeightForAge({ sex: selVal('cw-sex'), ageYears: optNum('cw-age'), weightKg: unitNumOpt('cw-wt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Percentile', value: `${r.percentile}` },
        { label: 'z-score', value: `${r.z}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
