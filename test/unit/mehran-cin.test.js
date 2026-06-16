// spec-v92 §2.4: Mehran contrast-induced nephropathy risk score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mehranCin } from '../../lib/nephro-v92.js';

test('worked example: CHF + diabetes + 300 mL contrast + eGFR 30 -> 15 (high)', () => {
  const r = mehranCin({ chf: true, diabetes: true, contrastVolume: 300, egfr: 30 });
  // CHF 5 + DM 3 + contrast 3 + eGFR(20-40) 4 = 15
  assert.equal(r.total, 15);
  assert.equal(r.riskKey, 'high');
  assert.match(r.risk, /26\.1%/);
});

test('band edge 5/6: 5 = low, 6 = moderate', () => {
  // anemia 3 + eGFR(40-60) 2 = 5
  assert.equal(mehranCin({ anemia: true, egfr: 50 }).riskKey, 'low');
  // CHF 5 + contrast 100 mL (1) = 6
  assert.equal(mehranCin({ chf: true, contrastVolume: 100 }).riskKey, 'moderate');
});

test('band edge 10/11 and 15/16', () => {
  // hypotension 5 + CHF 5 = 10 -> moderate
  assert.equal(mehranCin({ hypotension: true, chf: true }).riskKey, 'moderate');
  // + contrast 100 (1) = 11 -> high
  assert.equal(mehranCin({ hypotension: true, chf: true, contrastVolume: 100 }).riskKey, 'high');
  // hypotension 5 + IABP 5 + CHF 5 = 15 -> high
  assert.equal(mehranCin({ hypotension: true, iabp: true, chf: true }).riskKey, 'high');
  // + diabetes 3 = 18 -> very high
  assert.equal(mehranCin({ hypotension: true, iabp: true, chf: true, diabetes: true }).riskKey, 'vhigh');
});

test('contrast volume = 1 point per 100 mL; eGFR band term clamps', () => {
  assert.equal(mehranCin({ contrastVolume: 200 }).points.contrast, 2);
  assert.equal(mehranCin({ egfr: 15 }).points.egfr, 6);
  assert.equal(mehranCin({ egfr: 80 }).points.egfr, 0);
});

test('blank optional factor contributes 0', () => {
  const r = mehranCin({});
  assert.equal(r.total, 0);
  assert.equal(r.riskKey, 'low');
  assert.equal(r.valid, true);
});
