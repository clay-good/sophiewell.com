// spec-v12 §3.4.2 wave 12-4: APRI boundary examples per the shipping
// contract in spec-v12 §5. Formula and cutoffs per Wai CT, et al.
// Hepatology. 2003;38(2):518-526; WHO 2014 HCV guideline endorses
// the cutoffs for resource-limited settings.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apri } from '../../lib/clinical-v4.js';

// Wai 2003: significant fibrosis ruled out at 0.5 or below and in above 1.5; cirrhosis ruled out at 1.0 or below
// and in above 2.0; between them is indeterminate.
test('apri 0.30 -> at or below the significant-fibrosis rule-out', () => {
  const r = apri({ ast: 30, astUln: 40, plateletsK: 250 });
  assert.ok(Math.abs(r.score - 0.3) < 0.005);
  assert.match(r.band, /rule-out threshold for significant fibrosis/);
});

test('apri 1.00 (tile example) -> indeterminate for fibrosis, not "predicts"', () => {
  const r = apri({ ast: 60, astUln: 40, plateletsK: 150 });
  assert.ok(Math.abs(r.score - 1.0) < 0.005);
  assert.match(r.band, /indeterminate for significant fibrosis/);
  assert.match(r.band, /rule-out threshold for cirrhosis/);
  assert.doesNotMatch(r.band, /predicts/);
});

test('apri 1.05 -> indeterminate for both; 1.6 -> fibrosis ruled in; 10 -> cirrhosis ruled in', () => {
  assert.match(apri({ ast: 63, astUln: 40, plateletsK: 150 }).band, /indeterminate for significant fibrosis \(0\.5-1\.5\) and for cirrhosis/);
  assert.match(apri({ ast: 96, astUln: 40, plateletsK: 150 }).band, /^APRI >1\.5: above the Wai 2003 rule-in threshold for significant fibrosis/);
  assert.match(apri({ ast: 200, astUln: 40, plateletsK: 50 }).band, /^APRI >2\.0: above the Wai 2003 rule-in threshold for cirrhosis/);
});

// Invalid input rejection.
test('apri rejects zero AST ULN', () => {
  assert.throws(() => apri({ ast: 60, astUln: 0, plateletsK: 150 }), /ast\suln/);
});
