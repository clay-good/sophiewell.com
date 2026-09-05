import { test } from 'node:test';
import assert from 'node:assert/strict';
import { katzAdl } from '../../lib/scoring-v4.js';

const all = (v) => ({
  bathing: v, dressing: v, toileting: v,
  transferring: v, continence: v, feeding: v,
});

test('katzAdl 6 (tile example, all independent) -> full independence', () => {
  const r = katzAdl(all(1));
  assert.equal(r.score, 6);
  assert.equal(r.band, 'full independence');
  for (const k of Object.keys(r.parts)) assert.equal(r.parts[k], 1);
});

test('katzAdl 5 (mild) -> mild impairment', () => {
  const r = katzAdl({ ...all(1), bathing: 0 });
  assert.equal(r.score, 5);
  assert.equal(r.band, 'mild impairment');
});

test('katzAdl 4 (upper edge of moderate) -> moderate impairment', () => {
  const r = katzAdl({ ...all(1), bathing: 0, dressing: 0 });
  assert.equal(r.score, 4);
  assert.equal(r.band, 'moderate impairment');
});

test('katzAdl 3 (lower edge of moderate) -> moderate impairment', () => {
  const r = katzAdl({ ...all(1), bathing: 0, dressing: 0, toileting: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.band, 'moderate impairment');
});

test('katzAdl 2 (upper edge of severe) -> severe functional impairment', () => {
  const r = katzAdl({ ...all(0), continence: 1, feeding: 1 });
  assert.equal(r.score, 2);
  assert.equal(r.band, 'severe functional impairment');
});

test('katzAdl 0 (all dependent) -> severe functional impairment', () => {
  const r = katzAdl(all(0));
  assert.equal(r.score, 0);
  assert.equal(r.band, 'severe functional impairment');
});

test('katzAdl text mentions Katz 1963', () => {
  assert.match(katzAdl(all(1)).text, /Katz 1963/);
  assert.match(katzAdl(all(0)).text, /Katz 1963/);
});

test('katzAdl rejects a value that is not 0 or 1', () => {
  assert.throws(() => katzAdl({ ...all(1), bathing: 2 }));
  assert.throws(() => katzAdl({ ...all(1), bathing: -1 }));
  assert.throws(() => katzAdl({ ...all(1), bathing: 0.5 }));
  assert.throws(() => katzAdl({ ...all(1), bathing: NaN }));
});

// spec-v1081: a MISSING item used to be in the list above, and throwing was the
// wrong shape for it. An item nobody rated is an ordinary state of a form being
// filled in, not a programming error, and spec-v1015 is the whole spec about
// refusals arriving in the words of a stack trace. It now returns a refusal the
// tile can render and an agent gets as INCOMPLETE. A value that is present and
// impossible still throws, because that IS a caller error.
test('katzAdl returns a refusal, not a throw, for an item nobody rated', () => {
  const r = katzAdl({ bathing: 1, dressing: 1, toileting: 1 });
  assert.equal(r.valid, false);
  assert.equal(r.itemsScored, 3);
  assert.deepEqual(r.unrated, ['transferring', 'continence', 'feeding']);
});

// spec-v1081: an unrated activity is not a dependency, and it is not independence.
//
// The index counts the activities the patient manages ALONE, so a sum over some
// of them understates independence and reads as more impairment than they have
// -- an alarm from nothing (spec-v1036). The tile rendered six sliders parked at
// 1, which reads as the opposite: "Katz ADL 6 of 6: full independence" for
// somebody nobody had assessed. Neither reading is earned, so it asks.
test('spec-v1081: an unrated activity is asked for, not scored either way', () => {
  const all = {
    bathing: 1, dressing: 1, toileting: 1, transferring: 1, continence: 0, feeding: 1,
  };
  const full = katzAdl(all);
  assert.equal(full.valid, true);
  assert.equal(full.score, 5);
  assert.deepEqual(full.unrated, []);

  const none = katzAdl({});
  assert.equal(none.valid, false);
  assert.equal(none.score, null, 'a score from nothing is the defect');
  assert.equal(none.band, null);
  assert.equal(none.unrated.length, 6);
  assert.doesNotMatch(none.text, /full independence/);

  const { feeding, ...five } = all;
  void feeding;
  const partial = katzAdl(five);
  assert.equal(partial.valid, false);
  assert.equal(partial.itemsScored, 5);
  assert.deepEqual(partial.unrated, ['feeding']);
  assert.match(partial.text, /feeding/);
});
