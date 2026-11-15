// spec-v1723: an entered value outside a field's range is refused by name, not asked for again (scripts/probe-entered-asked-for.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

const ROWS = [
  ['percent-tissue-altered', 'pta-flap', '999999'],
  ['percent-tissue-altered', 'pta-abl', '999999'],
  ['percent-tissue-altered', 'pta-cct', '999999'],
  ['spherical-equivalent', 'se-sph', '999999'],
  ['spherical-equivalent', 'se-cyl', '999999'],
  ['vertex-distance', 'vx-power', '999999'],
  ['vertex-distance', 'vx-mm', '999999'],
  ['fick-cardiac-output', 'fick-vo2', '999999'],
  ['fick-cardiac-output', 'fick-sao2', '999999'],
  ['fick-cardiac-output', 'fick-svo2', '999999'],
  ['qp-qs', 'qpqs-sao2', '999999'],
  ['qp-qs', 'qpqs-mvo2', '999999'],
  ['qp-qs', 'qpqs-pao2', '999999'],
  ['heat-index', 'hi-temp', '999999'],
  ['humidex', 'hx-temp', '999999'],
  ['humidex', 'hx-dew', '999999'],
  ['wind-chill', 'wc-temp', '999999'],
  ['wind-chill', 'wc-wind', '999999'],
  ['ild-gap', 'ild-fvc', '999999'],
  ['pneumothorax-volume', 'ptx-a', '999999'],
  ['pneumothorax-volume', 'ptx-b', '999999'],
  ['pneumothorax-volume', 'ptx-c', '999999'],
  ['amsler-krumeich', 'ak-k', '999999'],
  ['amsler-krumeich', 'ak-thick', '999999'],
  ['chair-stand-30s', 'chair-stands', '999999'],
  ['functional-reach', 'reach-distance', '-999999'],
  ['hacor', 'hc-fio2', '-999999'],
  ['lis-murray', 'lm-fio2', '-999999'],
  ['qcsi', 'qcsi-rr', '999999'],
  ['qcsi', 'qcsi-spo2', '999999'],
  ['ca-care-court-eligibility', 'care-age', '999999'],
  ['five-times-sit-to-stand', 'ftsts-time', '999999'],
  ['predicted-spirometry', 'ps-height', '-999999'],
  ['tx-prescriptive-authority-agreement', 'paa-fte', '999999'],
  ['wang-bronchiolitis', 'wang-rr', '999999'],
];

// These three fields already had a lib/bounds.js envelope (boundsAdvisory), which the
// out-of-range value now reaches; its sentence is the refusal, not a second rule.
const BOUNDS_ADVISORY = new Set(['hc-fio2', 'lm-fio2', 'ps-height']);

for (const [id, dom, bad] of ROWS) {
  test(`${id}: ${dom} = ${bad} is refused by its range, not asked for again`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    assert.notEqual(e.compute(e.toArgs(ex)).valid, false, 'the worked example still answers');
    const r = e.compute(e.toArgs({ ...ex, [dom]: bad }));
    assert.equal(r.valid, false);
    const text = r.message || r.band || r.text;
    if (BOUNDS_ADVISORY.has(dom)) assert.match(text, /plausible range/);
    else assert.match(text, /Check the value entered\.$/);
  });
}
