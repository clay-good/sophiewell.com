import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fourTs } from '../../lib/scoring-v4.js';

test('4Ts 0 of 8 (tile example) -> low band', () => {
  const r = fourTs({ thrombocytopenia: 0, timingOfFall: 0, thrombosis: 0, otherCauses: 0 });
  assert.equal(r.score, 0);
  assert.match(r.band, /low pretest probability of HIT/);
});

test('4Ts 3 of 8 upper edge of low band -> low', () => {
  const r = fourTs({ thrombocytopenia: 1, timingOfFall: 1, thrombosis: 1, otherCauses: 0 });
  assert.equal(r.score, 3);
  assert.match(r.band, /low/);
});

test('4Ts 4 of 8 lower edge of intermediate -> intermediate', () => {
  const r = fourTs({ thrombocytopenia: 2, timingOfFall: 1, thrombosis: 1, otherCauses: 0 });
  assert.equal(r.score, 4);
  assert.match(r.band, /intermediate pretest probability of HIT/);
});

test('4Ts 6 of 8 lower edge of high band -> high', () => {
  const r = fourTs({ thrombocytopenia: 2, timingOfFall: 2, thrombosis: 2, otherCauses: 0 });
  assert.equal(r.score, 6);
  assert.match(r.band, /high pretest probability of HIT/);
});

test('4Ts 8 of 8 (all 2s) -> high band', () => {
  const r = fourTs({ thrombocytopenia: 2, timingOfFall: 2, thrombosis: 2, otherCauses: 2 });
  assert.equal(r.score, 8);
  assert.match(r.band, /high/);
});

test('4Ts clamps per-domain out-of-range to [0, 2]', () => {
  const r = fourTs({ thrombocytopenia: 99, timingOfFall: -1, thrombosis: 2, otherCauses: 2 });
  assert.equal(r.parts.thrombocytopenia, 2);
  assert.equal(r.parts.timingOfFall, 0);
  assert.equal(r.score, 6);
});
