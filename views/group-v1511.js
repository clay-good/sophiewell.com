// spec-v1511: renderers for the dispensing tools.

import { el, clear } from '../lib/dom.js';
import * as CS from '../lib/cs-dispensing-v1511.js';
import * as DS from '../lib/days-supply-v1511.js';
import * as CBU from '../lib/compounding-bud-v1511.js';
import * as IP from '../lib/ipledge-v1511.js';
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
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function dateInput(root, label, id, type) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
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

export const renderers = {
  'cs-refill-validity'(root) {
    const pairs = [['csr-schedule', 'schedule'], ['csr-issued', 'issued'], ['csr-check', 'checkDate'], ['csr-auth', 'authorized'], ['csr-done', 'dispensed']];
    selectField(root, 'Schedule', 'csr-schedule', CS.SCHEDULES);
    dateInput(root, 'Date the prescription was issued', 'csr-issued', 'date');
    dateInput(root, 'Date of the fill being checked', 'csr-check', 'date');
    numField(root, 'Refills authorized', 'csr-auth', 'e.g. 5', '99', '1');
    numField(root, 'Refills already dispensed', 'csr-done', 'e.g. 2', '99', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CS.csRefillValidity(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Refills', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'c2-fill-deadlines'(root) {
    const pairs = [['c2f-case', 'case'], ['c2f-start', 'start']];
    selectField(root, 'Which case applies', 'c2f-case', CS.C2_CASES);
    dateInput(root, 'Partial fill, date written, issue or authorization (date and time)', 'c2f-start', 'datetime-local');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CS.c2FillDeadlines(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'c2-multiple-rx-series'(root) {
    const pairs = [['c2m-issued', 'issued'], ['c2m-d1', 'rx1Days'], ['c2m-e1', 'rx1Earliest'], ['c2m-d2', 'rx2Days'], ['c2m-e2', 'rx2Earliest'], ['c2m-d3', 'rx3Days'], ['c2m-e3', 'rx3Earliest']];
    dateInput(root, 'Date the prescriptions were issued', 'c2m-issued', 'date');
    numField(root, 'Prescription 1: days supply', 'c2m-d1', 'e.g. 30', '90', '1');
    dateInput(root, 'Prescription 1: earliest fill date (blank to fill at once)', 'c2m-e1', 'date');
    numField(root, 'Prescription 2: days supply', 'c2m-d2', 'e.g. 30', '90', '1');
    dateInput(root, 'Prescription 2: earliest fill date', 'c2m-e2', 'date');
    numField(root, 'Prescription 3: days supply', 'c2m-d3', 'e.g. 30', '90', '1');
    dateInput(root, 'Prescription 3: earliest fill date', 'c2m-e3', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CS.c2MultipleRxSeries(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Series', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'days-supply'(root) {
    const pairs = [['ds-form', 'form'], ['ds-qty', 'quantity'], ['ds-perdose', 'perDose'], ['ds-vol', 'volume'], ['ds-doseml', 'doseMl'], ['ds-upml', 'unitsPerMl'], ['ds-mlpen', 'mlPerPen'], ['ds-pens', 'pens'], ['ds-uday', 'unitsPerDay'], ['ds-inj', 'injectionsPerDay'], ['ds-prime', 'primingUnits'], ['ds-act', 'actuations'], ['ds-can', 'canisters'], ['ds-puffs', 'puffsPerDose'], ['ds-dpm', 'dropsPerMl'], ['ds-dpe', 'dropsPerEye'], ['ds-eyes', 'eyes'], ['ds-dpd', 'dosesPerDay'], ['ds-discard', 'discardDays']];
    selectField(root, 'Dosage form', 'ds-form', DS.FORMS);
    numField(root, 'Tablets or capsules: quantity dispensed', 'ds-qty', 'e.g. 60', '100000', 'any');
    numField(root, 'Tablets or capsules: units per dose', 'ds-perdose', 'e.g. 1', '1000', 'any');
    numField(root, 'Liquid or drops: volume dispensed (mL)', 'ds-vol', 'e.g. 5', '100000', 'any');
    numField(root, 'Liquid: dose volume (mL)', 'ds-doseml', 'e.g. 5', '1000', 'any');
    numField(root, 'Insulin: units per mL', 'ds-upml', 'e.g. 100', '1000', 'any');
    numField(root, 'Insulin: mL per pen or vial', 'ds-mlpen', 'e.g. 3', '100', 'any');
    numField(root, 'Insulin: pens or vials dispensed', 'ds-pens', 'e.g. 5', '1000', '1');
    numField(root, 'Insulin: units injected per day', 'ds-uday', 'e.g. 40', '10000', 'any');
    numField(root, 'Insulin: injections per day', 'ds-inj', 'e.g. 2', '48', '1');
    numField(root, 'Insulin: priming units per injection (from the label)', 'ds-prime', 'e.g. 2', '20', 'any');
    numField(root, 'Inhaler: actuations per canister', 'ds-act', 'e.g. 200', '10000', '1');
    numField(root, 'Inhaler: canisters dispensed', 'ds-can', 'e.g. 1', '100', '1');
    numField(root, 'Inhaler: puffs per dose', 'ds-puffs', 'e.g. 2', '50', '1');
    numField(root, 'Drops: drops per mL (manufacturer or plan figure)', 'ds-dpm', 'e.g. 20', '100', 'any');
    numField(root, 'Drops: drops per eye per dose', 'ds-dpe', 'e.g. 1', '20', '1');
    numField(root, 'Drops: eyes treated', 'ds-eyes', 'e.g. 2', '2', '1');
    numField(root, 'Doses per day (all forms but insulin)', 'ds-dpd', 'e.g. 2', '48', 'any');
    numField(root, 'In-use discard limit in days, if the label gives one', 'ds-discard', 'e.g. 28', '3650', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DS.daysSupply(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Days supply', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'refill-eligible-date'(root) {
    const pairs = [['rf-fill', 'fillDate'], ['rf-days', 'daysSupply'], ['rf-pct', 'threshold'], ['rf-eye', 'eyeDrops']];
    dateInput(root, 'Date of the last fill', 'rf-fill', 'date');
    numField(root, 'Days supply of that fill', 'rf-days', 'e.g. 30', '366', '1');
    numField(root, 'Plan refill threshold (percent)', 'rf-pct', 'e.g. 75', '100', 'any');
    selectField(root, 'Eye drops (use the CMS 70% recommendation if no threshold)?', 'rf-eye', DS.YES_NO);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DS.refillEligibleDate(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Earliest refill', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'compounding-bud'(root) {
    const pairs = [['cbud-type', 'prepType'], ['cbud-made', 'compounded'], ['cbud-cat', 'category'], ['cbud-method', 'method'], ['cbud-tested', 'sterilityTested'], ['cbud-nonsterile', 'nonsterileComponent'], ['cbud-store', 'storage'], ['cbud-form', 'form'], ['cbud-exp', 'componentExpiry']];
    selectField(root, 'Sterile or nonsterile', 'cbud-type', CBU.PREP_TYPES);
    dateInput(root, 'Compounded, date and time', 'cbud-made', 'datetime-local');
    selectField(root, 'Sterile: USP <797> category', 'cbud-cat', CBU.CATEGORIES);
    selectField(root, 'Sterile: method', 'cbud-method', CBU.METHODS);
    selectField(root, 'Sterile: passed sterility testing?', 'cbud-tested', CBU.YES_NO);
    selectField(root, 'Sterile: any nonsterile starting component?', 'cbud-nonsterile', CBU.YES_NO);
    selectField(root, 'Sterile: storage', 'cbud-store', CBU.STORAGE);
    selectField(root, 'Nonsterile: dosage form and water activity', 'cbud-form', CBU.FORMS);
    dateInput(root, 'Earliest component expiration date (optional)', 'cbud-exp', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CBU.compoundingBud(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'BUD', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'ipledge-dispense-window'(root) {
    const pairs = [['ipl-can', 'canGetPregnant'], ['ipl-start', 'startDate'], ['ipl-first', 'firstPrescription'], ['ipl-check', 'checkDate']];
    selectField(root, 'Can the patient get pregnant?', 'ipl-can', IP.YES_NO);
    dateInput(root, 'Pregnancy test specimen collection date (or office visit date, if the patient cannot get pregnant)', 'ipl-start', 'date');
    selectField(root, 'First prescription of the course? (optional)', 'ipl-first', IP.YES_NO);
    dateInput(root, 'Date to check (blank for today)', 'ipl-check', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = IP.ipledgeWindow(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Window', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
