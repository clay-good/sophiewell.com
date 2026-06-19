// spec-v115 2.4: REVEAL Lite 2 (Benza 2021). Additive from a base of 6; six
// all-noninvasive variables; total 1-14. Bands low 1-5 (2.9%), intermediate
// 6-7 (7.1%), high >= 8 (25.1%).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { revealLite2 } from '../../lib/pulmnod-v115.js';

test('worked example: eGFR 72, FC III, SBP 104, HR 88, 6MWD 300, NT-proBNP high -> 10 high', () => {
  const r = revealLite2({ egfr: 72, who: '3', sbp: 104, hr: 88, mwd: 300, bnp: 'high2' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 10);
  assert.equal(r.tier, 'high');
  assert.equal(r.mortality, '25.1%');
});

test('low anchor: eGFR 60, FC II, SBP 110, HR 96, 6MWD 350, BNP mid -> 5 low', () => {
  const r = revealLite2({ egfr: 60, who: '2', sbp: 110, hr: 96, mwd: 350, bnp: 'mid' });
  assert.equal(r.total, 5);
  assert.equal(r.tier, 'low');
});

test('band boundary: 5 is low, 6 is intermediate, 8 is high', () => {
  // base 6, FC I = -1 -> 5 low
  assert.equal(revealLite2({ egfr: 70, who: '1', sbp: 120, hr: 80, mwd: 200, bnp: 'mid' }).tier, 'low');
  // base 6, all neutral -> 6 intermediate
  assert.equal(revealLite2({ egfr: 70, who: '2', sbp: 120, hr: 80, mwd: 200, bnp: 'mid' }).tier, 'intermediate');
  // base 6 + FC IV(+2) -> 8 high
  assert.equal(revealLite2({ egfr: 70, who: '4', sbp: 120, hr: 80, mwd: 200, bnp: 'mid' }).tier, 'high');
});

test('6MWD bands: >=440 -2, 320-440 -1, 165-320 0, <165 +1', () => {
  const at = (mwd) => revealLite2({ egfr: 70, who: '2', sbp: 120, hr: 80, mwd, bnp: 'mid' }).total;
  assert.equal(at(450), 4); // 6 - 2
  assert.equal(at(400), 5); // 6 - 1
  assert.equal(at(200), 6); // 6 + 0
  assert.equal(at(100), 7); // 6 + 1
});

test('partial inputs render a complete-the-fields fallback', () => {
  const r = revealLite2({ egfr: 70, who: '2' });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the eGFR, systolic BP, heart rate, and 6-minute walk distance/);
});
