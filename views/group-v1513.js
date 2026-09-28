// spec-v1513: renderers for mpr-gap-days, med-sync-plan, pdc-star, adherence-outreach-list.

import { el, clear } from '../lib/dom.js';
import * as AD from '../lib/adherence-v1513.js';
import * as PS from '../lib/pdc-star-v1513.js';
import { resultRow } from '../lib/result-copy.js';
import { uploadWorkbench } from './upload-workbench.js';

const FILL_FIELDS = [
  { id: 'patient', label: 'Patient', required: true, sensitive: true, synonyms: ['patient name', 'member', 'member name'] },
  { id: 'measure', label: 'Measure', required: true, synonyms: ['star measure', 'measure id'] },
  { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date filled', 'dispense date', 'service date'] },
  { id: 'days_supply', label: 'Days supply', required: true, synonyms: ['supply days'] },
  { id: 'ingredient', label: 'Ingredient', required: true, synonyms: ['drug ingredient', 'generic name', 'drug name'] },
];
const MPR_FILL_FIELDS = [
  { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date filled', 'dispense date', 'service date'] },
  { id: 'days_supply', label: 'Days supply', required: true, synonyms: ['supply days'] },
];
const SYNC_FIELDS = [
  { id: 'medication', label: 'Medication', required: true, synonyms: ['drug name', 'medication name'] },
  { id: 'last_fill_date', label: 'Last fill date', required: true, synonyms: ['last dispense date', 'fill date'] },
  { id: 'days_supply', label: 'Days supply', required: true, synonyms: ['supply days'] },
  { id: 'units_per_day', label: 'Units a day', required: true, synonyms: ['units per day', 'daily units'] },
];

function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '6', autocomplete: 'off', placeholder }));
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
  'mpr-gap-days'(root) {
    const pairs = [['mpr-fills', 'fills'], ['mpr-start', 'periodStart'], ['mpr-end', 'periodEnd'], ['mpr-gap', 'gapDays']];
    textareaField(root, 'Fills of one drug, one per line: fill date, days supply', 'mpr-fills', '2026-01-05, 30');
    dateInput(root, 'Period start (blank for the first fill)', 'mpr-start', 'date');
    dateInput(root, 'Period end (blank for December 31)', 'mpr-end', 'date');
    numField(root, 'List gaps longer than this many days (optional)', 'mpr-gap', 'e.g. 7', '365', '1');
    const ids = pairs.map(([d]) => d);
    const o = out();
    const input = () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      return args;
    };
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Adherence', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    let upload;
    const run = () => {
      const args = input();
      if (upload && upload.isActive()) upload.compute(args);
      else show(AD.mprGapDays(args));
    };
    upload = uploadWorkbench(root, {
      id: 'mpr-upload', fields: MPR_FILL_FIELDS, label: 'Load fills from a file',
      compute: 'mpr-gap-days', getInput: input, onResult: show,
    });
    document.getElementById('mpr-fills').addEventListener('input', () => {
      if (upload.isActive()) upload.clear('Using the fills entered above.');
    });
    root.appendChild(o);
    wire(ids, run);
  },
  'med-sync-plan'(root) {
    const pairs = [['sync-meds', 'meds'], ['sync-date', 'syncDate']];
    textareaField(root, 'Medications, one per line: name, last fill date, days supply, units a day', 'sync-meds', 'lisinopril 10 mg, 2026-09-20, 30, 1');
    dateInput(root, 'Sync date (blank for the earliest practical)', 'sync-date', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out();
    const input = () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      return args;
    };
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'Sync', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    let upload;
    const run = () => {
      const args = input();
      if (upload && upload.isActive()) upload.compute(args);
      else show(AD.medSyncPlan(args));
    };
    upload = uploadWorkbench(root, {
      id: 'sync-upload', fields: SYNC_FIELDS, label: 'Load medications from a file',
      compute: 'med-sync-plan', getInput: input, onResult: show,
    });
    document.getElementById('sync-meds').addEventListener('input', () => {
      if (upload.isActive()) upload.clear('Using the medications entered above.');
    });
    root.appendChild(o);
    wire(ids, run);
  },
  'pdc-star'(root) {
    const pairs = [['ps-fills', 'fills'], ['ps-stays', 'stays'], ['ps-excl', 'exclusions'], ['ps-year', 'year']];
    note(root, 'Fills one per line: patient, measure (D08 diabetes, D09 RAS antagonists, D10 statins), fill date, days supply, ingredient. The measure for each fill is yours to assign.');
    textareaField(root, 'Fills', 'ps-fills', 'Ann, D10, 2026-01-05, 30, atorvastatin');
    textareaField(root, 'Inpatient or skilled nursing stays (optional): patient, admit date, discharge date', 'ps-stays', 'Ann, 2026-04-01, 2026-04-10');
    textareaField(root, 'Exclusions (optional): patient, hospice or esrd or dialysis', 'ps-excl', 'Bo, hospice');
    numField(root, 'Measurement year', 'ps-year', 'e.g. 2026', '2100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out();
    const input = () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      return args;
    };
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'Rate', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    let upload;
    const run = () => {
      const args = input();
      if (upload && upload.isActive()) upload.compute(args);
      else show(PS.pdcStar(args));
    };
    upload = uploadWorkbench(root, {
      id: 'ps-upload', fields: FILL_FIELDS, label: 'Load fills from a file',
      compute: 'pdc-star', getInput: input, onResult: show,
    });
    document.getElementById('ps-fills').addEventListener('input', () => {
      if (upload.isActive()) upload.clear('Using the fills entered above.');
    });
    root.appendChild(o);
    wire(ids, run);
  },
  'adherence-outreach-list'(root) {
    const pairs = [['ao-fills', 'fills'], ['ao-stays', 'stays'], ['ao-excl', 'exclusions'], ['ao-year', 'year'], ['ao-asof', 'asOf']];
    note(root, 'Fills one per line: patient, measure (D08 diabetes, D09 RAS antagonists, D10 statins), fill date, days supply, ingredient. The measure for each fill is yours to assign.');
    textareaField(root, 'Fills', 'ao-fills', 'Ann, D10, 2026-01-05, 30, atorvastatin');
    textareaField(root, 'Inpatient or skilled nursing stays (optional): patient, admit date, discharge date', 'ao-stays', 'Ann, 2026-04-01, 2026-04-10');
    textareaField(root, 'Exclusions (optional): patient, hospice or esrd or dialysis', 'ao-excl', 'Bo, hospice');
    numField(root, 'Measurement year', 'ao-year', 'e.g. 2026', '2100', '1');
    dateInput(root, 'As of (blank for today)', 'ao-asof', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out();
    const input = () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      return args;
    };
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'Call list', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    let upload;
    const run = () => {
      const args = input();
      if (upload && upload.isActive()) upload.compute(args);
      else show(PS.adherenceOutreachList(args));
    };
    upload = uploadWorkbench(root, {
      id: 'ao-upload', fields: FILL_FIELDS, label: 'Load fills from a file',
      compute: 'adherence-outreach-list', getInput: input, onResult: show,
    });
    document.getElementById('ao-fills').addEventListener('input', () => {
      if (upload.isActive()) upload.clear('Using the fills entered above.');
    });
    root.appendChild(o);
    wire(ids, run);
  },
};
