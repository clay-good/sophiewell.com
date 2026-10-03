// spec-v1623 step 1: the browser zip reader, run in Node on Blobs (Node 22
// has Blob and DecompressionStream, as browsers do).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipMembers, memberBlob, refusal, gunzipBlob, MAX_RATIO } from '../../lib/zip-reader.js';
import { recognize, recognizeArchive } from '../../lib/file-kinds.js';
import { readHead } from '../../lib/file-head.js';
import { makeZip } from '../lib/zip-fixture.js';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'file-kinds');
const blobOf = (name) => new Blob([readFileSync(join(DIR, name))]);

test('lists members, reads stored and deflated ones, and unwraps a nested zip', async () => {
  const zip = blobOf('nested.zip');
  const members = await zipMembers(zip);
  assert.deepEqual(members.map((m) => m.name), ['remits/inner.zip', 'remits/era-2.835', '__MACOSX/._era-2.835', '.DS_Store']);
  assert.equal(refusal(members), null);
  const era = await memberBlob(zip, members[1]);
  assert.equal(recognize(await readHead(era), { name: 'era-2.835' }).kind, 'x12-835');
  const inner = await memberBlob(zip, members[0]); // stored
  const innerMembers = await zipMembers(inner);
  assert.deepEqual(innerMembers.map((m) => m.name), ['era.835']);
  assert.equal(recognize(await readHead(await memberBlob(inner, innerMembers[0])), {}).kind, 'x12-835');
});

test('an Excel workbook is recognized from its member names', async () => {
  const names = (await zipMembers(blobOf('claims.xlsx'))).map((m) => m.name);
  assert.equal(recognizeArchive(names).kind, 'excel');
});

test(`a member that would expand more than ${MAX_RATIO}:1 is refused as a zip bomb`, async () => {
  const bomb = new Blob([makeZip([{ name: 'zeros.csv', data: Buffer.alloc(2 * 1024 * 1024) }])]);
  const members = await zipMembers(bomb);
  assert.match(refusal(members), /zeros\.csv would expand more than 100 times its compressed size, which is how a zip bomb looks/);
});

test('gzip is unpacked by streaming', async () => {
  const out = await gunzipBlob(blobOf('fhir-clinical.ndjson.gz'));
  assert.equal(recognize(await readHead(out), { name: 'fhir-clinical.ndjson' }).kind, 'fhir-clinical');
});

test('a file that is not a zip, and an unsupported method, are named', async () => {
  await assert.rejects(zipMembers(new Blob(['just text, no archive here at all'])), /not a readable zip archive/);
  const z = Buffer.from(makeZip([{ name: 'a.txt', data: 'abc', method: 0 }]));
  z.writeUInt16LE(12, 8); // local header method -> bzip2
  const cd = z.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  z.writeUInt16LE(12, cd + 10);
  const [m] = await zipMembers(new Blob([z]));
  await assert.rejects(memberBlob(new Blob([z]), m), /compression method \(12\)/);
});
