#!/usr/bin/env node
// spec-v52 §6: regenerate the homepage tool-picker <option> list from the
// live UTILITIES array in app.js. Output is written between
// <!-- TOOL-PICKER:START --> and <!-- TOOL-PICKER:END --> in index.html.
// Idempotent. Server-built so crawlers see every tile title in the HTML
// and the page needs zero client-side JS to render the list.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INDEX = resolve(ROOT, 'index.html');

const appSource = await readFile(resolve(ROOT, 'app.js'), 'utf8');
const arrMatch = appSource.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
if (!arrMatch) {
  console.error('build-tool-picker: could not find UTILITIES array in app.js');
  process.exit(1);
}

const body = arrMatch[1];
const tiles = [];
const entryRe = /\{\s*id:\s*'([^']+)'[^}]*?name:\s*'([^']+)'/g;
let m;
while ((m = entryRe.exec(body)) !== null) {
  tiles.push({ id: m[1], name: m[2] });
}
if (tiles.length === 0) {
  console.error('build-tool-picker: parsed zero tiles from UTILITIES - refusing to overwrite.');
  process.exit(1);
}

tiles.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const options = tiles
  .map((t) => `            <option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`)
  .join('\n');

const block = `          <!-- TOOL-PICKER:START -->
${options}
          <!-- TOOL-PICKER:END -->`;

const html = await readFile(INDEX, 'utf8');
if (!/<!-- TOOL-PICKER:START -->/.test(html) || !/<!-- TOOL-PICKER:END -->/.test(html)) {
  console.error('build-tool-picker: TOOL-PICKER markers not found in index.html.');
  process.exit(1);
}
const replaced = html.replace(
  /[ \t]*<!-- TOOL-PICKER:START -->[\s\S]*?<!-- TOOL-PICKER:END -->/,
  block,
);
await writeFile(INDEX, replaced);
const note = replaced === html ? 'no change' : 'updated';
console.log(`build-tool-picker: ${note}, ${tiles.length} tiles (${INDEX})`);
