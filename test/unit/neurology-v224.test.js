// spec-v224: worked examples for the neurology instruments. Point systems
// spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  idMigraine, onls, endIt, engel, ilaeOutcome, salzburg, dhi,
} from '../../lib/neurology-v224.js';

test('id-migraine: positive at 2', () => {
  const r = idMigraine({ nausea: true, photophobia: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
});
test('id-migraine: negative at 1', () => {
  assert.equal(idMigraine({ nausea: true }).abnormal, false);
});

test('onls: arm + leg', () => {
  const r = onls({ arm: '2', leg: '3' });
  assert.equal(r.score, 5);
});

test('end-it: unfavorable at 3', () => {
  const r = endIt({ encephalitis: true, ncse: true, imaging: '1' });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
});
test('end-it: bilateral imaging scores 2', () => {
  assert.equal(endIt({ imaging: '2' }).score, 2);
});

test('engel: class mapping', () => {
  assert.equal(engel({ outcome: '1' }).engelClass, 'I');
  assert.equal(engel({ outcome: '4' }).engelClass, 'IV');
});
test('engel: invalid without outcome', () => { assert.equal(engel({}).valid, false); });

test('ilae: class from frequency', () => {
  assert.equal(ilaeOutcome({ seizureFree: true, seizureDays: 0, baselineDays: 50 }).ilaeClass, 1);
  assert.equal(ilaeOutcome({ seizureDays: 2, baselineDays: 50 }).ilaeClass, 3);
  assert.equal(ilaeOutcome({ seizureDays: 20, baselineDays: 50 }).ilaeClass, 4); // <= 25
  assert.equal(ilaeOutcome({ seizureDays: 200, baselineDays: 50 }).ilaeClass, 6); // > 100
});
test('ilae: invalid without baseline', () => { assert.equal(ilaeOutcome({ seizureDays: 5 }).valid, false); });

test('salzburg: definite with pattern > 2.5/s', () => {
  assert.match(salzburg({ pattern: '2' }).verdict, /Definite/);
});
test('salzburg: possible with EEG-only improvement', () => {
  assert.match(salzburg({ pattern: '1', eegOnlyImprovement: true }).verdict, /Possible/);
});
test('salzburg: not fulfilled', () => {
  assert.equal(salzburg({ pattern: '0' }).abnormal, false);
});

test('dhi: moderate band', () => {
  const r = dhi({ numberYes: 10, numberSometimes: 5 }); // 40+10
  assert.equal(r.score, 50);
  assert.match(r.band, /moderate/);
});
test('dhi: invalid when yes+sometimes > 25', () => {
  assert.equal(dhi({ numberYes: 20, numberSometimes: 10 }).valid, false);
});
