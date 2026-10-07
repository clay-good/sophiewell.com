// spec-v1502: renderers for auth-runout, auth-units-request, quantity-limit-check, medicare-ffs-pa-required.

import { el, clear } from '../lib/dom.js';
import * as AR from '../lib/auth-runout-v1502.js';
import * as AU from '../lib/auth-units-request-v1502.js';
import * as QL from '../lib/quantity-limit-check-v1502.js';
import * as ST from '../lib/step-therapy-v1502.js';
import * as PC from '../lib/pa-criteria-v1502.js';
import * as MF from '../lib/medicare-ffs-pa-required.js';
import * as PD from '../lib/payer-policy-diff.js';
import { resultRow } from '../lib/result-copy.js';
import { uploadWorkbench } from './upload-workbench.js';
import { AUTH_FIELDS } from '../lib/upload-fields.js';
import { acceptVia } from '../lib/hand-off.js';
import { BATCH_TOOLS } from '../lib/batch-tools.js';

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
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '6', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder }));
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
  'auth-runout'(root) {
    const pairs = [['ar-start', 'startDate'], ['ar-end', 'endDate'], ['ar-approved', 'approved'], ['ar-used', 'used'], ['ar-per', 'perDose'], ['ar-every', 'intervalDays'], ['ar-next', 'nextDose'], ['ar-lead', 'leadDays']];
    dateInput(root, 'Approval start date', 'ar-start', 'date');
    dateInput(root, 'Approval end date', 'ar-end', 'date');
    numField(root, 'Units or visits approved', 'ar-approved', 'e.g. 4', '100000', '1');
    numField(root, 'Units or visits used so far (0 if none)', 'ar-used', 'e.g. 1', '100000', '1');
    numField(root, 'Units given at each administration', 'ar-per', 'e.g. 1', '100000', 'any');
    numField(root, 'Days between administrations', 'ar-every', 'e.g. 56', '3650', '1');
    dateInput(root, 'Next scheduled administration', 'ar-next', 'date');
    numField(root, 'Days ahead to submit the renewal (default 14)', 'ar-lead', '14', '365', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AR.authRunout(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Renewal', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
    // spec-v1501 §3: a CSV of authorizations, one per row, gives the renewal worklist.
    dateInput(root, 'Worklist as of (optional; marks renewals already past due)', 'ar-asof', 'date');
    const w = el('div', { id: 'ar-worklist', 'aria-live': 'polite' });
    const showList = (r) => safe(w, () => {
      if (!r.valid) { note(w, r.message); return; }
      resultRow(w, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Worklist', value: r.bandLabel }]);
      const ol = el('ol');
      for (const x of r.order.slice(0, 50)) ol.appendChild(el('li', { text: x.submitBy ? `${x.reference}: submit by ${x.submitBy} (${x.status}; limited by ${x.limitedBy})` : `${x.reference || `Row ${x.index + 1}`}: ${x.reason}` }));
      w.appendChild(ol);
      list(w, r.notes);
    });
    const upload = uploadWorkbench(root, {
      id: 'ar-upload', fields: AUTH_FIELDS, label: 'Renewal worklist from a CSV of authorizations',
      compute: 'auth-runout', getInput: () => ({ asOf: val('ar-asof') }), onResult: showList,
    });
    root.appendChild(w);
    document.getElementById('ar-asof').addEventListener('change', () => { if (upload.isActive()) upload.compute({ asOf: val('ar-asof') }); });
  },
  'auth-units-request'(root) {
    const pairs = [['au-basis', 'basis'], ['au-dose', 'dose'], ['au-weight', 'weightKg'], ['au-unit', 'unitMg'], ['au-every', 'intervalDays'], ['au-first', 'firstDose'], ['au-end', 'periodEnd'], ['au-lcount', 'loadingCount'], ['au-ldose', 'loadingDose']];
    selectField(root, 'Dose is given in', 'au-basis', AU.DOSE_BASIS);
    numField(root, 'Maintenance dose', 'au-dose', 'e.g. 5', '100000', 'any');
    numField(root, 'Weight in kg (for mg per kg)', 'au-weight', 'e.g. 72', '500', 'any');
    numField(root, 'Billing unit size in mg (from the HCPCS descriptor)', 'au-unit', 'e.g. 10', '100000', 'any');
    numField(root, 'Days between maintenance doses', 'au-every', 'e.g. 56', '3650', '1');
    dateInput(root, 'First maintenance dose in the period', 'au-first', 'date');
    dateInput(root, 'Last day of the authorization period', 'au-end', 'date');
    numField(root, 'Number of loading doses (0 if none)', 'au-lcount', 'e.g. 2', '20', '1');
    numField(root, 'Loading dose (same basis as above)', 'au-ldose', 'e.g. 5', '100000', 'any');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AU.authUnitsRequest(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Units', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'quantity-limit-check'(root) {
    const pairs = [['ql-per', 'unitsPerDose'], ['ql-freq', 'dosesPerDay'], ['ql-strength', 'strength'], ['ql-limit', 'limitQty'], ['ql-days', 'limitDays'], ['ql-other', 'otherStrength']];
    numField(root, 'Units taken per dose (tablets, capsules)', 'ql-per', 'e.g. 2', '1000', 'any');
    numField(root, 'Doses per day', 'ql-freq', 'e.g. 1', '48', 'any');
    numField(root, 'Strength of one unit (mg)', 'ql-strength', 'e.g. 20', '100000', 'any');
    numField(root, 'Plan quantity limit (units)', 'ql-limit', 'e.g. 30', '100000', 'any');
    numField(root, 'Days the limit covers', 'ql-days', 'e.g. 30', '366', '1');
    numField(root, 'Another available strength in mg (optional)', 'ql-other', 'e.g. 40', '100000', 'any');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = QL.quantityLimitCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'step-therapy-history'(root) {
    const pairs = [['st-steps', 'steps'], ['st-trials', 'trials'], ['st-accepts', 'acceptsIntolerance'], ['st-plan', 'planType'], ['st-request', 'requestDate'], ['st-lastclaim', 'lastClaim']];
    textareaField(root, 'Required steps, one per line: step name, number of agents, minimum days', 'st-steps', 'conventional DMARD, 2, 90');
    textareaField(root, 'Drugs tried, one per line: drug, step, start date, stop date or "ongoing", reason (inadequate response, intolerance, contraindication, still taking)', 'st-trials', 'methotrexate, conventional DMARD, 2025-01-10, 2025-06-30, inadequate response');
    selectField(root, 'Does the plan accept intolerance or a contraindication in place of a full trial?', 'st-accepts', ST.YES_NO);
    selectField(root, 'Plan type (optional)', 'st-plan', ST.PLAN_TYPES);
    dateInput(root, 'Request date (Medicare Advantage lookback; optional)', 'st-request', 'date');
    dateInput(root, 'Last claim for the requested drug (optional)', 'st-lastclaim', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = ST.stepTherapyHistory(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Steps', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'pa-criteria-checklist'(root) {
    const pairs = [['pac-text', 'criteria'], ['pac-drug', 'drug'], ['pac-plan', 'plan']];
    note(root, 'Paste the criteria from the payer\'s policy, keeping its numbering, and end each item with [met], [not met] or [not documented]; add "-- " and where the evidence is.');
    textareaField(root, 'Criteria, one item per line', 'pac-text', '1. Diagnosis of rheumatoid arthritis [met] -- progress note 2026-08-14');
    textField(root, 'Drug (optional)', 'pac-drug', 'e.g. adalimumab');
    textField(root, 'Plan name (optional)', 'pac-plan', 'e.g. the plan on the card');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PC.paCriteriaChecklist(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Criteria', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'payer-policy-diff'(root) {
    const pairs = [['ppd-before', 'before'], ['ppd-before-date', 'beforeDate'], ['ppd-after', 'after'], ['ppd-after-date', 'afterDate']];
    note(root, 'Paste both versions of the policy\'s criteria, keeping their numbering. Nothing you paste leaves this page.');
    textareaField(root, 'Earlier version', 'ppd-before', '1. Step through 2 prior drugs');
    dateInput(root, 'Earlier version effective date (optional)', 'ppd-before-date', 'date');
    textareaField(root, 'Newer version', 'ppd-after', '1. Step through 3 prior drugs');
    dateInput(root, 'Newer version effective date (optional)', 'ppd-after-date', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    const save = el('button', { type: 'button', text: 'Download the change list (CSV)', disabled: 'disabled' });
    root.appendChild(el('p', {}, [save]));
    let last = null;
    save.addEventListener('click', () => {
      if (!last) return;
      const url = window.URL.createObjectURL(new Blob([PD.diffCsv(last)], { type: 'text/csv' }));
      const anchor = el('a', { href: url, download: 'policy-changes.csv' });
      anchor.click();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
    });
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PD.payerPolicyDiff(args);
      last = r.valid && r.rows.length ? r : null;
      save.disabled = !last;
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Policy', value: r.bandLabel }]);
      list(o, r.rows.map((x) => {
        const where = x.path ? `item ${x.path}: ` : '';
        if (x.kind === 'added') return `${x.label}, ${where}"${x.after}"`;
        if (x.kind === 'removed') return `${x.label}, ${where}"${x.before}"`;
        if (!x.before) return `${x.label}: ${x.detail}`;
        return `${x.label}, ${where}"${x.before}" is now "${x.after}"${x.detail ? ` (${x.detail})` : ''}`;
      }));
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'medicare-ffs-pa-required'(root) {
    const pairs = [['mfpa-code', 'code'], ['mfpa-setting', 'setting'], ['mfpa-state', 'state'], ['mfpa-dos', 'serviceDate']];
    textField(root, 'HCPCS or CPT code', 'mfpa-code', 'e.g. 64483');
    selectField(root, 'Setting', 'mfpa-setting', MF.SETTINGS);
    selectField(root, 'State where the service is furnished', 'mfpa-state', MF.STATES);
    dateInput(root, 'Date of service', 'mfpa-dos', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out();
    const formArgs = () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      return args;
    };
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Original Medicare', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    // spec-v1501 §3: a list of scheduled services from a file, each row through medicareFfsPaRequired; a
    // file without a setting or state column takes the answer above.
    const upload = uploadWorkbench(root, {
      id: 'mfpa-upload', fields: BATCH_TOOLS['medicare-ffs-pa-required'].fields, label: 'Check services from a file',
      compute: 'medicare-ffs-pa-required', getInput: formArgs, onResult: show,
    });
    root.appendChild(o);
    wire(ids, () => {
      if (upload.isActive()) upload.compute(formArgs());
      else show(MF.medicareFfsPaRequired(formArgs()));
    });
  },
};

// spec-v1623 step 3: an authorization CSV goes to the worklist.
export const acceptFiles = {
  'auth-runout': acceptVia('ar-upload-file'),
  'medicare-ffs-pa-required': acceptVia('mfpa-upload-file'),
};
