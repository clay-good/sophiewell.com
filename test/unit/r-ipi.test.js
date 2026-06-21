// spec-v135 2.1: Revised IPI for DLBCL (Sehn LH, et al, Blood 2007;109:1857-1861).
// Five IPI factors collapsed to three groups: Very good = 0, Good = 1-2, Poor = 3-5.
// The boundary tests pin the 0/1 (very-good->good) and 2/3 (good->poor) edges.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rIpi } from '../../lib/lymphoma-v135.js';

const none = { ageOver60: 'no', ldhHigh: 'no', stageAdvanced: 'no', extranodal2: 'no', ecog2: 'no' };

test('zero factors is the Very good group', () => {
  const r = rIpi(none);
  assert.equal(r.count, 0);
  assert.equal(r.group, 'Very good');
  assert.equal(r.abnormal, false);
});

test('one factor flips Very good -> Good (boundary)', () => {
  const r = rIpi({ ...none, ageOver60: 'yes' });
  assert.equal(r.count, 1);
  assert.equal(r.group, 'Good');
});

test('two factors stay Good, three flip to Poor (boundary)', () => {
  assert.equal(rIpi({ ...none, ageOver60: 'yes', ldhHigh: 'yes' }).group, 'Good');
  const poor = rIpi({ ...none, ageOver60: 'yes', ldhHigh: 'yes', stageAdvanced: 'yes' });
  assert.equal(poor.count, 3);
  assert.equal(poor.group, 'Poor');
});

test('all five factors is Poor, count 5', () => {
  const r = rIpi({ ageOver60: 'yes', ldhHigh: 'yes', stageAdvanced: 'yes', extranodal2: 'yes', ecog2: 'yes' });
  assert.equal(r.count, 5);
  assert.equal(r.group, 'Poor');
});

test('any unanswered factor surfaces the fallback', () => {
  assert.equal(rIpi({}).valid, false);
  assert.equal(rIpi({ ageOver60: 'yes' }).valid, false);
});
