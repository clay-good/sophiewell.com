// spec-v132 2.2: French TTP score (Coppo 2010, PLoS One 5:e10208). 1 point each:
// platelet < 30; creatinine <= 2.26 mg/dL (inclusive, per the source); ANA
// positive. Total 0-3. Score 0 very unlikely, 2-3 highly likely.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frenchTtp } from '../../lib/heme-v132.js';

test('the 0-vs-2 probability flip', () => {
  const zero = frenchTtp({ platelet: 200, creatinine: 3.0, ana: 'no' });
  assert.equal(zero.total, 0);
  assert.equal(zero.tier, 'Low');
  assert.match(zero.band, /very unlikely/);
  const two = frenchTtp({ platelet: 22, creatinine: 1.1, ana: 'no' });
  assert.equal(two.total, 2);
  assert.equal(two.tier, 'High');
  assert.equal(two.abnormal, true);
  assert.match(two.band, /highly likely/);
});

test('the creatinine threshold is inclusive at 2.26 mg/dL', () => {
  assert.equal(frenchTtp({ platelet: 200, creatinine: 2.26, ana: 'no' }).total, 1); // exactly 2.26 scores
  assert.equal(frenchTtp({ platelet: 200, creatinine: 2.27, ana: 'no' }).total, 0); // just above does not
});

test('a single criterion is intermediate', () => {
  const one = frenchTtp({ platelet: 22, creatinine: 3.0, ana: 'no' });
  assert.equal(one.total, 1);
  assert.equal(one.tier, 'Intermediate');
});

test('all three criteria reach the maximum of 3', () => {
  const r = frenchTtp({ platelet: 10, creatinine: 1.0, ana: 'yes' });
  assert.equal(r.total, 3);
  assert.equal(r.tier, 'High');
});

test('blank or non-finite inputs surface valid:false', () => {
  assert.equal(frenchTtp({ platelet: 22 }).valid, false);
  assert.equal(frenchTtp({ platelet: 22, creatinine: 1.1, ana: '' }).valid, false);
  assert.equal(frenchTtp(null).valid, false);
});
