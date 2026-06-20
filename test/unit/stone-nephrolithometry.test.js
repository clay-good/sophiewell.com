// spec-v131 2.4: S.T.O.N.E. nephrolithometry (Okhunov 2013, Urology 81:1154),
// original PCNL area version. Size (area mm^2: 0-399=1, 400-799=2, 800-1599=3,
// >=1600=4) + tract (<=100=1, >100=2) + obstruction (1-2) + calices (1-2=1,
// 3=2, staghorn=3) + essence (<=950 HU=1, >950=2) -> total 5-13. Higher =
// lower stone-free likelihood. Tiers low 5-6 / moderate 7-8 / high >=9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stoneNephrolithometry } from '../../lib/uro-v131.js';

test('a worked total: 20x20 mm stone -> area 400 (2), low complexity', () => {
  const r = stoneNephrolithometry({ length: 20, width: 20, tract: 80, obstruction: 1, calices: 1, hu: 800 });
  assert.equal(r.area, 400);
  assert.equal(r.parts.size, 2);
  assert.equal(r.total, 6); // 2 + 1 + 1 + 1 + 1
  assert.equal(r.complexity, 'low');
  assert.equal(r.abnormal, false);
});

test('the minimum is 5 and the size-area bands step at 400 / 800 / 1600 mm^2', () => {
  const min = stoneNephrolithometry({ length: 10, width: 10, tract: 50, obstruction: 1, calices: 1, hu: 500 });
  assert.equal(min.area, 100);
  assert.equal(min.total, 5); // 1 + 1 + 1 + 1 + 1
  assert.equal(stoneNephrolithometry({ length: 20, width: 20, tract: 50, obstruction: 1, calices: 1, hu: 500 }).parts.size, 2); // 400
  assert.equal(stoneNephrolithometry({ length: 40, width: 20, tract: 50, obstruction: 1, calices: 1, hu: 500 }).parts.size, 3); // 800
  assert.equal(stoneNephrolithometry({ length: 40, width: 40, tract: 50, obstruction: 1, calices: 1, hu: 500 }).parts.size, 4); // 1600
});

test('a high-complexity staghorn case reaches the maximum 13', () => {
  const r = stoneNephrolithometry({ length: 50, width: 40, tract: 120, obstruction: 2, calices: 3, hu: 1100 });
  assert.equal(r.total, 13); // 4 + 2 + 2 + 3 + 2
  assert.equal(r.complexity, 'high');
  assert.equal(r.abnormal, true);
});

test('a blank measurement or an out-of-range component surfaces valid:false', () => {
  assert.equal(stoneNephrolithometry({ length: 20, width: 20, tract: 80, obstruction: 1, calices: 1 }).valid, false); // no HU
  assert.equal(stoneNephrolithometry({ length: 0, width: 20, tract: 80, obstruction: 1, calices: 1, hu: 800 }).valid, false);
  assert.equal(stoneNephrolithometry({ length: 20, width: 20, tract: 80, obstruction: 3, calices: 1, hu: 800 }).valid, false); // obstruction 1-2
  assert.equal(stoneNephrolithometry(6).valid, false);
});
