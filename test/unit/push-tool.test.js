// spec-v662: PUSH tool (Pressure Ulcer Scale for Healing) 3.0.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pushTool } from '../../lib/push-tool-v662.js';

test('range: 0 (closed) and 17 (max area + heavy exudate + necrotic)', () => {
  assert.equal(pushTool({ length: '0', width: '0', exudate: '0', tissue: '0' }).total, 0);
  assert.equal(pushTool({ length: '5', width: '5', exudate: '3', tissue: '4' }).total, 17); // 25 cm2 -> 10, +3 +4
});

test('area binning: category boundaries', () => {
  assert.equal(pushTool({ length: '0', width: '0', exudate: '0', tissue: '0' }).areaScore, 0);
  assert.equal(pushTool({ length: '0.5', width: '0.5', exudate: '0', tissue: '0' }).areaScore, 1); // 0.25 cm2 -> < 0.3
  assert.equal(pushTool({ length: '0.4', width: '0.5', exudate: '0', tissue: '0' }).areaScore, 1); // 0.20 cm2 -> < 0.3
});

test('area exact categories', () => {
  assert.equal(pushTool({ length: '1', width: '0.2', exudate: '0', tissue: '0' }).areaScore, 1); // 0.2 -> <0.3
  assert.equal(pushTool({ length: '1', width: '0.6', exudate: '0', tissue: '0' }).areaScore, 2); // 0.6 -> 0.3-0.6
  assert.equal(pushTool({ length: '1', width: '1', exudate: '0', tissue: '0' }).areaScore, 3); // 1.0 -> 0.7-1.0
  assert.equal(pushTool({ length: '2', width: '1', exudate: '0', tissue: '0' }).areaScore, 4); // 2.0
  assert.equal(pushTool({ length: '5', width: '1', exudate: '0', tissue: '0' }).areaScore, 7); // 5.0 -> 4.1-8.0
  assert.equal(pushTool({ length: '6', width: '5', exudate: '0', tissue: '0' }).areaScore, 10); // 30 -> >24
});

test('total = area + exudate + tissue', () => {
  const r = pushTool({ length: '2', width: '1.5', exudate: '2', tissue: '2' }); // 3.0 -> 5, +2 +2 = 9
  assert.equal(r.areaScore, 5);
  assert.equal(r.total, 9);
});

test('META example: 2 x 1.5 cm, moderate exudate, granulation = 9', () => {
  const r = pushTool({ length: '2', width: '1.5', exudate: '2', tissue: '2' });
  assert.equal(r.total, 9);
  assert.match(r.bandLabel, /PUSH 9 of 17/);
});

test('subscores and inputs are validated', () => {
  assert.equal(pushTool({ length: '2', width: '1.5', exudate: '2' }).valid, false);
  assert.equal(pushTool({ length: '2', width: '1.5', exudate: '4', tissue: '2' }).valid, false);
  assert.equal(pushTool({ length: '-1', width: '1', exudate: '0', tissue: '0' }).valid, false);
});
