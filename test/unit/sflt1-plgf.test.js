// spec-v208 2.4: sFlt-1/PlGF ratio worked examples. <=38 rule-out (NPV ~99.3%);
// >38 elevated; phase-specific rule-in >=85 (early <34wk) / >=110 (late >=34wk).
// Cut-points spec-v97 cross-verified (Zeisler 2016 PROGNOSIS + Verlohren 2014).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sflt1Plgf as sflt } from '../../lib/nutrition-maternal-v208.js';

test('ratio <= 38 -> rule-out (worked example)', () => {
  const r = sflt({ ratio: 25, phase: 'late' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 25);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ruled out/);
});

test('late-onset rule-in at >= 110', () => {
  const r = sflt({ ratio: 120, phase: 'late' });
  assert.equal(r.abnormal, true);
  assert.match(r.band, /rule-in/);
});

test('early-onset rule-in at >= 85', () => {
  assert.match(sflt({ ratio: 90, phase: 'early' }).band, /rule-in/);
  // 90 in a late-onset patient is between 38 and 110 -> elevated, not rule-in
  assert.match(sflt({ ratio: 90, phase: 'late' }).band, /elevated short-term risk/);
});

test('> 38 but below phase rule-in -> elevated', () => {
  const r = sflt({ ratio: 50, phase: 'early' });
  assert.equal(r.abnormal, true);
  assert.match(r.band, /elevated/);
});

test('the 38 boundary is inclusive for rule-out', () => {
  assert.equal(sflt({ ratio: 38, phase: 'late' }).abnormal, false);
  assert.equal(sflt({ ratio: 39, phase: 'late' }).abnormal, true);
});

test('missing phase -> complete-the-fields', () => {
  const r = sflt({ ratio: 25 });
  assert.equal(r.valid, false);
});
