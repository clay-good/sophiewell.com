// spec-v1397: New York nurse mandated training (child abuse update due 2026-11-17; infection control).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nurseLicenseTrainingRequirements as nlt, NLT_STATES } from '../../lib/nurse-license-training-requirements-v1397.js';

const B = { state: 'NY', license: 'RN', practicingNY: 'yes', infectionDate: '2023-05-10' };

test('acceptance: trained March 2024 sees the 15-minute addendum due by November 17, 2026', () => {
  const r = nlt({ ...B, abuseDate: '2024-03-15' });
  assert.match(r.items[0].text, /15-minute addendum .* due by November 17, 2026/);
});

test('acceptance: trained in 2019 sees the updated 2-hour course due by November 17, 2026', () => {
  const r = nlt({ ...B, abuseDate: '2019-06-01' });
  assert.match(r.items[0].text, /updated two-hour course is due by November 17, 2026/);
});

test('the window edges: 2022-11-01 and 2025-08-31 are addendum; 2025-09-01 is met', () => {
  assert.match(nlt({ ...B, abuseDate: '2022-11-01' }).items[0].text, /addendum/);
  assert.match(nlt({ ...B, abuseDate: '2022-10-31' }).items[0].text, /two-hour course/);
  assert.match(nlt({ ...B, abuseDate: '2025-08-31' }).items[0].text, /addendum/);
  assert.equal(nlt({ ...B, abuseDate: '2025-09-01' }).items[0].status, 'met');
});

test('never trained, LPN, and exemption', () => {
  assert.equal(nlt({ ...B }).items[0].status, 'due');
  assert.equal(nlt({ ...B, license: 'LPN' }).items[0].status, 'not-listed');
  assert.equal(nlt({ ...B, abuseExempt: 'yes' }).items[0].status, 'exempt');
});

test('infection control every four years, deferred when not practicing in New York', () => {
  assert.equal(nlt({ ...B, abuseDate: '2025-10-01' }).items[1].due, '2027-05-10');
  assert.equal(nlt({ ...B, practicingNY: 'no' }).items[1].status, 'deferred');
});

test('only New York is offered until another state is read', () => {
  assert.deepEqual(NLT_STATES.map((s) => s.value), ['NY', 'NJ', 'CA', 'TX']);
  assert.equal(nlt({ ...B, state: 'TX' }).valid, false);
});

// --- California NP 103/104 and Texas prescriptive authority agreements -------
import { caNp103104Tracker as np } from '../../lib/ca-np-103-104-tracker-v1397.js';
import { txPrescriptiveAuthorityAgreement as paa } from '../../lib/tx-prescriptive-authority-agreement-v1397.js';

const NP = { asOf: '2026-09-18', boardExam: 'yes', nationalCert: 'yes', education: 'yes', rnActive: 'yes', degree: 'yes' };

test('np: 103 after three full-time years or 4,600 hours; 104 three years past that', () => {
  const r = np({ ...NP, ttpStart: '2022-07-01' });
  assert.equal(r.status103, 'eligible');
  assert.equal(r.status104, 'pending');
  assert.match(r.band, /2028-07-01/);
  assert.equal(np({ ...NP, ttpHours: '4600' }).status103, 'eligible');
  assert.equal(np({ ...NP, ttpHours: '4599' }).status103, 'pending');
  assert.equal(np({ ...NP, ttpStart: '2019-01-01' }).status104, 'eligible');
});

test('np: a missing requirement blocks, an unanswered one is not a yes', () => {
  assert.equal(np({ ...NP, ttpStart: '2019-01-01', boardExam: 'no' }).status103, 'not-eligible');
  assert.equal(np({ ...NP, ttpStart: '2019-01-01', boardExam: '' }).status103, 'unassessed');
  assert.equal(np({ ...NP, ttpStart: '2019-01-01', degree: 'no' }).status104, 'not-eligible');
});

const ALL = { fte: '5', exempt: 'no', signed: 'yes', parties: 'yes', practice: 'yes', drugs: 'yes', referral: 'yes', emergencies: 'yes', communication: 'yes', alternates: 'yes', qaPlan: 'yes' };

test('paa: seven FTE cap, lifted for underserved or hospital facility-based practice', () => {
  assert.equal(paa(ALL).verdict, 'ok');
  assert.equal(paa({ ...ALL, fte: '8' }).verdict, 'problems');
  assert.equal(paa({ ...ALL, fte: '8', exempt: 'yes' }).verdict, 'ok');
});

test('paa: missing and unanswered elements, and the monthly meeting', () => {
  assert.equal(paa({ ...ALL, drugs: 'no' }).verdict, 'problems');
  assert.equal(paa({ ...ALL, drugs: '' }).verdict, 'unassessed');
  assert.equal(paa({ ...ALL, lastMeeting: '2026-07-01', asOf: '2026-09-18' }).verdict, 'problems');
  assert.equal(paa({ ...ALL, lastMeeting: '2026-09-01', asOf: '2026-09-18' }).verdict, 'ok');
});

test('nlt: New Jersey 30 hours with an opioid hour; California 30 hours; LVNs not covered', () => {
  assert.equal(nlt({ state: 'NJ', license: 'RN', hours: '30', njOpioid: 'yes' }).abnormal, false);
  assert.match(nlt({ state: 'NJ', license: 'RN', hours: '30', njOpioid: 'no' }).band, /opioid/);
  assert.match(nlt({ state: 'CA', license: 'RN', hours: '24' }).band, /6 more/);
  assert.equal(nlt({ state: 'CA', license: 'LPN', hours: '30' }).valid, false);
  assert.equal(nlt({ state: 'NJ', license: 'RN', hours: '', njOpioid: 'yes' }).valid, false);
});

test('nlt: Texas 20 hours or certification, and the targeted items', () => {
  const T = { state: 'TX', license: 'NP', hours: '20', txJuris: 'done', txOlder: 'na', txForensic: 'na', txTrafficking: 'done', txPharm: 'done' };
  assert.equal(nlt(T).abnormal, false);
  assert.match(nlt({ ...T, txForensic: 'not-done' }).band, /forensic evidence collection/);
  assert.equal(nlt({ ...T, hours: '5', txCert: 'yes' }).abnormal, false);
  assert.equal(nlt({ ...T, txJuris: 'na' }).valid, false);
});
