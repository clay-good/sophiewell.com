import test from 'node:test';
import assert from 'node:assert/strict';
import { sbpAsciticFluid as sbp } from '../../lib/sbp-ascitic-fluid-v852.js';

test('sbp: the threshold is a corrected count of 250', () => {
  assert.equal(sbp({ pmnCount: 250 }).neutrocytic, true);
  assert.equal(sbp({ pmnCount: 249 }).neutrocytic, false);
  assert.equal(sbp({ pmnCount: 250 }).correctedPmn, 250);
});

test('sbp: a bloody tap is corrected at one neutrophil per 250 red cells', () => {
  // The error the tile exists to prevent.
  const r = sbp({ pmnCount: 300, redCellCount: 20000 });
  assert.equal(r.bloodSubtraction, 80);
  assert.equal(r.correctedPmn, 220);
  assert.equal(r.neutrocytic, false);
  assert.ok(r.bloodNote.includes('crosses 250 on blood alone'));

  // A clean tap raises nothing.
  assert.equal(sbp({ pmnCount: 300 }).bloodSubtraction, 0);
  assert.equal(sbp({ pmnCount: 300 }).bloodNote, null);
  assert.equal(sbp({ pmnCount: 300, redCellCount: 0 }).bloodNote, null);

  // Blood that does not change the answer still gets shown, without the warning clause.
  const still = sbp({ pmnCount: 900, redCellCount: 25000 });
  assert.equal(still.correctedPmn, 800);
  assert.equal(still.neutrocytic, true);
  assert.ok(!still.bloodNote.includes('crosses 250 on blood alone'));

  // The correction cannot drive the count below zero.
  assert.equal(sbp({ pmnCount: 10, redCellCount: 500000 }).correctedPmn, 0);
});

test('sbp: the count may be given as a percentage of the total, and the total is not the count', () => {
  const r = sbp({ nucleatedCount: 500, pmnPercent: 30 });
  assert.equal(r.rawPmn, 150);
  assert.equal(r.neutrocytic, false);
  assert.ok(r.percentNote.includes('not the total'));
  // A directly reported neutrophil count wins over the percentage pair.
  assert.equal(sbp({ pmnCount: 400, nucleatedCount: 500, pmnPercent: 30 }).rawPmn, 400);
  assert.equal(sbp({ pmnCount: 400 }).percentNote, null);
});

test('sbp: the culture names the state, and a negative one does not exclude it', () => {
  assert.equal(sbp({ pmnCount: 400, culture: 'single' }).state, 'spontaneous bacterial peritonitis');
  assert.equal(sbp({ pmnCount: 400, culture: 'none' }).state, 'culture-negative neutrocytic ascites');
  assert.ok(sbp({ pmnCount: 400, culture: 'none' }).cultureNote.includes('two thirds'));
  assert.ok(sbp({ pmnCount: 400, culture: 'pending' }).cultureNote);
  assert.equal(sbp({ pmnCount: 400, culture: 'single' }).cultureNote, null);
  assert.equal(sbp({ pmnCount: 100, culture: 'single' }).state, 'bacterascites');
  assert.ok(sbp({ pmnCount: 100, culture: 'single' }).bacterascitesNote.includes('repeat the tap'));
  assert.equal(sbp({ pmnCount: 100, culture: 'none' }).state, 'the neutrophil criterion is not met');
});

test('sbp: polymicrobial growth points at a viscus, not at this diagnosis', () => {
  const r = sbp({ pmnCount: 400, culture: 'polymicrobial' });
  assert.ok(r.secondaryNote.includes('perforated or inflamed viscus'));
  assert.ok(r.state.includes('polymicrobial'));
  assert.equal(sbp({ pmnCount: 400, culture: 'single' }).secondaryNote, null);
});

test('sbp: the albumin criteria are reported with their figures, and only above the line', () => {
  const met = sbp({ pmnCount: 400, creatinine: 1.6, weight: 70 });
  assert.equal(met.albuminCriteriaMet, true);
  assert.deepEqual(met.albuminTriggers, ['creatinine 1.6 mg/dL']);
  assert.ok(met.albuminNote.includes('105 g and 70 g'));
  assert.ok(met.albuminNote.includes('not an order'));

  assert.equal(sbp({ pmnCount: 400, bun: 35 }).albuminCriteriaMet, true);
  assert.equal(sbp({ pmnCount: 400, bilirubin: 5 }).albuminCriteriaMet, true);
  assert.equal(sbp({ pmnCount: 400, creatinine: 1, bun: 30, bilirubin: 4 }).albuminCriteriaMet, false);
  assert.ok(sbp({ pmnCount: 400, creatinine: 1 }).albuminNote.includes('None of the albumin criteria'));

  // Below the neutrophil line there is nothing to report.
  assert.equal(sbp({ pmnCount: 100, creatinine: 3 }).albuminCriteriaMet, false);
  assert.equal(sbp({ pmnCount: 100, creatinine: 3 }).albuminNote, null);
  // No blood tests entered, nothing claimed either way.
  assert.equal(sbp({ pmnCount: 400 }).albuminNote, null);
});

test('sbp: the scope is stated every time', () => {
  assert.ok(sbp({ pmnCount: 400 }).scopeNote.includes('does not select an antibiotic'));
});

test('sbp: validation', () => {
  assert.equal(sbp({}).valid, false);
  assert.equal(sbp(null).valid, false);
  assert.equal(sbp({ nucleatedCount: 500 }).valid, false, 'a total without a percentage is not a count');
  assert.equal(sbp({ pmnCount: -1 }).valid, false);
  assert.equal(sbp({ nucleatedCount: 500, pmnPercent: 120 }).valid, false);
  assert.equal(sbp({ pmnCount: 400, redCellCount: 9e9 }).valid, false);
  assert.equal(sbp({ pmnCount: 400, creatinine: 99 }).valid, false);
  assert.equal(sbp({ pmnCount: 400, bun: 999 }).valid, false);
  assert.equal(sbp({ pmnCount: 400, bilirubin: 999 }).valid, false);
  assert.equal(sbp({ pmnCount: 400, weight: 5 }).valid, false);
});

test('sbp: the documented example round-trips', () => {
  const r = sbp({ pmnCount: '300', redCellCount: '20000' });
  assert.equal(r.valid, true);
  assert.equal(r.correctedPmn, 220);
  assert.ok(r.band.includes('220'));
});
