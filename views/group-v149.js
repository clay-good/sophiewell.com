// spec-v149 §2: renderers for the three EMS & Field (Group I) pre-hospital
// calculators ported from roughlogic.com -- peds-weight-est (APLS age-based
// weight estimate), peds-vitals (PALS age-banded normal vitals + computed
// hypotension SBP), and dose-volume (bolus draw-up volume).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Per the spec-v50 §3 clinical-posture note, each tile renders that it frames a
// planning estimate, a reference range, or a draw-up cross-check, not an order;
// none authors a drug / dose / route decision in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import { unitField, unitNumOpt, WEIGHT_UNITS } from '../lib/field-units.js';
import * as M from '../lib/ems-v149.js';
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The estimate, reference range, or draw-up volume is computed from the values you entered. The drug, dose, route, rate, and clinical action stay with the licensed provider and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 peds-weight-est --------------------------------------------
  'peds-weight-est'(root) {
    note(root, 'Pediatric weight estimate (APLS): a resuscitation-planning weight from age when no scale is available. Enter age in months (0-12) for an infant, or in years (1-14). Months takes precedence when both are entered.');
    root.appendChild(field('Age in months (0-12, for infants)', 'pw-months', { min: 0, max: 12, placeholder: 'e.g. 6' }));
    root.appendChild(field('Age in years (1-14)', 'pw-years', { min: 0, max: 14, placeholder: 'e.g. 5' }));
    const o = out(); root.appendChild(o);
    wire(['pw-months', 'pw-years'], () => safe(o, () => {
      const r = M.pedsWeightEst({ months: optNum('pw-months'), years: optNum('pw-years') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Estimated weight', value: `${Math.round(r.kg * 10) / 10} kg` },
        { label: 'Estimated weight', value: `${Math.round(r.lb * 10) / 10} lb` },
      ]);
      if (r.flag) note(o, r.flag);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 peds-vitals ------------------------------------------------
  'peds-vitals'(root) {
    note(root, 'Pediatric vital-sign reference (AHA PALS 2020): enter the age in years to get the age-band normal heart rate, respiratory rate, and systolic-BP ranges, plus the PALS hypotension threshold (systolic BP < 70 + 2 x age for ages 1-10). Use a decimal such as 0.5 for a 6-month-old.');
    root.appendChild(field('Age in years (0-18)', 'pv-age', { step: '0.1', min: 0, max: 18, placeholder: 'e.g. 5' }));
    const o = out(); root.appendChild(o);
    wire(['pv-age'], () => safe(o, () => {
      const r = M.pedsVitals({ ageYears: optNum('pv-age') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: 'warn' },
        { label: 'Heart rate (normal)', value: `${r.hr} bpm` },
        { label: 'Respiratory rate (normal)', value: `${r.rr} /min` },
        { label: 'Systolic BP (normal)', value: `${r.sbp} mmHg` },
        { label: 'PALS hypotension', value: `SBP < ${r.hypotensionSbp} mmHg` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 dose-volume ------------------------------------------------
  'dose-volume'(root) {
    note(root, 'Draw-up volume: volume to draw (mL) = ordered dose (mg) / stock concentration (mg/mL). Enter the ordered dose directly, or leave it blank and enter weight + a per-kg dose to derive it. A draw-up cross-check, not an infusion rate.');
    root.appendChild(field('Ordered dose (mg)', 'dv-dose', { step: '0.01', min: 0, placeholder: 'e.g. 25' }));
    root.appendChild(field('Stock concentration (mg/mL)', 'dv-conc', { step: '0.01', min: 0, placeholder: 'e.g. 50' }));
    root.appendChild(unitField('Weight -- optional, to derive the dose', 'dv-weight', WEIGHT_UNITS, { placeholder: 'e.g. 20' }));
    root.appendChild(field('Per-kg dose (mg/kg) -- optional', 'dv-perkg', { step: '0.01', min: 0, placeholder: 'e.g. 1' }));
    const o = out(); root.appendChild(o);
    wire(['dv-dose', 'dv-conc', 'dv-weight', 'dv-weight-unit', 'dv-perkg'], () => safe(o, () => {
      const r = M.doseVolume({
        doseMg: optNum('dv-dose'),
        concentration: optNum('dv-conc'),
        weightKg: unitNumOpt('dv-weight'),
        doseMgPerKg: optNum('dv-perkg'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Volume to draw', value: `${Math.round(r.volumeMl * 100) / 100} mL` },
      ]);
      if (r.derivation) note(o, r.derivation);
      for (const f of r.flags) note(o, f);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
