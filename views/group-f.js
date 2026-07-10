// Group F: Medication and Infusion (41-47).

import { el, clear } from '../lib/dom.js';
import { loadFile } from '../lib/data.js';
import * as C from '../lib/clinical.js';
import * as C8 from '../lib/clinical-v8.js';
import { fmt } from '../lib/num.js';
import {
  mmeTotal, steroidEquivalent, benzoEquivalent,
  abxRenalDose, vasopressorRateMlHr, vasopressorDose,
  tpnMacro,
  beersCheck, BEERS_PIM, BEERS_DISEASE,
} from '../lib/medication-v4.js';
import {
  insulinCorrection, electrolyteReplacement, crrtDose, ecmoTitration,
} from '../lib/scoring-v4.js';
import { unitField, unitNum, WEIGHT_UNITS, CALCIUM_MMOL_UNITS } from '../lib/field-units.js';
import { resultRow } from '../lib/result-copy.js';
import { META } from '../lib/meta.js';
import { renderDerivation, updateDerivationSteps } from '../lib/derivation.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: opts.type || 'number', autocomplete: 'off' });
  if (inp.type === 'number') inp.setAttribute('step', 'any');
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
function nv(id) { return Number(document.getElementById(id).value); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }

export const renderers = {
  'drip-rate'(root) {
    root.appendChild(field('Volume (mL)', 'v'));
    root.appendChild(field('Duration (minutes)', 't'));
    root.appendChild(field('Drop factor (gtts/mL, e.g. 15)', 'df'));
    const o = out(); root.appendChild(o);
    const deriv = renderDerivation(META['drip-rate']);
    if (deriv) root.appendChild(deriv);
    const run = () => safe(o, () => {
      const inputs = { volumeMl: nv('v'), durationMin: nv('t'), dropFactor: nv('df') };
      const r = C.dripRate(inputs);
      resultRow(o, [
        { label: 'Rate', value: r.mlPerHr, units: 'mL/hr' },
        { label: 'Drops', value: r.gttsPerMin, units: 'gtts/min' },
      ]);
      if (deriv) updateDerivationSteps(deriv, META['drip-rate'], inputs);
    });
    ['v', 't', 'df'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'weight-dose'(root) {
    root.appendChild(unitField('Weight', 'w', WEIGHT_UNITS));
    root.appendChild(field('Dose per kg', 'd'));
    root.appendChild(field('Dose unit (e.g. mg/kg, mcg/kg)', 'u', { type: 'text', placeholder: 'mg/kg' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const weightKg = unitNum('w');
      const total = C.weightDose({ weightKg, dosePerKg: nv('d') });
      const unit = document.getElementById('u').value.trim().replace(/\/kg$/, '') || 'units';
      o.appendChild(el('p', { text: `Total dose: ${total} ${unit}` }));
      // Sanity bounds (general adult heuristic): warn when computed exceeds 5x typical adult dose.
      if (weightKg > 0 && total / weightKg > 100) {
        o.appendChild(el('p', { class: 'notice', text: 'Computed per-kg value is unusually large. Double-check the unit and the dose against your formulary.' }));
      }
    });
    ['w', 'w-unit', 'd', 'u'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'conc-rate'(root) {
    root.appendChild(field('Dose value', 'dv'));
    root.appendChild(selectField('Dose unit', 'du', [
      { value: 'mcg/kg/min', text: 'mcg/kg/min' }, { value: 'mcg/min', text: 'mcg/min' },
      { value: 'mg/min', text: 'mg/min' }, { value: 'units/hr', text: 'units/hr' },
      { value: 'units/min', text: 'units/min' },
    ]));
    root.appendChild(unitField('Patient weight (if dose per kg)', 'w', WEIGHT_UNITS));
    root.appendChild(field('Concentration value', 'cv'));
    root.appendChild(selectField('Concentration unit', 'cu', [
      { value: 'mg/mL', text: 'mg/mL' }, { value: 'units/mL', text: 'units/mL' },
    ]));
    const presets = el('p', { class: 'muted', text:
      'Common presets (per institution policy): norepinephrine 16 mg / 250 mL = 64 mcg/mL; epinephrine 4 mg / 250 mL = 16 mcg/mL; ' +
      'dopamine 400 mg / 250 mL = 1600 mcg/mL; dobutamine 250 mg / 250 mL = 1000 mcg/mL; propofol 10 mg/mL; ' +
      'fentanyl 50 mcg/mL; heparin 25,000 units / 500 mL = 50 units/mL.' });
    root.appendChild(presets);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C.concentrationToRate({
        doseValue: nv('dv'), doseUnit: document.getElementById('du').value,
        weightKg: unitNum('w'), concentrationValue: nv('cv'),
        concentrationUnit: document.getElementById('cu').value,
      });
      o.appendChild(el('p', { text: `Infusion rate: ${r.mlPerHr} mL/hr` }));
      o.appendChild(el('p', { class: 'muted', text: 'Verify against your institution\'s protocol and pump configuration.' }));
    });
    ['dv', 'du', 'w', 'w-unit', 'cv', 'cu'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // spec-v62 §4.2: converted from a static reference table to a weight-driven
  // quick-dose calculator (passes the spec-v29 §3 one-line test).
  'peds-dose'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Planning estimate, not an order. Verify every dose against your institution\'s formulary and an independent double-check.' }));
    root.appendChild(field('Child weight (kg)', 'pd-w', { placeholder: '20' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C8.pedsDosePanel({ weightKg: nv('pd-w') });
      const items = r.rows.map((d) => ({
        text: `${d.drug}: ${d.lowMg === d.highMg ? fmt(d.lowMg) : `${fmt(d.lowMg)}-${fmt(d.highMg)}`} mg ${d.freq}${d.capped ? ' (capped at per-dose max)' : ''} — ${d.note}`,
      }));
      resultRow(o, items);
      o.appendChild(el('p', { class: 'muted', text: 'Citations: AAP, NLM/DailyMed, manufacturer labels. Computed at the entered weight; per-dose caps applied.' }));
    });
    document.getElementById('pd-w').addEventListener('input', run);
  },

  'insulin-drip'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'This is a math verifier only. Use your institution\'s insulin protocol.' }));
    root.appendChild(selectField('Example protocol', 'p', [
      { value: 'low', text: 'Example "low intensity" protocol' },
      { value: 'mod', text: 'Example "moderate intensity" protocol' },
    ]));
    root.appendChild(field('Current blood glucose (mg/dL)', 'bg'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const proto = document.getElementById('p').value;
      const bg = nv('bg');
      let rate;
      if (proto === 'low') rate = bg <= 100 ? 0 : (bg <= 150 ? 0.5 : (bg <= 200 ? 1 : (bg <= 250 ? 2 : 3)));
      else rate = bg <= 100 ? 0 : (bg <= 150 ? 1 : (bg <= 200 ? 2 : (bg <= 250 ? 3 : 4)));
      o.appendChild(el('p', { text: `Suggested rate (example only): ${rate} units/hr` }));
      o.appendChild(el('p', { class: 'muted', text: 'Example data only. Always follow the active institution protocol and verify with the bedside RN/MD.' }));
    });
    ['p', 'bg'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // spec-v62 §4.1: converted from a static reference table to a weight/INR-
  // driven reversal-dose calculator (passes the spec-v29 §3 one-line test).
  'anticoag-reversal'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Planning estimate, not an order. Confirm against your institution\'s protocol and current literature; reversal decisions belong to the treating team and pharmacy.' }));
    root.appendChild(selectField('Anticoagulant', 'ar-agent', [
      { value: 'warfarin', text: 'Warfarin (4F-PCC + Vit K)' },
      { value: 'dabigatran', text: 'Dabigatran (idarucizumab)' },
      { value: 'apixaban-rivaroxaban', text: 'Apixaban / Rivaroxaban (andexanet)' },
      { value: 'heparin-ufh', text: 'Heparin, UFH (protamine)' },
    ]));
    root.appendChild(unitField('Weight', 'ar-w', WEIGHT_UNITS, { placeholder: '80' }));
    root.appendChild(field('INR (warfarin only)', 'ar-inr', { placeholder: '5' }));
    root.appendChild(field('Heparin units in last 2-3 h (UFH only)', 'ar-heparin', { placeholder: '4000' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const agent = document.getElementById('ar-agent').value;
      clear(o);
      if (agent === 'heparin-ufh') {
        if (!(nv('ar-heparin') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the heparin units given in the last 2-3 h.' })); return; }
        const r = C8.protamineDose({ heparinUnits: nv('ar-heparin') });
        resultRow(o, [
          { label: 'Protamine', value: fmt(r.protamineMg), units: `mg${r.capped ? ' (capped at 50 mg single dose)' : ''}` },
          { text: '1 mg protamine per 100 units of heparin given in the last 2-3 h; LMWH reversal is partial only.' },
        ]);
        return;
      }
      if (!(unitNum('ar-w') > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter weight (and INR for warfarin).' })); return; }
      const r = C8.anticoagReversalDose({ weightKg: unitNum('ar-w'), inr: nv('ar-inr') || 0, agent });
      if (!r) { o.appendChild(el('p', { class: 'muted', text: 'Select an agent and enter weight (and INR for warfarin).' })); return; }
      const items = [{ label: 'Agent', value: r.product, text: `Agent: ${r.product}` }];
      if (r.units != null) items.push({ label: '4F-PCC dose', value: fmt(r.units), units: `units (${r.unitsPerKg} units/kg${r.capped ? ', dosing weight capped at 100 kg' : ''})` });
      if (r.doseG != null) items.push({ label: 'Dose', value: fmt(r.doseG), units: 'g' });
      if (r.adjunct) items.push({ text: `Adjunct: ${r.adjunct}` });
      if (r.altPcc4Units != null) items.push({ text: `Alt if andexanet unavailable: 4F-PCC ${fmt(r.altPcc4Units)} units (50 units/kg)` });
      if (r.note) items.push({ text: r.note });
      resultRow(o, items);
    });
    ['ar-agent', 'ar-w', 'ar-w-unit', 'ar-inr', 'ar-heparin'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
    run();
  },

  // --- spec-v62 §3 Part B (wave 1): ICU-infusion + med-surg tiles ----------

  'infusion-time-remaining'(root) {
    root.appendChild(field('Volume remaining (mL)', 'itr-vol', { placeholder: '250' }));
    root.appendChild(field('Current rate (mL/hr)', 'itr-rate', { placeholder: '100' }));
    root.appendChild(field('Or: make this volume last (hours)', 'itr-hrs', { placeholder: '8' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      clear(o);
      const vol = nv('itr-vol');
      const rate = nv('itr-rate');
      const hrs = nv('itr-hrs');
      const items = [];
      if (vol > 0 && rate > 0) {
        const r = C8.infusionTimeRemaining({ volumeMl: vol, rateMlHr: rate });
        const h = Math.floor(r.minutesToEmpty / 60);
        const m = r.minutesToEmpty % 60;
        items.push({ text: `Time to empty: ${h}h ${String(m).padStart(2, '0')}m (${fmt(r.hoursToEmpty)} h)` });
      }
      if (vol > 0 && hrs > 0) {
        const r = C8.infusionRateToLast({ volumeMl: vol, hours: hrs });
        items.push({ text: `Rate to last ${fmt(hrs)} h: ${fmt(r.rateMlHr)} mL/hr` });
      }
      if (!items.length) { o.appendChild(el('p', { class: 'muted', text: 'Enter a volume with either a rate or a target duration.' })); return; }
      resultRow(o, items);
    });
    ['itr-vol', 'itr-rate', 'itr-hrs'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // --- spec-v65 §2.1 o2-cylinder-duration ----------------------------------
  'o2-cylinder-duration'(root) {
    root.appendChild(selectField('Cylinder size', 'o2-size', [
      { value: 'E', text: 'E (0.28 L/psi) - transport / wheelchair' },
      { value: 'D', text: 'D (0.16 L/psi) - small portable' },
      { value: 'M', text: 'M (1.56 L/psi)' },
      { value: 'G', text: 'G (2.41 L/psi)' },
      { value: 'H', text: 'H / K (3.14 L/psi) - large stationary' },
    ]));
    root.appendChild(field('Current gauge pressure (psi)', 'o2-psi', { placeholder: '2000' }));
    root.appendChild(field('Flow rate (L/min)', 'o2-flow', { placeholder: '2' }));
    root.appendChild(field('Safe residual pressure (psi)', 'o2-res', { placeholder: '200' }));
    root.appendChild(field('Or: target transport time (minutes) for max-flow', 'o2-target', { placeholder: '45' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      clear(o);
      const factor = C8.O2_CYLINDER_FACTORS[document.getElementById('o2-size').value] || C8.O2_CYLINDER_FACTORS.E;
      const psi = nv('o2-psi');
      const flow = nv('o2-flow');
      const resRaw = document.getElementById('o2-res').value.trim();
      const residual = resRaw === '' ? 200 : Number(resRaw);
      const target = nv('o2-target');
      if (!(psi > 0)) { o.appendChild(el('p', { class: 'muted', text: 'Enter the gauge pressure with a flow rate (or a target transport time).' })); return; }
      const r = C8.o2CylinderDuration({ factorLPsi: factor, gaugePsi: psi, flowLpm: flow > 0 ? flow : 0, residualPsi: residual, targetMinutes: target > 0 ? target : 0 });
      const items = [{ label: 'Usable oxygen volume', value: fmt(r.usableVolumeL), units: `L (above the ${fmt(residual)} psi residual)` }];
      if (r.atOrBelowResidual) {
        items.push({ text: 'Gauge is at or below the safe residual - swap the cylinder now.', cls: 'flag' });
      } else if (r.minutesRemaining != null) {
        const h = Math.floor(r.minutesRemaining / 60);
        const m = r.minutesRemaining % 60;
        items.push({ label: 'Time to residual', value: `${h}h ${String(m).padStart(2, '0')}m`, units: `(${fmt(r.minutesRemaining)} min)` });
      }
      if (r.maxFlowLpm != null) {
        items.push({ label: `Max flow to last ${fmt(target)} min`, value: fmt(r.maxFlowLpm), units: 'L/min' });
      }
      resultRow(o, items);
      o.appendChild(el('p', { class: 'muted', text: 'Planning estimate - verify against your gauge and institutional transport policy; carry a spare and swap before the residual threshold.' }));
    });
    ['o2-size', 'o2-psi', 'o2-flow', 'o2-res', 'o2-target'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
  },

  'enteral-free-water'(root) {
    root.appendChild(field('Daily formula volume (mL/day)', 'efw-vol', { placeholder: '1200' }));
    root.appendChild(field('Formula free-water fraction (%, ~84 for 1.0 kcal/mL)', 'efw-fw', { placeholder: '84' }));
    root.appendChild(field('Daily free-water goal (mL)', 'efw-goal', { placeholder: '1500' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C8.enteralFreeWater({ dailyVolumeMl: nv('efw-vol'), freeWaterPct: nv('efw-fw'), goalMl: nv('efw-goal') });
      resultRow(o, [
        { label: 'Free water in formula', value: fmt(r.freeWaterFromFormulaMl), units: 'mL/day' },
        { label: 'Additional flush needed', value: fmt(r.additionalFlushMl), units: 'mL/day' },
        { label: 'Flush per shift', value: fmt(r.flushPerShiftMlQ6h), units: 'mL q6h' },
      ]);
    });
    ['efw-vol', 'efw-fw', 'efw-goal'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  'apap-24h-max'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Add each acetaminophen source in the last 24 h — including the acetaminophen component of combination products (oxycodone-APAP, hydrocodone-APAP).' }));
    root.appendChild(field('Source 1: mg per dose', 'apap-d1', { placeholder: '650' }));
    root.appendChild(field('Source 1: doses per day', 'apap-n1', { placeholder: '4' }));
    root.appendChild(field('Source 2: mg per dose', 'apap-d2', { placeholder: '325' }));
    root.appendChild(field('Source 2: doses per day', 'apap-n2', { placeholder: '4' }));
    root.appendChild(field('Source 3: mg per dose', 'apap-d3', { placeholder: '0' }));
    root.appendChild(field('Source 3: doses per day', 'apap-n3', { placeholder: '0' }));
    root.appendChild(selectField('24-hour ceiling', 'apap-ceiling', [
      { value: '4000', text: '4000 mg (standard adult)' },
      { value: '3000', text: '3000 mg (conservative)' },
      { value: '2000', text: '2000 mg (hepatic impairment / chronic alcohol use)' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      let total = 0;
      for (const [d, n] of [['apap-d1', 'apap-n1'], ['apap-d2', 'apap-n2'], ['apap-d3', 'apap-n3']]) {
        const dose = nv(d);
        const freq = nv(n);
        if (dose > 0 && freq > 0) total += C8.apapSourceTotal({ doseMg: dose, dosesPerDay: freq }).totalMg;
      }
      const ceiling = Number(document.getElementById('apap-ceiling').value);
      const r = C8.apapCeilingCheck({ totalMg: total, ceilingMg: ceiling });
      resultRow(o, [
        { label: '24-hour acetaminophen total', value: fmt(total), units: 'mg' },
        { label: r.over ? 'OVER the ceiling by' : 'Remaining to ceiling', value: fmt(Math.abs(r.remainingMg)), units: `mg (${fmt(r.pctOfCeiling)}% of ${ceiling} mg)`, cls: r.over ? 'flag' : null },
      ]);
    });
    ['apap-d1', 'apap-n1', 'apap-d2', 'apap-n2', 'apap-d3', 'apap-n3', 'apap-ceiling'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
  },

  'icu-nutrition-target'(root) {
    root.appendChild(unitField('Weight (use adjusted weight in obesity)', 'int-w', WEIGHT_UNITS, { placeholder: '70' }));
    root.appendChild(selectField('Energy target (kcal/kg/day)', 'int-kcal', [
      { value: '25-30', text: '25-30 (ASPEN/SCCM standard)' },
      { value: '20-25', text: '20-25 (early / hypocaloric)' },
    ]));
    root.appendChild(selectField('Protein target (g/kg/day)', 'int-pro', [
      { value: '1.2-2.0', text: '1.2-2.0 (standard critically ill)' },
      { value: '2.0-2.5', text: '2.0-2.5 (CRRT / burns / high catabolism)' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const [kl, kh] = document.getElementById('int-kcal').value.split('-').map(Number);
      const [pl, ph] = document.getElementById('int-pro').value.split('-').map(Number);
      const r = C8.icuNutritionTarget({ weightKg: unitNum('int-w'), kcalLow: kl, kcalHigh: kh, proteinLow: pl, proteinHigh: ph });
      resultRow(o, [
        { label: 'Energy target', value: `${fmt(r.energyLowKcal)}-${fmt(r.energyHighKcal)}`, units: 'kcal/day' },
        { label: 'Protein target', value: `${fmt(r.proteinLowG)}-${fmt(r.proteinHighG)}`, units: 'g/day' },
      ]);
      o.appendChild(el('p', { class: 'muted', text: 'Use ideal/adjusted body weight in obesity; higher protein for CRRT and burns. ASPEN/SCCM 2016.' }));
    });
    ['int-w', 'int-w-unit', 'int-kcal', 'int-pro'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
  },

  'vte-prophylaxis-dose'(root) {
    root.appendChild(el('p', { class: 'notice', text: 'Planning estimate, not an order. Verify against local protocol; obesity and renal edges may warrant anti-Xa monitoring.' }));
    root.appendChild(unitField('Weight', 'vte-w', WEIGHT_UNITS, { placeholder: '80' }));
    root.appendChild(field('Creatinine clearance (mL/min)', 'vte-crcl', { placeholder: '80' }));
    root.appendChild(selectField('Indication', 'vte-ind', [
      { value: 'prophylaxis', text: 'Prophylaxis' },
      { value: 'treatment', text: 'Treatment' },
    ]));
    root.appendChild(selectField('Treatment regimen', 'vte-reg', [
      { value: 'q12', text: '1 mg/kg q12h' },
      { value: 'daily', text: '1.5 mg/kg q24h' },
    ]));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C8.enoxaparinDose({
        weightKg: unitNum('vte-w'),
        crcl: nv('vte-crcl'),
        indication: document.getElementById('vte-ind').value,
        regimen: document.getElementById('vte-reg').value,
      });
      if (!r) { clear(o); o.appendChild(el('p', { class: 'muted', text: 'Enter weight and CrCl.' })); return; }
      resultRow(o, [
        { label: 'Enoxaparin', value: fmt(r.doseMg), units: `mg ${r.interval}${r.mgPerKg ? ` (${r.mgPerKg} mg/kg)` : ''}` },
        r.renalAdjusted ? { text: 'CrCl <30 mL/min: renal reduction applied.', cls: 'flag' } : null,
      ]);
    });
    ['vte-w', 'vte-w-unit', 'vte-crcl', 'vte-ind', 'vte-reg'].forEach((id) => {
      const node = document.getElementById(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });
  },

  'norepi-equiv'(root) {
    root.appendChild(el('p', { class: 'muted', text: 'Enter each agent at its current infusion dose in its native units. Catecholamine doses are already weight-indexed (mcg/kg/min), so no weight is needed; vasopressin is units/min and angiotensin II is ng/kg/min. Kotani 2023 norepinephrine-equivalent factors.' }));
    root.appendChild(field('Norepinephrine (mcg/kg/min)', 'nee-ne', { placeholder: '0.1' }));
    root.appendChild(field('Epinephrine (mcg/kg/min)', 'nee-epi', { placeholder: '0' }));
    root.appendChild(field('Dopamine (mcg/kg/min)', 'nee-dopa', { placeholder: '0' }));
    root.appendChild(field('Phenylephrine (mcg/kg/min)', 'nee-phe', { placeholder: '0' }));
    root.appendChild(field('Vasopressin (units/min)', 'nee-vaso', { placeholder: '0.04' }));
    root.appendChild(field('Angiotensin II (ng/kg/min)', 'nee-at2', { placeholder: '0' }));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = C8.norepinephrineEquivalent({
        norepinephrine: nv('nee-ne') || 0,
        epinephrine: nv('nee-epi') || 0,
        dopamine: nv('nee-dopa') || 0,
        phenylephrine: nv('nee-phe') || 0,
        vasopressin: nv('nee-vaso') || 0,
        angiotensin2: nv('nee-at2') || 0,
      });
      const c = r.contributions;
      const labels = {
        norepinephrine: 'norepinephrine', epinephrine: 'epinephrine', dopamine: 'dopamine',
        phenylephrine: 'phenylephrine', vasopressin: 'vasopressin', angiotensin2: 'angiotensin II',
      };
      const parts = Object.keys(labels).filter((k) => c[k] > 0).map((k) => `${labels[k]} ${fmt(c[k])}`);
      resultRow(o, [
        { label: 'Total norepinephrine-equivalent', value: fmt(r.totalNeeMcgKgMin), units: 'mcg/kg/min' },
        parts.length ? { text: `Contributions: ${parts.join(' + ')} mcg/kg/min` } : { text: 'Enter at least one agent dose.' },
      ]);
    });
    ['nee-ne', 'nee-epi', 'nee-dopa', 'nee-phe', 'nee-vaso', 'nee-at2'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    run();
  },

  // high-alert removed in spec-v29 wave 29-2 (Group K/O).

  // --- spec-v4 §5: Group F extensions (utilities 129-135) -------------

  'opioid-mme'(root) {
    root.appendChild(el('p', { class: 'notice', text:
      'CDC 2022 conversion factors. Reference only. Total MME breakpoints (50, 90) per CDC framing; this tool does not prescribe action.' }));
    const rowsContainer = el('div');
    const addBtn = el('button', { type: 'button', text: 'Add medication' });
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(rowsContainer);
    root.appendChild(el('p', {}, [addBtn]));
    root.appendChild(out);

    let factors = [];
    let counter = 0;
    loadFile('mme-factors', 'mme.json').then((rows) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      factors = rows; addRow(); run();
    });

    function addRow() {
      counter += 1;
      const id = `mme-row-${counter}`;
      const drugSel = el('select', { id: `${id}-drug`, 'aria-label': `Opioid (row ${counter})` });
      for (const f of factors) drugSel.appendChild(el('option', { value: f.drug, text: f.drug }));
      const mg = el('input', { id: `${id}-mg`, type: 'number', step: 'any', placeholder: 'mg/dose', 'aria-label': `mg per dose (row ${counter})` });
      const n = el('input', { id: `${id}-n`, type: 'number', step: 'any', placeholder: 'doses/day', 'aria-label': `Doses per day (row ${counter})` });
      const rm = el('button', { type: 'button', text: 'Remove' });
      const row = el('p', { class: 'mme-row', id }, [drugSel, ' ', mg, ' ', n, ' ', rm]);
      rm.addEventListener('click', () => { row.remove(); run(); });
      [drugSel, mg, n].forEach((node) => node.addEventListener('input', run));
      drugSel.addEventListener('change', run);
      rowsContainer.appendChild(row);
    }

    addBtn.addEventListener('click', () => { addRow(); run(); });

    function run() {
      clear(out);
      if (!factors.length) return;
      const rows = [];
      for (const r of rowsContainer.querySelectorAll('.mme-row')) {
        const id = r.id;
        rows.push({
          drug: document.getElementById(`${id}-drug`).value,
          mgPerDose: Number(document.getElementById(`${id}-mg`).value),
          dosesPerDay: Number(document.getElementById(`${id}-n`).value),
        });
      }
      const valid = rows.filter((x) => x.mgPerDose > 0 && x.dosesPerDay > 0);
      if (!valid.length) return;
      const r = mmeTotal({ rows: valid, factors });
      out.appendChild(el('h2', { text: `Total daily MME: ${r.totalMme.toFixed(1)}` }));
      const flags = [];
      if (r.totalMme >= 50) flags.push('At/above 50 MME (CDC: reassess)');
      if (r.totalMme >= 90) flags.push('At/above 90 MME (CDC: justify with documentation)');
      if (flags.length) out.appendChild(el('p', { text: flags.join(' - ') }));
      out.appendChild(el('h3', { text: 'Per-medication breakdown' }));
      out.appendChild(el('ul', {}, r.breakdown.map((b) =>
        el('li', { text: `${b.drug}: ${b.mgPerDose} mg x ${b.dosesPerDay}/day x factor ${b.factor || '?'} = ${b.mme == null ? '(unknown drug)' : b.mme.toFixed(1) + ' MME'}` }))));
    }
  },

  'steroid-equiv'(root) {
    root.appendChild(field('Dose (mg)', 'st-dose', { placeholder: '40' }));
    const fromSel = el('select', { id: 'st-from' });
    const toSel = el('select', { id: 'st-to' });
    root.appendChild(el('p', {}, [el('label', { for: 'st-from', text: 'From drug' }), el('br'), fromSel]));
    root.appendChild(el('p', {}, [el('label', { for: 'st-to', text: 'To drug' }), el('br'), toSel]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('steroid-equiv', 'steroid.json').then((table) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      for (const r of table) {
        if (typeof r.equivDoseMg !== 'number') continue;
        fromSel.appendChild(el('option', { value: r.drug, text: r.drug }));
        toSel.appendChild(el('option', { value: r.drug, text: r.drug }));
      }
      const run = () => {
        clear(out);
        const dose = Number(document.getElementById('st-dose').value);
        if (!(dose > 0)) return;
        const eq = steroidEquivalent({ drug: fromSel.value, doseMg: dose, target: toSel.value, table });
        if (eq == null) { out.appendChild(el('p', { text: 'No equivalence available.' })); return; }
        const fromRow = table.find((r) => r.drug === fromSel.value);
        const toRow = table.find((r) => r.drug === toSel.value);
        out.appendChild(el('h2', { text: `${dose} mg ${fromSel.value} ≈ ${eq.toFixed(2)} mg ${toSel.value}` }));
        out.appendChild(el('p', { class: 'muted', text: `Mineralocorticoid activity - from: ${fromRow.mineralocorticoid}; to: ${toRow.mineralocorticoid}` }));
      };
      ['st-dose', 'st-from', 'st-to'].forEach((id) => document.getElementById(id).addEventListener(id === 'st-dose' ? 'input' : 'change', run));
    });
  },

  'benzo-equiv'(root) {
    root.appendChild(field('Dose (mg)', 'bz-dose'));
    const fromSel = el('select', { id: 'bz-from' });
    const toSel = el('select', { id: 'bz-to' });
    root.appendChild(el('p', {}, [el('label', { for: 'bz-from', text: 'From drug' }), el('br'), fromSel]));
    root.appendChild(el('p', {}, [el('label', { for: 'bz-to', text: 'To drug' }), el('br'), toSel]));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('benzo-equiv', 'benzo.json').then((table) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      for (const r of table) {
        fromSel.appendChild(el('option', { value: r.drug, text: r.drug }));
        toSel.appendChild(el('option', { value: r.drug, text: r.drug }));
      }
      const run = () => {
        clear(out);
        const dose = Number(document.getElementById('bz-dose').value);
        if (!(dose > 0)) return;
        const eq = benzoEquivalent({ drug: fromSel.value, doseMg: dose, target: toSel.value, table });
        if (eq == null) { out.appendChild(el('p', { text: 'No equivalence available.' })); return; }
        out.appendChild(el('h2', { text: `${dose} mg ${fromSel.value} ≈ ${eq.toFixed(2)} mg ${toSel.value}` }));
      };
      ['bz-dose', 'bz-from', 'bz-to'].forEach((id) => document.getElementById(id).addEventListener(id === 'bz-dose' ? 'input' : 'change', run));
    });
  },

  'abx-renal'(root) {
    const drugSel = el('select', { id: 'abx-drug' });
    root.appendChild(el('p', {}, [el('label', { for: 'abx-drug', text: 'Antibiotic' }), el('br'), drugSel]));
    root.appendChild(field('CrCl (mL/min)', 'abx-crcl'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('abx-renal', 'abx.json').then((table) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      for (const r of table) drugSel.appendChild(el('option', { value: r.drug, text: r.drug }));
      const run = () => {
        clear(out);
        const crCl = Number(document.getElementById('abx-crcl').value);
        if (!(crCl > 0)) return;
        const band = abxRenalDose({ drug: drugSel.value, crCl, table });
        if (!band) { out.appendChild(el('p', { text: 'No dose band found.' })); return; }
        out.appendChild(el('h2', { text: `${drugSel.value} - CrCl ${crCl} mL/min` }));
        out.appendChild(el('p', { text: `Dose: ${band.dose}; Interval: ${band.interval}` }));
      };
      ['abx-drug', 'abx-crcl'].forEach((id) => document.getElementById(id).addEventListener(id === 'abx-crcl' ? 'input' : 'change', run));
    });
  },

  'vasopressor'(root) {
    const drugSel = el('select', { id: 'vp-drug' });
    root.appendChild(el('p', {}, [el('label', { for: 'vp-drug', text: 'Drug' }), el('br'), drugSel]));
    root.appendChild(unitField('Patient weight', 'vp-w', WEIGHT_UNITS));
    root.appendChild(field('Bag concentration (mcg/mL)', 'vp-conc'));
    root.appendChild(field('Desired dose (units below)', 'vp-dose'));
    root.appendChild(field('OR pump rate (mL/hr) for reverse calc', 'vp-rate'));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    loadFile('vasopressor-doses', 'vasopressors.json').then((table) => {
      if (!root.isConnected) return; // view torn down before fetch resolved
      for (const r of table) drugSel.appendChild(el('option', { value: r.drug, text: `${r.drug} (${r.units})` }));
      const run = () => {
        clear(out);
        const row = table.find((r) => r.drug === drugSel.value);
        if (!row) return;
        const units = row.units === 'units/min' ? 'mcg/min' : row.units; // vasopressin treated as mcg/min for the math wrapper
        const w = unitNum('vp-w');
        const conc = Number(document.getElementById('vp-conc').value);
        const dose = Number(document.getElementById('vp-dose').value);
        const rate = Number(document.getElementById('vp-rate').value);
        if (!(conc > 0)) return;
        out.appendChild(el('h2', { text: `${row.drug} - typical range ${row.typicalRange}` }));
        try {
          if (dose > 0) {
            const r = vasopressorRateMlHr({ dose, units, weightKg: w || undefined, concUgPerMl: conc });
            out.appendChild(el('p', { text: `${dose} ${row.units} → ${r.toFixed(2)} mL/hr` }));
          }
          if (rate > 0) {
            const d = vasopressorDose({ rateMlHr: rate, units, weightKg: w || undefined, concUgPerMl: conc });
            out.appendChild(el('p', { text: `${rate} mL/hr → ${d.toFixed(3)} ${row.units}` }));
          }
        } catch (err) {
          out.appendChild(el('p', { class: 'muted', text: err.message }));
        }
      };
      ['vp-drug', 'vp-w', 'vp-w-unit', 'vp-conc', 'vp-dose', 'vp-rate'].forEach((id) => document.getElementById(id).addEventListener((id === 'vp-drug' || id === 'vp-w-unit') ? 'change' : 'input', run));
    });
  },

  'tpn-macro'(root) {
    root.appendChild(field('Final volume (mL)', 'tpn-vol', { placeholder: '1500' }));
    root.appendChild(field('Dextrose (% final)', 'tpn-d', { placeholder: '20' }));
    root.appendChild(field('Amino acid (% final)', 'tpn-aa', { placeholder: '5' }));
    root.appendChild(field('Lipid 20% (mL as % of final volume)', 'tpn-lipid', { placeholder: '10' }));
    const out = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(out);
    const run = () => {
      clear(out);
      try {
        const r = tpnMacro({
          volumeMl: Number(document.getElementById('tpn-vol').value),
          dextrosePct: Number(document.getElementById('tpn-d').value) || 0,
          aminoAcidPct: Number(document.getElementById('tpn-aa').value) || 0,
          lipidPctOfVolume: Number(document.getElementById('tpn-lipid').value) || 0,
        });
        resultRow(out, [
          { label: 'Total', value: `${r.totalKcal.toFixed(0)} kcal in ${r.volumeMl} mL` },
          { label: 'Dextrose', value: `${r.dextroseG.toFixed(1)} g (${r.kcalDextrose.toFixed(0)} kcal)` },
          { label: 'Protein', value: `${r.proteinG.toFixed(1)} g (${r.kcalProtein.toFixed(0)} kcal)` },
          { label: 'Lipid', value: `${r.lipidG.toFixed(1)} g (${r.kcalLipid.toFixed(0)} kcal)` },
        ]);
      } catch (err) {
        out.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    ['tpn-vol', 'tpn-d', 'tpn-aa', 'tpn-lipid'].forEach((id) => document.getElementById(id).addEventListener('input', run));
  },

  // iv-to-po removed in spec-v29 wave 29-2 (Group K/O): static
  // equivalence table per sec 7.2 audit decision.

  // spec-v29 sec 4.8.1 wave 29-3c: insulin correction (ADA 2024).
  'insulin-correction'(root) {
    root.appendChild(field('Current BG (mg/dL)', 'ic-bg'));
    root.appendChild(field('Target BG (mg/dL)', 'ic-target'));
    root.appendChild(field('ISF (mg/dL per unit; leave blank to derive from TDD)', 'ic-isf'));
    root.appendChild(field('Total daily insulin dose (units; used only if ISF blank)', 'ic-tdd'));
    root.appendChild(selectField('ISF rule (when derived from TDD)', 'ic-rule', [
      { value: 'rapid',   text: '1800-rule (rapid-acting analogues)' },
      { value: 'regular', text: '1500-rule (regular insulin)' },
    ]));
    root.appendChild(field('Carbs to be eaten (g; leave blank for correction only)', 'ic-carbs'));
    root.appendChild(field('Insulin-to-carb ratio (g per unit)', 'ic-icr'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = insulinCorrection({
        currentBG: nv('ic-bg'),
        targetBG:  nv('ic-target'),
        isf:       nv('ic-isf'),
        totalDailyDose: nv('ic-tdd'),
        isfRule:   document.getElementById('ic-rule').value,
        carbs:     nv('ic-carbs'),
        icr:       nv('ic-icr'),
      });
      resultRow(o, [
        { label: 'Total', value: r.totalUnits, units: 'U' },
        { label: 'ISF', value: `${r.isf}${r.isfDerivedFromTdd ? ' (derived from TDD)' : ''}` },
        { label: 'Correction', value: r.correctionUnits, units: 'U' },
        { label: 'Meal coverage', value: r.mealUnits, units: 'U' },
      ]);
      o.appendChild(el('p', { class: 'clinical-notice', text: 'ADA 2024 hospital glycemic target: 140-180 mg/dL non-critical; 110-180 mg/dL ICU.' }));
    });
    ['ic-bg', 'ic-target', 'ic-isf', 'ic-tdd', 'ic-rule', 'ic-carbs', 'ic-icr'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('ic-rule').addEventListener('change', run);
  },

  // spec-v29 sec 4.9.1 wave 29-3c: electrolyte replacement ladder.
  'electrolyte-replacement'(root) {
    root.appendChild(selectField('Electrolyte', 'er-e', [
      { value: 'k',    text: 'Potassium (mEq/L)' },
      { value: 'mg',   text: 'Magnesium (mg/dL)' },
      { value: 'phos', text: 'Phosphate (mg/dL)' },
    ]));
    root.appendChild(field('Serum level', 'er-l'));
    root.appendChild(selectField('Route', 'er-r', [
      { value: 'iv', text: 'IV' },
      { value: 'po', text: 'PO' },
    ]));
    const renalWrap = el('p', {}, [
      el('label', { for: 'er-renal' }, [
        el('input', { id: 'er-renal', type: 'checkbox' }),
        ' Renal impairment (eGFR < 30 or AKI)',
      ]),
    ]);
    root.appendChild(renalWrap);
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = electrolyteReplacement({
        electrolyte:   document.getElementById('er-e').value,
        level:         nv('er-l'),
        route:         document.getElementById('er-r').value,
        renalImpaired: document.getElementById('er-renal').checked,
      });
      o.appendChild(el('h2', { text: `${r.electrolyte}: ${r.dose}` }));
      if (r.rate) o.appendChild(el('p', { text: r.rate }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['er-e', 'er-l', 'er-r'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    document.getElementById('er-e').addEventListener('change', run);
    document.getElementById('er-r').addEventListener('change', run);
    document.getElementById('er-renal').addEventListener('change', run);
  },

  // spec-v29 sec 4.17.1 wave 29-3c: CRRT effluent dose + citrate ratio.
  'crrt-dose'(root) {
    root.appendChild(unitField('Patient weight', 'cr-w', WEIGHT_UNITS));
    root.appendChild(field('Prescribed effluent rate (mL/h)', 'cr-r'));
    root.appendChild(selectField('Modality', 'cr-mod', [
      { value: 'CVVH',   text: 'CVVH' },
      { value: 'CVVHD',  text: 'CVVHD' },
      { value: 'CVVHDF', text: 'CVVHDF' },
    ]));
    root.appendChild(field('Ultrafiltration (mL/h, optional)', 'cr-uf'));
    // spec-v62 A4 (final wave): ionised/total Ca SI toggle. mmol/L is the
    // compute/canonical unit (Davenport 2009 targets are mmol/L), so mmol/L is
    // the default option and the mg/dL alternate converts up via the calcium
    // factor; empty stays 0 -> treated as not provided, identical to before.
    root.appendChild(unitField('Systemic ionized Ca (optional)', 'cr-sca', CALCIUM_MMOL_UNITS));
    root.appendChild(unitField('Post-filter ionized Ca (optional)', 'cr-pca', CALCIUM_MMOL_UNITS));
    root.appendChild(unitField('Total Ca (optional)', 'cr-tca', CALCIUM_MMOL_UNITS));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = crrtDose({
        weightKg:              unitNum('cr-w'),
        effluentRateMlPerHr:   nv('cr-r'),
        modality:              document.getElementById('cr-mod').value,
        ultrafiltrationMlPerHr: nv('cr-uf'),
        systemicIonisedCa:     unitNum('cr-sca'),
        postFilterIonisedCa:   unitNum('cr-pca'),
        totalCa:               unitNum('cr-tca'),
      });
      o.appendChild(el('h2', { text: `${r.effluentDoseMlPerKgPerHr} mL/kg/h` }));
      o.appendChild(el('p', { text: r.text }));
      if (r.totalIonisedRatio !== null) o.appendChild(el('p', { text: `Total/ionized Ca ratio: ${r.totalIonisedRatio}` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['cr-w', 'cr-r', 'cr-uf', 'cr-sca', 'cr-pca', 'cr-tca'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    ['cr-mod', 'cr-w-unit', 'cr-sca-unit', 'cr-pca-unit', 'cr-tca-unit'].forEach((id) => document.getElementById(id).addEventListener('change', run));
  },

  // spec-v29 sec 4.18.1 wave 29-3c: ECMO sweep / flow titration.
  'ecmo-titration'(root) {
    root.appendChild(selectField('Modality', 'ec-mod', [
      { value: 'VV', text: 'VV (respiratory)' },
      { value: 'VA', text: 'VA (cardiopulmonary)' },
    ]));
    root.appendChild(unitField('Patient weight', 'ec-w', WEIGHT_UNITS));
    root.appendChild(field('Current sweep (L/min)', 'ec-sw'));
    root.appendChild(field('Current pump flow (L/min)', 'ec-fl'));
    root.appendChild(field('Current PaCO2 (mmHg)', 'ec-pco'));
    root.appendChild(field('Target PaCO2 (mmHg; default 40)', 'ec-tgt'));
    root.appendChild(field('Hemoglobin (g/dL)', 'ec-hb'));
    root.appendChild(field('SaO2 or post-oxygenator SatO2 (% or fraction)', 'ec-sat'));
    const o = out(); root.appendChild(o);
    const run = () => safe(o, () => {
      const r = ecmoTitration({
        modality:        document.getElementById('ec-mod').value,
        weightKg:        unitNum('ec-w'),
        currentSweepLpm: nv('ec-sw'),
        currentFlowLpm:  nv('ec-fl'),
        currentPaCO2:    nv('ec-pco'),
        targetPaCO2:     nv('ec-tgt'),
        hb:              nv('ec-hb'),
        sao2:            nv('ec-sat'),
      });
      o.appendChild(el('h2', { text: `Sweep ${r.suggestedSweepLpm} L/min / Flow ${r.suggestedFlowLpm} L/min` }));
      if (r.do2iMlPerKgPerMin !== null) o.appendChild(el('p', { text: `DO2i ${r.do2iMlPerKgPerMin} mL/kg/min (ELSO 2022 target >= 6)` }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'clinical-notice', text: b }));
    });
    ['ec-w', 'ec-sw', 'ec-fl', 'ec-pco', 'ec-tgt', 'ec-hb', 'ec-sat'].forEach((id) => document.getElementById(id).addEventListener('input', run));
    ['ec-mod', 'ec-w-unit'].forEach((id) => document.getElementById(id).addEventListener('change', run));
  },

  // spec-v31 §2.1: Beers Criteria (AGS 2023) deprescribing checker.
  'beers-check'(root) {
    root.appendChild(field('Patient age (years)', 'bc-age', { placeholder: '75' }));
    root.appendChild(el('p', { class: 'muted', text: 'Select all medication categories the patient is currently taking:' }));
    const medList = el('div', { id: 'bc-med-list' });
    for (const [key, def] of Object.entries(BEERS_PIM)) {
      const wrap = el('p');
      const cb = el('input', { id: `bc-m-${key}`, type: 'checkbox', 'data-bc-med': key });
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(el('label', { for: `bc-m-${key}`, text: def.label }));
      medList.appendChild(wrap);
    }
    root.appendChild(medList);
    root.appendChild(el('p', { class: 'muted', text: 'Select all relevant comorbidities (Beers Table 3 drug-disease list):' }));
    const cmbList = el('div', { id: 'bc-cmb-list' });
    for (const [key, label] of Object.entries(BEERS_DISEASE)) {
      const wrap = el('p');
      const cb = el('input', { id: `bc-c-${key}`, type: 'checkbox', 'data-bc-cmb': key });
      wrap.appendChild(cb);
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(el('label', { for: `bc-c-${key}`, text: label }));
      cmbList.appendChild(wrap);
    }
    root.appendChild(cmbList);
    const o = out(); root.appendChild(o);
    const collect = (attr) =>
      Array.from(document.querySelectorAll(`[${attr}]`))
        .filter((n) => n.checked)
        .map((n) => n.getAttribute(attr));
    const run = () => safe(o, () => {
      const r = beersCheck({
        ageYears: nv('bc-age'),
        medications: collect('data-bc-med'),
        comorbidities: collect('data-bc-cmb'),
      });
      o.appendChild(el('h2', { text: r.summary }));
      for (const b of r.banners) o.appendChild(el('p', { class: 'muted', text: b }));
      if (r.pimFlags.length) {
        o.appendChild(el('h3', { text: 'PIM flags (AGS 2023 Table 2)' }));
        for (const f of r.pimFlags) {
          o.appendChild(el('p', {}, [
            el('strong', { text: `${f.label}. ` }),
            document.createTextNode(`${f.rationale} ${f.recommendation}`),
          ]));
        }
      }
      if (r.diseaseFlags.length) {
        o.appendChild(el('h3', { text: 'Drug-disease interactions (AGS 2023 Table 3)' }));
        for (const f of r.diseaseFlags) o.appendChild(el('p', { text: f.text }));
      }
      if (r.drugDrugFlags.length) {
        o.appendChild(el('h3', { text: 'Drug-drug interactions (AGS 2023 Table 6)' }));
        for (const f of r.drugDrugFlags) o.appendChild(el('p', { class: 'clinical-notice', text: f.text }));
      }
      o.appendChild(el('p', { class: 'muted', text: 'Source: AGS 2023 Beers Criteria, J Am Geriatr Soc. 2023;71(7):2052-2081.' }));
    });
    document.getElementById('bc-age').addEventListener('input', run);
    for (const n of document.querySelectorAll('[data-bc-med], [data-bc-cmb]')) {
      n.addEventListener('change', run);
    }
    run();
  },
};
