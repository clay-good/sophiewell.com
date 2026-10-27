#!/usr/bin/env node
// scripts/check-design-system.mjs -- the design-system conformance gate
// (docs/design.md, openspec/changes/design-system-cleanup tasks 0.2 and 0.3).
//
// The cleanup waves moved every view onto the shared components. What a sweep
// cleans, the next tile re-dirties: this gate holds the three properties the
// waves established, so a new view cannot quietly reintroduce them.
//
//   1. No inline presentation. A view emits no `style:` attribute and writes no
//      `.style.<prop>`, and no view ships its own `<style>` block. Presentation
//      is shared classes plus the tokens in styles.css, or the next reader has
//      two places to look and a dark theme that misses one of them.
//   2. No bare file input. A `type: 'file'` input is wrapped by `dropzone()`
//      (lib/components.js) or by a view that does its own drop handling on the
//      shared `.dropzone` card -- the raw native input was the most dated
//      element on the site and the one with no drop target.
//   3. A status chip carries a word. `statusChip()` is the only way to build
//      `.chip--status`, and it takes a label, so severity is never color alone
//      (docs/design.md 7). A hand-rolled chip class in a view bypasses that.
//
// Measured, not aspirational: all three were true when this gate landed.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VIEWS = join(ROOT, 'views');

// intake.js keeps its own drop handling (a folder or a zip needs the
// DataTransfer items, not the single-input assign the helper does) on the
// shared `.dropzone` card. It satisfies rule 2 by wearing the card.
const OWN_DROP_HANDLING = new Set(['intake.js']);

const files = (await readdir(VIEWS)).filter((f) => f.endsWith('.js')).sort();
const failures = [];
let fileInputs = 0;
let statusChips = 0;

for (const name of files) {
  const path = join(VIEWS, name);
  const src = await readFile(path, 'utf8');
  const lines = src.split('\n');
  const at = (i) => `${relative(ROOT, path)}:${i + 1}`;

  lines.forEach((line, i) => {
    if (/\bstyle:\s*['"`]/.test(line)) {
      failures.push(`${at(i)} sets an inline style attribute: ${line.trim().slice(0, 90)}`);
    }
    // `.style.foo = ...` -- a read (`.style.getPropertyValue`) is not a write.
    if (/\.style\.[a-zA-Z-]+\s*=/.test(line)) {
      failures.push(`${at(i)} writes an inline style property: ${line.trim().slice(0, 90)}`);
    }
    if (/el\(\s*['"`]style['"`]/.test(line)) {
      failures.push(`${at(i)} builds a per-view <style> block: ${line.trim().slice(0, 90)}`);
    }
    if (/class:\s*['"`][^'"`]*chip--status/.test(line)) {
      failures.push(`${at(i)} hand-builds a status chip; call statusChip(severity, label) so it carries a word: ${line.trim().slice(0, 90)}`);
    }
  });

  if (/type:\s*'file'/.test(src)) {
    fileInputs += (src.match(/type:\s*'file'/g) || []).length;
    const wrapped = /\bdropzone\s*\(/.test(src) || OWN_DROP_HANDLING.has(name);
    if (!wrapped) {
      failures.push(`${relative(ROOT, path)} builds a file input outside the shared dropzone card; wrap it with dropzone() from lib/components.js`);
    }
  }
  statusChips += (src.match(/\bstatusChip\s*\(/g) || []).length;
}

if (failures.length) {
  console.error(`check-design-system: ${failures.length} spot(s) outside the shared system.`);
  for (const f of failures) console.error(`  ${f}`);
  console.error('\ndocs/design.md is the source of truth: shared component, then token, then');
  console.error('nothing. Never a per-tile style and never a signal carried by color alone.');
  process.exit(1);
}

console.log(`check-design-system: clean (${files.length} views, ${fileInputs} file inputs all on the dropzone card, ${statusChips} status chips all built with a label, no inline presentation).`);
