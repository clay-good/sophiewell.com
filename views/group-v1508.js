// spec-v1508: renderers for agb-percentage, fap-collection-clock, fap-discount, gfe-deadline, ppdr-eligibility.

import { el, clear } from '../lib/dom.js';
import * as HF from '../lib/hospital-fap-v1508.js';
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
  'agb-percentage'(root) {
    const pairs = [['agb-allowed', 'allowed'], ['agb-gross', 'gross'], ['agb-basis', 'basis'], ['agb-end', 'periodEnd'], ['agb-bill', 'bill']];
    numField(root, 'Total allowed amounts for the 12-month period, dollars', 'agb-allowed', 'e.g. 4200000', '1000000000000', '0.01');
    numField(root, 'Total gross charges for those claims, dollars', 'agb-gross', 'e.g. 10000000', '1000000000000', '0.01');
    selectField(root, 'Payers whose allowed claims are included', 'agb-basis', HF.AGB_BASES);
    dateInput(root, 'Last day of the 12-month period (optional)', 'agb-end', 'date');
    numField(root, 'A patient\'s gross charges (optional)', 'agb-bill', 'e.g. 12000', '10000000000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HF.agbPercentage(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'AGB', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'fap-collection-clock'(root) {
    const pairs = [['fcc-bill', 'firstBill'], ['fcc-notice', 'notice'], ['fcc-app', 'application']];
    dateInput(root, 'Date of the first post-discharge bill', 'fcc-bill', 'date');
    dateInput(root, 'Date the 30-day written notice was sent (optional)', 'fcc-notice', 'date');
    dateInput(root, 'Date of a financial assistance application (optional)', 'fcc-app', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HF.fapCollectionClock(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Status', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'fap-discount'(root) {
    const pairs = [['fd-size', 'size'], ['fd-income', 'income'], ['fd-region', 'region'], ['fd-year', 'year'], ['fd-gross', 'gross'], ['fd-t1l', 'tier1Limit'], ['fd-t1d', 'tier1Discount'], ['fd-t2l', 'tier2Limit'], ['fd-t2d', 'tier2Discount'], ['fd-t3l', 'tier3Limit'], ['fd-t3d', 'tier3Discount'], ['fd-agb', 'agb']];
    numField(root, 'Household size', 'fd-size', 'e.g. 3', '30', '1');
    numField(root, 'Annual household income, dollars', 'fd-income', 'e.g. 45000', '100000000', '0.01');
    selectField(root, 'Where the household lives', 'fd-region', HF.REGIONS);
    numField(root, 'Poverty guideline year (blank for this year)', 'fd-year', 'e.g. 2026', '2100', '1');
    numField(root, 'Gross charges, dollars', 'fd-gross', 'e.g. 20000', '10000000000', '0.01');
    numField(root, 'Tier 1: income up to this percent of poverty', 'fd-t1l', 'e.g. 200', '2000', '1');
    numField(root, 'Tier 1: discount, percent', 'fd-t1d', 'e.g. 100', '100', '1');
    numField(root, 'Tier 2: income up to this percent of poverty (optional)', 'fd-t2l', 'e.g. 300', '2000', '1');
    numField(root, 'Tier 2: discount, percent (optional)', 'fd-t2d', 'e.g. 75', '100', '1');
    numField(root, 'Tier 3: income up to this percent of poverty (optional)', 'fd-t3l', 'e.g. 400', '2000', '1');
    numField(root, 'Tier 3: discount, percent (optional)', 'fd-t3d', 'e.g. 50', '100', '1');
    numField(root, 'Hospital\'s AGB percentage (optional)', 'fd-agb', 'e.g. 42', '100', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HF.fapDiscount(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Patient owes', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'gfe-deadline'(root) {
    const pairs = [['gfe-sched', 'scheduled'], ['gfe-svc', 'serviceDate'], ['gfe-req', 'requested']];
    dateInput(root, 'Date the service was scheduled', 'gfe-sched', 'date');
    dateInput(root, 'Service date', 'gfe-svc', 'date');
    dateInput(root, 'Or: date the patient asked for an estimate', 'gfe-req', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HF.gfeDeadline(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Deadline', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'ppdr-eligibility'(root) {
    const pairs = [['pp-e1', 'est1'], ['pp-b1', 'billed1'], ['pp-e2', 'est2'], ['pp-b2', 'billed2'], ['pp-e3', 'est3'], ['pp-b3', 'billed3'], ['pp-first', 'firstBill']];
    numField(root, 'Provider 1: amount on the estimate, dollars', 'pp-e1', 'e.g. 1000', '1000000000', '0.01');
    numField(root, 'Provider 1: total billed, dollars', 'pp-b1', 'e.g. 1450', '1000000000', '0.01');
    numField(root, 'Provider 2: amount on the estimate (optional)', 'pp-e2', 'e.g. 500', '1000000000', '0.01');
    numField(root, 'Provider 2: total billed (optional)', 'pp-b2', 'e.g. 800', '1000000000', '0.01');
    numField(root, 'Provider 3: amount on the estimate (optional)', 'pp-e3', 'e.g. 300', '1000000000', '0.01');
    numField(root, 'Provider 3: total billed (optional)', 'pp-b3', 'e.g. 300', '1000000000', '0.01');
    dateInput(root, 'Date the first bill was received (optional)', 'pp-first', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = HF.ppdrEligibility(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
