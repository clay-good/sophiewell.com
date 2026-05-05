// Per spec-v3 section 3 and 4: the AHA-attributed reference tables in
// data/aha-reference/ may carry numeric facts (drug doses, intervals,
// energy levels) but must NOT reproduce AHA flowchart text. This is a
// conservative static check against patterns characteristic of the
// published AHA algorithm flowcharts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// Sentences that strongly indicate copied AHA algorithm prose. Add to this
// list whenever a new AHA flowchart phrase is identified during review.
const FORBIDDEN_PATTERNS = [
  /\bshockable rhythm\?\b/i,
  /\bif return of spontaneous circulation\b/i,
  /\bbegin cpr\b/i,
  /\battach monitor\/defibrillator\b/i,
  /\bcheck rhythm every 2 minutes\b/i,
  /\b5 cycles of cpr\b/i,
];

test('AHA reference: file exists and declares numeric-facts status', async () => {
  const m = JSON.parse(await readFile(join(ROOT, 'data', 'aha-reference', 'manifest.json'), 'utf8'));
  assert.equal(m.status, 'numeric-facts-with-attribution');
  assert.match(m.notes || '', /flowcharts not reproduced/i);
});

test('AHA reference: data has attribution field', async () => {
  const data = JSON.parse(await readFile(join(ROOT, 'data', 'aha-reference', 'aha-reference.json'), 'utf8'));
  assert.ok(data.attribution && data.attribution.length > 40, 'attribution missing or too short');
  assert.match(data.attribution, /Numeric facts only/i);
});

test('AHA reference: no entry contains AHA flowchart language', async () => {
  const data = JSON.parse(await readFile(join(ROOT, 'data', 'aha-reference', 'aha-reference.json'), 'utf8'));
  const blob = JSON.stringify(data);
  for (const pat of FORBIDDEN_PATTERNS) {
    assert.equal(pat.test(blob), false, `forbidden AHA flowchart pattern matched: ${pat}`);
  }
});

test('AHA reference: every adultArrest entry has dose, interval, indication', async () => {
  const data = JSON.parse(await readFile(join(ROOT, 'data', 'aha-reference', 'aha-reference.json'), 'utf8'));
  for (const row of data.adultArrest) {
    assert.ok(row.drug && row.dose && row.interval && row.indication, `adultArrest row incomplete: ${JSON.stringify(row)}`);
  }
});

test('AHA reference: defibrillation table covers adult biphasic, pediatric, and cardioversion', async () => {
  const data = JSON.parse(await readFile(join(ROOT, 'data', 'aha-reference', 'aha-reference.json'), 'utf8'));
  const populations = data.defibrillationEnergy.map((r) => r.population.toLowerCase()).join(' ');
  assert.match(populations, /adult vf/i);
  assert.match(populations, /pediatric vf/i);
  assert.match(populations, /cardioversion/i);
});

// spec-v4 §7 step 4.1 hard rule: cpr-aha-numeric must carry only numeric AHA
// values, with attribution and the same flowchart-prose ban.
test('cpr-aha-numeric: declares numeric-facts status and does not contain AHA flowchart language', async () => {
  const m = JSON.parse(await readFile(join(ROOT, 'data', 'cpr-aha-numeric', 'manifest.json'), 'utf8'));
  assert.equal(m.status, 'numeric-facts-with-attribution');
  assert.match(m.notes || '', /flowchart/i);
  const data = JSON.parse(await readFile(join(ROOT, 'data', 'cpr-aha-numeric', 'cpr.json'), 'utf8'));
  const blob = JSON.stringify(data);
  for (const pat of FORBIDDEN_PATTERNS) {
    assert.equal(pat.test(blob), false, `forbidden AHA flowchart pattern matched in cpr-aha-numeric: ${pat}`);
  }
});
