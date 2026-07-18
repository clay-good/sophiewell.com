// spec-v422: SUN anterior chamber flare grade (0/1+/2+/3+/4+).
// Worked-example tests: each grade and its description, alias input, and the invalid-grade guard.
// Grades transcribed from the SUN Working Group 2005 (Am J Ophthalmol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sunAcFlare } from '../../lib/sun-ac-flare-v422.js';

test('grade 2+: moderate, iris and lens details clear (the META example)', () => {
  const r = sunAcFlare({ grade: '2+' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2+');
  assert.match(r.band, /moderate flare \(iris and lens details clear\)/);
});

test('grade 0: no flare', () => {
  const r = sunAcFlare({ grade: '0' });
  assert.equal(r.grade, '0');
  assert.match(r.band, /no flare/);
});

test('grade 1+: faint', () => {
  assert.match(sunAcFlare({ grade: '1+' }).band, /faint flare/);
});

test('grade 3+: marked, iris and lens details hazy', () => {
  assert.match(sunAcFlare({ grade: '3+' }).band, /marked flare \(iris and lens details hazy\)/);
});

test('grade 4+: intense, fibrin or plasmoid aqueous', () => {
  const r = sunAcFlare({ grade: '4+' });
  assert.equal(r.grade, '4+');
  assert.match(r.band, /intense flare \(fibrin or plasmoid aqueous\)/);
});

test('aliases: bare numbers and "none" map to the grades', () => {
  assert.equal(sunAcFlare({ grade: '3' }).grade, '3+');
  assert.equal(sunAcFlare({ grade: 'none' }).grade, '0');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(sunAcFlare({}).valid, false);
  assert.equal(sunAcFlare({ grade: '5+' }).valid, false);
  assert.equal(sunAcFlare({ grade: 'X' }).valid, false);
});
