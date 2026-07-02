// spec-v203 2.5: Duke Activity Status Index worked examples. 12 weighted yes/no
// items (sum max 58.2); peak VO2 = 0.43*DASI + 9.6, METs = VO2/3.5. Weights
// spec-v97 cross-verified against MDCalc and clinical references.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dasi } from '../../lib/periop-frailty-v203.js';

test('mixed activities -> DASI 28.7 with peak-VO2/METs derivation (worked example)', () => {
  const r = dasi({ selfCare: true, walkIndoors: true, walkBlocks: true, stairs: true, lightWork: true, moderateWork: true, yardWork: true, sexual: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 28.7);
  assert.equal(r.vo2, 21.9);   // 0.43*28.7 + 9.6
  assert.equal(r.mets, 6.3);   // 21.9 / 3.5
  assert.equal(r.abnormal, false);
});

test('all activities -> published maximum 58.2', () => {
  const all = {};
  for (const k of ['selfCare', 'walkIndoors', 'walkBlocks', 'stairs', 'run', 'lightWork', 'moderateWork', 'heavyWork', 'yardWork', 'sexual', 'moderateRec', 'strenuous']) all[k] = true;
  const r = dasi(all);
  assert.equal(r.score, 58.2);
  assert.equal(r.vo2, 34.6);
  assert.equal(r.mets, 9.9);
});

test('no activities -> DASI 0, baseline VO2 9.6 (~2.7 METs), below threshold', () => {
  const r = dasi({});
  assert.equal(r.score, 0);
  assert.equal(r.vo2, 9.6);
  assert.equal(r.mets, 2.7);
  assert.equal(r.abnormal, true);
});

test('peak VO2 and METs follow the published regression', () => {
  const r = dasi({ selfCare: true, walkIndoors: true });
  const expectedVo2 = Math.round((0.43 * r.score + 9.6) * 10) / 10;
  assert.equal(r.vo2, expectedVo2);
  assert.equal(r.mets, Math.round((expectedVo2 / 3.5) * 10) / 10);
});

test('checkbox string "1" is treated as affirmative', () => {
  const r = dasi({ selfCare: '1', stairs: '1' });
  assert.equal(r.score, 8.25); // 2.75 + 5.5
});
