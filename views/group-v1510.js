// spec-v1510: renderers for mfp-refund-check, pbm-reimbursement-check, medicaid-ura.

import { el, clear } from '../lib/dom.js';
import * as MR from '../lib/mfp-refund-v1510.js';
import * as PB from '../lib/pbm-reimbursement-v1510.js';
import * as UR from '../lib/medicaid-ura-v1510.js';
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
  'mfp-refund-check'(root) {
    const pairs = [['mr-drug', 'drug'], ['mr-dos', 'serviceDate'], ['mr-qty', 'quantity'], ['mr-wac', 'wac'], ['mr-mfp', 'mfpUnit'], ['mr-paid', 'paid'], ['mr-cost', 'cost'], ['mr-recv', 'received'], ['mr-check', 'checkDate']];
    selectField(root, 'Drug selected for Medicare price negotiation', 'mr-drug', MR.DRUGS);
    dateInput(root, 'Date of service', 'mr-dos', 'date');
    numField(root, 'Quantity dispensed, units', 'mr-qty', 'e.g. 60', '1000000', '0.001');
    numField(root, 'WAC per unit on the date of service, dollars', 'mr-wac', 'e.g. 10.10', '1000000', '0.000001');
    numField(root, 'MFP per unit (the CMS file\'s NDC-9 unit price), dollars', 'mr-mfp', 'e.g. 4.145072', '1000000', '0.000001');
    numField(root, 'Amount paid by the plan and patient (optional)', 'mr-paid', 'e.g. 260', '10000000', '0.01');
    numField(root, 'Acquisition cost per unit (optional)', 'mr-cost', 'e.g. 9.80', '1000000', '0.000001');
    selectField(root, 'Refund already received? (optional)', 'mr-recv', MR.YES_NO);
    dateInput(root, 'Date to check (blank for today)', 'mr-check', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MR.mfpRefundCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Refund', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'pbm-reimbursement-check'(root) {
    const pairs = [['pb-bm', 'benchmark'], ['pb-price', 'benchmarkPrice'], ['pb-pct', 'percent'], ['pb-fee', 'fee'], ['pb-qty', 'quantity'], ['pb-paid', 'paid'], ['pb-cost', 'cost']];
    selectField(root, 'Contract benchmark', 'pb-bm', PB.BENCHMARKS);
    numField(root, 'Benchmark price per unit, dollars', 'pb-price', 'e.g. 5', '1000000', '0.000001');
    numField(root, 'Contract percentage (negative for a discount, e.g. -18)', 'pb-pct', 'e.g. -18', '100', '0.01');
    numField(root, 'Dispensing fee, dollars (optional)', 'pb-fee', 'e.g. 1.50', '1000', '0.01');
    numField(root, 'Quantity, units', 'pb-qty', 'e.g. 30', '1000000', '0.001');
    numField(root, 'Amount paid (plan plus patient), dollars', 'pb-paid', 'e.g. 120', '10000000', '0.01');
    numField(root, 'Acquisition cost per unit (optional)', 'pb-cost', 'e.g. 4.20', '1000000', '0.000001');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PB.pbmReimbursementCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'medicaid-ura'(root) {
    const pairs = [['ur-cat', 'category'], ['ur-amp', 'amp'], ['ur-bp', 'bestPrice'], ['ur-bamp', 'baselineAmp'], ['ur-bcpi', 'baselineCpi'], ['ur-ccpi', 'currentCpi'], ['ur-year', 'year']];
    selectField(root, 'Drug category', 'ur-cat', UR.DRUG_CATEGORIES);
    numField(root, 'Average manufacturer price per unit, dollars', 'ur-amp', 'e.g. 10', '10000000', '0.000001');
    numField(root, 'Best price per unit (brand drugs; optional)', 'ur-bp', 'e.g. 6', '10000000', '0.000001');
    numField(root, 'Baseline AMP per unit (optional)', 'ur-bamp', 'e.g. 4', '10000000', '0.000001');
    numField(root, 'Baseline CPI-U (optional)', 'ur-bcpi', 'e.g. 200', '10000', '0.001');
    numField(root, 'CPI-U for the month before the quarter (optional)', 'ur-ccpi', 'e.g. 300', '10000', '0.001');
    numField(root, 'Year of the rebate quarter (optional)', 'ur-year', 'e.g. 2026', '2100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = UR.medicaidUra(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'URA', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
