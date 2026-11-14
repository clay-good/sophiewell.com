// spec-v1721: the weekly data refresh must reach a person even when its own checks go red.
//
// The label watch marks a row superseded the moment DailyMed changes a section a tool reads, and the
// tools that quote that row then withhold their figures -- the fail-closed rule of spec-v1628 route D,
// working. The checks that assert those figures fail with it, correctly. What must NOT happen is what
// happened on 2026-11-08: the job died at the checks, before it packaged anything, so no pull request
// opened, the "Data freshness" issue went unwritten, and fifteen datasets' updates were discarded.
//
// Both directions are pinned here, because each failure is quiet in the opposite way. Reordering the
// suite back in front of packaging loses a week's work and looks like a normal red run; deleting the
// suite, or letting the merge decision stop reading it, makes the run green and merges bytes nothing
// checked.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const yaml = readFileSync(join(ROOT, '.github/workflows/data-refresh.yml'), 'utf8');

const at = (needle) => {
  const i = yaml.indexOf(needle);
  assert.notEqual(i, -1, `data-refresh.yml no longer contains ${JSON.stringify(needle)}`);
  return i;
};

test('the week\'s work is packaged and uploaded before the checks that may go red', () => {
  const pack = at('- name: Package reviewed changes');
  const upload = at('- name: Upload reviewed changes');
  const suite = at('- name: Run full test suite on refreshed data');
  assert.ok(pack < suite, 'Package reviewed changes must run before the test suite');
  assert.ok(upload < suite, 'Upload reviewed changes must run before the test suite');
});

test('a red suite reports itself but does not abort the job before the upload', () => {
  const suite = yaml.slice(at('- name: Run full test suite on refreshed data'));
  assert.match(suite.slice(0, 200), /id: suite/);
  assert.match(suite.slice(0, 200), /continue-on-error: true/);
  // Still runs all three, so making the run green by deleting a check fails here.
  for (const cmd of ['npm run lint', 'npm run test:unit', 'npm run test:a11y']) {
    assert.ok(suite.slice(0, 600).includes(cmd), `the suite no longer runs ${cmd}`);
  }
});

test('a red suite reddens the run from its own job, so refresh keeps its outputs', () => {
  // If `refresh` failed, publish and freshness would hang on whether GitHub hands a FAILED job's
  // outputs to its dependents. If it does not, they skip and the week is lost silently -- the very
  // bug this replaces. So the refresh job must END on the suite step and fail nowhere after it.
  const steps = yaml.slice(at('  refresh:'), at('  suite-result:'));
  assert.ok(!/exit 1/.test(steps), 'the refresh job must not fail itself after packaging');
  assert.match(yaml, /suite-result:\n\s*needs: refresh\n(?:\s*#[^\n]*\n)*\s*if: \$\{\{ !cancelled\(\) && needs\.refresh\.outputs\.suite != 'success' \}\}/);
  assert.ok(/suite-result:[\s\S]*exit 1/.test(yaml), 'suite-result must fail the run');
});

test('publish and freshness run on the artifact, not on the job having survived', () => {
  // `${{ }}` is required, not cosmetic: a bare leading `!` is a YAML tag indicator and the file
  // will not parse without it.
  const gate = /if: \$\{\{ !cancelled\(\) && needs\.refresh\.outputs\.packaged == 'true' \}\}/g;
  assert.equal((yaml.match(gate) || []).length, 2, 'both publish and freshness must be gated on the artifact');
  assert.match(yaml, /outputs:\s*\n\s*packaged: \$\{\{ steps\.pack\.outputs\.packaged \}\}/);
  assert.match(yaml, /suite: \$\{\{ steps\.suite\.outcome \}\}/);
  assert.match(yaml, /echo "packaged=true" >> "\$GITHUB_OUTPUT"/);
});

test('nothing auto-merges bytes the suite did not pass', () => {
  assert.match(
    yaml,
    /if \[ "\$\{\{ needs\.refresh\.outputs\.suite \}\}" != "success" \]; then decision=review; fi/,
    'the merge decision must refuse when the suite was not green',
  );
  // The superseded-label branch that was unreachable before stays, and stays ahead of the merge.
  assert.ok(at('Re-read these rows in') < at('gh pr merge'));
});

test('the pull request says in its body when the suite was red', () => {
  assert.match(yaml, /if: needs\.refresh\.outputs\.suite != 'success'/);
  assert.ok(at('- name: Say so when the suite did not pass') < at('- name: Open pull request if data changed'));
});
