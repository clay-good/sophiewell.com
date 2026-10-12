// spec-v1637 tool 4: federal pharmacy record retention dates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csRecordRetention, RECORDS } from '../../lib/cs-record-retention-v1637.js';

test('nine record kinds: two years under 21 CFR, six under the DSCSA', () => {
  assert.equal(RECORDS.length, 9);
  for (const r of RECORDS) {
    const got = csRecordRetention({ record: r.value, countedFrom: '2026-03-15' });
    assert.equal(got.federalUntil, r.value.startsWith('dscsa') ? '2032-03-15' : '2028-03-15', r.value);
    assert.equal(got.rule, r.rule);
  }
});

test('a leap day counts to February 28; a longer period entered governs, a shorter one does not', () => {
  assert.equal(csRecordRetention({ record: 'cs-inventory-or-other-record', countedFrom: '2024-02-29' }).federalUntil, '2026-02-28');
  const longer = csRecordRetention({ record: 'cs-inventory-or-other-record', countedFrom: '2026-03-15', longerYears: 5 });
  assert.deepEqual([longer.federalUntil, longer.keepUntil], ['2028-03-15', '2031-03-15']);
  const shorter = csRecordRetention({ record: 'dscsa-transaction-records', countedFrom: '2026-03-15', longerYears: 3 });
  assert.deepEqual([shorter.keepUntil, shorter.bandLabel], ['2032-03-15', 'Federal minimum, 6 years']);
});

test('what each result says about its own rule', () => {
  assert.match(csRecordRetention({ record: 'executed-form-222', countedFrom: '2026-03-15' }).note, /names no starting date/);
  assert.match(csRecordRetention({ record: 'dscsa-transaction-records', countedFrom: '2026-03-15' }).note, /ended November 27, 2023/);
  assert.match(csRecordRetention({ record: 'refill-transfer-c3-to-c5', countedFrom: '2026-03-15' }).note, /two years from the date of last refill/);
  assert.match(csRecordRetention({ record: 'refill-transfer-c3-to-c5', countedFrom: '2026-03-15' }).note, /No longer period was entered/);
});

test('refusals', () => {
  assert.match(csRecordRetention({}).message, /^Choose the kind of record/);
  assert.match(csRecordRetention({ record: 'refill-transfer-c3-to-c5' }).message, /^Enter the date the period is counted from: the date of the last refill/);
  assert.equal(csRecordRetention({ record: 'executed-form-222', countedFrom: '2026-02-30' }).valid, false);
  assert.equal(csRecordRetention({ record: 'executed-form-222', countedFrom: '2026-03-15', longerYears: -1 }).valid, false);
});
