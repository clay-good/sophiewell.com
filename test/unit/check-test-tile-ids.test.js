// spec-v952: prove the gate bites on the defect that put CI red -- a test
// navigating to a tile that was retired an hour earlier.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  findTestTileIds, parseIds, findViolations, ALIAS_TESTS,
} from '../../scripts/check-test-tile-ids.mjs';

const APP = `
const UTILITIES = [
  { id: 'cpss', name: 'CPSS', group: 'G', clinical: true },
  { id: 'field-triage', name: 'Trauma Triage', group: 'I', clinical: true },
];
const RETIRED_TILE_ALIASES = new Map([
  ['cincinnati', 'cpss'],
]);
const other = { id: 'tool-body' };
`;

test('parseIds stops at the array, not at the end of the file', () => {
  const { live, retired } = parseIds(APP);
  assert.deepEqual([...live].sort(), ['cpss', 'field-triage']);
  assert.equal(live.has('tool-body'), false, 'the DOM helper below the array is not a tile');
  assert.equal(retired.get('cincinnati'), 'cpss');
});

test('findTestTileIds reads a tile id out of both URL shapes', () => {
  const found = findTestTileIds([
    "await page.goto('/#cincinnati');",
    'await page.goto("/tools/cpss/");',
    "const s = 'not-a-url';",
  ].join('\n'));
  assert.deepEqual(found, [{ id: 'cincinnati', line: 1 }, { id: 'cpss', line: 2 }]);
});

test('the spec-v951 failure fails this gate', () => {
  const { live, retired } = parseIds(APP);
  const files = [{ path: 'test/integration/smoke.spec.js', text: "await page.goto('/#cincinnati');" }];
  const v = findViolations({ files, live, retired });
  assert.equal(v.length, 1, v.join('\n'));
  assert.match(v[0], /retired in favour of 'cpss'/);
});

test('an id that was never a tile fails differently', () => {
  const { live, retired } = parseIds(APP);
  const files = [{ path: 'test/integration/x.spec.js', text: "await page.goto('/#never-existed');" }];
  const v = findViolations({ files, live, retired });
  assert.equal(v.length, 1);
  assert.match(v[0], /which is not a tile/);
});

test('a test that is deliberately exercising a redirect can opt out, per file and id', () => {
  const { live, retired } = parseIds(APP);
  const files = [{ path: 'test/integration/redirect.spec.js', text: "await page.goto('/#cincinnati');" }];
  const allowed = new Set(['test/integration/redirect.spec.js:cincinnati']);
  assert.deepEqual(findViolations({ files, live, retired, aliasTests: allowed }), []);
  // and the opt-out does not carry to another file
  const elsewhere = [{ path: 'test/integration/other.spec.js', text: "await page.goto('/#cincinnati');" }];
  assert.equal(findViolations({ files: elsewhere, live, retired, aliasTests: allowed }).length, 1);
});

// The gate skips this file, because the ids above are fixtures rather than
// navigation. This last case is the one that reads the real suite.
test('a live tile passes, and the shipped suite is clean', async () => {
  const { live, retired } = parseIds(APP);
  assert.deepEqual(
    findViolations({ files: [{ path: 'x', text: "page.goto('/#field-triage')" }], live, retired }), [],
  );
  // The real catalog against the real smoke test, which spec-v951 repointed.
  const real = parseIds(await readFile(new URL('../../app.js', import.meta.url), 'utf8'));
  const smoke = await readFile(new URL('../integration/smoke.spec.js', import.meta.url), 'utf8');
  assert.deepEqual(
    findViolations({ files: [{ path: 'test/integration/smoke.spec.js', text: smoke }], ...real, aliasTests: ALIAS_TESTS }),
    [],
  );
});
