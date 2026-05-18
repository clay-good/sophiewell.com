// spec-v12 §3.3.1 wave 12-3: Glasgow-Blatchford Score boundary
// examples per the shipping contract in spec-v12 §5. Per-parameter
// weights reproduce Blatchford 2000 Table 1.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gbs } from '../../lib/scoring-v4.js';

// Low edge: completely normal vitals and labs -> 0 (outpatient-eligible).
test('gbs low edge: normal labs and vitals -> 0, outpatient-eligible', () => {
  const r = gbs({ bunMgDl: 14, hgbGdl: 15, sex: 'M', sbp: 120,
    pulse100: false, melena: false, syncope: false,
    hepaticDisease: false, cardiacFailure: false });
  assert.equal(r.score, 0);
  assert.match(r.band, /^GBS 0/);
});

// Mid: BUN 30 (4), Hgb 11 M (3), SBP 105 (1), pulse>=100 (1), melena (1) = 10.
test('gbs mid: BUN 30, Hgb 11 male, SBP 105, tachycardia, melena -> 10', () => {
  const r = gbs({ bunMgDl: 30, hgbGdl: 11, sex: 'M', sbp: 105,
    pulse100: true, melena: true, syncope: false,
    hepaticDisease: false, cardiacFailure: false });
  assert.equal(r.parts.bun, 4);
  assert.equal(r.parts.hgb, 3);
  assert.equal(r.parts.sbp, 1);
  assert.equal(r.parts.pulse, 1);
  assert.equal(r.parts.melena, 1);
  assert.equal(r.score, 10);
});

// High edge: every parameter at the deep-red band.
// BUN 80 (6) + Hgb 8 F (6) + SBP 85 (3) + pulse 1 + melena 1
// + syncope 2 + hep 2 + cf 2 = 23 (the published maximum).
test('gbs high edge: maximum 23', () => {
  const r = gbs({ bunMgDl: 80, hgbGdl: 8, sex: 'F', sbp: 85,
    pulse100: true, melena: true, syncope: true,
    hepaticDisease: true, cardiacFailure: true });
  assert.equal(r.score, 23);
});

// Hemoglobin sex-specific weighting boundary.
test('gbs hgb sex weighting: Hgb 12.5 -> M 1 / F 0 (Blatchford 2000 Table 1)', () => {
  const m = gbs({ bunMgDl: 14, hgbGdl: 12.5, sex: 'M', sbp: 120,
    pulse100: false, melena: false, syncope: false,
    hepaticDisease: false, cardiacFailure: false });
  assert.equal(m.parts.hgb, 1);
  const f = gbs({ bunMgDl: 14, hgbGdl: 12.5, sex: 'F', sbp: 120,
    pulse100: false, melena: false, syncope: false,
    hepaticDisease: false, cardiacFailure: false });
  assert.equal(f.parts.hgb, 0);
});
