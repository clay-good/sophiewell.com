// spec-v1541: the offline pack's contents and version, and the footer line
// that reports it. The browser half (install, offline boot, the update window)
// is test/integration/works-offline.spec.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { SHELL_ASSETS, moduleGraph, precacheManifest } from '../../scripts/build-precache.mjs';
import { installOfflineStatus, packStatusText } from '../../lib/offline-status.js';

// A miniature dist/: the shell, a module graph with a worker, the pack's data,
// a lazily fetched dataset, a doc, a prerendered page and the per-commit file.
function site() {
  const dir = mkdtempSync(join(tmpdir(), 'offline-pack-'));
  const put = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); };
  for (const a of SHELL_ASSETS) if (a !== './') put(a.slice(2), `shell ${a}`);
  put('app.js', "import { a } from './lib/a.js';\nimport './lib/build-info.js';\nexport * from './lib/re.js';\nconst v = () => import('./views/v.js');\n");
  put('lib/a.js', "export const a = 1;\nconst w = new URL('./w.js', import.meta.url);\n");
  put('lib/w.js', "import { b } from './b.js';\n");
  put('lib/b.js', 'export const b = 2;\n');
  put('lib/re.js', 'export const re = 3;\n');
  put('lib/unreached.js', 'export const u = 4;\n');
  put('lib/build-info.js', "export const BUILD = { commit: 'aaa' };\n");
  put('views/v.js', 'export const v = 5;\n');
  put('data/synonyms.json', '{}');
  put('data/search-corpus/corpus.json', '[]');
  put('data/fields/aa.json', '[]');
  put('data/tool-copy/bmi.json', '{}');
  put('data/nadac/shards/1.json', '[1]');
  put('docs/readme.md', 'one');
  put('tools/bmi/index.html', '<p>one</p>');
  return { dir, put, done: () => rmSync(dir, { recursive: true, force: true }) };
}

test('the module graph follows imports, re-exports, import() and worker URLs', () => {
  const s = site();
  try {
    const g = moduleGraph(s.dir, ['app.js']);
    assert.deepEqual(g, ['app.js', 'lib/a.js', 'lib/b.js', 'lib/build-info.js', 'lib/re.js', 'lib/w.js', 'views/v.js']);
  } finally { s.done(); }
});

test('the pack holds the shell, the app, and the search, prefill and copy data', () => {
  const s = site();
  try {
    const urls = precacheManifest(s.dir, '2026-10-03').entries.map((e) => e.url);
    for (const u of [...SHELL_ASSETS, './lib/w.js', './views/v.js', './data/synonyms.json', './data/search-corpus/corpus.json', './data/fields/aa.json', './data/tool-copy/bmi.json']) {
      assert.ok(urls.includes(u), `${u} is in the pack`);
    }
    for (const u of ['./lib/unreached.js', './data/nadac/shards/1.json', './docs/readme.md', './tools/bmi/index.html']) {
      assert.ok(!urls.includes(u), `${u} is not in the pack`);
    }
  } finally { s.done(); }
});

test('the version follows what the app runs, and nothing else', () => {
  const s = site();
  try {
    const v = () => precacheManifest(s.dir, '2026-10-03').version;
    const base = v();
    s.put('docs/readme.md', 'two');
    s.put('tools/bmi/index.html', '<p>two</p>');
    s.put('lib/build-info.js', "export const BUILD = { commit: 'bbb' };\n");
    assert.equal(v(), base, 'a docs change, a prerendered page and the commit stamp leave the version alone');
    s.put('lib/b.js', 'export const b = 3;\n');
    const afterModule = v();
    assert.notEqual(afterModule, base, 'a module change is a new version');
    s.put('data/nadac/shards/1.json', '[2]');
    assert.notEqual(v(), afterModule, 'so is a dataset a tool fetches lazily');
    s.put('lib/unreached.js', 'export const u = 5;\n');
    assert.notEqual(v(), afterModule, 'and a module no static import reaches');
  } finally { s.done(); }
});

test('the footer line says what is saved, in plain words', () => {
  assert.equal(packStatusText({}), '');
  assert.equal(packStatusText({ pct: 40 }), 'Saving for offline use... 40%.');
  assert.equal(packStatusText({ complete: true, date: '2026-09-25' }), 'Saved for offline use, version of September 25, 2026.');
  assert.equal(packStatusText({ complete: true, date: '2026-09-25', persisted: false }),
    'Saved for offline use, version of September 25, 2026. The phone may clear the saved copy when storage runs low.');
  assert.equal(packStatusText({ complete: true, date: '2026-09-25', update: true }), 'An update is ready. It will be used the next time you open the site.');
});

test('the line follows the worker, and asks once to keep the copy', async () => {
  const listeners = {};
  let asked = 0;
  const posted = [];
  const reg = { active: { postMessage: (m) => posted.push(m) }, addEventListener() {} };
  const container = {
    controller: null,
    addEventListener: (t, f) => { listeners[t] = f; },
    startMessages() {},
    ready: Promise.resolve(reg),
  };
  const storage = { persisted: async () => false, persist: async () => { asked += 1; return false; } };
  const line = { textContent: '', hidden: true };
  installOfflineStatus(line, container, storage);
  await container.ready;
  assert.deepEqual(posted, [{ type: 'pack-status' }]);
  listeners.message({ data: { type: 'pack-progress', pct: 12 } });
  assert.equal(line.textContent, 'Saving for offline use... 12%.');
  assert.equal(line.hidden, false);
  listeners.message({ data: { type: 'pack-status', complete: true, date: '2026-10-03' } });
  listeners.message({ data: { type: 'pack-status', complete: true, date: '2026-10-03' } });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(asked, 1);
  assert.equal(line.textContent, 'Saved for offline use, version of October 3, 2026. The phone may clear the saved copy when storage runs low.');
  listeners.message({ data: { type: 'pack-progress', pct: 50 } });
  assert.match(line.textContent, /^Saved for offline use/, 'a later install does not replace the saved line');
});
