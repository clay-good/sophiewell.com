// spec-v1555 tool 3: each AFRO and SEARO syndrome row, and the refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snakebiteSyndrome as r } from '../../lib/snakebite-syndrome-v1555.js';

const af = (swelling, blood, paralysis) => r({ region: 'africa', swelling, blood, paralysis });

test('AFRO six syndromes', () => {
  assert.match(af('marked', 'clots', 'no').band, /^Syndrome 1/);
  assert.match(af('marked', 'noclot', 'no').band, /^Syndrome 2/);
  assert.match(af('marked', 'bleeding', 'no').band, /^Syndrome 2/);
  assert.match(af('mild', 'clots', 'yes').band, /^Syndrome 3/);
  assert.match(af('mild', 'clots', 'no').band, /^Syndrome 4/);
  assert.match(af('none', 'noclot', 'no').band, /^Syndrome 5/);
  assert.match(af('marked', 'clots', 'yes').band, /^Syndrome 6/);
  assert.equal(af('none', 'clots', 'no').abnormal, false);
  assert.ok(af('mild', 'clots', 'no').notes.some((n) => /not an identification/.test(n)));
});

test('SEARO five syndromes', () => {
  const as = (o) => r({ region: 'asia', ...o });
  assert.match(as({ swelling: 'marked', blood: 'noclot', paralysis: 'no', renal: 'no' }).band, /^Syndrome 1/);
  assert.match(as({ swelling: 'marked', blood: 'noclot', paralysis: 'no', renal: 'yes' }).band, /^Syndrome 2/);
  assert.match(as({ swelling: 'marked', blood: 'clots', paralysis: 'yes' }).band, /^Syndrome 3/);
  assert.equal(as({ swelling: 'none', blood: 'clots', paralysis: 'yes', setting: 'sleeping' }).bandLabel, 'Krait');
  assert.equal(as({ swelling: 'none', blood: 'clots', paralysis: 'yes', setting: 'sea' }).bandLabel, 'Sea snake');
  assert.equal(as({ swelling: 'none', blood: 'clots', paralysis: 'yes', maluku: 'yes' }).bandLabel, 'Australasian elapid');
  assert.match(as({ swelling: 'mild', blood: 'noclot', paralysis: 'yes', setting: 'land', renal: 'yes' }).band, /^Syndrome 5.*Russell/);
});

test('refusals', () => {
  assert.equal(r({ region: 'africa', swelling: 'marked', blood: 'notdone', paralysis: 'no' }).valid, false);
  assert.equal(r({ region: 'asia', swelling: 'none', blood: 'clots', paralysis: 'yes' }).valid, false, 'paralysis needs the setting');
  assert.equal(r({ region: 'africa', swelling: 'marked', blood: 'clots' }).valid, false);
  assert.equal(r({}).valid, false);
});
