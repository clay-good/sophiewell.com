// spec-v1555 tool 4: antivenom repeat criteria under SEARO, AFRO and India, the India caps, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { antivenomRepeat as r } from '../../lib/antivenom-repeat-v1555.js';

const base = { protocol: 'searo', dose: '10', wbct: 'clots', bleeding: 'no', neuro: 'none', ventilated: 'no', hours: '6' };

test('SEARO clotting, bleeding and neurotoxic rules', () => {
  assert.equal(r({ ...base, wbct: 'noclot' }).bandLabel, 'Repeat now');
  assert.equal(r({ ...base, wbct: 'noclot', hours: '5.9' }).bandLabel, 'Re-test at 6 hours');
  assert.equal(r({ ...base, bleeding: 'yes', hours: '1' }).bandLabel, 'Repeat now');
  assert.equal(r({ ...base, bleeding: 'yes', hours: '0.5' }).bandLabel, 'Repeat at 1-2 hours');
  assert.equal(r({ ...base, neuro: 'worse', hours: '1' }).bandLabel, 'Repeat now');
  assert.equal(r({ ...base, neuro: 'same', hours: '1' }).bandLabel, 'No repeat criterion met', 'SEARO repeats only for worse signs');
  assert.equal(r({ ...base, neuro: 'worse', ventilated: 'yes' }).bandLabel, 'No repeat criterion met');
  assert.match(r({ ...base, wbct: 'noclot' }).band, /10 vials, the same/);
});

test('a 20WBCT not done is never read as clotted', () => {
  const x = r({ ...base, wbct: 'notdone' });
  assert.equal(x.bandLabel, 'Do the 20WBCT');
  assert.equal(x.abnormal, true);
});

test('AFRO has only the clotting rule', () => {
  assert.equal(r({ ...base, protocol: 'afro', bleeding: 'yes', hours: '2' }).bandLabel, 'No repeat criterion met');
  assert.match(r({ ...base, protocol: 'afro', wbct: 'noclot' }).band, /every 6 hours/);
});

test('India regimens and caps', () => {
  const ind = { ...base, protocol: 'india', dose: '' };
  assert.match(r({ ...ind, regimen: 'low-rv', wbct: 'noclot' }).band, /^Repeat now: 2 vials/);
  assert.match(r({ ...ind, regimen: 'high', wbct: 'noclot' }).band, /^Repeat now: 6 vials/);
  assert.ok(r({ ...ind, regimen: 'low-ssv', wbct: 'noclot' }).notes.some((n) => /5 vials/.test(n)), 'the 6 vs 5 conflict is printed');
  assert.match(r({ ...ind, regimen: 'neuro', neuro: 'same', hours: '1', given: '10' }).band, /^Repeat now: 10 vials/);
  assert.equal(r({ ...ind, regimen: 'neuro', neuro: 'worse', hours: '1', given: '20' }).bandLabel, 'Maximum reached');
  assert.equal(r({ ...ind, regimen: 'neuro', neuro: 'worse', hours: '1', given: '15' }).bandLabel, 'Near the maximum');
  assert.ok(r({ ...ind, regimen: 'low-rv', wbct: 'noclot', given: '30' }).notes.some((n) => /reconsider/.test(n)));
  assert.ok(r({ ...ind, regimen: 'low-rv', wbct: 'noclot' }).notes.some((n) => /not entered/.test(n)));
  assert.equal(r({ ...ind, regimen: 'neuro', wbct: 'noclot' }).valid, false);
});

test('refusals', () => {
  assert.equal(r({ ...base, protocol: '' }).valid, false);
  assert.equal(r({ ...base, dose: '' }).valid, false, 'no invented initial dose outside India');
  assert.equal(r({ ...base, protocol: 'india', regimen: '' }).valid, false);
  assert.equal(r({ ...base, wbct: '' }).valid, false);
  assert.equal(r({ ...base, hours: '' }).valid, false);
  assert.equal(r({ ...base, neuro: '' }).valid, false);
});
