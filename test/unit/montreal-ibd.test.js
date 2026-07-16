// spec-v328: Montreal classification of IBD. Worked-example tests: the Crohn's A/L/B
// phenotype with the +L4 and p modifiers, the UC E/S phenotype, disease defaulting to
// Crohn's, and the validation guards. Categories transcribed from Silverberg 2005 (Can J
// Gastroenterol) / Satsangi 2006 (Gut), cross-verified across reproductions (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montrealIbd } from '../../lib/montreal-ibd-v328.js';

test('Crohn A2 L3 B2 composes the phenotype (the META example)', () => {
  const r = montrealIbd({ disease: 'crohn', crohnAge: 'A2', crohnLocation: 'L3', crohnBehavior: 'B2' });
  assert.equal(r.valid, true);
  assert.equal(r.disease, 'crohn');
  assert.equal(r.phenotype, 'A2 L3 B2');
  assert.match(r.band, /A2 \(17-40 years\), L3 \(ileocolonic\), B2 \(stricturing\)/);
});

test('the +L4 and perianal p modifiers are appended', () => {
  const r = montrealIbd({ disease: 'crohn', crohnAge: 'A1', crohnLocation: 'L1', crohnUpperGI: true, crohnBehavior: 'B3', crohnPerianal: true });
  assert.equal(r.phenotype, 'A1 L1+L4 B3p');
  assert.match(r.band, /perianal \(p\) modifier/);
});

test('ulcerative colitis composes an E/S phenotype', () => {
  const r = montrealIbd({ disease: 'uc', ucExtent: 'E3', ucSeverity: 'S2' });
  assert.equal(r.disease, 'uc');
  assert.equal(r.phenotype, 'E3 S2');
  assert.match(r.band, /E3 \(extensive \/ pancolitis\), S2 \(moderate\)/);
});

test('UC severity S3 is flagged abnormal (severe)', () => {
  assert.equal(montrealIbd({ disease: 'uc', ucExtent: 'E3', ucSeverity: 'S3' }).abnormal, true);
  assert.equal(montrealIbd({ disease: 'uc', ucExtent: 'E3', ucSeverity: 'S1' }).abnormal, false);
});

test('disease defaults to Crohn’s when unspecified', () => {
  const r = montrealIbd({ crohnAge: 'A2', crohnLocation: 'L2', crohnBehavior: 'B1' });
  assert.equal(r.disease, 'crohn');
  assert.equal(r.phenotype, 'A2 L2 B1');
});

test('missing required axes are invalid', () => {
  assert.equal(montrealIbd({ disease: 'crohn', crohnAge: 'A2' }).valid, false);
  assert.equal(montrealIbd({ disease: 'uc', ucExtent: 'E2' }).valid, false);
  assert.equal(montrealIbd({ disease: 'crohn', crohnAge: 'A9', crohnLocation: 'L3', crohnBehavior: 'B2' }).valid, false);
});
