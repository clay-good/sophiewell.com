// docs/unbuilt-tools.md is generated from the specs and the catalog, so it cannot claim a tool is built
// when it is not, or go stale when one ships. This regenerates it and compares, the same contract
// lib/label-editions.js has with its watch file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build, collect, firstSentence, reasonFor, catalogIds, DOC } from '../../scripts/build-unbuilt-index.mjs';

test('the committed page is exactly what the generator writes', () => {
  assert.equal(readFileSync(DOC, 'utf8'), build(), 'run `node scripts/build-unbuilt-index.mjs`');
});

test('every tool listed is genuinely missing from the catalog, and says why', () => {
  const live = catalogIds(readFileSync(new URL('../../app.js', import.meta.url), 'utf8'));
  const rows = collect();
  assert.ok(rows.length > 0, 'the page lists the specified tools that are not built');
  const noReason = rows.filter((r) => !r.reason).map((r) => `${r.spec} ${r.id}`);
  assert.deepEqual(noReason, [], 'a spec that leaves a tool unbuilt has to say why');
  for (const r of rows) {
    assert.ok(!live.has(r.id), `${r.id} is in the catalog, so it does not belong on the page`);
    assert.match(r.id, /^[a-z0-9-]+$/);
  }
  assert.equal(new Set(rows.map((r) => r.id)).size, rows.length, 'one row per tool');
});

test('a reason is not cut short at the full stop inside a citation', () => {
  assert.equal(firstSentence('Onder G et al. Arch Intern Med 2010 was not opened. Then more.'),
    'Onder G et al. Arch Intern Med 2010 was not opened.');
  assert.equal(firstSentence('Schumock GT, Thornton JP. Hosp Pharm 1992;27:538 was not opened.'),
    'Schumock GT, Thornton JP. Hosp Pharm 1992;27:538 was not opened.');
  assert.equal(firstSentence('Plain one. Second.'), 'Plain one.');
  assert.equal(firstSentence('No full stop here'), 'No full stop here');
});

test('the reason comes from a build gate first, then a licence line, then the build status', () => {
  const gated = '### 1. `x` - X\n**Licensing.** Fine to ship.\n\n**Build gate.** The paper was not opened.\n';
  assert.equal(reasonFor(gated), 'The paper was not opened.');
  const licensed = '### 1. `x` - X\n**Licensing.** Unclear: terms unconfirmed. More text.\n';
  assert.equal(reasonFor(licensed), 'Unclear: terms unconfirmed.');
  const viaStatus = '## Build status\n\n| 9. `y` | Not built: held. Waiting on the owner. |\n';
  assert.equal(reasonFor('### 9. `y` - Y\n**Input.** Something.\n', viaStatus, 'y'), 'Not built: held. Waiting on the owner.');
  assert.equal(reasonFor('### 9. `z` - Z\n**Input.** Something.\n', viaStatus, 'z'), null);
});
