// spec-v1623 step 4 / spec-v1612: files on the home page. A reader drops (or
// chooses) files, a folder or a zip; they are recognized in a worker; one
// certain file opens its tool with the file already in it, and anything else
// opens the inventory at #/intake. The files are held here, in memory, for the
// one navigation that uses them -- never in the URL, never in storage.

import { el } from '../lib/dom.js';
import { entriesFromDrop, entriesFromInput, renderIntake } from './intake.js';

const workerUrl = new URL('../lib/intake-worker.js', import.meta.url);

// What the next navigation should do with files. Cleared once consumed, or by
// any navigation to somewhere else.
let pending = null;

function runInventory(entries) {
  return new Promise((resolve, reject) => {
    const worker = new window.Worker(workerUrl, { type: 'module' });
    worker.addEventListener('error', () => { worker.terminate(); reject(new Error('The files could not be read.')); });
    worker.addEventListener('message', (event) => {
      const m = event.data || {};
      worker.terminate();
      if (m.type === 'inventory') resolve(m.result);
      else reject(new Error(m.message || 'The files could not be read.'));
    });
    worker.postMessage({ type: 'inventory', entries });
  });
}

const asFile = (row) => (row.blob instanceof File && row.blob.name === row.name ? row.blob : new File([row.blob], row.name));
const primaryTool = (row) => row.tools.find((t) => t.status === 'live' && !t.route);

// createHomeFiles({ acceptFiles, navigate, toolName }) wires the home page.
//   acceptFiles: { toolId: (root, files, { kind }) => ... } from the views
//   navigate(hash): go there, re-rendering even when the hash is unchanged
export function createHomeFiles({ acceptFiles, navigate, toolName }) {
  async function intake(entries, status) {
    if (!entries.length) return;
    if (status) status.textContent = `Reading ${entries.length === 1 ? entries[0].name : `${entries.length} files`} in this tab...`;
    let result;
    try { result = await runInventory(entries); } catch (err) { if (status) status.textContent = err.message; return; }
    const { rows, refused } = result;
    const only = rows.length === 1 && !refused.length ? rows[0] : null;
    const tool = only && only.confidence !== 'none' && !only.ambiguous ? primaryTool(only) : null;
    if (tool && acceptFiles[tool.id]) {
      pending = { type: 'tool', toolId: tool.id, files: [asFile(only)], row: only };
      navigate(`#${tool.id}`);
      return;
    }
    pending = { type: 'inventory', result };
    navigate('#/intake');
  }

  // After a tool renders: hand it the pending files, under a line that says
  // what they were read as, with the way out ("Not right?") and the other
  // tools that read the same file.
  function afterToolRender(util, body) {
    const p = pending;
    pending = null;
    if (!p || p.type !== 'tool' || p.toolId !== util.id) {
      // The files were in memory only. After a reload (the history entry
      // remembers a file was dropped here, not the file) say so.
      if (window.history.state && window.history.state.droppedFile === util.id) {
        body.insertBefore(el('p', { class: 'intake-banner', role: 'note', text: "Files aren't kept after a reload. Drop it again." }), body.firstChild);
      }
      return;
    }
    window.history.replaceState({ ...(window.history.state || {}), droppedFile: util.id }, '');
    const box = el('div', { class: 'intake-banner', tabindex: '-1' });
    const label = p.row.label.charAt(0).toLowerCase() + p.row.label.slice(1);
    const what = p.files.length > 1 ? `${p.files.length} files` : p.row.name;
    box.appendChild(el('p', { text: `${what}: read as ${/^[aeiou]/.test(label) ? 'an' : 'a'} ${label}. ${p.row.evidence.join(' ')}` }));
    box.appendChild(el('p', { class: 'muted', text: 'Read in this tab. Not uploaded, not kept.' }));
    const others = p.row.tools.filter((t) => t.status === 'live' && !t.route && t.id !== util.id && acceptFiles[t.id]);
    const links = el('p');
    if (others.length) {
      links.appendChild(document.createTextNode('Also from this file: '));
      others.forEach((t, k) => {
        if (k) links.appendChild(document.createTextNode(', '));
        const a = el('a', { href: `#${t.id}`, text: toolName(t.id) });
        a.addEventListener('click', () => { pending = { ...p, toolId: t.id }; });
        links.appendChild(a);
      });
      links.appendChild(document.createTextNode('. '));
    }
    const choose = el('a', { href: '#/intake', text: 'Not right? Choose another tool' });
    choose.addEventListener('click', (e) => { e.preventDefault(); pending = { type: 'inventory', result: { rows: p.rows || [p.row], skipped: 0, refused: [], limitReached: null } }; navigate('#/intake'); });
    links.appendChild(choose);
    box.appendChild(links);
    body.insertBefore(box, body.firstChild);
    acceptFiles[p.toolId](body, p.files, { kind: p.row.kind });
    box.focus({ preventScroll: false });
  }

  function renderInventory(main) {
    const view = renderIntake(main, {
      toolName,
      onOpen: (toolId, row) => { pending = { type: 'tool', toolId, files: [asFile(row)], row }; },
      // One action per tool for everything it can take at once.
      onOpenMany: (toolId, rows) => { pending = { type: 'tool', toolId, files: rows.map(asFile), row: rows[0], rows }; navigate(`#${toolId}`); },
    });
    if (pending && pending.type === 'inventory') {
      const { result } = pending;
      pending = null;
      view.show(result);
    }
  }

  // The home view is rebuilt from a snapshot on every visit, so its controls
  // are bound again each time.
  function bindHome() {
    const home = document.getElementById('home-view');
    if (!home) return;
    const hero = home.querySelector('.task-hero');
    const status = document.getElementById('hero-files-status');
    const fileInput = document.getElementById('hero-file');
    const folderInput = document.getElementById('hero-folder');
    const fileButton = document.getElementById('hero-files-button');
    const folderButton = document.getElementById('hero-folder-button');
    if (fileButton && fileInput) {
      fileButton.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => intake(entriesFromInput(fileInput), status));
    }
    if (folderButton && folderInput && window.HTMLInputElement && 'webkitdirectory' in window.HTMLInputElement.prototype && window.matchMedia('(pointer: fine) and (min-width: 600px)').matches) {
      folderButton.hidden = false;
      folderButton.addEventListener('click', () => folderInput.click());
      folderInput.addEventListener('change', () => intake(entriesFromInput(folderInput), status));
    }
    const sample = home.querySelector('.hero-file-chip');
    if (sample) {
      sample.addEventListener('click', async () => {
        const r = await fetch(sample.dataset.sample);
        const name = sample.dataset.sample.split('/').pop();
        intake([{ file: new File([await r.blob()], name), name, relativePath: '' }], status);
      });
    }
    let depth = 0;
    home.addEventListener('dragenter', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { depth += 1; hero && hero.classList.add('drop-active'); } });
    home.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if (!depth && hero) hero.classList.remove('drop-active'); });
    home.addEventListener('dragover', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
    home.addEventListener('drop', async (e) => {
      if (!e.dataTransfer || !e.dataTransfer.files.length) return;
      e.preventDefault();
      depth = 0;
      if (hero) hero.classList.remove('drop-active');
      intake(await entriesFromDrop(e.dataTransfer), status);
    });
  }

  return { intake, afterToolRender, renderInventory, bindHome, clear: () => { pending = null; } };
}
