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
// spec-v1050 adds two more questions to the same pass, because they are the same
// reader clicking the same link:
//
//   - an ANCHOR that names a heading the target file does not have. GitHub lands
//     the reader at the top of the page with no sign anything went wrong, which
//     is worse than a 404: the link looks like it worked. Two were dead, and one
//     of them (`stability.md` -> `#changelog`) was a commitment page telling
//     readers the changelog was "viewable in-site" at a route removed long ago.
//   - an `npm run <script>` in prose that package.json does not define. Eight
//     named scripts that do not exist -- `check-pa-staleness` for
//     `check:pa-staleness`, a dash where the repo uses a colon -- so a
//     contributor copying the line gets "Missing script".
//
// One limitation, deliberately left: neither check skips code spans or fences. A
// document that QUOTES a broken link or a wrong command as an example trips its
// own gate -- which happened while writing docs/spec-v1050.md. The alternative is
// worse: a fenced block is the most likely place a contributor copies a command
// FROM, so exempting fences would exempt the case this exists for. Write the
// example so it is not a live link or a runnable line.
//
// The heading slug follows GitHub's rule: lowercase, drop anything that is not a
// word character, space or hyphen, then turn EACH space into a hyphen (a run of
// two spaces becomes two hyphens, which is why `2.2 `x` -- y` slugs with a double
// hyphen). External and mailto links are skipped.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export function headingSlug(heading) {
  return heading.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/ /g, '-');
}

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
let anchorsChecked = 0;

// Every heading slug each file offers, so an anchor can be resolved against the
// file it points into (including the file it is written in).
const anchorsOf = new Map();
for (const file of files) {
  const set = new Set();
  for (const m of readFileSync(file, 'utf8').matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) set.add(headingSlug(m[1]));
  anchorsOf.set(file, set);
}

// `npm run <script>` in prose, against what package.json actually defines.
const definedScripts = new Set();
for (const manifest of ['package.json', 'mcp/package.json']) {
  const p = resolve(ROOT, manifest);
  if (!existsSync(p)) continue;
  for (const name of Object.keys(JSON.parse(readFileSync(p, 'utf8')).scripts || {})) definedScripts.add(name);
}
const missingScripts = [];
let scriptRefs = 0;

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
      const abs = resolve(dirname(file), filePart);
      if (!existsSync(abs)) {
        dead.push(`${relative(ROOT, file)}:${i + 1}  ->  ${target}  (no such file)`);
      }
    }
    // Anchors, including a bare `#section` pointing inside this same file.
    for (const m of lines[i].matchAll(/\[([^\]]*)\]\(([^)\s]+)\)/g)) {
      const target = m[2];
      if (/^(https?:|mailto:|tel:)/i.test(target)) continue;
      const hash = target.indexOf('#');
      if (hash === -1) continue;
      const anchor = target.slice(hash + 1).toLowerCase();
      if (!anchor) continue;
      const filePart = target.slice(0, hash);
      const abs = filePart ? resolve(dirname(file), filePart) : file;
      if (!anchorsOf.has(abs)) continue; // not a markdown file we parsed
      anchorsChecked += 1;
      if (!anchorsOf.get(abs).has(anchor)) {
        dead.push(`${relative(ROOT, file)}:${i + 1}  ->  ${target}  (no such heading)`);
      }
    }
    for (const m of lines[i].matchAll(/npm run ([a-z0-9:_-]+)/g)) {
      scriptRefs += 1;
      if (!definedScripts.has(m[1])) {
        missingScripts.push(`${relative(ROOT, file)}:${i + 1}  ->  npm run ${m[1]}`);
      }
    }
  }
}

if (dead.length || missingScripts.length) {
  if (dead.length) {
    console.error(`check-doc-internal-links: ${dead.length} dead link(s) in markdown.`);
    for (const d of dead) console.error('  ' + d);
    console.error('\nA relative link is a path a reader clicks on GitHub. Repoint it if the file moved,');
    console.error('or unlink it and say what happened if the file is gone -- a doc that links to');
    console.error('deleted code is a doc still describing it (docs/spec-v1049.md).');
    console.error('An anchor that names no heading is worse than a 404: the reader lands at the top');
    console.error('of the page and nothing says the link missed.');
  }
  if (missingScripts.length) {
    console.error(`\ncheck-doc-internal-links: ${missingScripts.length} doc(s) name an npm script that does not exist.`);
    for (const m of missingScripts) console.error('  ' + m);
    console.error('\nA contributor copying that line gets "Missing script". Use the name package.json');
    console.error('defines, or name the underlying command (docs/spec-v1050.md).');
  }
  process.exit(1);
}
console.log(`check-doc-internal-links: clean (${checked} relative links, ${anchorsChecked} anchors, `
  + `${scriptRefs} npm-script references across ${files.length} markdown files).`);
