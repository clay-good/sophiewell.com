// spec-v978: two tiles credited one paper with two different tables.
//
// `ebv-mabl` and `max-allowable-blood-loss` are the same instrument built twice.
// Both cite Gross JB, Anesthesiology 1983;58(3):277-280 -- which is the dilution
// correction to the allowable-loss formula, and takes the estimated blood volume
// as an INPUT. Neither the paper nor anything reachable publishes the per-kilogram
// band table both tiles offer, and the two tables DISAGREE:
//
//        ebv-mabl   max-allowable-blood-loss
//   term neonate      90            85
//   child             75            70
//
// At most one can be right and there is no way to tell which, so per spec-v97 the
// divergence is disclosed rather than resolved: the tiles still offer their own
// tables, and neither tells the reader that Gross published them.
//
// This pins both halves. Removing the disclosure, or re-crediting the factor table
// to Gross, fails here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { ebvMabl } from '../../lib/clinical-v7.js';
import { maxAllowableBloodLoss } from '../../lib/nephro-fluids-v204.js';

const GROSS = /Gross/;

test('the two tiles still disagree, and the disagreement is the reason for the disclosure', () => {
  // A 3 kg term neonate, hematocrit 45 down to 30.
  const a = ebvMabl({ weightKg: 3, ebvFactor: 90, startHct: 45, minHct: 30 });
  const b = maxAllowableBloodLoss({ category: 'neonate', weight: 3, hctInitial: 45, hctTarget: 30 });
  assert.equal(a.ebv, 270, 'ebv-mabl offers 90 mL/kg for a term neonate');
  assert.equal(b.ebv, 255, 'max-allowable-blood-loss offers 85');
  assert.notEqual(a.mabl, b.score, 'so the allowable loss differs too');

  // A 20 kg child: 75 mL/kg against 70.
  assert.equal(ebvMabl({ weightKg: 20, ebvFactor: 75, startHct: 40, minHct: 30 }).ebv, 1500);
  assert.equal(maxAllowableBloodLoss({ category: 'child', weight: 20, hctInitial: 40, hctTarget: 30 }).ebv, 1400);
});

test('neither tile credits Gross with the blood-volume factor table', () => {
  const abl = maxAllowableBloodLoss({ category: 'adult-male', weight: 70, hctInitial: 42, hctTarget: 30 });
  const mabl = ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 45, minHct: 30 });
  for (const [what, text] of [
    ['the ABL tool note', abl.note],
    ['the EBV/MABL tool note', mabl.note],
    ['the ebv-mabl citation', META['ebv-mabl'].citation],
    ['the ABL interpretation source line', META['max-allowable-blood-loss'].interpretation.sourceCitation],
  ]) {
    // Where Gross is named, the sentence naming him must not also be the one
    // carrying the per-kilogram numbers.
    const sentences = String(text).split(/(?<=[.;])\s+/);
    for (const s of sentences) {
      if (!GROSS.test(s)) continue;
      assert.ok(!/mL\/kg/.test(s), `${what}: "${s.trim()}" credits Gross with a per-kilogram table`);
    }
  }
});

test('each tile says the factor is a reference value, not the paper', () => {
  const abl = maxAllowableBloodLoss({ category: 'adult-male', weight: 70, hctInitial: 42, hctTarget: 30 });
  const mabl = ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 45, minHct: 30 });
  assert.match(abl.note, /differ between references|conventional reference value/i);
  assert.match(mabl.note, /differ between references|conventional reference value/i);
  assert.match(META['ebv-mabl'].citation, /takes the estimated blood volume as an input/i);
});

test('a reader on one tile can reach the other', () => {
  assert.ok(META['ebv-mabl'].related.includes('max-allowable-blood-loss'));
  assert.ok(META['max-allowable-blood-loss'].related.includes('ebv-mabl'));
});
