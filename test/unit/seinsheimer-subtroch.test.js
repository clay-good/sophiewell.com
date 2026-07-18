// spec-v413: Seinsheimer classification of subtrochanteric femur fractures
// (types I/IIA/IIB/IIC/IIIA/IIIB/IV/V). Worked-example tests: each type and its fragment/fracture-line
// description, the arabic-subgroup and bare-II/III aliases, and the invalid-type guard. Types transcribed
// from Seinsheimer 1978 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seinsheimerSubtroch } from '../../lib/seinsheimer-subtroch-v413.js';

test('type IIB: two-part spiral, lesser troch proximal (the META example)', () => {
  const r = seinsheimerSubtroch({ type: 'IIB' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'IIB');
  assert.match(r.band, /two-part spiral fracture with the lesser trochanter attached to the proximal fragment/);
});

test('type I: nondisplaced under 2 mm', () => {
  const r = seinsheimerSubtroch({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /less than 2 mm of displacement/);
});

test('type IIA and IIC: transverse and distal spiral', () => {
  assert.match(seinsheimerSubtroch({ type: 'IIA' }).band, /two-part transverse fracture/);
  assert.match(seinsheimerSubtroch({ type: 'IIC' }).band, /attached to the distal fragment/);
});

test('type IIIA and IIIB: three-part spiral variants', () => {
  assert.match(seinsheimerSubtroch({ type: 'IIIA' }).band, /lesser trochanter is part of the third fragment/);
  assert.match(seinsheimerSubtroch({ type: 'IIIB' }).band, /butterfly fragment/);
});

test('type IV and V: comminuted and subtroch-intertroch', () => {
  assert.match(seinsheimerSubtroch({ type: 'IV' }).band, /four or more fragments/);
  assert.match(seinsheimerSubtroch({ type: 'V' }).band, /extending through the greater trochanter/);
});

test('arabic subgroup and bare II/III aliases map to the types', () => {
  assert.equal(seinsheimerSubtroch({ type: '2c' }).type, 'IIC');
  assert.equal(seinsheimerSubtroch({ type: '3b' }).type, 'IIIB');
  assert.equal(seinsheimerSubtroch({ type: 'II' }).type, 'IIA');
  assert.equal(seinsheimerSubtroch({ type: 'iii' }).type, 'IIIA');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(seinsheimerSubtroch({}).valid, false);
  assert.equal(seinsheimerSubtroch({ type: 'VI' }).valid, false);
  assert.equal(seinsheimerSubtroch({ type: 'IID' }).valid, false);
});
