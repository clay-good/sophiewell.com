// spec-v1605: the curated prior authorization metrics table and its market summary.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkRows, summarize, moduleText, quantile, SEED } from '../../scripts/build-pa-metrics-market.mjs';
import { PA_METRICS_MARKET } from '../../lib/pa-metrics-market.js';

const rows = JSON.parse(readFileSync(SEED, 'utf8'));

test('every row has a source URL and read date, and every stated rate reproduces from its counts', () => {
  assert.deepEqual(checkRows(rows), []);
});

test('a row without a source URL, or with a rate its counts do not give, fails the check', () => {
  const base = rows.find((r) => r.stdRequests > 0);
  assert.match(checkRows([{ ...base, url: '' }]).join(), /no source URL/);
  assert.match(checkRows([{ ...base, stdDeniedPct: base.stdDeniedPct + 1 }]).join(), /does not match/);
  assert.match(checkRows([{ ...base, extendedRequests: 0, extendedApproved: 0, extendedApprovedPct: 0 }]).join(), /over zero requests/);
  assert.match(checkRows([base, base]).join(), /duplicate/);
});

test('the bundled summary is the summary of the table (regenerate with the script on any change)', () => {
  assert.equal(readFileSync('lib/pa-metrics-market.js', 'utf8'), moduleText(summarize(rows)));
  assert.deepEqual(PA_METRICS_MARKET, summarize(rows));
});

test('the first edition: 149 Medicare Advantage contract reports for 2025 from four payers, rates only', () => {
  const m = PA_METRICS_MARKET['ma|2025'];
  assert.equal(m.reports, 149);
  assert.deepEqual(m.payers, ['Aetna (CVS Health)', 'Humana', 'Kaiser Permanente', 'UnitedHealthcare']);
  assert.deepEqual(Object.keys(m.metrics), ['stdApprovedPct', 'stdDeniedPct', 'appealApprovedPct', 'expApprovedPct', 'expDeniedPct']);
  for (const s of Object.values(m.metrics)) assert.ok(s.p25 <= s.median && s.median <= s.p75);
});

test('figures read from the reports themselves', () => {
  const kp = rows.find((r) => r.id === 'kaiser-H0630');
  assert.deepEqual([kp.stdRequests, kp.stdApproved, kp.stdDenied, kp.appeals, kp.appealApproved, kp.expRequests, kp.stdAvgHours, kp.stdMedianHours], [69309, 62629, 6680, 143, 95, 50120, 128, 26]);
  const h = rows.find((r) => r.id === 'humana-H5377');
  assert.deepEqual([h.stdRequests, h.stdApproved, h.stdApprovedPct, h.expRequests, h.expApproved], [1197, 1111, 92.82, 23, 20]);
  const u = rows.find((r) => r.id === 'uhc-H0169');
  assert.deepEqual([u.stdRequests, u.stdApproved, u.stdDeniedPct, u.expRequests, u.appeals, u.stdMedianHours], [40168, 34736, 13.5, 1325, null, null]);
  assert.equal(rows.find((r) => r.id === 'aetna-H0523').stdApprovedPct, 97.61);
});

test('quantile interpolates between closest ranks', () => {
  assert.equal(quantile([1, 2, 3, 4], 0.5), 2.5);
  assert.equal(quantile([1, 2, 3, 4], 0.25), 1.75);
  assert.equal(quantile([5], 0.75), 5);
});
