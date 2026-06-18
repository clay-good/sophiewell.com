// spec-v106 2.5: original Geneva score (Wicki 2001). Objective items + ABG +
// chest film, total 0-16, bands low 0-4 / intermediate 5-8 / high >= 9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { genevaOriginal } from '../../lib/vte-v106.js';

test('young, no findings -> 0 points, low probability', () => {
  const r = genevaOriginal({ age: 40 });
  assert.equal(r.total, 0);
  assert.equal(r.probability, 'low');
  assert.equal(r.prevalence, 10);
});

test('age bands: 60-79 +1, >= 80 +2', () => {
  assert.equal(genevaOriginal({ age: 65 }).total, 1);
  assert.equal(genevaOriginal({ age: 85 }).total, 2);
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
  const r = genevaOriginal({ age: 40, paco2Band: 'bogus', pao2Band: '' });
  assert.equal(r.total, 0);
});

test('age required; blank age -> fallback', () => {
  assert.equal(genevaOriginal({}).valid, false);
});
