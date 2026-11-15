// spec-v1723: an entered value outside a field's range is refused by name, not asked for again (scripts/probe-entered-asked-for.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

const ROWS = [
  ['la-volume-index', 'lavi-a1', '999999'],
  ['la-volume-index', 'lavi-a2', '999999'],
  ['la-volume-index', 'lavi-l', '999999'],
  ['la-volume-index', 'lavi-bsa', '999999'],
  ['lv-mass-index', 'lvmi-lvidd', '999999'],
  ['lv-mass-index', 'lvmi-pwtd', '999999'],
  ['lv-mass-index', 'lvmi-ivsd', '999999'],
  ['lv-mass-index', 'lvmi-bsa', '999999'],
  ['mitral-e-e-prime', 'ee-e', '999999'],
  ['mitral-e-e-prime', 'ee-eprime', '999999'],
  ['rvsp-pasp', 'rvsp-vmax', '999999'],
  ['teichholz-lvef', 'teich-lvidd', '999999'],
  ['teichholz-lvef', 'teich-lvids', '999999'],
  ['mean-airway-pressure', 'maw-peep', '999999'],
  ['pure-tone-average', 'pta-500', '999999'],
  ['pure-tone-average', 'pta-1000', '999999'],
  ['pure-tone-average', 'pta-2000', '999999'],
  ['stool-osmotic-gap', 'sog-na', '999999'],
  ['stool-osmotic-gap', 'sog-k', '999999'],
  ['atherogenic-index-of-plasma', 'aip-tg', '999999'],
  ['atherogenic-index-of-plasma', 'aip-hdl', '999999'],
  ['corrected-timi-frame-count', 'ctfc-frames', '999999'],
  ['corrected-timi-frame-count', 'ctfc-fps', '999999'],
  ['ponderal-index', 'pi-weight', '999999'],
  ['ponderal-index', 'pi-length', '999999'],
  ['sflt1-plgf', 'sflt-ratio', '999999'],
  ['dka-hhs', 'dk-glu', '-999999'],
  ['dka-hhs', 'dk-ph', '-999999'],
  ['emax-hill-effect', 'ehe-ec50', '-999999'],
  ['emax-hill-effect', 'ehe-n', '-999999'],
  ['pearl-index', 'pi-preg', '999999'],
  ['robinson-crl-dating', 'crl-mm', '999999'],
  ['agr', 'agr-tp', '999999'],
  ['dead-space', 'ds-paco2', '-999999'],
  ['ny-aot-kendras-law', 'aot-age', '999999'],
  ['tmic-beta-lactam', 'tm-half', '999999'],
  ['visual-acuity-converter', 'va-value', '999999'],
];

for (const [id, dom, bad] of ROWS) {
  test(`${id}: ${dom} = ${bad} is refused by name`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    assert.notEqual(e.compute(e.toArgs(ex)).valid, false, 'the worked example still answers');
    const r = e.compute(e.toArgs({ ...ex, [dom]: bad }));
    assert.equal(r.valid, false);
    assert.match(r.message || r.band || r.text, /Check the value entered\.$/);
  });
}
