#!/usr/bin/env node
// spec-v184 §5.3: US-English / US-terminology guard.
//
// Fails on British spellings and non-US drug names in USER-FACING surfaces --
// the rendered strings in lib/, views/, app.js, and index.html. The site is a
// US clinical product (global formatting mandate: American English); a US nurse
// should never read `oedema`, `haemoglobin`, or `noradrenaline` in the UI.
//
// It deliberately does NOT touch citations, journal abbreviations, article
// titles, or official instrument/program names -- those are proper nouns kept
// in their original spelling (spec-v184 §3.7). The allowlist exempts:
//   - JS comment lines (`//`, and `*`/`/*` block-comment bodies);
//   - any line carrying a citation/source field (`citation`, `sourceCitation`,
//     `citationUrl`, `source:`);
//   - any line carrying a journal-abbreviation / publisher token (Br J ...,
//     Paediatr ..., Acta ..., Eur Urol, J Urol, J Clin Oncol, Lancet, BMJ,
//     N Engl, Gut, ...);
//   - the official instrument/program names enumerated in spec-v184 §3.7
//     (PIM3 "Paediatric Index of Mortality", APLS "Advanced Paediatric Life
//     Support", the ELSO "Adult and Paediatric Respiratory Failure" title).
//
// docs/, CHANGELOG.md, test/, scripts/, vendored/, and data/ are NOT scanned --
// they carry citations and historical British-spelled titles by design.
//
// Exit 0 on a clean scan, 1 on any user-facing violation.

import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// User-facing surfaces only. lib/ and views/ are walked recursively; app.js and
// index.html are scanned directly.
const SCAN_DIRS = ['lib', 'views'];
const SCAN_FILES = ['app.js', 'index.html'];

// British spellings + non-US drug names (spec-v184 §5.3 seed list). Whole-word,
// case-insensitive.
const BANNED = new RegExp(
  '\\b(' + [
    'ionised', 'ionisation', 'haemoglobin', 'haematocrit', 'haemorrhage',
    'oedema', 'colour', 'behaviour', 'anaemia', 'fibre', 'tumour', 'diarrhoea',
    'grey', 'paralyse', 'catheteris', 'oestrogen', 'foetal', 'leucocyte',
    'caesarean', 'orthopaedic', 'noradrenaline', 'adrenaline', 'paracetamol',
    'salbutamol', 'frusemide',
  ].join('|') + ')\\b',
  'i',
);

// A line is exempt when it is a comment, a citation/source field, or carries a
// journal/publisher token or an official-name phrase. This is the spec-v184
// §3.7 allowlist; it keeps proper nouns and primary-source strings untouched.
const CITATION_FIELD = /\b(citation|sourceCitation|citationUrl)\b\s*:|(^|[^\w])source\s*:/;
const JOURNAL_TOKEN = /\b(Br J|Paediatr|Acta|Eur Urol|J Urol|J Clin Oncol|Lancet|BMJ|N Engl|Gut|Crit Care|Intensive Care|Anaesth|Haematol|Circulation|Chest|Stroke|Kidney Int|Nephrol|Fetal Matern Med|J Surg|Arch|Ann )\b/;
const OFFICIAL_NAME = /Paediatric Index of Mortality|Advanced Paediatric Life Support|Adult and Paediatric Respiratory Failure|Orthopaedic Association/;

function isComment(line) {
  const t = line.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
}

function isAllowlisted(line) {
  return CITATION_FIELD.test(line) || JOURNAL_TOKEN.test(line) || OFFICIAL_NAME.test(line);
}

async function collect(dir, out) {
  let entries;
  try { entries = await readdir(join(ROOT, dir), { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) await collect(rel, out);
    else if (e.isFile() && (e.name.endsWith('.js') || e.name.endsWith('.html'))) out.push(rel);
  }
}

const files = [...SCAN_FILES];
for (const d of SCAN_DIRS) await collect(d, files);

const violations = [];
for (const rel of files) {
  let text;
  try { text = readFileSync(join(ROOT, rel), 'utf8'); }
  catch { continue; }
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isComment(line) || isAllowlisted(line)) continue;
    const m = BANNED.exec(line);
    if (m) violations.push(`${relative(ROOT, join(ROOT, rel)) || rel}:${i + 1}: "${m[1]}" -> use the US spelling/term (spec-v184 §4.2)`);
  }
}

if (violations.length) {
  console.error('check-us-english: FAIL -- British spelling / non-US term in user-facing surface:');
  for (const v of violations) console.error('  ' + v);
  process.exit(1);
}
console.error(`check-us-english: clean (${files.length} user-facing files scanned).`);
