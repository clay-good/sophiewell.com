// spec-v121 2.3: Brighton GBS case definition (Sejvar 2011; Fokke 2014). Three
// core clinical features + absence of alternative diagnosis, plus CSF
// dissociation and consistent NCS. Level 1 (both) > 2 (either) > 3 (core only)
// > 4 (insufficient evidence).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brightonGbs } from '../../lib/neuro-v121.js';

const core = { weakness: true, areflexia: true, monophasic: true, noAltDx: true };

test('Level 1: core + CSF dissociation + consistent NCS', () => {
  const r = brightonGbs({ ...core, csf: 'dissociation', ncs: true });
  assert.equal(r.valid, true);
  assert.equal(r.level, 1);
  assert.match(r.band, /Level 1: the highest diagnostic certainty/);
});

test('Level 2: core + consistent NCS only (CSF not done)', () => {
  const r = brightonGbs({ ...core, csf: 'not-done', ncs: true });
  assert.equal(r.level, 2);
});

test('Level 2: core + supportive CSF only (cells < 50, normal protein)', () => {
  const r = brightonGbs({ ...core, csf: 'cells-normal-protein', ncs: false });
  assert.equal(r.level, 2);
});

test('Level 3: core only, CSF/NCS not done', () => {
  const r = brightonGbs({ ...core, csf: 'not-done', ncs: false });
  assert.equal(r.level, 3);
  assert.match(r.band, /Level 3/);
});

test('Level 4 band-flip: a missing core feature -> insufficient evidence', () => {
  const r = brightonGbs({ ...core, monophasic: false, csf: 'dissociation', ncs: true });
  assert.equal(r.level, 4);
  assert.match(r.band, /insufficient evidence/);
});

test('scalar / non-object fuzz arg yields a valid Level 4, never NaN', () => {
  const r = brightonGbs(9);
  assert.equal(r.valid, true);
  assert.equal(r.level, 4);
  assert.equal(Number.isFinite(r.level), true);
});
