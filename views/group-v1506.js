// spec-v1506: renderers for the income and Marketplace tools.

import { el, clear } from '../lib/dom.js';
import * as IN from '../lib/income-screens-v1506.js';
import * as MC from '../lib/marketplace-credit-v1506.js';
import * as PC from '../lib/partd-costs-v1506.js';
import * as CC from '../lib/copay-card-v1506.js';
import * as MF from '../lib/mfp-prices-v1506.js';
import * as PB from '../lib/part-b-drug-coinsurance.js';
import * as AP from '../lib/asp-payment.js';
import { loadManifest, loadFile, loadShard } from '../lib/data.js';
import { parseDate } from '../lib/pa/date.js';
import { resultRow } from '../lib/result-copy.js';
import { uploadWorkbench } from './upload-workbench.js';
import { BATCH_TOOLS } from '../lib/batch-tools.js';
import { acceptVia } from '../lib/hand-off.js';

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
  'fpl-percent'(root) {
    const pairs = [['fpl-size', 'size'], ['fpl-income', 'income'], ['fpl-period', 'period'], ['fpl-region', 'region'], ['fpl-program', 'program'], ['fpl-year', 'year'], ['fpl-limit', 'threshold']];
    numField(root, 'Household size', 'fpl-size', 'e.g. 3', '30', '1');
    numField(root, 'Household income in dollars', 'fpl-income', 'e.g. 40000', '100000000', '0.01');
    selectField(root, 'Income is', 'fpl-period', IN.PERIODS);
    selectField(root, 'Where the household lives', 'fpl-region', IN.REGIONS);
    selectField(root, 'Program', 'fpl-program', IN.PROGRAMS);
    numField(root, 'Coverage or program year (blank for this year)', 'fpl-year', 'e.g. 2026', '2100', '1');
    numField(root, 'Program limit as a percent, to check against (optional)', 'fpl-limit', 'e.g. 400', '2000', 'any');
    const ids = pairs.map(([d]) => d);
    const o = out();
    const formArgs = () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      return args;
    };
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Percent', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    // spec-v1501 §3: many households from a file, each row through fplPercent; a column the file
    // lacks (the region, the program) takes the answer above.
    const upload = uploadWorkbench(root, {
      id: 'fpl-upload', fields: BATCH_TOOLS['fpl-percent'].fields, label: 'Screen households from a file',
      compute: 'fpl-percent', getInput: formArgs, onResult: show,
    });
    root.appendChild(o);
    wire(ids, () => {
      if (upload.isActive()) upload.compute(formArgs());
      else show(IN.fplPercent(formArgs()));
    });
  },
  'irmaa'(root) {
    const pairs = [['irm-filing', 'filing'], ['irm-magi', 'magi'], ['irm-year', 'year']];
    selectField(root, 'Tax filing status', 'irm-filing', IN.FILING);
    numField(root, 'Modified adjusted gross income from the tax return two years earlier', 'irm-magi', 'e.g. 150000', '1000000000', '0.01');
    numField(root, 'Premium year (blank for this year)', 'irm-year', 'e.g. 2026', '2100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out();
    const formArgs = () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      return args;
    };
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'IRMAA', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    // spec-v1501 §3: many people from a file, each row through irmaa; a file without a year column takes
    // the year above.
    const upload = uploadWorkbench(root, {
      id: 'irm-upload', fields: BATCH_TOOLS['irmaa'].fields, label: 'Check people from a file',
      compute: 'irmaa', getInput: formArgs, onResult: show,
    });
    root.appendChild(o);
    wire(ids, () => {
      if (upload.isActive()) upload.compute(formArgs());
      else show(IN.irmaa(formArgs()));
    });
  },
  'premium-tax-credit'(root) {
    const pairs = [['ptc-magi', 'magi'], ['ptc-size', 'size'], ['ptc-region', 'region'], ['ptc-bench', 'benchmark'], ['ptc-year', 'year']];
    numField(root, 'Household income (MAGI) in dollars a year', 'ptc-magi', 'e.g. 40000', '100000000', '0.01');
    numField(root, 'Household size', 'ptc-size', 'e.g. 1', '30', '1');
    selectField(root, 'Where the household lives', 'ptc-region', IN.REGIONS);
    numField(root, 'Benchmark (second-lowest-cost silver) premium, dollars a month', 'ptc-bench', 'e.g. 550', '100000', '0.01');
    numField(root, 'Coverage year (blank for this year)', 'ptc-year', 'e.g. 2026', '2100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out();
    const formArgs = () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      return args;
    };
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Credit', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    // spec-v1501 §3: many households from a file, each row through premiumTaxCredit; a file without a
    // region or year column takes the answer above.
    const upload = uploadWorkbench(root, {
      id: 'ptc-upload', fields: BATCH_TOOLS['premium-tax-credit'].fields, label: 'Estimate credits for households from a file',
      compute: 'premium-tax-credit', getInput: formArgs, onResult: show,
    });
    root.appendChild(o);
    wire(ids, () => {
      if (upload.isActive()) upload.compute(formArgs());
      else show(MC.premiumTaxCredit(formArgs()));
    });
  },
  'employer-coverage-affordability'(root) {
    const pairs = [['eca-income', 'income'], ['eca-self', 'selfOnly'], ['eca-family', 'family'], ['eca-year', 'year']];
    numField(root, 'Household income in dollars a year', 'eca-income', 'e.g. 50000', '100000000', '0.01');
    numField(root, 'Employee\'s lowest-cost self-only premium, dollars a month', 'eca-self', 'e.g. 400', '100000', '0.01');
    numField(root, 'Family premium, dollars a month (optional)', 'eca-family', 'e.g. 1200', '100000', '0.01');
    numField(root, 'Plan year (blank for this year)', 'eca-year', 'e.g. 2026', '2100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MC.employerAffordability(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Affordable?', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'partd-year-cost'(root) {
    const pairs = [['pdy-cost', 'monthlyCost'], ['pdy-start', 'startMonth'], ['pdy-ded', 'deductible'], ['pdy-year', 'year']];
    numField(root, 'Drug\'s monthly cost (the plan\'s price), dollars', 'pdy-cost', 'e.g. 800', '1000000', '0.01');
    numField(root, 'First month filled (1 to 12)', 'pdy-start', 'e.g. 1', '12', '1');
    numField(root, 'Plan deductible, if lower than the maximum (optional)', 'pdy-ded', 'e.g. 615', '10000', '0.01');
    numField(root, 'Plan year (blank for this year)', 'pdy-year', 'e.g. 2026', '2100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PC.partdYearCost(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Year', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'm3p-monthly-bill'(root) {
    const pairs = [['m3p-month', 'optInMonth'], ['m3p-prior', 'priorOop'], ['m3p-monthly', 'monthlyOop'], ['m3p-extra', 'firstMonthExtra'], ['m3p-year', 'year']];
    numField(root, 'Month of opting in (1 to 12)', 'm3p-month', 'e.g. 3', '12', '1');
    numField(root, 'Part D out-of-pocket costs already paid this year (0 if none)', 'm3p-prior', 'e.g. 300', '1000000', '0.01');
    numField(root, 'Out-of-pocket cost each month from opting in, dollars', 'm3p-monthly', 'e.g. 200', '1000000', '0.01');
    numField(root, 'Extra cost in the first month (optional)', 'm3p-extra', 'e.g. 900', '1000000', '0.01');
    numField(root, 'Plan year (blank for this year)', 'm3p-year', 'e.g. 2026', '2100', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PC.m3pMonthlyBill(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'First bill', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'copay-card-runout'(root) {
    const pairs = [['ccr-plan', 'planType'], ['ccr-cost', 'costPerFill'], ['ccr-fills', 'fills'], ['ccr-card', 'cardMax'], ['ccr-perfill', 'perFillMax'], ['ccr-ded', 'deductible'], ['ccr-coins', 'coinsurance'], ['ccr-oop', 'oopMax'], ['ccr-counts', 'counts']];
    selectField(root, 'Plan type', 'ccr-plan', CC.PLAN_TYPES);
    numField(root, 'Drug cost per fill (the plan\'s price), dollars', 'ccr-cost', 'e.g. 5000', '10000000', '0.01');
    numField(root, 'Fills a year', 'ccr-fills', 'e.g. 12', '52', '1');
    numField(root, 'Copay card annual maximum, dollars', 'ccr-card', 'e.g. 10000', '10000000', '0.01');
    numField(root, 'Copay card per-fill maximum (optional)', 'ccr-perfill', 'e.g. 3000', '10000000', '0.01');
    numField(root, 'Plan deductible, dollars', 'ccr-ded', 'e.g. 3000', '1000000', '0.01');
    numField(root, 'Plan coinsurance, percent', 'ccr-coins', 'e.g. 20', '100', '0.1');
    numField(root, 'Plan out-of-pocket maximum, dollars', 'ccr-oop', 'e.g. 8000', '1000000', '0.01');
    selectField(root, 'Does the plan count the card toward the deductible and out-of-pocket maximum?', 'ccr-counts', CC.COUNTS);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = CC.copayCardRunout(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Patient pays', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'partd-mfp-price-check'(root) {
    const pairs = [['mfp-drug', 'drug'], ['mfp-ndc', 'ndc'], ['mfp-date', 'date']];
    selectField(root, 'Drug selected for Medicare price negotiation', 'mfp-drug', MF.DRUGS);
    textField(root, 'Or its NDC, for the per-unit price (optional)', 'mfp-ndc', 'e.g. 00003-0893-21');
    dateInput(root, 'Date of service (blank for today)', 'mfp-date', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    // The CMS file's NDC rows (data/mfp-negotiated-prices) load the first time an NDC is entered; null if
    // they could not be, which the check never reads as "not in the file".
    let ndcRows;
    let loading = null;
    const run = () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      if (String(args.ndc).trim() && ndcRows === undefined) {
        if (!loading) loading = loadShard('mfp-negotiated-prices', 'prices.json').then((rows) => { ndcRows = rows; }, () => { ndcRows = null; }).then(run);
        note(o, 'Loading the CMS file\'s NDC list...');
        return;
      }
      args.ndcRows = ndcRows;
      const r = MF.mfpPriceCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Negotiated price', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    wire(ids, run);
  },
  'part-b-drug-coinsurance'(root) {
    const pairs = [['pbdc-code', 'code'], ['pbdc-dos', 'serviceDate'], ['pbdc-units', 'units'], ['pbdc-months', 'months'], ['pbdc-limit', 'limit'], ['pbdc-coins', 'coinsurance']];
    textField(root, 'HCPCS code of the drug (on your Medicare Summary Notice)', 'pbdc-code', 'e.g. J0897');
    dateInput(root, 'Date of service', 'pbdc-dos', 'date');
    numField(root, 'Units billed', 'pbdc-units', 'e.g. 120', '1000000', '0.001');
    numField(root, 'Months of insulin the supply covers (insulin through a pump only)', 'pbdc-months', 'e.g. 1', '12', '1');
    numField(root, 'Payment limit per unit from another quarter\'s file, dollars (optional)', 'pbdc-limit', 'e.g. 29.856', '1000000', '0.001');
    numField(root, 'Coinsurance percentage with that limit (optional)', 'pbdc-coins', 'e.g. 17.885', '20', '0.001');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    const show = (args) => safe(o, () => {
      const r = PB.partBDrugCoinsurance(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'Your share', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    });
    // The quarter's file is fetched only when no limit was typed; a newer keystroke drops an older answer.
    let seq = 0;
    wire(ids, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const code = AP.normalizeHcpcs(args.code);
      const mine = ++seq;
      if (String(args.limit).trim() || !code || !parseDate(args.serviceDate)) { show(args); return; }
      safe(o, () => note(o, 'Looking up the payment limit for this code...'));
      (async () => {
        try {
          const [manifest, period] = await Promise.all([loadManifest('asp'), loadFile('asp', 'period.json')]);
          const listed = (manifest.shards || []).some((s) => s.name === AP.shardName(code));
          const rows = listed ? await loadShard('asp', AP.shardName(code)) : null;
          return AP.aspLookup({ code, manifest, period, rows });
        } catch { return { status: 'unavailable' }; }
      })().then((lookup) => { if (mine === seq) show({ ...args, lookup }); });
    });
  },
};

export const acceptFiles = {
  'fpl-percent': acceptVia('fpl-upload-file'),
  'premium-tax-credit': acceptVia('ptc-upload-file'),
  'irmaa': acceptVia('irm-upload-file'),
};
