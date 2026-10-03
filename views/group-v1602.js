// spec-v1602: renderers for carin-eob-reader (reading your own claims file).

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import { renderReceipt } from './receipt.js';
import { acceptVia } from '../lib/hand-off.js';
import { usd, OUTCOME_LABEL } from '../lib/carin-eob-reader.js';

const carinWorkerUrl = new URL('../lib/carin-worker.js', import.meta.url);

function table(root, caption, heads, rows) {
  if (!rows.length) return;
  const t = el('table', { class: 'upload-mapping-table' });
  t.appendChild(el('caption', { text: caption }));
  const hr = el('tr');
  for (const h of heads) hr.appendChild(el('th', { scope: 'col', text: h }));
  t.appendChild(el('thead', null, [hr]));
  const body = el('tbody');
  for (const r of rows) {
    const tr = el('tr');
    for (const c of r) tr.appendChild(c instanceof Node ? el('td', null, [c]) : el('td', { text: String(c) }));
    body.appendChild(tr);
  }
  t.appendChild(body);
  root.appendChild(el('div', { class: 'upload-mapping-scroll' }, [t]));
}

const NETWORK = { innetwork: 'In network', outofnetwork: 'Out of network', other: 'Other' };
const TOOL_NAME = { 'denial-next-step': 'Denial next step', 'nsa-cost-share': 'Surprise-billing cost share', 'preventive-cost-share-check': 'Preventive care cost check' };

function carinEobReader(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Reads the claims file your health plan gives you through its Patient Access API (CARIN Blue Button ExplanationOfBenefit records, as a FHIR Bundle or NDJSON) into a table of claims, totals by year for checking your out-of-pocket maximum, and the claims worth asking your plan about.' }));
  root.appendChild(el('p', { class: 'muted', text: 'The file stays in this tab. Amounts the file does not state are shown as not stated, never as zero.' }));
  const pct = el('p');
  pct.appendChild(el('label', { for: 'cer-coins', text: 'Your plan\'s coinsurance, percent (optional; checks each line\'s coinsurance against it)' }));
  pct.appendChild(el('br'));
  pct.appendChild(el('input', { id: 'cer-coins', type: 'number', min: '0', max: '100', step: '1', inputmode: 'decimal', placeholder: 'e.g. 20' }));
  root.appendChild(pct);
  const input = el('input', { id: 'cer-files', type: 'file', multiple: true, accept: '.json,.ndjson,application/json,application/fhir+json' });
  const status = el('p', { id: 'cer-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'cer-files', text: 'Choose your claims file' })); root.appendChild(input); root.appendChild(status); root.appendChild(results);
  let worker = null;
  const run = async () => {
    if (worker) worker.terminate(); clear(results);
    const files = [...(input.files || [])];
    if (!files.length) { status.textContent = ''; return; }
    status.textContent = 'Reading the file locally...';
    const payload = await Promise.all(files.map(async (f) => ({ name: f.name, buffer: await f.arrayBuffer() })));
    worker = new window.Worker(carinWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The claims file could not be read.'; });
    worker.addEventListener('message', (event) => {
      const m = event.data || {};
      if (m.type === 'error') { status.textContent = m.message; return; }
      if (m.type !== 'read') return;
      if (!m.valid) { status.textContent = m.message; return; }
      status.textContent = `${files.length.toLocaleString('en-US')} ${files.length === 1 ? 'file' : 'files'} read.`;
      resultRow(results, [{ text: m.band, cls: m.flags.length ? 'warn' : null }, { label: 'Claims', value: m.claims.length.toLocaleString('en-US') }]);
      table(results, 'Worth asking your plan about', ['Claim', 'What', 'The fact it rests on', 'Next'], m.flags.map((f) => [f.claim, f.flag, f.fact, f.tool ? el('a', { href: `#${f.tool}`, text: TOOL_NAME[f.tool] || f.tool }) : '']));
      table(results, 'Totals by year (for your out-of-pocket maximum)', ['Year', 'Claims', 'Billed', 'Allowed', 'Plan paid', 'You pay'],
        m.years.map((y) => [y.year, y.claims.toLocaleString('en-US'), ...['billed', 'allowed', 'planPaid', 'memberLiability'].map((k) => `${usd(y[k])}${y.missing[k] ? ` (${y.missing[k]} not stated)` : ''}`)]));
      const shown = m.claims.slice(0, 200);
      table(results, m.claims.length > shown.length ? `The first ${shown.length} of ${m.claims.length.toLocaleString('en-US')} claims (all are in the CSV)` : 'Claims', ['Claim', 'Type', 'Date', 'Provider', 'Network', 'Outcome', 'Billed', 'Allowed', 'Plan paid', 'You pay', 'Reason codes'],
        shown.map((c) => [c.id, c.type, c.date, c.provider, NETWORK[c.network] || c.network, OUTCOME_LABEL[c.outcome] || c.outcome, usd(c.amounts.billed), usd(c.amounts.allowed), usd(c.amounts.planPaid), usd(c.amounts.memberLiability), c.reasons.join(' ')]));
      if (m.csv) {
        const wrap = el('p'); const button = el('button', { type: 'button', text: 'Download the claims CSV' });
        button.addEventListener('click', () => {
          const url = window.URL.createObjectURL(new Blob([m.csv], { type: 'text/csv;charset=utf-8' }));
          const anchor = el('a', { href: url, download: 'claims.csv' });
          anchor.click(); window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
        });
        wrap.appendChild(button); results.appendChild(wrap);
      }
      results.appendChild(el('p', { class: 'muted', text: 'A flag is a question worth asking your plan, not a finding that you were overcharged. Each states the fact from your file it rests on. Reason codes are shown as the plan sent them; preventive care other than preventive medicine visits is not checked yet.' }));
      renderReceipt(results, m);
    });
    worker.postMessage({ type: 'read', files: payload, options: { coinsurancePct: root.querySelector('#cer-coins').value } }, payload.map((f) => f.buffer));
  };
  input.addEventListener('change', run);
  root.querySelector('#cer-coins').addEventListener('change', run);
}

export const renderers = { 'carin-eob-reader': carinEobReader };

// spec-v1623 step 3: a dropped claims file goes through the tool's own input.
export const acceptFiles = {
  'carin-eob-reader': acceptVia('cer-files'),
};
