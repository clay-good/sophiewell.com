// spec-v132 2.4: revised IPSET-thrombosis (Barbui 2015, Blood Cancer J 5:e369).
// HIGH = prior thrombosis OR (age > 60 AND JAK2); INTERMEDIATE = age > 60, no
// JAK2, no history; LOW = JAK2 only; VERY LOW = none of the three.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ipsetThrombosis } from '../../lib/heme-v132.js';

const cat = (age, thr, jak2) => ipsetThrombosis({ ageOver60: age, thrombosis: thr, jak2 }).category;

test('the high vs very-low boundary', () => {
  assert.equal(cat('no', 'no', 'no'), 'Very low');
  assert.equal(cat('yes', 'no', 'yes'), 'High'); // age > 60 with JAK2
  const hi = ipsetThrombosis({ ageOver60: 'yes', thrombosis: 'no', jak2: 'yes' });
  assert.equal(hi.abnormal, true);
});

test('a thrombosis history is high regardless of age or JAK2', () => {
  assert.equal(cat('no', 'yes', 'no'), 'High');
  assert.equal(cat('no', 'yes', 'yes'), 'High');
});

test('JAK2 only is low; age over 60 without JAK2 or history is intermediate', () => {
  assert.equal(cat('no', 'no', 'yes'), 'Low');
  assert.equal(cat('yes', 'no', 'no'), 'Intermediate');
});

test('the full eight-combination decision tree is covered', () => {
  assert.equal(cat('no', 'no', 'no'), 'Very low');
  assert.equal(cat('no', 'no', 'yes'), 'Low');
  assert.equal(cat('yes', 'no', 'no'), 'Intermediate');
  assert.equal(cat('yes', 'no', 'yes'), 'High');
  assert.equal(cat('no', 'yes', 'no'), 'High');
  assert.equal(cat('no', 'yes', 'yes'), 'High');
  assert.equal(cat('yes', 'yes', 'no'), 'High');
  assert.equal(cat('yes', 'yes', 'yes'), 'High');
});

test('blank inputs surface valid:false', () => {
  assert.equal(ipsetThrombosis({ ageOver60: 'yes', thrombosis: 'no' }).valid, false);
  assert.equal(ipsetThrombosis({ ageOver60: '', thrombosis: 'no', jak2: 'no' }).valid, false);
  assert.equal(ipsetThrombosis(undefined).valid, false);
});
