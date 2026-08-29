import test from 'node:test';
import assert from 'node:assert/strict';
import { whoHearingGrade as who } from '../../lib/who-hearing-grade-v858.js';

const ear = (side, v) => ({ [`${side}500`]: v, [`${side}1000`]: v, [`${side}2000`]: v, [`${side}4000`]: v });
const both = (r, l) => ({ ...ear('right', r), ...ear('left', l) });

test('who: the seven grades, read from the better ear', () => {
  assert.equal(who(both(10, 10)).grade, 0);
  assert.equal(who(both(19, 19)).grade, 0);
  assert.equal(who(both(20, 20)).grade, 1);
  assert.equal(who(both(34, 34)).grade, 1);
  assert.equal(who(both(35, 35)).grade, 2);
  assert.equal(who(both(50, 50)).grade, 3);
  assert.equal(who(both(65, 65)).grade, 4);
  assert.equal(who(both(80, 80)).grade, 5);
  assert.equal(who(both(94, 94)).grade, 5);
  assert.equal(who(both(95, 95)).grade, 6);
  assert.equal(who(both(120, 120)).grade, 6);
});

test('who: one deaf ear is its own category, not grade 5', () => {
  // The error the tile exists to prevent.
  const r = who(both(10, 90));
  assert.equal(r.unilateral, true);
  assert.equal(r.grade, null);
  assert.equal(r.abnormal, true);
  assert.ok(r.unilateralNote.includes('describes the hearing but not the disability'));
  assert.ok(r.unilateralNote.includes('neither'));
  // The boundaries of the category.
  assert.equal(who(both(10, 35)).unilateral, true);
  assert.equal(who(both(10, 34)).unilateral, false, 'worse ear below 35 is not the category');
  assert.equal(who(both(10, 34)).grade, 0);
  assert.equal(who(both(20, 90)).unilateral, false, 'a better ear at 20 is not under 20');
  assert.equal(who(both(20, 90)).grade, 1);
});

test('who: the worse ear never sets the grade, and the tile says what it would have', () => {
  const r = who(both(40, 60));
  assert.equal(r.betterEarPta, 40);
  assert.equal(r.worseEarPta, 60);
  assert.equal(r.grade, 2);
  assert.ok(r.betterEarNote.includes('only the better ear'));
  assert.ok(r.betterEarNote.includes('grade 3'));
  // Symmetric hearing has nothing to warn about.
  assert.equal(who(both(40, 40)).betterEarNote, null);
});

test('who: mild starts at 20, and the 20 to 25 band is called out', () => {
  const r = who(both(22, 30));
  assert.equal(r.grade, 1);
  assert.ok(r.oldThresholdNote.includes('started at 26'));
  assert.equal(who(both(26, 30)).oldThresholdNote, null);
  assert.equal(who(both(19, 30)).oldThresholdNote, null);
});

test('who: the average is over four frequencies and the tile computes it', () => {
  const r = who({ right500: 10, right1000: 20, right2000: 30, right4000: 40, ...ear('left', 40) });
  assert.equal(r.rightPta, 25);
  assert.equal(r.betterEarPta, 25);
  assert.ok(r.frequencyNote.includes('4 kHz'));
  // A directly supplied average wins over the four thresholds and raises no computation note.
  const direct = who({ rightPta: 10, leftPta: 10 });
  assert.equal(direct.rightPta, 10);
  assert.equal(direct.frequencyNote, null);
  assert.equal(who({ rightPta: 5, ...ear('right', 90), leftPta: 5 }).rightPta, 5);
  // An incomplete set for an ear leaves that ear unavailable.
  assert.equal(who({ right500: 10, right1000: 20, ...ear('left', 40) }).rightPta, null);
});

test('who: one ear alone still grades, and says it is not enough', () => {
  const r = who(ear('right', 60));
  assert.equal(r.oneEarOnly, true);
  assert.equal(r.grade, 3);
  assert.equal(r.unilateral, false);
  assert.ok(r.singleEarNote.includes('enter the other ear'));
  assert.equal(who(both(60, 60)).singleEarNote, null);
});

test('who: the scope is stated every time', () => {
  assert.ok(who(both(10, 10)).scopeNote.includes('conductive from sensorineural'));
});

test('who: validation', () => {
  assert.equal(who({}).valid, false);
  assert.equal(who(null).valid, false);
  assert.equal(who({ ...ear('right', 200), ...ear('left', 10) }).valid, false);
  assert.equal(who({ rightPta: -50, leftPta: 10 }).valid, false);
  assert.equal(who({ right500: 10, right1000: 10 }).valid, false, 'a partial ear and nothing else is not enough');
});

test('who: the documented example round-trips', () => {
  const r = who({ rightPta: '10', leftPta: '90' });
  assert.equal(r.valid, true);
  assert.equal(r.unilateral, true);
  assert.ok(r.band.includes('one ear'));
});
