// spec-v1399: ED throughput and discharge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caApotCalculator as apot } from '../../lib/ca-apot-calculator-v1399.js';
import { caHomelessDischarge12625 as hd, ITEMS } from '../../lib/ca-homeless-discharge-1262-5-v1399.js';

const TEN = [10, 13, 17, 20, 23, 27, 30, 33, 37, 40].map((m) => `10:00, 10:${String(m).padStart(2, '0')}`).join('\n');

test('apot: ten offloads of 10-40 minutes -- nearest-rank 90th percentile is 37', () => {
  const r = apot({ rows: TEN });
  assert.equal(r.p90, 37);
  assert.equal(r.within, 7);
  assert.equal(r.abnormal, true);
  assert.match(r.methodNote, /the 9th of 10/);
});

test('apot: a blank transfer time is excluded and named, never counted as zero', () => {
  const r = apot({ rows: `${TEN}\n11:00,` });
  assert.equal(r.counted, 10);
  assert.match(r.excluded[0], /line 11/);
});

test('apot: past midnight on clock times; an empty list asks', () => {
  assert.equal(apot({ rows: '23:50, 00:10' }).p90, 20);
  assert.equal(apot({ rows: '' }).valid, false);
  assert.equal(apot({ rows: '10:00, 10:20\n10:00, 10:25' }).abnormal, false);
});

test('hd: an all-blank checklist is incomplete, never complete', () => {
  const r = hd({});
  assert.equal(r.complete, false);
  assert.equal(r.bandLabel, `Incomplete: ${ITEMS.length} of ${ITEMS.length} items not documented`);
});

test('hd: not-needed is allowed only where the statute has an exception', () => {
  const all = Object.fromEntries(ITEMS.map(([k]) => [k, 'done']));
  assert.equal(hd(all).complete, true);
  assert.equal(hd({ ...all, clothing: 'na' }).complete, true);
  const r = hd({ ...all, coverage: 'na' });
  assert.equal(r.complete, false);
  assert.match(r.band, /\(o\)\(9\)/);
});
