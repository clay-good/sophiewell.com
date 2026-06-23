// spec-v142 2.5: Wilson Risk Sum Score (Wilson 1988). Five 0-2 factors, 0-10.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wilsonAirway } from '../../lib/surg-v142.js';

test('all normal -> 0/10, below threshold', () => {
  const r = wilsonAirway({ weight: 0, headneck: 0, jaw: 0, mandible: 0, teeth: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /below the difficult-intubation threshold/);
});

test('sum >= 2 flips to elevated risk (the sensitive screen)', () => {
  const r = wilsonAirway({ weight: 2 });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
});

test('a score above 2 quotes the ~75% derivation detection', () => {
  const r = wilsonAirway({ weight: 1, headneck: 1, jaw: 1 });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /~75% of difficult intubations/);
});

test('max 10/10 and blank factors score 0', () => {
  assert.equal(wilsonAirway({ weight: 2, headneck: 2, jaw: 2, mandible: 2, teeth: 2 }).score, 10);
  assert.equal(wilsonAirway({}).score, 0);
});
