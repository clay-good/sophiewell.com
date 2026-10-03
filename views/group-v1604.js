// spec-v1604: renderers for dpc-hsa-check, pharmacy-spread-check, tic-file-check and tic-rate-lookup.

import { el, clear } from '../lib/dom.js';
import * as DP from '../lib/dpc-hsa-check.js';
import * as SP from '../lib/pharmacy-spread-check.js';
import { loadNadac } from '../lib/nadac-load.js';
import { resultRow } from '../lib/result-copy.js';
import { uploadWorkbench } from './upload-workbench.js';
import { CLAIM_FIELDS } from '../lib/upload-fields.js';
import { acceptVia } from '../lib/hand-off.js';
import { renderReceipt } from './receipt.js';
import { TIC_SCHEMA } from '../lib/tic-schemas.js';
import { loadLocalities, loadCodeRows } from '../lib/mpfs-load.js';
import { parseQuery } from '../lib/tic-rate-lookup.js';

const ticWorkerUrl = new URL('../lib/tic-worker.js', import.meta.url);
const ticRateWorkerUrl = new URL('../lib/tic-rate-worker.js', import.meta.url);

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

// spec-v1604 tool 1: insurer price files checked against the CMS schema, streamed in a Worker.
function ticFileCheck(root) {
  root.appendChild(el('p', { class: 'notice', text: `Checks an insurer's Transparency in Coverage file (in-network rates, allowed amounts or a table of contents; JSON, plain or gzipped) against the CMS schema v${TIC_SCHEMA.version}: required fields, types, allowed values, and that every provider group a rate names is defined in the file.` }));
  root.appendChild(el('p', { class: 'muted', text: 'Choose a table of contents together with the files it names to check that each one is there and is the right type. The files stay in this tab and are read in a stream, so memory follows one item, not the file: a 1 GB file took about 90 seconds in testing.' }));
  const input = el('input', { id: 'tic-files', type: 'file', multiple: true, accept: '.json,.gz,application/json,application/gzip' });
  const status = el('p', { id: 'tic-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = out();
  root.appendChild(el('label', { for: 'tic-files', text: 'Choose one or more insurer price files' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  input.addEventListener('change', () => {
    if (worker) worker.terminate(); clear(results);
    const files = [...(input.files || [])];
    if (!files.length) { status.textContent = ''; return; }
    status.textContent = 'Checking the files locally...'; worker = new window.Worker(ticWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The insurer price file could not be checked.'; });
    worker.addEventListener('message', (event) => {
      const m = event.data || {};
      if (m.type === 'error') { status.textContent = m.message; return; }
      if (m.type === 'progress') {
        const percent = m.totalBytes ? Math.min(100, Math.floor(m.bytesRead / m.totalBytes * 100)) : 0;
        status.textContent = `Checking ${m.name}${m.total > 1 ? ` (${(m.index + 1).toLocaleString('en-US')} of ${m.total.toLocaleString('en-US')})` : ''}... ${percent.toLocaleString('en-US')}%`;
        return;
      }
      if (m.type !== 'validated') return;
      status.textContent = `${files.length.toLocaleString('en-US')} ${files.length === 1 ? 'file' : 'files'} checked.`;
      const one = m.files.length === 1 ? m.files[0] : null;
      resultRow(results, [
        { text: m.band, cls: m.valid ? null : 'warn' },
        one ? { label: 'Type', value: one.typeLabel } : { label: 'Files', value: m.files.length.toLocaleString('en-US') },
        one ? { label: 'Items', value: `${one.items.toLocaleString('en-US')} ${one.itemLabel}` } : { label: 'Schema', value: `v${m.schemaVersion}` },
      ]);
      table(results, 'Files checked', ['File', 'Type', 'Reporting entity', 'Declared version', 'Last updated', 'Items', 'Deficiencies'],
        m.files.map((f) => [f.name, f.typeLabel, f.entity || 'not stated', f.declaredVersion || 'not stated', f.lastUpdatedOn || 'not stated', f.items.toLocaleString('en-US'), f.errorCount.toLocaleString('en-US')]));
      const rows = [];
      for (const f of m.files) for (const x of f.findings) rows.push([f.name, x.code, x.location, x.message]);
      for (const x of m.cross.findings) rows.push(['Table of contents', x.code, x.location, x.message]);
      const capped = m.files.some((f) => f.findingsTruncated) || m.cross.findingsTruncated;
      table(results, capped ? 'Deficiencies (the first 200 in each file)' : 'Deficiencies', ['File', 'Rule', 'Location', 'Finding'], rows);
      list(results, m.notes);
      results.appendChild(el('p', { class: 'muted', text: 'This checks the file\'s structure against the CMS schema, not whether its rates are complete or accurate, and it is not a compliance determination. A file that fails to open or does not conform can be raised with the insurer or plan administrator, citing the rule and location above.' }));
      const source = el('p'); source.appendChild(el('a', { href: TIC_SCHEMA.url, target: '_blank', rel: 'noreferrer', text: `The CMS Transparency in Coverage schemas, ${TIC_SCHEMA.tag}` })); results.appendChild(source);
      renderReceipt(results, m);
    });
    worker.postMessage({ type: 'validate', files });
  });
}

// spec-v1604 tool 2: negotiated rates for named codes, streamed out of in-network files in a Worker and set
// beside the Medicare physician fee schedule amount for the locality chosen.
function ticRateLookup(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Finds the negotiated rates for the billing codes you name in an insurer\'s in-network rates file (JSON, plain or gzipped), and sets each professional rate beside the Medicare physician fee schedule amount for the locality you choose.' }));
  root.appendChild(el('p', { class: 'muted', text: 'The file is read once in a stream and only the matching rates are kept, so memory follows the matches, not the file: a 1 GB file takes about 90 seconds. The file stays in this tab.' }));
  textareaField(root, 'Billing codes (up to 50, separated by commas or spaces)', 'trl-codes', 'e.g. 99213, 99214, 71046');
  const prov = el('p');
  prov.appendChild(el('label', { for: 'trl-providers', text: 'Only these providers (optional): NPIs or TINs, separated by commas' }));
  prov.appendChild(el('br'));
  prov.appendChild(el('input', { id: 'trl-providers', type: 'text', autocomplete: 'off', placeholder: 'e.g. 1234567893, 12-3456789' }));
  root.appendChild(prov);
  const loc = el('p');
  loc.appendChild(el('label', { for: 'trl-locality', text: 'Medicare locality to compare with' }));
  loc.appendChild(el('br'));
  const locality = el('select', { id: 'trl-locality' });
  locality.appendChild(el('option', { value: '', text: '— choose a locality —' }));
  loc.appendChild(locality);
  root.appendChild(loc);
  const input = el('input', { id: 'trl-files', type: 'file', multiple: true, accept: '.json,.gz,application/json,application/gzip' });
  const status = el('p', { id: 'trl-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = out();
  root.appendChild(el('label', { for: 'trl-files', text: 'Choose one or more in-network rates files' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let fee = null;
  const ready = loadLocalities().then((r) => {
    fee = r;
    if (r.localities) r.localities.forEach((g, i) => locality.appendChild(el('option', { value: String(i), text: `${g.state} ${g.locality}: ${g.name}` })));
    else locality.appendChild(el('option', { value: '', text: r.expired ? 'The fee schedule has passed its review date' : 'The fee schedule could not be loaded' }));
  });
  let worker = null;
  const money = (n) => (n == null ? '' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  const run = async () => {
    if (worker) worker.terminate(); clear(results);
    const files = [...(input.files || [])];
    if (!files.length) { status.textContent = ''; return; }
    const query = parseQuery(val('trl-codes'), val('trl-providers'));
    if (query.error) { status.textContent = query.error; return; }
    await ready;
    let mpfs = null;
    if (locality.value !== '' && fee && fee.localities) {
      try { mpfs = { rows: await loadCodeRows(query.codes), gpci: fee.localities[Number(locality.value)], conversionFactor: fee.conversionFactor, edition: fee.edition }; } catch { status.textContent = 'The fee schedule could not be loaded.'; return; }
    }
    status.textContent = 'Reading the files locally...';
    worker = new window.Worker(ticRateWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The in-network rates file could not be read.'; });
    worker.addEventListener('message', (event) => {
      const m = event.data || {};
      if (m.type === 'error') { status.textContent = m.message; return; }
      if (m.type === 'progress') {
        const percent = m.totalBytes ? Math.min(100, Math.floor(m.bytesRead / m.totalBytes * 100)) : 0;
        status.textContent = `Reading ${m.name}${m.total > 1 ? ` (${(m.index + 1).toLocaleString('en-US')} of ${m.total.toLocaleString('en-US')})` : ''}... ${percent.toLocaleString('en-US')}%`;
        return;
      }
      if (m.type !== 'found') return;
      if (!m.valid) { status.textContent = m.message; return; }
      status.textContent = `${files.length.toLocaleString('en-US')} ${files.length === 1 ? 'file' : 'files'} read.`;
      resultRow(results, [{ text: m.band, cls: null }, { label: 'Priced against Medicare', value: `${m.priced.toLocaleString('en-US')} of ${m.rows.length.toLocaleString('en-US')}` }]);
      const shown = m.rows.slice(0, 200);
      table(results, m.rows.length > shown.length ? `The first ${shown.length} of ${m.rows.length.toLocaleString('en-US')} rates (all are in the CSV)` : 'Rates', ['Code', 'Provider group', 'Rate type', 'Rate', 'Billing class', 'Setting', 'Place of service', 'Modifiers', 'Expires', 'Medicare', 'Percent of Medicare', 'Medicare basis'],
        shown.map((r) => [r.code, r.providers, r.negotiatedType, r.negotiatedType === 'percentage' ? `${r.rate}%` : money(r.rate), r.billingClass, r.setting, r.serviceCodes.join(' '), r.modifiers.join(' '), r.expiration, money(r.medicare), r.pctMedicare == null ? '' : `${r.pctMedicare}%`, r.medicareBasis]));
      list(results, m.notes);
      if (mpfs && fee.stamp) note(results, fee.stamp);
      if (m.csv) {
        const wrap = el('p'); const button = el('button', { type: 'button', text: 'Download the rates CSV' });
        button.addEventListener('click', () => {
          const url = window.URL.createObjectURL(new Blob([m.csv], { type: 'text/csv;charset=utf-8' }));
          const anchor = el('a', { href: url, download: 'tic-rate-lookup.csv' });
          anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
        });
        wrap.appendChild(button); results.appendChild(wrap);
      }
      results.appendChild(el('p', { class: 'muted', text: 'A percent of Medicare is shown only for a professional dollar rate with a stated place of service, priced at the locality and fee schedule edition beside it, before any Medicare adjustment for multiple procedures, assistants or bilateral surgery. Facility rates are not priced here: the site does not hold the full outpatient (OPPS) table or hospital inpatient base rates.' }));
      renderReceipt(results, m);
    });
    worker.postMessage({ type: 'lookup', files, input: { codes: val('trl-codes'), providers: val('trl-providers') }, mpfs });
  };
  input.addEventListener('change', run);
  for (const id of ['trl-codes', 'trl-providers']) root.querySelector(`#${id}`).addEventListener('change', run);
  locality.addEventListener('change', run);
}

export const renderers = {
  'tic-file-check': ticFileCheck,
  'tic-rate-lookup': ticRateLookup,
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
  'tic-file-check': acceptVia('tic-files'),
  'tic-rate-lookup': acceptVia('trl-files'),
};
