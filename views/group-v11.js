// spec-v61 §3: renderers for the 12 bedside nursing tiles (urine output,
// glucose infusion rate, EBV/MABL, corrected phenytoin, K/Mg replacement,
// RhIG dosing, pediatric transfusion volume, IV/PN osmolarity, burn
// urine-output target, shift fluid balance, carb-counting insulin bolus).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// Nullable/edge outputs route through fmt() (spec-v53 §3.2). Physiologic inputs
// surface a boundsAdvisory() note when frankly implausible (spec-v59 §2.5).
// Every dosing/replacement tile prints an explicit "estimate / verify per local
// protocol" note (spec-v61 §4).

import { el, clear } from '../lib/dom.js';
import { fmt } from '../lib/num.js';
import { boundsAdvisory } from '../lib/bounds.js';
import { resultRow } from '../lib/result-copy.js';
import * as C from '../lib/clinical-v7.js';
import { unitField, unitNum, WEIGHT_UNITS, MAGNESIUM_UNITS } from '../lib/field-units.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
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
function val(id) { return Number(document.getElementById(id).value); }
function chk(id) { return document.getElementById(id).checked; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function list(items) { return el('ul', {}, items.filter(Boolean)); }
function li(text, cls) { return el('li', cls ? { class: cls, text } : { text }); }

// spec-v61 §2 A3: chart-ready labeled copy for the genuinely multi-output
// bedside tiles, via the shared resultRow helper (lib/result-copy.js). Each item
// is { label, value, units?, cls? } (a labeled numeric result) or { text, cls? }
// (a band / interpretation line); the rendered text is byte-identical to a
// hand-built <li> list, so the numeric-correctness sweep is unaffected.
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function estimateNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Estimate / decision support, not an order. Verify against local protocol and an independent double-check before acting.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}
// Append a bounds advisory note for a physiologic input when the entered value
// is frankly implausible (spec-v59 §2.5). No-op when within the envelope.
function advise(root, key, value) {
  const msg = boundsAdvisory(key, value);
  if (msg) root.appendChild(el('p', { class: 'muted warn', text: msg }));
}

export const renderers = {
  // ----- 3.1 urine-output ------------------------------------------------
  'urine-output'(root) {
    root.appendChild(field('Total urine volume (mL)', 'uo-vol', { placeholder: 'e.g. 120' }));
    root.appendChild(field('Collection interval (hr)', 'uo-int', { placeholder: 'e.g. 4' }));
    root.appendChild(unitField('Weight', 'uo-wt', WEIGHT_UNITS, { placeholder: 'e.g. 60' }));
    const o = out(); root.appendChild(o);
    wire(['uo-vol', 'uo-int', 'uo-wt', 'uo-wt-unit'], () => safe(o, () => {
      const r = C.urineOutput({ volumeMl: val('uo-vol'), intervalHr: val('uo-int'), weightKg: unitNum('uo-wt') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: fmt(null, { fallback: 'Enter volume, interval, and weight.' }) })); return; }
      o.appendChild(list([
        li(`Urine output: ${fmt(r.rate, { digits: 2, unit: 'mL/kg/hr' })}`, r.oliguria ? 'warn' : null),
        li(r.band, r.oliguria ? 'warn' : null),
      ]));
      advise(o, 'weightKg', unitNum('uo-wt'));
      note(o, r.note);
    }));
  },

  // ----- 3.2 gir ---------------------------------------------------------
  gir(root) {
    root.appendChild(field('Dextrose concentration (%)', 'gir-dex', { placeholder: 'e.g. 10' }));
    root.appendChild(field('Infusion rate (mL/hr)', 'gir-rate', { placeholder: 'e.g. 15' }));
    root.appendChild(unitField('Weight', 'gir-wt', WEIGHT_UNITS, { placeholder: 'e.g. 3' }));
    const o = out(); root.appendChild(o);
    wire(['gir-dex', 'gir-rate', 'gir-wt', 'gir-wt-unit'], () => safe(o, () => {
      const r = C.gir({ dextrosePct: val('gir-dex'), rateMlHr: val('gir-rate'), weightKg: unitNum('gir-wt') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Enter dextrose %, rate, and weight.' })); return; }
      o.appendChild(list([
        li(`GIR: ${fmt(r.gir, { digits: 2, unit: 'mg/kg/min' })}`),
        li(r.band),
      ]));
      advise(o, 'weightKg', unitNum('gir-wt'));
      note(o, r.note);
    }));
  },

  // ----- 3.3 ebv-mabl ----------------------------------------------------
  'ebv-mabl'(root) {
    root.appendChild(unitField('Weight', 'em-wt', WEIGHT_UNITS, { placeholder: 'e.g. 70' }));
    root.appendChild(selectField('Patient type (EBV factor, mL/kg)', 'em-factor', [
      { value: '100', text: 'Premature neonate (100)' },
      { value: '90', text: 'Term neonate (90)' },
      { value: '80', text: 'Infant (80)' },
      { value: '75', text: 'Child / adult male (75)' },
      { value: '65', text: 'Adult female (65)' },
    ]));
    root.appendChild(field('Starting hematocrit (%)', 'em-start', { placeholder: 'e.g. 45' }));
    root.appendChild(field('Minimum acceptable hematocrit (%)', 'em-min', { placeholder: 'e.g. 30' }));
    const o = out(); root.appendChild(o);
    wire(['em-wt', 'em-wt-unit', 'em-factor', 'em-start', 'em-min'], () => safe(o, () => {
      const r = C.ebvMabl({ weightKg: unitNum('em-wt'), ebvFactor: val('em-factor'), startHct: val('em-start'), minHct: val('em-min') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Enter weight and a starting hematocrit.' })); return; }
      resultRow(o, [
        { label: 'Estimated blood volume', value: fmt(r.ebv), units: 'mL' },
        { label: 'Maximum allowable blood loss', value: fmt(r.mabl), units: 'mL', cls: 'warn' },
      ]);
      advise(o, 'weightKg', unitNum('em-wt'));
      note(o, r.note);
    }));
    estimateNote(root);
  },

  // ----- 3.4 corrected-phenytoin -----------------------------------------
  'corrected-phenytoin'(root) {
    root.appendChild(field('Measured total phenytoin (µg/mL)', 'cp-meas', { placeholder: 'e.g. 8' }));
    root.appendChild(field('Serum albumin (g/dL)', 'cp-alb', { placeholder: 'e.g. 2.0' }));
    root.appendChild(checkField('CrCl <10 mL/min / ESRD (use 0.1 factor)', 'cp-esrd'));
    const o = out(); root.appendChild(o);
    wire(['cp-meas', 'cp-alb', 'cp-esrd'], () => safe(o, () => {
      const r = C.correctedPhenytoin({ measured: val('cp-meas'), albumin: val('cp-alb'), esrd: chk('cp-esrd') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Enter a measured level and albumin.' })); return; }
      o.appendChild(list([
        li(`Corrected phenytoin: ${fmt(r.corrected, { digits: 1, unit: 'µg/mL' })}`),
        li(r.band),
      ]));
      advise(o, 'albumin', val('cp-alb'));
      note(o, r.note);
    }));
    estimateNote(root);
  },

  // ----- 3.5 potassium-deficit -------------------------------------------
  'potassium-deficit'(root) {
    root.appendChild(field('Serum potassium (mEq/L)', 'kd-k', { placeholder: 'e.g. 3.0' }));
    root.appendChild(unitField('Weight', 'kd-wt', WEIGHT_UNITS, { placeholder: 'e.g. 70' }));
    root.appendChild(field('Target potassium (mEq/L)', 'kd-target', { placeholder: 'e.g. 4.0' }));
    const o = out(); root.appendChild(o);
    wire(['kd-k', 'kd-wt', 'kd-wt-unit', 'kd-target'], () => safe(o, () => {
      const r = C.potassiumDeficit({ serumK: val('kd-k'), weightKg: unitNum('kd-wt'), targetK: val('kd-target') });
      o.appendChild(list([
        li(`Estimated total-body K deficit: ${fmt(r.deficit, { unit: 'mEq' })}`),
        li(r.band),
      ]));
      advise(o, 'potassium', val('kd-k'));
      advise(o, 'weightKg', unitNum('kd-wt'));
      note(o, r.note);
    }));
    estimateNote(root);
  },

  // ----- 3.6 magnesium-replacement ---------------------------------------
  'magnesium-replacement'(root) {
    root.appendChild(unitField('Serum magnesium', 'mg-serum', MAGNESIUM_UNITS, { placeholder: 'e.g. 1.2' }));
    root.appendChild(selectField('Severity', 'mg-sev', [
      { value: '1', text: 'Mild (~1.4-1.8 mg/dL)' },
      { value: '2', text: 'Moderate (~1.0-1.4 mg/dL)' },
      { value: '3', text: 'Severe (<1.0 mg/dL)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['mg-serum', 'mg-serum-unit', 'mg-sev'], () => safe(o, () => {
      const serumMg = unitNum('mg-serum');
      const r = C.magnesiumReplacement({ serumMg, severity: val('mg-sev') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Choose a severity band.' })); return; }
      o.appendChild(list([
        li(`Magnesium sulfate: ${fmt(r.doseLow)}-${fmt(r.doseHigh, { unit: 'g IV' })}`),
        li(r.band),
      ]));
      advise(o, 'magnesium', serumMg);
      note(o, r.note);
    }));
    estimateNote(root);
  },

  // ----- 3.7 rhig-dose ---------------------------------------------------
  'rhig-dose'(root) {
    root.appendChild(field('Maternal blood volume (mL)', 'rh-bv', { placeholder: 'e.g. 5000' }));
    root.appendChild(field('Fetal cells on Kleihauer-Betke (%)', 'rh-kb', { placeholder: 'e.g. 1.5' }));
    const o = out(); root.appendChild(o);
    wire(['rh-bv', 'rh-kb'], () => safe(o, () => {
      const r = C.rhigDose({ maternalBloodVolumeMl: val('rh-bv'), fetalCellPct: val('rh-kb') });
      resultRow(o, [
        { label: 'Estimated fetomaternal hemorrhage', value: fmt(r.fmhMl, { digits: 1 }), units: 'mL' },
        { label: 'RhIG dose', value: fmt(r.vials), units: 'standard 300 µg vial(s)', cls: 'warn' },
        { text: r.band },
      ]);
      note(o, r.note);
    }));
    estimateNote(root);
  },

  // ----- 3.8 peds-transfusion-volume -------------------------------------
  'peds-transfusion-volume'(root) {
    root.appendChild(unitField('Weight', 'pt-wt', WEIGHT_UNITS, { placeholder: 'e.g. 3' }));
    root.appendChild(field('Desired hemoglobin rise (g/dL)', 'pt-rise', { placeholder: 'e.g. 2' }));
    root.appendChild(selectField('Product hematocrit (%)', 'pt-hct', [
      { value: '60', text: 'Standard PRBC (~60%)' },
      { value: '55', text: 'Lower (~55%)' },
      { value: '70', text: 'Concentrated (~70%)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['pt-wt', 'pt-wt-unit', 'pt-rise', 'pt-hct'], () => safe(o, () => {
      const r = C.pedsTransfusionVolume({ weightKg: unitNum('pt-wt'), hbRise: val('pt-rise'), productHctPct: val('pt-hct') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Enter weight and a desired Hb rise.' })); return; }
      resultRow(o, [
        { label: 'PRBC transfusion volume', value: fmt(r.volumeMl), units: 'mL' },
        { label: 'Weight-based', value: fmt(r.mlPerKg, { digits: 1 }), units: 'mL/kg' },
        { text: r.band },
      ]);
      advise(o, 'weightKg', unitNum('pt-wt'));
      note(o, r.note);
    }));
    estimateNote(root);
  },

  // ----- 3.9 iv-osmolarity -----------------------------------------------
  'iv-osmolarity'(root) {
    root.appendChild(field('Dextrose (%)', 'io-dex', { placeholder: 'e.g. 5' }));
    root.appendChild(field('Amino acids (%)', 'io-aa', { placeholder: 'e.g. 2.5' }));
    root.appendChild(field('Sodium additives (mEq/L)', 'io-na', { placeholder: 'e.g. 30' }));
    root.appendChild(field('Potassium additives (mEq/L)', 'io-k', { placeholder: 'e.g. 20' }));
    const o = out(); root.appendChild(o);
    wire(['io-dex', 'io-aa', 'io-na', 'io-k'], () => safe(o, () => {
      const r = C.ivOsmolarity({ dextrosePct: val('io-dex'), aminoAcidPct: val('io-aa'), naMeqL: val('io-na'), kMeqL: val('io-k') });
      o.appendChild(list([
        li(`Estimated osmolarity: ${fmt(r.osmolarity, { unit: 'mOsm/L' })}`, r.central ? 'warn' : null),
        li(r.band, r.central ? 'warn' : null),
      ]));
      note(o, r.note);
    }));
  },

  // ----- 3.10 burn-uop-target --------------------------------------------
  'burn-uop-target'(root) {
    root.appendChild(unitField('Weight', 'bu-wt', WEIGHT_UNITS, { placeholder: 'e.g. 70' }));
    root.appendChild(checkField('Pediatric (<30 kg)', 'bu-peds'));
    root.appendChild(checkField('Electrical injury / pigmenturia', 'bu-elec'));
    const o = out(); root.appendChild(o);
    wire(['bu-wt', 'bu-wt-unit', 'bu-peds', 'bu-elec'], () => safe(o, () => {
      const r = C.burnUopTarget({ weightKg: unitNum('bu-wt'), pediatric: chk('bu-peds'), electrical: chk('bu-elec') });
      const target = r.targetLowMlHr === r.targetHighMlHr
        ? fmt(r.targetLowMlHr, { digits: 1, unit: 'mL/hr' })
        : `${fmt(r.targetLowMlHr, { digits: 1 })}-${fmt(r.targetHighMlHr, { digits: 1, unit: 'mL/hr' })}`;
      o.appendChild(list([
        li(`Hourly urine-output target: ${target}`),
        li(r.band),
      ]));
      advise(o, 'weightKg', unitNum('bu-wt'));
      note(o, r.note);
    }));
  },

  // ----- 3.11 fluid-balance ----------------------------------------------
  'fluid-balance'(root) {
    root.appendChild(field('Total intake (mL)', 'fb-in', { placeholder: 'e.g. 3000' }));
    root.appendChild(field('Total output (mL)', 'fb-out', { placeholder: 'e.g. 2200' }));
    root.appendChild(unitField('Weight (optional)', 'fb-wt', WEIGHT_UNITS, { placeholder: 'e.g. 80' }));
    const o = out(); root.appendChild(o);
    wire(['fb-in', 'fb-out', 'fb-wt', 'fb-wt-unit'], () => safe(o, () => {
      const r = C.fluidBalance({ intakeMl: val('fb-in'), outputMl: val('fb-out'), weightKg: unitNum('fb-wt') });
      const items = [{ label: 'Net fluid balance', value: fmt(r.netMl), units: 'mL', cls: (r.pctBodyWeight !== null && r.pctBodyWeight >= 10) ? 'warn' : null }];
      if (r.pctBodyWeight !== null) items.push({ label: 'As percent of body weight', value: fmt(r.pctBodyWeight, { digits: 1 }), units: '%', cls: r.pctBodyWeight >= 10 ? 'warn' : null });
      items.push({ text: r.band });
      resultRow(o, items);
      advise(o, 'weightKg', unitNum('fb-wt'));
      note(o, r.note);
    }));
  },

  // ----- 3.12 carb-insulin-bolus -----------------------------------------
  'carb-insulin-bolus'(root) {
    root.appendChild(field('Carbohydrates (g)', 'ci-carbs', { placeholder: 'e.g. 60' }));
    root.appendChild(field('Insulin-to-carb ratio (1 unit : N g)', 'ci-ic', { placeholder: 'e.g. 10' }));
    root.appendChild(field('Correction factor / ISF (mg/dL per unit)', 'ci-isf', { placeholder: 'e.g. 50' }));
    root.appendChild(field('Current glucose (mg/dL)', 'ci-cur', { placeholder: 'e.g. 180' }));
    root.appendChild(field('Target glucose (mg/dL)', 'ci-tgt', { placeholder: 'e.g. 120' }));
    const o = out(); root.appendChild(o);
    wire(['ci-carbs', 'ci-ic', 'ci-isf', 'ci-cur', 'ci-tgt'], () => safe(o, () => {
      const r = C.carbInsulinBolus({ carbsG: val('ci-carbs'), icRatio: val('ci-ic'), isf: val('ci-isf'), currentGlucose: val('ci-cur'), targetGlucose: val('ci-tgt') });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Enter carbs, an IC ratio, and an ISF.' })); return; }
      resultRow(o, [
        { label: 'Meal bolus', value: fmt(r.mealBolus, { digits: 1 }), units: 'units' },
        { label: 'Correction bolus', value: fmt(r.correctionBolus, { digits: 1 }), units: 'units', cls: r.floored ? 'warn' : null },
        { label: 'Total', value: fmt(r.totalBolus, { digits: 1 }), units: 'units' },
        { text: r.band },
      ]);
      advise(o, 'glucose', val('ci-cur'));
      note(o, r.note);
    }));
    estimateNote(root);
  },
};
