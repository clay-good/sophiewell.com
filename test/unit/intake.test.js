// spec-v1623 step 2: the inventory of a drop -- nested zips unpacked, hidden
// files skipped and counted, limits reported, never silently dropped.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inventory, isSkipped } from '../../lib/intake.js';
import { LIMITS } from '../../lib/file-kinds.js';
import { makeZip } from '../lib/zip-fixture.js';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'file-kinds');
const entry = (name, relativePath) => ({ file: new Blob([readFileSync(join(DIR, name))]), name, relativePath });

test('the whole fixtures folder: one row per file, zips unpacked, system files counted', async () => {
  const names = readdirSync(DIR).sort();
  const entries = [...names.map((n) => entry(n, `file-kinds/${n}`)), { file: new Blob(['x']), name: '.DS_Store', relativePath: 'file-kinds/.DS_Store' }];
  const { rows, skipped, refused, limitReached } = await inventory(entries);
  assert.equal(limitReached, null);
  assert.deepEqual(refused, []);
  // .DS_Store at the top, and __MACOSX/ and .DS_Store inside nested.zip.
  assert.equal(skipped, 3);
  const byPath = new Map(rows.map((r) => [r.path, r]));
  for (const n of names) {
    if (n === 'nested.zip' || n === 'fhir-clinical.ndjson.gz') continue;
    assert.ok(byPath.has(`file-kinds/${n}`), `no row for ${n}`);
  }
  assert.equal(byPath.get('file-kinds/nested.zip/remits/era-2.835').kind, 'x12-835');
  assert.equal(byPath.get('file-kinds/nested.zip/remits/inner.zip/era.835').kind, 'x12-835');
  assert.equal(byPath.get('file-kinds/nested.zip/remits/inner.zip/era.835').container, 'file-kinds/nested.zip/remits/inner.zip');
  assert.equal(byPath.get('file-kinds/fhir-clinical.ndjson').kind, 'fhir-clinical');
  assert.equal(byPath.get('file-kinds/claims.xlsx').kind, 'excel');
  assert.equal(rows.filter((r) => r.path.startsWith('file-kinds/fhir-clinical.ndjson')).length, 2, 'the .gz unpacks beside the plain file');
});

test('a zip bomb is refused with its reason; the rest of the drop still reads', async () => {
  const bomb = new Blob([makeZip([{ name: 'zeros.csv', data: Buffer.alloc(2 * 1024 * 1024) }])]);
  const { rows, refused } = await inventory([{ file: bomb, name: 'bomb.zip' }, entry('x12-271.271')]);
  assert.equal(rows.length, 1);
  assert.match(refused[0].reason, /zip bomb/);
});

test('the file limit is reported, not silently applied', async () => {
  const many = Array.from({ length: 5 }, (_, k) => ({ file: new Blob(['a,b\n1,2\n']), name: `f${k}.csv` }));
  const { rows, limitReached } = await inventory(many, { limits: { ...LIMITS, maxFiles: 3 } });
  assert.equal(rows.length, 3);
  assert.match(limitReached, /Only the first 3 files were read/);
});

test('skipped names', () => {
  for (const p of ['.DS_Store', 'a/__MACOSX/._x.835', 'Thumbs.db', 'x/desktop.ini', 'x/.hidden']) assert.ok(isSkipped(p), p);
  for (const p of ['era.835', 'a/b/claims.csv']) assert.ok(!isSkipped(p), p);
});
