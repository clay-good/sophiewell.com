// spec-v97 2.5: POSPOM (Le Manach et al, Anesthesiology 2016). Age-band +
// comorbidity + procedure points -> predicted in-hospital mortality (SDC 3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pospom } from '../../lib/periop-v97.js';

test('worked point-total -> mortality mapping (SDC 3)', () => {
  // age 70 (66-70 -> 10) + cancer (4) + major-gi (16) = 30 -> 7.403%.
  const r = pospom({ age: 70, comorbidities: ['cancer'], surgery: 'major-gi' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 30);
  assert.equal(r.agePts, 10);
  assert.equal(r.comorbPts, 4);
  assert.equal(r.surgeryPts, 16);
  assert.equal(r.mortality, '7.403%');
});

test('low-risk floor and table boundaries', () => {
  // age 18 (0) + no comorbidity + ophthalmologic (0) = 0 -> < 0.001%.
  const zero = pospom({ age: 18, comorbidities: [], surgery: 'ophthalmologic' });
  assert.equal(zero.total, 0);
  assert.equal(zero.mortality, '< 0.001%');
  // total 25 -> 1.732% (last value before the steep climb).
  // age 45 (5) + chf (4) + major-gi (16) = 25.
  const twentyFive = pospom({ age: 45, comorbidities: ['chf'], surgery: 'major-gi' });
  assert.equal(twentyFive.total, 25);
  assert.equal(twentyFive.mortality, '1.732%');
});

test('unknown comorbidity keys are ignored, not scored as NaN', () => {
  const r = pospom({ age: 70, comorbidities: ['cancer', 'not-a-real-key'], surgery: 'major-gi' });
  assert.equal(r.comorbPts, 4);
  assert.equal(r.total, 30);
});

test('totals above the published table report the > 51 ceiling', () => {
  const r = pospom({ age: 96, comorbidities: ['chf', 'hemiplegia', 'alcohol', 'cancer'], surgery: 'transplant' });
  assert.ok(r.total >= 51);
  assert.equal(r.mortality, '> 97.865%');
});

test('a missing procedure category surfaces valid:false', () => {
  const r = pospom({ age: 70, comorbidities: ['cancer'] });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});
