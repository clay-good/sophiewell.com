// spec-v133 §2: renderers for the warfarin start-up tiles -- the oral-
// anticoagulant counterpart to heparin-nomogram -- in Medication & Infusion
// (Group F).
//
//   warfarin-iwpc     IWPC pharmacogenetic maintenance-dose model (Klein 2009)
//   warfarin-init-5mg Crowther 5 mg initiation nomogram (Crowther 1999)
//
// (spec-v133 also proposes warfarin-gage and warfarin-init-10mg; both were
// deferred at this pass pending a publication-fidelity source -- see the header
// of lib/warfarin-v133.js.)
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Each
// dosing tile renders the spec-v100 §2 clause-5 / spec-v11 §5.3 high-stakes
// second-check caveat in its output, and a complete-the-fields fallback rather
// than a dose from a bad input (lib/warfarin-v133.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/warfarin-v133.js';
import { resultRow } from '../lib/result-copy.js';
import { unitField, unitNumOpt, HEIGHT_UNITS, WEIGHT_UNITS } from '../lib/field-units.js';

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
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function showInvalid(o, r) { note(o, r.message || 'Enter the required values.'); }
// The spec-v100 §2 clause-5 / spec-v11 §5.3 high-stakes dosing caveat, rendered
// in the output of every warfarin tile.
function secondCheck(root) {
  root.appendChild(el('p', { class: 'muted', text: 'High-stakes dose: this tile computes a model/nomogram estimate of a starting point, not a prescription. Confirm it against your institutional protocol, the indication’s target INR, and an independent second check before prescribing, and titrate to the measured INR. The prescribe decision stays with the clinician.' }));
}
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The dose is the cited model’s, computed from the values you entered. Warfarin start-up — the indication, target INR, parenteral overlap, and the dose actually prescribed — stays with the clinician and local protocol.' }));
}

const BLANK = { value: '', text: 'Select…' };
const YN = [BLANK, { value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
const VKORC1_OPTS = [BLANK,
  { value: 'GG', text: 'G/G' }, { value: 'AG', text: 'A/G' }, { value: 'AA', text: 'A/A' },
  { value: 'unknown', text: 'Unknown / not genotyped' }];
const CYP2C9_OPTS = [BLANK,
  { value: '*1/*1', text: '*1/*1' }, { value: '*1/*2', text: '*1/*2' }, { value: '*1/*3', text: '*1/*3' },
  { value: '*2/*2', text: '*2/*2' }, { value: '*2/*3', text: '*2/*3' }, { value: '*3/*3', text: '*3/*3' },
  { value: 'unknown', text: 'Unknown / not genotyped' }];
const RACE_OPTS = [BLANK,
  { value: 'white', text: 'White / Caucasian' }, { value: 'asian', text: 'Asian' },
  { value: 'black', text: 'Black / African American' }, { value: 'mixed', text: 'Missing / mixed' }];
// Gage has no unknown-genotype imputation term, so its selects offer only the
// determinate genotypes.
const VKORC1_DET_OPTS = [BLANK,
  { value: 'GG', text: 'G/G' }, { value: 'AG', text: 'A/G' }, { value: 'AA', text: 'A/A' }];
const CYP2C9_DET_OPTS = [BLANK,
  { value: '*1/*1', text: '*1/*1' }, { value: '*1/*2', text: '*1/*2' }, { value: '*1/*3', text: '*1/*3' },
  { value: '*2/*2', text: '*2/*2' }, { value: '*2/*3', text: '*2/*3' }, { value: '*3/*3', text: '*3/*3' }];
const DAY_OPTS = [BLANK,
  { value: '1', text: 'Day 1' }, { value: '2', text: 'Day 2' }, { value: '3', text: 'Day 3' },
  { value: '4', text: 'Day 4' }, { value: '5', text: 'Day 5' }, { value: '6', text: 'Day 6' }];
const DAY7_OPTS = [BLANK,
  { value: '1', text: 'Day 1' }, { value: '2', text: 'Day 2' }, { value: '3', text: 'Day 3' },
  { value: '4', text: 'Day 4' }, { value: '5', text: 'Day 5' }, { value: '6', text: 'Day 6' }, { value: '7', text: 'Day 7' }];

export const renderers = {
  // ----- 2.1 warfarin-iwpc ----------------------------------------------
  'warfarin-iwpc'(root) {
    note(root, 'IWPC pharmacogenetic warfarin dose (Klein 2009): predicts the stable weekly maintenance dose from age, height, weight, race, enzyme-inducer and amiodarone use, and the entered VKORC1 (-1639 G>A) and CYP2C9 genotypes. It regresses the square root of the weekly dose; the tile squares the result. A starting-point estimate — titrate to the measured INR.');
    root.appendChild(field('Age (years)', 'iw-age', { step: '1', min: 0, placeholder: 'e.g. 65' }));
    root.appendChild(unitField('Height', 'iw-ht', HEIGHT_UNITS, { placeholder: 'e.g. 170' }));
    root.appendChild(unitField('Weight', 'iw-wt', WEIGHT_UNITS, { placeholder: 'e.g. 70' }));
    root.appendChild(selectField('VKORC1 (-1639 G>A) genotype', 'iw-vk', VKORC1_OPTS));
    root.appendChild(selectField('CYP2C9 genotype', 'iw-cyp', CYP2C9_OPTS));
    root.appendChild(selectField('Race / ethnicity (per the model terms)', 'iw-race', RACE_OPTS));
    root.appendChild(selectField('Enzyme inducer (carbamazepine / phenytoin / rifampin)?', 'iw-ind', YN));
    root.appendChild(selectField('Amiodarone?', 'iw-amio', YN));
    const o = out(); root.appendChild(o);
    wire(['iw-age', 'iw-ht', 'iw-ht-unit', 'iw-wt', 'iw-wt-unit', 'iw-vk', 'iw-cyp', 'iw-race', 'iw-ind', 'iw-amio'], () => safe(o, () => {
      const r = M.warfarinIwpc({ age: optNum('iw-age'), height: unitNumOpt('iw-ht'), weight: unitNumOpt('iw-wt'), vkorc1: selVal('iw-vk'), cyp2c9: selVal('iw-cyp'), race: selVal('iw-race'), inducer: selVal('iw-ind'), amiodarone: selVal('iw-amio') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Weekly dose', value: `${r.weekly} mg/week` }, { label: 'Daily', value: `${r.daily} mg/day` }]);
      secondCheck(o);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 warfarin-gage ----------------------------------------------
  'warfarin-gage'(root) {
    note(root, 'Gage pharmacogenomic warfarin dose (Gage 2008): predicts the therapeutic daily dose from body-surface area (DuBois), age, target INR, smoking, amiodarone use, race, the DVT/PE indication, and the entered CYP2C9 + VKORC1 genotypes. Exponential model — predicts mg/day directly. The original 2008 model has no CYP4F2 term. A starting-point estimate — titrate to the measured INR.');
    root.appendChild(field('Age (years)', 'ga-age', { step: '1', min: 0, placeholder: 'e.g. 60' }));
    root.appendChild(unitField('Height', 'ga-ht', HEIGHT_UNITS, { placeholder: 'e.g. 175' }));
    root.appendChild(unitField('Weight', 'ga-wt', WEIGHT_UNITS, { placeholder: 'e.g. 70' }));
    root.appendChild(field('Target INR (midpoint)', 'ga-inr', { step: '0.1', min: 0, placeholder: 'e.g. 2.5' }));
    root.appendChild(selectField('VKORC1 (-1639 G>A) genotype', 'ga-vk', VKORC1_DET_OPTS));
    root.appendChild(selectField('CYP2C9 genotype', 'ga-cyp', CYP2C9_DET_OPTS));
    root.appendChild(selectField('Amiodarone?', 'ga-amio', YN));
    root.appendChild(selectField('Current smoker?', 'ga-smoke', YN));
    root.appendChild(selectField('Black / African American?', 'ga-aa', YN));
    root.appendChild(selectField('Indication is DVT / PE?', 'ga-dvt', YN));
    const o = out(); root.appendChild(o);
    wire(['ga-age', 'ga-ht', 'ga-ht-unit', 'ga-wt', 'ga-wt-unit', 'ga-inr', 'ga-vk', 'ga-cyp', 'ga-amio', 'ga-smoke', 'ga-aa', 'ga-dvt'], () => safe(o, () => {
      const r = M.warfarinGage({ age: optNum('ga-age'), height: unitNumOpt('ga-ht'), weight: unitNumOpt('ga-wt'), targetInr: optNum('ga-inr'), vkorc1: selVal('ga-vk'), cyp2c9: selVal('ga-cyp'), amiodarone: selVal('ga-amio'), smoker: selVal('ga-smoke'), africanAmerican: selVal('ga-aa'), dvtPe: selVal('ga-dvt') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band }, { label: 'Daily dose', value: `${r.daily} mg/day` }, { label: 'Weekly', value: `${r.weekly} mg/week` }]);
      secondCheck(o);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 warfarin-init-10mg -----------------------------------------
  'warfarin-init-10mg'(root) {
    note(root, 'Kovacs 10 mg warfarin initiation nomogram (Kovacs 2003): the early-day warfarin dose when genotype is unknown. Day 1-2 are a fixed 10 mg; the day-3 INR sets the day-3 and day-4 doses; the day-5 INR sets days 5, 6 and 7, with the day-5 sub-table chosen by which day-3 band the patient was in. INR is checked on days 3 and 5 only. Cross-links the 5 mg nomogram and anticoag-reversal.');
    root.appendChild(selectField('Treatment day', 'w10-day', DAY7_OPTS));
    root.appendChild(field('Day-3 INR (days 3-7)', 'w10-inr3', { step: '0.1', min: 0, placeholder: 'e.g. 1.6' }));
    root.appendChild(field('Day-5 INR (days 5-7)', 'w10-inr5', { step: '0.1', min: 0, placeholder: 'e.g. 2.4' }));
    const o = out(); root.appendChild(o);
    wire(['w10-day', 'w10-inr3', 'w10-inr5'], () => safe(o, () => {
      const r = M.warfarinInit10mg({ day: selVal('w10-day') === '' ? null : Number(selVal('w10-day')), inr3: optNum('w10-inr3'), inr5: optNum('w10-inr5') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.dose === 0 ? 'warn' : null }, { label: 'Warfarin dose', value: `${r.dose} mg` }]);
      secondCheck(o);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 warfarin-init-5mg ------------------------------------------
  'warfarin-init-5mg'(root) {
    note(root, 'Crowther 5 mg warfarin initiation nomogram (Crowther 1999): the early-day warfarin dose when genotype is unknown. Day 1 and day 2 are a fixed 5 mg; from day 3 the dose is set by that morning’s INR. (Day 5’s low band is < 2.0, unlike the < 1.5 band on days 3-4.) Cross-links the 10 mg nomogram and anticoag-reversal.');
    root.appendChild(selectField('Treatment day', 'w5-day', DAY_OPTS));
    root.appendChild(field('This morning’s INR (days 3-6)', 'w5-inr', { step: '0.1', min: 0, placeholder: 'e.g. 1.6' }));
    const o = out(); root.appendChild(o);
    wire(['w5-day', 'w5-inr'], () => safe(o, () => {
      const r = M.warfarinInit5mg({ day: selVal('w5-day') === '' ? null : Number(selVal('w5-day')), inr: optNum('w5-inr') });
      if (!r.valid) { showInvalid(o, r); return; }
      resultRow(o, [{ text: r.band, cls: r.dose === 0 ? 'warn' : null }, { label: 'Warfarin dose', value: `${r.dose} mg` }]);
      secondCheck(o);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
