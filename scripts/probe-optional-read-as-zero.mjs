#!/usr/bin/env node
// spec-v1213: a field the page CALLS optional, read as a measurement of zero.
//
// Fifteen view modules carry a reader of the shape
//
//   function val(id) { return Number(document.getElementById(id).value); }
//
// and `Number('')` is 0. For a required field that is the blank-form defect
// spec-v1006 onward exists for, and the sweeps already ask about it. This probe
// asks the narrower question those sweeps cannot: when the LABEL says
// "(optional)", the library on the other side has written a branch for the
// absent case -- and a zero walks straight past it.
//
// `bristolGirth` is the case it was built from. Both girths are labelled
// optional and the library guards them with `Number.isFinite`, which is correct
// against `undefined` (the agent surface omits an absent field) and useless
// against `0` (the browser sends one). A girth of 95 cm at T1 with T0 left blank
// read as a 95 cm rise and raised both SCCM 2013 abdominal-compartment-syndrome
// banners.
//
// A row is a SUSPECT, not a defect. Many call sites guard the value themselves
// -- `crl > 0`, `str(id) !== ''`, `.value === '' ? undefined : ...` -- and those
// are filtered out below. What is left has to be read against the library it
// feeds: the question is whether that function distinguishes an absent value
// from a zero, and only the function can answer it.
//
// Usage: node scripts/probe-optional-read-as-zero.mjs
import { readdirSync, readFileSync } from 'node:fs';

const RAW = /^function (\w+)\(id\) \{ return Number\(document\.getElementById\(id\)\.value\); \}/m;

// A builder is a number-input builder if it makes an <input> and mentions
// 'number'; `type: opts.type || 'number'` is the common shape and a literal
// `type: 'number'` match misses it.
function buildersIn(src) {
  const lines = src.split('\n');
  const num = new Set();
  for (let i = 0; i < lines.length; i += 1) {
    const d = /^function (\w+)\(/.exec(lines[i]);
    if (!d) continue;
    let depth = 0;
    let j = i;
    for (; j < lines.length; j += 1) {
      depth += (lines[j].match(/\{/g) || []).length - (lines[j].match(/\}/g) || []).length;
      if (depth === 0) break;
    }
    const body = lines.slice(i, j + 1).join('\n');
    if (/el\('input'/.test(body) && /'number'/.test(body)) num.add(d[1]);
  }
  return num;
}

// The id is the SECOND quoted string on the builder call; the first is the label,
// and a label may contain a ')' -- so read to end of line, not to the paren.
function optionalNumberIds(src, builders) {
  const ids = new Map();
  for (const b of builders) {
    for (const m of src.matchAll(new RegExp(`\\b${b}\\((.*)$`, 'gm'))) {
      const q = [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
      if (q.length >= 2 && /optional/i.test(q[0])) ids.set(q[1], q[0]);
    }
  }
  return ids;
}

let reach = 0;
const rows = [];
for (const entry of readdirSync('views').filter((f) => f.endsWith('.js'))) {
  const src = readFileSync(`views/${entry}`, 'utf8');
  const m = RAW.exec(src);
  if (!m) continue;
  reach += 1;
  const helper = m[1];
  const optional = optionalNumberIds(src, buildersIn(src));
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const call of line.matchAll(new RegExp(`\\b${helper}\\('([^']+)'\\)`, 'g'))) {
      const id = call[1];
      if (!optional.has(id)) continue;
      // The call site may do its own asking. Read the whole statement and the
      // renderer around it, not just this line: the guard is usually a few lines
      // up, and it is the READING that has to be guarded, not the field.
      const around = lines.slice(Math.max(0, i - 14), i + 2).join('\n');
      // Three ways a call site does its own asking: it tests the raw value for
      // emptiness, it tests this read for positivity, or it binds the read (or
      // the raw string) to a name and tests THAT. The last is the common one,
      // and a line-local pattern cannot see it.
      const alias = `(?:${helper}|str|v29d)\\('${id}'\\)`;
      const guarded = new RegExp(`${id}'\\)\\.value === ''|${alias} > 0|${alias} !== ''`).test(around)
        || new RegExp(`const (\\w+) = ${alias};[\\s\\S]{0,1500}?\\b\\1 (?:> 0|!== ''|!= null)`).test(src)
        || new RegExp(`\\[[^\\]]*'${id}'[^\\]]*\\][\\s\\S]{0,300}?(?:Missing|missing|needValues)`).test(around);
      if (guarded) continue;
      rows.push({ file: entry, line: i + 1, id, label: optional.get(id), text: line.trim().slice(0, 100) });
    }
  }
}

console.log(`${rows.length} optional-labelled fields read as zero (reach: ${reach} view modules carrying the helper)`);
for (const r of rows) console.log(`  ${r.file}:${r.line}  ${r.id}  "${r.label}"\n      ${r.text}`);
