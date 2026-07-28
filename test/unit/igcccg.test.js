// spec-v567: the IGCCCG prognostic classification.
//
// The load-bearing tests are that seminoma can never reach "poor" however bad the disease looks, and that
// the good group is an AND while intermediate and poor are ORs.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  igcccg, HISTOLOGIES, PRIMARY_SITES, SURVIVAL,
  AFP_INTERMEDIATE, AFP_POOR, HCG_INTERMEDIATE, HCG_POOR, LDH_INTERMEDIATE, LDH_POOR,
} from '../../lib/igcccg-v567.js';

const nons = (over = {}) => igcccg({
  histology: 'nonseminoma', primarySite: 'testis-retroperitoneal', nonpulmonaryVisceralMets: 'no',
  afp: '10', hcg: '10', ldhMultiple: '1', ...over,
});
const sem = (over = {}) => igcccg({
  histology: 'seminoma', nonpulmonaryVisceralMets: 'no', afpNormal: 'yes', ...over,
});

test('the histologies and primary sites are the published ones', () => {
  assert.deepEqual(HISTOLOGIES.map((h) => h.value), ['nonseminoma', 'seminoma']);
  assert.deepEqual(PRIMARY_SITES.map((p) => p.value), ['testis-retroperitoneal', 'mediastinal']);
});

test('the marker thresholds are the published ones', () => {
  assert.equal(AFP_INTERMEDIATE, 1000);
  assert.equal(AFP_POOR, 10000);
  assert.equal(HCG_INTERMEDIATE, 5000);
  assert.equal(HCG_POOR, 50000);
  assert.equal(LDH_INTERMEDIATE, 1.5);
  assert.equal(LDH_POOR, 10);
});

// THE missing cell.
test('seminoma can never be poor, however extreme the inputs', () => {
  const r = sem({ nonpulmonaryVisceralMets: 'yes' });
  assert.equal(r.group, 'intermediate');
  assert.equal(r.poorCategoryExists, false);
  assert.match(r.bandText, /NO poor-prognosis category/);
});

test('no seminoma input path produces a poor group', () => {
  for (const npvm of ['no', 'yes']) {
    const r = sem({ nonpulmonaryVisceralMets: npvm });
    assert.notEqual(r.group, 'poor', `npvm=${npvm}`);
  }
});

test('seminoma is good without and intermediate with nonpulmonary visceral metastases', () => {
  assert.equal(sem().group, 'good');
  assert.equal(sem({ nonpulmonaryVisceralMets: 'yes' }).group, 'intermediate');
});

// The AFP gate.
test('a raised AFP in seminoma is a reclassification, not a group', () => {
  const r = sem({ afpNormal: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.classified, false);
  assert.equal(r.group, null);
  assert.equal(r.reclassifyAsNonseminoma, true);
  assert.match(r.bandText, /NOT a pure seminoma/);
});

test('seminoma ignores hCG and LDH entirely', () => {
  const bare = sem();
  const loaded = igcccg({
    histology: 'seminoma', nonpulmonaryVisceralMets: 'no', afpNormal: 'yes',
    hcg: '999999', ldhMultiple: '50',
  });
  assert.equal(loaded.group, bare.group);
});

test('seminoma permits any primary site', () => {
  const mediastinal = igcccg({
    histology: 'seminoma', nonpulmonaryVisceralMets: 'no', afpNormal: 'yes', primarySite: 'mediastinal',
  });
  assert.equal(mediastinal.group, 'good', 'a mediastinal primary does not demote a seminoma');
});

// AND vs OR.
test('good prognosis requires every criterion, so any one failure demotes', () => {
  assert.equal(nons().group, 'good');
  assert.equal(nons({ afp: String(AFP_INTERMEDIATE) }).group, 'intermediate');
  assert.equal(nons({ hcg: String(HCG_INTERMEDIATE) }).group, 'intermediate');
  assert.equal(nons({ ldhMultiple: String(LDH_INTERMEDIATE) }).group, 'intermediate');
});

test('poor prognosis is any-of, so one trigger is enough', () => {
  assert.equal(nons({ primarySite: 'mediastinal' }).group, 'poor');
  assert.equal(nons({ nonpulmonaryVisceralMets: 'yes' }).group, 'poor');
  assert.equal(nons({ afp: '10001' }).group, 'poor');
  assert.equal(nons({ hcg: '50001' }).group, 'poor');
  assert.equal(nons({ ldhMultiple: '10' }).group, 'poor');
});

test('poor outranks intermediate when both are triggered', () => {
  const r = nons({ afp: String(AFP_INTERMEDIATE), hcg: '50001' });
  assert.equal(r.group, 'poor');
});

test('the marker boundaries fall in the published bands', () => {
  assert.equal(nons({ afp: '999' }).group, 'good');
  assert.equal(nons({ afp: '1000' }).group, 'intermediate');
  assert.equal(nons({ afp: '10000' }).group, 'intermediate');
  assert.equal(nons({ afp: '10001' }).group, 'poor');
  assert.equal(nons({ ldhMultiple: '1.4' }).group, 'good');
  assert.equal(nons({ ldhMultiple: '9.9' }).group, 'intermediate');
});

test('an LDH of exactly 10 is assigned to poor and the boundary is disclosed', () => {
  const r = nons({ ldhMultiple: '10' });
  assert.equal(r.group, 'poor');
  assert.equal(r.onLdhBoundary, true);
  assert.match(r.bandText, /would leave exactly 10 times normal in no group/);
});

test('the boundary disclosure appears only at exactly 10', () => {
  assert.doesNotMatch(nons({ ldhMultiple: '9.9' }).bandText, /in no group/);
  assert.doesNotMatch(nons({ ldhMultiple: '11' }).bandText, /in no group/);
});

// The two survival vintages.
test('both survival vintages are reported and differ where the update changed', () => {
  assert.equal(SURVIVAL.nonseminoma.poor.original1997, '48 percent');
  assert.equal(SURVIVAL.nonseminoma.poor.update2021, '71 percent');
  const r = nons({ primarySite: 'mediastinal' });
  assert.match(r.bandText, /48 percent/);
  assert.match(r.bandText, /71 percent/);
  assert.match(r.bandText, /DEFINITIONS are identical in both/);
});

test('seminoma survival is unchanged between vintages', () => {
  assert.equal(SURVIVAL.seminoma.good.original1997, SURVIVAL.seminoma.good.update2021);
});

// Units and timing.
test('the result states the hCG unit and the LDH multiple', () => {
  const r = nons();
  assert.match(r.bandText, /IU\/L/);
  assert.match(r.bandText, /MULTIPLE of the local upper limit of normal/);
  assert.match(r.bandText, /POST-ORCHIECTOMY, PRE-CHEMOTHERAPY/);
});

// Input handling.
test('histology is required', () => {
  assert.equal(igcccg({}).valid, false);
  assert.match(igcccg({}).message, /pathologic and serologic determination/);
});

test('nonseminoma requires the primary site and all three markers', () => {
  assert.equal(igcccg({ histology: 'nonseminoma', nonpulmonaryVisceralMets: 'no' }).valid, false);
  assert.equal(nons({ afp: '' }).valid, false);
  assert.equal(nons({ hcg: '' }).valid, false);
  assert.equal(nons({ ldhMultiple: '' }).valid, false);
});

test('seminoma requires the AFP gate answer', () => {
  const r = igcccg({ histology: 'seminoma', nonpulmonaryVisceralMets: 'no' });
  assert.equal(r.valid, false);
  assert.match(r.message, /gate, not a graded marker/);
});

test('the scope note refuses to diagnose or select a regimen', () => {
  const r = nons();
  assert.match(r.note, /does not diagnose germ cell cancer/);
  assert.match(r.note, /does not select a regimen/);
  assert.match(r.note, /does not apply to stage I disease/);
});
