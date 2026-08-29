import test from 'node:test';
import assert from 'node:assert/strict';
import { gastricEmptyingScintigraphy as ges } from '../../lib/gastric-emptying-scintigraphy-v854.js';

test('ges: the grade comes from the 4-hour value', () => {
  assert.equal(ges({ retention4h: 10 }).grade, 0);
  assert.equal(ges({ retention4h: 11 }).grade, 1);
  assert.equal(ges({ retention4h: 20 }).grade, 1);
  assert.equal(ges({ retention4h: 21 }).grade, 2);
  assert.equal(ges({ retention4h: 35 }).grade, 2);
  assert.equal(ges({ retention4h: 36 }).grade, 3);
  assert.equal(ges({ retention4h: 50 }).grade, 3);
  assert.equal(ges({ retention4h: 51 }).grade, 4);
  assert.equal(ges({ retention4h: 100 }).grade, 4);
});

test('ges: a 2-hour study is not this test', () => {
  // The error the tile exists to prevent.
  const r = ges({ retention2h: 45 });
  assert.equal(r.gradeable, false);
  assert.equal(r.grade, null);
  assert.ok(r.incompleteNote.includes('does NOT exclude delayed emptying'));
  assert.ok(r.incompleteNote.includes('cannot be graded'));
  // A delayed 2-hour value is still ungraded.
  assert.equal(ges({ retention2h: 70 }).delayedAt2, true);
  assert.equal(ges({ retention2h: 70 }).gradeable, false);
  assert.ok(ges({ retention2h: 70 }).incompleteNote.includes('cannot be graded'));
  // With a 4-hour value there is nothing incomplete to say.
  assert.equal(ges({ retention2h: 45, retention4h: 5 }).incompleteNote, null);
});

test('ges: when the two time points disagree the 4-hour one decides, and it is said', () => {
  const r = ges({ retention2h: 45, retention4h: 18 });
  assert.equal(r.delayed, true);
  assert.equal(r.grade, 1);
  assert.ok(r.disagreeNote.includes('Stopping this study at 2 hours would have called it normal'));
  // Agreement raises nothing.
  assert.equal(ges({ retention2h: 70, retention4h: 40 }).disagreeNote, null);
  assert.equal(ges({ retention2h: 45, retention4h: 5 }).disagreeNote, null);
});

test('ges: rapid emptying is a finding, not the absence of one', () => {
  const r = ges({ retention1h: 20, retention4h: 5 });
  assert.equal(r.rapid, true);
  assert.equal(r.delayed, false);
  assert.equal(r.abnormal, true);
  assert.ok(r.rapidNote.includes('rather than the absence'));
  assert.ok(r.state.includes('rapid'));
  assert.equal(ges({ retention1h: 30 }).rapid, false);
  assert.equal(ges({ retention1h: 90, retention4h: 5 }).rapidNote, null);
});

test('ges: a hyperglycemic study measured the glucose', () => {
  const delayed = ges({ retention4h: 60, glucose: 300 });
  assert.ok(delayed.glucoseNote.includes('may be the glucose rather than the stomach'));
  const normal = ges({ retention4h: 5, glucose: 300 });
  assert.ok(normal.glucoseNote.includes('more surprising'));
  assert.equal(ges({ retention4h: 60, glucose: 250 }).glucoseNote, null);
  assert.equal(ges({ retention4h: 60 }).glucoseNote, null);
});

test('ges: an unrecorded drug hold is named', () => {
  assert.ok(ges({ retention4h: 30 }).drugNote.includes('measured the drug'));
  assert.equal(ges({ retention4h: 30, drugsHeld: true }).drugNote, null);
});

test('ges: the scope is stated every time', () => {
  const r = ges({ retention4h: 30 });
  assert.ok(r.scopeNote.includes('needs symptoms as well'));
});

test('ges: validation', () => {
  assert.equal(ges({}).valid, false);
  assert.equal(ges(null).valid, false);
  assert.equal(ges({ drugsHeld: true }).valid, false);
  assert.equal(ges({ retention4h: 101 }).valid, false);
  assert.equal(ges({ retention2h: -1 }).valid, false);
  assert.equal(ges({ retention1h: 200 }).valid, false);
  assert.equal(ges({ retention4h: 20, glucose: 5 }).valid, false);
});

test('ges: the documented example round-trips', () => {
  const r = ges({ retention2h: '45', retention4h: '18', drugsHeld: 'true' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 1);
  assert.ok(r.band.includes('grade 1'));
  assert.equal(r.drugNote, null);
  assert.ok(r.disagreeNote);
});
