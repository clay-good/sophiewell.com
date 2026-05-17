// Unit tests for lib/artifact-route.js (spec-v7 section 3.1 routing).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ARTIFACT_KINDS } from '../../lib/artifact-detect.js';
import {
  DEFAULT_ARTIFACT_ROUTES,
  ARTIFACT_LABELS,
  routeArtifact,
} from '../../lib/artifact-route.js';

test('every ARTIFACT_KINDS entry has a routing slot (value or explicit null)', () => {
  for (const kind of ARTIFACT_KINDS) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(DEFAULT_ARTIFACT_ROUTES, kind),
      'missing routing slot for ' + kind,
    );
  }
});

test('every ARTIFACT_KINDS entry has a human label', () => {
  for (const kind of ARTIFACT_KINDS) {
    assert.ok(typeof ARTIFACT_LABELS[kind] === 'string' && ARTIFACT_LABELS[kind].length > 0);
  }
});

test('routeArtifact returns the mapped tile id for known kinds', () => {
  assert.equal(routeArtifact('bill'), 'decoder');
  assert.equal(routeArtifact('eob'), 'eob-decoder');
  assert.equal(routeArtifact('msn'), 'msn-decoder');
  assert.equal(routeArtifact('lab-result'), 'lab-interpret');
  assert.equal(routeArtifact('denial-letter'), 'appeal-letter');
  assert.equal(routeArtifact('discharge-summary'), 'discharge-instr');
  assert.equal(routeArtifact('insurance-card'), 'insurance');
});

test('routeArtifact returns null for kinds with no shipped decoder', () => {
  assert.equal(routeArtifact('pharmacy-list'), null);
});

test('routeArtifact returns null for unknown / falsy / bogus inputs', () => {
  assert.equal(routeArtifact('unknown'), null);
  assert.equal(routeArtifact(null), null);
  assert.equal(routeArtifact(undefined), null);
  assert.equal(routeArtifact(''), null);
  assert.equal(routeArtifact('not-a-kind'), null);
});

test('routeArtifact gates the result on the knownIds set when provided', () => {
  const known = new Set(['decoder', 'eob-decoder']);
  assert.equal(routeArtifact('bill', known), 'decoder');
  assert.equal(routeArtifact('eob', known), 'eob-decoder');
  // The mapped tile is not in the registry: result must be null, not the id.
  assert.equal(routeArtifact('lab-result', known), null);
  assert.equal(routeArtifact('discharge-summary', known), null);
});
