// spec-v110 §2: renderers for the five toxicology dosing / dialysis-decision
// tiles (digifab-dosing, nac-dosing, hiet-dosing, tca-bicarbonate,
// lithium-extrip). The fifth Wave-2 renderer module of the spec-v100 program.
// The first four are Group F (Medication & Infusion) dosing tools; lithium-extrip
// is a Group G decision tree.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v100 §2 clause-5 requirement, each of the four dosing tiles renders the
// high-stakes second-check caveat in its output; the tiles compute the
// vials/bag-doses/infusion/bolus, the give-it decision (indication, timing,
// route) stays with the clinician, poison center, and local protocol (spec-v11
// §5.3). lithium-extrip walks the EXTRIP limbs and names the firing limb -- it
// reports the ECTR recommendation, not a dialysis prescription.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tox-v110.js';
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
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
// The spec-v100 §2 clause-5 high-stakes second-check caveat, rendered in the
// output of each dosing tile.
function secondCheck(root) {
  root.appendChild(el('p', { class: 'muted', text: 'High-stakes dose: this tile computes the figure, but confirm it against your institutional protocol and an independent second check before administration. The indication, timing, and route stay with the clinician, poison center, and local protocol.' }));
}
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The recommendation is the cited rule’s, computed from the inputs you entered. The dialysis modality, duration, and prescription stay with the nephrology and toxicology team and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 digifab-dosing ---------------------------------------------
  'digifab-dosing'(root) {
    note(root, 'Digoxin immune Fab (DigiFab) vial count by amount ingested, steady-state serum level, or empiric dosing. Vials are rounded up to the next whole vial.');
    root.appendChild(selectField('Dosing mode', 'dg-mode', [
      { value: 'level', text: 'Steady-state serum digoxin level + weight' },
      { value: 'amount', text: 'Known amount ingested (mg)' },
      { value: 'empiric', text: 'Empiric (acute vs chronic)' },
    ]));
    root.appendChild(field('Serum digoxin level (ng/mL)', 'dg-level', { step: '0.1', min: 0, placeholder: '4.5' }));
    root.appendChild(field('Body weight (kg)', 'dg-weight', { step: '0.1', min: 0, placeholder: '70' }));
    root.appendChild(field('Amount ingested (mg)', 'dg-amount', { step: '0.1', min: 0, placeholder: '5' }));
    root.appendChild(selectField('Empiric scenario', 'dg-timing', [
      { value: 'acute', text: 'Acute ingestion (10-20 vials)' },
      { value: 'chronic', text: 'Chronic toxicity (3-6 vials)' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['dg-mode', 'dg-level', 'dg-weight', 'dg-amount', 'dg-timing'], () => safe(o, () => {
      const r = M.digifabDosing({
        mode: selVal('dg-mode'), level: optNum('dg-level'), weight: optNum('dg-weight'),
        amount: optNum('dg-amount'), timing: selVal('dg-timing'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: null },
        { label: 'Vials', value: r.vials != null ? String(r.vials) : `${r.vialsLow}-${r.vialsHigh}` },
      ]);
      secondCheck(o);
      note(o, r.note);
    }));
  },

  // ----- 2.2 nac-dosing -------------------------------------------------
  'nac-dosing'(root) {
    note(root, 'Weight-based IV N-acetylcysteine regimen for acetaminophen poisoning. The dosing weight is capped at 110 kg.');
    root.appendChild(field('Body weight (kg)', 'nc-weight', { step: '0.1', min: 0, placeholder: '70' }));
    root.appendChild(selectField('Regimen', 'nc-reg', [
      { value: 'three-bag', text: 'Three-bag (21-hour) -- 150, 50, 100 mg/kg' },
      { value: 'two-bag', text: 'Two-bag (SNAP) -- 200, 100 mg/kg' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['nc-weight', 'nc-reg'], () => safe(o, () => {
      const r = M.nacDosing({ weight: optNum('nc-weight'), regimen: selVal('nc-reg') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.capped ? 'warn' : null },
        { label: 'Total NAC', value: `${r.totalMg} mg` },
        { label: 'Weight cap', value: r.capped ? 'applied (110 kg)' : 'not applied' },
      ]);
      secondCheck(o);
      note(o, r.note);
    }));
  },

  // ----- 2.3 hiet-dosing ------------------------------------------------
  'hiet-dosing'(root) {
    note(root, 'High-dose insulin euglycemia therapy for beta-blocker / calcium-channel-blocker poisoning. Pair with a dextrose infusion.');
    root.appendChild(field('Body weight (kg)', 'hi-weight', { step: '0.1', min: 0, placeholder: '80' }));
    root.appendChild(field('Bolus (units/kg, default 1)', 'hi-bolus', { step: '0.1', min: 0, max: 1, placeholder: '1' }));
    root.appendChild(field('Infusion rate (units/kg/hr, default 1, max 10)', 'hi-rate', { step: '0.1', min: 0, max: 10, placeholder: '1' }));
    const o = out(); root.appendChild(o);
    wire(['hi-weight', 'hi-bolus', 'hi-rate'], () => safe(o, () => {
      const r = M.hietDosing({ weight: optNum('hi-weight'), bolus: optNum('hi-bolus'), rate: optNum('hi-rate') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.rateClamped ? 'warn' : null },
        { label: 'Bolus', value: `${r.bolus} units` },
        { label: 'Start infusion', value: `${r.startRate} units/hr` },
      ]);
      secondCheck(o);
      note(o, r.note);
    }));
  },

  // ----- 2.4 tca-bicarbonate --------------------------------------------
  'tca-bicarbonate'(root) {
    note(root, 'TCA-toxicity QRS risk band and the sodium-bicarbonate bolus target. QRS >= 100 ms predicts seizures, >= 160 ms predicts ventricular arrhythmias.');
    root.appendChild(field('Maximal QRS duration (ms)', 'tc-qrs', { min: 0, max: 400, placeholder: '120' }));
    root.appendChild(field('Body weight (kg)', 'tc-weight', { step: '0.1', min: 0, placeholder: '70' }));
    const o = out(); root.appendChild(o);
    wire(['tc-qrs', 'tc-weight'], () => safe(o, () => {
      const r = M.tcaBicarbonate({ qrs: optNum('tc-qrs'), weight: optNum('tc-weight') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Risk band', value: r.risk },
        { label: 'NaHCO3 bolus', value: `${r.bicarbLow}-${r.bicarbHigh} mEq` },
      ]);
      secondCheck(o);
      note(o, r.note);
    }));
  },

  // ----- 2.5 lithium-extrip ---------------------------------------------
  'lithium-extrip'(root) {
    note(root, 'EXTRIP 2015 extracorporeal-treatment decision for lithium poisoning. The recommendation is the strongest firing limb.');
    root.appendChild(field('Serum lithium level (mmol/L)', 'le-level', { step: '0.1', min: 0, placeholder: '4.5' }));
    root.appendChild(checkField('Impaired kidney function', 'le-renal'));
    root.appendChild(checkField('Decreased level of consciousness', 'le-conc'));
    root.appendChild(checkField('Seizures', 'le-seiz'));
    root.appendChild(checkField('Life-threatening dysrhythmias', 'le-dys'));
    root.appendChild(checkField('Significant confusion', 'le-conf'));
    root.appendChild(checkField('Expected time to level < 1.0 mmol/L exceeds 36 h', 'le-slow'));
    const o = out(); root.appendChild(o);
    wire(['le-level', 'le-renal', 'le-conc', 'le-seiz', 'le-dys', 'le-conf', 'le-slow'], () => safe(o, () => {
      const r = M.lithiumExtrip({
        level: optNum('le-level'), renalImpaired: chk('le-renal'), decreasedConsciousness: chk('le-conc'),
        seizures: chk('le-seiz'), dysrhythmias: chk('le-dys'), confusion: chk('le-conf'), slowClearance: chk('le-slow'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'ECTR', value: r.recommendation },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
