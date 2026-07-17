// spec-v373: NI-RADS categories (1-4, with 2A/2B). Worked-example tests: each category and its
// description, the suspicious flag on 3-4, the 2A/2B split, aliases, and the invalid-input guard.
// Categories transcribed from Aiken et al. 2018 (ACR NI-RADS white paper), cross-verified against
// radiology references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { niRads } from '../../lib/ni-rads-v373.js';

test('NI-RADS 3: high suspicion, biopsy, flagged (the META example)', () => {
  const r = niRads({ category: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.category, '3');
  assert.equal(r.suspicious, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high suspicion/);
  assert.match(r.band, /biopsy/);
});

test('categories 1 / 2A / 2B are low suspicion (not flagged)', () => {
  for (const c of ['1', '2A', '2B']) {
    assert.equal(niRads({ category: c }).suspicious, false, c);
  }
  assert.match(niRads({ category: '1' }).band, /no evidence of recurrence/);
  assert.match(niRads({ category: '2A' }).band, /mucosal/);
  assert.match(niRads({ category: '2B' }).band, /deep abnormality/);
});

test('NI-RADS 4 is definite recurrence and flagged', () => {
  const r = niRads({ category: '4' });
  assert.equal(r.suspicious, true);
  assert.equal(r.category, '4');
  assert.match(r.band, /definite recurrence/);
});

test('case-insensitive and bare-2 aliases resolve', () => {
  assert.equal(niRads({ category: '2a' }).category, '2A');
  assert.equal(niRads({ category: 2 }).category, '2A');
  assert.equal(niRads({ category: '2B' }).category, '2B');
});

test('a missing or invalid category is guarded', () => {
  assert.equal(niRads({}).valid, false);
  assert.equal(niRads({ category: '5' }).valid, false);
  assert.equal(niRads({ category: '3A' }).valid, false);
});
