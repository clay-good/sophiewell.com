#!/usr/bin/env node
// spec-v1040: find coercions that cannot tell a blank field from a zero.
//
// `Number(null)` and `Number('')` are both 0, and 0 is finite. So a helper
// written as
//
//   const n = Number(v); return Number.isFinite(n) ? n : null;
//
// returns 0 -- not null -- for a value nobody entered, and every `if (x === null)`
// guard downstream stops firing. Four calculators had a correct missing-input
// guard disabled this way (docs/spec-v1040.md).
//
// This is a REPORT, not a gate. Most of what it prints is harmless: a clamp on a
// rating item where 0 is the floor anyway, or a `&& n > 0` test that a zero fails
// correctly. The dangerous shape is the one above -- finite-or-null with no lower
// bound -- reached by a renderer that passes null for a blank field. Run it when
// touching a coercion helper, and read the hits rather than fixing them in bulk.
//
// Usage: node scripts/probe-blank-coercions.mjs
import { readdirSync, readFileSync } from 'node:fs';
const files = readdirSync('lib').filter((f) => f.endsWith('.js'));
const hits = [];
for (const f of files) {
  const src = readFileSync('lib/' + f, 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const window = lines.slice(Math.max(0, i - 2), i + 3).join(' ');
    const line = lines[i];
    if (!/Number\.isFinite\s*\(/.test(line)) continue;
    if (!/Number\(/.test(window)) continue;
    // Does the surrounding window already exclude blanks?
    if (/isBlank|=== ''|!== ''|trim\(\) === ''|=== null|!== null|== null|!= null|blank\(/.test(window)) continue;
    hits.push(`${f}:${i + 1}: ${line.trim().slice(0, 110)}`);
  }
}
console.log(`${hits.length} unguarded finiteness checks`);
for (const h of hits) console.log('  ' + h);
