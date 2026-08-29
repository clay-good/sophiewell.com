import test from 'node:test';
import assert from 'node:assert/strict';
import { brosetViolence as bv, BEHAVIORS } from '../../lib/broset-v866.js';

const all = () => Object.fromEntries(BEHAVIORS.map((b) => [b.key, true]));

test('broset: six behaviors, one point each', () => {
  assert.equal(BEHAVIORS.length, 6);
  assert.deepEqual(BEHAVIORS.map((b) => b.key), ['confused', 'irritable', 'boisterous', 'physicallyThreatening', 'verballyThreatening', 'attackingObjects']);
  assert.equal(bv(all()).total, 6);
  for (const b of BEHAVIORS) assert.equal(bv({ [b.key]: true }).total, 1, b.key);
});

test('broset: the three risk bands', () => {
  assert.equal(bv({}).risk, 'small');
  assert.equal(bv({ irritable: true }).risk, 'moderate');
  assert.equal(bv({ irritable: true, boisterous: true }).risk, 'moderate');
  assert.equal(bv({ irritable: true, boisterous: true, confused: true }).risk, 'very-high');
  assert.equal(bv(all()).risk, 'very-high');
  assert.match(bv({ irritable: true }).band, /preventive measures should be taken/i);
  assert.match(bv(all()).band, /plan for managing an attack/);
});

test('broset: the twenty-four hour window is stated on every result', () => {
  // The reason the tile exists.
  for (const input of [{}, { irritable: true }, all()]) {
    assert.match(bv(input).windowNote, /next twenty-four hours and only that/);
    assert.match(bv(input).windowNote, /rescored every shift/);
  }
});

test('broset: a total of zero is small, never none', () => {
  const r = bv({});
  assert.equal(r.total, 0);
  assert.match(r.action, /the risk of violence is small/);
  assert.match(r.zeroNote, /Small is not none/);
  assert.match(r.zeroNote, /not a clearance/);
  assert.match(r.presentNote, /None of the six behaviors/);
  // Nothing to say about zero once something scored.
  assert.equal(bv({ irritable: true }).zeroNote, null);
});

test('broset: the score never authorizes restraint or seclusion', () => {
  for (const input of [{}, { irritable: true }, all()]) {
    assert.match(bv(input).notRestraintNote, /never a justification for restraint or seclusion/);
    assert.match(bv(input).scopeNote, /never authorizes restraint or seclusion/);
  }
});

test('broset: confusion is scored as behavior, not as a diagnosis', () => {
  assert.match(bv({ confused: true }).confusedNote, /rather than a diagnosis/);
  assert.match(bv({ confused: true }).confusedNote, /cause still has to be looked for/);
  assert.equal(bv({ irritable: true }).confusedNote, null);
});

test('broset: what scored is named back', () => {
  const r = bv({ confused: true, attackingObjects: true });
  assert.deepEqual(r.present, ['Confused', 'Attacking objects']);
  assert.match(r.presentNote, /confused; attacking objects/);
});

test('broset: string truthy values from the DOM behave like checkboxes', () => {
  assert.equal(bv({ irritable: 'true' }).total, 1);
  assert.equal(bv({ irritable: 'yes' }).total, 1);
  assert.equal(bv({ irritable: 'false' }).total, 0);
  assert.equal(bv({ irritable: '' }).total, 0);
});

test('broset: an empty input is a valid score of zero, not an error', () => {
  const r = bv();
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
});
