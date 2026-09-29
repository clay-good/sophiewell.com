// spec-v1623 step 2 / spec-v1612: the file inventory at #/intake. Every file
// the reader chose or dropped -- folders walked, zips unpacked -- listed with
// what it is, how sure the recognizer is, why, and which tool opens it.
// Recognition runs in lib/intake-worker.js; nothing is uploaded.

import { el, clear } from '../lib/dom.js';
import { LIMITS, PLANNED_TEXT, unknownMessage } from '../lib/file-kinds.js';

const workerUrl = new URL('../lib/intake-worker.js', import.meta.url);

const CONFIDENCE = { certain: 'Certain', likely: 'Likely', none: 'Not recognized' };

// Walk a dropped folder with the File and Directory Entries API. readEntries
// returns at most ~100 entries a call, so it is called until it returns none.
async function walkEntry(entry, out) {
  if (entry.isFile) {
    const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
    out.push({ file, name: file.name, relativePath: entry.fullPath.replace(/^\//, '') });
    return;
  }
  if (!entry.isDirectory) return;
  const reader = entry.createReader();
  for (;;) {
    const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
    if (!batch.length) break;
    for (const child of batch) await walkEntry(child, out);
  }
}

export async function entriesFromDrop(dataTransfer) {
  const items = [...(dataTransfer.items || [])].filter((i) => i.kind === 'file');
  const roots = items.map((i) => (i.webkitGetAsEntry ? i.webkitGetAsEntry() : null));
  if (roots.every(Boolean)) {
    const out = [];
    for (const r of roots) await walkEntry(r, out);
    return out;
  }
  return [...(dataTransfer.files || [])].map((file) => ({ file, name: file.name, relativePath: '' }));
}

export const entriesFromInput = (input) => [...(input.files || [])].map((file) => ({ file, name: file.name, relativePath: file.webkitRelativePath || '' }));

function opens(row, toolName, onOpen) {
  if (row.kind === 'excel' || row.confidence === 'none') return el('span', { text: unknownMessage(row.name, row) });
  if (row.family === 'reference') return el('span', { text: 'Reference table: drop it with the file it should be used for.' });
  if (row.kind === 'receipt') return el('span', { text: 'Drop it together with the files it names to check the result.' });
  const liveTools = row.tools.filter((t) => t.status === 'live' && !t.route);
  if (!row.tools.length) return el('span', { text: 'We recognize this file, but no tool here reads it.' });
  if (!liveTools.length) return el('span', { text: PLANNED_TEXT });
  const wrap = el('span');
  if (row.ambiguous) wrap.appendChild(el('span', { text: 'Choose one: ' }));
  liveTools.forEach((t, k) => {
    if (k) wrap.appendChild(document.createTextNode(row.ambiguous ? ' or ' : ', '));
    const link = el('a', { href: `#${t.id}`, text: toolName(t.id) });
    // The link carries the file: the tool opens with this row's file in it.
    link.addEventListener('click', () => onOpen(t.id, row));
    wrap.appendChild(link);
  });
  return wrap;
}

export function renderIntake(main, { toolName = (id) => id, onOpen = () => {}, onOpenMany = null } = {}) {
  clear(main);
  const content = el('section', { class: 'content intake', 'aria-label': 'Your files' });
  content.appendChild(el('h1', { text: 'Your files' }));
  content.appendChild(el('p', { class: 'notice', text: 'Choose files, a folder or a zip. Each is read in this tab to see what it is; nothing is uploaded, and nothing runs until you open a tool.' }));
  content.appendChild(el('p', { class: 'muted', text: 'Read in this tab. Not uploaded, not kept.' }));
  content.appendChild(el('p', { class: 'muted', text: `Up to ${LIMITS.maxFiles.toLocaleString('en-US')} files at a time and ${LIMITS.maxDepth} folders deep. A zip may expand to 4 GB; a member that expands more than ${LIMITS.maxZipRatio} times is refused.` }));

  const drop = el('div', { class: 'intake-drop', id: 'intake-drop' });
  const files = el('input', { id: 'intake-files', type: 'file', multiple: true });
  drop.appendChild(el('label', { for: 'intake-files', text: 'Choose files' }));
  drop.appendChild(files);
  let folder = null;
  if (window.HTMLInputElement && 'webkitdirectory' in window.HTMLInputElement.prototype && window.matchMedia && window.matchMedia('(pointer: fine) and (min-width: 600px)').matches) {
    folder = el('input', { id: 'intake-folder', type: 'file', webkitdirectory: '', multiple: true });
    drop.appendChild(el('label', { for: 'intake-folder', text: 'Choose a folder' }));
    drop.appendChild(folder);
  }
  drop.appendChild(el('p', { class: 'muted', text: 'Or drop files or a folder here.' }));
  content.appendChild(drop);
  const status = el('p', { id: 'intake-status', class: 'muted', role: 'status', 'aria-live': 'polite' });
  const results = el('div', { id: 'q-results' });
  content.appendChild(status);
  content.appendChild(results);
  main.appendChild(content);

  let worker = null;
  const run = (entries) => {
    if (worker) worker.terminate();
    clear(results);
    if (!entries.length) { status.textContent = ''; return; }
    status.textContent = `Reading ${entries.length.toLocaleString('en-US')} ${entries.length === 1 ? 'file' : 'files'} in this tab...`;
    worker = new window.Worker(workerUrl, { type: 'module' });
    worker.addEventListener('error', () => { status.textContent = 'The files could not be read. Choose them again.'; });
    worker.addEventListener('message', (event) => {
      const m = event.data || {};
      if (m.type === 'error') { status.textContent = m.message; return; }
      if (m.type === 'inventory') show(m.result);
    });
    worker.postMessage({ type: 'inventory', entries });
  };

  function show({ rows, skipped, refused, limitReached, note }) {
    const known = rows.filter((r) => r.confidence !== 'none' && !r.ambiguous).length;
    const choose = rows.filter((r) => r.ambiguous).length;
    const none = rows.filter((r) => r.confidence === 'none').length;
    const parts = [`${rows.length.toLocaleString('en-US')} ${rows.length === 1 ? 'file' : 'files'}: ${known} recognized`];
    if (choose) parts.push(`${choose} need${choose === 1 ? 's' : ''} you to choose a tool`);
    if (none) parts.push(`${none} not recognized`);
    let text = `${parts.join(', ')}.`;
    if (skipped) text += ` ${skipped} system ${skipped === 1 ? 'file was' : 'files were'} skipped.`;
    status.textContent = text;
    if (limitReached) results.appendChild(el('p', { class: 'warn', text: limitReached }));
    if (note) results.appendChild(el('p', { class: 'warn', text: note }));
    const wrap = el('div', { class: 'upload-mapping-scroll' });
    const table = el('table', { class: 'upload-mapping-table intake-table' });
    table.appendChild(el('caption', { text: 'What each file is' }));
    const head = el('tr');
    for (const h of ['File', 'What it is', 'Opens', 'Why']) head.appendChild(el('th', { scope: 'col', text: h }));
    table.appendChild(el('thead', null, [head]));
    const body = el('tbody');
    for (const r of rows) {
      const tr = el('tr', { 'data-kind': r.kind });
      tr.appendChild(el('td', { class: 'intake-path', text: r.path }));
      tr.appendChild(el('td', { text: `${r.label}${r.transactionText ? ` (${r.transactionText})` : ''}. ${CONFIDENCE[r.confidence]}.` }));
      const o = el('td'); o.appendChild(opens(r, toolName, onOpen)); tr.appendChild(o);
      tr.appendChild(el('td', { text: r.evidence.join(' ') }));
      body.appendChild(tr);
    }
    table.appendChild(body);
    wrap.appendChild(table);
    // One action per tool, not per file: a tool that reads several files at
    // once gets every file of its kind, so a month of remittances is one run.
    if (onOpenMany) {
      const byTool = new Map();
      for (const r of rows) {
        if (r.ambiguous || r.confidence === 'none') continue;
        for (const t of r.tools) {
          if (t.status !== 'live' || t.route || !t.multi) continue;
          if (!byTool.has(t.id)) byTool.set(t.id, []);
          byTool.get(t.id).push(r);
        }
      }
      const many = [...byTool].filter(([, rs]) => rs.length > 1);
      if (many.length) {
        const actions = el('p', { class: 'intake-actions' });
        for (const [tid, rs] of many) {
          const b = el('button', { type: 'button', text: `Open ${toolName(tid)} with ${rs.length} files` });
          b.addEventListener('click', () => onOpenMany(tid, rs));
          actions.appendChild(b);
        }
        results.appendChild(actions);
      }
    }
    results.appendChild(wrap);
    if (refused.length) {
      results.appendChild(el('h2', { text: 'Not opened' }));
      const ul = el('ul');
      for (const x of refused) ul.appendChild(el('li', { text: `${x.path}: ${x.reason}` }));
      results.appendChild(ul);
    }
  }

  files.addEventListener('change', () => run(entriesFromInput(files)));
  if (folder) folder.addEventListener('change', () => run(entriesFromInput(folder)));
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drop-active'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drop-active'));
  drop.addEventListener('drop', async (e) => {
    e.preventDefault();
    drop.classList.remove('drop-active');
    run(await entriesFromDrop(e.dataTransfer));
  });
  return { run, show };
}
