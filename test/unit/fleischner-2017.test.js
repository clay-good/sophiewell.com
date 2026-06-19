// spec-v115 2.3: Fleischner Society 2017 incidental-nodule follow-up matrix
// (MacMahon 2017). Keyed on type (solid / part-solid / ground-glass), size,
// single vs multiple, and patient risk (which changes only the solid cells).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fleischner2017 } from '../../lib/pulmnod-v115.js';

test('single solid > 8 mm -> consider CT at 3 months, PET/CT, or tissue sampling', () => {
  const r = fleischner2017({ size: 10, type: 'solid', multiplicity: 'single' });
  assert.equal(r.valid, true);
  assert.match(r.recommendation, /Consider CT at 3 months, PET\/CT, or tissue sampling/);
  assert.equal(r.abnormal, true);
});

test('single solid < 6 mm low risk -> no routine follow-up', () => {
  const r = fleischner2017({ size: 4, type: 'solid', multiplicity: 'single', risk: 'low' });
  assert.match(r.recommendation, /No routine follow-up\./);
  assert.equal(r.abnormal, false);
});

test('single solid 6-8 mm: risk changes the second-scan wording (consider vs definite)', () => {
  const low = fleischner2017({ size: 7, type: 'solid', multiplicity: 'single', risk: 'low' });
  const high = fleischner2017({ size: 7, type: 'solid', multiplicity: 'single', risk: 'high' });
  assert.match(low.recommendation, /CT at 6-12 months, then consider CT at 18-24 months/);
  assert.match(high.recommendation, /CT at 6-12 months, then CT at 18-24 months/);
});

test('single pure ground-glass >= 6 mm -> CT 6-12 months then every 2 years to 5 years', () => {
  const r = fleischner2017({ size: 8, type: 'ground-glass', multiplicity: 'single' });
  assert.match(r.recommendation, /CT at 6-12 months to confirm persistence, then CT every 2 years until 5 years/);
});

test('single part-solid >= 6 mm -> CT 3-6 months to confirm persistence', () => {
  const r = fleischner2017({ size: 7, type: 'part-solid', multiplicity: 'single' });
  assert.match(r.recommendation, /CT at 3-6 months to confirm persistence/);
});

test('blank size renders a complete-the-fields fallback', () => {
  const r = fleischner2017({ type: 'solid' });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the nodule size/);
});
