// spec-v1735: sourced envelopes for ESR, 6-minute walk distance and hCG
// (lib/bounds.js), applied to every tool that read one and answered past it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOUNDS, boundsAdvisory } from '../../lib/bounds.js';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';
import { kawasakiCriteria } from '../../lib/peds-v98.js';

test('the new envelopes sit above the recorded extremes', () => {
  assert.equal(BOUNDS.esr.max, 200, 'the Westergren scale is 200 mm');
  assert.ok(BOUNDS.sixMinuteWalkM.max > 1570, 'race-walk world-record pace for six minutes');
  assert.ok(BOUNDS.hcg.max > 1861011, 'a partial mole reached 1,861,011 IU/L');
  assert.equal(boundsAdvisory('esr', 0), null, 'an ESR of 0 is a real reading');
  assert.equal(boundsAdvisory('hcg', 0), null, 'an undetectable hCG is a real reading');
  assert.match(boundsAdvisory('esr', 250), /sedimentation rate/);
});

const run = (id, over) => {
  const e = REGISTRY.get(id);
  return e.compute(e.toArgs({ ...META[id].example.fields, ...over }));
};

// [tool, field, an impossible value, a high but real value]
const ROWS = [
  ['das28', 'da-esr', '250', '140'],
  ['pcdai', 'pcd-esr', '250', '140'],
  ['truelove-witts', 'tw-esr', '250', '140'],
  ['bode-index', 'bo-6mwd', '2500', '700'],
  ['reveal-lite-2', 'rv-mwd', '2500', '700'],
  ['igcccg', 'igcccg-hcg', '50000000', '1900000'],
  ['barnhart-hcg', 'bh-init', '50000000', '1900000'],
  ['barnhart-hcg', 'bh-rep', '50000000', '1900000'],
  ['figo-gtn', 'figo-hcg', '50000000', '1900000'],
];

for (const [id, dom, impossible, real] of ROWS) {
  test(`${id} ${dom}: ${impossible} is refused, ${real} still answers`, () => {
    assert.notEqual(run(id, {}).valid, false, 'example answers');
    assert.equal(run(id, { [dom]: impossible }).valid, false);
    assert.notEqual(run(id, { [dom]: real }).valid, false);
  });
}

test('kawasaki-criteria: an impossible ESR no longer meets the incomplete-KD gate', () => {
  const base = { feverDays: 6, principal: ['conjunctivitis', 'rash'], crp: 1, supplementary: [] };
  assert.equal(kawasakiCriteria({ ...base, esr: 200 }).inflamed, true);
  assert.equal(kawasakiCriteria({ ...base, esr: 999 }).valid, false);
});
