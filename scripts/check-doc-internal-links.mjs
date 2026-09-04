#!/usr/bin/env node
// spec-v1049: no markdown link may point at a file that is not there.
//
// The repository is public. Every relative link in a markdown file is one a
// reader clicks on GitHub, and a dead one is a 404 with the project's name on
// it. Nothing checked them. Note the sibling: `check-doc-links.mjs` (spec-v1004)
// checks the EXTERNAL urls in the same documents, over the network, monthly and
// warn-only. This one is about the repository's own files, needs no network, and
// runs in the lint chain.
//
// Thirteen were dead when this was written. Two kinds, and the second is the
// one worth having a gate for:
//
//   - a file that MOVED (two CHANGELOG entries naming test files later folded
//     into others, three tile slugs that shipped under different ids);
//   - a file that was DELETED while a doc went on describing it. spec-v10 still
//     told the reader that three modules "remain in the tree as reusable
//     pure-function modules", with links, long after all three were removed.
//
// A dead link is the cheapest possible signal that a document has outlived its
// code, which is why this runs in the lint chain rather than on a cadence.
//
// Anchors (`#section`) are not resolved -- only the file part. External and
// mailto links are skipped.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'test-results', 'playwright-report', 'coverage']);

function markdownFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) markdownFiles(p, out);
    else if (entry.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const files = markdownFiles(ROOT);
const dead = [];
let checked = 0;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    for (const m of lines[i].matchAll(/\[([^\]]*)\]\(([^)\s]+)\)/g)) {
      const target = m[2];
      if (/^(https?:|mailto:|tel:|#)/i.test(target)) continue;
      const filePart = target.split('#')[0];
      if (!filePart) continue;
      checked += 1;
      if (!existsSync(resolve(dirname(file), filePart))) {
        dead.push(`${relative(ROOT, file)}:${i + 1}  ->  ${target}`);
      }
    }
  }
}

if (dead.length) {
  console.error(`check-doc-internal-links: ${dead.length} dead link(s) in markdown.`);
  for (const d of dead) console.error('  ' + d);
  console.error('\nA relative link is a path a reader clicks on GitHub. Repoint it if the file moved,');
  console.error('or unlink it and say what happened if the file is gone -- a doc that links to');
  console.error('deleted code is a doc still describing it (docs/spec-v1049.md).');
  process.exit(1);
}
console.log(`check-doc-internal-links: clean (${checked} relative links across ${files.length} markdown files).`);
