// spec-v1495: the Oral Health Assessment Tool.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { ohatOralHealth as oh } from '../../lib/ohat-oral-health-v1495.js';

const EX = { lips: '0', tongue: '1', gums: '2', saliva: '0', teeth: '1', dentures: '0', cleanliness: '2', pain: '0' };

test('the worked example: 6 of 16 with two items unhealthy', () => {
  const r = oh(EX);
  assert.equal(r.band, 'OHAT 6 of 16. Unhealthy: gums and tissues, oral cleanliness. Changes: tongue, natural teeth.');
  assert.equal(r.bandLabel, 'OHAT 6, 2 unhealthy');
});

test('a partial form discloses and does not reassure', () => {
  const r = oh({ lips: '0', tongue: '0' });
  assert.equal(r.bandLabel, 'OHAT 0 (2 of 8 items)');
  assert.match(r.band, /The items rated are healthy/);
  assert.match(r.notes[0], DISCLOSING);
  assert.equal(oh(Object.fromEntries(Object.keys(EX).map((x) => [x, '0']))).band, 'OHAT 0 of 16. Every item rated healthy.');
});

test('nothing rated is asked for', () => {
  assert.match(oh({}).message, ASKING);
});
