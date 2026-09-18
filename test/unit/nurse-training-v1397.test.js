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
  assert.deepEqual(NLT_STATES.map((s) => s.value), ['NY']);
  assert.equal(nlt({ ...B, state: 'TX' }).valid, false);
});
