// spec-v1636: hospital pharmacy operations: label antidote and emergency dosing, stewardship metrics,
// department measurement.
// nac-oral-regimen, fomepizole-schedule, dantrolene-mh-vials,
// flumazenil-ladder, neostigmine-reversal-dose, deferoxamine-acute-iron,
// us-antivenom-dose, thrombolytic-dose, pralidoxime-dose, rsi-dose-sheet,
// botulism-antitoxin-dose, passive-immunization-dose,
// au-rate-saar, cdi-labid-category, ddd-rate, med-admin-window, adjusted-patient-days,
// chelation-dose, antimicrobial-day-counter, antibiogram-builder.

import { el, clear } from '../lib/dom.js';
import { uploadWorkbench } from './upload-workbench.js';
import { acceptVia } from '../lib/hand-off.js';
import { BATCH_TOOLS } from '../lib/batch-tools.js';
import { resultRow } from '../lib/result-copy.js';
import * as NR from '../lib/nac-oral-regimen-v1636.js';
import * as FO from '../lib/fomepizole-schedule-v1636.js';
import * as DM from '../lib/dantrolene-mh-vials-v1636.js';
import * as FL from '../lib/flumazenil-ladder-v1636.js';
import * as NS from '../lib/neostigmine-reversal-dose-v1636.js';
import * as DF from '../lib/deferoxamine-acute-iron-v1636.js';
import * as AV from '../lib/us-antivenom-dose-v1636.js';
import * as TD from '../lib/thrombolytic-dose-v1636.js';
import * as PX from '../lib/pralidoxime-dose-v1636.js';
import * as RS from '../lib/rsi-dose-sheet-v1636.js';
import * as BA from '../lib/botulism-antitoxin-dose-v1636.js';
import * as PI from '../lib/passive-immunization-dose-v1636.js';
import * as AU from '../lib/au-rate-saar-v1636.js';
import * as CL from '../lib/cdi-labid-category-v1636.js';
import * as DD from '../lib/ddd-rate-v1636.js';
import * as MW from '../lib/med-admin-window-v1636.js';
import * as AP from '../lib/adjusted-patient-days-v1636.js';
import * as CH from '../lib/chelation-dose-v1636.js';
import * as DC from '../lib/antimicrobial-day-counter-v1636.js';
import * as AB from '../lib/antibiogram-builder-v1636.js';

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
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '3', placeholder }));
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
  'nac-oral-regimen'(root) {
    const pairs = [['nor-weight', 'weight'], ['nor-strength', 'strength'], ['nor-load', 'loadTime']];
    numField(root, 'Weight, kg', 'nor-weight', '');
    selectField(root, 'Solution strength', 'nor-strength', NR.STRENGTHS);
    dateField(root, 'Time of the loading dose (optional, for the dose clock)', 'nor-load', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = NR.nacOralRegimen(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'fomepizole-schedule'(root) {
    const pairs = [['fms-weight', 'weight'], ['fms-given', 'dosesGiven'], ['fms-dialysis', 'dialysis'], ['fms-last', 'lastDoseTime'], ['fms-dial', 'dialysisTime']];
    numField(root, 'Weight, kg', 'fms-weight', '');
    numField(root, 'Doses given so far, counting the loading dose (0 if none)', 'fms-given', '');
    selectField(root, 'Hemodialysis', 'fms-dialysis', FO.DIALYSIS);
    dateField(root, 'Time of the last dose (needed once a dose is given)', 'fms-last', 'datetime-local');
    dateField(root, 'Time hemodialysis started or ended', 'fms-dial', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = FO.fomepizoleSchedule(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'dantrolene-mh-vials'(root) {
    const pairs = [['dmv-weight', 'weight'], ['dmv-product', 'product'], ['dmv-use', 'use'], ['dmv-dose', 'dosePerKg'], ['dmv-given', 'cumulativeGiven']];
    numField(root, 'Weight, kg', 'dmv-weight', '');
    selectField(root, 'Product', 'dmv-product', DM.PRODUCTS);
    selectField(root, 'Use', 'dmv-use', DM.USES);
    numField(root, 'Treatment: dose for this bolus, mg/kg', 'dmv-dose', '');
    numField(root, 'Treatment: dantrolene already given in this crisis, mg (0 if none)', 'dmv-given', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DM.dantroleneMhVials(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'flumazenil-ladder'(root) {
    const pairs = [['fzl-indication', 'indication'], ['fzl-patient', 'patient'], ['fzl-given', 'dosesGiven'], ['fzl-weight', 'weight']];
    selectField(root, 'Indication', 'fzl-indication', FL.INDICATIONS);
    selectField(root, 'Patient', 'fzl-patient', FL.PATIENTS);
    numField(root, 'Doses given so far in this series (0 before the first)', 'fzl-given', '');
    numField(root, 'Weight, kg (needed for a pediatric patient)', 'fzl-weight', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = FL.flumazenilLadder(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'neostigmine-reversal-dose'(root) {
    const pairs = [['nrd-weight', 'weight'], ['nrd-twitch', 'twitch'], ['nrd-half-life', 'halfLife'], ['nrd-conc', 'concentration'], ['nrd-prior', 'priorDose']];
    numField(root, 'Weight, kg', 'nrd-weight', '');
    selectField(root, 'Train-of-four response', 'nrd-twitch', NS.TWITCH);
    selectField(root, 'Half-life class of the blocker', 'nrd-half-life', NS.HALF_LIFE);
    selectField(root, 'Concentration', 'nrd-conc', NS.CONCENTRATIONS);
    numField(root, 'Neostigmine already given, mg (optional)', 'nrd-prior', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = NS.neostigmineReversalDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'deferoxamine-acute-iron'(root) {
    const pairs = [['dai-weight', 'weight'], ['dai-route', 'route'], ['dai-given', 'givenLast24h']];
    numField(root, 'Weight, kg', 'dai-weight', '');
    selectField(root, 'Route', 'dai-route', DF.ROUTES);
    numField(root, 'Deferoxamine given in the last 24 hours, mg (0 if none)', 'dai-given', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DF.deferoxamineAcuteIron(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'us-antivenom-dose'(root) {
    const pairs = [['uad-product', 'product'], ['uad-dose', 'dose'], ['uad-vials', 'vials'], ['uad-before', 'vialsBefore'], ['uad-control', 'controlTime']];
    selectField(root, 'Product', 'uad-product', AV.PRODUCTS);
    selectField(root, 'Which dose this is', 'uad-dose', AV.DOSES);
    numField(root, 'Vials in this dose (CroFab initial or further dose, where the label gives a range)', 'uad-vials', '');
    numField(root, 'Vials given before this dose (optional)', 'uad-before', '');
    dateField(root, 'Time initial control was achieved (optional)', 'uad-control', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AV.usAntivenomDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'thrombolytic-dose'(root) {
    const pairs = [['thd-regimen', 'regimen'], ['thd-weight', 'weight'], ['thd-lumen', 'lumenVolume']];
    selectField(root, 'Drug and indication', 'thd-regimen', TD.REGIMENS);
    numField(root, 'Weight, kg (not needed for pulmonary embolism)', 'thd-weight', '');
    numField(root, 'Cathflo under 30 kg: internal lumen volume of the catheter, mL', 'thd-lumen', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = TD.thrombolyticDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'pralidoxime-dose'(root) {
    const pairs = [['pxd-patient', 'patient'], ['pxd-route', 'route'], ['pxd-severity', 'severity'], ['pxd-weight', 'weight']];
    selectField(root, 'Patient', 'pxd-patient', PX.PATIENTS);
    selectField(root, 'Route or product', 'pxd-route', PX.ROUTES);
    selectField(root, 'Severity (intramuscular and DuoDote)', 'pxd-severity', PX.SEVERITIES);
    numField(root, 'Weight, kg (pediatric patients, and DuoDote)', 'pxd-weight', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PX.pralidoximeDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'rsi-dose-sheet'(root) {
    const pairs = [['rds-weight', 'weight'], ['rds-age', 'age'], ['rds-patient', 'patient'], ['rds-ketamine', 'ketamineConcentration']];
    numField(root, 'Weight, kg', 'rds-weight', '');
    numField(root, 'Age, years', 'rds-age', '');
    selectField(root, 'Patient group', 'rds-patient', RS.PATIENTS);
    selectField(root, 'Ketamine concentration in hand', 'rds-ketamine', RS.KETAMINE);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = RS.rsiDoseSheet(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'botulism-antitoxin-dose'(root) {
    const pairs = [['bad-product', 'product'], ['bad-age', 'age'], ['bad-weight', 'weight']];
    selectField(root, 'Product', 'bad-product', BA.PRODUCTS);
    numField(root, 'Age, years (a fraction for an infant: 6 months is 0.5)', 'bad-age', '');
    numField(root, 'Weight, kg (needed under 17 years, and for BabyBIG)', 'bad-weight', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = BA.botulismAntitoxinDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'passive-immunization-dose'(root) {
    const pairs = [['pid-product', 'product'], ['pid-weight', 'weight'], ['pid-age', 'age']];
    selectField(root, 'Product and situation', 'pid-product', PI.PRODUCTS);
    numField(root, 'Weight, kg (hepatitis B after exposure, VARIZIG, and tetanus under 7 years)', 'pid-weight', '');
    numField(root, 'Age, years (tetanus immune globulin)', 'pid-age', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PI.passiveImmunizationDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'au-rate-saar'(root) {
    const pairs = [['aur-scope', 'scope'], ['aur-days', 'antimicrobialDays'], ['aur-present', 'daysPresent'], ['aur-admissions', 'admissions'], ['aur-predicted', 'predictedDays']];
    selectField(root, 'Scope', 'aur-scope', AU.SCOPES);
    numField(root, 'Antimicrobial days', 'aur-days', '');
    numField(root, 'Days present', 'aur-present', '');
    numField(root, 'Admissions (facility-wide inpatient only; optional)', 'aur-admissions', '');
    numField(root, 'Predicted antimicrobial days from the NHSN report (optional, for the SAAR)', 'aur-predicted', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AU.auRateSaar(args), o);
    }));
  },
  'cdi-labid-category'(root) {
    const pairs = [['clc-specimen', 'specimenDate'], ['clc-location', 'location'], ['clc-admission', 'admissionDate'], ['clc-discharge-had', 'priorDischarge'], ['clc-discharge', 'dischargeDate'], ['clc-prior-had', 'priorPositive'], ['clc-prior', 'priorPositiveDate'], ['clc-events', 'events'], ['clc-days', 'patientDays']];
    dateField(root, 'Specimen collection date', 'clc-specimen');
    selectField(root, 'Where the specimen was collected', 'clc-location', CL.LOCATIONS);
    dateField(root, 'Admission date (inpatient specimens)', 'clc-admission');
    selectField(root, 'Earlier inpatient discharge from this facility', 'clc-discharge-had', CL.DISCHARGES);
    dateField(root, 'Date of that discharge', 'clc-discharge');
    selectField(root, 'Previous C. difficile positive', 'clc-prior-had', CL.PRIORS);
    dateField(root, 'Collection date of the most recent previous positive', 'clc-prior');
    numField(root, 'Rate panel: number of events (optional)', 'clc-events', '');
    numField(root, 'Rate panel: patient days (optional)', 'clc-days', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(CL.cdiLabidCategory(args), o);
    }));
  },
  'ddd-rate'(root) {
    const pairs = [['ddr-grams', 'gramsUsed'], ['ddr-ddd', 'ddd'], ['ddr-bed-days', 'bedDays'], ['ddr-year', 'indexYear']];
    numField(root, 'Grams used in the period', 'ddr-grams', '');
    numField(root, 'DDD of the agent in grams, from the WHO index', 'ddr-ddd', '');
    numField(root, 'Bed-days (or patient-days) in the period', 'ddr-bed-days', '');
    numField(root, 'Year of the index the DDD came from (optional)', 'ddr-year', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DD.dddRate(args), o);
    }));
  },
  'med-admin-window'(root) {
    const pairs = [['maw-scheduled', 'scheduled'], ['maw-actual', 'actual'], ['maw-frequency', 'frequency'], ['maw-class', 'policyClass'], ['maw-policy', 'policyMinutes']];
    dateField(root, 'Scheduled time', 'maw-scheduled', 'datetime-local');
    dateField(root, 'Time the dose was given', 'maw-actual', 'datetime-local');
    selectField(root, 'Frequency of the order', 'maw-frequency', MW.FREQUENCIES);
    selectField(root, 'Class under the hospital\'s policy', 'maw-class', MW.CLASSES);
    numField(root, 'A tighter hospital window, minutes each side (optional)', 'maw-policy', '');
    const o = out();
    const formArgs = () => { const args = {}; for (const [dom, arg] of pairs) args[arg] = val(dom); return args; };
    // spec-v1636 tool 20, file mode: a medication administration export, each dose through medAdminWindow,
    // then the on-time rate by class. A blank frequency or class cell takes the form's answer.
    const upload = uploadWorkbench(root, {
      id: 'maw-upload', fields: BATCH_TOOLS['med-admin-window'].fields, label: 'Check doses from a file',
      compute: 'med-admin-window', getInput: formArgs, onResult: (r) => safe(o, () => show(r, o)),
    });
    root.appendChild(o);
    wire(pairs.map(([d]) => d), () => {
      if (upload.isActive()) upload.compute(formArgs());
      else safe(o, () => show(MW.medAdminWindow(formArgs()), o));
    });
  },
  'adjusted-patient-days'(root) {
    const pairs = [['apd-days', 'inpatientDays'], ['apd-inpatient', 'inpatientRevenue'], ['apd-outpatient', 'outpatientRevenue'], ['apd-hours', 'workedHours'], ['apd-drugs', 'drugExpense']];
    numField(root, 'Inpatient days', 'apd-days', '');
    numField(root, 'Gross inpatient revenue, dollars', 'apd-inpatient', '');
    numField(root, 'Gross outpatient revenue, dollars', 'apd-outpatient', '');
    numField(root, 'Pharmacy worked hours (optional)', 'apd-hours', '');
    numField(root, 'Drug expense, dollars (optional)', 'apd-drugs', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(AP.adjustedPatientDays(args), o);
    }));
  },
  'chelation-dose'(root) {
    const pairs = [['chd-regimen', 'regimen'], ['chd-weight', 'weight'], ['chd-bsa', 'bsa'], ['chd-cr', 'creatinine'], ['chd-start', 'start']];
    selectField(root, 'Agent and poisoning', 'chd-regimen', CH.REGIMENS);
    numField(root, 'Weight, kg (succimer and dimercaprol)', 'chd-weight', '');
    numField(root, 'Body surface area, m² (edetate calcium disodium)', 'chd-bsa', '');
    numField(root, 'Serum creatinine, mg/dL (edetate, lead nephropathy)', 'chd-cr', '');
    dateField(root, 'First dose (optional, for the dose calendar)', 'chd-start', 'datetime-local');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CH.chelationDose(args, new Date());
      show(r, o);
      if (r.labelUrl) { const p = el('p'); p.appendChild(el('a', { href: r.labelUrl, target: '_blank', rel: 'noreferrer', text: 'Current label on DailyMed' })); o.appendChild(p); }
    }));
  },
  'antimicrobial-day-counter'(root) {
    const pairs = [['adc-admins', 'administrations'], ['adc-stays', 'stays'], ['adc-out', 'outpatientLocations']];
    // Rows carry patient references: kept out of the shareable link.
    areaField(root, 'Administrations, one per line: patient, agent, route, date (YYYY-MM-DD, a time may follow), location', 'adc-admins', 'A, Vancomycin, IV, 2025-12-01 07:00, MICU').querySelector('textarea').setAttribute('data-private', '');
    // Rows carry patient references: kept out of the shareable link.
    areaField(root, 'Stays, one per line: patient, location, date in, date out', 'adc-stays', 'A, MICU, 2025-11-30, 2025-12-01').querySelector('textarea').setAttribute('data-private', '');
    areaField(root, 'Locations to leave out of the facility-wide counts (emergency department, 24-hour observation), separated by commas', 'adc-out', 'ED');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(DC.antimicrobialDayCounter(args), o);
    }));
  },
  'antibiogram-builder'(root) {
    const pairs = [['abg-isolates', 'isolates'], ['abg-from', 'from'], ['abg-to', 'to']];
    // Rows carry patient references: kept out of the shareable link.
    areaField(root, 'Isolates, with a header row: patient, organism, date, then one column per agent holding S, I or R. A status column (final) and a purpose column (surveillance) are read if present.', 'abg-isolates', 'patient,organism,date,status,purpose,Ceftriaxone\nA,Escherichia coli,2026-03-10,final,diagnostic,S').querySelector('textarea').setAttribute('data-private', '');
    // spec-v1636 tool 18: the isolate list from a file, header row and all (the builder reads it by name).
    const pick = el('p');
    pick.appendChild(el('label', { for: 'abg-file', text: 'Or load the isolate list from a file (CSV)' }));
    pick.appendChild(el('br'));
    const abgFile = el('input', { id: 'abg-file', type: 'file', accept: '.csv,.tsv,.txt,text/csv,text/plain' });
    pick.appendChild(abgFile);
    root.appendChild(pick);
    abgFile.addEventListener('change', async () => {
      const f = abgFile.files && abgFile.files[0];
      if (!f || f.size > 5000000) return;
      const box = document.getElementById('abg-isolates');
      box.value = await f.text();
      box.dispatchEvent(new Event('input', { bubbles: true }));
    });
    dateField(root, 'First day of the period (optional)', 'abg-from');
    dateField(root, 'Last day of the period (optional)', 'abg-to');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AB.antibiogramBuilder(args);
      show(r, o);
      if (r.valid) {
        const wrap = el('p');
        wrap.appendChild(el('label', { for: 'abg-csv', text: 'The table as CSV' }));
        wrap.appendChild(el('br'));
        const box = el('textarea', { id: 'abg-csv', rows: '6', readonly: 'readonly' });
        box.value = r.csv;
        wrap.appendChild(box);
        o.appendChild(wrap);
      }
    }));
  },
};

// spec-v1636 tool 20: a doses file with scheduled and given times goes to the administration-window batch.
export const acceptFiles = {
  'med-admin-window': acceptVia('maw-upload-file'),
  'antibiogram-builder': acceptVia('abg-file'),
};
