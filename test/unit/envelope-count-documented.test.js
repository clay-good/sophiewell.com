// spec-v1823: the envelope count CONTRIBUTING.md states, against the list itself.
//
// CONTRIBUTING.md names the number of `lib/bounds.js` envelopes twice, in the two rules a contributor
// reads before writing a cap: that a literal there freezes a number that moves, and that a field whose cap
// is one of them NAMES it rather than restating it. The number sat at 45 while the list reached 47, which
// is the drift [[project_catalog_count_surfaces]] is about -- an unlisted visible count will drift, so it
// becomes a checked surface.
//
// Two envelopes arrived in spec-v1823 (a total cholesterol and a CRP) and nobody would have noticed the
// prose going stale, because no gate read it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOUNDS } from '../../lib/bounds.js';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

test('CONTRIBUTING.md states the number of lib/bounds.js envelopes there are', () => {
  const doc = readFileSync(`${ROOT}/CONTRIBUTING.md`, 'utf8');
  const n = Object.keys(BOUNDS).length;
  const claims = [...doc.matchAll(/(\d+) `lib\/bounds\.js` envelopes/g)].map((m) => Number(m[1]));
  assert.ok(claims.length >= 2, `CONTRIBUTING.md should state the envelope count; found ${claims.length} place(s)`);
  for (const claim of claims) {
    assert.equal(claim, n, `CONTRIBUTING.md says ${claim} envelopes; lib/bounds.js has ${n}`);
  }
});
