// spec-v198 2.5: figoGtn worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { figoGtn } from '../../lib/subspecialty-v198.js';

test('high-risk multi-agent stratification', () => {
  const r = figoGtn({age:45,antecedent:'term',interval:14,hcg:200000,size:6,site:'liverbrain',mets:10,priorChemo:'single'});
  assert.equal(r.valid, true);
  assert.equal(r.score, 23);
  assert.equal(r.abnormal, true);
});

test('low-risk single-agent stratification', () => {
  const r = figoGtn({age:30,antecedent:'mole',interval:3,hcg:500,size:2,site:'lung',mets:0,priorChemo:'none'});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('guards: site required', () => {
  const r = figoGtn({age:30,antecedent:'mole',interval:3,hcg:500,size:2,mets:0,priorChemo:'none'});
  assert.equal(r.valid, false);
});

test('spec-v1755: a fractional metastasis count is refused; whole counts and the worked example answer', () => {
  const ex = { age: 45, antecedent: 'term', interval: 14, hcg: 200000, size: 6, site: 'liverbrain', mets: 10, priorChemo: 'single' };
  const x = figoGtn({ ...ex, mets: 10.5 });
  assert.equal(x.valid, false);
  assert.match(x.message, /whole number/);
  assert.equal(figoGtn({ ...ex, mets: 11 }).valid, true);
  assert.equal(figoGtn(ex).score, 23);
});
