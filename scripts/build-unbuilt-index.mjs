#!/usr/bin/env node
// scripts/build-unbuilt-index.mjs -- the one page that answers "what is specified but not built, and
// what would unblock it".
//
// Every spec names its tools in a heading: a number, the id in backticks, a dash and the name. This reads all of them, compares
// each id with the UTILITIES list in app.js, and for each id that is not in the catalog pulls the
// sentence in that spec which says why: a "**Build gate.**" paragraph, or the first sentence of the
// tool's section that says it is not built, held or gated. Nothing is written by hand, so the page
// cannot claim a tool is built when it is not, or go stale when one ships.
//
// test/unit/unbuilt-index.test.js regenerates and compares, so the committed page and the specs cannot
// drift apart.
//
// Run: `node scripts/build-unbuilt-index.mjs`. Idempotent.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const DOC = join(ROOT, 'docs', 'unbuilt-tools.md');
const HEADING = /^#{3,4}\s*(\d+[a-z]?)\.\s*`([a-z0-9-]+)`\s*(?:\u2014|-)?\s*(.*)$/gm;

// The catalog's ids, from the UTILITIES literal app.js ships.
export function catalogIds(app) {
  return new Set([...app.matchAll(/\{ id: '([a-z0-9-]+)',/g)].map((m) => m[1]));
}

// firstSentence(text): the first sentence, without breaking on the full stops inside a citation --
// an initial ("Onder G et al."), "et al." itself, or a journal abbreviation. Those cut every
// source-gated reason down to an author's name.
const ABBREV = /(?:\b[A-Z]{1,3}|\bet al|\bal|\bvs|\bNo|\bFig|\bEd|\bpp|\bDr|\bJr|\bSr|\bApprox|\be\.g|\bi\.e)$/;
export function firstSentence(flat) {
  for (let i = 0; i < flat.length; i += 1) {
    if (!'.!?'.includes(flat[i])) continue;
    const next = flat[i + 1];
    if (next && next !== ' ') continue;
    if (ABBREV.test(flat.slice(0, i))) continue;
    // A decimal point or a version number is not a sentence end.
    if (/\d$/.test(flat.slice(0, i)) && /^\s\d/.test(flat.slice(i + 1))) continue;
    return flat.slice(0, i + 1).trim();
  }
  return flat.trim();
}

// reasonFor(section) -> the spec's own sentence about why a tool is not built, trimmed to one line.
export function reasonFor(section, spec, id) {
  // A spec states the reason under its own heading: "**Build gate.**", "**Source defect and build
  // gate.**", or "**Licensing.**" where the licence is what blocks it.
  const pick = (re) => { const m = re.exec(section); return m ? m[1] : null; };
  // A build gate is the reason; a licence line is only the reason when there is no gate.
  const gate = pick(/\*\*[^*]*?\bbuild gate\b[^*]*?\*\*\s*([\s\S]*?)(?:\n\n|$)/i)
    ? { 1: pick(/\*\*[^*]*?\bbuild gate\b[^*]*?\*\*\s*([\s\S]*?)(?:\n\n|$)/i) }
    : (pick(/\*\*Licensing\.?\*\*\s*([\s\S]*?)(?:\n\n|$)/) ? { 1: pick(/\*\*Licensing\.?\*\*\s*([\s\S]*?)(?:\n\n|$)/) } : null);
  const text = gate ? gate[1] : section;
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!gate) {
    const at = flat.search(/\b(?:not built|not yet built|is gated|stays gated|held for|is held)\b/i);
    if (at >= 0) {
      const from = flat.lastIndexOf('. ', at);
      return firstSentence(flat.slice(from < 0 ? 0 : from + 2));
    }
    // Nothing in the tool's own section: the spec may say so in its Build status table instead.
    return buildStatusReason(spec, id);
  }
  return firstSentence(flat);
}

// buildStatusReason(spec, id): the row for this id in the spec's Build status table, when it says the
// tool is not built. A spec that never mentions it returns null, and the page says so.
export function buildStatusReason(spec, id) {
  if (!spec) return null;
  const at = spec.search(/^## Build status/m);
  if (at < 0) return null;
  for (const line of spec.slice(at).split('\n')) {
    if (!line.includes(`\`${id}\``)) continue;
    const cells = line.split('|').map((c) => c.trim());
    const body = cells.length > 2 ? cells[2] : line;
    if (!/\bnot built|\bnot yet built|\bgated|\bheld\b/i.test(body)) continue;
    // "Not built: held." alone says nothing, so take the sentence that gives the reason with it.
    const flat = body.replace(/\s+/g, ' ').trim();
    const one = firstSentence(flat);
    const rest = flat.slice(one.length).trim();
    return rest ? `${one} ${firstSentence(rest)}` : one;
  }
  return null;
}

export function collect() {
  const app = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const live = catalogIds(app);
  const rows = [];
  for (const file of readdirSync(join(ROOT, 'docs')).filter((f) => /^spec-v\d+\.md$/.test(f)).sort()) {
    const text = readFileSync(join(ROOT, 'docs', file), 'utf8');
    const heads = [...text.matchAll(HEADING)];
    for (let i = 0; i < heads.length; i += 1) {
      const [, num, id, name] = heads[i];
      if (live.has(id)) continue;
      const start = heads[i].index;
      const end = i + 1 < heads.length ? heads[i + 1].index : text.length;
      rows.push({ spec: file.replace(/\.md$/, ''), num, id, name: name.trim(), reason: reasonFor(text.slice(start, end), text, id) });
    }
  }
  // One row per id: a tool named in two specs is listed once, under the first.
  const seen = new Set();
  return rows.filter((r) => (seen.has(r.id) ? false : seen.add(r.id)));
}

export function renderDoc(rows, totals) {
  const esc = (s) => String(s || '').replace(/\|/g, '\\|');
  const bySpec = new Map();
  for (const r of rows) {
    if (!bySpec.has(r.spec)) bySpec.set(r.spec, []);
    bySpec.get(r.spec).push(r);
  }
  const lines = [
    '# Specified but not built',
    '',
    'GENERATED by `scripts/build-unbuilt-index.mjs`. Do not edit by hand: it reads every spec\'s tool',
    'headings, compares them with the catalog in `app.js`, and quotes each spec\'s own reason. Re-run it',
    'after shipping a tool; `test/unit/unbuilt-index.test.js` fails when this page and the specs disagree.',
    '',
    `Across every spec, ${totals.specified} are named; ${totals.built} have shipped and ${rows.length} are not built yet.`,
    '',
    'A tool is listed here only while its id is missing from the catalog, so the page empties itself as',
    'tools ship. The reason is the spec\'s own sentence, not a summary written here.',
    '',
  ];
  for (const [spec, items] of bySpec) {
    lines.push(`## [${spec}](${spec}.md)`, '', '| Tool | Name | Why it is not built |', '|---|---|---|');
    for (const r of items) lines.push(`| ${r.num}. \`${r.id}\` | ${esc(r.name)} | ${esc(r.reason) || '_no reason stated in the spec_'} |`);
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

export function build() {
  const app = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const live = catalogIds(app);
  const specified = new Set();
  for (const file of readdirSync(join(ROOT, 'docs')).filter((f) => /^spec-v\d+\.md$/.test(f))) {
    for (const m of readFileSync(join(ROOT, 'docs', file), 'utf8').matchAll(HEADING)) specified.add(m[2]);
  }
  const rows = collect();
  const built = [...specified].filter((id) => live.has(id)).length;
  return renderDoc(rows, { specified: specified.size, built });
}

if (process.argv[1] && process.argv[1].endsWith('build-unbuilt-index.mjs')) {
  const text = build();
  writeFileSync(DOC, text, 'utf8');
  const n = (text.match(/^\| \d/gm) || []).length;
  console.log(`build-unbuilt-index: wrote docs/unbuilt-tools.md (${n} tool(s) specified but not built)`);
}
