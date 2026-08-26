// spec-v773: CTS-6 clinical diagnostic score for carpal tunnel syndrome.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cts6 } from '../../lib/cts6-v773.js';

test('no findings -> 0, lower likelihood', () => {
  const r = cts6({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /CTS-6 0 of 26/);
});

test('median-territory numbness alone -> 3.5, still lower likelihood', () => {
  const r = cts6({ medianNumbness: true });
  assert.equal(r.score, 3.5);
  assert.equal(r.tier, 'low');
  assert.match(r.bandLabel, /3\.5 of 26/);
});

test('median numbness plus nocturnal numbness -> 7.5, intermediate', () => {
  const r = cts6({ medianNumbness: true, nocturnalNumbness: true });
  assert.equal(r.score, 7.5);
  assert.equal(r.tier, 'intermediate');
  assert.equal(r.abnormal, false);
});

test('median plus nocturnal plus Phalen -> 12.5, high likelihood, worked example', () => {
  const r = cts6({ medianNumbness: 'true', nocturnalNumbness: 'true', phalen: 'true' });
  assert.equal(r.score, 12.5);
  assert.equal(r.tier, 'high');
  assert.equal(r.abnormal, true);
  assert.equal(r.probability, 'about 80%');
  assert.match(r.band, /CTS-6 12\.5 of 26/);
});

test('all six findings -> 26, the maximum', () => {
  const r = cts6({ medianNumbness: true, nocturnalNumbness: true, thenarAtrophy: true, phalen: true, twoPointLoss: true, tinel: true });
  assert.equal(r.score, 26);
  assert.equal(r.tier, 'high');
  assert.match(r.bandLabel, /26 of 26/);
});
