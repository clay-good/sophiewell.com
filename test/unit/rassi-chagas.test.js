import test from 'node:test';
import assert from 'node:assert/strict';
import { rassiChagas as rassi } from '../../lib/rassi-chagas-v851.js';

const ALL = { nyhaClass34: true, cardiomegaly: true, wallMotion: true, nsvt: true, lowVoltage: true, maleSex: true };

test('rassi: the six point values', () => {
  assert.equal(rassi({ nyhaClass34: true }).score, 5);
  assert.equal(rassi({ cardiomegaly: true }).score, 5);
  assert.equal(rassi({ wallMotion: true }).score, 3);
  assert.equal(rassi({ nsvt: true }).score, 3);
  assert.equal(rassi({ lowVoltage: true }).score, 2);
  assert.equal(rassi({ maleSex: true }).score, 2);
  assert.equal(rassi(ALL).score, 20);
  assert.equal(rassi({}).score, 0);
});

test('rassi: the three bands and their published mortality', () => {
  const at = (o) => rassi(o);
  assert.equal(at({}).riskLabel, 'low');
  assert.equal(at({}).mortalityTenYear, 10);
  assert.equal(at({ nyhaClass34: true, maleSex: true }).score, 7);
  assert.equal(at({ nyhaClass34: true, maleSex: true }).riskLabel, 'intermediate');
  assert.equal(at({ nyhaClass34: true, maleSex: true }).mortalityTenYear, 44);
  // 6 is the top of low, 7 the bottom of intermediate, 11 the top of it, 12 the bottom of high.
  assert.equal(at({ wallMotion: true, nsvt: true }).score, 6);
  assert.equal(at({ wallMotion: true, nsvt: true }).riskLabel, 'low');
  assert.equal(at({ nyhaClass34: true, wallMotion: true, nsvt: true }).score, 11);
  assert.equal(at({ nyhaClass34: true, wallMotion: true, nsvt: true }).riskLabel, 'intermediate');
  assert.equal(at({ nyhaClass34: true, cardiomegaly: true, maleSex: true }).score, 12);
  assert.equal(at({ nyhaClass34: true, cardiomegaly: true, maleSex: true }).riskLabel, 'high');
  assert.equal(at(ALL).mortalityTenYear, 84);
});

test('rassi: there is no ejection fraction in the model, and it says so', () => {
  // The error the tile exists to prevent.
  const r = rassi(ALL);
  assert.ok(r.noEfNote.includes('no ejection fraction'));
  assert.ok(r.noEfNote.includes('chest radiograph'));
  // Nothing an ejection fraction is passed as can move the score.
  assert.equal(rassi({ ejectionFraction: 20 }).score, 0);
  assert.equal(rassi({ lvef: 15, ef: 15 }).score, 0);
});

test('rassi: the low band is printed with its figure, not just its name', () => {
  const low = rassi({});
  assert.ok(low.bandMeaningNote.includes('10 percent'));
  assert.ok(low.bandMeaningNote.includes('average age was 47'));
  assert.equal(low.abnormal, false);
  const high = rassi(ALL);
  assert.ok(high.bandMeaningNote.includes('84 percent'));
  assert.ok(!high.bandMeaningNote.includes('average age'));
  assert.equal(high.abnormal, true);
});

test('rassi: male sex is recorded as a scored term', () => {
  assert.ok(rassi({ maleSex: true }).sexNote.includes('2 points'));
  assert.equal(rassi({ nsvt: true }).sexNote, null);
  assert.ok(rassi({ maleSex: true }).items.includes('male sex'));
});

test('rassi: what it predicts is stated every time', () => {
  const r = rassi({ nsvt: true });
  assert.ok(r.scopeNote.includes('any cause'));
  assert.ok(r.scopeNote.includes('not predict sudden death'));
});

test('rassi: string truthiness from the form, and a bad input scores nothing', () => {
  assert.equal(rassi({ nyhaClass34: 'true', maleSex: 'on' }).score, 7);
  assert.equal(rassi({ nyhaClass34: 'false' }).score, 0);
  assert.equal(rassi(null).valid, true);
  assert.equal(rassi(null).score, 0);
});

test('rassi: the documented example round-trips', () => {
  const r = rassi({ 'nyhaClass34': 'true', 'cardiomegaly': 'true', 'maleSex': 'true' });
  assert.equal(r.score, 12);
  assert.ok(r.band.includes('12 of 20'));
  assert.equal(r.riskLabel, 'high');
});
