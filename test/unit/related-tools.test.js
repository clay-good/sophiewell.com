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

test('the spec-v63 OA5 ops related-tool cluster is present and resolves', () => {
  // The ops workflow chain: denial -> appeal-deadline -> appeal-letter; PA
  // request -> pa-turnaround -> pa-lint; breach -> breach-clock -> notice
  // content. Pin the seed links so the ops rollout cannot silently regress.
  assert.ok(META['appeal-deadline'].related.includes('appeal-letter'));
  assert.ok(META['pa-turnaround'].related.includes('pa-lint'));
  assert.ok(META['breach-clock'].related.includes('overpayment-60day'));
  assert.ok(META['em-mdm'].related.includes('em-time'));
});

test('the spec-v61 A2 related-tool rollout reaches most of the catalog', () => {
  // A2 finished the related-tool linking pass: the RELATED_BACKFILL map in
  // lib/meta.js fills the clinical families on top of the inline v61 seeds.
  // This floor keeps the rollout from silently regressing (it was 9 tiles
  // before the backfill, 267 after).
  const linked = Object.values(META).filter(
    (m) => m && Array.isArray(m.related) && m.related.length,
  ).length;
  assert.ok(linked >= 250, `expected >=250 tiles with related links, found ${linked}`);
});

test('every related list is short enough to render on a phone', () => {
  // renderMetaBlock lays the related tools out as a single horizontal-wrapping
  // row; an overlong list crowds the result on a 320px screen. spec-v61 A2
  // keeps every cluster to <=4 siblings.
  const offenders = [];
  for (const [id, m] of Object.entries(META)) {
    if (!m || !m.related) continue;
    if (m.related.length > 4) offenders.push(`${id}: ${m.related.length} related (>4)`);
    if (new Set(m.related).size !== m.related.length) offenders.push(`${id}: duplicate related id`);
  }
  assert.deepEqual(offenders, [], `related-list shape failures:\n  - ${offenders.join('\n  - ')}`);
});
