// spec-v386: Pirani clubfoot severity score (six signs, each 0/0.5/1; midfoot + hindfoot, total 0-6).
// Worked-example tests: the total and subscores, the 0.5 increments, the all-zero and all-severe
// extremes, and the guards (missing / out-of-set value). Items transcribed from the Pirani system (Dyer
// 2006, JBJS Br) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { piraniClubfoot } from '../../lib/pirani-clubfoot-v386.js';

test('worked example: total 5.5, midfoot 2.5, hindfoot 3 (the META example)', () => {
  const r = piraniClubfoot({ clb: '1', mc: '1', lht: '0.5', pc: '1', eh: '1', re: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 5.5);
  assert.equal(r.midfootScore, 2.5);
  assert.equal(r.hindfootScore, 3);
  assert.match(r.band, /5\.5 of 6/);
  assert.match(r.band, /midfoot 2\.5 of 3/);
});

test('all-zero is a total of 0', () => {
  const r = piraniClubfoot({ clb: '0', mc: '0', lht: '0', pc: '0', eh: '0', re: '0' });
  assert.equal(r.total, 0);
  assert.equal(r.midfootScore, 0);
  assert.equal(r.hindfootScore, 0);
});

test('all-severe is a total of 6', () => {
  const r = piraniClubfoot({ clb: '1', mc: '1', lht: '1', pc: '1', eh: '1', re: '1' });
  assert.equal(r.total, 6);
  assert.equal(r.midfootScore, 3);
  assert.equal(r.hindfootScore, 3);
});

test('0.5 increments sum correctly', () => {
  const r = piraniClubfoot({ clb: '0.5', mc: '0.5', lht: '0.5', pc: '0.5', eh: '0', re: '0' });
  assert.equal(r.midfootScore, 1.5);
  assert.equal(r.hindfootScore, 0.5);
  assert.equal(r.total, 2);
});

test('a missing sign is invalid', () => {
  assert.equal(piraniClubfoot({ clb: '1', mc: '1', lht: '1', pc: '1', eh: '1' }).valid, false);
  assert.equal(piraniClubfoot({}).valid, false);
});

test('an out-of-set value is invalid', () => {
  assert.equal(piraniClubfoot({ clb: '2', mc: '0', lht: '0', pc: '0', eh: '0', re: '0' }).valid, false);
  assert.equal(piraniClubfoot({ clb: '0.75', mc: '0', lht: '0', pc: '0', eh: '0', re: '0' }).valid, false);
});
