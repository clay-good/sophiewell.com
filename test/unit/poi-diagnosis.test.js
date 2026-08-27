import test from 'node:test';
import assert from 'node:assert/strict';
import { poiDiagnosis as poi, FSH_THRESHOLD, MONTHS_REQUIRED, AGE_LIMIT } from '../../lib/poi-diagnosis-v834.js';

test('poi: the standard route is menstrual disturbance plus a raised FSH', () => {
  const r = poi({ age: 32, monthsOfDisturbance: 6, fsh: 40 });
  assert.equal(r.diagnosis, true);
  assert.equal(FSH_THRESHOLD, 25);
  assert.equal(MONTHS_REQUIRED, 4);
  assert.equal(poi({ age: 32, monthsOfDisturbance: 3, fsh: 40 }).diagnosis, false);
  assert.equal(poi({ age: 32, monthsOfDisturbance: 6, fsh: 25 }).diagnosis, false);
  assert.equal(poi({ age: 32, monthsOfDisturbance: 6, fsh: 25.1 }).diagnosis, true);
});

test('poi: bilateral oophorectomy under 40 IS the diagnosis, with no testing', () => {
  const r = poi({ age: 32, bilateralOophorectomy: true });
  assert.equal(r.diagnosis, true);
  assert.ok(r.route.includes('itself the diagnosis'));
  assert.ok(r.oophorectomyNote.includes('no further testing'));
  // It stands with no FSH and no menstrual history at all.
  assert.equal(r.missing.length, 0);
});

test('poi: the age boundary is under 40', () => {
  assert.equal(AGE_LIMIT, 40);
  assert.equal(poi({ age: 39, monthsOfDisturbance: 6, fsh: 40 }).diagnosis, true);
  const over = poi({ age: 44, monthsOfDisturbance: 6, fsh: 40 });
  assert.equal(over.diagnosis, false);
  assert.ok(over.ageNote.includes('do not apply'));
  // And oophorectomy does not override the age limit.
  assert.equal(poi({ age: 44, bilateralOophorectomy: true }).diagnosis, false);
});

test('poi: hormonal therapy cuts both ways and is called out', () => {
  // It can lower the FSH, so a normal FSH on treatment is not reassuring.
  const lowOnPill = poi({ age: 32, monthsOfDisturbance: 6, fsh: 12, onHormonalTherapy: true });
  assert.equal(lowOnPill.diagnosis, false);
  assert.ok(lowOnPill.hormoneNote.includes('under-call'));
  assert.ok(lowOnPill.hormoneNote.includes('two to six weeks'));
  // And it can conceal or cause the menstrual disturbance itself.
  const raised = poi({ age: 32, monthsOfDisturbance: 6, fsh: 40, onHormonalTherapy: true });
  assert.ok(raised.hormoneNote.includes('conceal'));
  assert.equal(poi({ age: 32, monthsOfDisturbance: 6, fsh: 40 }).hormoneNote, null);
});

test('poi: the two-occasions difference between guideline versions is stated, not chosen', () => {
  const noRepeat = poi({ age: 32, monthsOfDisturbance: 6, fsh: 40 });
  assert.equal(noRepeat.diagnosis, true);
  assert.ok(noRepeat.repeatNote.includes('2016 guideline'));
  assert.ok(noRepeat.repeatNote.includes('fluctuates'));
  // With a confirmatory sample the note is gone.
  assert.equal(poi({ age: 32, monthsOfDisturbance: 6, fsh: 40, repeatFshConfirmed: true }).repeatNote, null);
  // And it is not raised on the oophorectomy route, which involves no FSH.
  assert.equal(poi({ age: 32, bilateralOophorectomy: true }).repeatNote, null);
});

test('poi: estradiol, ultrasound and AMH are supportive and NOT diagnostic', () => {
  const r = poi({ age: 32, estradiolLow: true, ultrasoundDone: true, amhLow: true });
  assert.equal(r.diagnosis, false);
  assert.ok(r.notDiagnosticNote.includes('should not be the primary diagnostic test'));
  assert.equal(poi({ age: 32, monthsOfDisturbance: 6, fsh: 40 }).notDiagnosticNote, null);
});

test('poi: empty, invalid and out-of-range input', () => {
  const empty = poi({});
  assert.equal(empty.valid, true);
  assert.equal(empty.diagnosis, false);
  assert.equal(empty.hormoneNote, null);
  assert.equal(poi({ age: 200 }).valid, false);
  assert.equal(poi({ fsh: 1e308 }).valid, false);
  assert.equal(poi({ monthsOfDisturbance: -1 }).valid, false);
  assert.equal(poi().valid, true);
  assert.doesNotMatch(JSON.stringify(poi({ age: 32, monthsOfDisturbance: 6, fsh: 40 })), /NaN|Infinity/);
});
