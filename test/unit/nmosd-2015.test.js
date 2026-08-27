import test from 'node:test';
import assert from 'node:assert/strict';
import { nmosd2015 as n } from '../../lib/nmosd-2015-v823.js';

test('nmosd: with AQP4-IgG, one core characteristic and exclusion suffice', () => {
  const r = n({ aqp4: 'positive', acuteMyelitis: true, alternativesExcluded: true });
  assert.equal(r.criteriaMet, true);
  assert.equal(r.arm, 'seropositive');
  assert.equal(r.coreCount, 1);
  // ...and the exclusion is still required.
  assert.equal(n({ aqp4: 'positive', acuteMyelitis: true }).criteriaMet, false);
  assert.equal(n({ aqp4: 'positive', alternativesExcluded: true }).criteriaMet, false);
});

test('nmosd: the SAME presentation fails without the antibody', () => {
  // The asymmetry that is the whole point. One episode of LETM: enough seropositive,
  // not enough seronegative.
  const sero = { acuteMyelitis: true, mriLetm: true, alternativesExcluded: true };
  assert.equal(n({ ...sero, aqp4: 'positive' }).criteriaMet, true);
  const neg = n({ ...sero, aqp4: 'negative' });
  assert.equal(neg.criteriaMet, false);
  assert.ok(neg.armNote.includes('not equally strict'));
});

test('nmosd: unknown antibody status follows the SERONEGATIVE rule', () => {
  const unknown = n({ aqp4: 'unknown', acuteMyelitis: true, mriLetm: true, alternativesExcluded: true });
  assert.equal(unknown.criteriaMet, false);
  assert.equal(unknown.arm, 'unknown antibody status');
  // And that is the default when no status is given at all.
  assert.equal(n({ acuteMyelitis: true, mriLetm: true, alternativesExcluded: true }).criteriaMet, false);
});

test('nmosd: the seronegative rule needs two DIFFERENT core characteristics', () => {
  const two = n({
    aqp4: 'negative', acuteMyelitis: true, mriLetm: true,
    opticNeuritis: true, mriOpticNerve: true, alternativesExcluded: true,
  });
  assert.equal(two.criteriaMet, true);
  assert.equal(two.coreCount, 2);
});

test('nmosd: at least one must be optic neuritis, LETM or area postrema syndrome', () => {
  // Two core characteristics, but neither is a qualifying one.
  const r = n({
    aqp4: 'negative', brainstemSyndrome: true, mriBrainstem: true,
    cerebralSyndrome: true, alternativesExcluded: true,
  });
  assert.equal(r.coreCount, 2);
  assert.equal(r.criteriaMet, false);
  assert.ok(r.missing.some((m) => m.includes('area postrema')));
});

test('nmosd: myelitis qualifies only when the lesion is longitudinally extensive', () => {
  // Short-segment myelitis plus a brainstem syndrome: two characteristics, none qualifying.
  const short = n({
    aqp4: 'negative', acuteMyelitis: true, brainstemSyndrome: true,
    mriBrainstem: true, alternativesExcluded: true,
  });
  assert.equal(short.coreCount, 2);
  assert.equal(short.criteriaMet, false);
  assert.ok(short.qualifyingNote.includes('longitudinally extensive'));

  // The same pair with a longitudinally extensive lesion does meet it.
  assert.equal(n({
    aqp4: 'negative', acuteMyelitis: true, mriLetm: true, brainstemSyndrome: true,
    mriBrainstem: true, alternativesExcluded: true,
  }).criteriaMet, true);
});

test('nmosd: the MRI requirement must be met for EACH characteristic that carries one', () => {
  const missingMri = n({
    aqp4: 'negative', acuteMyelitis: true, mriLetm: true,
    areaPostrema: true, alternativesExcluded: true,
  });
  assert.equal(missingMri.criteriaMet, false);
  assert.ok(missingMri.mriNote.includes('area postrema'));
  assert.equal(n({
    aqp4: 'negative', acuteMyelitis: true, mriLetm: true,
    areaPostrema: true, mriAreaPostrema: true, alternativesExcluded: true,
  }).criteriaMet, true);
});

test('nmosd: MRI requirements are NOT demanded on the seropositive arm', () => {
  // The additional MRI requirements belong to the seronegative rule only.
  assert.equal(n({ aqp4: 'positive', areaPostrema: true, alternativesExcluded: true }).criteriaMet, true);
  assert.equal(n({ aqp4: 'positive', areaPostrema: true, alternativesExcluded: true }).mriNote, null);
});

test('nmosd: empty and invalid input', () => {
  const empty = n({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.armNote, null);
  assert.equal(n({ aqp4: 'pending' }).valid, false);
  assert.equal(n().valid, true);
  assert.doesNotMatch(JSON.stringify(n({ aqp4: 'positive', acuteMyelitis: true, alternativesExcluded: true })), /NaN|Infinity/);
});
