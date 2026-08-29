import test from 'node:test';
import assert from 'node:assert/strict';
import { pefZones as p, GREEN_MIN, YELLOW_MIN } from '../../lib/pef-zones-v891.js';

test('pef-zones: the published boundaries', () => {
  assert.equal(GREEN_MIN, 80);
  assert.equal(YELLOW_MIN, 50);
});

test('pef-zones: the three zones, read strictly at the boundaries', () => {
  assert.equal(p({ currentPef: 400, personalBest: 500 }).zone, 'green');
  assert.equal(p({ currentPef: 399, personalBest: 500 }).zone, 'yellow');
  assert.equal(p({ currentPef: 250, personalBest: 500 }).zone, 'yellow');
  assert.equal(p({ currentPef: 249, personalBest: 500 }).zone, 'red');
  assert.equal(p({ currentPef: 400, personalBest: 500 }).abnormal, false);
  assert.equal(p({ currentPef: 300, personalBest: 500 }).abnormal, true);
});

test('pef-zones: the boundaries are printed in L/min for that personal best', () => {
  const r = p({ currentPef: 300, personalBest: 500 });
  assert.equal(r.greenAt, 400);
  assert.equal(r.yellowAt, 250);
  assert.match(r.band, /from 250 to 399 L\/min/);
  assert.match(p({ currentPef: 450, personalBest: 500 }).band, /green zone on this personal best starts at 400 L\/min/);
  assert.match(p({ currentPef: 200, personalBest: 500 }).band, /below 250 L\/min/);
});

test('pef-zones: the reference is the personal best, said on every result', () => {
  // The reason the tile exists.
  for (const current of [450, 300, 200]) {
    const r = p({ currentPef: current, personalBest: 500 });
    assert.match(r.personalBestNote, /not of a predicted value/);
    assert.match(r.personalBestNote, /shifts every boundary/);
    assert.match(r.symptomsNote, /Symptoms override the number/);
    assert.match(r.techniqueNote, /best of three attempts/);
  }
});

test('pef-zones: how the personal best was established changes what the result is worth', () => {
  assert.match(p({ currentPef: 450, personalBest: 500 }).establishNote, /not recorded as having been established/);
  assert.match(p({ currentPef: 450, personalBest: 500 }).establishNote, /every zone here moves with it/);
  assert.match(p({ currentPef: 450, personalBest: 500, bestFromWellPeriod: true }).establishNote, /recorded as established while the patient was well/);
});

test('pef-zones: a reading well above the personal best flags a stale reference', () => {
  assert.match(p({ currentPef: 600, personalBest: 500 }).staleBestNote, /personal best is out of date/);
  // Just above it is not enough to say that.
  assert.equal(p({ currentPef: 550, personalBest: 500 }).staleBestNote, null);
  assert.equal(p({ currentPef: 450, personalBest: 500 }).staleBestNote, null);
});

test('pef-zones: both readings are required and range-checked', () => {
  assert.equal(p({ currentPef: 300 }).valid, false);
  assert.equal(p({ personalBest: 500 }).valid, false);
  assert.equal(p({ currentPef: 0, personalBest: 500 }).valid, false);
  assert.equal(p({ currentPef: 300, personalBest: 901 }).valid, false);
});

test('pef-zones: the documented example', () => {
  const r = p({ currentPef: '300', personalBest: '500' });
  assert.equal(r.percent, 60);
  assert.equal(r.zone, 'yellow');
});
