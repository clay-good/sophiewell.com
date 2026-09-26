// spec-v1510 tool 6: annual therapy cost comparison.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { therapyCostCompare as t } from '../../lib/therapy-cost-v1510.js';

const base = { name1: 'Reference', price1: '100', units1: '5', year11: '8', later1: '6.5', source1: 'ASP Q4 2026', name2: 'Biosimilar A', price2: '60', units2: '5', year12: '8', later2: '6.5', source2: 'ASP Q4 2026' };

test('year one and later years, lowest named', () => {
  const r = t(base);
  assert.equal(r.bandLabel, 'Biosimilar A');
  assert.equal(r.regimens[0].y1, 4000);
  assert.equal(r.regimens[1].later, 1950);
  assert.match(r.band, /\$1,600\.00 less than Reference/);
});

test('a missing price source is flagged', () => {
  assert.match(t({ ...base, source2: '' }).notes.join(' '), /no source entered/);
});

test('fewer than two regimens asks', () => {
  assert.equal(t({ name1: 'A', price1: '1', units1: '1', year11: '1', later1: '1' }).valid, false);
  assert.equal(t({}).valid, false);
});
