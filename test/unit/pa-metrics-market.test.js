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

test('the first edition: 461 reports; the Medicare Advantage market is 248 contract reports from the six largest insurers and Molina, rates only', () => {
  assert.equal(rows.length, 461);
  assert.equal(PA_METRICS_MARKET['medicaid-mco|2025'].reports, 132);
  assert.equal(PA_METRICS_MARKET['qhp|2025'].reports, 63);
  assert.deepEqual(PA_METRICS_MARKET['qhp|2025'].payers, ['Centene', 'Elevance Health', 'Health Care Service Corporation', 'Kaiser Permanente', 'Molina Healthcare', 'Oscar Health', 'UnitedHealthcare']);
  assert.deepEqual(PA_METRICS_MARKET['mmp|2025'].metrics, {}, 'two payers are not a market');
  const m = PA_METRICS_MARKET['ma|2025'];
  assert.equal(m.reports, 248);
  assert.deepEqual(m.payers, ['Aetna (CVS Health)', 'Centene', 'Elevance Health', 'Humana', 'Kaiser Permanente', 'Molina Healthcare', 'UnitedHealthcare']);
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
  const va = rows.find((r) => r.id === 'humana-medicaid-va');
  assert.deepEqual([va.stdRequests, va.stdDeniedPct, va.appeals, va.appealApproved, va.extendedApproved, va.extendedRequests], [32969, 11.68, 39, 7, 1, 35244]);
  const tx = rows.find((r) => r.id === 'uhc-medicaid-texas-chip');
  assert.equal(tx.program, 'chip-mco');
  assert.match(rows.find((r) => r.id === 'uhc-ifp-al').note, /DRAFT watermark/);
  const la = rows.find((r) => r.id === 'centene-medicaid-la-37');
  assert.deepEqual([la.appeals, la.appealApproved, la.appealApprovedPct, la.rateMismatch, la.notPooled], [967, 250, 59.98, ['appealApprovedPct'], ['appealApprovedPct']], 'a posted rate its own counts contradict is carried as posted, declared, and not pooled');
  const h1416 = rows.filter((r) => r.report === 'H1416');
  assert.equal(h1416.length, 1, 'a contract posted on five state pages with the same figures is one row');
  assert.match(h1416[0].note, /posted on 5 state pages \(AR, IL, MS, SC, TN\)/);
  const az = rows.find((r) => r.id === 'oscar-13877');
  assert.deepEqual([az.stdApprovedPct, az.stdDeniedPct, az.appealApprovedPct, az.stdMedianHours], [81.11, 18.89, 44.83, 40.8]);
  assert.deepEqual([rows.find((r) => r.id === 'hcsc-tx').stdDeniedPct, rows.find((r) => r.id === 'hcsc-tx').extendedApprovedPct], [6, null]);
});

test('quantile interpolates between closest ranks', () => {
  assert.equal(quantile([1, 2, 3, 4], 0.5), 2.5);
  assert.equal(quantile([1, 2, 3, 4], 0.25), 1.75);
  assert.equal(quantile([5], 0.75), 5);
});
