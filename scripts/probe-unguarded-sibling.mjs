#!/usr/bin/env node
// spec-v1202: the guard that is already in the file, one function away.
//
// `scripts/probe-half-guarded.mjs` (spec-v1101) asks this WITHIN one tile: does
// it refuse for one missing input and stay silent on another? Five times in one
// run the same thing was true a level up -- between EXPORTED FUNCTIONS OF THE
// SAME MODULE:
//
//   lib/acidbase-v129.js   stewartSidSig loops boundsAdvisory over its analytes
//                          and ends on the rule -- "Guard the set, not the field
//                          that was reported" -- while the four gas functions
//                          beside it had nothing (spec-v1198).
//   lib/scoring-v4.js      mews got the envelope guard in spec-v1181; news2 sits
//                          directly above it, and the comment INSIDE mews names
//                          news2 as sharing the defect (spec-v1199).
//
// A module is written by one hand at one sitting. When one of its functions calls
// a guard helper and its neighbours do not, that is almost never a considered
// difference -- it is the half somebody was fixing at the time.
//
// The question is static, so this is a grep, not a sweep: no calculator is run.
// A row is a SUSPECT. Some functions legitimately take no measurement at all, and
// the reach line below says how many were skipped for that reason.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-unguarded-sibling.mjs
//   node scripts/probe-unguarded-sibling.mjs --helper boundsAdvisory
//   node scripts/probe-unguarded-sibling.mjs --all   (include modules with one exported function)

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? (process.argv[i + 1] || true) : null;
};
const onlyHelper = arg('--helper');
const showAll = !!arg('--all');

// The guards worth asking about: each one is a house helper that turns an input
// nobody could have measured into a refusal. Add to this list, not to a copy of
// it -- the whole point of this probe is that lists like this drift.
const GUARDS = ['boundsAdvisory', 'inputFault', 'outsideEnvelope', 'outOfRange', 'outsideRange'];

// A function that takes no measurement cannot be missing a measurement guard.
// This is deliberately generous: any read of a numeric-looking input counts.
const READS_A_NUMBER = /\b(?:pos|nonneg|num|fin|inRange|optNum|positive|toNum|numOr)\s*\(/;

const rows = [];
let modulesRead = 0;
let modulesWithAGuard = 0;
let skippedNoNumber = 0;

for (const file of readdirSync(`${ROOT}lib`).filter((f) => f.endsWith('.js')).sort()) {
  const src = readFileSync(`${ROOT}lib/${file}`, 'utf8');
  const helpers = GUARDS.filter((g) => (onlyHelper && onlyHelper !== true ? g === onlyHelper : true))
    .filter((g) => new RegExp(`\\b${g}\\s*\\(`).test(src));
  if (!helpers.length) continue;
  modulesRead += 1;

  // Split on top-level `export function name(`, keeping each body with its name.
  const parts = [...src.matchAll(/^export function ([A-Za-z0-9_$]+)\s*\(/gm)];
  if (parts.length < 2 && !showAll) continue;
  modulesWithAGuard += 1;

  const bodies = parts.map((m, i) => ({
    name: m[1],
    body: src.slice(m.index, i + 1 < parts.length ? parts[i + 1].index : src.length),
  }));

  // A function that IS one of the guards is not a function that calls one --
  // `lib/num.js` exports `inputFault` itself, and without this it reported its own
  // neighbours for not calling it.
  const guarded = bodies.filter((b) => !helpers.includes(b.name)
    && helpers.some((g) => new RegExp(`\\b${g}\\s*\\(`).test(b.body)));
  if (!guarded.length) continue;   // the helper is used outside any export; not this question

  const unguarded = bodies.filter((b) => !guarded.includes(b));
  const candidates = unguarded.filter((b) => {
    if (!READS_A_NUMBER.test(b.body)) { skippedNoNumber += 1; return false; }
    return true;
  });
  if (!candidates.length) continue;

  rows.push({
    file, helpers,
    guarded: guarded.map((b) => b.name),
    unguarded: candidates.map((b) => b.name),
  });
}

console.log('Modules where one exported function calls a measurement guard and a');
console.log('sibling that also reads numbers does not. A module is written by one');
console.log('hand at one sitting, so this is rarely a considered difference.\n');
console.log(`${rows.length} module(s), ${rows.reduce((n, r) => n + r.unguarded.length, 0)} function(s).\n`);

for (const r of rows) {
  console.log(`  ${r.file}   [${r.helpers.join(', ')}]`);
  console.log(`      guards  : ${r.guarded.join(', ')}`);
  console.log(`      does not: ${r.unguarded.join(', ')}`);
}

console.log(`\nReach: ${modulesRead} of the modules in lib/ call one of ${GUARDS.length} watched guards;`);
console.log(`${modulesWithAGuard} of those export more than one function and are comparable,`);
console.log(`and ${skippedNoNumber} sibling(s) were skipped for reading no numeric input at all.`);
