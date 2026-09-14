// spec-v1249: a renderer that checks for a missing score and prints the
// library's refusal band is not an unrendered refusal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(new URL('../../scripts/probe-refusal-unrendered.mjs', import.meta.url));

test('refusal probe recognizes null-score branches that render the refusal', () => {
  const output = execFileSync(process.execPath, [PROBE], { encoding: 'utf8' });

  assert.match(output, /181 tile\(s\)/);
  for (const id of ['bard-score', 'snappe-ii', 'tash-score', 'rabt-score', 'alt-70']) {
    assert.doesNotMatch(output, new RegExp(`  ${id}  `));
  }
  assert.match(output, / {2}la-esophagitis {2}/);
});
