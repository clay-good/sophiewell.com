// spec-v1633: conversions, switches, titrations and tapers, each as its label or paper states it.
// anticoag-switch-clock, doac-periprocedural-timing, fentanyl-patch-initial-dose,
// methadone-label-conversion, er-opioid-label-start, buprenorphine-oud-product-switch,
// basal-insulin-switch, taper-calendar, esa-conversion, iv-iron-course,
// lamotrigine-titration-calendar, label-titration-calendar.

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
    const pairs = [['bis-to', 'to'], ['bis-from', 'from'], ['bis-freq', 'frequency'], ['bis-units', 'totalUnits'], ['bis-pop', 'population']];
    selectField(root, 'Basal insulin being started', 'bis-to', BI.TARGETS);
    selectField(root, 'Basal insulin being stopped', 'bis-from', BI.SOURCES);
    selectField(root, 'Current basal insulin is taken', 'bis-freq', BI.FREQUENCIES);
    numField(root, 'Current total daily basal dose, units', 'bis-units', '');
    selectField(root, 'Patient (asked for Tresiba)', 'bis-pop', BI.POPULATIONS);
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
    const pairs = [['tpc-class', 'drugClass'], ['tpc-duration', 'duration'], ['tpc-start', 'startDose'], ['tpc-unit', 'unit'], ['tpc-mode', 'mode'], ['tpc-reduction', 'reduction'], ['tpc-interval', 'intervalDays'], ['tpc-date', 'startDate'], ['tpc-smallest', 'smallestDose'], ['tpc-stop', 'stopTarget'], ['tpc-pauses', 'pauses'], ['tpc-mme', 'mmeFactor']];
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
    const pairs = [['ltc-regimen', 'regimen'], ['ltc-comed', 'comed'], ['ltc-date', 'startDate'], ['ltc-weight', 'weightKg']];
    selectField(root, 'Formulation and indication', 'ltc-regimen', LT.REGIMENS);
    selectField(root, 'Co-medication', 'ltc-comed', LT.COMEDS);
    dateField(root, 'Date of the first dose', 'ltc-date');
    numField(root, 'Weight, kg (ages 2 to 12)', 'ltc-weight', '');
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
    const pairs = [['lcal-preset', 'preset'], ['lcal-date', 'startDate'], ['lcal-weeks', 'weeksPerStep'], ['lcal-double', 'weeksToDouble'], ['lcal-ace', 'lastAceDose'], ['lcal-steps', 'steps']];
    selectField(root, 'Schedule', 'lcal-preset', LC.PRESETS);
    dateField(root, 'Start date', 'lcal-date');
    numField(root, 'Memantine: weeks at each step (the label\'s minimum is 1)', 'lcal-weeks', '');
    numField(root, 'Sacubitril/valsartan: weeks before the dose is doubled (2 to 4)', 'lcal-double', '');
    dateField(root, 'Sacubitril/valsartan: last ACE-inhibitor dose (optional)', 'lcal-ace', 'datetime-local');
    areaField(root, 'My own steps, one per line: dose in mg, times a day, days', 'lcal-steps', '');
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
};
