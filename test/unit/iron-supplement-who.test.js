// spec-v1550 tool 4: preventive iron by group, the 40% threshold, pregnancy rules, preterm per kg, RUTF hold.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ironSupplementWho as r } from '../../lib/iron-supplement-who-v1550.js';

test('children and women', () => {
  assert.equal(r({ group: 'c6', prevalence: 'ge40', rutf: 'no' }).bandLabel, '10-12.5 mg daily');
  assert.equal(r({ group: 'c24', prevalence: 'ge40', rutf: 'no' }).bandLabel, '30 mg daily');
  assert.equal(r({ group: 'c5', prevalence: 'ge40', rutf: 'no' }).bandLabel, '30-60 mg daily');
  assert.equal(r({ group: 'woman', prevalence: 'ge40' }).bandLabel, '30-60 mg daily');
  assert.equal(r({ group: 'c24', prevalence: '20to40', rutf: 'no' }).bandLabel, 'Not the daily program');
  assert.equal(r({ group: 'c24', prevalence: 'ge40', rutf: 'yes' }).bandLabel, 'No iron on RUTF');
});

test('pregnancy', () => {
  assert.equal(r({ group: 'pregnant', prevalence: 'ge40' }).bandLabel, '60 mg daily');
  assert.equal(r({ group: 'pregnant', prevalence: 'lt20' }).bandLabel, '30-60 mg daily');
  assert.equal(r({ group: 'pregnant', prevalence: 'lt20', dailyOk: 'no' }).bandLabel, '120 mg weekly');
  assert.equal(r({ group: 'pregnant', prevalence: 'ge40', dailyOk: 'no' }).bandLabel, '60 mg daily');
  assert.equal(r({ group: 'pregnant', prevalence: 'lt20', hb: '104', trimester: '2' }).bandLabel, '120 mg daily');
  assert.equal(r({ group: 'pregnant', prevalence: 'lt20', hb: '107', trimester: '2' }).bandLabel, '30-60 mg daily');
  assert.equal(r({ group: 'pregnant', prevalence: 'lt20', hb: '107', trimester: '3' }).bandLabel, '120 mg daily');
  assert.equal(r({ group: 'pregnant', prevalence: 'lt20', hb: '107' }).valid, false);
});

test('preterm and refusals', () => {
  assert.match(r({ group: 'preterm', weight: '1.5' }).band, /3-6 mg a day/);
  assert.equal(r({ group: 'preterm' }).valid, false);
  assert.equal(r({ group: 'c6' }).valid, false);
  assert.equal(r({}).valid, false);
});

test('malaria-endemic remarks: no oral iron without prevention and treatment; infants under treated nets', () => {
  const infant = r({ group: 'c6', prevalence: 'ge40', rutf: 'no' }).notes.join(' ');
  assert.match(infant, /without access to these should not get oral iron/);
  assert.match(infant, /an infant gets iron only if the child sleeps under an insecticide-treated net/);
  const school = r({ group: 'c5', prevalence: 'ge40', rutf: 'no' }).notes.join(' ');
  assert.match(school, /should not get oral iron/);
  assert.doesNotMatch(school, /an infant gets iron/);
  assert.doesNotMatch(r({ group: 'woman', prevalence: 'ge40' }).notes.join(' '), /malaria/);
});
