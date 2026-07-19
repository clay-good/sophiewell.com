// spec-v481: Wiltse spondylolisthesis etiology classification (types I-V).
// Worked-example tests: each type and its etiology description, numeric input, invalid-type guard.
// Types transcribed from Wiltse, Newman & Macnab 1976 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wiltseSpondylolisthesis } from '../../lib/wiltse-spondylolisthesis-v481.js';

test('type II: isthmic (the META example)', () => {
  const r = wiltseSpondylolisthesis({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /isthmic: a lesion in the pars interarticularis/);
});

test('type I: dysplastic', () => {
  assert.match(wiltseSpondylolisthesis({ type: 'I' }).band, /dysplastic: congenital dysplasia/);
});

test('type III: degenerative', () => {
  assert.match(wiltseSpondylolisthesis({ type: 'III' }).band, /degenerative: long-standing intersegmental instability/);
});

test('type V: pathologic', () => {
  const r = wiltseSpondylolisthesis({ type: 'V' });
  assert.equal(r.type, 'V');
  assert.match(r.band, /pathologic: generalized or localized bone disease/);
});

test('numeric input maps to the types', () => {
  assert.equal(wiltseSpondylolisthesis({ type: 1 }).type, 'I');
  assert.equal(wiltseSpondylolisthesis({ type: 4 }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(wiltseSpondylolisthesis({}).valid, false);
  assert.equal(wiltseSpondylolisthesis({ type: 'VI' }).valid, false);
  assert.equal(wiltseSpondylolisthesis({ type: '0' }).valid, false);
});
