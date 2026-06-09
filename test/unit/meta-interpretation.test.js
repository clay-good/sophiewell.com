// spec-v11 §5.4: CI guard for the optional META[id].interpretation
// field. The field is tightly scoped on purpose; the guard rejects the
// shapes spec-v11 §5.3 names as out-of-bounds (Sophie-authored phrasing,
// missing sourceQuoted: true, oversize band text).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';

const FORBIDDEN_PHRASES = [
  'sophie',
  'we recommend',
  'you should',
  'consider ordering',
];

test('META.interpretation: sourceQuoted: true and non-empty sourceCitation', () => {
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m || !m.interpretation) continue;
    const interp = m.interpretation;
    if (interp.sourceQuoted !== true) {
      offenders.push(`${id}: interpretation.sourceQuoted must be true`);
    }
    if (typeof interp.sourceCitation !== 'string' || interp.sourceCitation.length === 0) {
      offenders.push(`${id}: interpretation.sourceCitation must be a non-empty string`);
    }
  }
  assert.deepEqual(offenders, [],
    `interpretation guard failures:\n  - ${offenders.join('\n  - ')}`);
});

test('META.interpretation: every band text <=200 chars and free of Sophie-authored phrasing', () => {
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m || !m.interpretation) continue;
    const bands = m.interpretation.bands;
    if (!Array.isArray(bands) || bands.length === 0) {
      offenders.push(`${id}: interpretation.bands must be a non-empty array`);
      continue;
    }
    for (let i = 0; i < bands.length; i++) {
      const band = bands[i] || {};
      if (typeof band.range !== 'string' || !band.range.length) {
        offenders.push(`${id}: bands[${i}].range must be a non-empty string`);
      }
      if (typeof band.text !== 'string' || !band.text.length) {
        offenders.push(`${id}: bands[${i}].text must be a non-empty string`);
        continue;
      }
      if (band.text.length > 200) {
        offenders.push(`${id}: bands[${i}].text length ${band.text.length} > 200`);
      }
      const lower = band.text.toLowerCase();
      for (const phrase of FORBIDDEN_PHRASES) {
        if (lower.includes(phrase)) {
          offenders.push(`${id}: bands[${i}].text contains forbidden phrase "${phrase}"`);
        }
      }
    }
  }
  assert.deepEqual(offenders, [],
    `interpretation guard failures:\n  - ${offenders.join('\n  - ')}`);
});

// spec-v61 A8 invariant: any tile whose derivation carries discrete result
// bands (a score that maps its total to named cut-points) must also surface a
// source-anchored "Per source:" interpretation block, so the bedside user sees
// what the number means and not just where it comes from. Continuous-mortality
// scores (e.g. pelod2, psofa) deliberately omit derivation.bands and are
// therefore out of this invariant. This guard keeps the two displays from
// drifting apart as future band-carrying scores are added.
test('META: every tile with discrete derivation.bands also carries an interpretation block', () => {
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m || !m.derivation) continue;
    const bands = m.derivation.bands;
    if (!Array.isArray(bands) || bands.length === 0) continue;
    if (!m.interpretation || !Array.isArray(m.interpretation.bands) || m.interpretation.bands.length === 0) {
      offenders.push(`${id}: has derivation.bands but no interpretation.bands`);
    }
  }
  assert.deepEqual(offenders, [],
    `derivation-band tiles missing interpretation:\n  - ${offenders.join('\n  - ')}`);
});

// spec-v62 §2 A2 invariant: the optional META[id].actions block carries the
// governing publication's verbatim "next step" recommendation. Every entry must
// name its source and ship at least one band with a range and a step; the words
// shown are the source's, not Sophie's (same FORBIDDEN_PHRASES guard as
// interpretation). Only the deliberately-seeded instruments carry it.
test('META.actions: non-empty source, well-formed bands, no Sophie-authored phrasing', () => {
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m || !m.actions) continue;
    const a = m.actions;
    if (typeof a.source !== 'string' || a.source.length === 0) {
      offenders.push(`${id}: actions.source must be a non-empty string`);
    }
    if (!Array.isArray(a.bands) || a.bands.length === 0) {
      offenders.push(`${id}: actions.bands must be a non-empty array`);
      continue;
    }
    for (const band of a.bands) {
      if (!band || typeof band.range !== 'string' || band.range.length === 0) {
        offenders.push(`${id}: every actions band needs a non-empty range`);
      }
      if (!band || typeof band.step !== 'string' || band.step.length === 0) {
        offenders.push(`${id}: every actions band needs a non-empty step`);
      }
      const hay = `${band && band.step}`.toLowerCase();
      for (const phrase of FORBIDDEN_PHRASES) {
        if (hay.includes(phrase)) offenders.push(`${id}: actions step contains forbidden phrase "${phrase}"`);
      }
    }
  }
  assert.deepEqual(offenders, [],
    `actions guard failures:\n  - ${offenders.join('\n  - ')}`);
});
