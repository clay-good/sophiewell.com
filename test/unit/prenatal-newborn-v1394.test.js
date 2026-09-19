// spec-v1394: prenatal and newborn -- infection screening schedule, newborn screen, levels of care.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prenatalInfectionScreeningSchedule as pns } from '../../lib/prenatal-infection-screening-schedule-v1394.js';
import { nysNewbornScreenPlanner as nbs } from '../../lib/nys-newborn-screen-planner-v1394.js';
import { txNeonatalLevelMatch as nlc } from '../../lib/tx-neonatal-level-match-v1394.js';
import { txMaternalLevelReference as mlc } from '../../lib/tx-maternal-level-reference-v1394.js';
import { caSafeSurrender as ss } from '../../lib/ca-safe-surrender-v1394.js';

test('pns: TX at 36 weeks, no third-trimester HIV -- expedited HIV and the 2-hour newborn sample', () => {
  const r = pns({ state: 'TX', setting: 'delivery', ga: '36', syph3: 'yes', hiv3: 'no' });
  assert.match(r.band, /less than 6 hours/);
  assert.match(r.notes.join(' '), /less than 2 hours after birth/);
});

test('pns: CA ED at 20 weeks with no syphilis result -- due before discharge', () => {
  const r = pns({ state: 'CA', setting: 'ed', ga: '20', syphFirst: 'no', syph3: 'no' });
  assert.equal(r.bandLabel, 'Due before discharge');
  assert.match(r.band, /before discharge/);
});

test('pns: a blank result is asked for, never read as none', () => {
  const r = pns({ state: 'TX', setting: 'prenatal', ga: '30', syphFirst: 'yes', hivFirst: 'yes' });
  assert.equal(r.valid, false);
  assert.match(r.message, /hepatitis B/);
  assert.equal(pns({ state: 'TX', setting: 'prenatal', ga: '' }).valid, false);
});

test('pns: TX before 28 weeks points to the third-trimester tests', () => {
  const r = pns({ state: 'TX', setting: 'prenatal', ga: '20', syphFirst: 'yes', hivFirst: 'yes', hbv: 'yes' });
  assert.equal(r.bandLabel, 'Nothing due now');
  assert.match(r.next[0], /8 weeks from now/);
});

test('nbs: a 1,450 g NICU infant transfused before any screen gets specimens 1-3 and the 4-month one', () => {
  const r = nbs({ birth: '2026-09-10T08:00', weightG: '1450', nicu: 'yes', transfusionFirst: '2026-09-11T10:00', first: '2026-09-11T12:00' });
  assert.equal(r.specimens.length, 3);
  assert.match(r.extra[0], /4 months after the final transfusion \(Mon Jan 11, 2027/);
});

test('nbs: a specimen drawn before the transfusion removes the post-transfusion pair', () => {
  const r = nbs({ birth: '2026-09-10T08:00', weightG: '1450', nicu: 'yes', first: '2026-09-10T09:00', transfusionFirst: '2026-09-11T10:00' });
  assert.match(r.extra[0], /not required/);
});

test('nbs: early discharge needs a second specimen at 24 to 120 hours', () => {
  const r = nbs({ birth: '2026-09-10T08:00', weightG: '3300', nicu: 'no', discharge: '2026-09-10T20:00' });
  assert.equal(r.specimens.length, 2);
  assert.match(r.specimens[1], /Between 24 and 120 hours/);
});

test('nlc: CPAP at 33 weeks is Level II; 30 weeks and 1,400 g is Level III with the 75-mile note', () => {
  assert.equal(nlc({ ga: '33', weightG: '1800', resp: 'cpap', illness: 'routine' }).level, 'II');
  const r = nlc({ ga: '30', weightG: '1400', resp: 'vent-short', illness: 'moderate', far: 'yes' });
  assert.equal(r.level, 'III');
  assert.match(r.exception, /75 miles/);
  assert.equal(nlc({ ga: '39', weightG: '3400', resp: 'none', illness: 'routine' }).level, 'I');
  assert.equal(nlc({ ga: '39', weightG: '3400', resp: 'none', illness: 'complex' }).level, 'IV');
});

test('mlc: high risk is Level III with an OB/GYN on site', () => {
  const r = mlc({ risk: 'high' });
  assert.equal(r.level, 'III');
  assert.match(r.needs.join(' '), /on site at all times/);
  assert.equal(mlc({}).valid, false);
});

test('ss: 72 hours or younger; CPS within 48 hours; 14-day reclaim', () => {
  const r = ss({ ageHours: '30', surrendered: '2026-09-18T03:00', bracelet: 'yes' });
  assert.equal(r.eligible, true);
  assert.equal(r.cpsBy, '2026-09-20T03:00');
  assert.match(r.steps.join(' '), /Friday, October 2, 2026/);
  assert.equal(ss({ ageHours: '80', surrendered: '2026-09-18T03:00' }).eligible, false);
  assert.equal(ss({ ageHours: '', surrendered: '2026-09-18T03:00' }).valid, false);
});

// spec-v1394: New York -- syphilis 28 to 32 weeks and at delivery; HIV expedited to 12 hours; HBsAg 24 to 48.
test('prenatal: NY delivery with no HIV or hepatitis B result -- 12-hour HIV, 24-to-48-hour HBsAg, syphilis always', () => {
  const r = pns({ state: 'NY', setting: 'delivery', ga: '39', hivFirst: 'no', hbv: 'no' });
  assert.match(r.band, /within 12 hours/);
  assert.match(r.band, /within 24 hours of admission and never later than 48/);
  assert.match(r.band, /Syphilis at delivery, for every patient/);
  const ok = pns({ state: 'NY', setting: 'delivery', ga: '39', hivFirst: 'yes', hbv: 'yes' });
  assert.doesNotMatch(ok.band, /12 hours/);
  assert.equal(pns({ state: 'NY', setting: 'delivery', ga: '39', hbv: 'yes' }).valid, false);
});

test('prenatal: NY third-trimester syphilis window is 28 to 32 weeks', () => {
  const base = { state: 'NY', setting: 'prenatal', syphFirst: 'yes', hivFirst: 'yes', hbv: 'yes' };
  assert.match(pns({ ...base, ga: '30', syph3: 'no' }).band, /no later than 32/);
  assert.match(pns({ ...base, ga: '34', syph3: 'no' }).band, /past its 32-week limit/);
  assert.match(pns({ ...base, ga: '20' }).next.join(' '), /8 weeks from now/);
  assert.match(pns({ ...base, ga: '20', hbv: 'no' }).band, /69-3\.2/);
});
