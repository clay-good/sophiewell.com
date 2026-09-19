// spec-v1390: hold criteria and court-ordered outpatient treatment. Each tile: meets, does not meet,
// and incomplete -- and the incomplete one names what is missing and prints neither verdict.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyAotKendrasLaw as aot } from '../../lib/ny-aot-kendras-law-v1390.js';
import { caGraveDisabilitySb43 as gd } from '../../lib/ca-grave-disability-sb43-v1390.js';
import { caCareCourtEligibility as care } from '../../lib/ca-care-court-eligibility-v1390.js';
import { txEmergencyDetentionCriteria as txc } from '../../lib/tx-emergency-detention-criteria-v1390.js';

const CLIN = { mentalIllness: 'met', unlikelySurvive: 'met', unlikelyVoluntary: 'met', needToPrevent: 'met', likelyBenefit: 'met' };
const BASE = { asOf: '2026-09-18', age: '34', ...CLIN, historyReviewed: 'yes' };

test('aot: a hospitalization at month 38 fails the 36-month window alone', () => {
  const r = aot({ ...BASE, episodes: '2023-07-18, 2025-01-10' });
  assert.equal(r.verdict, 'does-not-meet');
  assert.match(r.prongs[0], /1 of 2 entered hospitalizations falls on or after September 18, 2023/);
});

test('aot: a 3-month confinement that ended 4 months ago extends the window and it passes', () => {
  const r = aot({ ...BASE, episodes: '2023-07-18, 2025-01-10', confineStart: '2026-02-18', confineEnd: '2026-05-18' });
  assert.equal(r.verdict, 'meets');
  assert.match(r.windowNote, /89 days/);
  assert.match(r.prongs[0], /2 of 2/);
  assert.match(r.band, /no more than one year/);
});

test('aot: a confinement that ended more than six months ago does not extend it', () => {
  const r = aot({ ...BASE, episodes: '2023-07-18, 2025-01-10', confineStart: '2025-10-01', confineEnd: '2026-01-01' });
  assert.equal(r.verdict, 'does-not-meet');
  assert.match(r.windowNote, /more than six months before the petition/);
});

test('aot: violence within 48 months, or an expired order with deterioration since, meets (4)', () => {
  assert.equal(aot({ ...BASE, violence: '2023-01-05' }).verdict, 'meets');
  assert.equal(aot({ ...BASE, violence: '2022-01-05' }).verdict, 'does-not-meet');
  assert.equal(aot({ ...BASE, aotExpired: '2026-06-01', aotSince: 'met' }).verdict, 'meets');
  const open = aot({ ...BASE, aotExpired: '2026-06-01' });
  assert.equal(open.verdict, null);
  assert.match(open.band, /Still needed: \(4\)\(iii\)/);
});

test('aot: an unassessed criterion withholds both verdicts and is named', () => {
  const r = aot({ ...BASE, unlikelyVoluntary: '', episodes: '2025-01-10, 2026-03-01' });
  assert.equal(r.verdict, null);
  assert.equal(r.bandLabel, 'Incomplete');
  assert.match(r.band, /\(5\) unlikely/);
  assert.doesNotMatch(r.band, /Meets|Does not meet/);
  const hist = aot({ ...CLIN, asOf: '2026-09-18', age: '34' });
  assert.match(hist.band, /treatment history/);
});

test('aot: asks for the petition date and age; rejects a date after the petition', () => {
  assert.equal(aot({ ...BASE, asOf: '' }).valid, false);
  assert.equal(aot({ ...BASE, age: '' }).valid, false);
  assert.equal(aot({ ...BASE, episodes: '2027-01-01' }).valid, false);
  assert.equal(aot({ ...BASE, age: '17', episodes: '2025-01-10, 2026-03-01' }).verdict, 'does-not-meet');
});

const NEEDS_ABLE = { food: 'able', clothing: 'able', shelter: 'able', personalSafety: 'able', medicalCare: 'able' };

test('gd: severe SUD alone, unable to secure medical care, meets the amended definition', () => {
  const r = gd({ cause: 'sud-severe', ...NEEDS_ABLE, medicalCare: 'unable', result: 'met' });
  assert.equal(r.verdict, 'meets');
  assert.match(r.band, /necessary medical care/);
});

test('gd: mild or moderate SUD, and intellectual disability alone, do not qualify', () => {
  assert.equal(gd({ cause: 'sud-not-severe', ...NEEDS_ABLE, food: 'unable', result: 'met' }).verdict, 'does-not-meet');
  assert.match(gd({ cause: 'id-alone' }).band, /\(h\)\(3\)/);
});

test('gd: chronic alcoholism counts for 5250, not for a 5150', () => {
  assert.equal(gd({ cause: 'alcohol' }).valid, false);
  assert.equal(gd({ cause: 'alcohol', hold: '5150', food: 'unable', result: 'met' }).verdict, 'does-not-meet');
  assert.equal(gd({ cause: 'alcohol', hold: '5250', food: 'unable', result: 'met' }).verdict, 'meets');
});

test('gd: all five able is does-not-meet; blanks are incomplete, never able', () => {
  assert.equal(gd({ cause: 'mh', ...NEEDS_ABLE }).verdict, 'does-not-meet');
  const r = gd({ cause: 'mh', food: 'able', clothing: 'able' });
  assert.equal(r.verdict, null);
  assert.match(r.band, /shelter, personal safety, necessary medical care/);
  assert.equal(gd({ cause: 'mh', shelter: 'unable' }).verdict, null);
});

const CARE_ALL = { age: '42', diagnosis: 'bipolar-psychotic', serious: 'met', notStabilized: 'met', d1: 'not-met', d2: 'met', leastRestrictive: 'met', likelyBenefit: 'met' };

test('care: bipolar I with psychotic features qualifies after SB 27', () => {
  const r = care(CARE_ALL);
  assert.equal(r.verdict, 'qualifies');
});

test('care: intoxication psychosis and bipolar without psychosis do not; the failing criterion is named', () => {
  const r = care({ ...CARE_ALL, diagnosis: 'intoxication' });
  assert.equal(r.verdict, 'does-not-qualify');
  assert.match(r.band, /\(b\) psychosis related to current intoxication/);
  assert.equal(care({ ...CARE_ALL, diagnosis: 'bipolar-no-psychosis' }).verdict, 'does-not-qualify');
  assert.equal(care({ ...CARE_ALL, d2: 'not-met' }).verdict, 'does-not-qualify');
});

test('care: an unassessed criterion is incomplete', () => {
  const r = care({ ...CARE_ALL, leastRestrictive: '' });
  assert.equal(r.verdict, null);
  assert.match(r.band, /Still needed: \(e\)/);
  assert.equal(care({ ...CARE_ALL, d1: '', d2: '' }).verdict, null);
  assert.equal(care({ ...CARE_ALL, age: '' }).valid, false);
});

const TX_MD = {
  path: 'physician', mentalIllness: 'met', harmRisk: 'not-met', distress: 'met', insight: 'not-met',
  acceptable: 'met', imminent: 'met', leastRestrictive: 'met', describesIllness: 'met', describesRisk: 'met', detailedInfo: 'met',
};

test('txc: the physician statement is documented on the SB 1164 distress ground alone', () => {
  const r = txc(TX_MD);
  assert.equal(r.verdict, 'documented');
  assert.match(r.subItems[1], /\(ii\) severe emotional distress.*: met/);
});

test('txc: a pre-2025 form leaves the new grounds unassessed and the answer undecided', () => {
  const r = txc({ ...TX_MD, harmRisk: 'not-met', distress: '', insight: '' });
  assert.equal(r.verdict, null);
  assert.match(r.band, /Still needed: \(a\)\(2\)\(A\) because of it/);
});

test('txc: officer path needs no-time-for-a-warrant; magistrate needs restraint', () => {
  const off = txc({ path: 'officer', mentalIllness: 'met', harmRisk: 'met', likelyHarm: 'met', noTime: 'not-met' });
  assert.equal(off.verdict, 'not-documented');
  assert.match(off.band, /warrant/);
  const mag = txc({ path: 'magistrate', mentalIllness: 'met', harmRisk: 'met', likelyHarm: 'met', imminent: 'met' });
  assert.equal(mag.verdict, null);
  assert.match(mag.band, /\(b\)\(4\)/);
  assert.equal(txc({}).valid, false);
});
