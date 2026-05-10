// Tests for the HIPAA breach-notification deadline calculator.
// Spec citations: 45 CFR §§164.404, 164.406, 164.408.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breachNotificationDeadlines } from '../../lib/regulatory.js';

test('breach: small breach (<500) uses individual + HHS-annual deadlines', () => {
  const r = breachNotificationDeadlines({ discoveryDate: '2026-03-15', affectedIndividuals: 10 });
  assert.equal(r.discoveryDate, '2026-03-15');
  // 60 days after 2026-03-15 = 2026-05-14.
  assert.equal(r.individualNoticeDeadline, '2026-05-14');
  assert.equal(r.mediaNoticeDeadline, null);
  // Annual HHS log due 60 days after 2026-12-31 = 2027-03-01 (2027 is not a leap year).
  assert.equal(r.hhsNoticeDeadline, '2027-03-01');
  assert.ok(r.recipients.some((s) => /annual log/.test(s)));
});

test('breach: >=500 triggers media + contemporaneous HHS notice', () => {
  const r = breachNotificationDeadlines({ discoveryDate: '2026-01-01', affectedIndividuals: 500 });
  // 60 days after 2026-01-01 = 2026-03-02.
  assert.equal(r.individualNoticeDeadline, '2026-03-02');
  assert.equal(r.mediaNoticeDeadline, '2026-03-02');
  assert.equal(r.hhsNoticeDeadline, '2026-03-02');
  assert.ok(r.recipients.some((s) => /media outlets/.test(s)));
});

test('breach: leap-year boundary is handled', () => {
  // 60 days after 2024-01-01 = 2024-03-01 (leap year).
  const r = breachNotificationDeadlines({ discoveryDate: '2024-01-01', affectedIndividuals: 1 });
  assert.equal(r.individualNoticeDeadline, '2024-03-01');
});

test('breach: rejects malformed inputs', () => {
  assert.throws(() => breachNotificationDeadlines({ discoveryDate: '2026/03/15', affectedIndividuals: 1 }), /YYYY-MM-DD/);
  assert.throws(() => breachNotificationDeadlines({ discoveryDate: '2026-02-30', affectedIndividuals: 1 }), /real date/);
  assert.throws(() => breachNotificationDeadlines({ discoveryDate: '2026-01-01', affectedIndividuals: -1 }), /non-negative/);
  assert.throws(() => breachNotificationDeadlines({ discoveryDate: '2026-01-01', affectedIndividuals: 1.5 }), /non-negative integer/);
});

test('breach: cites the controlling regulation', () => {
  const r = breachNotificationDeadlines({ discoveryDate: '2026-01-01', affectedIndividuals: 1 });
  assert.match(r.citation, /164\.40[468]/);
});
