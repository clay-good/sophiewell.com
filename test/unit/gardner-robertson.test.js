// spec-v802: Gardner-Robertson hearing classification.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { gardnerRobertson } from '../../lib/gardner-robertson-v802.js';

test('matching measures give the expected class', () => {
  assert.equal(gardnerRobertson({ pta: 20, sds: 90 }).grade, 1);
  assert.equal(gardnerRobertson({ pta: 40, sds: 60 }).grade, 2);
  assert.equal(gardnerRobertson({ pta: 70, sds: 30 }).grade, 3);
  assert.equal(gardnerRobertson({ pta: 100, sds: 2 }).grade, 4);
});

test('THE POORER measure governs, in both directions', () => {
  const worseSds = gardnerRobertson({ pta: 20, sds: 55 });
  assert.equal(worseSds.ptaClass, 1);
  assert.equal(worseSds.sdsClass, 2);
  assert.equal(worseSds.grade, 2);

  const worsePta = gardnerRobertson({ pta: 45, sds: 80 });
  assert.equal(worsePta.ptaClass, 2);
  assert.equal(worsePta.sdsClass, 1);
  assert.equal(worsePta.grade, 2);

  assert.equal(worseSds.disagree, true);
  assert.equal(worsePta.disagree, true);
});

test('serviceable hearing needs BOTH measures, not either', () => {
  // Excellent discrimination cannot rescue a poor pure tone average.
  assert.equal(gardnerRobertson({ pta: 70, sds: 100 }).serviceable, false);
  // And an excellent pure tone average cannot rescue poor discrimination.
  assert.equal(gardnerRobertson({ pta: 10, sds: 30 }).serviceable, false);
  assert.equal(gardnerRobertson({ pta: 50, sds: 50 }).serviceable, true, 'both exactly at the limit');
});

test('the pure tone average boundaries are 30, 50 and 90', () => {
  const c = (v) => gardnerRobertson({ pta: v, sds: 100 }).ptaClass;
  assert.equal(c(30), 1);
  assert.equal(c(31), 2);
  assert.equal(c(50), 2);
  assert.equal(c(51), 3);
  assert.equal(c(90), 3);
  assert.equal(c(91), 4);
});

test('the discrimination boundaries are 70, 50, 5 and 0', () => {
  const c = (v) => gardnerRobertson({ pta: 0, sds: v }).sdsClass;
  assert.equal(c(70), 1);
  assert.equal(c(69), 2);
  assert.equal(c(50), 2);
  assert.equal(c(49), 3);
  assert.equal(c(5), 3);
  assert.equal(c(4), 4);
  assert.equal(c(0), 5, 'zero discrimination is class V, not IV');
});

test('not testable is class V regardless of any other value', () => {
  const r = gardnerRobertson({ notTestable: true, pta: 10, sds: 100 });
  assert.equal(r.grade, 5);
  assert.equal(r.serviceable, false);
});

test('an empty form falls back and out-of-range values are rejected', () => {
  assert.equal(gardnerRobertson({}).valid, false);
  assert.equal(gardnerRobertson({ pta: 200 }).field, 'pta');
  assert.equal(gardnerRobertson({ sds: 101 }).field, 'sds');
});
