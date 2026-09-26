// spec-v1501 §2: the dated-value accessor fails closed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { datedValue, expiredPrompt, DATED } from '../../lib/dated-data.js';

const T = {
  demo: { edition: '2026', validThrough: '2026-12-31', route: 'B', source: { label: 'the CMS announcement', url: 'https://www.cms.gov/' }, values: { deductible: 615 } },
};

test('a current value comes back with its edition', () => {
  const v = datedValue('demo', 'deductible', new Date('2026-06-01T12:00:00Z'), T);
  assert.deepEqual([v.expired, v.value, v.edition], [false, 615, '2026']);
});

test('the last valid day still answers; the day after asks', () => {
  assert.equal(datedValue('demo', 'deductible', new Date('2026-12-31T23:00:00Z'), T).expired, false);
  const v = datedValue('demo', 'deductible', new Date('2027-01-01T00:00:00Z'), T);
  assert.equal(v.expired, true);
  assert.equal('value' in v, false);
  assert.equal(expiredPrompt('Part D deductible', v, (x) => `$${x}`), 'The 2026 Part D deductible was $615. Enter the current figure from the CMS announcement.');
});

test('an unknown set or key throws', () => {
  assert.throws(() => datedValue('nope', 'x', new Date(), T), RangeError);
  assert.throws(() => datedValue('demo', 'x', new Date(), T), RangeError);
});

test('every shipped row declares its route, source, and (route B) a ledger row', () => {
  for (const [id, row] of Object.entries(DATED)) {
    assert.ok(['A', 'B'].includes(row.route), id);
    assert.ok(row.source && /^https:\/\//.test(row.source.url), id);
    assert.match(row.validThrough, /^\d{4}-\d{2}-\d{2}$/, id);
    if (row.route === 'B') assert.ok(row.ledgerId, `${id} needs a ledgerId`);
  }
});

test('route-B rows point at a real staleness-ledger row', async () => {
  const { readFileSync } = await import('node:fs');
  const ledger = JSON.parse(readFileSync(new URL('../../pa-staleness-ledger.json', import.meta.url), 'utf8'));
  const ids = new Set(ledger.sources.map((s) => s.id));
  const { DATED_AIC } = await import('../../lib/partd-appeals-v1503.js');
  const { DATED_PREMIUMS } = await import('../../lib/medicare-penalties-v1507.js');
  const { SNF_COINSURANCE } = await import('../../lib/post-acute-clocks-v1514.js');
  for (const [id, row] of Object.entries({ ...DATED, ...DATED_AIC, ...DATED_PREMIUMS, ...SNF_COINSURANCE })) {
    if (row.route === 'B') assert.ok(ids.has(row.ledgerId), `${id}: ledger row ${row.ledgerId} is missing`);
  }
});
