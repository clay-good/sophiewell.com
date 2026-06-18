// spec-v105 2.2: Rutherford category 0-6 <-> Fontaine stage I-IV (Rutherford 1997).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rutherfordFontaine } from '../../lib/vascular-v105.js';

test('severe claudication -> Rutherford 3, Fontaine IIb', () => {
  const r = rutherfordFontaine({ picture: 'severe-claudication' });
  assert.equal(r.valid, true);
  assert.equal(r.rutherford, 3);
  assert.equal(r.fontaine, 'IIb');
});

test('asymptomatic -> Rutherford 0, Fontaine I', () => {
  const r = rutherfordFontaine({ picture: 'asymptomatic' });
  assert.equal(r.rutherford, 0);
  assert.equal(r.fontaine, 'I');
});

test('mild claudication -> Fontaine IIa (distinguishes from moderate/severe IIb)', () => {
  assert.equal(rutherfordFontaine({ picture: 'mild-claudication' }).fontaine, 'IIa');
  assert.equal(rutherfordFontaine({ picture: 'moderate-claudication' }).fontaine, 'IIb');
});

test('rest pain and tissue loss are chronic limb-threatening ischemia', () => {
  assert.equal(rutherfordFontaine({ picture: 'rest-pain' }).fontaine, 'III');
  assert.match(rutherfordFontaine({ picture: 'rest-pain' }).band, /chronic limb-threatening ischemia/);
  assert.equal(rutherfordFontaine({ picture: 'minor-tissue-loss' }).rutherford, 5);
  assert.equal(rutherfordFontaine({ picture: 'major-tissue-loss' }).rutherford, 6);
  assert.equal(rutherfordFontaine({ picture: 'major-tissue-loss' }).fontaine, 'IV');
});

test('unrecognized picture -> surfaced fallback', () => {
  assert.equal(rutherfordFontaine({ picture: 'nonsense' }).valid, false);
  assert.equal(rutherfordFontaine({}).valid, false);
});
