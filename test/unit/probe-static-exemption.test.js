// spec-v1257: every exemption phrase now moves with the gap it describes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(new URL('../../scripts/probe-static-exemption.mjs', import.meta.url));

test('the static-exemption probe has no verdict-moving rows', () => {
  const output = execFileSync(process.execPath, [PROBE], { encoding: 'utf8' });
  assert.match(output, /0 row\(s\) across 0 calculator\(s\)/);
});
