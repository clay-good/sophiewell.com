// spec-v1604: renderers for dpc-hsa-check and pharmacy-spread-check.

import { el, clear } from '../lib/dom.js';
import * as DP from '../lib/dpc-hsa-check.js';
import * as SP from '../lib/pharmacy-spread-check.js';
import { loadNadac } from '../lib/nadac-load.js';
import { resultRow } from '../lib/result-copy.js';
import { uploadWorkbench } from './upload-workbench.js';
import { CLAIM_FIELDS } from '../lib/upload-fields.js';
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
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '6', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function table(root, caption, heads, rows) {
  if (!rows.length) return;
  const t = el('table', { class: 'upload-mapping-table' });
  t.appendChild(el('caption', { text: caption }));
  const hr = el('tr');
  for (const h of heads) hr.appendChild(el('th', { scope: 'col', text: h }));
  t.appendChild(el('thead', null, [hr]));
  const body = el('tbody');
  for (const r of rows) { const tr = el('tr'); for (const c of r) tr.appendChild(el('td', { text: String(c) })); body.appendChild(tr); }
  t.appendChild(body);
  root.appendChild(el('div', { class: 'upload-mapping-scroll' }, [t]));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'dpc-hsa-check'(root) {
    const pairs = [['dpc-year', 'year'], ['dpc-covers', 'covers'], ['dpc-period', 'period'], ['dpc-fee', 'fee'], ['dpc-prac', 'practitioners'], ['dpc-fixed', 'fixedFee'], ['dpc-anes', 'anesthesia'], ['dpc-drugs', 'drugs'], ['dpc-labs', 'labs'], ['dpc-payer', 'payer'], ['dpc-limit', 'limit']];
    numField(root, 'Year', 'dpc-year', 'e.g. 2026', '2100', '1');
    selectField(root, 'The arrangement covers', 'dpc-covers', DP.COVERS);
    selectField(root, 'The fee is billed every', 'dpc-period', DP.PERIODS);
    numField(root, 'Fee for that period, dollars (all your direct primary care arrangements together)', 'dpc-fee', 'e.g. 120', '1000000', '0.01');
    selectField(root, 'Is the care given only by primary care physicians, nurse practitioners, clinical nurse specialists or physician assistants?', 'dpc-prac', DP.YES_NO);
    selectField(root, 'Is the fee the only charge for its services (nothing billed to you or your insurance on top)?', 'dpc-fixed', DP.YES_NO);
    selectField(root, 'Does it include procedures that need general anesthesia?', 'dpc-anes', DP.YES_NO);
    selectField(root, 'Does it include prescription drugs other than vaccines?', 'dpc-drugs', DP.YES_NO);
    selectField(root, 'Does it include lab services beyond what an office primary care practice does?', 'dpc-labs', DP.YES_NO);
    selectField(root, 'Who pays the fee? (optional)', 'dpc-payer', DP.PAYERS);
    numField(root, 'Monthly limit for a year not listed, dollars (optional)', 'dpc-limit', 'e.g. 150', '10000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = DP.dpcHsaCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'HSA', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'pharmacy-spread-check'(root) {
    note(root, 'Claims one per line: NDC, quantity, fill date, plan paid, member paid, and the pharmacy paid if the PBM discloses it. Or load the plan\'s claims file below.');
    textareaField(root, 'Claims', 'psc-claims', '00002-1433-80, 2, 2026-09-24, 1000, 25, 950');
    const o = out();
    const input = () => ({ claims: val('psc-claims') });
    const show = (r) => safe(o, () => {
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Against NADAC', value: r.bandLabel }]);
      list(o, r.notes);
      table(o, 'Largest gaps by drug', ['NDC', 'Drug', 'Claims', 'Paid', 'NADAC', 'Above NADAC'],
        r.byDrug.slice(0, 20).map((d) => [d.ndc, d.description, d.claims, SP.money(d.paid), SP.money(d.nadacCost), SP.money(d.gap)]));
      table(o, 'By month', ['Month', 'Claims', 'Paid', 'NADAC', 'Above NADAC'],
        r.byMonth.map((m) => [m.month, m.claims, SP.money(m.paid), SP.money(m.nadacCost), SP.money(m.gap)]));
      table(o, 'Claims left out', ['Line', 'NDC', 'Why'],
        r.rows.filter((x) => x.status !== 'priced').slice(0, 50).map((x) => [x.line, x.ndc ? `${x.ndc.slice(0, 5)}-${x.ndc.slice(5, 9)}-${x.ndc.slice(9)}` : '', x.reason]));
      note(o, r.note);
    });
    // The page, not the worker, loads NADAC: the worker has no network code. A result that names the
    // labelers it needs gets only those shards, then runs again.
    let seq = 0;
    let upload;
    const withNadac = (labelers, again) => {
      const mine = ++seq;
      safe(o, () => note(o, 'Looking up NADAC for the drugs in these claims...'));
      loadNadac(labelers).then((nadac) => { if (mine === seq) again(nadac); });
    };
    const run = () => {
      const args = input();
      if (upload && upload.isActive()) { upload.compute(args); return; }
      const r = SP.pharmacySpreadCheck(args);
      if (r.needLabelers) withNadac(r.needLabelers, (nadac) => show(SP.pharmacySpreadCheck({ ...args, nadac })));
      else { seq += 1; show(r); }
    };
    upload = uploadWorkbench(root, {
      id: 'psc-upload', fields: CLAIM_FIELDS, label: 'Load claims from a file',
      compute: 'pharmacy-spread-check', getInput: input,
      onResult: (r) => { if (r && r.needLabelers) withNadac(r.needLabelers, (nadac) => upload.compute({ ...input(), nadac })); else show(r); },
    });
    document.getElementById('psc-claims').addEventListener('input', () => {
      if (upload.isActive()) upload.clear('Using the claims entered above.');
    });
    root.appendChild(o);
    wire(['psc-claims'], run);
  },
};

// spec-v1623 step 3: a claims CSV goes to the tool's workbench.
export const acceptFiles = {
  'pharmacy-spread-check': acceptVia('psc-upload-file'),
};
