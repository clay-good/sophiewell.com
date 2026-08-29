import test from 'node:test';
import assert from 'node:assert/strict';
import { vitaminDLevel as v, IOM_DEFICIENCY, IOM_SUFFICIENCY, ENDO_DEFICIENCY, ENDO_SUFFICIENCY, TOXICITY_CONCERN } from '../../lib/vitamin-d-level-v881.js';

test('vitamin-d-level: the published thresholds', () => {
  assert.equal(IOM_DEFICIENCY, 12);
  assert.equal(IOM_SUFFICIENCY, 20);
  assert.equal(ENDO_DEFICIENCY, 20);
  assert.equal(ENDO_SUFFICIENCY, 30);
  assert.equal(TOXICITY_CONCERN, 100);
});

test('vitamin-d-level: both readings are returned, and neither is picked', () => {
  // The reason the tile exists: the 20 to 29 window is where they part.
  const mid = v({ level: 25 });
  assert.equal(mid.iom, 'at or above the population reference');
  assert.equal(mid.endo, 'insufficient');
  assert.equal(mid.frameworksAgree, false);
  assert.match(mid.disagreementNote, /Neither is quoted here as the answer/);
  assert.match(mid.band, /Institute of Medicine/);
  assert.match(mid.band, /Endocrine Society/);
});

test('vitamin-d-level: where the frameworks agree, the tile says they do not always', () => {
  const low = v({ level: 8 });
  assert.equal(low.iom, 'deficient');
  assert.equal(low.endo, 'deficient');
  assert.equal(low.frameworksAgree, true);
  assert.match(low.disagreementNote, /They do not agree everywhere/);
  const high = v({ level: 40 });
  assert.equal(high.frameworksAgree, true);
  assert.equal(high.abnormal, false);
});

test('vitamin-d-level: each threshold is read strictly', () => {
  assert.equal(v({ level: 11.9 }).iom, 'deficient');
  assert.equal(v({ level: 12 }).iom, 'below the population reference');
  assert.equal(v({ level: 19.9 }).iom, 'below the population reference');
  assert.equal(v({ level: 20 }).iom, 'at or above the population reference');
  assert.equal(v({ level: 19.9 }).endo, 'deficient');
  assert.equal(v({ level: 20 }).endo, 'insufficient');
  assert.equal(v({ level: 29.9 }).endo, 'insufficient');
  assert.equal(v({ level: 30 }).endo, 'sufficient');
});

test('vitamin-d-level: nmol/L converts and the conversion is declared', () => {
  const r = v({ level: 62, unit: 'nmol-l' });
  assert.equal(r.nmoll, 62);
  assert.ok(Math.abs(r.ngml - 24.8) < 0.2);
  assert.match(r.unitNote, /published thresholds are written in ng\/mL/);
  assert.equal(v({ level: 25 }).unitNote, null);
  // An unknown unit falls back to ng/mL rather than throwing.
  assert.equal(v({ level: 25, unit: 'made-up' }).unit, 'ng-ml');
});

test('vitamin-d-level: a level near a threshold gets the assay caveat', () => {
  assert.match(v({ level: 21 }).assayNote, /within 3 ng\/mL of a threshold/);
  assert.match(v({ level: 32 }).assayNote, /varies between laboratories/);
  assert.equal(v({ level: 50 }).assayNote, null);
});

test('vitamin-d-level: the population-reference and do-not-test points are on every result', () => {
  for (const level of [5, 25, 45, 150]) {
    assert.match(v({ level }).populationNote, /population reference/);
    assert.match(v({ level }).populationNote, /not an individual treatment target/i);
    assert.match(v({ level }).testingNote, /against routine 25-hydroxyvitamin D testing in healthy adults/);
    assert.match(v({ level }).scopeNote, /does not decide whether to supplement/);
  }
});

test('vitamin-d-level: a very high level names the finding that matters', () => {
  assert.match(v({ level: 150 }).toxicityNote, /hypercalcemia is the finding that matters/);
  assert.equal(v({ level: 100 }).toxicityNote, null);
});

test('vitamin-d-level: a missing or out-of-range level is refused', () => {
  assert.equal(v({}).valid, false);
  assert.equal(v({ level: -1 }).valid, false);
  assert.equal(v({ level: 401 }).valid, false);
  // The nmol/L limit is the higher one.
  assert.equal(v({ level: 401, unit: 'nmol-l' }).valid, true);
  assert.equal(v({ level: 1001, unit: 'nmol-l' }).valid, false);
});

test('vitamin-d-level: the documented example', () => {
  const r = v({ level: '25', unit: 'ng-ml' });
  assert.equal(r.ngml, 25);
  assert.equal(r.frameworksAgree, false);
});
