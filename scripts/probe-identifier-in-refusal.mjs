#!/usr/bin/env node
// spec-v1790: a refusal that names the thing by the developer's name for it.
//
// `free-water-deficit` told a reader "extend replaceOverHours or raise targetNa" -- two camelCase
// identifiers, where the boxes they had just filled in are labelled "Replace over" and "Target Na". `spadi`
// refused with "Unrecognized: painWorst", where the item reads "Pain at its worst". `nems` asked for
// "basicMonitoring". The reader is sent to fix a name they have never seen, in a tool whose whole promise is
// plain language.
//
// [spec-v1015](../docs/spec-v1015.md) fixed this family once, when a nurse was shown
// `weightKg out of range [0.3, 500]`: "a refusal in the words of a stack trace, from the tool that is
// supposed to be the plain-language one". It fixed the SHAPE of the sentence. This is the same complaint
// about its CONTENT, and `lib/num.js`'s `readable()` only helps the callers that pass through it -- a
// message assembled from a table's `key` never touches it.
//
// Why no gate caught it: `scripts/check-tile-copy.mjs` scans `views/` for house vocabulary on screen, and
// these strings live in `lib/`. The libraries are where the refusals are written.
//
// ORACLE. For each tool, every field in turn is given a value no scale accepts and then dropped entirely,
// which is how the "Unrecognized" and "Still needed" branches are reached. A row is a refusal whose text
// contains one of that tool's OWN argument names, where the argument name is camelCase -- an interior
// capital means it cannot be ordinary English, and cannot be an instrument's published notation either.
// That last part is what keeps the finder honest: `mest-c` prints "M (Mesangial hypercellularity)" and
// `nih-cpsi` prints "q1a", which ARE the published names, and neither is reported.
//
// FIXING ONE. The item tables almost always carry the reader's wording already, under `text` or `name`, and
// `thwaites` has always printed it: `bad.map((a) => a.feature.text)`. Where a table has no prose at all, the
// adapter's label is the reader's name for the item -- `robarts-index` labels every item by its Geboes
// grade, which the item carries.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-identifier-in-refusal.mjs
//   TOOLS=spadi,nems node scripts/probe-identifier-in-refusal.mjs

import { allCalculators, REGISTRY } from '../mcp/catalog.js';
import { META } from '../lib/meta.js';

const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;

// An interior capital: `painWorst`, `replaceOverHours`. Not `pH`, not `pKa`.
const CAMEL = /\b[a-z][a-z0-9]*[A-Z][A-Za-z0-9]*\b/g;
// Scientific notations that are spelled this way on purpose and are the reader's own words.
const NOTATION = new Set(['pKa', 'pH', 'mEq', 'mOsm', 'mmHg', 'logMAR', 'proBNP', 'mNUTRIC', 'oSCORAD', 'dsDNA']);

// The prose a reading can carry. A result's KEYS are not prose: `{"weightKg": 70}` names an identifier
// without showing one to anybody, and reading the whole JSON reported 597 rows of nothing.
const PROSE = ['band', 'bandLabel', 'note', 'notes', 'message', 'verdict', 'text', 'detail', 'safetyNote', 'interpretation'];
const proseOf = (r) => {
  const out = [];
  const walk = (v) => { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(walk); };
  for (const k of PROSE) if (r && r[k] !== undefined) walk(r[k]);
  return out.join(' \n ');
};

let tools = 0;
const rows = [];
for (const t of allCalculators()) {
  if (ONLY && !ONLY.has(t.id)) continue;
  const example = META[t.id]?.example?.fields;
  if (!example) continue;
  const entry = REGISTRY.get(t.id);
  if (!entry) continue;
  const args = new Set((t.fields || []).map((f) => f.arg).filter(Boolean));
  const camelArgs = [...args].filter((a) => /^[a-z][a-z0-9]*[A-Z]/.test(a) && a.length > 5 && !NOTATION.has(a));
  if (!camelArgs.length) continue;
  tools += 1;

  const found = new Map();
  for (const f of t.fields || []) {
    const configs = [{ ...example, [f.dom]: 'zzz' }];
    const dropped = { ...example };
    delete dropped[f.dom];
    configs.push(dropped);
    // A value no scale accepts reaches the refusals. It does not reach a NOTE a tool adds when a valid
    // value is aggressive: free-water-deficit says "extend replaceOverHours or raise targetNa" only when
    // the replacement window is short enough to breach the 10 mEq/L/24h ceiling, which is a perfectly
    // acceptable number. So the example's own value is scaled as well.
    const v = Number(example[f.dom]);
    if (Number.isFinite(v) && v > 0) {
      configs.push({ ...example, [f.dom]: String(v * 0.25) }, { ...example, [f.dom]: String(v * 4) });
    }
    for (const cfg of configs) {
      let r;
      try { r = entry.compute(entry.toArgs(cfg)); } catch { continue; }
      if (!r) continue;
      const text = proseOf(r);
      if (!text) continue;
      const seen = new Set(text.match(CAMEL) || []);
      for (const a of camelArgs) {
        if (!seen.has(a) || found.has(a)) continue;
        const where = text.match(new RegExp(`.{0,40}\\b${a}\\b.{0,24}`));
        found.set(a, (where ? where[0] : '').replace(/\s+/g, ' ').trim());
      }
    }
  }
  for (const [a, where] of found) rows.push(`${t.id}\t${a}\t${where}`);
}

for (const r of rows.sort()) console.log(r);
const distinct = new Set(rows.map((r) => r.split('\t')[0])).size;
console.error(`\n${rows.length} refusal(s) across ${distinct} tool(s) name one of the tool's own argument identifiers.\n`
  + `Reach: ${tools} tool(s) with a computable worked example and at least one camelCase argument name, each field `
  + `driven with an unacceptable value and then dropped.\n`
  + 'The fix is the item table\'s own prose (text or name), which thwaites has always printed.');
