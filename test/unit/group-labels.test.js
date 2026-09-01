// spec-v953: the visible group name is declared in five files. This proves the
// drift detector bites on each way they can disagree, and that the five shipped
// copies agree right now.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LABEL_FILES, parseGroupLabels, findLabelDrift } from '../../scripts/lib/group-labels.mjs';

const TRUTH = { path: 'app.js', labels: { A: 'Billing & Coding', B: 'Billing & Reimbursement' } };

test('parseGroupLabels reads the map and nothing after it', () => {
  const text = [
    'const GROUP_LABELS = {',
    "  A: 'Billing & Coding',",
    "  'B': 'Billing & Reimbursement',",
    '};',
    "const other = { Z: 'Not a group' };",
  ].join('\n');
  assert.deepEqual(parseGroupLabels(text), { A: 'Billing & Coding', B: 'Billing & Reimbursement' });
  assert.equal(parseGroupLabels('no map here'), null);
});

test('a missing group is reported as printing the bare letter', () => {
  // The real defect: audit-coverage.mjs had no B, so its report read "B B".
  const v = findLabelDrift([TRUTH, { path: 'scripts/audit-coverage.mjs', labels: { A: 'Billing & Coding' } }]);
  assert.equal(v.length, 1, v.join('\n'));
  assert.match(v[0], /missing group B .*bare letter/);
});

test('a renamed group is reported with both names', () => {
  const v = findLabelDrift([TRUTH, { path: 'x.mjs', labels: { A: 'Billing and Coding', B: 'Billing & Reimbursement' } }]);
  assert.equal(v.length, 1, v.join('\n'));
  assert.match(v[0], /calls group A "Billing and Coding" where app\.js calls it "Billing & Coding"/);
});

test('an extra group nobody else has is reported too', () => {
  const v = findLabelDrift([TRUTH, { path: 'x.mjs', labels: { ...TRUTH.labels, Q: 'Invented' } }]);
  assert.equal(v.length, 1, v.join('\n'));
  assert.match(v[0], /names a group Q .*that app\.js does not have/);
});

test('a copy that has lost its map entirely is reported', () => {
  const v = findLabelDrift([TRUTH, { path: 'x.mjs', labels: null }]);
  assert.equal(v.length, 1);
  assert.match(v[0], /declares no GROUP_LABELS/);
});

test('agreement reports nothing', () => {
  assert.deepEqual(findLabelDrift([TRUTH, { path: 'x.mjs', labels: { ...TRUTH.labels } }]), []);
});

test('the five shipped copies agree', async () => {
  const files = [];
  for (const path of LABEL_FILES) {
    files.push({ path, labels: parseGroupLabels(await readFile(new URL(`../../${path}`, import.meta.url), 'utf8')) });
  }
  assert.deepEqual(findLabelDrift(files), []);
  assert.equal(Object.keys(files[0].labels).length, 15);
});
