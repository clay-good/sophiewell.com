// spec-v1693: the X-linked prior is the reader's, and now for a sourced reason. The quotes are from
// Ferlini, Neri and Gualandi, "Risk assessment and genetic counseling in families with Duchenne
// muscular dystrophy", Acta Myol 2012;31:195 (PMC3631803).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { xLinkedBayesRisk } from '../../lib/x-linked-bayes-risk-v1660.js';
import { META } from '../../lib/meta.js';

test('no prior is preset, and the result says so', () => {
  const r = xLinkedBayesRisk({ prior: '1/2', unaffectedSons: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.priorIsPreset, false);
  assert.match(r.note, /No prior is preset here/);
});

test('the result names which relative the two-thirds figure belongs to', () => {
  // The design asked for a preset of "2/3 for the sister of an isolated case". The source puts that
  // figure on the MOTHER, via Haldane's equilibrium; a sister's prior is half of the mother's. A tool
  // that offered a sister 2/3 would double her risk, so the note has to say whose figure it is.
  const r = xLinkedBayesRisk({ prior: '2/3', unaffectedSons: '0' });
  assert.match(r.note, /the MOTHER's/);
  assert.match(r.note, /sister's prior is that times the one-half chance/);
});

test('a prior of 2/3 with no sons is carried through unchanged, not corrected silently', () => {
  // The tool must not second-guess the reader's prior -- it explains, it does not adjust.
  const r = xLinkedBayesRisk({ prior: '2/3', unaffectedSons: '0' });
  assert.equal(r.posterior, 0.6667);
});

test('each unaffected son halves the carrier conditional', () => {
  const p = (n) => xLinkedBayesRisk({ prior: '2/3', unaffectedSons: String(n) }).posterior;
  // 2/3 prior: after 1 son 1/2, after 2 sons 1/3, after 3 sons 1/5.
  assert.equal(p(1), 0.5);
  assert.equal(p(2), 0.3333);
  assert.equal(p(3), 0.2);
});

test('the no-preset decision is recorded where the next builder will look', () => {
  const lib = readFileSync(new URL('../../lib/x-linked-bayes-risk-v1660.js', import.meta.url), 'utf8');
  // Both reasons, so a later reader cannot restore the preset without meeting them.
  assert.match(lib, /THE 2\/3 BELONGS TO THE MOTHER, NOT THE SISTER/);
  assert.match(lib, /62\.3% to be carriers/, 'the empirical figure that is not 2/3');
  // The comment wraps, so match across the break rather than on one line.
  assert.match(lib, /6\.7% to carry a germline[\s/]*\n?[\s/]*mosaic/, 'the third outcome a two-row table hides');
  assert.match(lib, /PMC3631803/, 'the source must be named where the decision is');
});

test('the tile cites the source that was read', () => {
  const m = META['x-linked-bayes-risk'];
  assert.ok(m, 'the tile is in META');
  assert.match(m.citation, /Haldane/);
  assert.ok(m.citationUrl, 'a reader must be able to reach it');
});
