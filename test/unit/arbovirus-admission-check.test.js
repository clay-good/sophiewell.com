// spec-v1563 tool 6: ARBO25 signs, the "might encourage" wording, blanks, and the acetaminophen dose.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arbovirusAdmissionCheck as r, SIGNS } from '../../lib/arbovirus-admission-check-v1563.js';

const allNo = Object.fromEntries(SIGNS.map(([k]) => [k, 'no']));

test('dengue signs', () => {
  assert.equal(r({ disease: 'dengue', ...allNo }).bandLabel, 'No listed signs');
  const x = r({ disease: 'dengue', ...allNo, vomit: 'yes' });
  assert.equal(x.bandLabel, 'Signs present');
  assert.match(x.band, /might encourage hospitalization/);
  assert.doesNotMatch(x.band, /\badmit\b/);
  assert.equal(r({ disease: 'dengue', ...allNo, preg: 'yes' }).bandLabel, 'Signs present');
  assert.equal(r({ disease: 'dengue', abdo: 'no' }).bandLabel, 'Not fully assessed');
});

test('other arboviruses and drugs', () => {
  assert.equal(r({ disease: 'zika' }).bandLabel, 'Individual assessment');
  assert.ok(r({ disease: 'chik', weight: '20' }).notes.some((n) => /200-300 mg every 4-6 hours .* 1,200 mg a day/.test(n)));
  assert.ok(r({ disease: 'chik', weight: '70' }).notes.some((n) => /500 mg to 1 g/.test(n)));
  assert.ok(r({ disease: 'yf' }).notes.some((n) => /No NSAIDs/.test(n)));
  assert.equal(r({}).valid, false);
});
