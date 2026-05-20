import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bloodCompat } from '../../lib/scoring-v4.js';

test('PRBC O- (universal recipient is also universal donor here) -> only O-', () => {
  const r = bloodCompat({ recipient: 'O-', product: 'prbc' });
  assert.deepEqual(r.compatibleDonors, ['O-']);
});

test('PRBC AB+ (universal recipient) -> all 8 types', () => {
  const r = bloodCompat({ recipient: 'AB+', product: 'prbc' });
  assert.equal(r.compatibleDonors.length, 8);
  assert.ok(r.compatibleDonors.includes('O-'));
  assert.ok(r.compatibleDonors.includes('AB+'));
});

test('PRBC A+ -> O-, O+, A-, A+', () => {
  const r = bloodCompat({ recipient: 'A+', product: 'prbc' });
  assert.deepEqual(r.compatibleDonors, ['O-', 'O+', 'A-', 'A+']);
});

test('PRBC B- -> O-, B-', () => {
  const r = bloodCompat({ recipient: 'B-', product: 'prbc' });
  assert.deepEqual(r.compatibleDonors, ['O-', 'B-']);
});

test('FFP recipient AB -> AB only', () => {
  const r = bloodCompat({ recipient: 'AB+', product: 'ffp' });
  assert.deepEqual(r.compatibleDonors, ['AB']);
});

test('FFP recipient O- -> any ABO', () => {
  const r = bloodCompat({ recipient: 'O-', product: 'ffp' });
  assert.deepEqual(r.compatibleDonors, ['O', 'A', 'B', 'AB']);
});

test('FFP recipient A+ -> A or AB', () => {
  const r = bloodCompat({ recipient: 'A+', product: 'plasma' });
  assert.deepEqual(r.compatibleDonors, ['A', 'AB']);
});

test('Platelets returns note text (ABO-identical preferred)', () => {
  const r = bloodCompat({ recipient: 'O+', product: 'platelets' });
  assert.equal(r.product, 'Platelets');
  assert.ok(r.text.includes('ABO-identical preferred'));
});

test('Cryo returns note (any ABO acceptable)', () => {
  const r = bloodCompat({ recipient: 'A-', product: 'cryo' });
  assert.equal(r.product, 'Cryoprecipitate');
});

test('rejects unknown recipient or product', () => {
  assert.throws(() => bloodCompat({ recipient: 'C+', product: 'prbc' }));
  assert.throws(() => bloodCompat({ recipient: 'O+', product: 'whole-blood' }));
});
