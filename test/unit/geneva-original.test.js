// spec-v106 2.5: original Geneva score (Wicki 2001). Objective items + ABG +
// chest film, total 0-16, bands low 0-4 / intermediate 5-8 / high >= 9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { genevaOriginal } from '../../lib/vte-v106.js';

test('young, no findings -> 0 points, low probability', () => {
  // spec-v1064: an explicit normal rate. The low band is withheld while the rate
  // is blank, because the point it can add takes the score out of that band.
  const r = genevaOriginal({ age: 40, heartRate: 80 });
  assert.equal(r.total, 0);
  assert.equal(r.probability, 'low');
  assert.equal(r.prevalence, 10);
});

test('age bands: 60-79 +1, >= 80 +2', () => {
  assert.equal(genevaOriginal({ age: 65, heartRate: 80 }).total, 1);
  assert.equal(genevaOriginal({ age: 85, heartRate: 80 }).total, 2);
});

test('band flip: total crossing into the high band (8 -> 9)', () => {
  // age >=80 (2) + prior VTE (2) + surgery (3) + HR>100 (1) = 8 -> intermediate
  const inter = genevaOriginal({ age: 85, priorVte: true, recentSurgery: true, heartRate: 110 });
  assert.equal(inter.total, 8);
  assert.equal(inter.probability, 'intermediate');
  // + band atelectasis (1) = 9 -> high
  const hi = genevaOriginal({ age: 85, priorVte: true, recentSurgery: true, heartRate: 110, bandAtelectasis: true });
  assert.equal(hi.total, 9);
  assert.equal(hi.probability, 'high');
  assert.equal(hi.prevalence, 81);
});

test('ABG bands score per the paper (PaCO2 < 36 +2, PaO2 < 48.7 +4)', () => {
  const r = genevaOriginal({ age: 40, paco2Band: 'low2', pao2Band: 'b4' });
  assert.equal(r.total, 6); // 2 + 4
  assert.equal(r.probability, 'intermediate');
});

test('unrecognized ABG band defaults to the 0-point normal band', () => {
  const r = genevaOriginal({ age: 40, heartRate: 80, paco2Band: 'bogus', pao2Band: '' });
  assert.equal(r.total, 0);
});

test('age required; blank age -> fallback', () => {
  assert.equal(genevaOriginal({}).valid, false);
});

test('a blank heart rate may not read as low probability (spec-v1064)', () => {
  // The rate adds a point or nothing, so a total scored without it is a floor.
  // That is safe once the score has left the low band and unsafe at the boundary:
  // "low clinical probability" is the sentence a PE gets ruled out on.
  const low = genevaOriginal({ age: 65 });
  assert.equal(low.valid, false);
  assert.match(low.band, /Enter a heart rate/);

  // Above the boundary it still scores, and says what it was scored from.
  const high = genevaOriginal({
    age: 85, priorVte: true, recentSurgery: true, pao2Band: 'b4',
    bandAtelectasis: true, elevatedHemidiaphragm: true,
  });
  assert.equal(high.valid, true);
  assert.equal(high.hrMissing, true);
  assert.match(high.band, /can only raise it/);

  // With the rate entered nothing is appended.
  const full = genevaOriginal({ age: 65, heartRate: 110 });
  assert.equal(full.hrMissing, false);
  assert.doesNotMatch(full.band, /can only raise it/);
});
