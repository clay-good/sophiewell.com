// spec-v1602: renderers for carin-eob-reader and itemized-bill-check (reading your own claims and bills).

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import { renderReceipt } from './receipt.js';
import { acceptVia } from '../lib/hand-off.js';
import { usd, OUTCOME_LABEL } from '../lib/carin-eob-reader.js';
import * as IBC from '../lib/itemized-bill-check.js';
import { loadMue } from '../lib/mue-load.js';
import { MAX_FILE_BYTES, parseDelimited, matchColumns } from '../lib/upload-intake.js';
import { handOff } from '../lib/hand-off.js';

const carinWorkerUrl = new URL('../lib/carin-worker.js', import.meta.url);
const billWorkerUrl = new URL('../lib/itemized-bill-worker.js', import.meta.url);

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

// spec-v1602 tool 2: an itemized bill beside the hospital's own posted prices. The bill is small and read here;
// the price file is streamed in a Worker. The page loads the MUE rows for the bill's codes (the worker has no
// network code).
function select(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [{ value: '', text: '— choose —' }, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return s;
}

function itemizedBillCheck(root) {
  root.appendChild(el('p', { class: 'notice', text: 'Sets each line of a hospital itemized bill beside the hospital\'s own posted prices for that code, from the standard charge file every hospital must publish: the gross charge, the discounted cash price, and your plan\'s negotiated rate when you name the plan.' }));
  root.appendChild(el('p', { class: 'muted', text: 'Download the hospital\'s price file from its website (it is linked from a page about price transparency). Both files stay in this tab.' }));
  const billWrap = el('p');
  billWrap.appendChild(el('label', { for: 'ibc-bill', text: 'Bill lines, one per line: date (or leave it blank), code, units, charge, description' }));
  billWrap.appendChild(el('br'));
  billWrap.appendChild(el('textarea', { id: 'ibc-bill', rows: '6', autocomplete: 'off', placeholder: '2026-03-02, 99284, 1, 2400, Emergency visit' }));
  root.appendChild(billWrap);
  const billFile = el('input', { id: 'ibc-bill-file', type: 'file', accept: '.csv,.tsv,.txt,text/csv' });
  root.appendChild(el('label', { for: 'ibc-bill-file', text: 'Or choose the itemized bill as a CSV file' })); root.appendChild(billFile);
  const setting = select(root, 'Was the care inpatient or outpatient?', 'ibc-setting', IBC.SETTINGS);
  const payment = select(root, 'How is the bill being paid?', 'ibc-payment', IBC.PAYMENT);
  const planWrap = el('p');
  planWrap.appendChild(el('label', { for: 'ibc-plan', text: 'Your plan, as the hospital\'s file names it (optional)' }));
  planWrap.appendChild(el('br'));
  planWrap.appendChild(el('input', { id: 'ibc-plan', type: 'text', autocomplete: 'off', placeholder: 'e.g. Aetna PPO' }));
  root.appendChild(planWrap);
  const priceFile = el('input', { id: 'ibc-price-file', type: 'file', accept: '.csv,.json,text/csv,application/json' });
  const status = el('p', { id: 'ibc-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results', 'aria-live': 'polite' });
  root.appendChild(el('label', { for: 'ibc-price-file', text: 'Choose the hospital\'s price file' })); root.appendChild(priceFile); root.appendChild(status); root.appendChild(results);

  let worker = null;
  const billLines = async () => {
    const f = billFile.files && billFile.files[0];
    if (!f) return IBC.linesFromText(root.querySelector('#ibc-bill').value);
    if (f.size > MAX_FILE_BYTES) throw new RangeError(`${f.name} is over the 50 MB limit.`);
    const parsed = parseDelimited(await f.text());
    const { mapping, missing } = matchColumns(parsed.headers, IBC.BILL_FIELDS);
    if (missing.length) throw new RangeError(`The bill file needs a column for ${missing.map((id) => IBC.BILL_FIELDS.find((x) => x.id === id).label.toLowerCase()).join(' and ')}. Its columns are: ${parsed.headers.join(', ')}.`);
    return parsed.rows.map((r) => Object.fromEntries(IBC.BILL_FIELDS.map((x) => [x.id, mapping[x.id] == null ? '' : r[mapping[x.id]]])));
  };
  const run = async () => {
    if (worker) worker.terminate(); clear(results);
    const pf = priceFile.files && priceFile.files[0];
    let lines;
    try { lines = await billLines(); } catch (err) { status.textContent = err.message; return; }
    if (!lines.length) { status.textContent = 'Enter the bill lines or choose the bill file.'; return; }
    if (!setting.value || !payment.value) { status.textContent = 'Choose whether the care was inpatient or outpatient, and how the bill is being paid.'; return; }
    if (!pf) { status.textContent = 'Choose the hospital\'s price file.'; return; }
    const codes = [...new Set(lines.map((l) => String(l.code ?? '').trim().toUpperCase()).filter(Boolean))];
    const mue = setting.value === 'outpatient' ? await loadMue(codes) : null;
    status.textContent = `Reading ${pf.name} locally...`;
    worker = new window.Worker(billWorkerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The hospital price file could not be read.'; });
    worker.addEventListener('message', (event) => {
      const m = event.data || {};
      if (m.type === 'error') { status.textContent = m.message; return; }
      if (m.type !== 'checked') return;
      if (!m.valid) { status.textContent = m.message; return; }
      status.textContent = `Compared with ${m.hospital || pf.name}${m.hospitalUpdated ? `'s prices posted ${m.hospitalUpdated}` : ''}.`;
      resultRow(results, [{ text: m.band, cls: m.abnormal ? 'warn' : null }, { label: 'Lines to ask about', value: m.totals.ask.toLocaleString('en-US') }]);
      table(results, 'Your bill beside the hospital\'s posted prices', ['Line', 'Code', 'Description', 'Units', 'Charged', 'A unit', 'Posted gross', 'Posted cash', 'Your plan\'s rate', 'Worth asking'],
        m.rows.map((r) => (r.status === 'invalid' ? [r.line, '', '', '', '', '', '', '', '', r.reason] : [r.line, r.code, r.description, r.units, IBC.money(r.charge), IBC.money(r.perUnit), IBC.money(r.gross), IBC.money(r.cash), r.planRates.join('; '), r.findings.join('; ')])));
      const notes = [...m.notes, 'A posted price is for the hospital\'s own unit of the item; a code billed in a different unit may not compare one to one.'];
      if (mue && mue.expired) notes.push('The bundled units edits have passed their review date, so units were not checked.');
      const ul = el('ul'); for (const n of notes) ul.appendChild(el('li', { text: n })); results.appendChild(ul);
      results.appendChild(el('p', { class: 'muted', text: 'Each line is worth asking the hospital\'s billing office about, not a finding that you were overbilled. The posted prices are the hospital\'s own public statement of its charges (45 CFR 180.50), so a line above them is a fair question to put in writing.' }));
      renderReceipt(results, m);
    });
    const billBlob = billFile.files && billFile.files[0];
    worker.postMessage({ type: 'check', priceFile: pf, billFile: billBlob || null, lines, setting: setting.value, payment: payment.value, plan: root.querySelector('#ibc-plan').value.trim(), mue: mue && mue.rows ? mue : null });
  };
  for (const n of [priceFile, billFile, setting, payment]) n.addEventListener('change', run);
  root.querySelector('#ibc-bill').addEventListener('change', run);
  root.querySelector('#ibc-plan').addEventListener('change', run);
}

export const renderers = { 'carin-eob-reader': carinEobReader, 'itemized-bill-check': itemizedBillCheck };

// spec-v1623 step 3: a dropped claims file goes through the tool's own input.
export const acceptFiles = {
  'carin-eob-reader': acceptVia('cer-files'),
  // A hospital price file goes to the price input; anything else (the bill CSV) to the bill input.
  'itemized-bill-check': (root, files, { kind } = {}) => handOff(root, /^hpt-/.test(kind || '') ? 'ibc-price-file' : 'ibc-bill-file', files),
};
