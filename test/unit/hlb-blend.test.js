// spec-v1629 tool 22: emulsifier blend for a required HLB (Griffin 1949, 1954).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hlbBlend as h } from '../../lib/hlb-blend-v1629.js';

test('Griffin\'s 3:1 example gives 10', () => {
  // 1949: three parts of HLB 8 with one part of HLB 16.
  assert.equal(h({ mode: 'mixture', emulsifiers: '3, 8\n1, 16' }).hlb, 10);
  // The same pair, solved the other way: an HLB of 10 takes three quarters of A.
  const r = h({ mode: 'blend', required: 10, hlbA: 8, hlbB: 16, totalWeight: 20 });
  assert.deepEqual([r.fractionA, r.fractionB, r.gramsA, r.gramsB], [0.75, 0.25, 15, 5]);
  assert.match(h({ mode: 'blend', required: 10, hlbA: 8, hlbB: 16 }).notes.join(' '), /No total emulsifier weight was entered/);
});

test('a required HLB outside the pair is refused', () => {
  assert.match(h({ mode: 'blend', required: 18, hlbA: 8, hlbB: 16 }).message, /outside the two emulsifiers' values \(8 to 16\)/);
  assert.match(h({ mode: 'blend', required: 4, hlbA: 16, hlbB: 8 }).message, /outside the two emulsifiers' values/);
  assert.match(h({ mode: 'blend', required: 8, hlbA: 8, hlbB: 8 }).message, /same HLB/);
  // At either end the blend is all of one emulsifier.
  assert.equal(h({ mode: 'blend', required: 16, hlbA: 8, hlbB: 16 }).fractionB, 1);
});

test('the required HLB of an oil phase is the weighted mean', () => {
  assert.equal(h({ mode: 'oil', oils: '30, 12\n10, 15\n5, 7' }).hlb, 12.11);
});

test('the 1954 estimates give the arithmetic, with the paper\'s printed figure beside it', () => {
  const sap = h({ mode: 'sap', sapNumber: 161, acidNumber: 198 });
  assert.equal(sap.hlb, 3.74);
  assert.equal(sap.paperPrints, '3.8');
  assert.match(sap.notes.join(' '), /paper's own worked example, which prints 3\.8; the arithmetic gives 3\.74/);
  const ep = h({ mode: 'eo', oxyethylenePercent: 65.1, polyolPercent: 6.7 });
  assert.equal(ep.hlb, 14.36);
  assert.equal(ep.paperPrints, '14');
  const e = h({ mode: 'eo', oxyethylenePercent: 76 });
  assert.equal(e.hlb, 15.2);
  assert.equal(e.paperPrints, '15');
  // Another input carries no such line, and every estimate repeats Griffin's limit.
  const other = h({ mode: 'eo', oxyethylenePercent: 50 });
  assert.equal(other.paperPrints, null);
  for (const r of [sap, ep, e, other]) assert.match(r.notes.join(' '), /propylene oxide, butylene oxide, nitrogen or sulfur, and all ionic surfactants, need the experimental method/);
});

test('refusals: no HLB value is ever filled in', () => {
  assert.match(h({}).message, /Choose what to work out/);
  assert.match(h({ mode: 'blend', hlbA: 8, hlbB: 16 }).message, /Enter the required HLB/);
  assert.match(h({ mode: 'blend', required: 10, hlbB: 16 }).message, /Enter the HLB of emulsifier A/);
  assert.match(h({ mode: 'mixture', emulsifiers: '3, 8' }).message, /at least two emulsifiers/);
  assert.match(h({ mode: 'mixture', emulsifiers: '3, 8\n1' }).message, /Line 2/);
  assert.match(h({ mode: 'oil' }).message, /at least two oils/);
  assert.match(h({ mode: 'sap', sapNumber: 200, acidNumber: 198 }).message, /must be below the acid number/);
  assert.match(h({ mode: 'eo', oxyethylenePercent: 80, polyolPercent: 30 }).message, /add to more than 100/);
});
