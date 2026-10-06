// spec-v1554 tool 6: infant prophylaxis risk group and the ARV26 Table 5 nevirapine band snapshot (D4).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { infantArvProphylaxis as r, nvpProphylaxis as nvp } from '../../lib/infant-arv-prophylaxis-v1554.js';

const low = { art: 'ge4', vl: 'le1000', incident: 'no', postpartum: 'no', breastfeeding: 'yes', age: '0' };

test('nevirapine prophylaxis band snapshot (ARV26 Table 5, corrected June 2026)', () => {
  assert.deepEqual([0, 3.9, 4, 5.9, 6, 25.9, 26, 38.9, 39, 103.9].map((w) => nvp(w).match(/([\d.]+) mL/)[1]),
    ['1.5', '1.5', '1.5', '1.5', '2', '2', '3', '3', '4', '4']);
  assert.match(nvp(40), /one 50 mg dispersible tablet/);
  assert.match(nvp(30), /half a 50 mg/);
  assert.equal(nvp(104), null);
  assert.ok([0, 10, 50].every((w) => /prophylaxis/.test(nvp(w))));
});

test('risk groups', () => {
  assert.equal(r(low).bandLabel, 'Not high risk: nevirapine');
  assert.equal(r({ ...low, art: 'lt4' }).bandLabel, 'High risk: 3 drugs');
  assert.equal(r({ ...low, art: 'none' }).bandLabel, 'High risk: 3 drugs');
  assert.equal(r({ ...low, vl: 'gt1000' }).bandLabel, 'High risk: 3 drugs');
  assert.equal(r({ ...low, incident: 'yes' }).bandLabel, 'High risk: 3 drugs');
  assert.equal(r({ ...low, postpartum: 'yes' }).bandLabel, 'High risk: 3 drugs');
  assert.ok(r({ ...low, vl: '' }).notes.some((n) => /not entered/.test(n)));
  assert.ok(r({ ...low, art: 'none' }).notes.some((n) => /continue single-drug prophylaxis/.test(n)));
});

test('alternatives by weight and refusals', () => {
  assert.ok(r({ ...low, age: '8', weight: '5' }).notes.some((n) => /dolutegravir 10 mg dispersible 0\.5 tablet once daily, or lamivudine 10 mg\/mL 1\.5 mL twice daily/.test(n)));
  assert.ok(r({ ...low, age: '30', weight: '16' }).notes.some((n) => /2\.5 tablets once daily\./.test(n)));
  assert.equal(r({ ...low, art: '' }).valid, false);
  assert.equal(r({ ...low, age: '' }).valid, false);
});
