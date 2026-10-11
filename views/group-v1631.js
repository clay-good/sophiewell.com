// spec-v1631: clinical pharmacokinetics and therapeutic drug monitoring. Group F.
// pk-steady-state-predict, auc-trapezoid, tmic-beta-lactam, sawchuk-zaske-dosing, kinetic-egfr and
// crrt-drug-clearance, fosphenytoin-load-rate, caffeine-citrate-dose, lithium-level-check and
// digoxin-label-dose, arc-risk-scores, phenytoin-mm-dose, busulfan-auc-dose.

import { el, clear } from '../lib/dom.js';
import * as PK from '../lib/pk-steady-state-predict-v1631.js';
import * as AT from '../lib/auc-trapezoid-v1631.js';
import * as TM from '../lib/tmic-beta-lactam-v1631.js';
import * as SZ from '../lib/sawchuk-zaske-dosing-v1631.js';
import * as KE from '../lib/kinetic-egfr-v1631.js';
import * as CR from '../lib/crrt-drug-clearance-v1631.js';
import * as FL from '../lib/fosphenytoin-load-rate-v1631.js';
import * as CC from '../lib/caffeine-citrate-dose-v1631.js';
import * as LI from '../lib/lithium-level-check-v1631.js';
import * as DG from '../lib/digoxin-label-dose-v1631.js';
import * as AR from '../lib/arc-risk-scores-v1631.js';
import * as PM from '../lib/phenytoin-mm-dose-v1631.js';
import * as BU from '../lib/busulfan-auc-dose-v1631.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
  root.appendChild(wrap);
  return wrap;
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
// One renderer shape for every tool here: read each field, hand the lot to the library, show the result.
function run(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'pk-steady-state-predict'(root) {
    numField(root, 'Dose, mg', 'pk-dose', '');
    numField(root, 'Infusion time, hours (0 for a bolus)', 'pk-tinf', '');
    numField(root, 'Dosing interval, hours', 'pk-tau', '');
    numField(root, 'Volume of distribution, L', 'pk-vd', '');
    numField(root, 'Half-life, hours (enter one of these three)', 'pk-half', '');
    numField(root, 'or elimination rate constant, per hour', 'pk-k', '');
    numField(root, 'or clearance, L/hour', 'pk-cl', '');
    numField(root, 'Dose number (optional)', 'pk-n', '');
    numField(root, 'Hours after that dose started (optional)', 'pk-t', '');
    numField(root, 'A level, mg/L (optional)', 'pk-level', '');
    numField(root, 'Target to fall to, mg/L (optional)', 'pk-target', '');
    run(root, [['pk-dose', 'dose'], ['pk-tinf', 'infusionHours'], ['pk-tau', 'interval'], ['pk-vd', 'vd'], ['pk-half', 'halfLife'], ['pk-k', 'k'], ['pk-cl', 'clearance'], ['pk-n', 'doseNumber'], ['pk-t', 'timeAfter'], ['pk-level', 'level'], ['pk-target', 'target']], PK.pkSteadyStatePredict);
  },

  'auc-trapezoid'(root) {
    textareaField(root, 'Samples, one per line: time in hours, then the concentration', 'at-points', '');
    selectField(root, 'Method', 'at-method', AT.METHODS);
    selectField(root, 'Extrapolate to infinity?', 'at-extra', AT.YES_NO);
    numField(root, 'Last samples to fit the terminal slope through (when extrapolating)', 'at-n', '');
    numField(root, 'Dose, for clearance (optional)', 'at-dose', '');
    run(root, [['at-points', 'points'], ['at-method', 'method'], ['at-extra', 'extrapolate'], ['at-n', 'terminalPoints'], ['at-dose', 'dose']], AT.aucTrapezoid);
  },

  'tmic-beta-lactam'(root) {
    numField(root, 'Dose, mg', 'tm-dose', '');
    numField(root, 'Infusion time, hours (0 for a bolus)', 'tm-tinf', '');
    numField(root, 'Dosing interval, hours', 'tm-tau', '');
    numField(root, 'Volume of distribution, L', 'tm-vd', '');
    numField(root, 'Half-life, hours', 'tm-half', '');
    numField(root, 'or elimination rate constant, per hour', 'tm-k', '');
    numField(root, 'Unbound fraction, from 0 to 1', 'tm-fu', '');
    numField(root, 'MIC, mg/L', 'tm-mic', '');
    run(root, [['tm-dose', 'dose'], ['tm-tinf', 'infusionHours'], ['tm-tau', 'interval'], ['tm-vd', 'vd'], ['tm-half', 'halfLife'], ['tm-k', 'k'], ['tm-fu', 'unboundFraction'], ['tm-mic', 'mic']], TM.tmicBetaLactam);
  },

  'sawchuk-zaske-dosing'(root) {
    selectField(root, 'The levels follow', 'sz-state', SZ.DOSE_STATES);
    numField(root, 'Dose given, mg', 'sz-dose', '');
    numField(root, 'Infusion time, hours', 'sz-tinf', '');
    numField(root, 'Dosing interval, hours', 'sz-tau', '');
    numField(root, 'First level, mg/L', 'sz-c1', '');
    numField(root, 'First level: hours after the infusion ended', 'sz-t1', '');
    numField(root, 'Second level, mg/L', 'sz-c2', '');
    numField(root, 'Second level: hours after the infusion ended', 'sz-t2', '');
    numField(root, 'Pre-dose level, mg/L (first dose only; optional)', 'sz-pre', '');
    numField(root, 'Weight, kg, for L/kg (optional)', 'sz-weight', '');
    numField(root, 'Desired peak, mg/L (optional)', 'sz-peak', '');
    numField(root, 'Desired trough, mg/L (optional)', 'sz-trough', '');
    run(root, [['sz-state', 'doseState'], ['sz-dose', 'dose'], ['sz-tinf', 'infusionHours'], ['sz-tau', 'interval'], ['sz-c1', 'level1'], ['sz-t1', 'time1'], ['sz-c2', 'level2'], ['sz-t2', 'time2'], ['sz-pre', 'preDose'], ['sz-weight', 'weight'], ['sz-peak', 'desiredPeak'], ['sz-trough', 'desiredTrough']], SZ.sawchukZaskeDosing);
  },

  'kinetic-egfr'(root) {
    numField(root, 'Baseline (steady-state) creatinine, mg/dL', 'ke-base', '');
    numField(root, 'Clearance or eGFR at that baseline, mL/min', 'ke-crcl', '');
    numField(root, 'First creatinine, mg/dL', 'ke-c1', '');
    numField(root, 'Second creatinine, mg/dL', 'ke-c2', '');
    numField(root, 'Hours between the two', 'ke-hours', '');
    numField(root, 'Weight, kg (body water is taken as 0.6 × kg)', 'ke-weight', '');
    numField(root, 'or maximum creatinine rise, mg/dL per day', 'ke-max', '');
    run(root, [['ke-base', 'baselineCreatinine'], ['ke-crcl', 'baselineClearance'], ['ke-c1', 'creatinine1'], ['ke-c2', 'creatinine2'], ['ke-hours', 'hours'], ['ke-weight', 'weight'], ['ke-max', 'maxRise']], KE.kineticEgfr);
  },

  'crrt-drug-clearance'(root) {
    const pairs = [['cr2-mode', 'mode'], ['cr2-unit', 'flowUnit'], ['cr2-quf', 'ultrafiltrateFlow'], ['cr2-sc', 'sievingCoefficient'], ['cr2-qd', 'dialysateFlow'], ['cr2-sa', 'saturationCoefficient'], ['cr2-qp', 'plasmaFlow'], ['cr2-pre', 'preFilterFlow'], ['cr2-other', 'otherClearance']];
    selectField(root, 'Mode', 'cr2-mode', CR.MODES);
    selectField(root, 'Flows are entered in', 'cr2-unit', CR.FLOW_UNITS);
    const filtration = [
      numField(root, 'Ultrafiltrate flow', 'cr2-quf', ''),
      numField(root, 'Sieving coefficient, from your source or effluent ÷ plasma', 'cr2-sc', ''),
      numField(root, 'Plasma flow (only with fluid given before the filter)', 'cr2-qp', ''),
      numField(root, 'Pre-filter flow', 'cr2-pre', ''),
    ];
    const dialysis = [
      numField(root, 'Dialysate flow', 'cr2-qd', ''),
      numField(root, 'Saturation coefficient, from your source or effluent ÷ plasma', 'cr2-sa', ''),
    ];
    numField(root, 'Patient\'s other clearance, mL/min (optional)', 'cr2-other', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const mode = val('cr2-mode');
      const f = mode !== 'hemodialysis'; const d = mode !== 'hemofiltration';
      for (const w of filtration) w.hidden = Boolean(mode) && !f;
      for (const w of dialysis) w.hidden = Boolean(mode) && !d;
      const args = {};
      // A hidden field's leftover value is not part of the question.
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      if (mode && !f) for (const k of ['ultrafiltrateFlow', 'sievingCoefficient', 'plasmaFlow', 'preFilterFlow']) args[k] = '';
      if (mode && !d) for (const k of ['dialysateFlow', 'saturationCoefficient']) args[k] = '';
      show(CR.crrtDrugClearance(args), o);
    }));
  },

  'fosphenytoin-load-rate'(root) {
    const pairs = [['fl-drug', 'drug'], ['fl-pop', 'population'], ['fl-ind', 'indication'], ['fl-route', 'route'], ['fl-weight', 'weight'], ['fl-wunit', 'weightUnit'], ['fl-mgkg', 'mgPerKg'], ['fl-bag', 'bagVolume']];
    selectField(root, 'Drug', 'fl-drug', FL.DRUG_OPTIONS);
    selectField(root, 'Patient', 'fl-pop', FL.POPULATIONS);
    selectField(root, 'Loading for', 'fl-ind', FL.INDICATIONS);
    selectField(root, 'Route', 'fl-route', FL.ROUTES);
    numField(root, 'Patient weight', 'fl-weight', '');
    selectField(root, 'Weight unit', 'fl-wunit', FL.WEIGHT_UNITS);
    numField(root, 'Dose chosen, per kg (mg PE/kg for fosphenytoin, mg/kg for phenytoin)', 'fl-mgkg', '');
    numField(root, 'Bag volume for the infusion, mL (optional)', 'fl-bag', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = FL.fosphenytoinLoadRate(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  // Both read a label row, so both take the clock and link the label when its figures are withheld.
  'caffeine-citrate-dose'(root) {
    numField(root, 'Infant weight', 'cf-weight', '');
    selectField(root, 'Weight unit', 'cf-wunit', CC.WEIGHT_UNITS);
    numField(root, 'Serum caffeine level, mg/L (optional)', 'cf-level', '');
    const o = out(); root.appendChild(o);
    wire(['cf-weight', 'cf-wunit', 'cf-level'], () => safe(o, () => {
      const r = CC.caffeineCitrateDose({ weight: val('cf-weight'), weightUnit: val('cf-wunit'), level: val('cf-level') }, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'lithium-level-check'(root) {
    const pairs = [['li-phase', 'phase'], ['li-level', 'level'], ['li-hours', 'hoursSinceDose'], ['li-crcl', 'creatinineClearance'], ['li-dose', 'dailyDose'], ['li-target', 'target']];
    selectField(root, 'Treatment', 'li-phase', LI.PHASES);
    numField(root, 'Serum lithium level, mEq/L', 'li-level', '');
    numField(root, 'Hours since the last dose', 'li-hours', '');
    numField(root, 'Creatinine clearance, mL/min (optional)', 'li-crcl', '');
    numField(root, 'Current daily dose, mg/day (optional)', 'li-dose', '');
    numField(root, 'Target level, mEq/L (optional)', 'li-target', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LI.lithiumLevelCheck(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'digoxin-label-dose'(root) {
    const pairs = [['dg-age', 'ageGroup'], ['dg-weight', 'leanWeight'], ['dg-wunit', 'weightUnit'], ['dg-load', 'loadMcgPerKg'], ['dg-crcl', 'creatinineClearance']];
    selectField(root, 'Age group', 'dg-age', DG.AGE_GROUPS);
    numField(root, 'Lean body weight', 'dg-weight', '');
    selectField(root, 'Weight unit', 'dg-wunit', DG.WEIGHT_UNITS);
    numField(root, 'Loading dose chosen, mcg/kg', 'dg-load', '');
    const crcl = numField(root, 'Creatinine clearance corrected to 70 kg or 1.73 m², mL/min (for maintenance)', 'dg-crcl', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const young = val('dg-age') === '5-10';
      crcl.hidden = young;
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      // A hidden field's leftover value is not part of the question.
      if (young) args.creatinineClearance = '';
      const r = DG.digoxinLabelDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'arc-risk-scores'(root) {
    numField(root, 'Age, years', 'ar-age', '');
    selectField(root, 'Sex', 'ar-sex', AR.SEXES);
    numField(root, 'Serum creatinine, mg/dL', 'ar-scr', '');
    selectField(root, 'Admission after trauma?', 'ar-trauma', AR.YES_NO);
    numField(root, 'Modified SOFA score (SOFA without the neurological part)', 'ar-sofa', '');
    run(root, [['ar-age', 'age'], ['ar-sex', 'sex'], ['ar-scr', 'creatinine'], ['ar-trauma', 'trauma'], ['ar-sofa', 'modifiedSofa']], AR.arcRiskScores);
  },

  'phenytoin-mm-dose'(root) {
    const pairs = [['pm-dose1', 'dose1'], ['pm-form1', 'form1'], ['pm-level1', 'level1'], ['pm-dose2', 'dose2'], ['pm-form2', 'form2'], ['pm-level2', 'level2'], ['pm-target', 'target'], ['pm-test', 'testDose'], ['pm-testform', 'testForm']];
    numField(root, 'First daily dose, mg/day', 'pm-dose1', '');
    selectField(root, 'First dose is', 'pm-form1', PM.FORMS);
    numField(root, 'Steady-state level on the first dose, mcg/mL', 'pm-level1', '');
    numField(root, 'Second daily dose, mg/day', 'pm-dose2', '');
    selectField(root, 'Second dose is', 'pm-form2', PM.FORMS);
    numField(root, 'Steady-state level on the second dose, mcg/mL', 'pm-level2', '');
    numField(root, 'Target level, mcg/mL', 'pm-target', '');
    numField(root, 'A dose to test, mg/day (optional)', 'pm-test', '');
    selectField(root, 'Dose to test is', 'pm-testform', PM.FORMS);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PM.phenytoinMmDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },

  'busulfan-auc-dose'(root) {
    const pairs = [['bu-timing', 'timing'], ['bu-dose', 'dose'], ['bu-unit', 'unit'], ['bu-samples', 'samples'], ['bu-target', 'target']];
    selectField(root, 'The samples followed', 'bu-timing', BU.TIMINGS);
    numField(root, 'Dose given, mg', 'bu-dose', '');
    selectField(root, 'Concentrations are in', 'bu-unit', BU.UNITS);
    textareaField(root, 'Samples, one per line: hours after the infusion started, then the concentration', 'bu-samples', '');
    // The label's target, shown and editable; the result names the value used.
    numField(root, 'Target AUC, µM·min', 'bu-target', '').querySelector('input').value = String(BU.LABEL.target);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = BU.busulfanAucDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
};
