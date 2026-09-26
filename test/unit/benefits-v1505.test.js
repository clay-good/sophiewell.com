// spec-v1505 tools 4 and 5: benefits investigation summary and site-of-care comparison.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { biSummary as b, siteOfCareCompare as c, walk } from '../../lib/benefits-v1505.js';

test('bi-summary: deductible, then coinsurance, capped at the out-of-pocket maximum', () => {
  const r = b({ allowed: '4000', perYear: '13', deductibleLeft: '1500', oopLeft: '5000', shareKind: 'coinsurance', share: '20' });
  assert.equal(r.first, 2000);
  assert.equal(r.d90, 4400);
  assert.equal(r.year, 5000);
});

test('walk: a copay applies after the deductible and never exceeds the allowed amount', () => {
  assert.deepEqual(walk(3, 100, 0, { kind: 'copay', value: 150 }, 1e9), [100, 100, 100]);
  assert.deepEqual(walk(2, 1000, 300, { kind: 'copay', value: 50 }, 1e9), [350, 50]);
});

test('site-of-care-compare: lowest total and lowest for the patient', () => {
  const r = c({ perYear: '6', deductibleLeft: '500', oopLeft: '4000', site1: 'Hospital outpatient', allowed1: '9000', s1shareKind: 'coinsurance', s1share: '20', site2: 'Home infusion', allowed2: '5200', s2shareKind: 'copay', s2share: '50' });
  assert.equal(r.bandLabel, 'Home infusion');
  assert.match(r.band, /a difference of \$22,800\.00/);
  assert.equal(r.sites.find((s) => s.name === 'Home infusion').patient, 800);
});

test('blank inputs ask', () => {
  assert.equal(b({}).valid, false);
  assert.equal(c({ perYear: '6', site1: 'A', allowed1: '100', s1shareKind: 'copay', s1share: '10' }).valid, false);
});
