// spec-v12 §3.4.2 wave 12-4: APRI boundary examples per the shipping
// contract in spec-v12 §5. Formula and cutoffs per Wai CT, et al.
// Hepatology. 2003;38(2):518-526; WHO 2014 HCV guideline endorses
// the cutoffs for resource-limited settings.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apri } from '../../lib/clinical-v4.js';

// Low edge: below the 0.7 significant-fibrosis cutoff.
test('apri low edge: AST 30, ULN 40, plt 250 -> 0.30 (below 0.7)', () => {
  const r = apri({ ast: 30, astUln: 40, plateletsK: 250 });
  assert.ok(Math.abs(r.score - 0.3) < 0.005);
  assert.match(r.band, /below the Wai 2003/);
});

// Mid (tile example): exactly 1.0; significant-fibrosis band, not cirrhosis.
test('apri mid: AST 60, ULN 40, plt 150 -> 1.00 (significant fibrosis)', () => {
  const r = apri({ ast: 60, astUln: 40, plateletsK: 150 });
  assert.ok(Math.abs(r.score - 1.0) < 0.005);
  assert.match(r.band, /significant fibrosis/);
});

// High edge: deep cirrhosis-band.
test('apri high edge: AST 200, ULN 40, plt 50 -> 10.00 (cirrhosis)', () => {
  const r = apri({ ast: 200, astUln: 40, plateletsK: 50 });
  assert.ok(Math.abs(r.score - 10) < 0.005);
  assert.match(r.band, /cirrhosis/);
});

// Cirrhosis threshold check (>1.0).
test('apri cirrhosis cutoff: score 1.05 -> cirrhosis band', () => {
  const r = apri({ ast: 63, astUln: 40, plateletsK: 150 });
  assert.ok(r.score > 1.0);
  assert.match(r.band, /cirrhosis/);
});

// Invalid input rejection.
test('apri rejects zero AST ULN', () => {
  assert.throws(() => apri({ ast: 60, astUln: 0, plateletsK: 150 }), /astUln/);
});
