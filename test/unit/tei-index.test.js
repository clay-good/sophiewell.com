// spec-v194 2.3: teiIndex worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { teiIndex } from '../../lib/hemo-v194.js';

test('above LV normal band', () => {
  const r = teiIndex({ivct:80,ivrt:90,et:250});
  assert.equal(r.valid, true);
  assert.equal(r.value, 0.68);
  assert.equal(r.abnormal, true);
});

test('within LV normal band', () => {
  const r = teiIndex({ivct:40,ivrt:60,et:280});
  assert.equal(r.value, 0.36);
  assert.equal(r.abnormal, false);
});

test('guards: ET must be positive', () => {
  const r = teiIndex({ivct:80,ivrt:90,et:0});
  assert.equal(r.valid, false);
});
