// Regression tests for the defects two independent reviews found in the spec-v1600 to v1626 tools (record readers,
// file intake, price transparency, coverage checks) on 2026-10-20, each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { toConcept } from '../../lib/record-units.js';
import { pick } from '../../lib/record-pick.js';
import { unThousand } from '../../lib/typed-money.js';
import { itemizedBillCheck } from '../../lib/itemized-bill-check.js';
import { dpcHsaCheck } from '../../lib/dpc-hsa-check.js';
import { medicareFfsPaRequired } from '../../lib/medicare-ffs-pa-required.js';
import { hsaPredeductibleCheck } from '../../lib/hsa-predeductible-check.js';

const raw = JSON.parse(readFileSync(new URL('../../data/concepts/concepts.json', import.meta.url), 'utf8'));
const concepts = Array.isArray(raw) ? raw : (raw.concepts || raw);
const concept = (id) => concepts.find((c) => c.id === id);
const now = new Date('2026-10-20T09:00:00Z');

test('mEq/L is converted only where a concept lists it: calcium in mEq/L is not guessed', () => {
  assert.equal(toConcept(concept('calcium'), 5, 'mEq/L'), null);
  assert.equal(toConcept(concept('sodium'), 140, 'mEq/L'), 140);
});

test('record values: a future-dated result is not the latest, and a derived eGFR keeps its age note', () => {
  const k = concept('creatinine').codes[0];
  const r = pick({ observations: [{ system: k.system, code: k.code, value: 1.0, unit: 'mg/dL', at: '2026-10-01' }, { system: k.system, code: k.code, value: 4.0, unit: 'mg/dL', at: '2062-10-01' }] }, concepts, now);
  assert.equal(r.values.creatinine.value, 1);
  const e = pick({ birthDate: '1960-01-01', sex: 'M', observations: [{ system: k.system, code: k.code, value: 1.2, unit: 'mg/dL', at: '2023-01-05' }] }, concepts, now);
  assert.match(e.values.egfr.note, /^Derived from a creatinine from January 5, 2023/);
});

test('a dollar amount with a thousands comma is one field when fields are comma-and-space separated', () => {
  assert.equal(unThousand('2026-01-02, Dr A, 99213, 11, 1,250.00'), '2026-01-02, Dr A, 99213, 11, 1250.00');
  assert.equal(unThousand('x,11,125.00'), 'x,11,125.00');
  assert.equal(unThousand('a, 1,250, b'), 'a, 1,250, b');
});

test('itemized bill: line totals are compared in cents, not a per-unit charge rounded to a cent', () => {
  const r = itemizedBillCheck({ lines: [{ date: '2026-05-01', code: '85025', units: '3', charge: '100.03' }], setting: 'outpatient', payment: 'insured', prices: { 85025: [{ setting: 'both', gross: 33.34, cash: 20, payers: [] }] } });
  assert.match(r.band, /\$0\.01 above the gross charges/);
});

test('DPC: a fee a fraction of a cent over the limit is printed as over it', () => {
  const r = dpcHsaCheck({ year: 2026, covers: 'one', period: '1', fee: '150.004', practitioners: 'yes', fixedFee: 'yes', anesthesia: 'no', drugs: 'no', labs: 'no' });
  assert.match(r.band, /^Over the limit: \$150\.004 a month/);
});

test('Medicare FFS prior authorization with no state: dates are still checked, and a live phase is not hidden', () => {
  assert.notEqual(medicareFfsPaRequired({ code: 'L3761', setting: 'dmepos', serviceDate: '2026-11-15' }).bandLabel, 'Not required');
  assert.equal(medicareFfsPaRequired({ code: '64483', setting: 'office', serviceDate: '2025-06-01' }).bandLabel, 'Not required');
  assert.equal(medicareFfsPaRequired({ code: '15820', setting: 'asc', serviceDate: '2025-06-01' }).bandLabel, 'Not required');
  assert.equal(medicareFfsPaRequired({ code: 'A0426', setting: 'ambulance', serviceDate: '2010-01-01' }).bandLabel, 'Not required');
});

test('HSA telehealth: a plan year beginning in 2019 or 2020 depends on the month (relief from March 27, 2020)', () => {
  assert.equal(hsaPredeductibleCheck({ item: 'telehealth', planYear: 2019 }).verdict, 'depends');
  assert.match(hsaPredeductibleCheck({ item: 'telehealth', planYear: 2022 }).band, /2023 months/);
});
