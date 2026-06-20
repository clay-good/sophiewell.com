// spec-v134 2.6: DIPSS-Plus (Gangat N, et al, J Clin Oncol 2011;29:392-397).
// Carries the DIPSS group forward (int-1 = 1, int-2 = 2, high = 3; low = 0),
// then platelet < 100 = 1, transfusion need = 1, unfavorable karyotype = 1.
// Total 0-6 -> low (0) / int-1 (1) / int-2 (2-3) / high (4-6). The group
// carry-forward and the boundaries are pinned.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dipssPlusMf } from '../../lib/onc-v134.js';

test('DIPSS low + no add-on features -> total 0, Low', () => {
  const r = dipssPlusMf({ dipssGroup: 'low', platelet: 250, transfusion: 'no', karyotype: 'no' });
  assert.equal(r.total, 0);
  assert.equal(r.group, 'Low');
});

test('the DIPSS group is carried forward as 0/1/2/3 points', () => {
  assert.equal(dipssPlusMf({ dipssGroup: 'int-1', platelet: 250, transfusion: 'no', karyotype: 'no' }).total, 1);
  assert.equal(dipssPlusMf({ dipssGroup: 'int-2', platelet: 250, transfusion: 'no', karyotype: 'no' }).total, 2);
  assert.equal(dipssPlusMf({ dipssGroup: 'high', platelet: 250, transfusion: 'no', karyotype: 'no' }).total, 3);
});

test('group boundaries: 0 Low, 1 int-1, 2-3 int-2, 4-6 high', () => {
  assert.equal(dipssPlusMf({ dipssGroup: 'int-1', platelet: 250, transfusion: 'no', karyotype: 'no' }).group, 'Intermediate-1');
  assert.equal(dipssPlusMf({ dipssGroup: 'int-1', platelet: 90, transfusion: 'no', karyotype: 'no' }).group, 'Intermediate-2'); // 2
  assert.equal(dipssPlusMf({ dipssGroup: 'high', platelet: 90, transfusion: 'no', karyotype: 'no' }).group, 'High'); // 4
});

test('platelet < 100 is strict', () => {
  assert.equal(dipssPlusMf({ dipssGroup: 'low', platelet: 100, transfusion: 'no', karyotype: 'no' }).total, 0);
  assert.equal(dipssPlusMf({ dipssGroup: 'low', platelet: 99, transfusion: 'no', karyotype: 'no' }).total, 1);
});

test('all features on a high DIPSS group reach the 6 maximum', () => {
  const r = dipssPlusMf({ dipssGroup: 'high', platelet: 50, transfusion: 'yes', karyotype: 'yes' });
  assert.equal(r.total, 6);
  assert.equal(r.group, 'High');
});

test('an unselected DIPSS group or blank flag surfaces the fallback', () => {
  assert.equal(dipssPlusMf({ dipssGroup: '', platelet: 90, transfusion: 'no', karyotype: 'no' }).valid, false);
  assert.equal(dipssPlusMf({ dipssGroup: 'low', platelet: 90 }).valid, false);
});
