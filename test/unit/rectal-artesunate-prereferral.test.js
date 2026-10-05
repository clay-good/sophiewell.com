// spec-v1551 tool 3: pre-referral rectal artesunate (WHO). The 10.0/10.1 and 20.0/20.1 kg edges, the age-6
// hard stop, each branch that says what to do instead, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rectalArtesunatePrereferral as r } from '../../lib/rectal-artesunate-prereferral-v1551.js';

const base = { age: '3', weight: '14', danger: 'yes', referral: 'over6', imAvailable: 'no' };

test('one suppository up to and including 10 kg, two up to and including 20 kg', () => {
  assert.equal(r({ ...base, weight: '10' }).bandLabel, '1 suppository');
  assert.equal(r({ ...base, weight: '10.1' }).bandLabel, '2 suppositories');
  const at20 = r({ ...base, weight: '20' });
  assert.equal(at20.bandLabel, '2 suppositories');
  assert.match(at20.band, /two 100 mg rectal artesunate suppositories \(200 mg\) once, for 20 kg, then refer immediately/);
});

test('above 20 kg under age 6 is refused, not given a third suppository', () => {
  const x = r({ ...base, weight: '20.1' });
  assert.equal(x.valid, false);
  assert.match(x.message, /none above 20 kg/);
});

test('the over-dose is stated as the source rule, with the achieved mg/kg', () => {
  const x = r({ ...base, weight: '4' });
  assert.equal(x.bandLabel, '1 suppository');
  assert.match(x.notes[0], /That is 25 mg\/kg\. WHO's dose is 10 mg\/kg/);
  assert.match(x.notes.join(' '), /injectable artesunate for at least 24 hours, then a full 3-day ACT/);
  assert.match(x.notes.join(' '), /within 30 minutes, insert a new suppository and hold the buttocks together for 10 minutes/);
});

test('age 6 or over: never rectal, whatever the weight', () => {
  assert.equal(r({ ...base, age: '5.9' }).bandLabel, '2 suppositories');
  const six = r({ ...base, age: '6' });
  assert.equal(six.bandLabel, 'Not for age 6 or over');
  assert.equal(six.abnormal, true);
  assert.equal(r({ ...base, age: '30', weight: '60' }).bandLabel, 'Not for age 6 or over');
});

test('no danger sign, referral under 6 hours, or IM artesunate available: no suppository', () => {
  assert.equal(r({ ...base, danger: 'no' }).bandLabel, 'No danger sign');
  assert.equal(r({ ...base, referral: 'under6' }).bandLabel, 'Refer now');
  assert.equal(r({ ...base, imAvailable: 'yes' }).bandLabel, 'IM artesunate preferred');
  for (const v of [{ danger: 'no' }, { referral: 'under6' }, { imAvailable: 'yes' }]) {
    assert.doesNotMatch(r({ ...base, ...v }).band, /Insert/);
  }
});

test('every blank is refused', () => {
  for (const k of Object.keys(base)) {
    const x = r({ ...base, [k]: '' });
    assert.equal(x.valid, false, k);
  }
  assert.equal(r({ ...base, weight: '0.2' }).valid, false);
  assert.equal(r({ ...base, age: '-1' }).valid, false);
  assert.equal(r().valid, false);
});
