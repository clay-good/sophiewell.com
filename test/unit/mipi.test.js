// spec-v155 2.2: MIPI - Mantle Cell Lymphoma International Prognostic Index
// (Hoster 2008). Index = 0.03535·age + 0.6978·(ECOG 2-4) + 1.367·log10(LDH/ULN)
// + 0.9393·log10(WBC per µL). Bands low < 5.7, intermediate 5.7 to < 6.2,
// high >= 6.2. WBC is the ABSOLUTE count per microliter inside the log (erratum).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mipi } from '../../lib/suites-v155.js';

test('tile example: age 65, ECOG 0-1, LDH/ULN 1.2, WBC 8000 -> 6.07 intermediate', () => {
  const r = mipi({ age: 65, ecog: '0', ldh: 300, uln: 250, wbc: 8000 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6.07);
  assert.equal(r.bandLabel, 'Intermediate');
  assert.equal(r.abnormal, true);
  assert.equal(r.ldhRatio, 1.2);
});

test('low / intermediate 5.7 boundary (band uses the exact index, not the rounded score)', () => {
  // age 60, ratio 1 (log10=0): index = 2.121 + 0.9393·log10(WBC).
  const low = mipi({ age: 60, ecog: '0', ldh: 100, uln: 100, wbc: 6400 }); // 5.696 -> low
  assert.equal(low.bandLabel, 'Low');
  assert.equal(low.abnormal, false);
  const inter = mipi({ age: 60, ecog: '0', ldh: 100, uln: 100, wbc: 6500 }); // 5.702 -> intermediate
  assert.equal(inter.bandLabel, 'Intermediate');
  assert.equal(inter.abnormal, true);
});

test('high band: ECOG 2-4 with elevated LDH and WBC', () => {
  const r = mipi({ age: 70, ecog: '1', ldh: 500, uln: 200, wbc: 15000 });
  assert.equal(r.score, 7.64);
  assert.equal(r.bandLabel, 'High');
  assert.equal(r.abnormal, true);
});

test('WBC units: absolute count per µL, not thousands', () => {
  // Same case as the example but WBC entered as "8" (thousands) mis-scores low,
  // documenting the erratum contract that the compute takes the absolute count.
  const wrong = mipi({ age: 65, ecog: '0', ldh: 300, uln: 250, wbc: 8 });
  assert.equal(wrong.bandLabel, 'Low');
  const right = mipi({ age: 65, ecog: '0', ldh: 300, uln: 250, wbc: 8000 });
  assert.equal(right.bandLabel, 'Intermediate');
});

test('log-domain guard: LDH/ULN/WBC/age must be > 0', () => {
  assert.equal(mipi({ age: 65, ecog: '0', ldh: 0, uln: 250, wbc: 8000 }).valid, false);
  assert.equal(mipi({ age: 65, ecog: '0', ldh: 300, uln: 0, wbc: 8000 }).valid, false);
  assert.equal(mipi({ age: 65, ecog: '0', ldh: 300, uln: 250, wbc: 0 }).valid, false);
  assert.equal(mipi({ age: 0, ecog: '0', ldh: 300, uln: 250, wbc: 8000 }).valid, false);
  assert.equal(mipi({ age: 65, ecog: '0', ldh: -5, uln: 250, wbc: 8000 }).valid, false);
  assert.match(mipi({ age: 65, ecog: '0', ldh: 0, uln: 250, wbc: 8000 }).message, /greater than 0/);
});

test('missing fields surface a complete-the-fields fallback', () => {
  assert.equal(mipi({ ecog: '0', ldh: 300, uln: 250, wbc: 8000 }).valid, false);
  assert.equal(mipi({ age: 65, ldh: 300, uln: 250, wbc: 8000 }).valid, false); // no ECOG
  assert.match(mipi({}).message, /still needed/);
  assert.match(mipi({ age: 65, ldh: 300, uln: 250, wbc: 8000 }).message, /ECOG/);
});
