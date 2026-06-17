// spec-v96 2.4: Mood Disorder Questionnaire bipolar-spectrum screen (Hirschfeld 2000).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mdq } from '../../lib/psych-v96.js';

const yesN = (n) => new Array(13).fill('no').map((v, i) => (i < n ? 'yes' : v));

test('positive screen requires all three gates', () => {
  const r = mdq({ symptoms: yesN(7), coOccurrence: 'yes', impairment: 'moderate' });
  assert.equal(r.positive, true);
  assert.equal(r.yesCount, 7);
});

test('serious impairment also satisfies the impairment gate', () => {
  const r = mdq({ symptoms: yesN(10), coOccurrence: 'yes', impairment: 'serious' });
  assert.equal(r.positive, true);
});

test('symptom gate miss (6 of 13) is negative and named', () => {
  const r = mdq({ symptoms: yesN(6), coOccurrence: 'yes', impairment: 'moderate' });
  assert.equal(r.positive, false);
  assert.equal(r.yesCount, 6);
  assert.match(r.band, /below the 7-item threshold/);
});

test('co-occurrence gate miss is negative and named', () => {
  const r = mdq({ symptoms: yesN(9), coOccurrence: 'no', impairment: 'serious' });
  assert.equal(r.positive, false);
  assert.match(r.band, /did not co-occur/);
});

test('impairment gate miss (minor) is negative and named', () => {
  const r = mdq({ symptoms: yesN(9), coOccurrence: 'yes', impairment: 'minor' });
  assert.equal(r.positive, false);
  assert.match(r.band, /below moderate/);
});

test('empty input is a safe negative', () => {
  const r = mdq({});
  assert.equal(r.positive, false);
  assert.equal(r.yesCount, 0);
});
