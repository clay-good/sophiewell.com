// spec-v1638 tool 18, file mode: an NDC's federal upper limit from CMS's file, and the refusals when the
// file is past its review date, did not load, or does not list the NDC.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medicaidFulCheck as ful } from '../../lib/medicaid-ful-check-v1638.js';
import { fulLookup } from '../../lib/aca-ful-lookup.js';

const manifest = { sourceEdition: '2026-09 monthly', fetchedAt: '2026-10-14', expiresOn: '2026-11-15', shards: [{ name: '00002.json' }] };
const rows = [{ ndc: '00002322730', group: '3057', pkg: 30, aRated: true }, { ndc: '00002323560', group: '5028', pkg: 60, aRated: false }];
const groups = {
  3057: { ingredient: 'ATOMOXETINE HYDROCHLORIDE', strength: '10MG', dosage: 'CAPSULE', route: 'ORAL', unit: 'CAP', weightedAmp: 0.134701, ful: 0.32216, over175: true },
  5028: { ingredient: 'DULOXETINE HYDROCHLORIDE', strength: '20 MG', dosage: 'CAPSULE', route: 'ORAL', unit: 'CAP', weightedAmp: 0.120656, ful: 0.211148, over175: false },
};
const now = new Date('2026-10-14T12:00:00Z');
const look = (ndc, at = now) => fulLookup({ ndc, manifest, rows, groups, now: at });

test('file mode: the limit as published, with the 175% flag and its reason', () => {
  const r = ful({ ndc: '00002-3227-30', lookup: look('00002322730') });
  assert.deepEqual([r.fulPerUnit, r.setBySurveyCost, r.fromFile, r.productGroup], [0.32216, true, true, '3057']);
  assert.equal(r.band, 'Federal upper limit 0.32216 a capsule (CMS file, 2026-09 monthly).');
  assert.match(r.notes.join(' '), /above 175% of the weighted average AMP of 0\.134701 a capsule \(175% would be 0\.235727\)/);
  assert.match(r.note, /aggregate limit/);
});

test('file mode: a limit at 175%, a not A-rated NDC, a quantity, and hand figures not used', () => {
  const r = ful({ ndc: '00002323560', lookup: look('00002323560'), quantity: '60', dispensingFee: '10.5', weightedAmp: '1' });
  assert.equal(r.setBySurveyCost, false);
  assert.match(r.notes.join(' '), /1\.75 x 0\.120656 = 0\.211148 a capsule/);
  assert.match(r.notes.join(' '), /not A-rated/);
  assert.equal(r.limitForQuantity, 23.17);
  assert.match(r.notes.join(' '), /For 60 capsules plus a \$10\.50/);
  assert.match(r.notes.join(' '), /entered was not used/);
});

test('file mode: not listed, expired or not loaded asks for the weighted average AMP, or computes by hand', () => {
  assert.match(ful({ ndc: '00002-9999-99', lookup: look('00002999999') }).message, /lists no limit for NDC 00002-9999-99.*Enter the weighted average/);
  assert.match(ful({ ndc: '00002322730', lookup: look('00002322730', new Date('2026-11-16T12:00:00Z')) }).message, /passed its review date.*Enter the weighted average/);
  assert.match(ful({ ndc: '00002322730' }).message, /could not be loaded.*Enter the weighted average/);
  const hand = ful({ ndc: '00002322730', weightedAmp: '0.384485' });
  assert.equal(hand.fulPerUnit, 0.672849);
  assert.match(hand.notes[0], /could not be loaded\. The limit below is computed by hand/);
  assert.match(ful({ ndc: '12-34' }).message, /NDC/);
});
