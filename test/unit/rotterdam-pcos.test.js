// spec-v139 2.5: Rotterdam PCOS criteria (ESHRE/ASRM 2003). Two of three
// features after exclusion of mimics.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rotterdamPcos } from '../../lib/gyn-v139.js';

test('two of three after exclusion -> criteria met (phenotype B)', () => {
  const r = rotterdamPcos({ hyperandrogenism: true, oligoAnovulation: true, mimicsExcluded: true });
  assert.equal(r.met, true);
  assert.equal(r.count, 2);
  assert.match(r.band, /criteria met/);
  assert.match(r.band, /phenotype B/);
});

test('all three after exclusion -> phenotype A', () => {
  const r = rotterdamPcos({ hyperandrogenism: true, oligoAnovulation: true, pcom: true, mimicsExcluded: true });
  assert.equal(r.met, true);
  assert.equal(r.count, 3);
  assert.match(r.band, /phenotype A/);
});

test('one of three -> criteria not met', () => {
  const r = rotterdamPcos({ hyperandrogenism: true, mimicsExcluded: true });
  assert.equal(r.met, false);
  assert.match(r.band, /not met/);
});

test('two features but mimics not excluded -> not confirmed', () => {
  const r = rotterdamPcos({ hyperandrogenism: true, oligoAnovulation: true, mimicsExcluded: false });
  assert.equal(r.met, false);
  assert.match(r.band, /not yet excluded/);
});
