// spec-v1473: Glycemia Risk Index = 3.0 VLow + 2.4 Low + 1.6 VHigh + 0.8 High, capped at 100
// (Klonoff 2023, J Diabetes Sci Technol); zones A to E are equal quintiles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glycemiaRiskIndex as g } from '../../lib/glycemia-risk-index-v1473.js';

test('the paper’s worked example: 5, 10, 15, 20 gives components 13 and 25, GRI 79', () => {
  const r = g({ vlow: 5, low: 10, vhigh: 15, high: 20, tir: 50 });
  assert.equal(r.valid, true);
  assert.equal(r.hypoComponent, 13);
  assert.equal(r.hyperComponent, 25);
  assert.equal(r.gri, 79);
  assert.equal(r.zone, 'D');
  assert.equal(r.abnormal, true);
  assert.equal(r.band, 'GRI 79 (zone D): hypoglycemia component 13, hyperglycemia component 25.');
  assert.equal(r.bandLabel, 'GRI 79, zone D');
});

test('the META example: 1, 3, 22, 9 gives GRI 42.2, zone C, hyperglycemia driving', () => {
  const r = g({ vlow: '1', low: '3', high: '22', vhigh: '9' });
  assert.equal(r.gri, 42.2);
  assert.equal(r.zone, 'C');
  assert.match(r.notes[0], /^Hyperglycemia contributes more/);
});

test('zone boundaries: each upper edge belongs to the lower zone', () => {
  const z = (high) => g({ vlow: 0, low: 0, high, vhigh: 0 });
  assert.equal(z(25).gri, 20);
  assert.equal(z(25).zone, 'A');
  assert.equal(z(25).abnormal, false);
  assert.equal(z(25.125).zone, 'B');
  assert.equal(z(50).zone, 'B');
  assert.equal(z(75).zone, 'C');
  assert.equal(z(100).zone, 'D');
  const e = g({ vlow: 0, low: 0, high: 0, vhigh: 50.0625 });
  assert.equal(e.zone, 'E');
  assert.equal(g({ vlow: 0, low: 0, high: 0, vhigh: 0 }).zone, 'A');
});

test('the GRI is capped at 100 and says so', () => {
  const r = g({ vlow: 40, low: 0, high: 0, vhigh: 0 });
  assert.equal(r.gri, 100);
  assert.equal(r.zone, 'E');
  assert.match(r.notes[0], /gives 120; the GRI is capped at 100/);
});

test('the four may not exceed 100; with time in range the five must total 100 +/- 1', () => {
  assert.match(g({ vlow: 40, low: 40, high: 20, vhigh: 10 }).message, /add up to 110%.*Check the values/);
  assert.equal(g({ vlow: 1, low: 3, high: 22, vhigh: 9, tir: 65.5 }).valid, true);
  assert.match(g({ vlow: 1, low: 3, high: 22, vhigh: 9, tir: 60 }).message, /five percentages add up to 95%/);
  assert.equal(g({ vlow: 1, low: 3, high: 22, vhigh: 9, tir: '' }).valid, true);
});

test('blanks are asked for, never read as 0; out-of-range values refused', () => {
  assert.match(g({ low: 3, high: 22, vhigh: 9 }).message, /^Enter the percentage of time below 54 mg\/dL/);
  assert.match(g({ vlow: 1, low: '  ', high: 22, vhigh: 9 }).message, /^Enter the percentage of time from 54 to 69/);
  assert.match(g({ vlow: 1, low: 3, high: 22 }).message, /^Enter the percentage of time above 250/);
  assert.match(g({ vlow: -1, low: 3, high: 22, vhigh: 9 }).message, /between 0 and 100/);
  assert.match(g({ vlow: 1, low: 3, high: 22, vhigh: 9, tir: 140 }).message, /between 0 and 100/);
  assert.equal(g().valid, false);
});
