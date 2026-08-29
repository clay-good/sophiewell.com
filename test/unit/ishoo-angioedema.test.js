import test from 'node:test';
import assert from 'node:assert/strict';
import { ishooAngioedema as i, SITES } from '../../lib/ishoo-angioedema-v877.js';

test('ishoo-angioedema: four sites, one per stage', () => {
  assert.deepEqual(SITES.map((s) => s.key), ['faceOrLip', 'softPalate', 'tongue', 'larynx']);
  assert.deepEqual(SITES.map((s) => s.stage), [1, 2, 3, 4]);
  for (const s of SITES) assert.equal(i({ [s.key]: true }).stage, s.stage, s.key);
  assert.equal(i({}).stage, 0);
});

test('ishoo-angioedema: the stage is the most distal site, never a sum', () => {
  // The reason the tile exists.
  assert.equal(i({ faceOrLip: true, softPalate: true }).stage, 2);
  assert.equal(i({ faceOrLip: true, tongue: true }).stage, 3);
  assert.equal(i({ faceOrLip: true, softPalate: true, tongue: true, larynx: true }).stage, 4);
  // Four sites do not make a stage above IV.
  assert.equal(i({ faceOrLip: true, softPalate: true, tongue: true, larynx: true }).involved.length, 4);
  assert.match(i({ faceOrLip: true, tongue: true }).multipleSitesNote, /takes the most distal of them, tongue/);
  assert.equal(i({ tongue: true }).multipleSitesNote, null);
  for (const input of [{}, { faceOrLip: true }, { larynx: true }]) {
    assert.match(i(input).notASeverityScoreNote, /not a severity score/);
  }
});

test('ishoo-angioedema: a threatened airway overrides the stage', () => {
  const r = i({ faceOrLip: true, airwayThreatened: true });
  assert.equal(r.stage, 1);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /overrides the staging entirely/);
  // And the disposition caveat is said whether or not the airway is flagged.
  for (const input of [{}, { faceOrLip: true }, { larynx: true }]) {
    assert.match(i(input).dispositionNote, /not airway patency right now/);
  }
});

test('ishoo-angioedema: the late-signs warning belongs to stage III and above', () => {
  assert.equal(i({ faceOrLip: true }).lateSignsNote, null);
  assert.equal(i({ softPalate: true }).lateSignsNote, null);
  assert.match(i({ tongue: true }).lateSignsNote, /Stridor and voice change are late/);
  assert.match(i({ larynx: true }).lateSignsNote, /progression over hours/);
});

test('ishoo-angioedema: stage III and IV are flagged, I and II are not', () => {
  assert.equal(i({ faceOrLip: true }).abnormal, false);
  assert.equal(i({ softPalate: true }).abnormal, false);
  assert.equal(i({ tongue: true }).abnormal, true);
  assert.equal(i({ larynx: true }).abnormal, true);
});

test('ishoo-angioedema: the mechanism caveat is on every result', () => {
  for (const input of [{}, { faceOrLip: true }, { larynx: true }]) {
    assert.match(i(input).mechanismNote, /does not separate the mechanism/);
    assert.match(i(input).mechanismNote, /does not respond to epinephrine/);
    assert.match(i(input).scopeNote, /does not decide the airway/);
  }
});

test('ishoo-angioedema: the documented example', () => {
  const r = i({ faceOrLip: true, tongue: true });
  assert.equal(r.stage, 3);
  assert.equal(r.bandLabel, 'Stage III');
  assert.match(r.multipleSitesNote, /^2 sites are recorded/);
});
