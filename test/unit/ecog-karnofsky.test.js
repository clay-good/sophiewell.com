// spec-v12 §3.7.3 wave 12-7: ECOG + Karnofsky boundary examples per
// Oken MM, et al. Am J Clin Oncol. 1982;5(6):649-655 (ECOG); Karnofsky
// DA, Burchenal JH. 1949 (KPS); Buccheri G, et al. Eur J Cancer. 1996;
// 32A(7):1135-1141 (crosswalk).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecogKarnofsky } from '../../lib/scoring-v4.js';

test('ecogKarnofsky ECOG 0 -> suggests KPS 90', () => {
  const r = ecogKarnofsky({ ecog: 0, kps: 100 });
  assert.equal(r.ecog, 0);
  assert.equal(r.suggestedKps, 90);
  assert.match(r.ecogDescriptor, /Fully active/);
});

test('ecogKarnofsky ECOG <-> KPS crosswalk (Buccheri 1996)', () => {
  assert.equal(ecogKarnofsky({ ecog: 0, kps: 90 }).suggestedKps, 90);
  assert.equal(ecogKarnofsky({ ecog: 1, kps: 80 }).suggestedKps, 80);
  assert.equal(ecogKarnofsky({ ecog: 2, kps: 60 }).suggestedKps, 60);
  assert.equal(ecogKarnofsky({ ecog: 3, kps: 40 }).suggestedKps, 40);
  assert.equal(ecogKarnofsky({ ecog: 4, kps: 20 }).suggestedKps, 20);
  assert.equal(ecogKarnofsky({ ecog: 5, kps: 0 }).suggestedKps, 0);
});

test('ecogKarnofsky KPS rounds to nearest 10 and clamps to 0-100', () => {
  assert.equal(ecogKarnofsky({ ecog: 1, kps: 73 }).kps, 70);
  assert.equal(ecogKarnofsky({ ecog: 1, kps: 76 }).kps, 80);
  assert.equal(ecogKarnofsky({ ecog: 0, kps: 150 }).kps, 100);
  assert.equal(ecogKarnofsky({ ecog: 5, kps: -10 }).kps, 0);
});

test('ecogKarnofsky null inputs return null descriptors', () => {
  const r = ecogKarnofsky({ ecog: null, kps: null });
  assert.equal(r.ecog, null);
  assert.equal(r.kps, null);
  assert.equal(r.ecogDescriptor, null);
  assert.equal(r.kpsDescriptor, null);
});
