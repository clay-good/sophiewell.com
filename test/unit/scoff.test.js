// spec-v123 2.4: SCOFF (Morgan 1999, free to use). Five yes/no items; >= 2
// positive flags a likely eating disorder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoff } from '../../lib/psych-v123.js';

test('no items -> 0/5, below threshold', () => {
  const r = scoff({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
});

test('one positive -> below the 2-positive threshold', () => {
  const r = scoff({ sick: true });
  assert.equal(r.total, 1);
  assert.equal(r.abnormal, false);
});

test('two positives -> band-flip to positive screen', () => {
  const r = scoff({ sick: true, control: true });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /likely eating disorder/);
});

test('all five positive -> 5/5', () => {
  const r = scoff({ sick: true, control: true, oneStone: true, fat: true, food: true });
  assert.equal(r.total, 5);
  assert.equal(r.abnormal, true);
});

test('scalar / non-object fuzz arg yields a valid 0/5, never NaN', () => {
  const r = scoff(9);
  assert.equal(r.valid, true);
  assert.equal(Number.isFinite(r.total), true);
});
