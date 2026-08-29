import test from 'node:test';
import assert from 'node:assert/strict';
import { ipmnFukuoka as i, HIGH_RISK_STIGMATA, WORRISOME_FEATURES } from '../../lib/ipmn-fukuoka-v883.js';

test('ipmn-fukuoka: the published tiers', () => {
  assert.equal(HIGH_RISK_STIGMATA.length, 3);
  assert.equal(WORRISOME_FEATURES.length, 9);
  assert.deepEqual(HIGH_RISK_STIGMATA.map((s) => s.key), ['obstructiveJaundice', 'noduleFiveMmOrMore', 'mainDuctTenMmOrMore']);
});

test('ipmn-fukuoka: any one stigma reaches the high-risk tier, any one feature the middle', () => {
  for (const s of HIGH_RISK_STIGMATA) assert.equal(i({ [s.key]: true }).tier, 'high-risk', s.key);
  for (const w of WORRISOME_FEATURES) assert.equal(i({ [w.key]: true }).tier, 'worrisome', w.key);
  assert.equal(i({}).tier, 'neither');
  assert.equal(i({}).abnormal, false);
});

test('ipmn-fukuoka: the two tiers carry different recommendations', () => {
  // The reason the tile exists.
  assert.match(i({ mainDuctTenMmOrMore: true }).band, /consider resection/);
  assert.match(i({ cystThreeCmOrMore: true }).band, /endoscopic ultrasound/);
  assert.match(i({ cystThreeCmOrMore: true }).band, /does not say to resect/);
  for (const input of [{}, { cystThreeCmOrMore: true }, { mainDuctTenMmOrMore: true }]) {
    assert.match(i(input).tierNote, /not resection/);
  }
});

test('ipmn-fukuoka: size is a worrisome feature and does not reach the high-risk tier', () => {
  const r = i({ cystThreeCmOrMore: true });
  assert.equal(r.tier, 'worrisome');
  assert.match(r.sizeNote, /not a high-risk stigma/);
  assert.match(r.sizeNote, /2017 revision moved size down/);
  // With a stigma present the size note has nothing to correct.
  assert.equal(i({ cystThreeCmOrMore: true, mainDuctTenMmOrMore: true }).sizeNote, null);
});

test('ipmn-fukuoka: the same measurement lands in either tier', () => {
  assert.equal(i({ mainDuctTenMmOrMore: true }).tier, 'high-risk');
  assert.equal(i({ mainDuctFiveToNine: true }).tier, 'worrisome');
  assert.equal(i({ noduleFiveMmOrMore: true }).tier, 'high-risk');
  assert.equal(i({ noduleUnderFiveMm: true }).tier, 'worrisome');
  for (const input of [{}, { noduleUnderFiveMm: true }]) {
    assert.match(i(input).measurementNote, /must be enhancing in both/);
  }
});

test('ipmn-fukuoka: the jaundice has to be attributable to the cyst', () => {
  assert.match(i({ obstructiveJaundice: true }).jaundiceNote, /attributable to the cyst/);
  assert.match(i({ obstructiveJaundice: true }).jaundiceNote, /this tile cannot make/);
  assert.equal(i({ mainDuctTenMmOrMore: true }).jaundiceNote, null);
});

test('ipmn-fukuoka: worrisome features do not add to the high-risk tier', () => {
  const r = i({ mainDuctTenMmOrMore: true, cystThreeCmOrMore: true, pancreatitis: true });
  assert.equal(r.tier, 'high-risk');
  assert.equal(r.worrisome.length, 2);
  assert.match(r.bothTiersNote, /do not add to the high-risk tier/);
  assert.equal(i({ mainDuctTenMmOrMore: true }).bothTiersNote, null);
});

test('ipmn-fukuoka: the documented example', () => {
  const r = i({ cystThreeCmOrMore: true, thickenedWalls: true });
  assert.equal(r.tier, 'worrisome');
  assert.equal(r.worrisome.length, 2);
  assert.equal(r.recordedNote, 'Recorded: 0 high-risk stigmata, 2 worrisome features.');
});
