// spec-v550: the Global Limb Anatomic Staging System (GLASS).
//
// The load-bearing tests are the three rules a plausible implementation breaks: the not-applicable corner
// of the matrix, the calcification adjustment happening BEFORE the lookup, and the inframalleolar modifier
// staying out of the matrix entirely.

import test from 'node:test';
import assert from 'node:assert/strict';
import { glassStage, FP_GRADES, IP_GRADES, IM_MODIFIERS, STAGE_MEANINGS } from '../../lib/glass-stage-v550.js';

const base = { fpCalcification: 'no', ipCalcification: 'no', imModifier: 'P0' };
const at = (fp, ip, extra = {}) => glassStage({ ...base, fp: String(fp), ip: String(ip), ...extra });

test('both segments offer grades 0 through 4', () => {
  assert.deepEqual(FP_GRADES.map((g) => g.value), [0, 1, 2, 3, 4]);
  assert.deepEqual(IP_GRADES.map((g) => g.value), [0, 1, 2, 3, 4]);
});

test('the inframalleolar modifier offers exactly P0, P1 and P2', () => {
  assert.deepEqual(IM_MODIFIERS.map((m) => m.value), ['P0', 'P1', 'P2']);
});

// THE corner.
test('FP0 with IP0 is not applicable, and explicitly not stage I', () => {
  const r = at(0, 0);
  assert.equal(r.valid, true);
  assert.equal(r.applicable, false);
  assert.equal(r.stage, null);
  assert.match(r.band, /NOT stage I/);
  assert.doesNotMatch(r.bandLabel, /stage I/);
});

test('every other cell of the matrix returns a stage', () => {
  for (let fp = 0; fp <= 4; fp += 1) {
    for (let ip = 0; ip <= 4; ip += 1) {
      const r = at(fp, ip);
      if (fp === 0 && ip === 0) { assert.equal(r.applicable, false); continue; }
      assert.equal(r.applicable, true, `FP${fp} IP${ip}`);
      assert.ok(['I', 'II', 'III'].includes(r.stage), `FP${fp} IP${ip} gave ${r.stage}`);
    }
  }
});

// The full published matrix, row by row. null is the not-applicable cell.
test('the stage matrix matches the guideline row for row', () => {
  const expected = [
    [null, 'I', 'I', 'II', 'III'],
    ['I', 'I', 'II', 'II', 'III'],
    ['I', 'II', 'II', 'II', 'III'],
    ['II', 'II', 'II', 'III', 'III'],
    ['III', 'III', 'III', 'III', 'III'],
  ];
  for (let fp = 0; fp <= 4; fp += 1) {
    for (let ip = 0; ip <= 4; ip += 1) {
      assert.equal(at(fp, ip).stage, expected[fp][ip], `FP${fp} IP${ip}`);
    }
  }
});

test('FP4 is stage III whatever the infrapopliteal grade', () => {
  for (let ip = 0; ip <= 4; ip += 1) assert.equal(at(4, ip).stage, 'III');
});

test('IP4 is stage III whatever the femoropopliteal grade', () => {
  for (let fp = 0; fp <= 4; fp += 1) assert.equal(at(fp, 4).stage, 'III');
});

// Calcification adjusts the GRADE, before the lookup.
test('severe calcification raises the affected segment grade by one', () => {
  const r = at(1, 1, { fpCalcification: 'yes' });
  assert.equal(r.fpBase, 1);
  assert.equal(r.fp, 2);
  assert.equal(r.ip, 1);
  assert.equal(r.calcificationApplied, true);
});

test('the calcification adjustment happens before the matrix lookup and can change the stage', () => {
  assert.equal(at(2, 2).stage, 'II');
  assert.equal(at(2, 2, { ipCalcification: 'yes' }).stage, 'II');
  assert.equal(at(3, 2, { ipCalcification: 'yes' }).stage, 'III');
});

test('calcification on both segments adjusts both', () => {
  const r = at(1, 1, { fpCalcification: 'yes', ipCalcification: 'yes' });
  assert.equal(r.fp, 2);
  assert.equal(r.ip, 2);
});

test('an adjusted grade caps at 4 rather than running to 5', () => {
  const r = at(4, 4, { fpCalcification: 'yes', ipCalcification: 'yes' });
  assert.equal(r.fp, 4);
  assert.equal(r.ip, 4);
  assert.equal(r.stage, 'III');
});

test('no calcification reports no adjustment and does not mention the rule', () => {
  const r = at(2, 2);
  assert.equal(r.calcificationApplied, false);
  assert.match(r.band, /no calcification adjustment/);
});

// The modifier stays outside the matrix.
test('the inframalleolar modifier never changes the stage', () => {
  for (const imModifier of ['P0', 'P1', 'P2']) {
    assert.equal(at(2, 2, { imModifier }).stage, 'II');
  }
});

test('the modifier is appended to the stage label', () => {
  assert.equal(at(3, 3, { imModifier: 'P1' }).bandLabel, 'GLASS stage III, P1');
  assert.match(at(2, 2, { imModifier: 'P2' }).band, /not considered in the primary stage assignment/);
});

test('the modifier is reported even when the stage is not applicable', () => {
  const r = at(0, 0, { imModifier: 'P2' });
  assert.equal(r.imModifier, 'P2');
  assert.match(r.band, /P2/);
});

test('each stage carries the guideline estimates', () => {
  assert.match(STAGE_MEANINGS.I, /over 70 percent/);
  assert.match(STAGE_MEANINGS.II, /50 to 70 percent/);
  assert.match(STAGE_MEANINGS.III, /under 50 percent/);
  assert.equal(at(1, 1).stageMeaning, STAGE_MEANINGS.I);
});

// Input handling.
test('missing grades are refused', () => {
  assert.equal(glassStage({}).valid, false);
  assert.equal(glassStage({ ...base, fp: '2' }).valid, false);
});

test('out-of-range or non-integer grades are refused', () => {
  assert.equal(glassStage({ ...base, fp: '5', ip: '2' }).valid, false);
  assert.equal(glassStage({ ...base, fp: '-1', ip: '2' }).valid, false);
  assert.equal(glassStage({ ...base, fp: '2.5', ip: '2' }).valid, false);
});

test('a missing calcification answer is refused', () => {
  const r = glassStage({ fp: '2', ip: '2', imModifier: 'P0' });
  assert.equal(r.valid, false);
  assert.match(r.message, /severe calcification/);
});

test('a missing or unknown inframalleolar modifier is refused', () => {
  assert.equal(glassStage({ fp: '2', ip: '2', fpCalcification: 'no', ipCalcification: 'no' }).valid, false);
  assert.equal(glassStage({ ...base, fp: '2', ip: '2', imModifier: 'P3' }).valid, false);
});

test('the scope note is on every result, applicable or not', () => {
  for (const r of [at(0, 0), at(2, 2)]) {
    assert.match(r.note, /does not diagnose chronic limb-threatening ischemia/);
    assert.match(r.note, /companion/);
  }
});
