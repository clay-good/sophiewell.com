// Regression tests for the defects an independent review found in the spec-v1630 (parenteral nutrition, IV admixture,
// storage) and v1640 (pharmacogenomics) tools on 2026-10-20, each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ivPhosphateOrderCheck } from '../../lib/iv-phosphate-order-check-v1630.js';
import { storageExcursionSummary } from '../../lib/storage-excursion-summary-v1630.js';
import { meanKineticTemperature } from '../../lib/mean-kinetic-temperature-v1630.js';
import { inUseDiscardTime } from '../../lib/in-use-discard-time-v1630.js';
import { pnCalciumPhosphateCheck } from '../../lib/pn-calcium-phosphate-check-v1630.js';
import { ivLabelRateCheck } from '../../lib/iv-label-rate-check-v1630.js';
import { opioidCyp2d6WithCpic } from '../../lib/opioid-cyp2d6-pediatric-check-v1640.js';
import { pgxLabelDoseLimit } from '../../lib/pgx-label-dose-limit-v1640.js';
import { cyp2d6ActivityScore } from '../../lib/cyp2d6-activity-score-v1640.js';
import { cpicGeneDrug } from '../../lib/cpic-gene-drug-v1640.js';
import { cpicFromDisk } from '../../mcp/cpic-disk.js';

const DB = JSON.parse(readFileSync(new URL('../fixtures/cpic/tables-2026-10-15.json', import.meta.url), 'utf8'));
const now = new Date('2026-10-20T09:00:00Z');

test('IV phosphate: "less than 1" and the top of the range are decided on the measured level', () => {
  const base = { salt: 'potassium', ageBand: '12-plus', weightUnit: 'kg', weight: 70, doseUnit: 'mmol-kg', dose: 0.5, line: 'central', finalVolume: 250, hours: 6 };
  assert.equal(ivPhosphateOrderCheck({ ...base, serumPhosphorus: 0.96 }, now).doseAgainst, 'within');
  assert.equal(ivPhosphateOrderCheck({ ...base, serumPhosphorus: 1 }, now).doseAgainst, 'above');
  assert.ok(ivPhosphateOrderCheck({ ...base, serumPhosphorus: 2.54 }, now).notes.some((n) => /gives no dose/.test(n)));
});

test('a reading printed beside an excursion or a limit sits on the side it was judged', () => {
  const r = storageExcursionSummary({ unit: 'C', range: 'refrigerator', readings: '2026-10-01 08:00, 5\n2026-10-01 09:00, 8.004\n2026-10-01 10:00, 5' }, now);
  assert.ok(r.notes.some((n) => /above range.*highest reading 8\.004 °C/.test(n)));
  const m = meanKineticTemperature({ unit: 'C', activationEnergy: 83.144, readings: '20\n25.004', limit: 25 }, now);
  assert.ok(m.notes.some((n) => /highest single reading, 25\.004 °C, is above it/.test(n)));
});

test('impossible inputs are refused: a year typo, more amino acids than any stock holds', () => {
  assert.equal(inUseDiscardTime({ container: 'multi-dose', opened: '0026-10-05T09:30', expiration: '2027-03' }, now).valid, false);
  assert.equal(inUseDiscardTime({ container: 'multi-dose', opened: '2026-10-05T09:30', expiration: '0027-03' }, now).valid, false);
  assert.equal(pnCalciumPhosphateCheck({ finalVolume: 100, calciumUnit: 'mEq', calcium: 1, phosphateUnit: 'mmol', phosphate: 1, aminoAcidGrams: 500 }, now).valid, false);
});

test('IV rates: potassium and magnesium for a child say the labels give no pediatric limits', () => {
  const r = ivLabelRateCheck({ drug: 'potassium-chloride', population: 'pediatric', setting: 'routine', dose: 10, finalVolume: 250, minutes: 60 }, now);
  assert.match(r.band, /The label gives no pediatric limits/);
});

test('codeine with the status not known: an ultrarapid activity score meets the label\'s ultra-rapid statement', () => {
  const r = opioidCyp2d6WithCpic({ drug: 'codeine', age: '30', status: 'status-not-known', activityScore: '3' }, DB, now);
  assert.equal(r.flag, 'ultra-rapid-should-not-use');
  assert.equal(r.abnormal, true);
  assert.match(r.notes[0], /activity score 3 is an ultrarapid metabolizer/);
});

test('PGx label limits: the dose and ceiling are printed in the order the verdict says', () => {
  const t = pgxLabelDoseLimit({ drug: 'tetrabenazine', status: 'poor', dailyDose: '50.004', singleDose: '25.003' }, now);
  assert.ok(t.notes.some((n) => /50\.004 mg is over the label's 50 mg/.test(n)));
  const p = pgxLabelDoseLimit({ drug: 'pimozide', status: 'poor', population: 'pediatric', dailyDose: '1.004', weight: '20.07' }, now);
  assert.ok(p.notes.some((n) => /1\.004 mg is over the label's 1\.0035 mg/.test(n)));
  const i = pgxLabelDoseLimit({ drug: 'iloperidone', status: 'poor', indication: 'schizophrenia', singleDose: '2.999' }, now);
  assert.ok(i.notes.some((n) => /Entered: 2\.999 mg twice daily/.test(n)));
});

test('CYP2D6: no "n/a" printed as a score, and 1.50 is the same score as 1.5', async () => {
  // *102 is in the shipped CPIC tables, not in the older fixture.
  const shipped = await cpicFromDisk();
  const r = cyp2d6ActivityScore({ allele1: '*4', allele2: '*102', duplication: 'unknown' }, shipped, now);
  assert.doesNotMatch(r.band, /n\/a/);
  assert.equal(r.options[0].activityScore, null);
  assert.equal(cpicGeneDrug({ drug: 'codeine', results: 'CYP2D6 1.50' }, DB, now).valid, true);
  assert.equal(cpicGeneDrug({ drug: 'codeine', results: 'CYP2D6 1.00' }, DB, now).valid, true);
});
