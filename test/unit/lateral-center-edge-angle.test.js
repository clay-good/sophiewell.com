// spec-v1470: lateral center-edge angle of Wiberg (Atzmon and Safran 2022 review).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lateralCenterEdgeAngle as l } from '../../lib/lateral-center-edge-angle-v1470.js';

test('the worked example reads borderline', () => {
  assert.equal(l({ angle: '22' }).band, 'Lateral center-edge angle 22 degrees: borderline hip dysplasia (20 to 25 degrees).');
});

test('every band and boundary', () => {
  assert.equal(l({ angle: 17.9 }).bandLabel, 'Dysplasia');
  assert.equal(l({ angle: 18 }).bandLabel, 'Dysplasia or borderline, by definition');
  assert.equal(l({ angle: 19.9 }).bandLabel, 'Dysplasia or borderline, by definition');
  assert.equal(l({ angle: 20 }).bandLabel, 'Borderline dysplasia');
  assert.equal(l({ angle: 24.9 }).bandLabel, 'Borderline dysplasia');
  assert.equal(l({ angle: 25 }).bandLabel, 'Normal');
  assert.equal(l({ angle: 39 }).bandLabel, 'Normal');
  assert.equal(l({ angle: 39.1 }).bandLabel, 'Above the normal range');
  assert.equal(l({ angle: 24.9 }).abnormal, true);
  assert.equal(l({ angle: 25 }).abnormal, false);
  assert.equal(l({ angle: 39 }).abnormal, false);
  assert.equal(l({ angle: 39.1 }).abnormal, true);
});

test('between 18 and 20 both definitions are stated', () => {
  const b = l({ angle: 19 }).band;
  assert.match(b, /dysplastic under the 20 to 25 degree/);
  assert.match(b, /borderline hip dysplasia under the 18 to 25 degree/);
});

test('exactly 25 carries the shared-endpoint note; 26 does not', () => {
  assert.ok(l({ angle: 25 }).notes.some((n) => n.includes('share the endpoint 25')));
  assert.ok(!l({ angle: 26 }).notes.some((n) => n.includes('share the endpoint 25')));
});

test('under 15 degrees adds the arthroscopy-failure note', () => {
  assert.ok(l({ angle: 14.5 }).notes.some((n) => n.includes('under 15 degrees')));
  assert.ok(!l({ angle: 15 }).notes.some((n) => n.includes('under 15 degrees')));
  assert.equal(l({ angle: -5 }).bandLabel, 'Dysplasia');
});

test('blank asks; out-of-range and non-numeric refused', () => {
  assert.equal(l({}).message, 'Enter the lateral center-edge angle in degrees.');
  assert.equal(l({ angle: '  ' }).valid, false);
  assert.equal(l({ angle: -21 }).valid, false);
  assert.equal(l({ angle: 71 }).valid, false);
  assert.match(l({ angle: 71 }).message, /between -20 and 70 degrees/);
  assert.equal(l({ angle: 'abc' }).valid, false);
  assert.equal(l({ angle: -20 }).valid, true);
  assert.equal(l({ angle: 70 }).valid, true);
});
