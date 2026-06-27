// spec-v167 2.2: cerebroplacental ratio. CPR < 1 flags cerebral redistribution;
// the UA-PI denominator is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cerebroplacentalRatio } from '../../lib/oneformula-v167.js';

test('tile example: MCA-PI 1.2 / UA-PI 1.5 → CPR 0.8, redistribution flag', () => {
  const r = cerebroplacentalRatio({ mca: 1.2, ua: 1.5 });
  assert.equal(r.valid, true);
  assert.equal(r.cpr, 0.8);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /redistribution/);
});

test('CPR ≥ 1 is normal', () => {
  const r = cerebroplacentalRatio({ mca: 1.8, ua: 1.0 });
  assert.equal(r.cpr, 1.8);
  assert.equal(r.abnormal, false);
});

test('CPR exactly 1 is not flagged (< 1 is the cutoff)', () => {
  const r = cerebroplacentalRatio({ mca: 1.4, ua: 1.4 });
  assert.equal(r.cpr, 1);
  assert.equal(r.abnormal, false);
});

test('guards: blank inputs, zero UA-PI', () => {
  assert.equal(cerebroplacentalRatio({ mca: 1.2 }).valid, false);
  assert.equal(cerebroplacentalRatio({ mca: 1.2, ua: 0 }).valid, false);
  assert.equal(cerebroplacentalRatio({}).valid, false);
});
