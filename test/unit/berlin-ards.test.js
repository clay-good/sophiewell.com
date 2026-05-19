import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berlinArds } from '../../lib/scoring-v4.js';

const allFour = {
  timingLe1wk: true, bilateralOpacities: true,
  notExplainedByCardiacOrOverload: true, peepGe5cmH2O: true,
};

test('berlin-ards not met: no criteria checked', () => {
  const r = berlinArds({ ...allFour, timingLe1wk: false, pao2: 100, fio2: 0.5 });
  assert.equal(r.ards, false);
});

test('berlin-ards mild: all four + P/F 250', () => {
  const r = berlinArds({ ...allFour, pao2: 125, fio2: 0.5 });
  assert.equal(r.ards, true);
  assert.equal(r.severity, 'mild');
});

test('berlin-ards moderate: all four + P/F 150', () => {
  const r = berlinArds({ ...allFour, pao2: 75, fio2: 0.5 });
  assert.equal(r.severity, 'moderate');
});

test('berlin-ards severe: all four + P/F <= 100', () => {
  const r = berlinArds({ ...allFour, pao2: 50, fio2: 0.5 });
  assert.equal(r.severity, 'severe');
});

test('berlin-ards P/F > 300 fails severity criterion', () => {
  const r = berlinArds({ ...allFour, pao2: 200, fio2: 0.5 });
  assert.equal(r.ards, false);
  assert.match(r.band, /not met/);
});
