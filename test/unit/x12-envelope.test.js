// spec-v1623 step 1: the X12 envelope reader.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readEnvelope } from '../../lib/x12-envelope.js';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'file-kinds');

test('separators come from the fixed-width ISA; GS and ST are read with them', () => {
  const env = readEnvelope(readFileSync(join(DIR, 'x12-835.835'), 'utf8'));
  assert.equal(env.elementSep, '*');
  assert.equal(env.componentSep, ':');
  assert.equal(env.segmentSep, '~');
  assert.equal(env.sender, 'SENDER');
  assert.deepEqual(env.groups, [{ gs01: 'HP', gs08: '005010X221A1', sets: ['835', '835'] }]);
  assert.equal(env.transactions, 2);
  assert.equal(env.complete, true);
});

test('other separators, line breaks after segments, and a head cut short', () => {
  const text = readFileSync(join(DIR, 'x12-271.271'), 'utf8').replaceAll('*', '|').replaceAll('~', '\n');
  const env = readEnvelope(`  ${text}`);
  assert.equal(env.elementSep, '|');
  assert.equal(env.segmentSep, '\n');
  assert.deepEqual(env.groups[0].sets, ['271']);
  const cut = readEnvelope(text.slice(0, 200));
  assert.equal(cut.complete, false);
});

test('not X12: wrong start, a short ISA, or letters for separators', () => {
  assert.equal(readEnvelope('hello'), null);
  assert.equal(readEnvelope('ISA*00*short'), null);
  assert.equal(readEnvelope(`ISAX${'0'.repeat(120)}`), null);
});
