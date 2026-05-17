// spec-v11 §3.5: every citation string is non-empty, <=300 characters,
// and does not contain a bare URL (URLs rot; spec-v9 §4.2 already
// enforces this style - v11 pins it in CI).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';

const URL_REGEX = /https?:\/\/\S+/i;

test('META citations: non-empty, <=300 chars, no bare URLs', () => {
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m) continue;
    if (typeof m.citation !== 'string') continue; // some pure-source entries have no citation
    const c = m.citation;
    if (c.length === 0) offenders.push(`${id}: empty citation`);
    if (c.length > 300) offenders.push(`${id}: citation length ${c.length} > 300`);
    if (URL_REGEX.test(c)) offenders.push(`${id}: citation contains a bare URL`);
  }
  assert.deepEqual(offenders, [],
    `citation guard failures:\n  - ${offenders.join('\n  - ')}`);
});
