#!/usr/bin/env node
// spec-v1057: one helper name, one behaviour.
//
// The view modules are separate bundles, and each carries its own copy of the
// small readers the renderers use. That is the house convention and it is fine
// -- until the copies stop agreeing, which nothing was checking.
//
// They had stopped. `optNum` existed in 64 modules with THREE behaviours, and
// the difference was the subject of this whole program: is a field holding only
// whitespace blank, or is it zero?
//
//   String(n.value).trim() === '' ? null : Number(n.value)   // 2 modules: blank
//   n.value !== '' ? Number(n.value) : null                  // 51 modules: 0
//   v === '' ? null : Number(v)                              // 11 modules: 0
//
// `Number(' ')` is 0. So on 62 of 64 modules a whitespace-only field reached the
// formula as a measurement of zero -- the exact defect spec-v1006 through
// spec-v1056 exist to remove, sitting inside the helper written to prevent it.
//
// This check does not require the helpers to live in one module; it requires
// every copy of a given NAME to have the same body. A reader who learns what
// `optNum` does in one file must be right about it in all of them.

import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'views');

// The readers whose disagreement is a correctness question, not a style one.
const WATCHED = ['optNum', 'nvOrNull', 'numOrNull', 'unitNumOpt', 'needValues', 'needItems'];

function bodiesIn(file, src) {
  const lines = src.split('\n');
  const found = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^function (\w+)\(/.exec(lines[i]);
    if (!m || !WATCHED.includes(m[1])) continue;
    let depth = 0;
    let j = i;
    for (; j < lines.length; j += 1) {
      depth += (lines[j].match(/\{/g) || []).length - (lines[j].match(/\}/g) || []).length;
      if (depth === 0) break;
    }
    const raw = lines.slice(i, j + 1).join('\n');
    // Comments and message wording may differ; behaviour may not.
    const norm = raw
      .replace(/\/\/.*$/gm, '')
      .replace(/'[^']*'/g, "'S'")
      .replace(/`[^`]*`/g, '`S`')
      .replace(/\s+/g, ' ')
      .trim();
    found.push({ name: m[1], norm, line: i + 1, file });
  }
  return found;
}

const byName = new Map();
for (const entry of readdirSync(DIR)) {
  if (!entry.endsWith('.js')) continue;
  for (const f of bodiesIn(join(DIR, entry), readFileSync(join(DIR, entry), 'utf8'))) {
    if (!byName.has(f.name)) byName.set(f.name, new Map());
    const variants = byName.get(f.name);
    if (!variants.has(f.norm)) variants.set(f.norm, []);
    variants.get(f.norm).push(f);
  }
}

const drifted = [];
let copies = 0;
for (const [name, variants] of byName) {
  for (const list of variants.values()) copies += list.length;
  if (variants.size < 2) continue;
  const shapes = [...variants.entries()].map(([norm, list]) => ({
    count: list.length,
    where: relative(ROOT, list[0].file),
    norm: norm.slice(0, 120),
  }));
  drifted.push({ name, shapes });
}

if (drifted.length) {
  console.error(`check-helper-drift: ${drifted.length} helper name(s) with more than one behaviour.`);
  for (const d of drifted) {
    console.error(`\n  ${d.name}:`);
    for (const s of d.shapes) console.error(`    ${String(s.count).padStart(3)} copy/copies, e.g. ${s.where}\n        ${s.norm}`);
  }
  console.error('\nThe view modules each carry their own copy by convention, which is fine -- but a');
  console.error('reader who learns what a helper does in one file must be right about it in all of');
  console.error('them. Make the bodies identical (docs/spec-v1057.md).');
  process.exit(1);
}
console.log(`check-helper-drift: clean (${copies} copies of ${byName.size} watched helpers, one behaviour each).`);
