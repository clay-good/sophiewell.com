#!/usr/bin/env node
// The first sentence of every MCP adapter summary is the lede on the tile's
// pre-rendered /tools/<id>/ page and its line in search results. It is the one
// sentence most readers see, so it should read as a sentence.
//
// Adapter summaries use ALL CAPS for emphasis further down, aimed at an agent
// skimming a tool description. That convention is fine where it lives, but in
// the lede it reads as shouting at a nurse. Ten tiles had it before this check
// ("classification of LOW-PROGNOSIS patients", "a patient ALREADY DIAGNOSED
// with").
//
// The check is a stoplist, not a rule against capitals: the catalog is full of
// real acronyms (SOFA, KDIGO, TIMI) and acronym tool names that are ordinary
// words (STONE, HEART, PUSH, START). Only words that are never an acronym in
// this domain are listed. Add to the list when a new one shows up; do not
// invert it into an allowlist of acronyms, which would need hundreds of
// entries and would go stale.
//
// Exit code 0 on success, 1 on any violation.

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ADAPTERS = join(process.cwd(), 'mcp', 'adapters');

const STOPLIST = [
  'ABBREVIATED', 'ADVANCED', 'AFFECTING', 'ALREADY', 'CARDIAC', 'CELLULAR',
  'CLASSIFICATION', 'CLINICAL', 'CRITERIA', 'DEFINITION', 'DIAGNOSED',
  'DIAGNOSTIC', 'ESTABLISHED', 'HISTOLOGICAL', 'HISTOPATHOLOGY', 'INDEXED',
  'INTERNAL', 'LOW-PROGNOSIS', 'LOWER', 'METASTATIC', 'MULTIPLIED',
  'PREOPERATIVE', 'REQUIRING', 'SEVERITY', 'SUPERSEDED', 'SUSPICION',
  'TOXICITY', 'UPDATED',
];
const STOP = new RegExp(`\\b(${STOPLIST.join('|')})\\b`, 'g');

// Matches the quoted body of `summary: '...'`, including escaped quotes.
const SUMMARY = /summary:\s*'((?:[^'\\]|\\.)*)'/g;

function firstSentence(text) {
  const m = /[.!?]\s+/.exec(text);
  return m ? text.slice(0, m.index + 1) : text;
}

const violations = [];
for (const file of (await readdir(ADAPTERS)).filter((f) => f.endsWith('.js'))) {
  const source = await readFile(join(ADAPTERS, file), 'utf8');
  for (const match of source.matchAll(SUMMARY)) {
    const lede = firstSentence(match[1]);
    const shouted = [...new Set(lede.match(STOP) || [])];
    if (shouted.length) {
      violations.push(`mcp/adapters/${file}: ${shouted.join(', ')}\n    ${lede.slice(0, 140)}`);
    }
  }
}

if (violations.length) {
  console.error(`check-lede-copy: ${violations.length} summary lede(s) shout an ordinary word.`);
  console.error('Lowercase it, or add the word to STOPLIST only if it is a real acronym.\n');
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log('check-lede-copy: clean (adapter summary ledes read as sentences).');
