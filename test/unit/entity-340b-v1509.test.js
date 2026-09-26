// spec-v1509 tools 1 and 2: hospital 340B eligibility and the orphan-drug exclusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entityEligibility340b as e, orphanExclusion340b as o, patientCheck340b as p, duplicateDiscount340b as dd, ceilingPrice340b as cp } from '../../lib/entity-340b-v1509.js';

test('a DSH hospital needs more than 11.75%, the ownership test, and no group purchasing', () => {
  assert.equal(e({ type: 'dsh', ownership: 'contract', dshPercent: '11.76', usesGpo: 'no' }).eligible, true);
  assert.equal(e({ type: 'dsh', ownership: 'contract', dshPercent: '11.75', usesGpo: 'no' }).eligible, false);
  assert.equal(e({ type: 'dsh', ownership: 'other', dshPercent: '20', usesGpo: 'no' }).eligible, false);
  assert.equal(e({ type: 'dsh', ownership: 'government', dshPercent: '20', usesGpo: 'yes' }).eligible, false);
});

test('rural referral centers and sole community hospitals need at least 8%; critical access hospitals need no percentage', () => {
  assert.equal(e({ type: 'rrc', ownership: 'government', dshPercent: '8' }).eligible, true);
  assert.equal(e({ type: 'sch', ownership: 'government', dshPercent: '7.99' }).eligible, false);
  assert.equal(e({ type: 'cah', ownership: 'government' }).eligible, true);
});

test('a hospital described in 1886(d)(5)(F)(i)(II) meets the percentage test without it', () => {
  assert.equal(e({ type: 'dsh', ownership: 'government', pickle: 'yes', usesGpo: 'no' }).eligible, true);
});

test('orphan exclusion: cancer, critical access, rural referral and sole community; never children\'s', () => {
  for (const t of ['cancer', 'cah', 'rrc', 'sch']) assert.equal(o({ type: t, orphan: 'yes' }).excluded, true, t);
  for (const t of ['dsh', 'childrens', 'grantee']) assert.equal(o({ type: t, orphan: 'yes' }).excluded, false, t);
  assert.equal(o({ type: 'cah', orphan: 'no' }).excluded, false);
});

test('blank choices ask', () => {
  assert.equal(e({}).valid, false);
  assert.equal(e({ type: 'dsh', ownership: 'government' }).valid, false);
  assert.equal(o({ type: 'cah' }).valid, false);
});

test('340b-patient-check: all applicable prongs, and never dispensing-only', () => {
  const ok = { entity: 'grantee', records: 'yes', provider: 'yes', scope: 'yes', dispensingOnly: 'no' };
  assert.equal(p(ok).patient, true);
  assert.equal(p({ ...ok, scope: 'no' }).patient, false);
  assert.equal(p({ ...ok, dispensingOnly: 'yes' }).patient, false);
  assert.equal(p({ entity: 'hospital', records: 'yes', provider: 'yes', dispensingOnly: 'no' }).patient, true);
  assert.equal(p({ entity: 'grantee', records: 'yes', provider: 'yes', dispensingOnly: 'no' }).valid, false);
});

test('340b-duplicate-discount: TB for Part B, no Part D identifier, the Medicaid Exclusion File for fee-for-service only', () => {
  assert.equal(dd({ payer: 'partb', serviceDate: '2026-05-01' }).bandLabel, 'TB modifier');
  assert.equal(dd({ payer: 'partd' }).bandLabel, 'No claim identifier');
  assert.equal(dd({ payer: 'medicaid-ffs', mef: 'out' }).bandLabel, 'Carve-out: no 340B stock');
  assert.equal(dd({ payer: 'medicaid-mco' }).bandLabel, 'State rule');
  assert.equal(dd({ payer: 'medicaid-ffs' }).valid, false);
});

test('340b-duplicate-discount: a change counts next quarter only if approved before the 16th of the month before', () => {
  assert.match(dd({ payer: 'medicaid-ffs', mef: 'out', changeApproved: '2026-09-15' }).notes[0], /takes effect October 1, 2026/);
  assert.match(dd({ payer: 'medicaid-ffs', mef: 'out', changeApproved: '2026-09-16' }).notes[0], /takes effect January 1, 2027/);
});

test('340b-ceiling-price: basic and inflation rebates, the pre-2024 cap and penny pricing', () => {
  assert.equal(cp({ category: 'brand', amp: '10', bestPrice: '8.5' }).ceiling, 7.69);
  assert.equal(cp({ category: 'brand', amp: '10', bestPrice: '6', baselineAmp: '4', baselineCpi: '200', currentCpi: '300' }).ura, 8);
  assert.equal(cp({ category: 'generic', amp: '2' }).ura, 0.26);
  const pen = cp({ category: 'brand', amp: '10', bestPrice: '0.5', baselineAmp: '4', baselineCpi: '200', currentCpi: '300' });
  assert.equal(pen.penny, true);
  assert.equal(pen.ceiling, 0.01);
  assert.equal(cp({ category: 'brand', amp: '10', bestPrice: '0.5', baselineAmp: '4', baselineCpi: '200', currentCpi: '300', year: '2023' }).ura, 10);
  assert.equal(cp({ category: 'brand', amp: '10', baselineAmp: '4' }).valid, false);
});
