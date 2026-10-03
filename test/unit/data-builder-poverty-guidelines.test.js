// spec-v1517 route A: the poverty-guidelines builder, and the trap the ASPE API sets -- an invalid or
// unpublished request answers 2026, the contiguous US, size 1, under a 200.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import builder, { API, answer, moduleText } from '../../scripts/data/builders/poverty-guidelines.mjs';
import { POVERTY_GUIDELINES } from '../../data/poverty-guidelines/guidelines.js';
import { DATED_INCOME } from '../../lib/income-screens-v1506.js';

const reply = (year, state, size, income) => Buffer.from(JSON.stringify({ data: { year: String(year), state, household_size: String(size), income }, method: 'GET', status: 200 }));
// The real API's two figures: [first person, each additional], by year and region.
const TABLE = { 2025: { us: [15650, 5500], ak: [19550, 6880], hi: [17990, 6330] }, 2026: { us: [15960, 5680], ak: [19950, 7100], hi: [18360, 6530] } };
const income = (year, region, size) => TABLE[year][region][0] + TABLE[year][region][1] * (size - 1);

// A fake API: published years answer truly (the case of `state` varies, as it does live; size 9's income
// is a number, the rest strings); anything else gets the API's silent default.
function fakeHttp(published = [2025, 2026]) {
  return {
    async get(url) {
      const [year, region, size] = url.slice(API.length + 1).split('/');
      const ok = published.includes(Number(year)) && TABLE[year] && TABLE[year][region];
      if (!ok) return { bytes: reply(2026, 'US', 1, String(income(2026, 'us', 1))) };
      const inc = income(Number(year), region, Number(size));
      return { bytes: reply(year, size === '9' ? region : region.toUpperCase(), size, size === '9' ? inc : String(inc)) };
    },
  };
}

async function build(http) {
  const found = await builder.discover(http);
  const bytes = (await http.get(found.url)).bytes;
  found.partBytes = {};
  for (const u of found.parts) found.partBytes[u] = (await http.get(u)).bytes;
  return { found, ...(await builder.parse(bytes, found)) };
}

test('an answer for a different year, region or size than asked fails, never passes as data', () => {
  assert.equal(answer(reply(2026, 'AK', 9, 76750), 2026, 'ak', 9), 76750);
  assert.equal(answer(reply(2026, 'us', 2, '21640'), 2026, 'us', 2), 21640);
  assert.throws(() => answer(reply(2026, 'US', 1, '15960'), 2027, 'us', 1), /asked for 2027\/us\/1, the API answered 2026\/US\/1/);
  assert.throws(() => answer(reply(2026, 'US', 1, '15960'), 2026, 'hi', 1), /answered/);
  assert.throws(() => answer(reply(2026, 'US', 1, '15960'), 2026, 'us', 4), /answered/);
  assert.throws(() => answer(Buffer.from('<html>'), 2026, 'us', 1), /not JSON/);
});

test('the newest year is the one the API echoes back, so an unpublished year is not mistaken for one', async () => {
  const year = new Date().getUTCFullYear();
  const published = [2025, 2026, year].filter((v, i, a) => a.indexOf(v) === i);
  const http = fakeHttp(published);
  if (!TABLE[year]) TABLE[year] = TABLE[2026];
  const found = await builder.discover(http);
  assert.equal(found.edition, String(year), `${year + 1} echoes back as 2026, so it is not published`);
});

test('a run yields the base and step per year and region, checked at sizes 8 and 9, and the module the calculators import', async () => {
  const { records, ancillary } = await build(fakeHttp());
  const r2026 = records.find((r) => r.key === '2026-ak');
  assert.deepEqual([r2026.base, r2026.per], [19950, 7100]);
  assert.equal(ancillary['guidelines.js'], moduleText(records));
  assert.match(ancillary['guidelines.js'], /export const POVERTY_GUIDELINES = \{"2025":\{"us":\[15650,5500\]/);
  for (const c of builder.stableCanaries) assert.equal(c.value(records), c.expect, c.label);
});

test('a region whose sizes are not a base plus a fixed step stops the run', async () => {
  const http = fakeHttp();
  const real = http.get;
  http.get = async (url) => (url.endsWith('/2025/hi/9') ? { bytes: reply(2025, 'hi', 9, 70000) } : real(url));
  await assert.rejects(() => build(http), /2025 hi is not a base plus a fixed step/);
});

test('the shipped module is what the income calculators read', () => {
  for (const [year, values] of Object.entries(POVERTY_GUIDELINES)) {
    assert.deepEqual(DATED_INCOME[`poverty-guidelines-${year}`].values, values);
  }
  assert.deepEqual(POVERTY_GUIDELINES['2026'], TABLE[2026]);
});
