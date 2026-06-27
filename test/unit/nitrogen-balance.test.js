// spec-v161 2.4: Nitrogen balance (ASPEN). N balance = (protein/6.25) -
// (UUN + insensible); insensible defaults to 4 g/day.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nitrogenBalance } from '../../lib/endo-metab-v161.js';

test('tile example: positive (anabolic) balance', () => {
  // 100/6.25 = 16 ; - (8 + 4) = 16 - 12 = +4
  const r = nitrogenBalance({ protein: 100, uun: 8 });
  assert.equal(r.valid, true);
  assert.equal(r.balance, 4);
  assert.equal(r.intakeN, 16);
  assert.equal(r.abnormal, false);
});

test('negative (catabolic) balance', () => {
  // 50/6.25 = 8 ; - (12 + 4) = 8 - 16 = -8
  const r = nitrogenBalance({ protein: 50, uun: 12 });
  assert.equal(r.balance, -8);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /catabolic/);
});

test('the 6.25 protein-to-nitrogen factor and adjustable insensible loss', () => {
  // 6.25 g protein = exactly 1 g nitrogen
  assert.equal(nitrogenBalance({ protein: 6.25, uun: 0, insensible: 0 }).balance, 1);
  // insensible default 4 vs an override of 2
  assert.equal(nitrogenBalance({ protein: 62.5, uun: 6 }).balance, 0); // 10 - (6+4)
  assert.equal(nitrogenBalance({ protein: 62.5, uun: 6, insensible: 2 }).balance, 2); // 10 - (6+2)
});

test('blanks fall back', () => {
  assert.equal(nitrogenBalance({ protein: 100 }).valid, false);
  assert.equal(nitrogenBalance({ uun: 8 }).valid, false);
  assert.equal(nitrogenBalance({}).valid, false);
});
