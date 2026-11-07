// spec-v1700: drug-interaction-kinetics tools 1, 2, 5 and 6 against ICH M12 (read November 7, 2026). Every vector
// is from the change's design.md; each cutoff is tested on both sides.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ddiBasicScreen as screen, toMicromolar } from '../../lib/ddi-basic-screen-v1700.js';
import { ddiStaticAucr as aucr } from '../../lib/ddi-static-aucr-v1700.js';
import { ddiCrIrPredict as crir } from '../../lib/ddi-cr-ir-predict-v1700.js';
import { enzymeRecoveryTime as recovery } from '../../lib/enzyme-recovery-time-v1700.js';
import { TABLE_6, CUTOFFS } from '../../lib/ich-m12.js';

test('Table 6 and the cutoffs are the values M12 prints', () => {
  assert.deepEqual(TABLE_6.map((r) => [r.value, r.halfLifeH, r.kdegPerMin]), [
    ['CYP1A2', 38, 0.0003], ['CYP2B6', 32, 0.00036], ['CYP2C8', 22, 0.00053], ['CYP2C9', 104, 0.00011],
    ['CYP2C19', 26, 0.00044], ['CYP2D6', 51, 0.00023], ['CYP3A4', 36, 0.00032], ['CYP3A4-gut', 24, 0.00048]]);
  assert.deepEqual([CUTOFFS.reversible, CUTOFFS.gut, CUTOFFS.tdi, CUTOFFS.aucrLow, CUTOFFS.aucrHigh], [0.02, 10, 1.25, 0.8, 1.25]);
});

test('reversible: 0.01 is excluded, 0.02 exactly is not', () => {
  assert.equal(screen({ mechanism: 'reversible', unit: 'uM', cmaxu: '0.01', ki: '1' }).excluded, true);
  const at = screen({ mechanism: 'reversible', unit: 'uM', cmaxu: '0.02', ki: '1' });
  assert.equal(at.excluded, false);
  assert.match(at.band, /mechanistic static or PBPK model/);
  assert.equal(screen({ mechanism: 'reversible', unit: 'nM', cmaxu: '10', ki: '1000' }).ratio, 0.01);
});

test('gut: 100 mg, MW 500 is 800 µM; Ki,u 50 gives 16, 80 gives 10 (not excluded), 81 gives 9.877 (excluded)', () => {
  const g = (ki) => screen({ mechanism: 'gut', unit: 'uM', dose: '100', mw: '500', ki });
  assert.deepEqual([g('50').ratio, g('50').excluded], [16, false]);
  assert.deepEqual([g('80').ratio, g('80').excluded], [10, false]);
  assert.deepEqual([g('81').ratio, g('81').excluded], [9.877, true]);
  assert.match(screen({ mechanism: 'gut', unit: 'uM', dose: '100', ki: '1' }).message, /molecular weight/);
});

test('time-dependent: kobs 0.01667/min and ratio 53.08 at CYP3A4\'s kdeg', () => {
  const r = screen({ mechanism: 'tdi', unit: 'uM', cmaxu: '0.1', kI: '1', kinact: '0.05', enzyme: 'CYP3A4' });
  assert.equal(r.ratio, 53.08);
  assert.ok(r.notes.some((n) => n.includes('0.01667/min')));
  assert.match(screen({ mechanism: 'tdi', unit: 'uM', cmaxu: '0.1', kI: '1', kinact: '0.05' }).message, /Choose the enzyme/);
});

test('fu,p below 1% becomes 0.01 unless marked validated', () => {
  const r = screen({ mechanism: 'reversible', unit: 'uM', cmax: '1', fup: '0.002', ki: '1' });
  assert.equal(r.ratio, 0.01);
  assert.ok(r.notes[0].includes('default of 0.01'));
  assert.equal(screen({ mechanism: 'reversible', unit: 'uM', cmax: '1', fup: '0.002', ki: '1', fupValidated: true }).ratio, 0.002);
  assert.match(screen({ mechanism: 'reversible', unit: 'uM', cmax: '1', fup: '0.1', cmaxu: '0.1', ki: '1' }).message, /not both/);
  assert.match(toMicromolar(5, 'ngml', null).message, /molecular weight/);
  assert.match(screen({ mechanism: 'reversible', cmaxu: '1', ki: '1' }).message, /^Choose the concentration unit/);
});

test('static model: reversible 2.500, time-dependent 8.979, induction 0.1818', () => {
  assert.equal(aucr({ fm: '0.9', fg: '1', ih: '1', ki: '0.5' }).aucr, 2.5);
  assert.equal(aucr({ fm: '0.9', ih: '1', kinact: '0.05', kI: '1', enzyme: 'CYP3A4' }).aucr, 8.979);
  const ind = aucr({ fm: '0.9', ih: '1', emax: '10', ec50: '1' });
  assert.equal(ind.aucr, 0.1818);
  assert.equal(ind.withinBand, false);
});

test('static model: the gut factor with Fg 0.5, [I]g 10 µM and Ki 1 µM is 1.833', () => {
  // design.md paired this gut case with the liver case's Ki of 0.5; M12 Table 3 uses one Ki for both sites,
  // so the gut factor is tested on its own.
  assert.equal(aucr({ fm: '0.9', fg: '0.5', ih: '1', ig: '10', ki: '1' }).gutFactor, 1.833);
  assert.match(aucr({ fm: '0.9', fg: '0.5', ih: '1', ki: '1' }).message, /\[I\]g/);
});

test('static model: concentration estimates with M12\'s defaults', () => {
  const r = aucr({ fm: '0.9', ki: '1', estimate: 'true', fup: '0.1', cmax: '2', dose: '100', mw: '500', rb: '1' });
  assert.ok(r.notes.some((n) => n.includes('1.437 µM') && n.includes('66.67 µM')));
  assert.match(aucr({ fm: '0.9', ki: '1', estimate: true, fup: '0.1', cmax: '2', dose: '100', mw: '500' }).message, /RB/);
});

test('static model: inhibition and induction together are run three ways, and the combined run can mask both', () => {
  const r = aucr({ fm: '0.9', ih: '1', ki: '0.5', emax: '4', ec50: '1' });
  assert.equal(r.aucr, 1);
  assert.equal(r.withinBand, true);
  assert.equal(r.masked, true, 'a combined value inside the band must not read as low risk');
  assert.match(r.band, /does not show a low risk/);
  assert.doesNotMatch(r.band, /risk of a clinically relevant interaction is low/);
  assert.equal(aucr({ fm: '0.9', ih: '0.01', ki: '10', emax: '0.1', ec50: '10' }).masked, false);
  assert.ok(r.notes.some((n) => n.includes('Inhibition alone (C = 1): AUCR 2.5') && n.includes('Induction alone (A = B = 1): AUCR 0.3571')));
  assert.ok(r.notes.some((n) => n.includes('can mask either effect')));
  assert.ok(r.notes.some((n) => n.includes('negligible extrahepatic clearance')));
  assert.ok(aucr({ fm: '0.9', ih: '1', ki: '0.5' }).notes.some((n) => n.startsWith('For a substrate with linear kinetics') && n.includes('0.4 of the dose')));
});

test('static model refusals', () => {
  assert.match(aucr({ ih: '1', ki: '1' }).message, /^Enter fm/);
  assert.match(aucr({ fm: '1.2', ih: '1', ki: '1' }).message, /at most 1/);
  assert.match(aucr({ fm: '0.9', ih: '1' }).message, /at least one mechanism/);
  assert.match(aucr({ fm: '0.9', ih: '1', kinact: '0.05' }).message, /KI/);
});

test('Ohno CR and IR', () => {
  assert.equal(crir({ mode: 'inhibition', cr: '0.92', ir: '0.92' }).ratio, 6.51);
  assert.equal(crir({ mode: 'induction', cr: '0.9', ic: '7.7' }).ratio, 0.1261);
  assert.equal(crir({ mode: 'solve-cr', observedRatio: '10', ir: '0.92' }).cr, 0.9783);
  assert.equal(crir({ mode: 'solve-ir', observedRatio: '10', cr: '0.9783' }).ir, 0.92);
  assert.match(crir({ mode: 'inhibition', cr: '1', ir: '1' }).message, /infinite/);
  assert.match(crir({ mode: 'inhibition', cr: '1.2', ir: '0.5' }).message, /0 to 1/);
  assert.ok(crir({ mode: 'inhibition', cr: '0.92', ir: '0.92' }).notes.some((n) => n.includes("FDA's strong inhibitor class")));
  assert.ok(crir({ mode: 'inhibition', cr: '0.5', ir: '0.5' }).notes.some((n) => n.includes('state the dose')));
});

test('CYP3A4 recovery: 50% at 36.1 h, 90% at 119.9 h; threefold induced is 150.2% at 72 h', () => {
  const a = recovery({ enzyme: 'CYP3A4', startLevel: '0' });
  assert.deepEqual([a.t50, a.t90], [36.1, 119.9]);
  assert.equal(recovery({ enzyme: 'CYP3A4', startLevel: '3', hoursSinceStop: '72' }).levelNow, 150.2);
  assert.deepEqual(recovery({ enzyme: 'CYP3A4', startLevel: '0', washoutHours: '24' }).t50, 60.1);
  assert.match(recovery({ enzyme: 'CYP3A4', startLevel: '1' }).message, /already at baseline/);
  assert.match(recovery({ startLevel: '0' }).message, /Choose the enzyme/);
});
