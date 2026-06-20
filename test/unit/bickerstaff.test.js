// spec-v122 2.3: Bickerstaff brainstem encephalitis checklist (Odaka 2003;
// Wakerley 2014). Core = ophthalmoplegia + ataxia + (altered consciousness OR
// hyperreflexia); GQ1b / MRI / CSF are supportive only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bickerstaff } from '../../lib/neuro-v122.js';

test('core met via altered consciousness -> consistent', () => {
  const r = bickerstaff({ ophthalmoplegia: true, ataxia: true, consciousness: true });
  assert.equal(r.valid, true);
  assert.equal(r.consistent, true);
  assert.match(r.band, /features consistent with Bickerstaff/);
});

test('core met via hyperreflexia (the alternative central feature)', () => {
  const r = bickerstaff({ ophthalmoplegia: true, ataxia: true, hyperreflexia: true });
  assert.equal(r.consistent, true);
});

test('criteria-not-met when the central feature is absent', () => {
  const r = bickerstaff({ ophthalmoplegia: true, ataxia: true });
  assert.equal(r.consistent, false);
  assert.match(r.band, /not met -- missing a central feature/);
});

test('supportive features alone (no core) do not satisfy the criteria', () => {
  const r = bickerstaff({ gq1b: true, mri: true, csf: true });
  assert.equal(r.consistent, false);
  assert.match(r.counted, /supportive only/);
});

test('supportive features are named when the core is met', () => {
  const r = bickerstaff({ ophthalmoplegia: true, ataxia: true, hyperreflexia: true, gq1b: true });
  assert.equal(r.consistent, true);
  assert.match(r.band, /supporting anti-GQ1b IgG antibody/);
});

test('scalar / non-object fuzz arg yields a valid not-consistent verdict, never throws', () => {
  const r = bickerstaff(9);
  assert.equal(r.valid, true);
  assert.equal(r.consistent, false);
});
