#!/usr/bin/env node
// spec-v1214: the small readers every lib module copies, and whether the copies
// actually BEHAVE the same.
//
// `scripts/check-helper-drift.mjs` (spec-v1057) asks this of `views/`, by
// comparing normalised function bodies for six watched names. It is a gate, and
// it works -- but it reads text, so a renamed parameter reads as drift and a
// genuinely different policy written in the same words does not. And it never
// looks at `lib/` at all, where the copying is far heavier: `fin` alone is
// declared 59 times.
//
// This probe asks the behavioural question instead. It extracts every copy of a
// watched name, evaluates all of them on one battery of clinically-plausible and
// adversarial values, and reports only the names whose copies return DIFFERENT
// answers for some value. A cosmetic difference produces no row; a real one does,
// with the value that separates them.
//
// It is a REPORT, not a gate, for two reasons. Copies of a short name are not
// always copies of a function -- `pct` is a percentage reader in three modules
// and a percentage FORMATTER in a fourth -- and a divergence only matters if a
// caller can reach it. Both surfaces normalise before the library is called
// (`mcp/fields.js` `toBool` hands every `kind: 'bool'` field a real boolean;
// `mcp/tools.js` coerces `kind: 'number'`), so most of what this prints is
// latent. Read the rows against the surfaces before fixing one.
//
// What it found: `lvl`/`pct` in `lib/dermscore-v234.js` returned **0** for a
// value off the scale, so four scalp regions entered as 150% terminal hair loss
// read "Severity of Alopecia Tool 0 of 100 -- S0 (no loss)" with `valid: true`.
//
// Usage: node scripts/probe-helper-behaviour-drift.mjs
import { readdirSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// spec-v1818: the name/arity groups that have been READ, with the reason their copies differ.
//
// `check-helper-drift` in the lint chain watches the readers whose disagreement is a CORRECTNESS question
// and requires one behaviour each. This probe asks a wider question -- it DRIVES every copy of every
// repeated name over the battery below -- and most of what it finds is not drift at all but two different
// functions wearing one short name. Those are judged here, so a group whose copies answer the SAME
// question differently is the only thing the report prints.
//
// spec-v1818 moved `bool` out of this list and into `check-helper-drift`'s watched set, because it is the
// one group that did answer the same question: every copy asks "is this criterion ticked?", and three of
// the thirty-six read the number 1 as NO while the other thirty-three read it as yes.
const JUDGED = {
  'clamp/3': 'A bound applied to a number already read, not a reader. Nine copies take (v, lo, hi) and six '
    + 'write the comparisons out; three return null for null, which only matters to a caller that passes '
    + 'one, and none does -- clamp is applied after the read',
  'fin/1': 'Two different jobs under one name, both right where they are used: 31 copies accept a real '
    + 'NUMBER only (a string reads as absent, which is what their callers want of a value the surface has '
    + 'already coerced) and 5 accept a numeric string too. Neither surface sends a string -- makeToArgs '
    + 'coerces a number field through parseDecimal, and the views read through numv',
  'pct/1': 'Three different jobs under one name: a formatter ("7.2%"), a converter (x100), and a reader '
    + 'that bounds a percentage at 100. Each module uses its own, and the disagreement is the name being '
    + 'short rather than one rule written twice',
  'pct/2': 'The two-argument form is a rate out of a denominator, and its copies differ in what they do '
    + 'with a zero denominator -- null, or a formatted NaN. Not the same question as pct/1 at all',
  'r1/1': 'A round to one decimal in two shapes: 28 copies return the NUMBER and 10 return the STRING of '
    + 'it, and a value and a formatted value are different jobs. spec-v1818 fixed the one case where the '
    + 'NAME lied -- two modules called a round to TWO decimals r1',
  'r2/1': 'The same two shapes at two decimals: 30 copies return the number, 4 the string, and one returns '
    + 'it through toLocaleString for a thousands separator',
};
const judgedSeen = new Set();
const JUDGED_ALL = process.argv.includes('--all');

const WATCH = ['fin', 'bool', 'B', 'r1', 'r2', 'clamp', 'pct', 'nn', 'blank'];

// Plausible readings, the boundary values, and the things that are not readings
// at all. The last group is the point: `''`, `null` and `'  '` are how "nobody
// said" arrives, and they are what the copies disagree about.
const BATTERY = [0, 1, -1, 0.5, 7.2, 100, -3.7, 1e6, 1e308, 1e-9, NaN, Infinity, -Infinity,
  null, undefined, '', '  ', '0', '7.2', 'abc', true, false, 'true', '1', 'on', [], {}];

const copies = new Map();
for (const file of readdirSync('lib').filter((x) => x.endsWith('.js'))) {
  const lines = readFileSync(`lib/${file}`, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^(?:const (\w+) = |function (\w+)\()/.exec(lines[i]);
    const name = m && (m[1] || m[2]);
    if (!name || !WATCH.includes(name)) continue;
    let depth = 0;
    let j = i;
    for (; j < lines.length; j += 1) {
      depth += (lines[j].match(/[{(]/g) || []).length - (lines[j].match(/[})]/g) || []).length;
      if (depth <= 0) break;
    }
    if (!copies.has(name)) copies.set(name, []);
    copies.get(name).push({ file, line: i + 1, body: lines.slice(i, j + 1).join('\n') });
  }
}

const TMP = mkdtempSync(join(tmpdir(), 'helper-drift-'));
const show = (v) => { try { return JSON.stringify(v) ?? String(v); } catch { return String(v); } };
let drifted = 0;
let agreed = 0;

for (const [name, list] of [...copies].sort()) {
  if (list.length < 2) continue;
  const fns = [];
  for (const c of list) {
    // Each body is written out as its own module and imported. `new Function` is
    // forbidden here by house lint (no-restricted-syntax), and a real module is
    // the more honest evaluation anyway: the copy runs exactly as written.
    const f = join(TMP, `${name}-${c.file.replace(/\W/g, '_')}-${c.line}.mjs`);
    try {
      writeFileSync(f, `${c.body.replace(/^export /, '')}\nexport default ${name};\n`);
      const mod = await import(pathToFileURL(f).href);
      if (typeof mod.default === 'function') fns.push({ ...c, fn: mod.default });
    } catch { /* not standalone: references module scope, or is not a function */ }
  }
  // Compare like with like. `fin` exists as a 1-argument reader AND a 3-argument
  // bounds-checking one; feeding one argument to both makes every 3-arg copy
  // answer on an undefined `lo`/`hi`, and then everything "disagrees" for a
  // reason that has nothing to do with drift.
  const byArity = new Map();
  for (const f of fns) {
    if (!byArity.has(f.fn.length)) byArity.set(f.fn.length, []);
    byArity.get(f.fn.length).push(f);
  }
  for (const [arity, all] of byArity) {
    const args = (v) => [v, ...[0, 100].slice(0, Math.max(0, arity - 1))];
    // A copy that closes over a module-scope helper cannot be evaluated alone.
    // That is a limit of this probe, not a disagreement -- counting its
    // ReferenceError as one made every watched name look drifted.
    const group = all.filter((f) => BATTERY.some((v) => {
      try { f.fn(...args(v)); return true; } catch (e) { return !(e instanceof ReferenceError); }
    }));
    const unreached = all.length - group.length;
    const tail = unreached ? ` (${unreached} more close over module scope)` : '';
    if (group.length < 2) {
      if (all.length >= 2) console.log(`\n${name}/${arity}: not comparable${tail}`);
      continue;
    }
    const rows = [];
    for (const v of BATTERY) {
      const out = group.map((f) => {
        try { return show(f.fn(...args(v))); } catch (e) { return `throw:${e.constructor.name}`; }
      });
      if (new Set(out).size > 1) rows.push({ v: show(v), out });
    }
    if (!rows.length) {
      agreed += 1;
      console.log(`\n${name}/${arity}: ${group.length} copies AGREE on all ${BATTERY.length} values${tail}`);
      continue;
    }
    const key = `${name}/${arity}`;
    if (JUDGED[key]) {
      judgedSeen.add(key);
      if (JUDGED_ALL) console.log(`JUDGED\t${key}\t${JUDGED[key]}`);
      continue;
    }
    drifted += 1;
    console.log(`\n${name}/${arity}: ${group.length} copies, ${rows.length} of ${BATTERY.length} values DISAGREE${tail}`);
    for (const f of group) console.log(`   ${f.file}:${f.line}`);
    for (const r of rows.slice(0, 6)) console.log(`  ${String(r.v).padEnd(12)} -> ${r.out.join(' | ')}`);
    if (rows.length > 6) console.log(`  ... ${rows.length - 6} more values separate them`);
  }
}

rmSync(TMP, { recursive: true, force: true });
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
if (stale.length) {
  console.log(`STALE-LEDGER: ${stale.length} judged group(s) this run no longer reaches: ${stale.join(', ')}.`);
  console.log('A reason cannot outlive what it describes -- re-read the helper and remove the row.');
}
console.log(`\n${drifted} watched name/arity groups disagree, ${agreed} agree`
  + ` (reach: ${WATCH.length} names across ${readdirSync('lib').filter((x) => x.endsWith('.js')).length} lib modules)`);
