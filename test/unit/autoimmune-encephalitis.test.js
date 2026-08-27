import test from 'node:test';
import assert from 'node:assert/strict';
import { autoimmuneEncephalitis as ae, PLEOCYTOSIS_THRESHOLD } from '../../lib/autoimmune-encephalitis-v824.js';

const possible = { subacuteOnset: true, newSeizures: true, alternativesExcluded: true };
const limbic = {
  subacuteOnset: true, limbicPresentation: true,
  bilateralMedialTemporal: true, temporalEeg: true, alternativesExcluded: true,
};

test('ae: possible autoimmune encephalitis needs all three requirements', () => {
  assert.equal(ae(possible).possibleMet, true);
  assert.equal(ae({ ...possible, subacuteOnset: false }).possibleMet, false);
  assert.equal(ae({ ...possible, newSeizures: false }).possibleMet, false);
  assert.equal(ae({ ...possible, alternativesExcluded: false }).possibleMet, false);
});

test('ae: any ONE of the four supporting features satisfies criterion 2', () => {
  const base = { subacuteOnset: true, alternativesExcluded: true };
  assert.equal(ae({ ...base, focalCnsFindings: true }).possibleMet, true);
  assert.equal(ae({ ...base, newSeizures: true }).possibleMet, true);
  assert.equal(ae({ ...base, csfWhiteCells: 20 }).possibleMet, true);
  assert.equal(ae({ ...base, mriSuggestive: true }).possibleMet, true);
  assert.equal(ae(base).possibleMet, false);
});

test('ae: pleocytosis is strictly MORE than five white cells', () => {
  const base = { subacuteOnset: true, alternativesExcluded: true };
  assert.equal(PLEOCYTOSIS_THRESHOLD, 5);
  assert.equal(ae({ ...base, csfWhiteCells: 5 }).pleocytosis, false);
  assert.equal(ae({ ...base, csfWhiteCells: 5 }).possibleMet, false);
  assert.equal(ae({ ...base, csfWhiteCells: 6 }).pleocytosis, true);
  assert.equal(ae({ ...base, csfWhiteCells: 6 }).possibleMet, true);
  assert.equal(ae({ ...base, csfWhiteCells: 0 }).pleocytosis, false);
});

test('ae: definite limbic encephalitis needs all four, MRI included', () => {
  assert.equal(ae(limbic).limbicMet, true);
  // Bilateral medial temporal change is mandatory here, not one of several options.
  assert.equal(ae({ ...limbic, bilateralMedialTemporal: false }).limbicMet, false);
  assert.equal(ae({ ...limbic, limbicPresentation: false }).limbicMet, false);
  assert.equal(ae({ ...limbic, alternativesExcluded: false }).limbicMet, false);
});

test('ae: the third limbic requirement takes CSF pleocytosis OR a temporal EEG', () => {
  const noEeg = { ...limbic, temporalEeg: false };
  assert.equal(ae(noEeg).limbicMet, false);
  assert.equal(ae({ ...noEeg, csfWhiteCells: 20 }).limbicMet, true);
});

test('ae: the MRI requirement is one of four in one set and mandatory in the other', () => {
  // A normal scan leaves possible AE open and rules definite limbic encephalitis out.
  const normalScan = ae(possible);
  assert.equal(normalScan.possibleMet, true);
  assert.equal(normalScan.limbicMet, false);
  assert.ok(normalScan.mriNote.includes('mandatory in the second'));
});

test('ae: there is NO antibody input, and the result says why', () => {
  // The central design decision of the paper. Asking for serology would defeat it.
  const r = ae(possible);
  const keys = JSON.stringify(r).toLowerCase();
  assert.ok(!keys.includes('antibodystatus'));
  assert.ok(r.antibodyNote.includes('by design'));
  assert.ok(r.antibodyNote.includes('does not undo'));
});

test('ae: both can be reported together, the definite one first', () => {
  const both = ae({ ...limbic, newSeizures: true, mriSuggestive: true });
  assert.equal(both.possibleMet, true);
  assert.equal(both.limbicMet, true);
  assert.equal(both.diagnoses[0], 'definite autoimmune limbic encephalitis');
});

test('ae: empty and out-of-range input', () => {
  const empty = ae({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.antibodyNote, null);
  assert.equal(ae({ csfWhiteCells: -1 }).valid, false);
  assert.equal(ae({ csfWhiteCells: 1e308 }).valid, false);
  assert.equal(ae().valid, true);
  assert.doesNotMatch(JSON.stringify(ae(possible)), /NaN|Infinity/);
});
