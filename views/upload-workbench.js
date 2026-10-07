// spec-v1501 §3: reusable local-file intake and explicit column confirmation.
import { el, clear } from '../lib/dom.js';
import { MAX_FILE_BYTES, MAX_DATA_ROWS } from '../lib/upload-intake.js';
import { renderReceipt } from './receipt.js';

const workerUrl = new URL('../lib/upload-worker.js', import.meta.url);

export function uploadWorkbench(root, { id, fields, label, compute, getInput, onResult }) {
  const section = el('section', { class: 'upload-workbench', 'aria-labelledby': `${id}-title` });
  section.appendChild(el('h2', { id: `${id}-title`, text: label }));
  section.appendChild(el('p', {
    class: 'muted',
    text: `CSV, TSV or JSON records, up to 50 MB and ${MAX_DATA_ROWS.toLocaleString('en-US')} rows. The file stays in this tab.`,
  }));
  const inputLabel = el('label', { for: `${id}-file`, text: 'Choose file' });
  const input = el('input', {
    id: `${id}-file`, type: 'file', accept: '.csv,.tsv,.json,.ndjson,text/csv,text/tab-separated-values,application/json',
  });
  const status = el('p', { id: `${id}-status`, class: 'muted', role: 'status', 'aria-live': 'polite' });
  const mappingRoot = el('div', { class: 'upload-mapping', hidden: true });
  const resultsRoot = el('div', { class: 'upload-file-results', hidden: true });
  section.appendChild(inputLabel);
  section.appendChild(input);
  section.appendChild(status);
  section.appendChild(mappingRoot);
  section.appendChild(resultsRoot);
  root.appendChild(section);

  let worker = null;
  let headers = [];
  let confirmButton = null;
  let generation = 0;
  let ready = false;

  const stopWorker = () => {
    if (worker) worker.terminate();
    worker = null;
  };

  function showPreview(preview, message = {}) {
    clear(resultsRoot);
    resultsRoot.hidden = !preview;
    if (!preview) return;
    resultsRoot.appendChild(el('h4', { text: 'File results' }));
    const shown = preview.rows.length;
    resultsRoot.appendChild(el('p', {
      class: 'muted',
      text: preview.total > shown
        ? `Showing the first ${shown.toLocaleString('en-US')} of ${preview.total.toLocaleString('en-US')} rows. Downloads include all ${preview.total.toLocaleString('en-US')} rows.`
        : `Showing all ${preview.total.toLocaleString('en-US')} rows.`,
    }));
    const tableWrap = el('div', { class: 'upload-mapping-scroll' });
    const table = el('table', { class: 'upload-mapping-table' });
    table.appendChild(el('caption', { text: 'Input rows with result columns appended' }));
    const head = el('tr');
    for (const header of preview.headers) head.appendChild(el('th', { scope: 'col', text: header }));
    table.appendChild(el('thead', null, [head]));
    const body = el('tbody');
    for (const values of preview.rows) {
      const row = el('tr');
      for (const value of values) row.appendChild(el('td', { text: value === null || value === undefined ? '' : String(value) }));
      body.appendChild(row);
    }
    table.appendChild(body);
    tableWrap.appendChild(table);
    resultsRoot.appendChild(tableWrap);
    for (const [flavor, text] of [['full', 'Download results CSV'], ['redacted', 'Download redacted CSV']]) {
      const wrap = el('p');
      const button = el('button', { type: 'button', text });
      button.addEventListener('click', () => worker.postMessage({ type: 'download', flavor, compute }));
      wrap.appendChild(button);
      resultsRoot.appendChild(wrap);
    }
    renderReceipt(resultsRoot, message);
  }

  function showMapping(message) {
    headers = message.headers;
    clear(mappingRoot);
    mappingRoot.hidden = false;
    const tableWrap = el('div', { class: 'upload-mapping-scroll' });
    const table = el('table', { class: 'upload-mapping-table' });
    table.appendChild(el('caption', { text: `Match columns for ${message.rowCount.toLocaleString('en-US')} rows` }));
    const head = el('tr');
    head.appendChild(el('th', { scope: 'col', text: 'Needed field' }));
    head.appendChild(el('th', { scope: 'col', text: 'File column' }));
    table.appendChild(el('thead', null, [head]));
    const body = el('tbody');
    for (const field of fields) {
      const row = el('tr');
      row.appendChild(el('th', { scope: 'row', text: `${field.label}${field.required ? ' (required)' : ''}` }));
      const cell = el('td');
      const select = el('select', { id: `${id}-map-${field.id}`, 'aria-label': `File column for ${field.label}` });
      select.appendChild(el('option', { value: '', text: 'Not mapped' }));
      headers.forEach((header, index) => select.appendChild(el('option', { value: String(index), text: header })));
      const proposed = message.mapping[field.id];
      if (Number.isInteger(proposed)) select.value = String(proposed);
      cell.appendChild(select);
      row.appendChild(cell);
      body.appendChild(row);
    }
    table.appendChild(body);
    tableWrap.appendChild(table);
    mappingRoot.appendChild(tableWrap);
    confirmButton = el('button', { type: 'button', text: `Use ${message.rowCount.toLocaleString('en-US')} rows` });
    confirmButton.addEventListener('click', () => {
      const mapping = Object.fromEntries(fields.map((field) => {
        const value = document.getElementById(`${id}-map-${field.id}`).value;
        return [field.id, value === '' ? null : Number(value)];
      }));
      status.textContent = 'Checking the column mapping...';
      confirmButton.disabled = true;
      worker.postMessage({ type: 'map', mapping, compute, input: getInput() });
    });
    mappingRoot.appendChild(confirmButton);
    const needsChoice = [...new Set([...message.missing, ...message.ambiguous])];
    status.textContent = needsChoice.length
      ? `Choose file columns for: ${needsChoice.map((fieldId) => fields.find((field) => field.id === fieldId)?.label || fieldId).join(', ')}.`
      : 'Review the proposed columns, then use the rows.';
  }

  input.addEventListener('change', async () => {
    const currentGeneration = ++generation;
    stopWorker();
    ready = false;
    clear(mappingRoot);
    mappingRoot.hidden = true;
    showPreview(null);
    const file = input.files && input.files[0];
    if (!file) { status.textContent = ''; return; }
    if (file.size > MAX_FILE_BYTES) {
      status.textContent = 'File exceeds the 50 MB limit.';
      return;
    }
    status.textContent = 'Reading the file locally...';
    try {
      const buffer = await file.arrayBuffer();
      if (currentGeneration !== generation || !section.isConnected) return;
      worker = new window.Worker(workerUrl, { type: 'module' });
      worker.addEventListener('message', (event) => {
        if (currentGeneration !== generation) return;
        const message = event.data || {};
        if (message.type === 'error') {
          status.textContent = message.message;
          if (confirmButton) confirmButton.disabled = false;
          return;
        }
        if (message.type === 'parsed') { showMapping(message); return; }
        if (message.type === 'computed') {
          if (message.initial) {
            ready = true;
            status.textContent = `${message.rowCount.toLocaleString('en-US')} rows are in use.`;
            clear(mappingRoot);
            mappingRoot.hidden = true;
          }
          showPreview(message.preview, message);
          onResult(message.result);
          return;
        }
        if (message.type === 'download') {
          const url = window.URL.createObjectURL(message.blob);
          const anchor = el('a', { href: url, download: message.filename });
          anchor.click();
          window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
        }
      });
      worker.addEventListener('error', () => {
        status.textContent = 'The file could not be read. Choose it again.';
        stopWorker();
      });
      worker.postMessage({ type: 'parse', buffer, fields, fileName: file.name }, [buffer]);
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'The file could not be read.';
      stopWorker();
    }
  });

  return {
    isActive() { return ready; },
    compute(input) {
      if (ready && worker) worker.postMessage({ type: 'compute', compute, input });
    },
    clear(message = '') {
      generation += 1;
      stopWorker();
      ready = false;
      input.value = '';
      clear(mappingRoot);
      mappingRoot.hidden = true;
      showPreview(null);
      status.textContent = message;
    },
  };
}
