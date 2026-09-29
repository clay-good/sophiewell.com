import { el, clear } from '../lib/dom.js';
import { MAX_FILE_BYTES, MAX_DATA_ROWS } from '../lib/upload-intake.js';
import { resultRow } from '../lib/result-copy.js';

const workerUrl = new URL('../lib/rx-match-worker.js', import.meta.url);
const FILES = [
  { name: 'prescriptions', label: 'Prescriptions', fields: [
    { id: 'patient_reference', label: 'Patient reference', required: true, sensitive: true, synonyms: ['patient', 'patient id', 'member id'] },
    { id: 'prescriber_npi', label: 'Prescriber NPI', required: true, synonyms: ['npi', 'rx prescriber npi'] },
    { id: 'ndc', label: 'NDC', required: true, synonyms: ['drug ndc'] },
    { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date filled', 'dispense date'] },
    { id: 'pharmacy', label: 'Pharmacy', required: true, synonyms: ['pharmacy name', 'pharmacy id'] },
    { id: 'orphan_designated', label: 'Orphan designated', required: true, synonyms: ['orphan designation', 'orphan drug'] },
  ] },
  { name: 'encounters', label: 'Encounters', fields: [
    { id: 'patient_reference', label: 'Patient reference', required: true, sensitive: true, synonyms: ['patient', 'patient id', 'member id'] },
    { id: 'encounter_date', label: 'Encounter date', required: true, synonyms: ['visit date', 'date of service'] },
    { id: 'location', label: 'Location', required: true, synonyms: ['site', 'clinic'] },
    { id: 'provider_npi', label: 'Provider NPI', required: true, synonyms: ['npi', 'encounter provider npi'] },
  ] },
  { name: 'prescribers', label: 'Eligible prescribers', fields: [
    { id: 'npi', label: 'NPI', required: true, synonyms: ['prescriber npi', 'provider npi'] },
    { id: 'relationship', label: 'Relationship', required: true, synonyms: ['arrangement', 'provider relationship'] },
  ] },
  { name: 'sites', label: 'Registered sites', fields: [
    { id: 'location', label: 'Location', required: true, synonyms: ['site', 'site name', 'clinic'] },
  ] },
];

function renderTable(root, caption, headers, rows) {
  const wrap = el('div', { class: 'upload-mapping-scroll' });
  const table = el('table', { class: 'upload-mapping-table' });
  table.appendChild(el('caption', { text: caption }));
  const head = el('tr');
  headers.forEach((header) => head.appendChild(el('th', { scope: 'col', text: header })));
  table.appendChild(el('thead', null, [head]));
  const body = el('tbody');
  rows.forEach((values) => {
    const row = el('tr');
    values.forEach((value) => {
      const cell = el('td');
      if (value instanceof window.Node) cell.appendChild(value);
      else cell.textContent = value === null || value === undefined ? '' : String(value);
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
  table.appendChild(body); wrap.appendChild(table); root.appendChild(wrap);
}

export function rxMatchWorkbench(root, { entityTypes }) {
  const policy = el('section', { 'aria-labelledby': 'rxm-policy-title' });
  policy.appendChild(el('h2', { id: 'rxm-policy-title', text: 'Entity policy' }));
  const entity = el('select', { id: 'rxm-entity' });
  entity.appendChild(el('option', { value: '', text: '— choose —' }));
  entityTypes.forEach((option) => entity.appendChild(el('option', { value: option.value, text: option.text })));
  const entityWrap = el('p', null, [el('label', { for: 'rxm-entity', text: 'Covered entity type for the orphan-drug rule' }), el('br'), entity]);
  const lookback = el('input', { id: 'rxm-lookback', type: 'number', min: '1', max: '3650', step: '1', inputmode: 'numeric', placeholder: 'e.g. 365' });
  const lookbackWrap = el('p', null, [el('label', { for: 'rxm-lookback', text: 'Look-back window, days' }), el('br'), lookback]);
  const referral = el('select', { id: 'rxm-referral' }, [
    el('option', { value: '', text: '— choose —' }), el('option', { value: 'yes', text: 'Yes' }), el('option', { value: 'no', text: 'No' }),
  ]);
  const referralWrap = el('p', null, [el('label', { for: 'rxm-referral', text: 'Does an eligible referral count?' }), el('br'), referral]);
  policy.appendChild(entityWrap); policy.appendChild(lookbackWrap); policy.appendChild(referralWrap); root.appendChild(policy);

  const status = el('p', { id: 'rxm-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'rxm-results', 'aria-live': 'polite' });
  const worker = new window.Worker(workerUrl, { type: 'module' });
  const mapped = new Set();
  const fileUi = new Map();
  root.appendChild(el('p', { class: 'muted', text: `Each CSV or TSV may contain up to ${MAX_DATA_ROWS.toLocaleString('en-US')} rows and 50 MB. Files stay in this tab.` }));

  const getPolicy = () => ({ entityType: entity.value, lookbackDays: lookback.value, referralCounts: referral.value });
  const run = () => { if (mapped.size === FILES.length) worker.postMessage({ type: 'compute', policy: getPolicy() }); };
  for (const config of FILES) {
    const section = el('section', { 'aria-labelledby': `rxm-${config.name}-title` });
    section.appendChild(el('h2', { id: `rxm-${config.name}-title`, text: config.label }));
    const input = el('input', { id: `rxm-${config.name}-file`, type: 'file', accept: '.csv,.tsv,text/csv,text/tab-separated-values' });
    const mappingRoot = el('div', { hidden: true });
    const fileStatus = el('p', { id: `rxm-${config.name}-status`, class: 'muted' });
    section.appendChild(el('label', { for: `rxm-${config.name}-file`, text: `Choose ${config.label.toLowerCase()} file` }));
    section.appendChild(input); section.appendChild(fileStatus); section.appendChild(mappingRoot); root.appendChild(section);
    fileUi.set(config.name, { config, input, mappingRoot, fileStatus });
    input.addEventListener('change', async () => {
      mapped.delete(config.name); clear(results); status.textContent = '';
      const file = input.files && input.files[0];
      if (!file) return;
      if (file.size > MAX_FILE_BYTES) { fileStatus.textContent = 'File exceeds the 50 MB limit.'; return; }
      fileStatus.textContent = 'Reading the file locally...';
      const buffer = await file.arrayBuffer();
      worker.postMessage({ type: 'parse', dataset: config.name, buffer, fields: config.fields, fileName: file.name }, [buffer]);
    });
  }

  function showMapping(message) {
    const ui = fileUi.get(message.dataset); clear(ui.mappingRoot); ui.mappingRoot.hidden = false;
    const rows = ui.config.fields.map((field) => {
      const select = el('select', { id: `rxm-${message.dataset}-map-${field.id}`, 'aria-label': `File column for ${field.label}` });
      select.appendChild(el('option', { value: '', text: 'Not mapped' }));
      message.headers.forEach((header, index) => select.appendChild(el('option', { value: String(index), text: header })));
      if (Number.isInteger(message.mapping[field.id])) select.value = String(message.mapping[field.id]);
      return [el('span', { text: `${field.label}${field.required ? ' (required)' : ''}` }), select];
    });
    renderTable(ui.mappingRoot, `Match columns for ${message.rowCount.toLocaleString('en-US')} ${message.dataset} rows`, ['Needed field', 'File column'], rows);
    const button = el('button', { type: 'button', text: `Use ${message.rowCount.toLocaleString('en-US')} ${message.dataset} rows` });
    button.addEventListener('click', () => {
      const mapping = Object.fromEntries(ui.config.fields.map((field) => {
        const value = document.getElementById(`rxm-${message.dataset}-map-${field.id}`).value;
        return [field.id, value === '' ? null : Number(value)];
      }));
      worker.postMessage({ type: 'map', dataset: message.dataset, mapping });
    });
    ui.mappingRoot.appendChild(button);
    const needs = [...new Set([...message.missing, ...message.ambiguous])];
    ui.fileStatus.textContent = needs.length ? `Choose file columns for: ${needs.map((id) => ui.config.fields.find((field) => field.id === id)?.label || id).join(', ')}.` : 'Review the proposed columns, then use the rows.';
  }

  function showResult(message) {
    clear(results);
    const result = message.result;
    if (!result.valid) { results.appendChild(el('p', { class: 'muted', text: result.message })); return; }
    resultRow(results, [{ text: result.band, cls: null }, { label: 'Matches', value: result.bandLabel }]);
    renderTable(results, 'Match rate by pharmacy', ['Pharmacy', 'Eligible', 'Total', 'Rate'], result.pharmacyRates.map((row) => [row.label, row.eligible, row.total, `${row.rate}%`]));
    renderTable(results, 'Match rate by prescriber', ['Prescriber NPI', 'Eligible', 'Total', 'Rate'], result.prescriberRates.map((row) => [row.label, row.eligible, row.total, `${row.rate}%`]));
    if (message.preview) {
      const shown = message.preview.rows.length;
      results.appendChild(el('p', { class: 'muted', text: message.preview.total > shown ? `Showing the first ${shown} of ${message.preview.total} prescription rows. Downloads include every row.` : `Showing all ${shown} prescription rows.` }));
      renderTable(results, 'Prescriptions with match results appended', message.preview.headers, message.preview.rows);
      for (const [flavor, label] of [['full', 'Download results CSV'], ['redacted', 'Download redacted CSV']]) {
        const wrap = el('p'); const button = el('button', { type: 'button', text: label });
        button.addEventListener('click', () => worker.postMessage({ type: 'download', flavor }));
        wrap.appendChild(button); results.appendChild(wrap);
      }
    }
    results.appendChild(el('p', { class: 'muted', text: result.note }));
  }

  worker.addEventListener('message', (event) => {
    const message = event.data || {};
    if (message.type === 'error') { status.textContent = message.message; return; }
    if (message.type === 'parsed') { showMapping(message); return; }
    if (message.type === 'mapped') {
      const ui = fileUi.get(message.dataset); mapped.add(message.dataset); clear(ui.mappingRoot); ui.mappingRoot.hidden = true;
      ui.fileStatus.textContent = `${message.rowCount.toLocaleString('en-US')} rows are in use.`;
      status.textContent = mapped.size === FILES.length ? 'All four files are ready.' : `${mapped.size} of ${FILES.length} files are ready.`;
      run(); return;
    }
    if (message.type === 'computed') { showResult(message); return; }
    if (message.type === 'download') {
      const url = window.URL.createObjectURL(message.blob); const anchor = el('a', { href: url, download: message.filename });
      anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
    }
  });
  worker.addEventListener('error', () => { status.textContent = 'The files could not be processed. Choose them again.'; });
  for (const input of [entity, lookback, referral]) { input.addEventListener('input', run); input.addEventListener('change', run); }
  root.appendChild(status); root.appendChild(results);
}
