// spec-v532: the Columbia classification of FSGS.
// Worked-example tests: each variant reached in its own right, the full precedence order, and above all the
// TIP VETO: a qualifying tip lesion plus perihilar sclerosis anywhere is NOT tip, which a rank comparison
// would get wrong. Criteria and hierarchy transcribed from D'Agati and colleagues 2004 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { columbiaFsgs, FSGS_FINDINGS } from '../../lib/columbia-fsgs-v532.js';

function biopsy(over = {}) {
  const none = {
    collapse: 'no', tipLesion: 'no', anyPerihilarSclerosis: 'no',
    endocapillary: 'no', perihilarMajority: 'no', matrixIncrease: 'no',
  };
  return columbiaFsgs({ ...none, ...over });
}

test('six findings drive the classification', () => {
  assert.equal(FSGS_FINDINGS.length, 6);
});

test('each variant is reached by its own defining lesion', () => {
  assert.equal(biopsy({ collapse: 'yes' }).variant, 'collapsing');
  assert.equal(biopsy({ tipLesion: 'yes' }).variant, 'tip');
  assert.equal(biopsy({ endocapillary: 'yes' }).variant, 'cellular');
  assert.equal(biopsy({ perihilarMajority: 'yes' }).variant, 'perihilar');
  assert.equal(biopsy({ matrixIncrease: 'yes' }).variant, 'nos');
});

test('collapsing trumps everything, however much else is present', () => {
  const r = biopsy({
    collapse: 'yes', tipLesion: 'yes', anyPerihilarSclerosis: 'yes',
    endocapillary: 'yes', perihilarMajority: 'yes', matrixIncrease: 'yes',
  });
  assert.equal(r.variant, 'collapsing');
  assert.match(r.band, /takes precedence over every other finding/);
});

test('THE TIP VETO: a qualifying tip lesion plus any perihilar sclerosis is NOT tip', () => {
  const r = biopsy({ tipLesion: 'yes', anyPerihilarSclerosis: 'yes', endocapillary: 'yes' });
  assert.notEqual(r.variant, 'tip');
  assert.equal(r.variant, 'cellular');
  assert.equal(r.tipVetoed, true);
  assert.match(r.band, /vetoed by perihilar sclerosis/);
});

test('the veto is not a rank comparison: tip outranks perihilar yet loses to it here', () => {
  // Tip sits ABOVE perihilar in the order, so a naive rank comparison would return tip.
  const r = biopsy({ tipLesion: 'yes', anyPerihilarSclerosis: 'yes', perihilarMajority: 'yes' });
  assert.equal(r.variant, 'perihilar');
  assert.equal(r.tipVetoed, true);
});

test('perihilar sclerosis without a tip lesion does not veto anything else', () => {
  const r = biopsy({ anyPerihilarSclerosis: 'yes', endocapillary: 'yes' });
  assert.equal(r.variant, 'cellular');
  assert.equal(r.tipVetoed, false);
});

test('tip beats cellular, and cellular beats perihilar, when no veto applies', () => {
  assert.equal(biopsy({ tipLesion: 'yes', endocapillary: 'yes' }).variant, 'tip');
  assert.equal(biopsy({ endocapillary: 'yes', perihilarMajority: 'yes' }).variant, 'cellular');
  assert.equal(biopsy({ perihilarMajority: 'yes', matrixIncrease: 'yes' }).variant, 'perihilar');
});

test('NOS is the diagnosis of exclusion (the META example)', () => {
  const r = biopsy({ matrixIncrease: 'yes' });
  assert.equal(r.variantName, 'Not otherwise specified (NOS)');
  assert.match(r.band, /diagnosis of exclusion/);
});

test('no defining lesion yields no variant rather than a default', () => {
  const r = biopsy();
  assert.equal(r.valid, true);
  assert.equal(r.variant, null);
  assert.match(r.band, /nothing here to classify/);
});

test('the perihilar threshold is stated as strictly more than half', () => {
  const f = FSGS_FINDINGS.find((x) => x.key === 'perihilarMajority');
  assert.match(f.text, /MORE THAN 50 percent/);
  assert.match(f.detail, /exactly 50 percent does not qualify/);
});

test('the cellular 25-percent qualifier is named but not enforced', () => {
  const f = FSGS_FINDINGS.find((x) => x.key === 'endocapillary');
  assert.match(f.detail, /narrative rather than part of the criteria table, so it is not enforced/);
  // Cellular is reached without any tuft-percentage input existing at all.
  assert.equal(FSGS_FINDINGS.some((x) => /tuft.*percent.*input/i.test(x.key)), false);
  assert.equal(biopsy({ endocapillary: 'yes' }).variant, 'cellular');
});

test('the copy refuses the diagnosis and the primary-versus-secondary reading', () => {
  const n = biopsy({ collapse: 'yes' }).note;
  assert.match(n, /does not diagnose FSGS/);
  assert.match(n, /secondary or adaptive form/);
  assert.match(n, /foot-process effacement/);
  assert.doesNotMatch(n, /\d+ ?(percent|%) (survival|progress)/);
});

test('yes/no parsing and the guards', () => {
  assert.equal(columbiaFsgs({}).valid, false);
  assert.equal(biopsy({ collapse: 'maybe' }).valid, false);
  assert.equal(columbiaFsgs({ collapse: true, tipLesion: false, anyPerihilarSclerosis: 0,
    endocapillary: 0, perihilarMajority: 0, matrixIncrease: 0 }).variant, 'collapsing');
});
