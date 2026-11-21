// spec-v1760: the floor finder reads zero, across a reach that does not shrink. Before it existed, 113 fields
// answered at half their floor (a BMI of 2.5, a weight of 150 g, a systolic of 10, a sodium of 45).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = fileURLToPath(new URL('../../scripts/probe-envelope-floor.mjs', import.meta.url));

test('envelope floor probe: no field answers at half its floor, across the full map', () => {
  const run = spawnSync(process.execPath, [PROBE], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.trim(), '', `fields still answer below their floor:\n${run.stdout}`);
  const m = /(\d+) of (\d+) field\(s\)/.exec(run.stderr);
  assert.ok(m, `no summary line: ${run.stderr}`);
  assert.equal(Number(m[1]), 0);
  assert.ok(Number(m[2]) >= 550, `reach fell to ${m[2]} fields; the map has lost rows`);
});
