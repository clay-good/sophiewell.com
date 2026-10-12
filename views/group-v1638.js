// spec-v1638: the pharmacy as a business and as a regulated Medicare and Medicaid provider.
// rx-pricing-math, inventory-turns, med-pass-error-rate, psychotropic-prn-clock, gdr-attempt-check.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as PM from '../lib/rx-pricing-math-v1638.js';
import * as IT from '../lib/inventory-turns-v1638.js';
import * as ME from '../lib/med-pass-error-rate-v1638.js';
import * as PC from '../lib/psychotropic-prn-clock-v1638.js';
import * as GD from '../lib/gdr-attempt-check-v1638.js';

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
  'rx-pricing-math'(root) {
    const pairs = [['rpm-cost', 'cost'], ['rpm-price', 'price'], ['rpm-markup', 'markupPercent'], ['rpm-margin', 'marginPercent'], ['rpm-target', 'targetMarginPercent'], ['rpm-fee', 'fee']];
    note(root, 'Enter any two of the first four.');
    numField(root, 'Acquisition cost, dollars', 'rpm-cost', '');
    numField(root, 'Selling price, dollars', 'rpm-price', '');
    numField(root, 'Markup on cost, percent', 'rpm-markup', '');
    numField(root, 'Gross margin on price, percent', 'rpm-margin', '');
    numField(root, 'A target margin to price for, percent (optional)', 'rpm-target', '');
    numField(root, 'Dispensing fee added to that price, dollars (optional)', 'rpm-fee', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(PM.rxPricingMath(args), o);
    }));
  },
  'inventory-turns'(root) {
    const pairs = [['inv-cogs', 'cogs'], ['inv-days', 'periodDays'], ['inv-begin', 'beginningInventory'], ['inv-end', 'endingInventory'], ['inv-target', 'targetDaysOnHand'], ['inv-use', 'dailyUse'], ['inv-lead', 'leadTimeDays'], ['inv-safety', 'safetyStock']];
    numField(root, 'Cost of goods sold for the period, dollars', 'inv-cogs', '');
    numField(root, 'Days in the period', 'inv-days', '');
    numField(root, 'Beginning inventory at cost, dollars', 'inv-begin', '');
    numField(root, 'Ending inventory at cost, dollars', 'inv-end', '');
    numField(root, 'Target days on hand (optional)', 'inv-target', '');
    numField(root, 'One item: average daily use, units', 'inv-use', '');
    numField(root, 'One item: supplier lead time, days', 'inv-lead', '');
    numField(root, 'One item: safety stock, units (0 if none)', 'inv-safety', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(IT.inventoryTurns(args), o);
    }));
  },
  'med-pass-error-rate'(root) {
    const pairs = [['mpe-given', 'dosesGiven'], ['mpe-omitted', 'dosesOmitted'], ['mpe-errors', 'errors'], ['mpe-significant', 'significantErrors']];
    numField(root, 'Doses observed being administered', 'mpe-given', '');
    numField(root, 'Doses ordered but not administered (0 if none)', 'mpe-omitted', '');
    numField(root, 'Errors observed, significant and non-significant together (0 if none)', 'mpe-errors', '');
    numField(root, 'How many of the errors were significant (0 if none)', 'mpe-significant', '');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(ME.medPassErrorRate(args), o);
    }));
  },
  'psychotropic-prn-clock'(root) {
    const pairs = [['ppc-kind', 'kind'], ['ppc-started', 'started'], ['ppc-extension', 'extension'], ['ppc-duration', 'durationDays'], ['ppc-evaluated', 'evaluated']];
    selectField(root, 'The PRN order is for', 'ppc-kind', PC.KINDS);
    dateField(root, 'Date the PRN order started', 'ppc-started');
    selectField(root, 'Not an antipsychotic: is an extension documented?', 'ppc-extension', PC.RATIONALE);
    numField(root, 'The documented duration of the order, days', 'ppc-duration', '');
    dateField(root, 'Antipsychotic: date the prescriber examined the resident (optional)', 'ppc-evaluated');
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(PC.psychotropicPrnClock(args, new Date()), o);
    }));
  },
  'gdr-attempt-check'(root) {
    const pairs = [['gdr-started', 'started'], ['gdr-attempts', 'attempts'], ['gdr-contra', 'contraindication']];
    dateField(root, 'Date admitted on the psychotropic, or the date it was started', 'gdr-started');
    areaField(root, 'Dates of the GDR attempts, one per line (YYYY-MM-DD)', 'gdr-attempts', '2026-03-01');
    selectField(root, 'Clinical contraindication', 'gdr-contra', GD.CONTRAINDICATION);
    const o = out(); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      show(GD.gdrAttemptCheck(args), o);
    }));
  },
};
