// spec-v1723: an entered value outside a field's range is refused by name, not asked for again (scripts/probe-entered-asked-for.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

const ROWS = [
  ['egdr', 'egdr-waist', '999999'],
  ['egdr', 'egdr-a1c', '999999'],
  ['navy-body-fat', 'navy-height', '999999'],
  ['navy-body-fat', 'navy-neck', '999999'],
  ['navy-body-fat', 'navy-waist', '999999'],
  ['relative-fat-mass', 'rfm-height', '999999'],
  ['relative-fat-mass', 'rfm-waist', '999999'],
  ['cccr', 'cccr-uca', '999999'],
  ['cccr', 'cccr-sca', '999999'],
  ['cccr', 'cccr-scr', '999999'],
  ['tmp-gfr', 'tmp-sp', '999999'],
  ['tmp-gfr', 'tmp-up', '999999'],
  ['tmp-gfr', 'tmp-scr', '999999'],
  ['evans-index', 'ev-frontal', '999999'],
  ['evans-index', 'ev-skull', '999999'],
  ['fohr', 'fo-frontal', '999999'],
  ['fohr', 'fo-occipital', '999999'],
  ['fohr', 'fo-bpd', '999999'],
  ['light-criteria', 'lc-pprot', '999999'],
  ['light-criteria', 'lc-sprot', '999999'],
  ['light-criteria', 'lc-pldh', '999999'],
  ['light-criteria', 'lc-sldh', '999999'],
  ['light-criteria', 'lc-uln', '999999'],
  ['hasford-cml', 'hasford-spleen', '999999'],
  ['hasford-cml', 'hasford-blasts', '999999'],
  ['hasford-cml', 'hasford-eosinophils', '999999'],
  ['hasford-cml', 'hasford-basophils', '999999'],
  ['meniere-aao-hns', 'men-500', '999999'],
  ['meniere-aao-hns', 'men-1000', '999999'],
  ['meniere-aao-hns', 'men-2000', '999999'],
  ['meniere-aao-hns', 'men-3000', '999999'],
  ['adrenal-ct-washout', 'aw-e', '999999'],
  ['adrenal-ct-washout', 'aw-d', '999999'],
  ['bladder-outlet-obstruction-index', 'boo-pdet', '999999'],
  ['bladder-outlet-obstruction-index', 'boo-qmax', '999999'],
  ['dose-history-level', 'dhl-vd', '-999999'],
  ['dose-history-level', 'dhl-tau', '-999999'],
  ['glasgow-prognostic-score', 'mgps-crp', '999999'],
  ['recist', 'recist-current', '999999'],
  ['pwv-carotid-femoral', 'pwv-direct', '-999999'],
  ['pwv-carotid-femoral', 'pwv-tt', '-999999'],
  ['ausdrisk', 'aus-waist', '999999'],
  ['far', 'far-fib', '999999'],
  ['ny-hiv-hcv-test-offer', 'nyo-age', '999999'],
  ['truelove-witts', 'tw-stools', '-999999'],
  ['vo2max-exercise', 'vo2-time', '999999'],
];

for (const id of new Set(ROWS.map(([i]) => i))) {
  test(`${id}: the worked example still answers`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    assert.notEqual(e.compute(e.toArgs(ex)).valid, false);
  });
}

for (const [id, dom, bad] of ROWS) {
  test(`${id}: ${dom} = ${bad} is refused by name`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    const r = e.compute(e.toArgs({ ...ex, [dom]: bad }));
    assert.equal(r.valid, false);
    assert.match(r.message || r.band || r.text, /Check the value entered\.$/);
  });
}
