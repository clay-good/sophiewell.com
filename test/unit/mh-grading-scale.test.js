import test from 'node:test';
import assert from 'node:assert/strict';
import { mhGradingScale as mh, INDICATORS } from '../../lib/mh-grading-scale-v860.js';

test('mh: the six ranks and their raw-score boundaries', () => {
  // Reachable raw scores are built from published indicators only.
  assert.equal(mh({}).rank, 1);
  assert.equal(mh({ sinusTach: true }).raw, 3);
  assert.equal(mh({ sinusTach: true }).rank, 2);
  assert.equal(mh({ tempHigh: true }).raw, 10);
  assert.equal(mh({ tempHigh: true }).rank, 3);
  assert.equal(mh({ tempRapid: true, colaUrine: true }).raw, 25);
  assert.equal(mh({ tempRapid: true, colaUrine: true }).rank, 4);
  assert.equal(mh({ tempRapid: true, colaUrine: true, etco2Controlled: true, lowPh: true }).raw, 50);
  assert.equal(mh({ tempRapid: true, colaUrine: true, etco2Controlled: true, lowPh: true }).rank, 6);
});

test('mh: only the highest indicator in each process counts', () => {
  // The over-call this tile exists to prevent.
  const all = { ckSux: true, colaUrine: true, myoglobinUrine: true, myoglobinSerum: true, potassium: true };
  const r = mh(all);
  assert.equal(r.raw, 15);
  assert.equal(r.naive, 38);
  assert.match(r.doubleCountNote, /muscle breakdown/);
  assert.match(r.doubleCountNote, /38 rather than 15/);
});

test('mh: masseter spasm does not stack with generalized rigidity', () => {
  const r = mh({ rigidityGeneralized: true, masseterSpasm: true });
  assert.equal(r.raw, 15);
  assert.match(r.masseterNote, /do not add/);
  assert.equal(mh({ masseterSpasm: true }).masseterNote, null);
});

test('mh: every process contributes at most once', () => {
  const everything = Object.fromEntries(INDICATORS.map((i) => [i.key, true]));
  const r = mh(everything);
  // 15 rigidity + 15 breakdown + 15 acidosis + 15 temperature + 3 cardiac + 15 family + 10 other.
  assert.equal(r.raw, 88);
  assert.equal(r.counted.length, 7);
  assert.equal(r.rank, 6);
});

test('mh: the scale is never presented as a treatment trigger', () => {
  assert.match(mh({}).notATriggerNote, /not a treatment trigger/);
  assert.match(mh({ tempRapid: true }).notATriggerNote, /clinical suspicion/);
});

test('mh: a missing temperature indicator raises the under-call, not silence', () => {
  assert.match(mh({ etco2Controlled: true }).feverNote, /neither required nor early/);
  assert.equal(mh({ etco2Controlled: true, tempRapid: true }).feverNote, null);
  // Nothing entered at all is its own message rather than the fever one.
  assert.equal(mh({}).feverNote, null);
  assert.match(mh({}).emptyNote, /not that malignant hyperthermia was excluded/);
});

test('mh: string truthy values from the DOM behave like checkboxes', () => {
  assert.equal(mh({ tempRapid: 'true' }).raw, 15);
  assert.equal(mh({ tempRapid: 'yes' }).raw, 15);
  assert.equal(mh({ tempRapid: 'false' }).raw, 0);
  assert.equal(mh({ tempRapid: '' }).raw, 0);
});

test('mh: the indicator table matches the published point values', () => {
  assert.equal(INDICATORS.length, 24);
  const total = INDICATORS.reduce((a, i) => a + i.points, 0);
  assert.equal(total, 254);
  assert.ok(INDICATORS.every((i) => i.points > 0 && i.text && i.process));
});
