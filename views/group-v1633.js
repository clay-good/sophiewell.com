// spec-v1633: conversions, switches, titrations and tapers, each as its label or paper states it.
// anticoag-switch-clock, doac-periprocedural-timing, fentanyl-patch-initial-dose,
// methadone-label-conversion, er-opioid-label-start, buprenorphine-oud-product-switch,
// basal-insulin-switch, taper-calendar, esa-conversion, iv-iron-course,
// lamotrigine-titration-calendar, label-titration-calendar, aed-formulation-switch,
// transplant-formulation-switch, label-formulation-switch, levothyroxine-start-dose,
// lai-antipsychotic-start, vitamin-iu-converter, ppi-omeprazole-equivalent,
// antidepressant-fluoxetine-equivalent, statin-ldl-reduction, levodopa-equivalent-dose,
// hf-gdmt-target-percent.

import { el, clear } from '../lib/dom.js';
import * as AS from '../lib/anticoag-switch-clock-v1633.js';
import * as DP from '../lib/doac-periprocedural-timing-v1633.js';
import * as FP from '../lib/fentanyl-patch-initial-dose-v1633.js';
import * as ML from '../lib/methadone-label-conversion-v1633.js';
import * as EO from '../lib/er-opioid-label-start-v1633.js';
import * as BS from '../lib/buprenorphine-oud-product-switch-v1633.js';
import * as BI from '../lib/basal-insulin-switch-v1633.js';
import * as TC from '../lib/taper-calendar-v1633.js';
import * as ES from '../lib/esa-conversion-v1633.js';
import * as IC from '../lib/iv-iron-course-v1633.js';
import * as LT from '../lib/lamotrigine-titration-calendar-v1633.js';
import * as LC from '../lib/label-titration-calendar-v1633.js';
import * as AF from '../lib/aed-formulation-switch-v1633.js';
import * as TF from '../lib/transplant-formulation-switch-v1633.js';
import * as LF from '../lib/label-formulation-switch-v1633.js';
import * as LX from '../lib/levothyroxine-start-dose-v1633.js';
import * as LA from '../lib/lai-antipsychotic-start-v1633.js';
import * as VI from '../lib/vitamin-iu-converter-v1633.js';
import * as PP from '../lib/ppi-omeprazole-equivalent-v1633.js';
import * as AE from '../lib/antidepressant-fluoxetine-equivalent-v1633.js';
import * as SL from '../lib/statin-ldl-reduction-v1633.js';
import * as LE from '../lib/levodopa-equivalent-dose-v1633.js';
import * as HG from '../lib/hf-gdmt-target-percent-v1633.js';
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
function dateField(root, label, id, type = 'date') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
  return wrap;
}
function plainText(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '3', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function table(root, caption, headers, rows) {
  const wrap = el('div', { class: 'upload-mapping-scroll' });
  const node = el('table', { class: 'upload-mapping-table' });
  node.appendChild(el('caption', { text: caption }));
  const head = el('tr');
  for (const h of headers) head.appendChild(el('th', { scope: 'col', text: h }));
  node.appendChild(el('thead', null, [head]));
  const body = el('tbody');
  for (const values of rows) {
    const tr = el('tr');
    for (const value of values) tr.appendChild(el('td', { text: String(value) }));
    body.appendChild(tr);
  }
  node.appendChild(body); wrap.appendChild(node); root.appendChild(wrap);
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

export const renderers = {
  'anticoag-switch-clock'(root) {
    const pairs = [['asc-from', 'from'], ['asc-to', 'to'], ['asc-pop', 'population'], ['asc-inr', 'inr'], ['asc-crcl', 'crcl'], ['asc-edo-option', 'edoxabanOption'], ['asc-edo-dose', 'edoxabanDose'], ['asc-next', 'nextDose'], ['asc-last', 'lastDose']];
    selectField(root, 'Anticoagulant being stopped', 'asc-from', AS.DRUGS);
    selectField(root, 'Anticoagulant being started', 'asc-to', AS.DRUGS);
    selectField(root, 'Patient', 'asc-pop', AS.POPULATIONS);
    numField(root, 'Current INR (when warfarin is being stopped)', 'asc-inr', '');
    numField(root, 'Creatinine clearance, mL/min (when dabigatran is being stopped; for a child, eGFR)', 'asc-crcl', '');
    selectField(root, 'Edoxaban to warfarin: which option', 'asc-edo-option', AS.EDOXABAN_OPTIONS);
    selectField(root, 'Edoxaban to warfarin, oral option: current dose', 'asc-edo-dose', AS.EDOXABAN_DOSES);
    dateField(root, 'Next scheduled dose of the drug being stopped (optional)', 'asc-next', 'datetime-local');
    dateField(root, 'Last dabigatran dose (optional, for a switch to a parenteral drug)', 'asc-last', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AS.anticoagSwitchClock(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'doac-periprocedural-timing'(root) {
    const pairs = [['dpt-drug', 'drug'], ['dpt-pop', 'population'], ['dpt-risk', 'risk'], ['dpt-source', 'source'], ['dpt-when', 'procedure'], ['dpt-crcl', 'crcl']];
    selectField(root, 'DOAC', 'dpt-drug', DP.DRUGS);
    selectField(root, 'Patient', 'dpt-pop', DP.POPULATIONS);
    selectField(root, 'Bleeding risk of the procedure (your classification)', 'dpt-risk', DP.RISKS);
    selectField(root, 'Source to apply', 'dpt-source', DP.SOURCES);
    dateField(root, 'Procedure date and time', 'dpt-when', 'datetime-local');
    numField(root, 'Creatinine clearance, mL/min (dabigatran, and any drug under PAUSE; for a child on dabigatran, eGFR)', 'dpt-crcl', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DP.doacPeriproceduralTiming(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'fentanyl-patch-initial-dose'(root) {
    const pairs = [['fpd-drug', 'drug'], ['fpd-mg', 'dailyMg'], ['fpd-tolerant', 'tolerant']];
    selectField(root, 'Current opioid and route', 'fpd-drug', FP.DRUGS);
    numField(root, 'Total dose over 24 hours, mg', 'fpd-mg', '');
    selectField(root, 'Opioid tolerant by the label\'s definition', 'fpd-tolerant', FP.TOLERANT);
    note(root, FP.TOLERANCE_DEFINITION);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = FP.fentanylPatchInitialDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'methadone-label-conversion'(root) {
    const pairs = [['mlc-mode', 'mode'], ['mlc-med', 'morphineEquivalentMg'], ['mlc-n', 'dosesPerDay'], ['mlc-tab', 'tabletMg'], ['mlc-iv', 'parenteralMg']];
    selectField(root, 'Coming from', 'mlc-mode', ML.MODES);
    numField(root, 'Total daily oral morphine-equivalent dose, mg (from another oral opioid)', 'mlc-med', '');
    numField(root, 'Methadone doses a day (2 for every 12 hours, 3 for every 8 hours)', 'mlc-n', '');
    selectField(root, 'Tablet strength', 'mlc-tab', ML.TABLETS);
    numField(root, 'Parenteral methadone over 24 hours, mg (from parenteral methadone)', 'mlc-iv', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = ML.methadoneLabelConversion(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'er-opioid-label-start'(root) {
    const pairs = [['eos-product', 'product'], ['eos-med', 'morphineEquivalentMg'], ...EO.HYSINGLA_FACTORS.map((f) => [`eos-${f.name}`, f.arg])];
    selectField(root, 'Product', 'eos-product', EO.PRODUCTS);
    numField(root, 'Butrans or Belbuca: prior total daily dose, mg of oral morphine equivalents', 'eos-med', '');
    for (const f of EO.HYSINGLA_FACTORS) numField(root, `Hysingla ER: prior daily oral ${f.name}, mg`, `eos-${f.name}`, '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = EO.erOpioidLabelStart(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'buprenorphine-oud-product-switch'(root) {
    const pairs = [['bps-switch', 'switch'], ['bps-dose', 'dose'], ['bps-first', 'firstInjection']];
    selectField(root, 'Switch', 'bps-switch', BS.SWITCHES);
    numField(root, 'Current dose, mg of buprenorphine a day (or the Brixadi weekly or monthly dose)', 'bps-dose', '');
    dateField(root, 'Date of the first injection (optional)', 'bps-first');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = BS.buprenorphineOudProductSwitch(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'basal-insulin-switch'(root) {
    const pairs = [['bis-to', 'to'], ['bis-from', 'from'], ['bis-freq', 'frequency'], ['bis-units', 'totalUnits'], ['bis-pop', 'population'], ['bis-type', 'diabetesType'], ['bis-wt', 'weightKg'], ['bis-tdi', 'totalDailyInsulin']];
    selectField(root, 'Basal insulin being started', 'bis-to', BI.TARGETS);
    selectField(root, 'Basal insulin being stopped (or not on insulin)', 'bis-from', BI.SOURCES);
    selectField(root, 'Current basal insulin is taken', 'bis-freq', BI.FREQUENCIES);
    numField(root, 'Current total daily basal dose, units', 'bis-units', '');
    selectField(root, 'Patient (asked for Tresiba)', 'bis-pop', BI.POPULATIONS);
    // spec-v1633 tool 8, second mode: the insulin-naive start from section 2.3 of the same labels.
    selectField(root, 'Insulin-naive start: diabetes type', 'bis-type', BI.DIABETES_TYPES);
    numField(root, 'Insulin-naive start: weight, kg', 'bis-wt', '');
    numField(root, 'Insulin-naive type 1: total daily insulin, units', 'bis-tdi', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = BI.basalInsulinSwitch(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'taper-calendar'(root) {
    const pairs = [['tpc-class', 'drugClass'], ['tpc-duration', 'duration'], ['tpc-start', 'startDose'], ['tpc-unit', 'unit'], ['tpc-mode', 'mode'], ['tpc-reduction', 'reduction'], ['tpc-interval', 'intervalDays'], ['tpc-date', 'startDate'], ['tpc-smallest', 'smallestDose'], ['tpc-stop', 'stopTarget'], ['tpc-pauses', 'pauses'], ['tpc-mme', 'mmeFactor'], ['tpc-strengths', 'strengths']];
    selectField(root, 'Drug class', 'tpc-class', TC.CLASSES);
    selectField(root, 'Opioids: how long it has been taken', 'tpc-duration', TC.DURATIONS);
    numField(root, 'Starting daily dose', 'tpc-start', '');
    selectField(root, 'Dose unit', 'tpc-unit', TC.UNITS);
    selectField(root, 'How each step is taken', 'tpc-mode', TC.MODES);
    numField(root, 'Reduction per step (a percent, or the fixed amount)', 'tpc-reduction', '');
    numField(root, 'Days between steps', 'tpc-interval', '');
    dateField(root, 'Start date', 'tpc-date');
    numField(root, 'Smallest dose that can be dispensed (steps round down to multiples of it)', 'tpc-smallest', '');
    numField(root, 'Stop target dose (optional)', 'tpc-stop', '');
    areaField(root, 'Pauses (optional), one per line: the date the pause begins, a comma, its length in days', 'tpc-pauses', '');
    plainText(root, 'Tablet strengths stocked, mg (optional, for tablet counts)', 'tpc-strengths', 'e.g. 5, 10, 25');
    numField(root, 'Opioids: morphine-equivalent factor, to show each step in MME (optional)', 'tpc-mme', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = TC.taperCalendar(args, new Date());
      show(r, o);
      if (!r.valid) return;
      const withMme = r.rows[0].mme !== undefined;
      table(o, 'Schedule', ['Step', 'Date', `Daily dose (${r.unit})`, 'Change', ...(withMme ? ['MME'] : [])], r.rows.map((x) => [x.step === 0 ? 'Start' : x.step, x.date, x.dose, x.step === 0 ? '' : x.change, ...(withMme ? [x.mme] : [])]));
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'esa-conversion'(root) {
    const pairs = [['esa-target', 'target'], ['esa-current', 'current'], ['esa-pop', 'population'], ['esa-dose', 'weeklyDose'], ['esa-freq', 'epoetinFrequency'], ['esa-interval', 'mirceraInterval']];
    selectField(root, 'Product being started', 'esa-target', ES.TARGETS);
    selectField(root, 'Current ESA', 'esa-current', ES.CURRENT);
    selectField(root, 'Patient', 'esa-pop', ES.POPULATIONS);
    numField(root, 'Total weekly dose (epoetin alfa in units, darbepoetin alfa in mcg)', 'esa-dose', '');
    selectField(root, 'To Aranesp: how often the epoetin alfa is given', 'esa-freq', ES.EPOETIN_FREQUENCIES);
    selectField(root, 'To Mircera, adults: interval', 'esa-interval', ES.MIRCERA_INTERVALS);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = ES.esaConversion(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'iv-iron-course'(root) {
    const pairs = [['iic-regimen', 'regimen'], ['iic-weight', 'weightKg'], ['iic-hb', 'hb'], ['iic-desired', 'desiredHb'], ['iic-sex', 'sex'], ['iic-height', 'heightCm'], ['iic-loss', 'bloodLossMl'], ['iic-hct', 'hematocrit'], ['iic-start', 'startDate']];
    selectField(root, 'Product and indication', 'iic-regimen', IC.REGIMENS);
    numField(root, 'Weight, kg (Injectafer, Monoferric, pediatric Venofer, INFeD)', 'iic-weight', '');
    numField(root, 'Hemoglobin, g/dL (Injectafer in heart failure; INFeD: observed)', 'iic-hb', '');
    numField(root, 'INFeD: desired hemoglobin, g/dL (label normal: 14.8 above 15 kg, 12 at 15 kg or less)', 'iic-desired', '');
    selectField(root, 'INFeD above 15 kg: sex', 'iic-sex', IC.SEXES);
    numField(root, 'INFeD above 15 kg: height, cm', 'iic-height', '');
    numField(root, 'INFeD for blood loss: blood loss, mL', 'iic-loss', '');
    numField(root, 'INFeD for blood loss: hematocrit, %', 'iic-hct', '');
    dateField(root, 'Date of the first dose (optional)', 'iic-start');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = IC.ivIronCourse(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'lamotrigine-titration-calendar'(root) {
    const pairs = [['ltc-regimen', 'regimen'], ['ltc-comed', 'comed'], ['ltc-date', 'startDate'], ['ltc-weight', 'weightKg'], ['ltc-vpa', 'valproateDose']];
    selectField(root, 'Formulation and indication', 'ltc-regimen', LT.REGIMENS);
    selectField(root, 'Co-medication', 'ltc-comed', LT.COMEDS);
    dateField(root, 'Date of the first dose', 'ltc-date');
    numField(root, 'Weight, kg (ages 2 to 12)', 'ltc-weight', '');
    numField(root, 'Converting from valproate: current valproate dose, mg/day (Table 4)', 'ltc-vpa', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LT.lamotrigineTitrationCalendar(args, new Date());
      show(r, o);
      if (r.valid && r.rows) table(o, 'Escalation calendar', ['Weeks', 'From', 'To', 'Dose'], r.rows.map((x) => [x.weeks, x.from, x.to === null ? 'onward' : x.to, x.dose]));
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'label-titration-calendar'(root) {
    const pairs = [['lcal-preset', 'preset'], ['lcal-date', 'startDate'], ['lcal-weeks', 'weeksPerStep'], ['lcal-double', 'weeksToDouble'], ['lcal-ace', 'lastAceDose'], ['lcal-steps', 'steps'], ['lcal-strengths', 'strengths'], ['lcal-weight', 'weightKg'], ['lcal-start', 'startMg'], ['lcal-step', 'stepMg'], ['lcal-target', 'targetMg'], ['lcal-stepkg', 'stepMgKg'], ['lcal-targetkg', 'targetMgKg']];
    selectField(root, 'Schedule', 'lcal-preset', LC.PRESETS);
    dateField(root, 'Start date', 'lcal-date');
    numField(root, 'Weeks at each step (memantine: at least 1; topiramate, ages 2 to 16: 1 or 2)', 'lcal-weeks', '');
    // The label names the range in its text, so the control enforces it (min and max), like every other.
    const dbl = numField(root, 'Sacubitril/valsartan: weeks before the dose is doubled (2 to 4)', 'lcal-double', '').querySelector('input');
    dbl.min = '2'; dbl.max = '4'; dbl.step = '1';
    dateField(root, 'Sacubitril/valsartan: last ACE-inhibitor dose (optional)', 'lcal-ace', 'datetime-local');
    numField(root, 'Pediatric schedules: weight, kg', 'lcal-weight', '');
    { const i = numField(root, 'Topiramate adjunctive, adults: starting dose, mg/day (25 to 50)', 'lcal-start', '').querySelector('input'); i.min = '25'; i.max = '50'; }
    { const i = numField(root, 'Topiramate adjunctive, adults: weekly increment, mg/day (25 to 50)', 'lcal-step', '').querySelector('input'); i.min = '25'; i.max = '50'; }
    numField(root, 'Topiramate adjunctive, adults: target dose, mg/day', 'lcal-target', '');
    { const i = numField(root, 'Topiramate adjunctive, ages 2 to 16: increment, mg/kg/day (1 to 3)', 'lcal-stepkg', '').querySelector('input'); i.min = '1'; i.max = '3'; }
    { const i = numField(root, 'Topiramate adjunctive, ages 2 to 16: target, mg/kg/day (5 to 9)', 'lcal-targetkg', '').querySelector('input'); i.min = '5'; i.max = '9'; }
    areaField(root, 'My own steps, one per line: dose in mg, times a day, days', 'lcal-steps', '');
    plainText(root, 'Own steps: tablet strengths stocked, mg (optional, for tablet counts)', 'lcal-strengths', 'e.g. 25, 50, 100');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LC.labelTitrationCalendar(args, new Date());
      show(r, o);
      if (r.valid && r.rows) table(o, 'Schedule', ['Step', 'From', 'To', 'Dose'], r.rows.map((x) => [x.step, x.from, x.to === null ? 'onward' : x.to, x.dose]));
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'aed-formulation-switch'(root) {
    const pairs = [['afs-switch', 'switch'], ['afs-dose', 'dailyDose']];
    selectField(root, 'Drug and switch', 'afs-switch', AF.SWITCHES);
    numField(root, 'Current total daily dose, mg (phenytoin to fosphenytoin: mg PE)', 'afs-dose', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AF.aedFormulationSwitch(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'transplant-formulation-switch'(root) {
    const pairs = [['tfs-switch', 'switch'], ['tfs-dose', 'dailyDose']];
    selectField(root, 'Drug and switch', 'tfs-switch', TF.SWITCHES);
    numField(root, 'Current total daily dose, mg', 'tfs-dose', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = TF.transplantFormulationSwitch(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'label-formulation-switch'(root) {
    const pairs = [['lfs-switch', 'switch'], ['lfs-dose', 'dose']];
    selectField(root, 'Drug and switch', 'lfs-switch', LF.SWITCHES);
    numField(root, 'Current dose (digoxin in mcg; carvedilol and methylphenidate: the mg taken at each administration; diuretics in mg)', 'lfs-dose', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LF.labelFormulationSwitch(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'levothyroxine-start-dose'(root) {
    const pairs = [['lsd-group', 'group'], ['lsd-weight', 'weightKg'], ['lsd-hyper', 'hyperactivityRisk']];
    selectField(root, 'Patient group', 'lsd-group', LX.GROUPS);
    numField(root, 'Weight, kg', 'lsd-weight', '');
    selectField(root, 'Children: at risk for hyperactivity', 'lsd-hyper', LX.YES_NO);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LX.levothyroxineStartDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'lai-antipsychotic-start'(root) {
    const pairs = [['las-product', 'product'], ['las-dose', 'dose'], ['las-date', 'startDate']];
    selectField(root, 'Product and start', 'las-product', LA.PRODUCTS);
    numField(root, 'Current dose: oral mg a day (Sustenna, Aristada), or the last Sustenna dose in mg (Trinza)', 'las-dose', '');
    dateField(root, 'Date of the first injection; for Trinza, the date the next monthly dose is due (optional)', 'las-date');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LA.laiAntipsychoticStart(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'vitamin-iu-converter'(root) {
    const pairs = [['viu-quantity', 'quantity'], ['viu-direction', 'direction'], ['viu-amount', 'amount'], ['viu-amount2', 'amount2']];
    selectField(root, 'Vitamin and form', 'viu-quantity', VI.QUANTITIES);
    selectField(root, 'Direction (vitamins A, D and E)', 'viu-direction', VI.DIRECTIONS);
    numField(root, 'Amount (IU or metric; folate: mcg of food folate; niacin: mg of niacin)', 'viu-amount', '');
    numField(root, 'Folate: mcg of folic acid. Niacin: mg of tryptophan', 'viu-amount2', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = VI.vitaminIuConverter(args);
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'ppi-omeprazole-equivalent'(root) {
    const pairs = [['poe-ppi', 'ppi'], ['poe-dose', 'dailyDose'], ['poe-target', 'target']];
    selectField(root, 'Proton-pump inhibitor', 'poe-ppi', PP.PPIS);
    numField(root, 'Daily dose, mg', 'poe-dose', '');
    selectField(root, 'Target drug (optional)', 'poe-target', PP.PPIS);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PP.ppiOmeprazoleEquivalent(args);
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'antidepressant-fluoxetine-equivalent'(root) {
    const pairs = [['afe-drug', 'drug'], ['afe-dose', 'dailyDose']];
    selectField(root, 'Antidepressant', 'afe-drug', AE.DRUGS);
    numField(root, 'Daily dose, mg', 'afe-dose', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AE.antidepressantFluoxetineEquivalent(args);
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'statin-ldl-reduction'(root) {
    const pairs = [['slr-statin', 'statin'], ['slr-dose', 'dose'], ['slr-ldl', 'baselineLdl']];
    selectField(root, 'Statin', 'slr-statin', SL.STATINS);
    numField(root, 'Daily dose, mg', 'slr-dose', '');
    numField(root, 'Baseline LDL-C, mg/dL (optional)', 'slr-ldl', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = SL.statinLdlReduction(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'levodopa-equivalent-dose'(root) {
    const pairs = [...LE.DRUGS.map((d) => [`led-${d.dom}`, d.arg]), ['led-comt', 'comt'], ['led-comt-covered', 'comtCoveredLed'], ['led-istradefylline', 'istradefylline'], ['led-safinamide', 'safinamide'], ['led-zonisamide', 'zonisamide'], ['led-anticholinergic', 'anticholinergicDoses']];
    root.appendChild(el('p', { text: 'Enter the total daily dose in mg of each drug taken; leave the rest blank.' }));
    for (const d of LE.DRUGS) numField(root, d.text, `led-${d.dom}`, '');
    selectField(root, 'COMT inhibitor (blank means none)', 'led-comt', LE.COMT);
    numField(root, 'Entacapone or tolcapone: mg a day of levodopa equivalent taken within its effect (4 hours after entacapone 200 mg, 8 hours after tolcapone 100 mg)', 'led-comt-covered', '');
    selectField(root, 'Istradefylline', 'led-istradefylline', LE.YES_NO);
    selectField(root, 'Safinamide 50 or 100 mg a day', 'led-safinamide', LE.YES_NO);
    selectField(root, 'Zonisamide 25 or 50 mg a day', 'led-zonisamide', LE.YES_NO);
    numField(root, 'Anticholinergic: single doses a day that improve the UPDRS-III total by at least 5 points', 'led-anticholinergic', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = LE.levodopaEquivalentDose(args);
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'hf-gdmt-target-percent'(root) {
    const pairs = HG.DRUGS.map((d) => [`hgt-${d.dom}`, d.arg]);
    root.appendChild(el('p', { text: 'Enter the total daily dose in mg of each drug taken; leave the rest blank.' }));
    for (const d of HG.DRUGS) numField(root, d.entered ? `${d.text}: ${d.entered}` : d.text, `hgt-${d.dom}`, '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HG.hfGdmtTargetPercent(args);
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
};
