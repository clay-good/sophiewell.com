// spec-v1240: the four gallbladder and biliary grades, and the branch each one is read wrongly on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parklandGallbladder, PARKLAND_FINDINGS } from '../../lib/parkland-gallbladder-v1240.js';
import { nassarGallbladder, NASSAR_AXES } from '../../lib/nassar-gallbladder-v1240.js';
import { aastCholecystitis, AAST_CHOLECYSTITIS_GRADES } from '../../lib/aast-cholecystitis-v1240.js';
import { csendesMirizzi, CSENDES_FISTULA_EXTENT } from '../../lib/csendes-mirizzi-v1240.js';

// --- Parkland -------------------------------------------------------------

test('parkland: the grade is the highest finding, not a sum', () => {
  const many = { hyperemia: true, pericholecysticFluid: true, bodyAdhesions: true, distended: true };
  assert.equal(parklandGallbladder(many).grade, 3);
  assert.equal(parklandGallbladder({ hyperemia: true }).grade, 3);
  assert.equal(parklandGallbladder({ ...many, perforation: true }).grade, 5);
});

test('parkland: the anatomy clause makes an otherwise mild picture a grade 4', () => {
  const r = parklandGallbladder({ impactedStone: true });
  assert.equal(r.grade, 4);
  assert.equal(r.difficult, true);
  assert.match(r.anatomyNote, /anatomy clause/);
});

test('parkland: an empty form is not the grade 1 finding', () => {
  const r = parklandGallbladder({});
  assert.equal(r.grade, 1);
  assert.equal(r.count, 0);
  assert.match(r.emptyNote, /Nothing was recorded/);
});

test('parkland: every finding carries a grade in range', () => {
  assert.equal(PARKLAND_FINDINGS.length, 12);
  for (const f of PARKLAND_FINDINGS) assert.ok(f.grade >= 2 && f.grade <= 5, f.key);
});

// --- Nassar ---------------------------------------------------------------

test('nassar: the overall grade is the worst axis, not the average and not the gallbladder', () => {
  const r = nassarGallbladder({ gallbladder: '2', pedicle: '4', adhesions: '1' });
  assert.equal(r.grade, 4);
  assert.deepEqual(r.worstAxes, ['cystic pedicle']);
  assert.match(r.pedicleNote, /cannot be clarified/);
});

test('nassar: an ungraded axis returns a floor, never a grade', () => {
  const r = nassarGallbladder({ gallbladder: '3', pedicle: '' });
  assert.equal(r.grade, null);
  assert.equal(r.floor, 3);
  assert.equal(r.incomplete, true);
  assert.match(r.band, /at least a Nassar grade 3/);
});

test('nassar: at the ceiling the ungraded axes cannot move the answer', () => {
  const r = nassarGallbladder({ pedicle: '4' });
  assert.equal(r.incomplete, false);
  assert.equal(r.grade, 4);
  assert.match(r.ceilingNote, /cannot change the answer/);
  // The gallbladder was never graded, so nothing may claim it looks benign.
  assert.equal(r.pedicleNote, null);
});

test('nassar: three axes, four levels each', () => {
  assert.equal(NASSAR_AXES.length, 3);
  for (const a of NASSAR_AXES) assert.deepEqual(a.levels.map((l) => l.value), ['1', '2', '3', '4']);
});

// --- AAST -----------------------------------------------------------------

test('aast: where the categories disagree the highest is the final grade', () => {
  const r = aastCholecystitis({ imaging: 'I', operative: 'III' });
  assert.equal(r.grade, 'III');
  assert.deepEqual(r.setBy, ['operative grade']);
  assert.match(r.highestNote, /do not agree/);
});

test('aast: an imaging-only grade is a floor', () => {
  const r = aastCholecystitis({ imaging: 'II' });
  assert.equal(r.provisional, true);
  assert.match(r.provisionalNote, /floor rather than a settled grade/);
  assert.equal(aastCholecystitis({ operative: 'II' }).provisionalNote, null);
});

test('aast: an empty form has no grade', () => {
  const r = aastCholecystitis({});
  assert.equal(r.valid, false);
  assert.match(r.message, /at least one/);
});

test('aast: the note says which version of the scale this is', () => {
  const r = aastCholecystitis({ imaging: 'I' });
  assert.match(r.note, /2022 revision/);
  assert.equal(AAST_CHOLECYSTITIS_GRADES.length, 5);
});

// --- Csendes --------------------------------------------------------------

test('csendes: type V is reported on top of the base type, not instead of it', () => {
  const r = csendesMirizzi({ fistula: 'up-to-two-thirds', cholecystentericFistula: true });
  assert.equal(r.type, 'III');
  assert.equal(r.modifier, 'Va');
  assert.match(r.band, /type Va on a type III bile duct/);
  assert.match(r.modifierNote, /does not say how much bile duct is left/);
});

test('csendes: gallstone ileus without an enteric fistula is not a type Vb', () => {
  const r = csendesMirizzi({ fistula: 'none', gallstoneIleus: true });
  assert.equal(r.modifier, null);
  assert.equal(r.type, 'I');
  assert.match(r.ileusWithoutFistula, /does not make this a type Vb/);
});

test('csendes: the fistula extent is required and each extent maps to one type', () => {
  assert.equal(csendesMirizzi({}).valid, false);
  assert.deepEqual(CSENDES_FISTULA_EXTENT.map((e) => e.type), ['I', 'II', 'III', 'IV']);
});

test('csendes: type I is the minority picture, and the tile says so', () => {
  assert.match(csendesMirizzi({ fistula: 'none' }).prevalenceNote, /least common/);
  assert.equal(csendesMirizzi({ fistula: 'under-third' }).prevalenceNote, null);
});
