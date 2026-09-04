import test from 'node:test';
import assert from 'node:assert/strict';
import { tripleI as ti, FEVER_SINGLE, FEVER_REPEAT, WBC_THRESHOLD, FHR_THRESHOLD } from '../../lib/triple-i-v832.js';

test('triple i: the three graded categories', () => {
  assert.equal(ti({ temperature: 39.2 }).category, 'Isolated maternal fever');
  assert.equal(ti({ temperature: 39.2, fetalHeartRate: 175 }).category, 'Suspected Triple I');
  assert.equal(ti({ temperature: 39.2, fetalHeartRate: 175, placentalHistology: true }).category, 'Confirmed Triple I');
});

test('triple i: isolated fever is a category, NOT an infection diagnosis', () => {
  // The reform. Fever alone used to be called chorioamnionitis.
  const r = ti({ temperature: 39.2 });
  assert.equal(r.suspected, false);
  assert.equal(r.confirmed, false);
  assert.ok(r.reformNote.includes('NOT an infection diagnosis'));
  // The note belongs only to that category.
  assert.equal(ti({ temperature: 39.2, fetalHeartRate: 175 }).reformNote, null);
});

test('triple i: the fever definition has two routes and a single 38.5 satisfies NEITHER', () => {
  assert.equal(FEVER_SINGLE, 39.0);
  assert.equal(FEVER_REPEAT, 38.0);
  const single385 = ti({ temperature: 38.5 });
  assert.equal(single385.fever, false);
  assert.equal(single385.category, null);
  assert.ok(single385.feverNote.includes('does not meet either route'));

  // Repeated 30 minutes later, it does.
  assert.equal(ti({ temperature: 38.5, repeatedAfter30Min: true }).fever, true);
  // And a single reading at 39.0 does on its own.
  assert.equal(ti({ temperature: 39.0 }).fever, true);
  assert.equal(ti({ temperature: 37.9, repeatedAfter30Min: true }).fever, false);
});

test('triple i: a clear alternative source disqualifies the fever', () => {
  const r = ti({ temperature: 39.2, alternativeSource: true });
  assert.equal(r.fever, false);
  assert.equal(r.category, null);
  assert.ok(r.altNote.includes('requires its absence'));
});

test('triple i: leukocytosis does NOT count after recent corticosteroids', () => {
  assert.equal(WBC_THRESHOLD, 15000);
  const withSteroids = ti({ temperature: 39.2, whiteCellCount: 18000, recentCorticosteroids: true });
  assert.equal(withSteroids.category, 'Isolated maternal fever');
  assert.ok(withSteroids.steroidNote.includes('NOT counted'));
  // Without them it counts.
  assert.equal(ti({ temperature: 39.2, whiteCellCount: 18000 }).category, 'Suspected Triple I');
  assert.equal(ti({ temperature: 39.2, whiteCellCount: 15000 }).category, 'Isolated maternal fever');
});

test('triple i: any ONE supporting feature makes it suspected', () => {
  assert.equal(FHR_THRESHOLD, 160);
  assert.equal(ti({ temperature: 39.2, fetalHeartRate: 161 }).suspected, true);
  assert.equal(ti({ temperature: 39.2, fetalHeartRate: 160 }).suspected, false);
  assert.equal(ti({ temperature: 39.2, purulentDischarge: true }).suspected, true);
});

test('triple i: confirmed requires suspected first, not just a positive test', () => {
  // Placental histology without the fever and a supporting feature is not confirmed.
  // spec-v1063: entered as a recorded temperature that is not a fever, because a
  // BLANK temperature is now a refusal rather than a category of its own.
  assert.equal(ti({ temperature: 37, placentalHistology: true }).confirmed, false);
  assert.equal(ti({ temperature: 39.2, placentalHistology: true }).category, 'Isolated maternal fever');
  assert.equal(ti({ temperature: 39.2, purulentDischarge: true, positiveGramStain: true }).confirmed, true);
});

test('triple i: Fahrenheit converts exactly, unlike some paired clinical thresholds', () => {
  // 39.0 C is 102.2 F.
  assert.equal(ti({ temperature: 102.2, temperatureUnit: 'f' }).fever, true);
  assert.equal(ti({ temperature: 102.1, temperatureUnit: 'f' }).fever, false);
  assert.equal(ti({ temperature: 102.2, temperatureUnit: 'f' }).temperatureCelsius, 39);
});

test('triple i: empty, invalid and out-of-range input', () => {
  // spec-v1063: an empty form used to come back valid with a null category, which
  // the renderer printed as "No category met on these entries" -- a rule-out from
  // no data. A temperature that IS entered and is not a fever still gets that
  // sentence, because there the entry really was made.
  const empty = ti({});
  assert.equal(empty.valid, false);
  assert.match(empty.message, /Enter a maternal temperature/);
  const afebrile = ti({ temperature: 37 });
  assert.equal(afebrile.valid, true);
  assert.equal(afebrile.category, null);
  assert.equal(afebrile.feverNote, null);
  assert.equal(ti({ temperature: 60 }).valid, false);
  assert.equal(ti({ temperature: 1e308 }).valid, false);
  assert.equal(ti({ temperatureUnit: 'kelvin' }).valid, false);
  assert.equal(ti({ fetalHeartRate: 1e308 }).valid, false);
  assert.equal(ti().valid, false);
  assert.doesNotMatch(JSON.stringify(ti({ temperature: 39.2, fetalHeartRate: 175 })), /NaN|Infinity/);
});

test('triple i: a supporting feature nobody measured is not a feature that is absent (spec-v1063)', () => {
  // One supporting feature is all that separates isolated maternal fever from
  // suspected Triple I, so declaring "without any of the supporting features"
  // while the fetal heart rate is blank rules the diagnosis out on an unmeasured
  // value.
  const blank = ti({ temperature: 39.2, temperatureUnit: 'c' });
  assert.equal(blank.category, 'Isolated maternal fever');
  assert.deepEqual(blank.unassessedSupporting, ['a fetal heart rate', 'a maternal white cell count']);
  assert.match(blank.band, /was not entered|were not entered/);
  assert.doesNotMatch(blank.band, /without any of the supporting features/);

  // With both measured and neither meeting its threshold, the plain sentence is
  // correct again and must come back.
  const measured = ti({ temperature: 39.2, temperatureUnit: 'c', fetalHeartRate: 140, whiteCellCount: 9000 });
  assert.deepEqual(measured.unassessedSupporting, []);
  assert.match(measured.band, /without any of the supporting features/);
});
