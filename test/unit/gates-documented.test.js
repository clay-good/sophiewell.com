// spec-v982: the lint chain reads itself, so a new gate cannot be anonymous.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { lintChainScripts, undocumented } from '../../scripts/check-gates-documented.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

test('lintChainScripts reads every script out of the chain, once', () => {
  const pkg = { scripts: { lint: 'eslint . && node scripts/a.mjs && node scripts/b.mjs --check && node scripts/a.mjs' } };
  assert.deepEqual(lintChainScripts(pkg), ['a.mjs', 'b.mjs']);
  assert.deepEqual(lintChainScripts({ scripts: {} }), []);
});

// spec-v985: the shape cases. The chain calls every gate directly today, so a
// probe that only read `scripts/<x>.mjs` out of one string found all of them --
// and would report clean the first time a step moved behind `npm run <name>`,
// leaving that gate anonymous again with nothing to say so.
test('a gate hidden behind npm run is still found', () => {
  assert.deepEqual(
    lintChainScripts({ scripts: { lint: 'node scripts/a.mjs && npm run sub', sub: 'node scripts/hidden.mjs' } }),
    ['a.mjs', 'hidden.mjs'],
  );
  assert.deepEqual(
    lintChainScripts({ scripts: { lint: 'npm run one', one: 'npm run two', two: 'node scripts/deep.mjs' } }),
    ['deep.mjs'],
  );
});

test('indirection that loops or dead-ends does not hang or throw', () => {
  assert.deepEqual(lintChainScripts({ scripts: { lint: 'npm run lint && node scripts/a.mjs' } }), ['a.mjs']);
  assert.deepEqual(lintChainScripts({ scripts: { lint: 'npm run nope && node scripts/a.mjs' } }), ['a.mjs']);
  assert.deepEqual(lintChainScripts({ scripts: { lint: 'npm run b', b: 'npm run lint' } }), []);
});

test('a gate named nowhere is a violation; one named anywhere is not', () => {
  assert.deepEqual(undocumented(['a.mjs', 'b.mjs'], 'we run scripts/a.mjs to check things'), ['b.mjs']);
  assert.deepEqual(undocumented(['a.mjs'], 'scripts/a.mjs'), []);
});

test('the live lint chain is fully documented, and the gate itself is in it', () => {
  const pkg = JSON.parse(readFileSync(`${ROOT}/package.json`, 'utf8'));
  const scripts = lintChainScripts(pkg);
  assert.ok(scripts.includes('check-gates-documented.mjs'), 'the check must be in the chain it checks');
  const contributing = readFileSync(`${ROOT}/CONTRIBUTING.md`, 'utf8');
  // Every gate is in CONTRIBUTING's own table, which is the place a contributor
  // reads after CI refuses their PR.
  const missing = scripts.filter((s) => !contributing.includes(s));
  assert.deepEqual(missing, [], 'gates missing from the CONTRIBUTING gate table');
});

test('CONTRIBUTING no longer sends contributors to the abandoned audit directory', () => {
  // docs/audits/ was last written in July 2026, about 860 calculators ago. The
  // guide told strangers to add a file there for every new tile.
  const contributing = readFileSync(`${ROOT}/CONTRIBUTING.md`, 'utf8');
  const recipe = contributing.slice(
    contributing.indexOf('## How to add a calculator'),
    contributing.indexOf('## How to add or change a commitment'),
  );
  assert.ok(!/Add an audit log/i.test(recipe), 'the audit-log step is gone');
  // And it now names the step that actually fails CI for a new calculator.
  assert.ok(recipe.includes('mcp/catalog.js'), 'the MCP registration step is named');
  assert.ok(recipe.includes('docs/mcp-coverage.md'), 'the MCP coverage ledger is named');
});
