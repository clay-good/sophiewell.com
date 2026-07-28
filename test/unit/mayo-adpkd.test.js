// spec-v563: the Mayo imaging classification of ADPKD.
//
// The load-bearing tests are that class 2 is a terminal dead end, and that the model refuses below the
// validated age rather than returning a number from the unstable end of an exponent.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mayoAdpkd, MORPHOLOGY_CLASSES, TKV_METHODS,
  THEORETICAL_START_HTTKV, ALTERNATIVE_K, MIN_VALIDATED_AGE,
} from '../../lib/mayo-adpkd-v563.js';

const typical = (tkv, height, age, extra = {}) => mayoAdpkd({
  morphology: '1', tkv: String(tkv), height: String(height), age: String(age), ...extra,
});

test('the published constants are the model as printed', () => {
  assert.equal(THEORETICAL_START_HTTKV, 150);
  assert.equal(ALTERNATIVE_K, 130);
  assert.equal(MIN_VALIDATED_AGE, 15);
});

test('there are three morphology classes and only class 1 is subclassifiable', () => {
  assert.deepEqual(MORPHOLOGY_CLASSES.map((m) => m.value), ['1', '2A', '2B']);
  assert.equal(MORPHOLOGY_CLASSES.find((m) => m.value === '1').subclassifiable, true);
  assert.equal(MORPHOLOGY_CLASSES.find((m) => m.value === '2A').subclassifiable, false);
  assert.equal(MORPHOLOGY_CLASSES.find((m) => m.value === '2B').subclassifiable, false);
});

// THE dead end.
test('atypical morphology returns no subclass, even with a full set of numbers', () => {
  for (const morphology of ['2A', '2B']) {
    const r = mayoAdpkd({ morphology, tkv: '2000', height: '1.75', age: '40' });
    assert.equal(r.valid, true);
    assert.equal(r.subclassified, false, morphology);
    assert.equal(r.subclass, null);
    assert.match(r.bandText, /assigns NO 1A to 1E subclass/);
  }
});

test('atypical morphology needs no volume, height or age at all', () => {
  const r = mayoAdpkd({ morphology: '2A' });
  assert.equal(r.valid, true);
  assert.equal(r.subclassified, false);
});

test('the atypical result warns that a computed figure would look falsely reassuring', () => {
  assert.match(mayoAdpkd({ morphology: '2B' }).bandText, /falsely reassuring/);
});

// The growth model.
test('a patient sitting exactly on the theoretical curve scores a zero growth rate', () => {
  // htTKV = 150 exactly means the ratio is 1, so the rate is 0 at any age.
  const r = typical(150 * 1.75, 1.75, 40);
  assert.equal(r.htTkv, 150);
  assert.equal(r.growthRate, 0);
  assert.equal(r.subclass, '1A');
});

test('the subclass boundaries follow the published bands', () => {
  const rateFor = (target, age) => {
    // htTKV = 150 * (1 + target/100)^age
    const htTkv = THEORETICAL_START_HTTKV * (1 + target / 100) ** age;
    return typical(htTkv * 1.0, 1.0, age);
  };
  assert.equal(rateFor(1.0, 30).subclass, '1A');
  assert.equal(rateFor(2.0, 30).subclass, '1B');
  assert.equal(rateFor(3.5, 30).subclass, '1C');
  assert.equal(rateFor(5.0, 30).subclass, '1D');
  assert.equal(rateFor(8.0, 30).subclass, '1E');
});

test('the boundary values land in the published band', () => {
  const at = (target, age) => typical(THEORETICAL_START_HTTKV * (1 + target / 100) ** age, 1.0, age);
  assert.equal(at(1.5, 30).subclass, '1B', '1.5 is the bottom of 1B');
  assert.equal(at(3.0, 30).subclass, '1C', '3 is the bottom of 1C');
  assert.equal(at(4.5, 30).subclass, '1D', '4.5 is the bottom of 1D');
  assert.equal(at(6.0, 30).subclass, '1D', '6 exactly stays in 1D, per the printed text');
});

test('a larger volume at the same age gives a higher class', () => {
  const small = typical(800, 1.75, 40);
  const large = typical(4000, 1.75, 40);
  assert.ok(large.growthRate > small.growthRate);
});

test('the height-adjusted volume divides by height in metres', () => {
  const r = typical(1750, 1.75, 40);
  assert.equal(r.htTkv, 1000);
});

// The age floor.
test('an age below the validated floor is refused with the reason', () => {
  const r = typical(1000, 1.6, 14);
  assert.equal(r.valid, false);
  assert.match(r.message, /not validated below age 15/);
  assert.match(r.message, /denominator inside an exponent/);
});

test('the validated floor itself is accepted', () => {
  assert.equal(typical(1000, 1.6, MIN_VALIDATED_AGE).valid, true);
});

// The rival parameterization.
test('the alternative K is named but not applied', () => {
  const r = typical(2000, 1.75, 40);
  assert.match(r.bandText, /A later proposal substitutes 130/);
  assert.match(r.bandText, /rival parameterization rather than a correction/);
});

// The measurement method.
test('the volume method is recorded but does not change the class', () => {
  const bare = typical(2000, 1.75, 40);
  const ellipsoid = typical(2000, 1.75, 40, { tkvMethod: 'ellipsoid' });
  assert.equal(ellipsoid.subclass, bare.subclass);
  assert.equal(ellipsoid.growthRate, bare.growthRate);
  assert.equal(ellipsoid.tkvMethod, 'ellipsoid');
  assert.deepEqual(TKV_METHODS.map((m) => m.value), ['stereologic', 'ellipsoid']);
});

test('an unknown volume method is refused', () => {
  assert.equal(typical(2000, 1.75, 40, { tkvMethod: 'guess' }).valid, false);
});

// Input handling.
test('morphology is required and never inferred', () => {
  const r = mayoAdpkd({ tkv: '2000', height: '1.75', age: '40' });
  assert.equal(r.valid, false);
  assert.match(r.message, /cannot be computed from the volume or the age/);
});

test('class 1 requires volume, height and age', () => {
  assert.equal(mayoAdpkd({ morphology: '1' }).valid, false);
  assert.equal(mayoAdpkd({ morphology: '1', tkv: '2000' }).valid, false);
  assert.equal(mayoAdpkd({ morphology: '1', tkv: '2000', height: '1.75' }).valid, false);
});

test('out-of-range inputs are refused', () => {
  assert.equal(typical(0, 1.75, 40).valid, false);
  assert.equal(typical(2000, 3.0, 40).valid, false);
  assert.equal(typical(2000, 1.75, 150).valid, false);
});

test('the scope note separates the classification from kidney function and from diagnosis', () => {
  const r = typical(2000, 1.75, 40);
  assert.match(r.note, /does not measure kidney function/);
  assert.match(r.note, /does not diagnose ADPKD/);
  assert.match(r.note, /vasopressin receptor antagonist/);
});
