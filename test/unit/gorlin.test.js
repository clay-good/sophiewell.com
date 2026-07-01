// spec-v185 §2.2: Gorlin valve-area equation. Area = flow/(K·√grad); flow =
// CO(mL/min)/(period·HR). The mean gradient (√) and the period/HR divisor are
// guarded > 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gorlin } from '../../lib/gaps-v185.js';

test('tile example: severe aortic stenosis (K = 44.3)', () => {
  // flow = 5000/(0.33·70) = 216.45 mL/s; area = 216.45/(44.3·√40) = 0.77 cm²
  const r = gorlin({ valve: 'aortic', co: 5, hr: 70, period: 0.33, grad: 40 });
  assert.equal(r.valid, true);
  assert.equal(r.area, 0.77);
  assert.equal(r.flow, 216.5);
  assert.equal(r.bandLabel, 'Severe aortic stenosis');
  assert.equal(r.k, 44.3);
});

test('mitral valve uses K = 37.7 and the diastolic filling period', () => {
  // flow = 4000/(0.4·80) = 125 mL/s; area = 125/(37.7·√10) = 1.05 cm²
  const r = gorlin({ valve: 'mitral', co: 4, hr: 80, period: 0.4, grad: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.area, 1.05);
  assert.equal(r.k, 37.7);
  assert.equal(r.bandLabel, 'Moderate mitral stenosis');
});

test('mild / non-critical band above 1.5 cm²', () => {
  const r = gorlin({ valve: 'aortic', co: 6, hr: 60, period: 0.35, grad: 10 });
  assert.ok(r.area > 1.5, `area ${r.area}`);
  assert.equal(r.bandLabel, 'Mild / non-critical aortic stenosis');
});

test('guards: gradient / period must be > 0; valve required; blanks fall back', () => {
  assert.equal(gorlin({ valve: 'aortic', co: 5, hr: 70, period: 0.33, grad: 0 }).valid, false);
  assert.equal(gorlin({ valve: 'aortic', co: 5, hr: 70, period: 0, grad: 40 }).valid, false);
  assert.equal(gorlin({ co: 5, hr: 70, period: 0.33, grad: 40 }).valid, false);
  assert.equal(gorlin({}).valid, false);
});
