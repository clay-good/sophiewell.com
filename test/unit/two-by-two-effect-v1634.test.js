// spec-v1634 tool 19: RR, OR and risk difference with 95% intervals (sources re-read October 16, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { twoByTwoEffect as f } from '../../lib/two-by-two-effect-v1634.js';

test('Bland and Altman 2000: OR 4.89 (4.00 to 5.99), relative risk 3.91, difference 0.187', () => {
  const r = f({ events1: '141', total1: '561', events2: '928', total2: '14453' });
  assert.equal(r.band, 'Risk ratio 3.91 (95% CI 3.35 to 4.57); odds ratio 4.89 (95% CI 4.00 to 5.99); risk difference 18.7 percentage points (95% CI 15.1 to 22.3).');
  assert.deepEqual(r.oddsRatioCi.map((x) => Number(x.toFixed(2))), [4.00, 5.99]);
  assert.equal(Number(r.riskDifference.toFixed(3)), 0.187);
  // SE ln RR = sqrt(1/a + 1/c - 1/n1 - 1/n2), the Review Manager formula.
  const se = Math.sqrt(1 / 141 + 1 / 928 - 1 / 561 - 1 / 14453);
  assert.ok(Math.abs(Math.log(r.riskRatioCi[1] / r.riskRatio) - 1.96 * se) < 1e-12);
  assert.match(r.notes.join(' '), /Number needed to treat: 6 for one additional event in group 1.*95% interval: 4\.48 to 6\.62/);
});

test('Altman 1998: an NNT interval whose difference may be zero passes through infinity', () => {
  const r = f({ events1: '10', total1: '100', events2: '12', total2: '100' });
  assert.match(r.notes.join(' '), /50 for one fewer event in group 1.*10 for one fewer event, through infinity, to 15 for one additional event/);
});

test('zero cells: the ratio that needs the cell is withheld, never invented', () => {
  const z = f({ events1: '0', total1: '50', events2: '5', total2: '50' });
  assert.equal(z.oddsRatio, undefined); assert.equal(z.riskRatio, undefined);
  assert.match(z.band, /^Risk difference -10\.0 percentage points/);
  assert.match(z.notes.join(' '), /Review Manager adds 0\.5 to every cell in that case; that correction is not applied/);
  assert.match(f({ events1: '0', total1: '50', events2: '0', total2: '50' }).notes.join(' '), /risk ratio and odds ratio are undefined/);
  const all = f({ events1: '20', total1: '20', events2: '5', total2: '50' });
  assert.equal(all.oddsRatio, undefined, 'b = 0');
  assert.ok(all.riskRatio > 0, 'the risk ratio needs only a and c');
});

test('refusals ask for what is missing', () => {
  assert.match(f({}).message, /^Enter the events in group 1/);
  assert.match(f({ events1: '5', total1: '4', events2: '1', total2: '10' }).message, /cannot be more than its total/);
  assert.match(f({ events1: '1.5', total1: '4', events2: '1', total2: '10' }).message, /whole number/);
  assert.match(f({ events1: '1', total1: '0', events2: '1', total2: '10' }).message, /total in group 1/);
});
