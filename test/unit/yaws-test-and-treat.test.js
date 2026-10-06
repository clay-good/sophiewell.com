// spec-v1561 tool 6: yaws test reading, case classes, and the azithromycin dose.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yawsTestAndTreat as r } from '../../lib/yaws-test-and-treat-v1561.js';

const s = { age: '8', endemic: 'yes', lesion: 'yes' };

test('case classes', () => {
  assert.equal(r(s).bandLabel, 'Suspected yaws');
  assert.equal(r({ ...s, rdtC: 'yes', rdtT: 'yes' }).bandLabel, 'Treponemal-positive case');
  assert.equal(r({ ...s, dppC: 'yes', dppT: 'yes', dppNT: 'yes' }).bandLabel, 'Serologically confirmed yaws');
  assert.equal(r({ ...s, pcr: 'pos' }).bandLabel, 'PCR-confirmed yaws');
  assert.equal(r({ ...s, lesion: 'no', dppC: 'yes', dppT: 'yes', dppNT: 'yes' }).bandLabel, 'Latent yaws infection');
  assert.equal(r({ ...s, endemic: 'no' }).bandLabel, 'Not a yaws case');
});

test('test reading', () => {
  assert.ok(r({ ...s, dppC: 'yes', dppT: 'no', dppNT: 'yes' }).notes.some((n) => /invalid, not active/.test(n)));
  assert.ok(r({ ...s, rdtC: 'no', rdtT: 'yes' }).notes.some((n) => /invalid/.test(n)));
  assert.equal(r({ ...s, rdtC: 'yes' }).valid, false);
  assert.equal(r({ ...s, lesion: 'no', dppC: 'yes', dppT: 'yes', dppNT: 'no' }).bandLabel, 'Past yaws infection');
});

test('doses', () => {
  assert.match(r(s).band, /2 tablets of 500 mg/);
  assert.match(r({ ...s, age: '1', weight: '10' }).band, /Azithromycin 300 mg once.*1 tablet of 500 mg/);
  assert.match(r({ ...s, age: '30', weight: '80' }).band, /2,000 mg.*maximum 2 g/);
  assert.match(r({ ...s, age: '0.3' }).band, /not given under 6 months/);
  assert.equal(r({ ...s, endemic: '' }).valid, false);
});
