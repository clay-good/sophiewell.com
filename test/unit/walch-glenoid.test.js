// spec-v740: Walch classification of glenoid morphology.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { walchGlenoid } from '../../lib/walch-glenoid-v740.js';

const base = { subluxation: 'centered', concavity: 'single', retroversion: '5', erosion: 'minor' };

test('centered -> A1 (minor) / A2 (major)', () => {
  assert.equal(walchGlenoid({ ...base, erosion: 'minor' }).type, 'A1');
  assert.equal(walchGlenoid({ ...base, erosion: 'major' }).type, 'A2');
  assert.equal(walchGlenoid({ ...base }).abnormal, false);
});

test('posterior + biconcave -> B2', () => {
  const r = walchGlenoid({ subluxation: 'posterior', concavity: 'biconcave', retroversion: '23', erosion: 'minor' });
  assert.equal(r.type, 'B2');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Walch type B2 /);
});

test('posterior monoconcave: retroversion gates B3 vs B1', () => {
  const b3 = walchGlenoid({ subluxation: 'posterior', concavity: 'single', retroversion: '18', erosion: 'minor' });
  assert.equal(b3.type, 'B3');
  const b1 = walchGlenoid({ subluxation: 'posterior', concavity: 'single', retroversion: '10', erosion: 'minor' });
  assert.equal(b1.type, 'B1');
  assert.equal(b1.abnormal, false);
});

test('dysplastic retroversion > 25 -> C', () => {
  const r = walchGlenoid({ subluxation: 'posterior', concavity: 'single', retroversion: '30', erosion: 'minor', dysplastic: true });
  assert.equal(r.type, 'C');
  assert.equal(r.abnormal, true);
});

test('anterior subluxation or anteversion -> D', () => {
  assert.equal(walchGlenoid({ subluxation: 'anterior', concavity: 'single', retroversion: '5', erosion: 'minor' }).type, 'D');
  assert.equal(walchGlenoid({ subluxation: 'centered', concavity: 'single', retroversion: '-3', erosion: 'minor' }).type, 'D');
});

test('D takes precedence over C when anteverted', () => {
  // anteversion wins even if flagged dysplastic
  assert.equal(walchGlenoid({ subluxation: 'centered', concavity: 'single', retroversion: '-5', erosion: 'major', dysplastic: true }).type, 'D');
});

test('validation: each field required, retroversion must be numeric', () => {
  assert.equal(walchGlenoid({}).valid, false);
  assert.equal(walchGlenoid({}).field, 'subluxation');
  assert.equal(walchGlenoid({ subluxation: 'centered' }).field, 'retroversion');
  assert.equal(walchGlenoid({ subluxation: 'centered', retroversion: 'x', concavity: 'single', erosion: 'minor' }).field, 'retroversion');
  assert.equal(walchGlenoid({ subluxation: 'centered', retroversion: '5', erosion: 'minor' }).field, 'concavity');
});
