// spec-v148 2.3: 2022 ACR/EULAR GCA (Ponte 2022). Age>=50 entry, weighted items
// 0-25, >=6 = GCA.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gcaAcrEular2022 } from '../../lib/rheum-v148.js';

test('entry not met -> not applicable', () => {
  const r = gcaAcrEular2022({ biopsyHalo: 1, aprHigh: 1 });
  assert.equal(r.applicable, false);
  assert.match(r.band, /age/);
});

test('exactly 6 -> classified GCA (flip)', () => {
  const r = gcaAcrEular2022({ entry: 1, aprHigh: 1, visualLoss: 1 }); // 3+3
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
  assert.equal(r.bandLabel, 'Classified as GCA');
});

test('5 -> not classified (just under)', () => {
  const r = gcaAcrEular2022({ entry: 1, biopsyHalo: 1 }); // 5
  assert.equal(r.score, 5);
  assert.equal(r.bandLabel, 'Not classified');
});

test('biopsy/halo is a single +5 item', () => {
  const r = gcaAcrEular2022({ entry: 1, biopsyHalo: 1, morningStiffness: 1 }); // 5+2
  assert.equal(r.score, 7);
});

test('maximum 25 with all items', () => {
  const r = gcaAcrEular2022({ entry: 1, biopsyHalo: 1, aprHigh: 1, visualLoss: 1, morningStiffness: 1, jawClaudication: 1, temporalHeadache: 1, scalpTenderness: 1, taAbnormal: 1, bilateralAxillary: 1, petAorta: 1 });
  assert.equal(r.score, 25);
});
