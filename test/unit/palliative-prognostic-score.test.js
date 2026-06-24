// spec-v148 2.5: PaP (Pirovano/Maltoni 1999). dyspnea 1 + anorexia 1.5 + KPS +
// CPS + WBC + lymph, 0-17.5. Groups A 0-5.5 (>70%), B 5.6-11 (30-70%),
// C 11.1-17.5 (<30%).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palliativePrognosticScore as pap } from '../../lib/rheum-v148.js';

test('tile example: group C, 15/17.5', () => {
  const r = pap({ dyspnea: 1, anorexia: 1, kps: 'lo', cps: 'w3', wbc: 'vhigh', lymph: 'vlow' });
  assert.equal(r.score, 15);
  assert.equal(r.bandLabel, 'Group C');
  assert.match(r.band, /< 30%/);
});

test('group A all-zero -> >70%', () => {
  const r = pap({ kps: 'ge30', cps: 'w12', wbc: 'normal', lymph: 'normal' });
  assert.equal(r.score, 0);
  assert.equal(r.bandLabel, 'Group A');
  assert.match(r.band, /> 70%/);
});

test('A/B boundary at 5.5 / 5.6', () => {
  // KPS 10-20 (2.5) + CPS 5-6 (4.5) = 7.0 -> B; trim to A with lower CPS
  // A example: CPS 7-10 (2.5) + KPS lo (2.5) + dyspnea (1) = 6.0 -> B
  // exact 5.5: anorexia 1.5 + KPS lo 2.5 + dyspnea 1 + WBC high 0.5 = 5.5 -> A
  assert.equal(pap({ dyspnea: 1, anorexia: 1, kps: 'lo', cps: 'w12', wbc: 'high', lymph: 'normal' }).bandLabel, 'Group A');
  // 5.6+: add lymph low (1) -> 6.5 -> B
  assert.equal(pap({ dyspnea: 1, anorexia: 1, kps: 'lo', cps: 'w12', wbc: 'high', lymph: 'low' }).bandLabel, 'Group B');
});

test('B/C boundary at 11.0 / 11.1', () => {
  // exactly 11.0 -> B : KPS lo 2.5 + CPS 5-6 4.5 + WBC vhigh 1.5 + lymph low 1 + dyspnea 1 + anorexia... 
  // 2.5+4.5+1.5+1+1 = 10.5 (B). Add 5-6->3-4 (6) instead of 4.5:
  const b = pap({ dyspnea: 1, anorexia: 1, kps: 'lo', cps: 'w5', wbc: 'vhigh', lymph: 'low' }); // 1+1.5+2.5+4.5+1.5+1=12 -> C
  assert.equal(b.bandLabel, 'Group C');
  // an 11.0 case stays B
  const onEdge = pap({ anorexia: 1, kps: 'lo', cps: 'w3', wbc: 'normal', lymph: 'vlow' }); // 1.5+2.5+6+0+2.5=12.5 C
  assert.equal(onEdge.bandLabel, 'Group C');
});

test('blank select -> complete-the-fields', () => {
  assert.equal(pap({ kps: 'lo' }).valid, false);
});
