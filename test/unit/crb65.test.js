import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crb65 } from '../../lib/scoring-v4.js';

test('crb65 0 -> ~1.2% mortality band', () => {
  const r = crb65({ confusion: false, rrGe30: false, sbpLt90OrDbpLe60: false, ageGe65: false });
  assert.equal(r.score, 0);
  assert.match(r.band, /1\.2%/);
});

test('crb65 2 -> ~8.2% mortality band', () => {
  const r = crb65({ confusion: true, rrGe30: false, sbpLt90OrDbpLe60: false, ageGe65: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /8\.2%/);
});

test('crb65 3 -> ~31.4% mortality band', () => {
  const r = crb65({ confusion: true, rrGe30: true, sbpLt90OrDbpLe60: false, ageGe65: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /31\.4%/);
});

test('crb65 4 (maximum) -> high band', () => {
  const r = crb65({ confusion: true, rrGe30: true, sbpLt90OrDbpLe60: true, ageGe65: true });
  assert.equal(r.score, 4);
});
