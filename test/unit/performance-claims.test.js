// spec-v1005: docs/performance.md described Lighthouse category floors as "hard
// CI gates" that "fail the build". Commit 120bacd7 ("fix(security): harden
// problem report pipeline", 2026-08-23) deleted the entire `lighthouse` job from
// ci.yml along with thirty-one other lines and said nothing about it in the
// message. The document kept the claim for eleven days.
//
// The same shape as spec-v995 (licensing docs naming two deleted tests) and
// spec-v997 (CONTRIBUTING calling release:check "the same gate CI runs"). This
// binds the document to the workflow so they cannot disagree again, in whichever
// direction the project later chooses: wire Lighthouse back in and the doc must
// stop saying it does not run; leave it out and the doc must not promise a gate.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

async function workflowsMentionLighthouse() {
  const dir = join(ROOT, '.github', 'workflows');
  for (const f of await readdir(dir)) {
    if (!/\.ya?ml$/.test(f)) continue;
    const text = await readFile(join(dir, f), 'utf8');
    if (/lhci|lighthouse/i.test(text)) return f;
  }
  return null;
}

test('the performance doc agrees with the workflows about whether Lighthouse runs', async () => {
  const doc = await readFile(join(ROOT, 'docs', 'performance.md'), 'utf8');
  const inCi = await workflowsMentionLighthouse();
  const claimsItDoesNotRun = /\*\*Lighthouse does not run in CI\.\*\*/.test(doc);

  if (inCi) {
    assert.equal(claimsItDoesNotRun, false,
      `${inCi} runs Lighthouse, so docs/performance.md must stop saying it does not`);
  } else {
    assert.equal(claimsItDoesNotRun, true,
      'no workflow runs Lighthouse, so docs/performance.md must say so plainly');
    assert.ok(!/hard CI gates/.test(doc),
      'no workflow runs Lighthouse, so nothing in it may be called a hard CI gate');
    assert.ok(!/The build \*\*fails\*\*/.test(doc),
      'no workflow runs Lighthouse, so the doc may not say the build fails on its assertions');
  }
});

test('the Lighthouse config does not publish to third-party storage', async () => {
  // A dormant config is still a config. `temporary-public-storage` uploads a
  // report of the site to a public bucket on every run, which for this project
  // is a decision to make deliberately, not a default to inherit.
  const cfg = JSON.parse(await readFile(join(ROOT, '.lighthouserc.json'), 'utf8'));
  assert.notEqual(cfg.ci?.upload?.target, 'temporary-public-storage');
  assert.equal(cfg.ci?.upload?.target, 'filesystem');
});

test('the doc names a command that exists for running it by hand', async () => {
  const doc = await readFile(join(ROOT, 'docs', 'performance.md'), 'utf8');
  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  const named = [...doc.matchAll(/npm run ([a-z0-9:_-]+)/g)].map((m) => m[1]);
  assert.ok(named.length > 0, 'the doc should name a way to run the config');
  for (const s of named) {
    assert.ok(pkg.scripts[s], `docs/performance.md names \`npm run ${s}\` and package.json has no such script`);
  }
});

test('the sampled routes are real tiles, not retired ids', async () => {
  // A previous drift sampled #icd10 (removed at spec-v29) and #mpfs (a dataset,
  // not a tile), so the run was measuring pages that did not exist.
  const cfg = JSON.parse(await readFile(join(ROOT, '.lighthouserc.json'), 'utf8'));
  const app = await readFile(join(ROOT, 'app.js'), 'utf8');
  const start = app.indexOf('const UTILITIES = [');
  const body = app.slice(start, app.indexOf('\n];', start));
  const live = new Set([...body.matchAll(/^ {2}\{ id: '([^']+)',/gm)].map((m) => m[1]));
  const missing = [];
  for (const url of cfg.ci.collect.url) {
    const id = (url.match(/#(.+)$/) || [])[1];
    if (id && !live.has(id)) missing.push(id);
  }
  assert.deepEqual(missing, [], 'the Lighthouse config samples tile routes that no longer exist');
});
