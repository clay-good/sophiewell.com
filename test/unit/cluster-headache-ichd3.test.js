import test from 'node:test';
import assert from 'node:assert/strict';
import { clusterHeadacheIchd3 } from '../../lib/cluster-headache-ichd3-v814.js';

const core = {
  attackCount: 6,
  severeUnilateralPain: true,
  attackDuration: 60,
  attacksPerDay: 2,
  noBetterExplanation: true,
};

test('ichd3 cluster: all five criteria met', () => {
  const r = clusterHeadacheIchd3({ ...core, miosisPtosis: true });
  assert.equal(r.criteriaMet, true);
  assert.deepEqual(r.criteria, { a: true, b: true, c: true, d: true, e: true });
});

test('ichd3 cluster: restlessness ALONE satisfies criterion C', () => {
  // The misread this tile exists to correct. No autonomic sign is required.
  const r = clusterHeadacheIchd3({ ...core, restlessness: true });
  assert.equal(r.criteria.c, true);
  assert.equal(r.criteriaMet, true);
  assert.deepEqual(r.autonomicSigns, []);
  assert.ok(r.restlessOnlyNote.includes('either or both'));
});

test('ichd3 cluster: ONE autonomic sign is enough, and the note is not raised then', () => {
  const r = clusterHeadacheIchd3({ ...core, conjunctivalInjection: true });
  assert.equal(r.criteria.c, true);
  assert.equal(r.autonomicSigns.length, 1);
  assert.equal(r.restlessOnlyNote, null);
});

test('ichd3 cluster: with neither an autonomic sign nor restlessness, C fails', () => {
  const r = clusterHeadacheIchd3(core);
  assert.equal(r.criteria.c, false);
  assert.equal(r.criteriaMet, false);
});

test('ichd3 cluster: criterion D is a WINDOW - too few fails as surely as too many', () => {
  const few = clusterHeadacheIchd3({ ...core, restlessness: true, attacksPerDay: 0.25 });
  assert.equal(few.criteria.d, false);
  assert.equal(few.criteriaMet, false);
  assert.ok(few.frequencyNote.includes('BELOW the floor'));

  const many = clusterHeadacheIchd3({ ...core, restlessness: true, attacksPerDay: 10 });
  assert.equal(many.criteria.d, false);
  assert.ok(many.frequencyNote.includes('above the ceiling'));

  // The published bounds themselves are inclusive.
  assert.equal(clusterHeadacheIchd3({ ...core, restlessness: true, attacksPerDay: 0.5 }).criteria.d, true);
  assert.equal(clusterHeadacheIchd3({ ...core, restlessness: true, attacksPerDay: 8 }).criteria.d, true);
});

test('ichd3 cluster: the duration bounds are 15 to 180 minutes inclusive', () => {
  const at = (m) => clusterHeadacheIchd3({ ...core, restlessness: true, attackDuration: m }).criteria.b;
  assert.equal(at(14), false);
  assert.equal(at(15), true);
  assert.equal(at(180), true);
  assert.equal(at(181), false);
});

test('ichd3 cluster: fewer than five attacks fails criterion A', () => {
  assert.equal(clusterHeadacheIchd3({ ...core, restlessness: true, attackCount: 4 }).criteria.a, false);
  assert.equal(clusterHeadacheIchd3({ ...core, restlessness: true, attackCount: 5 }).criteria.a, true);
});

test('ichd3 cluster: the subtype is only assigned once the criteria are met', () => {
  const met = clusterHeadacheIchd3({ ...core, restlessness: true, remissionPattern: 'episodic' });
  assert.ok(met.subtype.includes('3.1.1'));
  const chronic = clusterHeadacheIchd3({ ...core, restlessness: true, remissionPattern: 'chronic' });
  assert.ok(chronic.subtype.includes('3.1.2'));
  // Criteria not met: no subtype is offered for a diagnosis that has not been made.
  const notMet = clusterHeadacheIchd3({ ...core, remissionPattern: 'chronic' });
  assert.equal(notMet.criteriaMet, false);
  assert.equal(notMet.subtype, null);
  assert.equal(clusterHeadacheIchd3({ ...core, restlessness: true }).subtype, null);
});

test('ichd3 cluster: empty and invalid input', () => {
  const empty = clusterHeadacheIchd3({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.missing.length, 5);
  assert.equal(empty.frequencyNote, null);
  assert.equal(clusterHeadacheIchd3({ attacksPerDay: -1 }).valid, false);
  assert.equal(clusterHeadacheIchd3({ attackDuration: -5 }).valid, false);
  assert.equal(clusterHeadacheIchd3().valid, true);
});
