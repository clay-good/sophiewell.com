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
    drifted += 1;
    console.log(`\n${name}/${arity}: ${group.length} copies, ${rows.length} of ${BATTERY.length} values DISAGREE${tail}`);
    for (const f of group) console.log(`   ${f.file}:${f.line}`);
    for (const r of rows.slice(0, 6)) console.log(`  ${String(r.v).padEnd(12)} -> ${r.out.join(' | ')}`);
    if (rows.length > 6) console.log(`  ... ${rows.length - 6} more values separate them`);
  }
}

rmSync(TMP, { recursive: true, force: true });
console.log(`\n${drifted} watched name/arity groups disagree, ${agreed} agree`
  + ` (reach: ${WATCH.length} names across ${readdirSync('lib').filter((x) => x.endsWith('.js')).length} lib modules)`);
