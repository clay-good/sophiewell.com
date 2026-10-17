// spec-v61 §3.9: IV / PN osmolarity + central-line flag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ivOsmolarity } from '../../lib/clinical-v7.js';

test('example: D5 / AA 2.5 / Na 30 / K 20 = 600 mOsm/L peripheral', () => {
  const r = ivOsmolarity({ dextrosePct: 5, aminoAcidPct: 2.5, naMeqL: 30, kMeqL: 20 });
  assert.equal(r.osmolarity, 600);
  assert.equal(r.central, false);
});
test('central threshold: D10 / AA 4.25 / Na 35 / K 30 = 1055 -> central', () => {
  const r = ivOsmolarity({ dextrosePct: 10, aminoAcidPct: 4.25, naMeqL: 35, kMeqL: 30 });
  assert.equal(r.osmolarity, 1055);
  assert.equal(r.central, true);
});
test('all-zero inputs -> 0 mOsm/L, peripheral (no throw, finite)', () => {
  assert.equal(ivOsmolarity({ dextrosePct: 0, aminoAcidPct: 0, naMeqL: 0, kMeqL: 0 }).osmolarity, 0);
});

// spec-v1641 row 15: the threshold is the FDA labels' sentence, and the omissions are stated.
test('the 900 mOsm/L threshold is cited to the labels and is not approximate', async () => {
  const { OSM_THRESHOLD_SOURCE } = await import('../../lib/clinical-v7.js');
  const at = ivOsmolarity({ dextrosePct: 18, aminoAcidPct: 0, naMeqL: 0, kMeqL: 0 }); // exactly 900
  assert.equal(at.osmolarity, 900);
  assert.equal(at.central, true);
  assert.match(at.band, /must be infused through a central vein/);
  const below = ivOsmolarity({ dextrosePct: 5, aminoAcidPct: 2.5, naMeqL: 30, kMeqL: 20 });
  for (const r of [at, below]) {
    assert.doesNotMatch(r.band, /~900/);
    assert.ok(r.note.includes(OSM_THRESHOLD_SOURCE));
    assert.match(r.note, /Calcium, magnesium and phosphate are not counted/);
    assert.match(r.note, /lipid emulsion in the bag is not counted/);
  }
  assert.match(OSM_THRESHOLD_SOURCE, /FDA labels \(Intralipid, SMOFlipid, Omegaven\)/);
});

test('by component: volume-weighted osmolarity from each label figure', async () => {
  const { ivOsmolarityByComponents: byC } = await import('../../lib/clinical-v7.js');
  // 500 mL at 998 mOsm/L + 250 mL at 260 mOsm/L = (499000 + 65000) / 750 = 752
  const r = byC({ components: '998, 500\n260, 250' });
  assert.equal(r.osmolarity, 752);
  assert.equal(r.totalMl, 750);
  assert.equal(r.central, false);
  assert.equal(byC({ components: '1835, 500\n260, 100' }).central, true); // 1572.5
  assert.equal(byC({ components: '900, 100' }).central, true);
  assert.equal(byC({ components: '' }).valid, false);
  assert.match(byC({ components: '998' }).message, /Component line 1/);
  assert.match(byC({ components: '998, 500\nabc, 2' }).message, /Component line 2/);
  assert.match(byC({ components: '998, 0' }).message, /above 0/);
});

// spec-v1641 row 15 / spec-v1630: TrophAmine's pediatric peripheral limit (label v10, Dosage and Administration).
test('between 718 and 900 mOsm/L the result names the pediatric peripheral limit from the TrophAmine label', async () => {
  const { ivOsmolarityByComponents, OSM_PEDS_PERIPHERAL } = await import('../../lib/clinical-v7.js');
  assert.equal(OSM_PEDS_PERIPHERAL, 718);
  const mid = ivOsmolarity({ dextrosePct: 10, aminoAcidPct: 2, naMeqL: 40, kMeqL: 20 });
  assert.equal(mid.osmolarity, 820);
  assert.equal(mid.central, false);
  assert.match(mid.pediatricPeripheral, /718 mOsm\/L/);
  assert.equal(ivOsmolarity({ dextrosePct: 5, aminoAcidPct: 2.5, naMeqL: 30, kMeqL: 20 }).pediatricPeripheral, null, '600 is under it');
  assert.equal(ivOsmolarity({ dextrosePct: 20, aminoAcidPct: 5, naMeqL: 40, kMeqL: 20 }).pediatricPeripheral, null, 'central already');
  assert.match(ivOsmolarityByComponents({ components: '866, 500\n700, 300' }).pediatricPeripheral, /TrophAmine/);
});
