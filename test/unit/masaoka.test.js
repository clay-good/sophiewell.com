// spec-v650: Masaoka-Koga staging of thymic epithelial tumors.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { masaokaKoga } from '../../lib/masaoka-v650.js';

test('nothing entered is Stage I (completely encapsulated)', () => {
  const r = masaokaKoga({});
  assert.equal(r.stage, 'I');
  assert.equal(r.abnormal, false);
});

test('each finding maps to its stage', () => {
  assert.equal(masaokaKoga({ microInvasion: '1' }).stage, 'IIa');
  assert.equal(masaokaKoga({ macroInvasion: '1' }).stage, 'IIb');
  assert.equal(masaokaKoga({ organInvasion: '1' }).stage, 'III');
  assert.equal(masaokaKoga({ dissemination: '1' }).stage, 'IVa');
  assert.equal(masaokaKoga({ distantMets: '1' }).stage, 'IVb');
});

test('the most advanced finding sets the stage', () => {
  // Micro + organ + mets -> IVb (highest).
  assert.equal(masaokaKoga({ microInvasion: '1', organInvasion: '1', distantMets: '1' }).stage, 'IVb');
  // Micro + macro -> IIb (higher of the two).
  assert.equal(masaokaKoga({ microInvasion: '1', macroInvasion: '1' }).stage, 'IIb');
  // Organ + dissemination -> IVa.
  assert.equal(masaokaKoga({ organInvasion: '1', dissemination: '1' }).stage, 'IVa');
});

test('III and IV are flagged abnormal; I and II are not', () => {
  assert.equal(masaokaKoga({}).abnormal, false); // I
  assert.equal(masaokaKoga({ microInvasion: '1' }).abnormal, false); // IIa
  assert.equal(masaokaKoga({ macroInvasion: '1' }).abnormal, false); // IIb
  assert.equal(masaokaKoga({ organInvasion: '1' }).abnormal, true); // III
  assert.equal(masaokaKoga({ dissemination: '1' }).abnormal, true); // IVa
  assert.equal(masaokaKoga({ distantMets: '1' }).abnormal, true); // IVb
});

test('bandLabel carries the stage code', () => {
  assert.match(masaokaKoga({ macroInvasion: '1' }).bandLabel, /Masaoka-Koga stage IIb/);
  assert.equal(masaokaKoga({}).valid, true);
});
