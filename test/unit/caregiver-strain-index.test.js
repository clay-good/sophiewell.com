// spec-v182 §2.4: CSI, 13 yes/no -> 0-13, >= 7 high strain.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caregiverStrainIndex as csi } from '../../lib/ltcga-v182.js';

const KEYS = ['sleep', 'inconvenient', 'physical', 'confining', 'family', 'plans', 'otherDemands', 'emotional', 'upsetting', 'changed', 'work', 'financial', 'overwhelmed'];
function build(yesCount) { const o = {}; KEYS.forEach((k, i) => { o[k] = i < yesCount ? 'yes' : 'no'; }); return o; }

test('CSI counts yes answers', () => {
  assert.equal(csi(build(0)).total, 0);
  assert.equal(csi(build(13)).total, 13);
});

test('CSI 6 -> not high, 7 -> high (the >= 7 flip)', () => {
  assert.equal(csi(build(6)).high, false);
  assert.equal(csi(build(7)).high, true);
  assert.match(csi(build(7)).band, /high level of caregiver strain/);
});

test('CSI guards blank', () => {
  const o = build(7); delete o.sleep;
  assert.equal(csi(o).valid, false);
  assert.equal(csi({}).valid, false);
});
