// spec-v4 §7 step v4.5: NUCC taxonomy lookup spot-check (>=5 known codes).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const ROWS = JSON.parse(await readFile(join(ROOT, 'data', 'nucc-taxonomy', 'taxonomy.json'), 'utf8'));
const BY_CODE = new Map(ROWS.map((r) => [r.code, r]));

const SPOT_CHECKS = [
  { code: '207Q00000X', expectClassification: 'Family Medicine' },
  { code: '208D00000X', expectClassification: 'General Practice' },
  { code: '207RC0000X', expectClassification: 'Internal Medicine', expectSpecialization: 'Cardiovascular Disease' },
  { code: '2084N0400X', expectSpecialization: 'Neurology' },
  { code: '363L00000X', expectClassification: 'Nurse Practitioner' },
  { code: '363A00000X', expectClassification: 'Physician Assistant' },
];

for (const c of SPOT_CHECKS) {
  test(`NUCC taxonomy: ${c.code} resolves`, () => {
    const r = BY_CODE.get(c.code);
    assert.ok(r, `${c.code} not present in bundled taxonomy seed`);
    if (c.expectClassification) assert.equal(r.classification, c.expectClassification);
    if (c.expectSpecialization) assert.equal(r.specialization, c.expectSpecialization);
  });
}

test('NUCC taxonomy: every row has 10-character code, type, classification', () => {
  for (const r of ROWS) {
    assert.match(r.code, /^[A-Za-z0-9]{10}$/, `bad code shape: ${r.code}`);
    assert.ok(r.type, `${r.code} missing type`);
    assert.ok(r.classification, `${r.code} missing classification`);
  }
});
