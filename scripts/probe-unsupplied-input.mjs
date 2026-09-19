#!/usr/bin/env node
// Finder (not a gate): inputs a calculator READS that no surface can SUPPLY.
//
// The agent tool calls each library with the arguments its MCP adapter declares, and the page
// passes the same keys (check-mcp-catalog round-trips the two). A library that reads a key outside
// that set is reading something nobody can say, and whatever branch sits behind it is either dead
// or, worse, decides the answer for everyone who could not say it:
//
//   uiss-rcc      refused node-positive disease on `nodePositive` / `metastatic`; nothing asked,
//                 so N1 or M1 disease got a localized tier and its survival figure.
//   minor-self-consent
//                 routed a married Texas minor on `married`; nothing supplied it.
//   ireton-jones  fell back to `obese` when the height was blank, so every blank height was
//                 "not obese" and lost the -609 kcal/day term.
//
// Two rows it prints are accepted: peds-bmi-percentile (weight and height are an alternative to
// the BMI the adapter asks for) and spetzler-ponce (a Spetzler-Martin grade is an alternative to
// the class). Neither answers differently for a reader who could not supply them.
//
// Reach is printed. Only compute functions that read one input object named `o`
// (`const o = input ...`) or destructure their parameter are read; helpers they call are not, and
// an adapter with a `toArgs` transform is skipped because its args are not the library's keys.

import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'mcp', 'adapters');

function readsOf(src) {
  const body = src.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const keys = new Set();
  if (/\bconst o = /.test(body)) {
    for (const m of body.matchAll(/\bo\.([A-Za-z_$][\w$]*)/g)) keys.add(m[1]);
    for (const m of body.matchAll(/\bo\[['"]([\w$]+)['"]\]/g)) keys.add(m[1]);
    return keys;
  }
  const head = body.match(/^[^(]*\(\s*\{([^}]*)\}\s*=\s*\{\}/);
  if (head) {
    for (const part of head[1].split(',')) {
      const name = part.split(/[=:]/)[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) keys.add(name);
    }
    return keys;
  }
  return null;
}

const rows = [];
let entries = 0;
let read = 0;
let reshaped = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.js')).sort()) {
  const mod = await import(pathToFileURL(join(DIR, file)).href);
  const list = Array.isArray(mod.default) ? mod.default : [];
  for (const e of list) {
    if (!e || typeof e.compute !== 'function' || !Array.isArray(e.fields)) continue;
    entries++;
    if (typeof e.toArgs === 'function') { reshaped++; continue; }
    const keys = readsOf(e.compute.toString());
    if (!keys) continue;
    read++;
    const args = new Set(e.fields.map((f) => f.arg));
    const extra = [...keys].filter((k) => !args.has(k));
    if (extra.length) rows.push({ id: e.id, file, extra });
  }
}

console.log(`${rows.length} calculator(s) read an input no surface supplies.\n`);
for (const r of rows) console.log(`  ${r.id.padEnd(34)} ${r.extra.join(', ')}   (mcp/adapters/${r.file})`);
console.log(`\nReach: ${entries} adapter entries; ${read} compute functions read directly`
  + ` (an \`o\` input object or a destructured parameter); ${reshaped} reshape their input with toArgs`
  + ` and ${entries - read - reshaped} delegate or wrap; neither was read.`);
