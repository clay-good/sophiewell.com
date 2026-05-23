import { test } from 'node:test';
import assert from 'node:assert/strict';
import { katzAdl } from '../../lib/scoring-v4.js';

const all = (v) => ({
  bathing: v, dressing: v, toileting: v,
  transferring: v, continence: v, feeding: v,
});

test('katzAdl 6 (tile example, all independent) -> full independence', () => {
  const r = katzAdl(all(1));
  assert.equal(r.score, 6);
  assert.equal(r.band, 'full independence');
  for (const k of Object.keys(r.parts)) assert.equal(r.parts[k], 1);
});

test('katzAdl 5 (mild) -> mild impairment', () => {
  const r = katzAdl({ ...all(1), bathing: 0 });
  assert.equal(r.score, 5);
  assert.equal(r.band, 'mild impairment');
});

test('katzAdl 4 (upper edge of moderate) -> moderate impairment', () => {
  const r = katzAdl({ ...all(1), bathing: 0, dressing: 0 });
  assert.equal(r.score, 4);
  assert.equal(r.band, 'moderate impairment');
});

test('katzAdl 3 (lower edge of moderate) -> moderate impairment', () => {
  const r = katzAdl({ ...all(1), bathing: 0, dressing: 0, toileting: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.band, 'moderate impairment');
});

test('katzAdl 2 (upper edge of severe) -> severe functional impairment', () => {
  const r = katzAdl({ ...all(0), continence: 1, feeding: 1 });
  assert.equal(r.score, 2);
  assert.equal(r.band, 'severe functional impairment');
});

test('katzAdl 0 (all dependent) -> severe functional impairment', () => {
  const r = katzAdl(all(0));
  assert.equal(r.score, 0);
  assert.equal(r.band, 'severe functional impairment');
});

test('katzAdl text mentions Katz 1963', () => {
  assert.match(katzAdl(all(1)).text, /Katz 1963/);
  assert.match(katzAdl(all(0)).text, /Katz 1963/);
});

test('katzAdl rejects non-binary, non-integer, and missing inputs', () => {
  assert.throws(() => katzAdl({ ...all(1), bathing: 2 }));
  assert.throws(() => katzAdl({ ...all(1), bathing: -1 }));
  assert.throws(() => katzAdl({ ...all(1), bathing: 0.5 }));
  assert.throws(() => katzAdl({ ...all(1), bathing: NaN }));
  assert.throws(() => katzAdl({ bathing: 1, dressing: 1, toileting: 1 }));
});
