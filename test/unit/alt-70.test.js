// spec-v109 2.5: ALT-70 cellulitis score (Raff 2017). 0-7; <=2 unlikely, 3-4
// indeterminate, >=5 likely.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alt70 } from '../../lib/traumaclass-v109.js';

test('no positive features -> cellulitis unlikely', () => {
  const r = alt70({ wbc: 8, hr: 70, age: 40 });
  assert.equal(r.total, 0);
  assert.equal(r.riskBand, 'cellulitis unlikely');
  assert.equal(r.abnormal, true); // unlikely is the flagged (reassess) band
});

test('asymmetry alone scores 3 (indeterminate)', () => {
  const r = alt70({ asymmetry: true, wbc: 8, hr: 70, age: 40 });
  assert.equal(r.total, 3);
  assert.equal(r.riskBand, 'indeterminate');
});

test('band flip: total crosses 5 into cellulitis-likely', () => {
  const r = alt70({ asymmetry: true, wbc: 11, hr: 92 });
  assert.equal(r.total, 5); // 3 + 1 + 1
  assert.equal(r.riskBand, 'cellulitis likely');
  assert.match(r.band, /ALT-70 5: cellulitis likely \(>= 82% likelihood of cellulitis\)\./);
});

test('age >= 70 adds 2, full house scores 7', () => {
  const r = alt70({ asymmetry: true, wbc: 12, hr: 95, age: 75 });
  assert.equal(r.total, 7);
  assert.equal(r.riskBand, 'cellulitis likely');
});

test('thresholds are inclusive at the boundary', () => {
  assert.equal(alt70({ wbc: 10, hr: 89, age: 69 }).total, 1); // wbc>=10 only
  assert.equal(alt70({ wbc: 9.9, hr: 90, age: 70 }).total, 3); // hr>=90 (1) + age>=70 (2)
});

test('spec-v1741: a WBC past the envelope is refused, a high real one and the example answer', () => {
  // spec-v1763: bound widened (source in lib/bounds.js)
  const tenX = alt70({ asymmetry: 1, wbc: 2001, hr: 92 });
  assert.equal(tenX.valid, false);
  assert.equal(tenX.total, null);
  assert.match(tenX.band, /plausible range for white blood cell count/);
  assert.equal(alt70({ asymmetry: 1, wbc: 150, hr: 92 }).total, 5);
  assert.ok(alt70({ asymmetry: 1, wbc: 11, hr: 92 }).band.startsWith('ALT-70 5: cellulitis likely (>= 82% likelihood of cellulitis).'));
});
