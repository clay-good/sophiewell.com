// spec-v12 §3.3.3 wave 12-3: AIMS65 boundary examples per the
// shipping contract in spec-v12 §5. Banding reproduces Saltzman 2011
// Table 4 in-hospital mortality.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aims65 } from '../../lib/scoring-v4.js';

test('aims65 low edge: no criteria -> 0, mortality 0.3%', () => {
  const r = aims65({ albuminLt3: false, inrGt15: false,
    alteredMental: false, sbpLe90: false, ageGt65: false });
  assert.equal(r.score, 0);
  assert.match(r.band, /0\.3%/);
});

test('aims65 mid: albumin + age -> 2, mortality 5.3%', () => {
  const r = aims65({ albuminLt3: true, inrGt15: false,
    alteredMental: false, sbpLe90: false, ageGt65: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /5\.3%/);
});

test('aims65 high edge: all criteria -> 5, mortality 24.5%', () => {
  const r = aims65({ albuminLt3: true, inrGt15: true,
    alteredMental: true, sbpLe90: true, ageGt65: true });
  assert.equal(r.score, 5);
  assert.match(r.band, /24\.5%/);
});
