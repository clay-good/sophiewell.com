#!/usr/bin/env node
// scripts/check-file-kinds.mjs -- spec-v1623 step 1 / spec-v1611 §3.
//
// The file-kind registry gate. It fails when:
//   1. a file input in views/ belongs to no tool in the registry (lib/file-kinds.js
//      KINDS, plus the CSV tools in lib/upload-fields.js), so a new file tool
//      cannot ship without saying what it reads;
//   2. a registry tool marked live is not in the catalog, or one marked planned
//      is already built (it should be live);
//   3. a kind has no sample fixture under test/fixtures/file-kinds/ (or a stated
//      reason for none), or no test that recognizes its sample.
//   4. a live registry tool has no `acceptFiles` entry in the view that renders
//      it (spec-v1623 step 3), so a dropped file could not be handed to it.

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KINDS } from '../lib/file-kinds.js';
import { CSV_TOOLS } from '../lib/upload-fields.js';
import { parseUtilityIds } from './check-catalog-truth.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Every file input's id (a template-literal id matched by its fixed prefix),
// and the tool it belongs to. A new `type: 'file'` input fails the gate until
// it is listed here and its tool is in the registry.
export const FILE_INPUTS = {
  'x835-files': 'x12-835-reader',
  'dpr-files': 'denial-pattern-report',
  'upc-remittances': 'underpayment-check',
  'upc-fees': 'underpayment-check',
  'x837-files': 'x12-837-check',
  'x271-file': 'x12-271-reader',
  'x277-files': 'x12-277-reader',
  'hpt-file': 'hpt-file-check',
  'aw-835-files': 'appeal-worklist',
  'pa-file-picker': 'pa-lint',
  'rxm-${config.name}-file': '340b-rx-match',
  '${id}-file': 'upload-workbench',
  // The inventory at #/intake takes any file; it is the recognizer's own page.
  'intake-files': 'intake',
  'intake-folder': 'intake',
};

export async function fileInputIds() {
  const out = [];
  for (const f of (await readdir(join(ROOT, 'views'))).filter((n) => n.endsWith('.js')).sort()) {
    const text = await readFile(join(ROOT, 'views', f), 'utf8');
    // The id is on the same element as type: 'file', either before or after it.
    for (const m of text.matchAll(/type:\s*'file'/g)) {
      const around = text.slice(Math.max(0, m.index - 200), m.index + 200);
      const ids = [...around.matchAll(/\bid:\s*(?:'([^']+)'|`([^`]+)`)/g)].map((x) => x[1] ?? x[2]);
      // The nearest id to the type attribute.
      const pick = ids.sort((a, b) => Math.abs(around.indexOf(a) - 200) - Math.abs(around.indexOf(b) - 200))[0];
      out.push({ file: `views/${f}`, id: pick || null });
    }
  }
  return out;
}

// acceptFilesIds() -> tool ids with an acceptFiles entry, read from the views'
// source (importing a view needs a DOM).
export async function acceptFilesIds() {
  const ids = new Set();
  for (const f of (await readdir(join(ROOT, 'views'))).filter((n) => n.endsWith('.js'))) {
    const text = await readFile(join(ROOT, 'views', f), 'utf8');
    const m = /export const acceptFiles = \{([\s\S]*?)\n\};/.exec(text);
    if (m) for (const k of m[1].matchAll(/^\s*'([a-z0-9-]+)':/gm)) ids.add(k[1]);
  }
  return ids;
}

export async function problems() {
  const out = [];
  const catalog = new Set(parseUtilityIds(await readFile(join(ROOT, 'app.js'), 'utf8')));
  const registryTools = new Map();
  for (const k of KINDS) for (const t of k.tools) registryTools.set(t.id, t);
  for (const t of CSV_TOOLS) registryTools.set(t.id, { id: t.id, status: 'live' });

  // 1. file inputs
  for (const { file, id } of await fileInputIds()) {
    if (!id) { out.push(`${file}: a file input with no id; give it one and list it in FILE_INPUTS`); continue; }
    const tool = FILE_INPUTS[id];
    if (!tool) { out.push(`${file}: file input "${id}" is not in FILE_INPUTS in scripts/check-file-kinds.mjs`); continue; }
    if (tool === 'upload-workbench' || tool === 'intake') continue; // CSV_TOOLS; the inventory itself
    if (!registryTools.has(tool)) out.push(`${file}: file input "${id}" belongs to ${tool}, which no kind in lib/file-kinds.js names`);
  }

  // 2. live tools exist; planned ones do not yet
  for (const t of registryTools.values()) {
    if (t.route) continue;
    if (t.status === 'live' && !catalog.has(t.id)) out.push(`registry tool ${t.id} is marked live but is not in the catalog`);
    if (t.status === 'planned' && catalog.has(t.id)) out.push(`registry tool ${t.id} is marked planned but is in the catalog; mark it live`);
  }

  // 4. every live tool can take handed-off files
  const accepting = await acceptFilesIds();
  for (const t of registryTools.values()) {
    if (t.status === 'live' && !t.route && !accepting.has(t.id)) out.push(`registry tool ${t.id} has no acceptFiles entry in its view`);
  }

  // 3. samples and a test that recognizes each
  const testText = await readFile(join(ROOT, 'test', 'unit', 'file-kinds.test.js'), 'utf8');
  for (const k of KINDS) {
    if (!k.sample) {
      if (!k.noSample) out.push(`kind ${k.kind} has no sample and no noSample reason`);
      continue;
    }
    if (!existsSync(join(ROOT, 'test', 'fixtures', 'file-kinds', k.sample))) out.push(`kind ${k.kind}: sample ${k.sample} is missing`);
    if (!testText.includes(`'${k.sample}'`)) out.push(`kind ${k.kind}: no test in test/unit/file-kinds.test.js recognizes ${k.sample}`);
  }
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('check-file-kinds.mjs')) {
  const p = await problems();
  if (p.length) {
    console.error('check-file-kinds: problems found.');
    for (const x of p) console.error(`  ${x}`);
    process.exit(1);
  }
  console.log(`check-file-kinds: clean (${KINDS.length} kinds, ${(await fileInputIds()).length} file inputs, ${CSV_TOOLS.length} CSV tools).`);
}
