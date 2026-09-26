// spec-v1506 tool 3: copay card run-out, counting vs accumulator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copayCardRunout as c } from '../../lib/copay-card-v1506.js';

const base = { planType: 'commercial', costPerFill: '5000', fills: '12', cardMax: '10000', deductible: '3000', coinsurance: '20', oopMax: '8000' };

test('counting card covers the whole year; accumulator leaves the patient at the out-of-pocket maximum', () => {
  const r = c({ ...base, counts: 'unknown' });
  assert.equal(r.valid, true);
  assert.equal(r.yearCounts, 0);
  assert.equal(r.yearAccumulator, 8000);
  assert.match(r.band, /first bill is \$200\.00 at fill 3/);
});

test('an accumulator charges the deductible again on every fill until the patient pays it', () => {
  const r = c({ ...base, counts: 'no' });
  assert.match(r.band, /^With an accumulator/);
  assert.equal(r.bandLabel, '$8,000.00 a year');
});

test('a per-fill maximum below the cost share leaves a bill from the first fill', () => {
  const r = c({ ...base, counts: 'yes', perFillMax: '3000' });
  assert.match(r.band, /first bill is \$400\.00 at fill 1/);
});

test('Medicare or Medicaid is refused with the reason', () => {
  const r = c({ ...base, planType: 'federal', counts: 'yes' });
  assert.equal(r.valid, false);
  assert.match(r.message, /cannot be used with Medicare or Medicaid/);
});

test('a blank answer on counting asks rather than assuming', () => {
  const r = c({ ...base });
  assert.equal(r.valid, false);
  assert.match(r.message, /Not known/);
});

test('blank plan terms ask', () => {
  for (const k of ['costPerFill', 'fills', 'cardMax', 'deductible', 'coinsurance', 'oopMax']) {
    assert.equal(c({ ...base, counts: 'yes', [k]: '' }).valid, false, k);
  }
});
