// spec-v317: CDI severity classification (2017 IDSA/SHEA). Worked-example tests: the
// non-severe / severe / fulminant boundaries, each severe path (WBC alone, creatinine
// alone), the fulminant override (independent of labs, and valid without labs), and
// the validation guards. Criteria transcribed verbatim from McDonald 2018, Table 1
// (Clin Infect Dis 66(7)), cross-verified against the guideline text (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdiSeverity } from '../../lib/cdi-severity-v317.js';

test('WBC >= 15,000 alone is severe (the META example)', () => {
  const r = cdiSeverity({ wbc: '18000', creatinine: '1.2' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'severe');
  assert.equal(r.severe, true);
  assert.equal(r.fulminant, false);
  assert.match(r.band, /WBC 18000 cells\/uL is at or above the 15,000 threshold/);
  assert.match(r.band, /creatinine 1.2 mg\/dL is below 1.5/);
});

test('creatinine >= 1.5 alone is severe (normal WBC)', () => {
  const r = cdiSeverity({ wbc: '9000', creatinine: '2.0' });
  assert.equal(r.category, 'severe');
  assert.equal(r.abnormal, true);
});

test('WBC < 15,000 and creatinine < 1.5 is non-severe', () => {
  const r = cdiSeverity({ wbc: '9000', creatinine: '1.0' });
  assert.equal(r.category, 'non-severe');
  assert.equal(r.severe, false);
  assert.equal(r.abnormal, false);
});

test('exactly WBC 15,000 / creatinine 1.5 is severe (>= boundary)', () => {
  const r = cdiSeverity({ wbc: '15000', creatinine: '1.5' });
  assert.equal(r.category, 'severe');
});

test('a fulminant finding classifies fulminant, overriding non-severe labs', () => {
  const r = cdiSeverity({ ileus: true, wbc: '9000', creatinine: '1.0' });
  assert.equal(r.category, 'fulminant');
  assert.equal(r.fulminant, true);
  assert.equal(r.severe, true);
  assert.match(r.band, /ileus present/);
});

test('a fulminant finding classifies fulminant even with no labs entered', () => {
  const r = cdiSeverity({ hypotension: true });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'fulminant');
});

test('megacolon is a fulminant finding', () => {
  assert.equal(cdiSeverity({ megacolon: true }).category, 'fulminant');
});

test('non-fulminant with no labs is invalid (both labs needed)', () => {
  const r = cdiSeverity({});
  assert.equal(r.valid, false);
  assert.match(r.message, /Enter the WBC .* and serum creatinine/);
});

test('non-fulminant missing one lab is invalid', () => {
  assert.equal(cdiSeverity({ creatinine: '1.0' }).valid, false);
  assert.equal(cdiSeverity({ wbc: '9000' }).valid, false);
});
