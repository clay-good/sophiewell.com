// spec-v997: CONTRIBUTING tells a contributor "`npm run release:check` runs the same chain CI
// does. Before opening a PR, run `npm run release:check` locally. This is the same gate that runs
// in CI." It was not. CI has three jobs -- unit, mcp, e2e -- and release:check ran neither
// `npm run test:mcp` (421 tests, a whole job) nor anything from e2e.
//
// test:mcp is in release:check now. e2e cannot be: it takes about an hour and needs browsers, so
// CONTRIBUTING says that plainly instead of implying otherwise, and points at the fast 320px
// subset that has actually broken CI.
//
// This test is the part that keeps the sentence true: every command CI runs in the two jobs a
// contributor CAN reproduce locally must be reachable from release:check. A new CI step either
// joins the local chain or gets listed here as deliberately CI-only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Steps that exist only in CI and have no place in a local pre-flight. Each needs a reason.
const CI_ONLY = new Map([
  ['npm ci', 'installs the locked tree; a contributor already has one'],
  ['npm ci --prefix mcp', 'same, for the MCP package'],
  ['SOPHIEWELL_OFFLINE=1 node scripts/build-data.mjs', 'seeds datasets from the offline seed; restamps every manifest, so it is not something to run before a PR'],
  ['git diff --exit-code', 'asserts the runner\'s tree is clean after the build (spec-v990/v991); meaningless mid-edit'],
]);

// The scripts a job step invokes, in the two reproducible jobs.
function jobSteps(ciYaml, job) {
  const start = ciYaml.indexOf(`\n  ${job}:\n`);
  assert.notEqual(start, -1, `.github/workflows/ci.yml has no ${job} job`);
  const after = ciYaml.slice(start + 1);
  const nextJob = after.slice(1).search(/\n {2}[a-z0-9_-]+:\n {4}runs-on/);
  const body = nextJob === -1 ? after : after.slice(0, nextJob + 1);
  return [...body.matchAll(/^\s+run: (.+)$/gm)]
    .map((m) => m[1].trim())
    .filter((cmd) => !cmd.startsWith('>-'));
}

// Everything release:check reaches, following `npm run X` one level at a time.
function reachable(scripts, entry) {
  const seen = new Set();
  const out = new Set();
  const walk = (name) => {
    if (seen.has(name)) return;
    seen.add(name);
    const body = scripts[name];
    if (!body) return;
    out.add(body);
    for (const m of body.matchAll(/npm run ([a-z0-9:_-]+)/g)) walk(m[1]);
    for (const m of body.matchAll(/node (scripts\/[A-Za-z0-9_.-]+\.mjs[^&|]*)/g)) out.add(`node ${m[1].trim()}`);
  };
  walk(entry);
  return out;
}

test('release:check reaches every CI step a contributor can run locally', async () => {
  const ci = await readFile(join(ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  const local = reachable(pkg.scripts, 'release:check');
  const localText = [...local].join('\n');

  const missing = [];
  for (const job of ['unit', 'mcp']) {
    for (const cmd of jobSteps(ci, job)) {
      if ([...CI_ONLY.keys()].some((k) => cmd.startsWith(k))) continue;
      // A step is covered if release:check runs the same command, or an npm script whose body is it.
      const covered = localText.includes(cmd)
        || Object.entries(pkg.scripts).some(([n, b]) => b === cmd && local.has(pkg.scripts[n]))
        || [...local].some((b) => b.includes(cmd.replace(/^npm run /, '')) && cmd.startsWith('npm run'));
      if (!covered) missing.push(`${job}: ${cmd}`);
    }
  }
  assert.deepEqual(missing, [],
    'CI runs these and `npm run release:check` does not; add them to release:check or to CI_ONLY with a reason');
});

test('the e2e job is deliberately not claimed as locally reproducible', async () => {
  // If e2e ever became cheap enough to fold in, this test should be the thing that notices --
  // but the honest state today is that CONTRIBUTING must say it is not covered.
  const contributing = await readFile(join(ROOT, 'CONTRIBUTING.md'), 'utf8');
  assert.match(contributing, /release:check/, 'CONTRIBUTING no longer mentions release:check');
  assert.match(contributing, /does not run the end-to-end/i,
    'CONTRIBUTING must say plainly that release:check does not run the e2e suite');
  assert.match(contributing, /npm run test:mobile/, 'CONTRIBUTING must point at the fast 320px subset');
});
