// spec-v1497: the Veau classification of cleft palate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { veauCleft as vc } from '../../lib/veau-cleft-v1497.js';

test('the worked example: a complete unilateral cleft is class III', () => {
  assert.equal(vc({ palate: 'hard', lip: 'unilateral' }).band, 'Veau class III: a complete unilateral cleft, through the lip, alveolus and palate on one side.');
});

test('every class', () => {
  assert.deepEqual([['soft', 'none'], ['hard', 'none'], ['hard', 'unilateral'], ['hard', 'bilateral']].map(([palate, lip]) => vc({ palate, lip }).veau), ['I', 'II', 'III', 'IV']);
});

test('blanks are asked for; an intact palate and a contradiction are refused', () => {
  for (const r of [vc({}), vc({ palate: 'hard' }), vc({ palate: 'none', lip: 'none' }), vc({ palate: 'soft', lip: 'bilateral' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});
