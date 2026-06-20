// spec-v127 2.2: RIFLE (Bellomo 2004). Worst of creatinine/GFR and urine output.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rifleAki } from '../../lib/nephro-v127.js';

test('creatinine x2.2 -> Injury', () => {
  const r = rifleAki({ baselineCr: 1.0, currentCr: 2.2 });
  assert.equal(r.valid, true);
  assert.equal(r.className, 'Injury');
  assert.match(r.band, /creatinine\/GFR/);
});

test('worst-of rule: urine output Failure overrides a mild creatinine', () => {
  const r = rifleAki({ baselineCr: 1.0, currentCr: 1.0, uoClass: '3' });
  assert.equal(r.className, 'Failure');
  assert.match(r.band, /urine output/);
});

test('x1.5 -> Risk; x3 -> Failure', () => {
  assert.equal(rifleAki({ baselineCr: 1.0, currentCr: 1.6 }).className, 'Risk');
  assert.equal(rifleAki({ baselineCr: 1.0, currentCr: 3.0 }).className, 'Failure');
});

test('no criteria met / nothing entered handled', () => {
  assert.equal(rifleAki({ baselineCr: 1.0, currentCr: 1.0 }).class, 0);
  assert.equal(rifleAki({}).valid, false);
  assert.equal(rifleAki(9).valid, false);
});
