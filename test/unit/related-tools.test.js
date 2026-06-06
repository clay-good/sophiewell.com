// spec-v61 §2 A2: related-tool linking. Every id listed in META[id].related
// must resolve to a real, in-catalog tile (otherwise renderMetaBlock would
// render a dead link) and must not point at itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { META } from '../../lib/meta.js';

function catalogIds() {
  const src = readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const m = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!m) throw new Error('related-tools: could not find UTILITIES array in app.js');
  return new Set([...m[1].matchAll(/id:\s*'([^']+)'/g)].map((mm) => mm[1]));
}

test('every META.related id resolves to a real tile and is not self-referential', () => {
  const ids = catalogIds();
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m || !m.related) continue;
    assert.ok(Array.isArray(m.related), `${id}: related must be an array`);
    for (const rid of m.related) {
      if (rid === id) offenders.push(`${id}: related points at itself`);
      else if (!ids.has(rid)) offenders.push(`${id}: related id "${rid}" is not a real tile`);
    }
  }
  assert.deepEqual(offenders, [], `related-tool link failures:\n  - ${offenders.join('\n  - ')}`);
});

test('the related-tool seed clusters are present', () => {
  assert.deepEqual(META['wells-pe'].related, ['perc', 'pesi', 'years-pe']);
  assert.ok(META['cockcroft-gault'].related.includes('egfr-suite'));
  assert.ok(META['qsofa-sofa'].related.includes('news2'));
});
