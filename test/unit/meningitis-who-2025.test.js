// spec-v1560 tool 3: WHO 2025 meningitis. The puncture decision, Listeria, steroids by setting, duration.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meningitisWho2025 as r } from '../../lib/meningitis-who-2025-v1560.js';

const clear = { gcs: 'no', focal: 'no', cranial: 'no', papill: 'no', seizure: 'no', immuno: 'no' };
const base = { age: '30', setting: 'sporadic', imaging: 'yes', ...clear };

test('lumbar puncture decision', () => {
  assert.equal(r(base).bandLabel, 'LP now');
  assert.equal(r({ ...base, focal: 'yes' }).bandLabel, 'Image before LP');
  assert.equal(r({ ...base, focal: 'yes', imaging: 'no' }).bandLabel, 'Defer LP');
  const { gcs, ...rest } = base;
  void gcs;
  assert.equal(r(rest).bandLabel, 'LP not decided');
});

test('empiric antibiotics', () => {
  const t = (x) => r(x).notes.find((n) => /^Empiric/.test(n));
  assert.doesNotMatch(t(base), /Listeria/);
  assert.match(t({ ...base, age: '61' }), /ampicillin or amoxicillin for Listeria \(over 60\)/);
  assert.match(t({ ...base, listeria: 'yes' }), /Listeria/);
  assert.match(t({ ...base, resistant: 'yes' }), /vancomycin/);
  assert.match(t({ ...base, cephAvailable: 'no' }), /chloramphenicol/);
});

test('steroids and duration by setting', () => {
  const st = (x) => r(x).notes.find((n) => /^Corticosteroids/.test(n));
  assert.match(st(base), /where the puncture can be done/);
  assert.match(st({ ...base, focal: 'yes' }), /conditional/);
  assert.match(st({ ...base, setting: 'meningo' }), /not routinely/);
  assert.match(st({ ...base, malaria: 'yes' }), /no\. Not in cerebral malaria/);
  assert.ok(r({ ...base, setting: 'meningo' }).notes.some((n) => /5 days/.test(n)));
  assert.ok(r({ ...base, setting: 'pneumo' }).notes.some((n) => /10 days/.test(n)));
});

test('refusals', () => {
  assert.equal(r({ ...base, setting: '' }).valid, false);
  assert.equal(r({ ...base, imaging: '' }).valid, false);
  assert.equal(r({ ...base, age: '' }).valid, false);
});
