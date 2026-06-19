// spec-v112 2.3: CPIS for VAP (Pugin 1991, modified). Six components 0/1/2,
// total 0-12; > 6 suggests ventilator-associated pneumonia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpisVap } from '../../lib/critcare-v112.js';

test('worked example crossing the threshold: total 8 -> suggests VAP', () => {
  const r = cpisVap({ temp: 39, wbc: 12000, secretions: 'purulent', oxygenation: 'low', cxr: 'diffuse', culture: 'none' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 8);
  assert.equal(r.vap, true);
  assert.match(r.band, /greater than 6 -- suggests ventilator-associated pneumonia/);
});

test('a total of exactly 6 is at or below the threshold (VAP less likely)', () => {
  // temp 38.7 (1) + wbc 3000 (1) + secretions non-purulent (1) + oxy low (2) + cxr diffuse (1) + culture none (0) = 6
  const r = cpisVap({ temp: 38.7, wbc: 3000, secretions: 'non-purulent', oxygenation: 'low', cxr: 'diffuse', culture: 'none' });
  assert.equal(r.total, 6);
  assert.equal(r.vap, false);
  assert.match(r.band, /6 or below/);
});

test('the band-forms and same-organism bonuses each add 1, capped at 2 per component', () => {
  // wbc 12000 base 1 + bandForms +1 = 2; culture moderate base 1 + sameOrganism +1 = 2.
  const r = cpisVap({ temp: 37, wbc: 12000, bandForms: true, secretions: 'none', oxygenation: 'normal', cxr: 'none', culture: 'moderate', sameOrganism: true });
  assert.equal(r.total, 4); // wbc 2 + culture 2
});

test('temperature bands: 36.5-38.4 = 0, 38.5-38.9 = 1, >= 39 or <= 36 = 2', () => {
  const base = { wbc: 8000, secretions: 'none', oxygenation: 'normal', cxr: 'none', culture: 'none' };
  assert.equal(cpisVap({ ...base, temp: 37 }).total, 0);
  assert.equal(cpisVap({ ...base, temp: 38.7 }).total, 1);
  assert.equal(cpisVap({ ...base, temp: 39.5 }).total, 2);
  assert.equal(cpisVap({ ...base, temp: 35.5 }).total, 2);
});

test('partial input (no temp or WBC) returns a complete-the-fields fallback', () => {
  assert.equal(cpisVap({ wbc: 8000 }).valid, false);
  assert.equal(cpisVap({ temp: 39 }).valid, false);
});
