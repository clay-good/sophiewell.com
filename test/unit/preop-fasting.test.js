import test from 'node:test';
import assert from 'node:assert/strict';
import { preopFasting as f, INTAKES } from '../../lib/preop-fasting-v897.js';

test('preop-fasting: the published table', () => {
  assert.deepEqual(INTAKES.map((i) => [i.value, i.hours]), [
    ['clear-liquid', 2],
    ['breast-milk', 4],
    ['formula', 6],
    ['light-meal', 6],
    ['heavy-meal', 8],
  ]);
});

test('preop-fasting: each row is compared against its own minimum', () => {
  for (const row of INTAKES) {
    assert.equal(f({ lastIntake: row.value, hoursSinceIntake: row.hours }).met, true, row.value);
    assert.equal(f({ lastIntake: row.value, hoursSinceIntake: row.hours - 0.5 }).met, false, row.value);
  }
  // The same three hours meets the clear-liquid minimum and misses the meal one.
  assert.equal(f({ lastIntake: 'clear-liquid', hoursSinceIntake: 3 }).met, true);
  assert.equal(f({ lastIntake: 'heavy-meal', hoursSinceIntake: 3 }).met, false);
});

test('preop-fasting: the shortfall and overshoot are computed and read as hours', () => {
  assert.equal(f({ lastIntake: 'heavy-meal', hoursSinceIntake: 7 }).shortBy, 1);
  assert.match(f({ lastIntake: 'heavy-meal', hoursSinceIntake: 7 }).band, /Short by 1 hour\./);
  assert.equal(f({ lastIntake: 'clear-liquid', hoursSinceIntake: 3 }).overBy, 1);
  assert.match(f({ lastIntake: 'clear-liquid', hoursSinceIntake: 3 }).band, /met, by 1 hour\./);
  assert.match(f({ lastIntake: 'clear-liquid', hoursSinceIntake: 4 }).band, /by 2 hours\./);
});

test('preop-fasting: a long overshoot is named as a harm, not a margin', () => {
  // The reason the tile exists, in its sharpest form.
  const long = f({ lastIntake: 'clear-liquid', hoursSinceIntake: 14 });
  assert.equal(long.met, true);
  assert.match(long.overshootNote, /a long fast, not a safer one/);
  assert.match(long.overshootNote, /clear liquids up to two hours before induction/);
  // Just over the line is not an overshoot worth naming.
  assert.equal(f({ lastIntake: 'clear-liquid', hoursSinceIntake: 5 }).overshootNote, null);
  assert.equal(f({ lastIntake: 'clear-liquid', hoursSinceIntake: 6 }).overshootNote !== null, true);
});

test('preop-fasting: minimums-not-targets and the induction clock print on every result', () => {
  for (const input of [{ lastIntake: 'clear-liquid' }, { lastIntake: 'heavy-meal', hoursSinceIntake: 2 }]) {
    assert.match(f(input).minimumNote, /minimum intervals, not targets/);
    assert.match(f(input).minimumNote, /Nothing by mouth after midnight/);
    assert.match(f(input).clockNote, /runs to the moment of induction/);
    assert.match(f(input).scopeOfTableNote, /never guarantees an empty stomach/);
  }
});

test('preop-fasting: the definition of clear is given where it is disputed', () => {
  assert.match(f({ lastIntake: 'clear-liquid', hoursSinceIntake: 3 }).clearNote, /Anything with milk in it does not/);
  assert.equal(f({ lastIntake: 'light-meal', hoursSinceIntake: 7 }).clearNote, null);
});

test('preop-fasting: with no elapsed time it states the minimum and asks for one', () => {
  const r = f({ lastIntake: 'formula' });
  assert.equal(r.hoursSinceIntake, null);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /minimum of 6 hours/);
  assert.match(r.band, /Enter the hours elapsed/);
});

test('preop-fasting: an unknown intake is unstated, not clear liquids, and the range is checked', () => {
  // This asserted `lastIntake === 'clear-liquid'` for an unrecognised value --
  // the shortest interval in an aspiration-risk table, written down as the
  // expected result. Robustness is kept: nothing throws. spec-v1138.
  assert.equal(f({ lastIntake: 'made-up' }).lastIntake, null);
  assert.equal(f({ lastIntake: 'made-up' }).intakeStated, false);
  assert.equal(f({ hoursSinceIntake: -1 }).valid, false);
  assert.equal(f({ hoursSinceIntake: 73 }).valid, false);
});

test('preop-fasting: the documented example', () => {
  const r = f({ lastIntake: 'clear-liquid', hoursSinceIntake: '3' });
  assert.equal(r.met, true);
  assert.equal(r.requiredHours, 2);
});

test('spec-v1138: an unstated intake is not clear liquids', () => {
  // The fallback was the SHORTEST interval in the table, so a form that did not
  // say what was last taken read "3 hours since clear liquids, against a minimum
  // of 2. The interval is met." The same three hours is short by one after breast
  // milk and by five after a fatty meal.
  const r = f({ hoursSinceIntake: 3 });
  assert.equal(r.valid, false);
  assert.match(r.message, /Say what was last taken/);
  assert.match(r.message, /met for clear liquids/);
  assert.match(r.message, /not yet for breast milk/);

  // Stated, the readings are what they always were.
  assert.equal(f({ lastIntake: 'clear-liquid', hoursSinceIntake: 3 }).met, true);
  assert.equal(f({ lastIntake: 'breast-milk', hoursSinceIntake: 3 }).met, false);
});

test('spec-v1138: past the longest interval, and short of the shortest, it answers', () => {
  // Rule 25: the intake only decides between two hours and eight.
  const past = f({ hoursSinceIntake: 9 });
  assert.equal(past.valid, true);
  assert.equal(past.intakeStated, false);
  assert.equal(past.lastIntake, null);
  assert.match(past.band, /every interval in the table is met, whatever was last taken/);
  assert.equal(past.bandLabel, 'Every interval met');

  const under = f({ hoursSinceIntake: 1 });
  assert.equal(under.valid, true);
  assert.match(under.band, /no interval in the table is met, whatever was last taken/);
  assert.equal(under.bandLabel, 'No interval met');

  // And with nothing at all, the label does not name the clear-liquid minimum.
  assert.equal(f({}).bandLabel, 'What was last taken?');
});
