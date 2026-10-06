// spec-v1560 tool 5: ICMR scrub typhus. The case tiers, the eschar rule, and the regimens by weight.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrubTyphusIcmr as r } from '../../lib/scrub-typhus-icmr-v1560.js';

test('case tiers and the eschar rule', () => {
  assert.equal(r({ feverDays: '6', weight: '60' }).bandLabel, 'Suspected');
  assert.equal(r({ feverDays: '3', weight: '60', eschar: 'yes' }).bandLabel, 'Suspected');
  assert.equal(r({ feverDays: '3', weight: '60', eschar: 'no' }).bandLabel, 'Not suspected');
  assert.equal(r({ feverDays: '3', weight: '60' }).bandLabel, 'Not decided');
  assert.equal(r({ feverDays: '6', weight: '60', wf: 'pos', igm: 'pos' }).bandLabel, 'Probable');
  assert.equal(r({ feverDays: '6', weight: '60', wf: 'pos' }).bandLabel, 'Suspected');
  assert.equal(r({ feverDays: '6', weight: '60', confirm: 'pos' }).bandLabel, 'Confirmed');
});

test('regimens', () => {
  assert.match(r({ feverDays: '6', weight: '60' }).band, /Doxycycline 100 mg twice daily for 7 days/);
  assert.match(r({ feverDays: '6', weight: '20' }).band, /45 mg twice daily.*200 mg once daily for 5 days/);
  assert.match(r({ feverDays: '6', weight: '45' }).band, /4\.5 mg\/kg/);
  assert.match(r({ feverDays: '6', weight: '60', pregnant: 'yes' }).band, /Pregnancy: azithromycin 500 mg/);
  assert.match(r({ feverDays: '6', weight: '60', complicated: 'yes' }).band, /IV doxycycline/);
});

test('refusals', () => {
  assert.equal(r({ weight: '60' }).valid, false);
  assert.equal(r({ feverDays: '6' }).valid, false);
});
