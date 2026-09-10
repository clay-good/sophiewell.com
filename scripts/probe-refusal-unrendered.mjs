#!/usr/bin/env node
// spec-v1212: a refusal the library returns and the page never shows.
//
// spec-v1209 gave `uceis` and `ctsi-balthazar` their first-ever `valid: false`
// path. Neither renderer had a branch for one -- they had never needed one -- so
// the refusal printed beside "UCEIS undefined/8". The library was verified and
// the view was assumed, which is the trap spec-v1179 exists for.
//
// The same wave hit the other half of it: `cdai-crohns` and `ctsi-balthazar` use
// a local `showInvalid(o, r)` that reads `r.message`, and the guard returned only
// `r.band`, so the page printed the generic "Enter the required values." -- the
// dead end spec-v1210 had just finished condemning.
//
// So this asks two questions per tile, both static:
//
//   1. Can the compute function return `valid: false`, and does its renderer
//      branch on it at all?
//   2. When it branches, which key does it print -- and does every refusal the
//      function can return carry that key?
//
// The two buckets are NOT the same strength, and saying so is the point:
//
//   WRONG KEY   a DEFECT. The branch exists and fires, and prints its generic
//               fallback instead of the sentence the library wrote. `cdai-crohns`
//               did exactly this after spec-v1209 -- its diary fields are free
//               numbers, so a reader could reach it, and what they got was
//               "Enter the required values." for a value they had entered.
//
//   NO BRANCH   a SUSPECT. Most of these are a classification lookup behind a
//               select with NO BLANK OPTION -- `nyha-class` opens on Class I --
//               so the refusing state is unreachable from the page, and the agent
//               surface rejects the value against its own enum before the library
//               sees it. Real when the control can produce the state; check that
//               before acting (`scoring-select-probe.spec.js` asks the blank-option
//               question directly).
//
// `uceis` and `ctsi-balthazar` were fixed as the second kind: both are selects on
// both surfaces, so neither gap was reachable -- the code is right now, and no
// reader was seeing "UCEIS undefined/8".
//
// THIS FINDER WAS WRONG SIX TIMES BEFORE IT WAS RIGHT, and every wrong version
// looked like a finding. Kept here because each one is a way the next static
// probe in this repo will go wrong too:
//
//   reach 0        over-escaped regexes in a template literal -- `\\\\b` reaches
//                  RegExp as a literal backslash. Caught only by the reach line.
//   387 rows       the branch is usually one call away, in a local `showInvalid`
//                  or `render` helper (the spec-v1210 lesson, repeated).
//   73 "defects"   a refusal written across several lines: reading to end-of-line
//                  saw `valid: false,` and none of the keys under it.
//   3 "defects"    `// ... surfaced valid:false fallback` -- prose, not code
//                  (the spec-v1203 lesson, repeated).
//   1 "defect"     `{ valid: false, message, ... }` is a SHORTHAND property, and
//                  the check demanded `message:`.
//
// Negative-tested at the end: putting the `cdai-crohns` defect back produces
// exactly that one row, and removing it returns the count to zero.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-refusal-unrendered.mjs
//   node scripts/probe-refusal-unrendered.mjs --json

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const asJson = process.argv.includes('--json');
const say = asJson ? ((...a) => console.error(...a)) : ((...a) => console.log(...a));

const views = readdirSync(`${ROOT}views`).filter((f) => f.endsWith('.js'))
  .map((f) => ({ f, src: readFileSync(`${ROOT}views/${f}`, 'utf8') }));
const libs = readdirSync(`${ROOT}lib`).filter((f) => f.endsWith('.js'))
  .map((f) => ({ f, src: readFileSync(`${ROOT}lib/${f}`, 'utf8') }));

// Which key does a shared helper print? Both shapes in the repo read one key with
// a generic fallback, which is exactly how a missing key goes unnoticed.
function helperKey(src, name) {
  const m = new RegExp(`function ${name}\\(\\w+, (\\w+)\\) \\{[^}]*?\\b\\1\\.(message|band)\\b`).exec(src);
  return m ? m[2] : null;
}

// spec-v1212: only CODE is a refusal. `cardiacPowerOutput` carries the words
// "valid:false fallback, never a NaN" in a comment describing its own behaviour,
// and `gapIpf` and `periopBridging` do the same -- so all three were reported for
// a second refusal that does not exist. spec-v1203 fixed this exact trap in
// probe-unguarded-sibling; a new file repeated it. Blanking rather than deleting
// keeps every offset intact, so the brace-matching above still lines up with the
// original source.
function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length))
    .replace(/`(?:\\[\s\S]|[^`\\])*`/g, (m) => `\`${' '.repeat(Math.max(0, m.length - 2))}\``)
    .replace(/'(?:\\.|[^'\\\n])*'/g, (m) => `'${' '.repeat(Math.max(0, m.length - 2))}'`)
    .replace(/"(?:\\.|[^"\\\n])*"/g, (m) => `"${' '.repeat(Math.max(0, m.length - 2))}"`);
}

// The object literal containing `at`: back to its own unmatched `{`, then forward
// to the matching `}`.
function objectAround(src, at) {
  let depth = 0; let open = -1;
  for (let i = at; i >= 0; i -= 1) {
    if (src[i] === '}') depth += 1;
    else if (src[i] === '{') { if (depth === 0) { open = i; break; } depth -= 1; }
  }
  if (open === -1) return src.slice(at, at + 200);
  depth = 0;
  for (let j = open; j < src.length; j += 1) {
    if (src[j] === '{') depth += 1;
    else if (src[j] === '}') { depth -= 1; if (depth === 0) return src.slice(open, j + 1); }
  }
  return src.slice(open);
}

// Brace-match a function body from its `function` keyword (spec-v1210's lesson:
// match from after the PARAMETER LIST, since `opts = {}` is a brace too).
function bodyFrom(src, from) {
  const paren = src.indexOf('(', from);
  let pd = 0; let i = paren;
  for (; i < src.length; i += 1) {
    if (src[i] === '(') pd += 1;
    else if (src[i] === ')') { pd -= 1; if (pd === 0) break; }
  }
  const open = src.indexOf('{', i);
  if (open === -1) return '';
  let depth = 0;
  for (let j = open; j < src.length; j += 1) {
    if (src[j] === '{') depth += 1;
    else if (src[j] === '}') { depth -= 1; if (depth === 0) return src.slice(from, j + 1); }
  }
  return src.slice(from);
}

const rows = [];
let tiles = 0;
let withRefusal = 0;

for (const { f, src } of views) {
  const marks = [...src.matchAll(/^ {2}'([a-z0-9-]+)'\(root\)/gm)];
  for (let i = 0; i < marks.length; i += 1) {
    const tile = marks[i][1];
    const body = src.slice(marks[i].index, i + 1 < marks.length ? marks[i + 1].index : src.length);
    tiles += 1;

    // Which library function does this renderer call? `M.uceis({...})`.
    const call = /\b[A-Z]\.([a-zA-Z0-9_$]+)\s*\(/.exec(body);
    if (!call) continue;
    const fn = call[1];
    const lib = libs.find((l) => new RegExp(`export function ${fn}\\b`).test(l.src));
    if (!lib) continue;

    // Can it refuse? Only the function's own body counts (spec-v1210).
    const at = lib.src.indexOf(`export function ${fn}`);
    const nextFn = lib.src.indexOf('\nexport function ', at + 1);
    const fnBody = lib.src.slice(at, nextFn === -1 ? lib.src.length : nextFn);
    // spec-v1212: the refusal is the whole OBJECT LITERAL, not the rest of the
    // line. The house writes both shapes --
    //
    //   return { valid: false, message: fault };        // one line
    //   return {                                        // several
    //     valid: false,
    //     band: `Enter ${missing.join(' and ')}: ...`,
    //   };
    //
    // -- and reading to end-of-line saw only `valid: false,` for the second, so
    // `toxic-alcohol` and `urine-osmolal-gap` were both reported for refusals
    // that set exactly the key their renderer prints. Walk back to the object's
    // own opening brace and forward to its close.
    const fnCode = codeOnly(fnBody);
    const refusals = [...fnCode.matchAll(/valid:\s*false/g)].map((m) => objectAround(fnBody, m.index));
    if (!refusals.length) continue;
    withRefusal += 1;

    // spec-v1212: THE BRANCH IS OFTEN NOT IN THE RENDERER. The house convention
    // is a local one-liner -- `showInvalid(o, r)`, `render(o, r, label)` -- and
    // the first version of this probe read only the renderer body, so it reported
    // `nmr`, `far` and 300-odd others whose branch sits one call away. That is
    // the same mistake spec-v1210 fixed in probe-unguarded-sibling, made again in
    // a new file: a function's behaviour is not confined to the text between its
    // own braces.
    //
    // So: the renderer's own body, plus the body of any local helper it calls.
    const localFns = new Map();
    for (const d of src.matchAll(/^function ([A-Za-z0-9_$]+)\s*\(/gm)) {
      localFns.set(d[1], bodyFrom(src, d.index));
    }
    let scope = body;
    for (const [name, fnSrc] of localFns) {
      if (new RegExp(`\\b${name}\\s*\\(`).test(body)) scope += `\n${fnSrc}`;
    }

    const branch = /!\s*\w+\.valid|\.valid\s*===\s*false/.exec(scope);
    if (!branch) {
      rows.push({ tile, view: f, fn, problem: 'renderer has no branch for a refusal the function can return' });
      continue;
    }
    const line = /(?:!\s*\w+\.valid|\.valid\s*===\s*false)[^\n]*/.exec(scope)[0];
    let key = ['message', 'band'].find((k) => line.includes(`.${k}`)) || null;
    if (!key) {
      const h = /(\w+)\(\w+,\s*\w+\)/.exec(line);
      if (h) key = helperKey(src, h[1]);
    }
    if (!key) continue;                       // renderer prints something else; not this question
    // spec-v1212: `{ valid: false, message, ... }` is a SHORTHAND property, and
    // requiring `message:` reported `periop-bridging` for a refusal that sets
    // exactly the key its renderer prints. Both spellings count.
    const has = new RegExp(`\\b${key}\\s*[:,}]`);
    const missing = refusals.filter((r) => !has.test(r));
    if (missing.length) {
      rows.push({
        tile, view: f, fn, problem: `renderer prints r.${key}, and ${missing.length} of ${refusals.length} refusal(s) do not set it`,
      });
    }
  }
}

if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0); }

say('Refusals the library can return and the page would not show.');
say('A wrong-key row is a defect; a no-branch row is a suspect (see the header).\n');
console.log(`${rows.length} tile(s).\n`);
for (const r of rows) console.log(`  ${r.tile}  [${r.view} / ${r.fn}]\n      ${r.problem}`);
console.log(`\nReach: ${tiles} renderers read, ${withRefusal} call a library function that can refuse.`);
