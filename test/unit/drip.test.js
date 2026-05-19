import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drip } from '../../lib/scoring-v4.js';

test('drip low: nothing -> 0', () => {
  const r = drip({});
  assert.equal(r.score, 0);
  assert.equal(r.highRisk, false);
});

test('drip threshold: 2 majors -> 4 (high)', () => {
  const r = drip({ longTermCareResidence: true, tubeFeeding: true });
  assert.equal(r.score, 4);
  assert.equal(r.highRisk, true);
});

test('drip threshold: 1 major + 2 minors -> 4 (high)', () => {
  const r = drip({ tubeFeeding: true, hospitalizationLast60d: true, chronicPulmonary: true });
  assert.equal(r.score, 4);
  assert.equal(r.highRisk, true);
});

test('drip below cutoff: 1 major + 1 minor -> 3', () => {
  const r = drip({ tubeFeeding: true, hospitalizationLast60d: true });
  assert.equal(r.score, 3);
  assert.equal(r.highRisk, false);
});

test('drip maximum: all 10 factors -> 14', () => {
  const r = drip({
    antibioticsLast60d: true, longTermCareResidence: true,
    tubeFeeding: true, priorMdrIsolate: true,
    hospitalizationLast60d: true, chronicPulmonary: true,
    poorFunctionalStatus: true, gastricAcidSuppression: true,
    woundCare: true, mrsaColonization: true,
  });
  assert.equal(r.score, 14);
});
