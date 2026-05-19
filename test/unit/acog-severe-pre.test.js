import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acogSeverePre } from '../../lib/scoring-v4.js';

test('acog-severe-pre 0 features (tile example) -> not severe', () => {
  const r = acogSeverePre({});
  assert.equal(r.featuresPresent, 0);
  assert.equal(r.severe, false);
  assert.match(r.band, /0 of 6 severe features present/);
});

test('acog-severe-pre 1 feature (BP) alone -> severe', () => {
  const r = acogSeverePre({ sbpGte160OrDbpGte110: true });
  assert.equal(r.featuresPresent, 1);
  assert.equal(r.severe, true);
  assert.match(r.band, /SEVERE preeclampsia per ACOG 2013/);
});

test('acog-severe-pre 1 feature (neuro) alone -> severe', () => {
  const r = acogSeverePre({ cerebralOrVisualDisturbances: true });
  assert.equal(r.severe, true);
});

test('acog-severe-pre 2 features -> severe', () => {
  const r = acogSeverePre({ thrombocytopeniaLt100: true, pulmonaryEdema: true });
  assert.equal(r.featuresPresent, 2);
  assert.equal(r.severe, true);
});

test('acog-severe-pre 6 features (all) -> severe', () => {
  const r = acogSeverePre({
    sbpGte160OrDbpGte110: true, thrombocytopeniaLt100: true,
    impairedHepaticFunction: true, creatinineGt11OrDoubled: true,
    pulmonaryEdema: true, cerebralOrVisualDisturbances: true,
  });
  assert.equal(r.featuresPresent, 6);
  assert.equal(r.severe, true);
});
