import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cries } from '../../lib/scoring-v4.js';

test('cries 0 (tile example) -> no significant pain', () => {
  const r = cries({ crying: 0, requiresO2: 0, vitals: 0, expression: 0, sleeplessness: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.band, 'no significant pain');
});

test('cries 3 (upper edge of no-pain) -> no significant pain', () => {
  const r = cries({ crying: 1, requiresO2: 1, vitals: 1, expression: 0, sleeplessness: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.band, 'no significant pain');
});

test('cries 4 (lower edge of moderate) -> analgesia indicated', () => {
  const r = cries({ crying: 1, requiresO2: 1, vitals: 1, expression: 1, sleeplessness: 0 });
  assert.equal(r.score, 4);
  assert.equal(r.band, 'moderate pain - analgesia indicated');
});

test('cries 6 (upper edge of moderate) -> analgesia indicated', () => {
  const r = cries({ crying: 2, requiresO2: 1, vitals: 1, expression: 1, sleeplessness: 1 });
  assert.equal(r.score, 6);
  assert.equal(r.band, 'moderate pain - analgesia indicated');
});

test('cries 7 (lower edge of severe) -> severe pain', () => {
  const r = cries({ crying: 2, requiresO2: 2, vitals: 1, expression: 1, sleeplessness: 1 });
  assert.equal(r.score, 7);
  assert.equal(r.band, 'severe pain');
});

test('cries 10 (all 2s) -> severe pain', () => {
  const r = cries({ crying: 2, requiresO2: 2, vitals: 2, expression: 2, sleeplessness: 2 });
  assert.equal(r.score, 10);
  assert.equal(r.band, 'severe pain');
});

test('cries rejects out-of-range items', () => {
  assert.throws(() => cries({ crying: 3, requiresO2: 0, vitals: 0, expression: 0, sleeplessness: 0 }));
  assert.throws(() => cries({ crying: -1, requiresO2: 0, vitals: 0, expression: 0, sleeplessness: 0 }));
  assert.throws(() => cries({ crying: 1.5, requiresO2: 0, vitals: 0, expression: 0, sleeplessness: 0 }));
});
