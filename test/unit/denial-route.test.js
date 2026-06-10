// spec-v63 OA2: denial -> next-step routing. The map is an input-driven
// decision (denial category -> meaning / appealable / next step / tile), not a
// browsable CARC/RARC code index. These tests pin that every route resolves to
// a real catalog tile, carries a governing CFR/CMS anchor, and that appealable
// routes name a valid appeal-deadline starting level.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { denialRoute, DENIAL_ROUTES } from '../../lib/coding-v5.js';
import { APPEAL_LEVELS } from '../../lib/ops-v63.js';

function catalogIds() {
  const src = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const m = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!m) throw new Error('denial-route: could not find UTILITIES array in app.js');
  return new Set([...m[1].matchAll(/id:\s*'([^']+)'/g)].map((mm) => mm[1]));
}

test('OA2: every denial route resolves a real tile and carries an anchor', () => {
  const ids = catalogIds();
  assert.ok(Object.keys(DENIAL_ROUTES).length >= 6, 'expected a meaningful set of denial categories');
  for (const [cat, r] of Object.entries(DENIAL_ROUTES)) {
    assert.ok(r.label && r.meaning && r.nextStep, `${cat}: needs label/meaning/nextStep`);
    assert.equal(typeof r.appealable, 'boolean', `${cat}: appealable must be a boolean`);
    assert.match(r.cfr, /CFR|CMS|U\.S\.C\./, `${cat}: every route cites a governing rule`);
    assert.ok(ids.has(r.tile), `${cat}: routes to tile "${r.tile}" which must be a real tile`);
  }
});

test('OA2: appealable routes name a valid appeal-deadline starting level', () => {
  for (const [cat, r] of Object.entries(DENIAL_ROUTES)) {
    if (r.appealable) {
      assert.ok(r.appealStart && APPEAL_LEVELS[r.appealStart],
        `${cat}: appealable route must name a valid APPEAL_LEVELS level, got "${r.appealStart}"`);
    } else {
      assert.equal(r.appealStart, null, `${cat}: a non-appealable route should not set appealStart`);
    }
  }
});

test('OA2: timely-filing and missing-info are non-appealable resubmission paths', () => {
  assert.equal(denialRoute({ category: 'timely-filing' }).appealable, false);
  assert.equal(denialRoute({ category: 'missing-info' }).appealable, false);
  assert.equal(denialRoute({ category: 'medical-necessity' }).appealable, true);
});

test('OA2: an unknown category returns null', () => {
  assert.equal(denialRoute({ category: 'no-such-reason' }), null);
  assert.equal(denialRoute({ category: '' }), null);
});
