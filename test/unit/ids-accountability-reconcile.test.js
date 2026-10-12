// spec-v1635 tool 23: study drug accountability and pill-count compliance (21 CFR 312.62(a)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idsAccountabilityReconcile as d } from '../../lib/ids-accountability-reconcile-v1635.js';

test('taken, expected and compliance per visit, with hold days removed', () => {
  const r = d({ visits: 'S01-V2, 60, 6, 2026-09-01, 2026-09-29, 2\nS02-V2, 60, 30, 2026-09-01, 2026-09-29, 2, 7', rangeLow: 80, rangeHigh: 120 });
  assert.deepEqual(r.visits.map((v) => [v.taken, v.expected, v.compliancePercent, v.inRange]), [[54, 56, 96.4, true], [30, 42, 71.4, false]]);
  assert.equal(r.abnormal, true);
  // Over-compliance is out of range too.
  assert.equal(d({ visits: 'A, 70, 0, 2026-09-01, 2026-09-29, 2', rangeLow: 80, rangeHigh: 120 }).visits[0].inRange, false);
});

test('no range entered: nothing is called in or out of range', () => {
  const r = d({ visits: 'S01-V2, 60, 6, 2026-09-01, 2026-09-29, 2' });
  assert.equal(r.visits[0].inRange, null);
  assert.equal(r.abnormal, false);
  assert.match(r.notes.join(' '), /No protocol compliance range was entered/);
});

test('the site balance, on its own or with visits', () => {
  const s = d({ received: 500, dispensedTotal: 120, returnedToStock: 0, destroyed: 36, returnedToSponsor: 0, onHand: 342 });
  assert.deepEqual(s.site, { expectedOnHand: 344, onHand: 342, discrepancy: -2 });
  assert.equal(s.abnormal, true);
  assert.equal(d({ received: 500, dispensedTotal: 120, returnedToStock: 10, destroyed: 36, returnedToSponsor: 4, onHand: 350 }).site.discrepancy, 0);
  assert.match(d({ received: 500 }).message, /All six site balance figures are needed/);
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter at least one visit line/);
  assert.match(d({ visits: 'x, 1, 2' }).message, /^Visit line 1: enter the code/);
  assert.match(d({ visits: 'x, 1, 2, 2026-09-01, 2026-09-29, 2' }).message, /more units were returned than dispensed/);
  assert.match(d({ visits: 'x, 10, 2, 2026-09-29, 2026-09-01, 2' }).message, /return date must be after/);
  assert.match(d({ visits: 'x, 10, 2, 2026-09-01, 2026-09-08, 2, 7' }).message, /hold days cover the whole interval/);
  assert.match(d({ visits: 'x, 10, 2, 2026-02-30, 2026-03-08, 2' }).message, /as YYYY-MM-DD/);
  assert.match(d({ visits: 'x, 10, 2, 2026-09-01, 2026-09-08, 2', rangeLow: 120, rangeHigh: 80 }).message, /must be above/);
  assert.equal(d(null).valid, false);
});
