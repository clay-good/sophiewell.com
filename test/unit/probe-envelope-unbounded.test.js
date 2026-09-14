// spec-v1251: the envelope probe recognizes its known reassuring vocabulary
// and does not map ratio inputs merely because their metadata names an example
// unit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(new URL('../../scripts/probe-envelope-unbounded.mjs', import.meta.url));

test('envelope probe keeps its drained queue after LIPI documents shared units', () => {
  const output = execFileSync(process.execPath, [PROBE], { encoding: 'utf8' });

  assert.match(output, /^0 field\(s\) across 0 calculator\(s\) answer/m);
  assert.match(output, /REASSURING FROM AN IMPOSSIBLE VALUE -- 0/);
  assert.doesNotMatch(output, /lipi\|lipi-wbc/);
});
