// spec-v132 2.3: JAAM DIC score (Gando 2006, Crit Care Med 34:625, the 2006
// revised criteria, max 8). SIRS >= 3 = 1; platelet < 80 or > 50% fall = 3, else
// 80 to < 120 or > 30% fall = 1; FDP >= 25 = 3, 10 to < 25 = 1; PT ratio >= 1.2 = 1.
// DIC at total >= 4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jaamDic } from '../../lib/heme-v132.js';

test('the total crosses the >= 4 DIC threshold', () => {
  const below = jaamDic({ sirs: 'yes', platelet: 90, fdp: 12, ptRatio: 1.1 });
  assert.equal(below.total, 3); // SIRS 1 + platelet 1 + FDP 1 + PT 0
  assert.equal(below.dic, false);
  const at = jaamDic({ sirs: 'yes', platelet: 90, fdp: 12, ptRatio: 1.3 });
  assert.equal(at.total, 4); // PT now 1
  assert.equal(at.dic, true);
  assert.equal(at.abnormal, true);
});

test('the platelet band uses absolute count', () => {
  assert.equal(jaamDic({ sirs: 'no', platelet: 70, fdp: 0, ptRatio: 1.0 }).parts.platelet, 3); // < 80
  assert.equal(jaamDic({ sirs: 'no', platelet: 100, fdp: 0, ptRatio: 1.0 }).parts.platelet, 1); // 80 to < 120
  assert.equal(jaamDic({ sirs: 'no', platelet: 150, fdp: 0, ptRatio: 1.0 }).parts.platelet, 0); // >= 120
});

test('the 24-h relative fall can score above the absolute band', () => {
  // platelet 90 (absolute band = 1) but a 55% fall from 200 -> band 3
  assert.equal(jaamDic({ sirs: 'no', platelet: 90, priorPlatelet: 200, fdp: 0, ptRatio: 1.0 }).parts.platelet, 3);
  // a 35% fall (130 from 200) lifts a >= 120 count (band 0) to band 1
  assert.equal(jaamDic({ sirs: 'no', platelet: 130, priorPlatelet: 200, fdp: 0, ptRatio: 1.0 }).parts.platelet, 1);
  // a rise never penalizes
  assert.equal(jaamDic({ sirs: 'no', platelet: 200, priorPlatelet: 150, fdp: 0, ptRatio: 1.0 }).parts.platelet, 0);
});

test('FDP bands and the maximum of 8', () => {
  assert.equal(jaamDic({ sirs: 'no', platelet: 200, fdp: 25, ptRatio: 1.0 }).parts.fdp, 3);
  assert.equal(jaamDic({ sirs: 'no', platelet: 200, fdp: 24, ptRatio: 1.0 }).parts.fdp, 1);
  const max = jaamDic({ sirs: 'yes', platelet: 50, fdp: 40, ptRatio: 1.5 });
  assert.equal(max.total, 8);
  assert.equal(max.dic, true);
});

test('blank required inputs surface valid:false (prior platelet is optional)', () => {
  assert.equal(jaamDic({ sirs: 'yes', platelet: 90, fdp: 12 }).valid, false); // no PT ratio
  assert.equal(jaamDic({ sirs: '', platelet: 90, fdp: 12, ptRatio: 1.3 }).valid, false);
  assert.equal(jaamDic({ sirs: 'yes', platelet: 90, fdp: 12, ptRatio: 1.3 }).valid, true); // no prior is fine
});
