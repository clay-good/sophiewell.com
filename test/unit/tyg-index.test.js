// spec-v136 2.3: TyG index (Simental-Mendia LE, et al, Metab Syndr Relat Disord
// 2008;6:299-304). TyG = ln[(fasting TG mg/dL x fasting glucose mg/dL) / 2].
// Tests pin the worked value, the higher-is-more-resistant direction, and the
// positivity guards (ln domain).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tygIndex } from '../../lib/endo-v136.js';

test('worked example: TG 150, glucose 100 -> TyG 8.92', () => {
  const r = tygIndex({ tg: 150, glucose: 100 });
  assert.equal(r.valid, true);
  assert.equal(r.value, 8.92); // ln(150*100/2) = ln(7500)
});

test('higher TG/glucose raise the TyG index', () => {
  const lo = tygIndex({ tg: 80, glucose: 85 }).value;
  const hi = tygIndex({ tg: 300, glucose: 160 }).value;
  assert.ok(hi > lo);
});

test('zero / negative / blank inputs surface the fallback (no ln(0) leak)', () => {
  assert.equal(tygIndex({ tg: 0, glucose: 100 }).valid, false);
  assert.equal(tygIndex({ tg: 150, glucose: 0 }).valid, false);
  assert.equal(tygIndex({ tg: -10, glucose: 100 }).valid, false);
  assert.equal(tygIndex({}).valid, false);
  assert.equal(tygIndex({ tg: 150 }).valid, false);
});
