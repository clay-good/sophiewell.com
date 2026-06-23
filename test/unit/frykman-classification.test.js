// spec-v145 2.1: Frykman distal-radius classification (Frykman 1967). Two axes:
// joint involvement (extra-articular/radiocarpal/radioulnar/both) plus an
// associated ulnar-styloid fracture (odd = no ulnar, even = with ulnar).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frykmanClassification } from '../../lib/ortho-v145.js';

test('extra-articular, no ulnar -> Type I (not abnormal)', () => {
  const r = frykmanClassification({ joint: 'extraArticular' });
  assert.equal(r.valid, true);
  assert.equal(r.classification, 'I');
  assert.equal(r.type, 1);
  assert.equal(r.abnormal, false);
});

test('extra-articular, with ulnar -> Type II', () => {
  const r = frykmanClassification({ joint: 'extraArticular', ulnarStyloid: '1' });
  assert.equal(r.classification, 'II');
  assert.equal(r.type, 2);
});

test('radiocarpal, with ulnar -> Type IV (abnormal/intra-articular)', () => {
  const r = frykmanClassification({ joint: 'radiocarpal', ulnarStyloid: true });
  assert.equal(r.classification, 'IV');
  assert.equal(r.abnormal, true);
});

test('radioulnar without/with ulnar -> V / VI', () => {
  assert.equal(frykmanClassification({ joint: 'radioulnar' }).classification, 'V');
  assert.equal(frykmanClassification({ joint: 'radioulnar', ulnarStyloid: 1 }).classification, 'VI');
});

test('both joints, with ulnar -> Type VIII (ceiling)', () => {
  const r = frykmanClassification({ joint: 'both', ulnarStyloid: '1' });
  assert.equal(r.classification, 'VIII');
  assert.equal(r.type, 8);
  assert.equal(r.abnormal, true);
});

test('missing joint axis -> invalid', () => {
  assert.equal(frykmanClassification({}).valid, false);
  assert.equal(frykmanClassification({ joint: 'nonsense' }).valid, false);
});
