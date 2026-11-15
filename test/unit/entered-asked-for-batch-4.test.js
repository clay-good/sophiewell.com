// spec-v1723: an entered value outside a field's range is refused by name, not asked for again (scripts/probe-entered-asked-for.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';

const ROWS = [
  ['arr', 'arr-aldo', '999999'],
  ['calcium-phosphate-product', 'capo4-ca', '999999'],
  ['calcium-phosphate-product', 'capo4-po', '999999'],
  ['free-thyroxine-index', 'fti-t4', '999999'],
  ['nitrogen-balance', 'nbal-protein', '999999'],
  ['nitrogen-balance', 'nbal-uun', '999999'],
  ['insall-salvati-ratio', 'is-tendon', '999999'],
  ['insall-salvati-ratio', 'is-patella', '999999'],
  ['meyerding-spondylolisthesis', 'my-disp', '999999'],
  ['meyerding-spondylolisthesis', 'my-width', '999999'],
  ['torg-pavlov-ratio', 'tp-canal', '999999'],
  ['torg-pavlov-ratio', 'tp-body', '999999'],
  ['nascet-carotid-stenosis', 'ns-narrow', '999999'],
  ['nascet-carotid-stenosis', 'ns-distal', '999999'],
  ['testicular-volume', 'tv-l', '999999'],
  ['testicular-volume', 'tv-w', '999999'],
  ['testicular-volume', 'tv-h', '999999'],
  ['equivalent-air-depth', 'ead-depth', '999999'],
  ['oxygen-toxicity-units', 'otu-po2', '999999'],
  ['oxygen-toxicity-units', 'otu-time', '999999'],
  ['ckd-staging', 'cs-egfr', '-999999'],
  ['uacr-upcr', 'uu-alb', '-999999'],
  ['lent-score', 'lent-ldh', '999999'],
  ['lent-score', 'lent-nlr', '999999'],
  ['pi-ll-mismatch', 'pill-pi', '999999'],
  ['pi-ll-mismatch', 'pill-ll', '999999'],
  ['sleep-efficiency', 'se-tst', '999999'],
  ['sleep-efficiency', 'se-tib', '999999'],
  ['cdc-weight-for-age', 'cw-wt', '-999999'],
  ['minor-self-consent', 'msc-age', '999999'],
  ['sigma-metric', 'sm-tea', '-999999'],
  ['tx-sa-forensic-exam-window', 'sa-age', '999999'],
  ['cdc-stature-for-age', 'cs-ht', '-999999'],
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

// An entered optional value outside its range was replaced by the default (30% / 4 g) and computed.
// A blank one keeps the default.
for (const [id, dom, bad] of [
  ['free-thyroxine-index', 'fti-ref', '500'],
  ['nitrogen-balance', 'nbal-insensible', '500'],
]) {
  test(`${id}: an out-of-range ${dom} is refused, not replaced by the default`, () => {
    const e = REGISTRY.get(id);
    const ex = META[id].example.fields;
    assert.notEqual(e.compute(e.toArgs({ ...ex, [dom]: '' })).valid, false, 'a blank keeps the default');
    const r = e.compute(e.toArgs({ ...ex, [dom]: bad }));
    assert.equal(r.valid, false);
    assert.match(r.message, /Check the value entered\.$/);
  });
}
