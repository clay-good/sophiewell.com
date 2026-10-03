// spec-v1515: local X12 file workbenches.
import { el, clear } from '../lib/dom.js';
import { MAX_FILE_BYTES } from '../lib/upload-intake.js';
import { resultRow } from '../lib/result-copy.js';
import { renderReceipt } from './receipt.js';
import { acceptVia } from '../lib/hand-off.js';
import { checkPasBundle } from '../lib/pas-bundle-check.js';
import { loadPasProfiles } from '../lib/pas-profiles-load.js';
import { fileFacts, receiptFor } from '../lib/receipt-worker.js';

const workerUrl = new URL('../lib/x12-835-worker.js', import.meta.url);
const claimWorkerUrl = new URL('../lib/x12-837-worker.js', import.meta.url);
const eligibilityWorkerUrl = new URL('../lib/x12-271-worker.js', import.meta.url);
const statusWorkerUrl = new URL('../lib/x12-277-worker.js', import.meta.url);
const hptWorkerUrl = new URL('../lib/hpt-worker.js', import.meta.url);
const hptCompareWorkerUrl = new URL('../lib/hpt-compare-worker.js', import.meta.url);
const analysisWorkerUrl = new URL('../lib/remittance-analysis-worker.js', import.meta.url);

function table(root, caption, headers, rows) {
  const wrap = el('div', { class: 'upload-mapping-scroll' });
  const node = el('table', { class: 'upload-mapping-table' });
  node.appendChild(el('caption', { text: caption }));
  const head = el('tr');
  headers.forEach((header) => head.appendChild(el('th', { scope: 'col', text: header })));
  node.appendChild(el('thead', null, [head]));
  const body = el('tbody');
  rows.forEach((values) => {
    const row = el('tr');
    values.forEach((value) => row.appendChild(el('td', { text: value == null ? '' : String(value) })));
    body.appendChild(row);
  });
  node.appendChild(body); wrap.appendChild(node); root.appendChild(wrap);
}

function claimStatusTable(root, headers, rows) {
  const wrap = el('div', { class: 'upload-mapping-scroll' }); const node = el('table', { class: 'upload-mapping-table' });
  node.appendChild(el('caption', { text: 'Claims, rejected first' }));
  const head = el('tr'); [...headers, 'Code lookup'].forEach((header) => head.appendChild(el('th', { scope: 'col', text: header }))); node.appendChild(el('thead', null, [head]));
  const body = el('tbody'); rows.forEach((values) => {
    const row = el('tr'); values.forEach((value) => row.appendChild(el('td', { text: value == null ? '' : String(value) })));
    const lookup = el('td'); lookup.appendChild(el('a', { href: 'https://x12.org/codes', target: '_blank', rel: 'noreferrer', text: 'Look up raw codes' })); row.appendChild(lookup); body.appendChild(row);
  });
  node.appendChild(body); wrap.appendChild(node); root.appendChild(wrap);
}

function reader835(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Reads X12 835 version 5010 remittances locally, checks each service line and claim, then reconciles claim payments and provider-level adjustments to BPR02. Raw adjustment codes are preserved.' }));
  root.appendChild(el('p', { class: 'muted', text: 'Choose one or more X12 text files, up to 50 MB each. Files stay in this tab.' }));
  const input = el('input', { id: 'x835-files', type: 'file', multiple: true, accept: '.835,.txt,text/plain,application/octet-stream' });
  const status = el('p', { id: 'x835-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'x835-files', text: 'Choose remittance files' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  const stop = () => { if (worker) worker.terminate(); worker = null; };

  input.addEventListener('change', async () => {
    stop(); clear(results);
    const files = [...(input.files || [])];
    if (!files.length) { status.textContent = ''; return; }
    const tooLarge = files.find((file) => file.size > MAX_FILE_BYTES);
    if (tooLarge) { status.textContent = `${tooLarge.name} exceeds the 50 MB limit.`; return; }
    status.textContent = `Reading ${files.length.toLocaleString('en-US')} ${files.length === 1 ? 'file' : 'files'} locally...`;
    try {
      const payload = await Promise.all(files.map(async (file) => ({ name: file.name, buffer: await file.arrayBuffer() })));
      worker = new window.Worker(workerUrl, { type: 'module' });
      worker.addEventListener('error', () => { status.textContent = 'The remittance could not be read. Choose it again.'; stop(); });
      worker.addEventListener('message', (event) => {
        const message = event.data || {};
        if (message.type === 'error') { status.textContent = message.message; return; }
        if (message.type === 'download') {
          const url = window.URL.createObjectURL(message.blob); const anchor = el('a', { href: url, download: message.filename });
          anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 0); return;
        }
        if (message.type !== 'parsed') return;
        const t = message.totals; const allClaims = t.balancedClaims === t.claims; const allPayments = t.balancedPayments === t.transactions;
        status.textContent = `${t.files.toLocaleString('en-US')} ${t.files === 1 ? 'file' : 'files'} read.`;
        resultRow(results, [
          { text: `${t.balancedClaims.toLocaleString('en-US')} of ${t.claims.toLocaleString('en-US')} claims balance; ${t.balancedPayments.toLocaleString('en-US')} of ${t.transactions.toLocaleString('en-US')} payments reconcile.`, cls: allClaims && allPayments ? null : 'warn' },
          { label: 'Patient responsibility', value: `$${(t.patientResponsibilityCents / 100).toFixed(2)}` },
        ]);
        results.appendChild(el('p', { class: 'muted', text: `${t.lines.toLocaleString('en-US')} service lines; ${t.balancedLines.toLocaleString('en-US')} balance. A claim residual includes its claim-level and service-line CAS adjustments.` }));
        const shown = message.preview.rows.length;
        results.appendChild(el('p', { class: 'muted', text: message.preview.total > shown ? `Showing the first ${shown} of ${message.preview.total} claims. Downloads include every claim.` : `Showing all ${shown} claims.` }));
        table(results, 'Remittance claims', message.preview.headers, message.preview.rows);
        for (const [flavor, label] of [['full', 'Download claims CSV'], ['redacted', 'Download redacted CSV']]) {
          const wrap = el('p'); const button = el('button', { type: 'button', text: label });
          button.addEventListener('click', () => worker.postMessage({ type: 'download', flavor }));
          wrap.appendChild(button); results.appendChild(wrap);
        }
        results.appendChild(el('p', { class: 'muted', text: 'Structural and arithmetic checks only. Raw X12 code values are shown without proprietary code-list descriptions.' }));
        renderReceipt(results, message);
      });
      worker.postMessage({ type: 'parse', files: payload }, payload.map((file) => file.buffer));
    } catch (error) { status.textContent = error instanceof Error ? error.message : 'The remittance could not be read.'; stop(); }
  });
}

const money = (value) => `$${(value / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function transferFiles(files) {
  return Promise.all(files.map(async (file) => ({ name: file.name, buffer: await file.arrayBuffer() })));
}

function downloadMessage(worker, message) {
  const url = window.URL.createObjectURL(message.blob); const anchor = el('a', { href: url, download: message.filename });
  anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

function downloads(root, worker) {
  for (const [flavor, label] of [['full', 'Download results CSV'], ['redacted', 'Download redacted CSV']]) {
    const wrap = el('p'); const button = el('button', { type: 'button', text: label });
    button.addEventListener('click', () => worker.postMessage({ type: 'download', flavor }));
    wrap.appendChild(button); root.appendChild(wrap);
  }
}

function summaryTable(root, caption, values) {
  table(root, caption, ['Item', 'Amount'], values.map((row) => [row.label, money(row.amountCents)]));
}

function denialPattern(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Groups remittance adjustments by category, raw reason code, payer, billing code and rendering provider, then compares the latest two payment months.' }));
  const input = el('input', { id: 'dpr-files', type: 'file', multiple: true, accept: '.835,.txt,text/plain,application/octet-stream' });
  const status = el('p', { id: 'dpr-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'dpr-files', text: 'Choose monthly or quarterly 835 files' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  input.addEventListener('change', async () => {
    if (worker) worker.terminate(); clear(results);
    const files = [...(input.files || [])]; if (!files.length) return;
    if (files.some((file) => file.size > MAX_FILE_BYTES)) { status.textContent = 'Each file must be 50 MB or smaller.'; return; }
    status.textContent = 'Reading the remittances locally...';
    const payload = await transferFiles(files); worker = new window.Worker(analysisWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The remittances could not be analyzed.'; });
    worker.addEventListener('message', (event) => {
      const message = event.data || {};
      if (message.type === 'error') { status.textContent = message.message; return; }
      if (message.type === 'download') { downloadMessage(worker, message); return; }
      if (message.type !== 'denial-result') return;
      const value = message.result; status.textContent = `${files.length.toLocaleString('en-US')} ${files.length === 1 ? 'file' : 'files'} analyzed.`;
      resultRow(results, [{ text: `${value.adjustmentCount.toLocaleString('en-US')} adjustments total ${money(value.totalCents)}.`, cls: value.totalCents < 0 ? 'warn' : null }, { label: 'Largest category share', value: value.topCategoryShare == null ? 'Not available' : `${value.topCategoryShare}%` }]);
      if (value.monthChange) results.appendChild(el('p', { text: `${value.monthChange.currentMonth} changed by ${money(value.monthChange.changeCents)} from ${value.monthChange.previousMonth}${value.monthChange.changePercent == null ? '' : ` (${value.monthChange.changePercent}%)`}.` }));
      summaryTable(results, 'Adjusted dollars by category', value.byCategory);
      summaryTable(results, 'Adjusted dollars by reason code', value.byReason);
      summaryTable(results, 'Adjusted dollars by payer', value.byPayer);
      summaryTable(results, 'Adjusted dollars by billing code', value.byBillingCode);
      summaryTable(results, 'Adjusted dollars by rendering provider', value.byProvider);
      const shown = message.preview.rows.length; results.appendChild(el('p', { class: 'muted', text: message.preview.total > shown ? `Showing the first ${shown} of ${message.preview.total} adjustments.` : `Showing all ${shown} adjustments.` }));
      table(results, 'Adjustment detail', message.preview.headers, message.preview.rows); downloads(results, worker);
      results.appendChild(el('p', { class: 'muted', text: 'Categories use the same reviewed reason-code mapping as Denial Next Step. Unmapped codes remain visible and are never guessed.' }));
      renderReceipt(results, message);
    });
    worker.postMessage({ type: 'parse-remittances', tool: 'denial-pattern-report', files: payload }, payload.map((file) => file.buffer));
  });
}

function underpayment(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Compares each 835 service line’s allowed amount with the fee schedule you supply. The site ships no payer rates.' }));
  const remit = el('input', { id: 'upc-remittances', type: 'file', multiple: true, accept: '.835,.txt,text/plain,application/octet-stream' });
  const fees = el('input', { id: 'upc-fees', type: 'file', accept: '.csv,.tsv,text/csv,text/tab-separated-values' });
  const status = el('p', { id: 'upc-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const mapping = el('div', { hidden: true }); const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'upc-remittances', text: 'Choose 835 remittance files' })); root.appendChild(remit);
  root.appendChild(el('p', { class: 'muted', text: 'Then choose a fee schedule with billing code, optional modifier, and either contracted amount or reference amount plus contract percent.' }));
  root.appendChild(el('label', { for: 'upc-fees', text: 'Choose fee schedule CSV or TSV' })); root.appendChild(fees); root.appendChild(status); root.appendChild(mapping); root.appendChild(results);
  let worker = null; let remittancesReady = false;
  function listen() {
    worker.addEventListener('error', () => { status.textContent = 'The files could not be analyzed.'; });
    worker.addEventListener('message', (event) => {
      const message = event.data || {};
      if (message.type === 'error') { status.textContent = message.message; return; }
      if (message.type === 'download') { downloadMessage(worker, message); return; }
      if (message.type === 'remittances-ready') { remittancesReady = true; status.textContent = `${message.fileCount} remittance ${message.fileCount === 1 ? 'file is' : 'files are'} ready; choose the fee schedule.`; return; }
      if (message.type === 'fees-parsed') {
        clear(mapping); mapping.hidden = false;
        const scroll = el('div', { class: 'upload-mapping-scroll' }); const node = el('table', { class: 'upload-mapping-table' });
        node.appendChild(el('caption', { text: `Match columns for ${message.rowCount.toLocaleString('en-US')} fee rows` }));
        node.appendChild(el('thead', null, [el('tr', null, [el('th', { scope: 'col', text: 'Needed field' }), el('th', { scope: 'col', text: 'File column' })])]));
        const body = el('tbody'); message.fields.forEach((field) => {
          const row = el('tr'); row.appendChild(el('th', { scope: 'row', text: field.label + (field.required ? ' (required)' : '') }));
          const cell = el('td'); const select = el('select', { id: `upc-map-${field.id}`, 'aria-label': `File column for ${field.label}` });
          select.appendChild(el('option', { value: '', text: 'Not mapped' })); message.headers.forEach((header, index) => select.appendChild(el('option', { value: String(index), text: header })));
          if (Number.isInteger(message.mapping[field.id])) select.value = String(message.mapping[field.id]); cell.appendChild(select); row.appendChild(cell); body.appendChild(row);
        }); node.appendChild(body); scroll.appendChild(node); mapping.appendChild(scroll);
        const use = el('button', { type: 'button', text: `Use ${message.rowCount.toLocaleString('en-US')} fee rows` });
        use.addEventListener('click', () => worker.postMessage({ type: 'map-fees', mapping: Object.fromEntries(message.fields.map((field) => { const value = document.getElementById(`upc-map-${field.id}`).value; return [field.id, value === '' ? null : Number(value)]; })) }));
        mapping.appendChild(use); status.textContent = 'Review the fee schedule columns, then use the rows.'; return;
      }
      if (message.type !== 'underpayment-result') return;
      mapping.hidden = true; clear(results); const value = message.result; status.textContent = 'Contract comparison complete.';
      resultRow(results, [{ text: `${value.underpaidLines.toLocaleString('en-US')} of ${value.matchedLines.toLocaleString('en-US')} matched lines ${value.underpaidLines === 1 ? 'was' : 'were'} paid below contract, totaling ${money(value.varianceCents)}.`, cls: value.underpaidLines ? 'warn' : null }, { label: 'Unmatched lines', value: value.unmatchedLines.toLocaleString('en-US') }]);
      summaryTable(results, 'Underpayment variance by payer', value.byPayer); summaryTable(results, 'Underpayment variance by billing code', value.byBillingCode);
      const shown = message.preview.rows.length; results.appendChild(el('p', { class: 'muted', text: message.preview.total > shown ? `Showing the first ${shown} of ${message.preview.total} underpaid lines.` : `Showing all ${shown} underpaid lines.` }));
      table(results, 'Lines paid below contract', message.preview.headers, message.preview.rows); downloads(results, worker);
      results.appendChild(el('p', { class: 'muted', text: 'Allowed amount is billed charge minus CO adjustments. Modifier-specific fee rows take precedence over the code-only rate.' }));
      renderReceipt(results, message);
    });
  }
  remit.addEventListener('change', async () => {
    if (worker) worker.terminate(); worker = new window.Worker(analysisWorkerUrl, { type: 'module' }); listen(); remittancesReady = false; clear(results); mapping.hidden = true;
    const files = [...(remit.files || [])]; if (!files.length) return; if (files.some((file) => file.size > MAX_FILE_BYTES)) { status.textContent = 'Each remittance must be 50 MB or smaller.'; return; }
    const payload = await transferFiles(files); status.textContent = 'Reading the remittances locally...'; worker.postMessage({ type: 'parse-remittances', tool: 'underpayment-check', files: payload }, payload.map((file) => file.buffer));
  });
  fees.addEventListener('change', async () => {
    const file = fees.files && fees.files[0]; if (!file) return; if (!remittancesReady || !worker) { status.textContent = 'Choose the remittance files first.'; return; }
    if (file.size > MAX_FILE_BYTES) { status.textContent = 'The fee schedule exceeds the 50 MB limit.'; return; }
    const buffer = await file.arrayBuffer(); worker.postMessage({ type: 'parse-fees', buffer, fileName: file.name }, [buffer]);
  });
}

function check837(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Checks X12 837P and 837I claim files locally for envelope integrity, identifier formats, diagnosis-code structure, date logic and claim-to-line charge totals.' }));
  root.appendChild(el('p', { class: 'muted', text: 'Structural and arithmetic checks only. This does not apply a payer’s edits or X12 situational rules.' }));
  const input = el('input', { id: 'x837-files', type: 'file', multiple: true, accept: '.837,.txt,text/plain,application/octet-stream' });
  const status = el('p', { id: 'x837-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'x837-files', text: 'Choose claim files' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  input.addEventListener('change', async () => {
    if (worker) worker.terminate(); clear(results);
    const files = [...(input.files || [])]; if (!files.length) return;
    if (files.some((file) => file.size > MAX_FILE_BYTES)) { status.textContent = 'Each file must be 50 MB or smaller.'; return; }
    status.textContent = 'Checking the claim files locally...'; const payload = await transferFiles(files);
    worker = new window.Worker(claimWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The claim files could not be checked.'; });
    worker.addEventListener('message', (event) => {
      const message = event.data || {};
      if (message.type === 'error') { status.textContent = message.message; return; }
      if (message.type === 'download') { downloadMessage(worker, message); return; }
      if (message.type !== 'parsed') return;
      const value = message.totals; status.textContent = `${value.files.toLocaleString('en-US')} ${value.files === 1 ? 'file' : 'files'} checked.`;
      resultRow(results, [{ text: `${value.clean.toLocaleString('en-US')} of ${value.claims.toLocaleString('en-US')} claims passed all checks; ${value.failing.toLocaleString('en-US')} failed.`, cls: value.failing ? 'warn' : null }, { label: 'Findings', value: value.findings.toLocaleString('en-US') }]);
      const shown = message.preview.rows.length; results.appendChild(el('p', { class: 'muted', text: message.preview.total > shown ? `Showing the first ${shown} of ${message.preview.total} claims.` : `Showing all ${shown} claims.` }));
      table(results, 'Claim check results', message.preview.headers, message.preview.rows); downloads(results, worker);
      results.appendChild(el('p', { class: 'muted', text: 'Identifier checks prove format and check digits only. Diagnosis checks prove structure only. Raw X12 code values are preserved without code-list descriptions.' }));
        renderReceipt(results, message);
    });
    worker.postMessage({ type: 'parse', files: payload }, payload.map((file) => file.buffer));
  });
}

function reader271(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Reads X12 271 eligibility responses locally and shows coverage, plan identifiers, benefit amounts, percentages, dates and network status with their raw codes.' }));
  root.appendChild(el('p', { class: 'muted', text: 'Choose a 271 text file or paste one below. The response stays in this tab. Labels are plain project wording; raw codes remain beside them for verification.' }));
  const input = el('input', { id: 'x271-file', type: 'file', accept: '.271,.txt,text/plain,application/octet-stream' });
  const paste = el('textarea', { id: 'x271-paste', rows: 8, spellcheck: 'false', placeholder: 'ISA*00*...~' });
  const readPaste = el('button', { type: 'button', text: 'Read pasted response' });
  const status = el('p', { id: 'x271-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'x271-file', text: 'Choose eligibility response' })); root.appendChild(input);
  root.appendChild(el('label', { for: 'x271-paste', text: 'Or paste an eligibility response' })); root.appendChild(paste); root.appendChild(readPaste); root.appendChild(status); root.appendChild(results);
  let worker = null;
  const run = (payload) => {
    if (worker) worker.terminate(); clear(results); status.textContent = 'Reading the eligibility response locally...';
    worker = new window.Worker(eligibilityWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The eligibility response could not be read.'; });
    worker.addEventListener('message', (event) => {
      const message = event.data || {};
      if (message.type === 'error') { status.textContent = message.message; return; }
      if (message.type === 'download') { downloadMessage(worker, message); return; }
      if (message.type !== 'parsed') return;
      const value = message.totals; status.textContent = `${value.files.toLocaleString('en-US')} ${value.files === 1 ? 'response' : 'responses'} read.`;
      resultRow(results, [{ text: `${value.active.toLocaleString('en-US')} active and ${value.inactive.toLocaleString('en-US')} inactive people reported across ${value.benefits.toLocaleString('en-US')} benefit lines.`, cls: value.errors ? 'warn' : null }, { label: 'Response errors', value: value.errors.toLocaleString('en-US') }]);
      if (message.summaries.length) {
        results.appendChild(el('h3', { text: 'Plain summary' })); const list = el('ul');
        message.summaries.forEach((item) => list.appendChild(el('li', { text: value.people > 1 ? `${item.person}: ${item.text}` : item.text }))); results.appendChild(list);
      }
      const shown = message.preview.rows.length; results.appendChild(el('p', { class: 'muted', text: message.preview.total > shown ? `Showing the first ${shown} of ${message.preview.total} benefit lines.` : `Showing all ${shown} benefit lines.` }));
      table(results, 'Eligibility benefit lines', message.preview.headers, message.preview.rows); downloads(results, worker);
      results.appendChild(el('p', { class: 'muted', text: 'Raw X12 code values are shown without X12 code-list descriptions. Confirm benefits with the payer before relying on them.' }));
        renderReceipt(results, message);
    });
    worker.postMessage({ type: 'parse', files: payload }, payload.map((file) => file.buffer));
  };
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0]; if (!file) return;
    if (file.size > MAX_FILE_BYTES) { status.textContent = 'The response exceeds the 50 MB limit.'; return; }
    run([{ name: file.name, buffer: await file.arrayBuffer() }]);
  });
  readPaste.addEventListener('click', () => {
    const text = paste.value.trim(); if (!text) { status.textContent = 'Paste a 271 response first.'; return; }
    const buffer = new TextEncoder().encode(text).buffer;
    if (buffer.byteLength > MAX_FILE_BYTES) { status.textContent = 'The pasted response exceeds the 50 MB limit.'; return; }
    run([{ name: 'pasted-eligibility.271', buffer }]);
  });
}

function reader277(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Reads X12 277 claim-status responses and 277CA claim acknowledgments locally, then lists rejected claims first with raw status, entity and action codes.' }));
  root.appendChild(el('p', { class: 'muted', text: 'Choose one or more X12 text files, up to 50 MB each. The reader does not ship code-list descriptions; each row links to the X12 code lookup.' }));
  const input = el('input', { id: 'x277-files', type: 'file', multiple: true, accept: '.277,.txt,text/plain,application/octet-stream' });
  const status = el('p', { id: 'x277-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'x277-files', text: 'Choose claim-status files' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  input.addEventListener('change', async () => {
    if (worker) worker.terminate(); clear(results);
    const files = [...(input.files || [])]; if (!files.length) return;
    if (files.some((file) => file.size > MAX_FILE_BYTES)) { status.textContent = 'Each file must be 50 MB or smaller.'; return; }
    status.textContent = 'Reading the claim-status files locally...'; const payload = await transferFiles(files);
    worker = new window.Worker(statusWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The claim-status files could not be read.'; });
    worker.addEventListener('message', (event) => {
      const message = event.data || {};
      if (message.type === 'error') { status.textContent = message.message; return; }
      if (message.type === 'download') { downloadMessage(worker, message); return; }
      if (message.type !== 'parsed') return;
      const value = message.totals; status.textContent = `${value.files.toLocaleString('en-US')} ${value.files === 1 ? 'file' : 'files'} read.`;
      resultRow(results, [{ text: `${value.rejected.toLocaleString('en-US')} rejected, ${value.pending.toLocaleString('en-US')} pending and ${value.accepted.toLocaleString('en-US')} accepted claims.`, cls: value.rejected ? 'warn' : null }, { label: 'Status records', value: value.statuses.toLocaleString('en-US') }]);
      const shown = message.preview.rows.length; results.appendChild(el('p', { class: 'muted', text: message.preview.total > shown ? `Showing the first ${shown} of ${message.preview.total} claims.` : `Showing all ${shown} claims.` }));
      claimStatusTable(results, message.preview.headers, message.preview.rows); downloads(results, worker);
      results.appendChild(el('p', { class: 'muted', text: 'Accepted, pending and rejected are workflow groupings from the raw response values. Verify the raw category, status, entity and action codes before acting.' }));
        renderReceipt(results, message);
    });
    worker.postMessage({ type: 'parse', files: payload }, payload.map((file) => file.buffer));
  });
}

function hptFileCheck(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Streams a CMS Hospital Price Transparency v3.0.0 CSV tall, CSV wide or JSON file locally and checks its required fields, accepted values and conditional rules.' }));
  root.appendChild(el('p', { class: 'muted', text: 'The file stays in this tab. There is no 50 MB workbench limit: memory stays tied to the current CSV row or JSON charge item, so the practical limit is what your browser can open.' }));
  const input = el('input', { id: 'hpt-file', type: 'file', accept: '.csv,.json,text/csv,application/json' });
  const status = el('p', { id: 'hpt-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'hpt-file', text: 'Choose a hospital price file' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  input.addEventListener('change', () => {
    if (worker) worker.terminate(); clear(results);
    const file = input.files && input.files[0]; if (!file) return;
    status.textContent = 'Checking the file locally...'; worker = new window.Worker(hptWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The hospital price file could not be checked.'; });
    worker.addEventListener('message', (event) => {
      const message = event.data || {};
      if (message.type === 'error') { status.textContent = message.message; return; }
      if (message.type === 'progress') {
        const percent = message.totalBytes ? Math.min(100, Math.floor(message.bytesRead / message.totalBytes * 100)) : 0;
        status.textContent = `Checking the file locally... ${percent.toLocaleString('en-US')}%`;
        return;
      }
      if (message.type !== 'validated') return;
      status.textContent = `${message.fileName} checked.`;
      resultRow(results, [
        { text: message.valid ? 'No v3.0.0 structural deficiencies found.' : `${message.errorCount.toLocaleString('en-US')} structural ${message.errorCount === 1 ? 'deficiency' : 'deficiencies'} found.`, cls: message.valid ? null : 'warn' },
        { label: 'Format', value: message.format }, { label: 'Charge rows or items', value: message.rowCount.toLocaleString('en-US') },
      ]);
      if (message.findings.length) table(results, message.findingsTruncated ? `First ${message.findings.length.toLocaleString('en-US')} deficiencies` : 'Deficiencies', ['Rule', 'Location', 'Finding'], message.findings.map((finding) => [finding.code, finding.location, finding.message]));
      results.appendChild(el('p', { class: 'muted', text: 'This is a deterministic structural check against CMS template v3.0.0. It does not verify that prices are complete or accurate and is not a compliance determination.' }));
      const source = el('p'); source.appendChild(el('a', { href: 'https://github.com/CMSgov/hospital-price-transparency', target: '_blank', rel: 'noreferrer', text: 'Review the official CMS data dictionary and validator' })); results.appendChild(source);
      renderReceipt(results, message);
    });
    worker.postMessage({ type: 'validate', file });
  });
}

// spec-v1515 tool 6: one code across several hospital price files, streamed in a Worker.
function hptPriceCompare(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Compares one billing code across hospital price files you downloaded (CMS v3.0.0 CSV tall, CSV wide or JSON): gross charge, discounted cash price, and each payer\'s negotiated rate, side by side.' }));
  root.appendChild(el('p', { class: 'muted', text: 'The files stay in this tab and are read in a stream, so a large file is never held whole.' }));
  const codeWrap = el('p');
  codeWrap.appendChild(el('label', { for: 'hptc-code', text: 'Billing code (CPT, HCPCS, MS-DRG or revenue code; a type may lead, as in MS-DRG 470)' }));
  codeWrap.appendChild(el('br'));
  const code = el('input', { id: 'hptc-code', type: 'text', autocomplete: 'off', placeholder: 'e.g. 70553' });
  codeWrap.appendChild(code);
  root.appendChild(codeWrap);
  const input = el('input', { id: 'hptc-files', type: 'file', multiple: true, accept: '.csv,.json,text/csv,application/json' });
  const status = el('p', { id: 'hptc-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'hptc-files', text: 'Choose two or more hospital price files' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  const run = () => {
    if (worker) worker.terminate(); clear(results);
    const files = [...(input.files || [])];
    if (!files.length) { status.textContent = ''; return; }
    if (!code.value.trim()) { status.textContent = 'Enter the billing code to compare.'; return; }
    status.textContent = 'Reading the files locally...';
    worker = new window.Worker(hptCompareWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The hospital price files could not be read.'; });
    worker.addEventListener('message', (event) => {
      const m = event.data || {};
      if (m.type === 'error') { status.textContent = m.message; return; }
      if (m.type === 'progress') { status.textContent = `Reading ${m.name} (${(m.done + 1).toLocaleString('en-US')} of ${m.total.toLocaleString('en-US')})...`; return; }
      if (m.type !== 'compared') return;
      if (!m.valid) { status.textContent = m.message; return; }
      status.textContent = `${files.length.toLocaleString('en-US')} file${files.length === 1 ? '' : 's'} read.`;
      resultRow(results, [{ text: m.band, cls: null }, { label: 'Compared', value: m.bandLabel }]);
      const money = (n) => (n == null ? '' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      if (m.table.length) table(results, `Prices for ${code.value.trim()}`, ['Hospital', 'Setting', 'Gross', 'Cash', 'Payer', 'Plan', 'Negotiated', 'Median allowed'], m.table.slice(0, 200).map((t) => [t.hospital, t.setting, money(t.gross), money(t.cash), t.payer, t.plan, t.negotiated, money(t.median)]));
      const ul = el('ul'); for (const n of m.notes) ul.appendChild(el('li', { text: n })); results.appendChild(ul);
      if (m.csv) {
        const wrap = el('p'); const button = el('button', { type: 'button', text: 'Download the comparison CSV' });
        button.addEventListener('click', () => {
          const url = window.URL.createObjectURL(new Blob([m.csv], { type: 'text/csv;charset=utf-8' }));
          const anchor = el('a', { href: url, download: `hpt-price-compare-${code.value.trim().replace(/[^A-Za-z0-9-]+/g, '-')}.csv` });
          anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
        });
        wrap.appendChild(button); results.appendChild(wrap);
      }
      renderReceipt(results, m);
    });
    worker.postMessage({ type: 'compare', files, code: code.value });
  };
  input.addEventListener('change', run);
  code.addEventListener('change', run);
}

// spec-v1515 tool 7: a Da Vinci PAS bundle checked against the guide's profiles, on the page (bundles are small).
function pasBundleCheck(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Checks a FHIR prior authorization request or response bundle against the HL7 Da Vinci Prior Authorization Support profiles: required elements, how many of each, data types, fixed values, the guide\'s own code lists, slices and extensions, and every resource the bundle references.' }));
  root.appendChild(el('p', { class: 'muted', text: 'The file stays in this tab. Codes from X12, CPT and NUBC lists are not checked against the lists, which cannot be shipped, and the profiles\' FHIRPath invariants are counted, not evaluated.' }));
  const input = el('input', { id: 'pas-file', type: 'file', accept: '.json,application/json,application/fhir+json' });
  const status = el('p', { id: 'pas-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'pas-file', text: 'Choose a prior authorization bundle (JSON)' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  input.addEventListener('change', async () => {
    clear(results);
    const file = input.files && input.files[0]; if (!file) { status.textContent = ''; return; }
    if (file.size > MAX_FILE_BYTES) { status.textContent = `${file.name} is over the 50 MB limit.`; return; }
    status.textContent = 'Checking the bundle locally...';
    const buffer = await file.arrayBuffer();
    let bundle;
    try { bundle = JSON.parse(new TextDecoder().decode(buffer)); } catch (err) { status.textContent = `${file.name} is not JSON: ${err.message}`; return; }
    const loaded = await loadPasProfiles();
    if (!loaded.set) { status.textContent = loaded.expired ? 'The bundled Da Vinci PAS profiles have passed their review date.' : 'The Da Vinci PAS profiles could not be loaded.'; return; }
    const r = checkPasBundle(bundle, loaded.set);
    if (!r.valid) { status.textContent = r.message; return; }
    status.textContent = `${file.name} checked.`;
    resultRow(results, [{ text: r.band, cls: r.errors ? 'warn' : null }, { label: 'Bundle', value: r.label }, { label: 'Warnings', value: r.warnings.toLocaleString('en-US') }]);
    if (r.findings.length) table(results, 'Findings', ['Severity', 'Location', 'Finding'], r.findings.slice(0, 500).map((f) => [f.severity, f.location, f.message]));
    const ul = el('ul');
    for (const n of [`${r.checked.toLocaleString('en-US')} resources and extensions checked against ${loaded.edition}.`, `${r.invariants.toLocaleString('en-US')} FHIRPath invariants in those profiles were not evaluated.`, 'A reference to a resource outside the bundle is a warning: it could not be checked.']) ul.appendChild(el('li', { text: n }));
    results.appendChild(ul);
    results.appendChild(el('p', { class: 'muted', text: 'A structural check against the published profiles, not a conformance certification. The HL7 FHIR validator evaluates the invariants and terminology this tool does not.' }));
    const receipts = receiptFor('pas-bundle-check', fileFacts([{ name: file.name, buffer }]), { findings: r.findings }, {}, [{ id: 'pas-profiles', sourceEdition: loaded.edition }]);
    renderReceipt(results, { receipt: receipts.receipt, shareableReceipt: receipts.shareable });
  });
}

export const renderers = { 'x12-835-reader': reader835, 'x12-837-check': check837, 'x12-271-reader': reader271, 'x12-277-reader': reader277, 'hpt-file-check': hptFileCheck, 'hpt-price-compare': hptPriceCompare, 'pas-bundle-check': pasBundleCheck, 'denial-pattern-report': denialPattern, 'underpayment-check': underpayment };

// spec-v1623 step 3: files handed off from a drop go through each tool's own
// input. underpayment-check takes the remittances; its fee schedule is chosen
// on the page.
export const acceptFiles = {
  'x12-835-reader': acceptVia('x835-files'),
  'denial-pattern-report': acceptVia('dpr-files'),
  'underpayment-check': acceptVia('upc-remittances'),
  'x12-837-check': acceptVia('x837-files'),
  'x12-271-reader': acceptVia('x271-file'),
  'x12-277-reader': acceptVia('x277-files'),
  'hpt-file-check': acceptVia('hpt-file'),
  'hpt-price-compare': acceptVia('hptc-files'),
  'pas-bundle-check': acceptVia('pas-file'),
};
