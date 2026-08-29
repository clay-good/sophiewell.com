import test from 'node:test';
import assert from 'node:assert/strict';
import { nmsCriteria as n, NMS_ITEMS, NMS_THRESHOLD, NMS_TOTAL_POINTS } from '../../lib/nms-criteria-v870.js';

const all = () => Object.fromEntries(NMS_ITEMS.map((i) => [i.key, true]));

test('nms-criteria: eight items whose points sum to 100', () => {
  assert.equal(NMS_ITEMS.length, 8);
  assert.equal(NMS_ITEMS.reduce((s, i) => s + i.points, 0), NMS_TOTAL_POINTS);
  assert.equal(n(all()).total, NMS_TOTAL_POINTS);
  assert.equal(n({}).total, 0);
  for (const i of NMS_ITEMS) assert.equal(n({ [i.key]: true }).total, i.points, i.key);
});

test('nms-criteria: the threshold is 74 of 100', () => {
  assert.equal(NMS_THRESHOLD, 74);
  assert.equal(n(all()).meets, true);
  assert.equal(n({}).meets, false);
  // Exposure, hyperthermia, rigidity, mental status and creatine kinase is 78.
  const five = { exposure: true, hyperthermia: true, rigidity: true, mentalStatus: true, creatineKinase: true };
  assert.equal(n(five).total, 78);
  assert.equal(n(five).meets, true);
});

test('nms-criteria: neither fever nor rigidity is required', () => {
  // The point of the item weights: the threshold is reachable without each of them.
  const withoutFever = { ...all(), hyperthermia: false };
  assert.equal(n(withoutFever).total, 82);
  assert.equal(n(withoutFever).meets, true);
  const withoutRigidity = { ...all(), rigidity: false };
  assert.equal(n(withoutRigidity).total, 83);
  assert.equal(n(withoutRigidity).meets, true);
  assert.match(n(withoutFever).featureNote, /Neither fever nor rigidity is required/);
  assert.match(n(withoutRigidity).featureNote, /82 points/);
  // Nothing to say when both are recorded.
  assert.equal(n(all()).featureNote, null);
});

test('nms-criteria: it is a priority scale, not a severity scale', () => {
  // The reason the tile exists, so it prints on every result.
  for (const input of [{}, { rigidity: true }, all()]) {
    assert.match(n(input).notSeverityNote, /not a severity scale/);
    assert.match(n(input).notSeverityNote, /does not mean a sicker patient/);
  }
});

test('nms-criteria: below the threshold is not an exclusion', () => {
  const r = n({ exposure: true, hyperthermia: true, rigidity: true });
  assert.equal(r.total, 55);
  assert.equal(r.meets, false);
  assert.equal(r.shortBy, 19);
  assert.match(r.gapNote, /Short of the threshold by 19 points/);
  assert.match(r.gapNote, /does not exclude the syndrome/);
  assert.equal(n(all()).gapNote, null);
  // Singular reads correctly one point out.
  assert.match(n({ exposure: true, hyperthermia: true, rigidity: true, mentalStatus: true, hypermetabolism: true }).gapNote, /by 1 point\./);
});

test('nms-criteria: the negative work-up is a scored item either way', () => {
  assert.match(n({ negativeWorkup: true }).workupNote, /scored item worth 7 points, not a precondition/);
  assert.match(n({}).workupNote, /not recorded here/);
  assert.equal(n({ negativeWorkup: true }).total, 7);
});

test('nms-criteria: exposure and creatine kinase carry their own read-backs', () => {
  assert.match(n({}).exposureNote, /single largest item at 20 points/);
  assert.match(n({}).exposureNote, /agonist withdrawal counts as exposure/);
  assert.equal(n({ exposure: true }).exposureNote, null);
  assert.match(n({ creatineKinase: true }).ckNote, /four times the upper limit of normal/);
  assert.equal(n({}).ckNote, null);
});

test('nms-criteria: the scored items are listed back with their points', () => {
  assert.equal(n({}).presentNote, 'None of the eight items was recorded.');
  assert.equal(n({ exposure: true, rigidity: true }).presentNote, 'Scored: Exposure or withdrawal (20); Rigidity (17).');
});

test('nms-criteria: the documented example', () => {
  const r = n({ exposure: true, hyperthermia: true, rigidity: true, mentalStatus: true, creatineKinase: true, negativeWorkup: true });
  assert.equal(r.total, 85);
  assert.equal(r.meets, true);
  assert.match(r.band, /85 of 100/);
  assert.match(r.band, /threshold of 74/);
});
