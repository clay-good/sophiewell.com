// spec-v114 2.1: DECAF score (Steer 2012). eMRCD (5a=+1, 5b=+2) + eosinopenia
// + consolidation + acidemia + AF, total 0-6; bands low 0-1, intermediate 2,
// high 3-6.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decafScore } from '../../lib/pulm-v114.js';

test('worked example: 5b + eosinopenia + acidemia -> 4, high (34.6%)', () => {
  const r = decafScore({ emrcd: '5b', eosinopenia: true, acidemia: true });
  assert.equal(r.total, 4);
  assert.equal(r.tier, 'high');
  assert.equal(r.mortality, '34.6%');
  assert.match(r.band, /DECAF 4\/6: high risk/);
});

test('eMRCD grades: 1-4 = 0, 5a = +1, 5b = +2', () => {
  assert.equal(decafScore({ emrcd: '1-4' }).total, 0);
  assert.equal(decafScore({ emrcd: '5a' }).total, 1);
  assert.equal(decafScore({ emrcd: '5b' }).total, 2);
});

test('band boundary: 1 is low (1.4%), 2 is intermediate (8.4%), 3 is high (34.6%)', () => {
  assert.equal(decafScore({ emrcd: '5a' }).tier, 'low'); // 1
  assert.equal(decafScore({ emrcd: '5b' }).tier, 'intermediate'); // 2
  assert.equal(decafScore({ emrcd: '5b', af: true }).tier, 'high'); // 3
  assert.equal(decafScore({ emrcd: '5b' }).mortality, '8.4%');
});

test('a zero score is low risk with no items counted', () => {
  const r = decafScore({ emrcd: '1-4' });
  assert.equal(r.total, 0);
  assert.equal(r.tier, 'low');
  assert.match(r.counted, /no DECAF items/);
});

test('max score 6 is high risk', () => {
  const r = decafScore({ emrcd: '5b', eosinopenia: true, consolidation: true, acidemia: true, af: true });
  assert.equal(r.total, 6);
  assert.equal(r.tier, 'high');
});
