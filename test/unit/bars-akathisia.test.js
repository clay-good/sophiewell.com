// spec-v123 2.3: Barnes Akathisia Rating Scale (Barnes 1989). Objective +
// subjective awareness + subjective distress each 0-3 (sum 0-9); global 0-5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barsAkathisia } from '../../lib/psych-v123.js';

test('all absent -> global 0, not flagged', () => {
  const r = barsAkathisia({});
  assert.equal(r.valid, true);
  assert.equal(r.global, 0);
  assert.equal(r.subtotal, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /absent/);
});

test('global 1 (questionable) is below the mild flag', () => {
  const r = barsAkathisia({ global: '1' });
  assert.equal(r.global, 1);
  assert.equal(r.abnormal, false);
});

test('global rating step: moderate akathisia with subtotal', () => {
  const r = barsAkathisia({ objective: '2', awareness: '2', distress: '1', global: '3' });
  assert.equal(r.subtotal, 5);
  assert.equal(r.global, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /moderate akathisia/);
});

test('global 5 -> severe akathisia', () => {
  assert.match(barsAkathisia({ global: '5' }).band, /severe akathisia/);
});

test('subtotal caps at 9', () => {
  assert.equal(barsAkathisia({ objective: '3', awareness: '3', distress: '3' }).subtotal, 9);
});

test('scalar / non-object fuzz arg yields valid 0s, never NaN', () => {
  const r = barsAkathisia(9);
  assert.equal(r.valid, true);
  assert.equal(Number.isFinite(r.global), true);
  assert.equal(Number.isFinite(r.subtotal), true);
});
