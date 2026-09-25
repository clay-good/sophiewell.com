// spec-v1498: the Essex-Lopresti classification of calcaneal fractures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { essexLoprestiCalcaneal as el } from '../../lib/essex-lopresti-calcaneal-v1498.js';

test('the worked example: a line behind the posterior facet is joint-depression', () => {
  assert.equal(el({ subtalar: 'yes', exit: 'facet' }).band, 'Joint-depression fracture: the secondary line runs vertically through or behind the posterior facet, which is displaced downward on its own fragment (AO 82C).');
});

test('each type', () => {
  assert.equal(el({ subtalar: 'no' }).bandLabel, 'Extra-articular');
  assert.equal(el({ subtalar: 'yes', exit: 'tuberosity' }).bandLabel, 'Tongue-type');
});

test('a blank that decides the type is asked for', () => {
  for (const r of [el({}), el({ subtalar: 'yes' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});
