// spec-v118 2.1: Modified Fisher Scale (Frontera 2006). Grade 0-4 from cisternal
// SAH thickness (none/thin/thick) x IVH (present/absent); symptomatic-vasospasm
// incidence ~24% (g1), ~33% (g2, g3), ~40% (g4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modifiedFisher } from '../../lib/neuro-v118.js';

test('no SAH, no IVH -> grade 0, the reference grade', () => {
  const r = modifiedFisher({ sah: 'none', ivh: false });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /grade 0/);
  assert.match(r.band, /reference/);
});

test('thin SAH, no IVH -> grade 1, ~24%', () => {
  const r = modifiedFisher({ sah: 'thin', ivh: false });
  assert.equal(r.grade, 1);
  assert.match(r.band, /~24%/);
});

test('thin SAH with IVH -> grade 2, ~33%', () => {
  const r = modifiedFisher({ sah: 'thin', ivh: true });
  assert.equal(r.grade, 2);
  assert.match(r.band, /~33%/);
});

test('thick SAH, no IVH -> grade 3, ~33%, abnormal band', () => {
  const r = modifiedFisher({ sah: 'thick', ivh: false });
  assert.equal(r.grade, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /~33%/);
});

test('thick SAH with IVH -> grade 4, ~40% (vasospasm-band case)', () => {
  const r = modifiedFisher({ sah: 'thick', ivh: true });
  assert.equal(r.grade, 4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /~40%/);
});

test('isolated IVH with no SAH -> grade 0 with the out-of-scope note', () => {
  const r = modifiedFisher({ sah: 'none', ivh: true });
  assert.equal(r.grade, 0);
  assert.match(r.band, /outside the modified Fisher/);
});

test('an unknown SAH key never throws -- and no longer grades 0', () => {
  // The old assertion was `grade === 0, valid === true`: a key the tile does not
  // recognise was graded as a CT showing no blood. Robustness was the point and
  // is kept -- nothing throws -- but grade 0 is a radiologist's finding, not the
  // absence of one, so an unrecognised key asks (spec-v1134).
  const r = modifiedFisher({ sah: 'bogus' });
  assert.equal(r.valid, false);
  assert.equal(r.grade, undefined);
  assert.match(r.band, /Grade the cisternal subarachnoid blood/);
});

test('spec-v1134: an ungraded CT is not a negative CT', () => {
  // Every value but 'thin'/'thick' mapped to 'none', so an unstated one graded 0
  // and read "no subarachnoid or intraventricular hemorrhage" -- an assertion
  // about a scan nobody had read, printed above a vasospasm risk.
  const ungraded = modifiedFisher({});
  assert.equal(ungraded.valid, false);
  assert.match(ungraded.band, /Grade the cisternal subarachnoid blood/);
  assert.doesNotMatch(ungraded.band, /no subarachnoid or intraventricular hemorrhage/);

  // An IVH checkbox alone does not make the SAH read.
  assert.equal(modifiedFisher({ ivh: true }).valid, false);
  // Nor does an unknown value.
  assert.equal(modifiedFisher({ sah: 'moderate' }).valid, false);

  // "None" stated by someone who looked still grades 0.
  const stated = modifiedFisher({ sah: 'none' });
  assert.equal(stated.valid, true);
  assert.equal(stated.grade, 0);
  assert.match(stated.band, /no subarachnoid or intraventricular hemorrhage/);
});
