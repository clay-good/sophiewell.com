// spec-v193 2.1: crusade worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crusade } from '../../lib/acs-v193.js';

test('very-high band with U-shaped low SBP', () => {
  const r = crusade({hct:35,crcl:50,hr:95,sbp:85,sex:'female',chf:true,dm:true});
  assert.equal(r.valid, true);
  assert.equal(r.score, 68);
  assert.equal(r.abnormal, true);
});

test('very-low band', () => {
  const r = crusade({hct:45,crcl:100,hr:60,sbp:140,sex:'male'});
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, false);
});

test('high SBP arm of the U also adds points', () => {
  const r = crusade({hct:40,crcl:130,hr:70,sbp:210,sex:'male'});
  assert.equal(r.score, 5);
});

test('guards: missing fields invalid', () => {
  const r = crusade({hct:40});
  assert.equal(r.valid, false);
});
