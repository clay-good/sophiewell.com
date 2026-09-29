// spec-v1515: local X12 file workbenches.
import { el, clear } from '../lib/dom.js';
import { MAX_FILE_BYTES } from '../lib/upload-intake.js';
import { resultRow } from '../lib/result-copy.js';

const workerUrl = new URL('../lib/x12-835-worker.js', import.meta.url);
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
    const buffer = await file.arrayBuffer(); worker.postMessage({ type: 'parse-fees', buffer }, [buffer]);
  });
}

export const renderers = { 'x12-835-reader': reader835, 'denial-pattern-report': denialPattern, 'underpayment-check': underpayment };
