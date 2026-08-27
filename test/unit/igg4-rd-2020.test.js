import test from 'node:test';
import assert from 'node:assert/strict';
import { igg4Rd2020 as ig, IGG4_THRESHOLD } from '../../lib/igg4-rd-2020-v825.js';

const path2 = { denseInfiltrate: true, igg4Ratio: true };

test('igg4: the three categories', () => {
  assert.equal(ig({ organSwelling: true, serumIgg4: 300, ...path2 }).category, 'Definite IgG4-related disease');
  assert.equal(ig({ organSwelling: true, serumIgg4: 50, ...path2 }).category, 'Probable IgG4-related disease');
  assert.equal(ig({ organSwelling: true, serumIgg4: 300 }).category, 'Possible IgG4-related disease');
  // Item 1 is required for every category.
  assert.equal(ig({ serumIgg4: 300, ...path2 }).category, null);
});

test('igg4: the pathological item needs TWO of three sub-items', () => {
  // The 2020 change. The IgG4 count alone does not carry it.
  const one = ig({ organSwelling: true, serumIgg4: 50, igg4Ratio: true });
  assert.equal(one.items.three, false);
  assert.equal(one.category, null);
  assert.ok(one.pathologyNote.includes('TWO of its three'));

  assert.equal(ig({ organSwelling: true, serumIgg4: 50, ...path2 }).items.three, true);
});

test('igg4: storiform fibrosis can carry the pathology WITHOUT the immunostain', () => {
  // Precisely what the revision was written to allow.
  const noStain = ig({ organSwelling: true, serumIgg4: 50, denseInfiltrate: true, storiformFibrosis: true });
  assert.equal(noStain.items.three, true);
  assert.equal(noStain.category, 'Probable IgG4-related disease');
  assert.ok(noStain.pathologyNote.includes('without the IgG4 immunostain'));
});

test('igg4: "possible" is flagged as the weak category, not a mild one', () => {
  const poss = ig({ organSwelling: true, serumIgg4: 300 });
  assert.equal(poss.category, 'Possible IgG4-related disease');
  assert.ok(poss.possibleWarning.includes('weakest'));
  assert.ok(poss.possibleWarning.includes('malignancy'));
  // Definite carries no such warning.
  assert.equal(ig({ organSwelling: true, serumIgg4: 300, ...path2 }).possibleWarning, null);
});

test('igg4: lymph node swelling alone does not satisfy item 1', () => {
  const nodes = ig({ organSwelling: true, lymphNodesOnly: true, serumIgg4: 300 });
  assert.equal(nodes.items.one, false);
  assert.equal(nodes.category, null);
  assert.ok(nodes.lymphNote.includes('does not satisfy item 1'));
});

test('igg4: the serological threshold, and the boundary is declared unsettled', () => {
  assert.equal(IGG4_THRESHOLD, 135);
  assert.equal(ig({ organSwelling: true, serumIgg4: 134 }).items.two, false);
  assert.equal(ig({ organSwelling: true, serumIgg4: 136 }).items.two, true);
  // Published statements differ at exactly 135; the tile counts it and says so.
  const boundary = ig({ organSwelling: true, serumIgg4: 135 });
  assert.equal(boundary.items.two, true);
  assert.ok(boundary.thresholdNote.includes('unsettled'));
  assert.equal(ig({ organSwelling: true, serumIgg4: 300 }).thresholdNote, null);
});

test('igg4: empty and out-of-range input', () => {
  const empty = ig({});
  assert.equal(empty.valid, true);
  assert.equal(empty.category, null);
  assert.equal(empty.missing.length, 3);
  assert.equal(ig({ serumIgg4: -1 }).valid, false);
  assert.equal(ig({ serumIgg4: 1e308 }).valid, false);
  assert.equal(ig().valid, true);
  assert.doesNotMatch(JSON.stringify(ig({ organSwelling: true, serumIgg4: 300, ...path2 })), /NaN|Infinity/);
});
