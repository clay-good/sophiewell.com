// spec-v1824: a spec that parks a tile is only as true as the tile's absence.
//
// Seven specs are marked DEFERRED or PARTIALLY SHIPPED on SOURCING grounds -- a coefficient table behind a
// 403, a nomogram only in a paywalled paper -- and each names the ids it parked. Three of those statuses
// had gone stale: `kdri-kdpi` shipped in spec-v1717 once OPTN's guides became fetchable (spec-v170,
// spec-v264), and `leibovich-rcc` and `uiss-rcc` shipped the next day in spec-v279 (spec-v266). Nobody
// noticed, because nothing read the status against the catalog.
//
// This is the other half of [[project_docs_outlived_their_code]]: a doc citing a CHECK is only as true as
// the check's existence, and a doc citing a PARKED tile is only as true as the tile's absence. When one of
// these ships, this test fails and the spec that parked it gets its status updated -- the STALE-LEDGER
// shape, applied to prose.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';

// id -> the spec that parked it and why, as its status block states it.
const PARKED = {
  'epts-score': 'spec-v170 / spec-v264: the EPTS raw-to-percentile mapping needs epts_mapping_table.pdf',
  epts: 'spec-v170 / spec-v264: the same EPTS mapping, under the id those specs proposed',
  'fenton-preterm-growth': 'spec-v171: the Fenton 2013 LMS tables ship as Springer supplementary objects (403)',
  'gwtg-hf': 'spec-v259: the per-bin point table is only in the paywalled Peterson 2010 paper',
  ehmrg: 'spec-v259: the coefficient-and-cap formula is only in the paywalled Lee 2012 paper',
  'precise-dapt': 'spec-v259: the nomogram points are not reproducible from open sources',
  'mclaughlin-score': 'spec-v265: not reproducible from open sources in-session',
  'pwh-mt-score': 'spec-v265: not reproducible from open sources in-session',
};

test('every tile a spec parked on sourcing grounds is still absent, or its spec says it shipped', () => {
  const have = new Set(allCalculators().map((t) => t.id));
  const shipped = Object.entries(PARKED).filter(([id]) => have.has(id));
  assert.deepEqual(shipped.map(([id]) => id), [],
    `these ids are in the catalog while a spec still calls them parked -- update that spec's status:\n${
      shipped.map(([id, why]) => `  ${id} -- ${why}`).join('\n')}`);
});
