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
