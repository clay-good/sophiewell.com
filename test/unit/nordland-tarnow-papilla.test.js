// spec-v1488: the Nordland-Tarnow classification of papilla loss.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { nordlandTarnowPapilla as nt } from '../../lib/nordland-tarnow-papilla-v1488.js';

test('the worked example: a visible interproximal junction, tip above the facial one, is Class II', () => {
  const r = nt({ space: 'yes', interproximalCej: 'yes', facialCej: 'no' });
  assert.equal(r.band, 'Nordland-Tarnow Class II: the papilla tip lies at or apical to the interproximal cementoenamel junction, but coronal to the facial cementoenamel junction.');
});

test('each class from its landmarks', () => {
  assert.equal(nt({ space: 'no' }).bandLabel, 'Normal');
  assert.equal(nt({ space: 'yes', interproximalCej: 'no' }).bandLabel, 'Class I');
  assert.equal(nt({ space: 'yes', interproximalCej: 'yes', facialCej: 'yes' }).bandLabel, 'Class III');
});

test('a blank landmark that decides the class is asked for, and contradictions are refused', () => {
  for (const r of [nt({}), nt({ space: 'yes' }), nt({ space: 'yes', interproximalCej: 'yes' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
  assert.equal(nt({ space: 'no', interproximalCej: 'yes' }).valid, false);
  assert.equal(nt({ space: 'yes', interproximalCej: 'no', facialCej: 'yes' }).valid, false);
});
