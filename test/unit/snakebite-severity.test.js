// spec-v111 2.3: Snakebite Severity Score (Dart 1996). Six body-system
// subscores summed to a total of 0-20. A continuous severity index -- Dart 1996
// defines no fixed cutoff; the descriptor is read relative to the 0-20 range.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snakebiteSeverity } from '../../lib/enviro-v111.js';

test('sums the six subscores to a total of 0-20', () => {
  const r = snakebiteSeverity({ pulmonary: 3, cardiovascular: 3, local: 4, gi: 2, hematologic: 1, cns: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 14);
  assert.match(r.band, /SSS 14\/20/);
});

test('band flip: total crossing 14 enters the (relative) severe tier', () => {
  const mid = snakebiteSeverity({ pulmonary: 3, cardiovascular: 3, local: 4, gi: 2, hematologic: 0, cns: 0 }); // 12
  const severe = snakebiteSeverity({ pulmonary: 3, cardiovascular: 3, local: 4, gi: 2, hematologic: 1, cns: 1 }); // 14
  assert.equal(mid.severe, false);
  assert.equal(severe.severe, true);
  assert.match(severe.band, /upper third of the 0-20 range \(severe\)/);
});

test('each subscore clamps to its published maximum (max total 20)', () => {
  // local wound and hematologic cap at 4; the other four cap at 3.
  const r = snakebiteSeverity({ pulmonary: 9, cardiovascular: 9, local: 9, gi: 9, hematologic: 9, cns: 9 });
  assert.equal(r.subs.pulmonary, 3);
  assert.equal(r.subs.local, 4);
  assert.equal(r.subs.hematologic, 4);
  assert.equal(r.total, 20);
});

test('total 0 reports no envenomation findings', () => {
  const r = snakebiteSeverity({ pulmonary: 0, cardiovascular: 0, local: 0, gi: 0, hematologic: 0, cns: 0 });
  assert.equal(r.total, 0);
  assert.match(r.band, /no envenomation findings scored/);
});

test('blank input returns a complete-the-fields fallback', () => {
  assert.equal(snakebiteSeverity({}).valid, false);
});

// --- spec-v1105: an unexamined system is not a system scored 0 ---

test('spec-v1105: a partial score is a floor, and says which systems were not examined', () => {
  const r = snakebiteSeverity({ local: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 2);
  assert.deepEqual(r.unscored, ['pulmonary', 'cardiovascular', 'gi', 'hematologic', 'cns']);
  assert.match(r.band, /a floor, not a severity reading/);
  assert.match(r.band, /scored from 1 of the 6 body systems/);
  assert.match(r.band, /can only raise it/);
  // Rule 11: five system examinations must not be stated as findings of zero.
  assert.match(r.band, /pulmonary not examined/);
  assert.doesNotMatch(r.band, /pulmonary 0/);
  assert.doesNotMatch(r.band, /minimal-mild/);
});

test('spec-v1105: examined-and-normal reads differently from unexamined', () => {
  const examined = snakebiteSeverity({ pulmonary: 0, cardiovascular: 0, local: 2, gi: 0, hematologic: 0, cns: 0 });
  const not = snakebiteSeverity({ local: 2 });
  assert.equal(examined.total, not.total);
  assert.notEqual(examined.band, not.band, 'the two states used to produce the identical sentence');
  assert.match(examined.band, /lower third of the 0-20 range/);
  assert.deepEqual(examined.unscored, []);
});

test('spec-v1105: the severe tier rules in and needs no footing', () => {
  // Rule 13: 14 of 20 is a floor the unexamined systems cannot lower.
  const r = snakebiteSeverity({ pulmonary: 3, cardiovascular: 3, local: 4, gi: 2, hematologic: 1, cns: 1 });
  assert.match(r.band, /upper third of the 0-20 range \(severe\)/);
  assert.doesNotMatch(r.band, /floor/);
});

test('spec-v1105: "no envenomation findings scored" needs all six examined', () => {
  assert.match(
    snakebiteSeverity({ pulmonary: 0, cardiovascular: 0, local: 0, gi: 0, hematologic: 0, cns: 0 }).band,
    /no envenomation findings scored/,
  );
  assert.doesNotMatch(snakebiteSeverity({ pulmonary: 0 }).band, /no envenomation findings scored/);
});
