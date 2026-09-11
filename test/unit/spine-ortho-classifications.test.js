// spec-v1241: the two AO Spine classifications, Herbert, and Lenke.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aoSpineTl, AO_TL_MORPHOLOGY } from '../../lib/ao-spine-tl-v1241.js';
import { aoSpineSubaxial, AO_SUBAXIAL_FACET } from '../../lib/ao-spine-subaxial-v1241.js';
import { herbertScaphoid, HERBERT_TYPES } from '../../lib/herbert-scaphoid-v1241.js';
import { lenkeScoliosis } from '../../lib/lenke-scoliosis-v1241.js';
import { AO_NEURO, parseNeuro } from '../../lib/ao-spine-neuro-v1241.js';

// --- the shared neurology vocabulary --------------------------------------

test('ao neuro: NX is not N0, and it outweighs a persistent radicular symptom', () => {
  assert.equal(parseNeuro('N0').points, 0);
  assert.equal(parseNeuro('NX').points, 3);
  assert.ok(parseNeuro('NX').points > parseNeuro('N2').points);
  assert.equal(AO_NEURO.length, 6);
});

test('ao neuro: one vocabulary, read by both classifications', () => {
  // If a second copy is ever pasted into either lib, these stop agreeing.
  assert.equal(aoSpineTl({ morphology: 'A0', neuro: 'NX' }).parts.neuro, 3);
  assert.equal(aoSpineSubaxial({ morphology: 'A0', facet: 'F0', neuro: 'NX' }).neuro, 'NX');
});

// --- AO Spine thoracolumbar ----------------------------------------------

test('ao-spine-tl: the score is morphology plus neurology plus M1', () => {
  const r = aoSpineTl({ morphology: 'A4', neuro: 'N3', m1: true });
  assert.equal(r.score, 10);
  assert.deepEqual(r.parts, { morphology: 5, neuro: 4, modifiers: 1 });
  assert.equal(r.code, 'A4 N3 M1');
});

test('ao-spine-tl: the published bands, at their edges', () => {
  assert.match(aoSpineTl({ morphology: 'A3', neuro: 'N0' }).band, /conservative treatment preferred/);
  assert.match(aoSpineTl({ morphology: 'A4', neuro: 'N0' }).band, /either is considered appropriate|either treatment is considered appropriate/);
  assert.match(aoSpineTl({ morphology: 'B2', neuro: 'N0' }).band, /surgical treatment preferred/);
  assert.equal(aoSpineTl({ morphology: 'C', neuro: 'N4', m1: true }).score, 13);
});

test('ao-spine-tl: a blank neurology is refused, not read as N0', () => {
  const r = aoSpineTl({ morphology: 'A4' });
  assert.equal(r.valid, false);
  assert.match(r.message, /A blank is not an N0/);
});

test('ao-spine-tl: M2 scores nothing and is still reported', () => {
  const r = aoSpineTl({ morphology: 'A1', neuro: 'N0', m2: true });
  assert.equal(r.score, 1);
  assert.deepEqual(r.modifiers, ['M2']);
  assert.match(r.unscoredModifier, /adds no points/);
});

test('ao-spine-tl: the two halves of the answer name their own papers', () => {
  const r = aoSpineTl({ morphology: 'A1', neuro: 'N0' });
  assert.match(r.provenanceNote, /Kepler 2016/);
  assert.match(r.provenanceNote, /Lambrechts 2023/);
  assert.match(r.tlicsNote, /TLICS is a different system/);
});

test('ao-spine-tl: morphology points rise with the type', () => {
  const pts = AO_TL_MORPHOLOGY.map((m) => m.points);
  for (let i = 1; i < pts.length; i++) assert.ok(pts[i] >= pts[i - 1], AO_TL_MORPHOLOGY[i].value);
});

// --- AO Spine subaxial cervical -------------------------------------------

test('ao-spine-subaxial: the code carries the facet axis, bilateral marked', () => {
  const r = aoSpineSubaxial({ morphology: 'A1', facet: 'F4', neuro: 'N0', bilateral: true });
  assert.equal(r.code, 'A1 F4BL N0');
  assert.match(r.facetNote, /is a dislocation|dislocated or perched/);
  assert.equal(r.abnormal, true);
});

test('ao-spine-subaxial: F0 is how "no facet injury" is said, and blank is not F0', () => {
  assert.equal(aoSpineSubaxial({ morphology: 'A1', facet: 'F0', neuro: 'N0' }).code, 'A1 N0');
  const blank = aoSpineSubaxial({ morphology: 'A1', neuro: 'N0' });
  assert.equal(blank.valid, false);
  assert.match(blank.message, /F0 records that there is no facet injury/);
});

test('ao-spine-subaxial: it prints no total, and says why', () => {
  const r = aoSpineSubaxial({ morphology: 'A3', facet: 'F2', neuro: 'N2' });
  assert.equal(r.score, undefined);
  assert.equal(r.total, undefined);
  assert.match(r.noTotalNote, /not addends/);
  assert.match(r.slicNote, /SLIC/);
});

test('ao-spine-subaxial: the facet list runs F0 to F4', () => {
  assert.deepEqual(AO_SUBAXIAL_FACET.map((f) => f.value), ['F0', 'F1', 'F2', 'F3', 'F4']);
});

// --- Herbert ---------------------------------------------------------------

test('herbert: A is stable, B is unstable, C and D answer a different question', () => {
  assert.equal(herbertScaphoid({ type: 'A2' }).stable, true);
  assert.equal(herbertScaphoid({ type: 'B2' }).stable, false);
  assert.equal(herbertScaphoid({ type: 'D2' }).stable, null);
  assert.match(herbertScaphoid({ type: 'C' }).band, /Stability is not what this type records/);
});

test('herbert: B3 says what the letter B does not', () => {
  assert.match(herbertScaphoid({ type: 'B3' }).proximalPoleNote, /avascular necrosis/);
  assert.equal(herbertScaphoid({ type: 'B2' }).proximalPoleNote, null);
});

test('herbert: no default type, because A2 and B2 are both waist fractures', () => {
  const r = herbertScaphoid({});
  assert.equal(r.valid, false);
  assert.match(r.message, /only one of them is stable/);
  assert.equal(HERBERT_TYPES.length, 10);
});

// --- Lenke -----------------------------------------------------------------

const CURVE = {
  ptCobb: 22, mtCobb: 58, tlCobb: 62,
  ptBend: 12, mtBend: 30, tlBend: 38,
  t2t5: 8, t10l2: 6, t5t12: 15,
  csvl: 'medial-to-apex',
};

test('lenke: a lumbar curve that leads by under 5 degrees is a type 3, not a type 6', () => {
  const r = lenkeScoliosis(CURVE);
  assert.equal(r.type, 3);
  assert.equal(r.margin, 4);
  assert.equal(r.code, '3CN');
  assert.match(r.marginNote, /at least 5/);
});

test('lenke: five more degrees on the same curve makes it a type 6', () => {
  const r = lenkeScoliosis({ ...CURVE, tlCobb: 63 });
  assert.equal(r.type, 6);
  assert.equal(r.margin, 5);
  assert.match(r.marginNote, /which is the 5 degrees Lenke requires/);
});

test('lenke: the major curve is structural whatever it bends out to', () => {
  const r = lenkeScoliosis({ ...CURVE, tlCobb: 30, tlBend: 5, mtBend: 5 });
  assert.equal(r.major, 'MT');
  assert.equal(r.mtStructural, true);
  assert.equal(r.type, 1);
});

test('lenke: a kyphotic region makes a minor curve structural with no bending at all', () => {
  const flat = { ...CURVE, tlCobb: 30, tlBend: 5, mtBend: 5, ptBend: 5 };
  assert.equal(lenkeScoliosis(flat).type, 1);
  assert.equal(lenkeScoliosis({ ...flat, t10l2: 20 }).type, 3);
  assert.equal(lenkeScoliosis({ ...flat, t2t5: 20 }).type, 2);
});

test('lenke: the sagittal modifier is cut at 10 and 40 degrees', () => {
  assert.equal(lenkeScoliosis({ ...CURVE, t5t12: 9 }).sagittalModifier, '-');
  assert.equal(lenkeScoliosis({ ...CURVE, t5t12: 10 }).sagittalModifier, 'N');
  assert.equal(lenkeScoliosis({ ...CURVE, t5t12: 40 }).sagittalModifier, 'N');
  assert.equal(lenkeScoliosis({ ...CURVE, t5t12: 41 }).sagittalModifier, '+');
});

test('lenke: a proximal thoracic major curve has no Lenke type, and is not rounded to one', () => {
  const r = lenkeScoliosis({ ...CURVE, ptCobb: 70 });
  assert.equal(r.valid, false);
  assert.match(r.message, /no Lenke type/);
});

test('lenke: an impossible angle is refused, and so is a field of spaces', () => {
  assert.equal(lenkeScoliosis({ ...CURVE, mtCobb: 400 }).valid, false);
  assert.match(lenkeScoliosis({ ...CURVE, mtCobb: 400 }).message, /must be between 0 and 130/);
  const spaces = lenkeScoliosis({ ...CURVE, mtCobb: '   ' });
  assert.equal(spaces.valid, false);
  assert.match(spaces.message, /Enter the main thoracic Cobb angle/);
});

test('lenke: the CSVL has no default', () => {
  const r = lenkeScoliosis({ ...CURVE, csvl: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /there is no default/);
});
