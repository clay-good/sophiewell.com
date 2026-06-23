// spec-v144 2.1: Gustilo-Anderson open fracture classification (Gustilo 1976;
// III subtypes 1984). The III subtype is set by coverage and perfusion, not
// wound size; the IIIA -> IIIB -> IIIC distinction is the headline acceptance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gustiloAnderson } from '../../lib/ortho-v144.js';

test('blank wound -> complete-the-fields fallback', () => {
  const r = gustiloAnderson({});
  assert.equal(r.valid, false);
  assert.match(r.message, /wound size/i);
});

test('small clean wound -> Type I, not abnormal', () => {
  const r = gustiloAnderson({ wound: 'lt1' });
  assert.equal(r.classification, 'I');
  assert.equal(r.abnormal, false);
});

test('1-10 cm wound -> Type II', () => {
  assert.equal(gustiloAnderson({ wound: '1to10' }).classification, 'II');
});

test('wound > 10 cm forces at least Type III (IIIA)', () => {
  const r = gustiloAnderson({ wound: 'gt10' });
  assert.equal(r.classification, 'IIIA');
  assert.equal(r.abnormal, true);
});

test('IIIA -> IIIB -> IIIC distinction (the coverage/vascular precedence)', () => {
  // High-energy / extensive soft tissue with adequate coverage -> IIIA.
  assert.equal(gustiloAnderson({ wound: '1to10', severeSoftTissue: 1 }).classification, 'IIIA');
  // Inadequate coverage requiring a flap -> IIIB.
  assert.equal(gustiloAnderson({ wound: '1to10', flapCoverage: 1 }).classification, 'IIIB');
  // Arterial injury requiring repair -> IIIC, irrespective of wound size.
  assert.equal(gustiloAnderson({ wound: 'lt1', arterial: 1 }).classification, 'IIIC');
});

test('arterial repair overrides flap-coverage (IIIC wins)', () => {
  assert.equal(gustiloAnderson({ wound: '1to10', flapCoverage: 1, arterial: 1 }).classification, 'IIIC');
});
