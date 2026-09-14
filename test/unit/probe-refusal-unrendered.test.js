// spec-v1249: a renderer that checks for a missing score and prints the
// library's refusal band is not an unrendered refusal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(new URL('../../scripts/probe-refusal-unrendered.mjs', import.meta.url));

test('refusal probe recognizes null-score branches that render the refusal', () => {
  const output = execFileSync(process.execPath, [PROBE], { encoding: 'utf8' });

  assert.match(output, /0 actionable tile\(s\)/);
  assert.match(output, /Excluded: 179 populated-select-only state\(s\)/);
  for (const id of ['bard-score', 'snappe-ii', 'tash-score', 'rabt-score', 'alt-70', 'pirani-clubfoot', 'dimeglio-clubfoot']) {
    assert.doesNotMatch(output, new RegExp(`  ${id}  `));
  }
  assert.doesNotMatch(output, / {2}la-esophagitis {2}/);
});

test('refusal probe keeps its excluded select-only rows auditable', () => {
  const rows = JSON.parse(execFileSync(process.execPath, [PROBE, '--json'], { encoding: 'utf8' }));

  assert.equal(rows.length, 179);
  assert.ok(rows.every((row) => row.reachability === 'select-only-unreachable'));
  assert.ok(rows.some((row) => row.tile === 'la-esophagitis'));
});
