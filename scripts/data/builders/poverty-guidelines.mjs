// scripts/data/builders/poverty-guidelines.mjs -- spec-v1517 route A: the HHS poverty guidelines.
//
// The ASPE poverty-guidelines API answers one year, region and household size per request:
//   GET .../poverty-guidelines/api/2026/ak/9 -> {"data":{"year":"2026","state":"ak","household_size":"9","income":76750}}
// THE TRAP: an invalid request does not fail. It answers 2026, the contiguous US, size 1 -- so a request
// for a year not yet published returns last year's figure under a 200. Every answer's echoed year, state
// and size are checked against the request, and a mismatch fails the run. `income` is a string for sizes
// 1-8 and a number for 9; the state's case varies.
//
// Every region's guideline is a base amount plus a fixed amount per additional person. Sizes 1, 2, 8 and 9
// are read, so the base and step come from 1 and 2 and are checked at 8 and 9.
//
// Besides the shard, the run writes guidelines.js, a module the income calculators import directly, so
// they stay synchronous and a new year reaches them through the weekly refresh pull request.

export const API = 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines/api';
const LANDING = 'https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines';
export const REGIONS = ['us', 'ak', 'hi'];
const SIZES = [1, 2, 8, 9];
// The first year the calculators carry: the premium tax credit for 2026 coverage uses 2025's.
const FIRST_YEAR = 2025;

const urlOf = (year, region, size) => `${API}/${year}/${region}/${size}`;

// answer(bytes, year, region, size) -> the income, after checking the API answered what was asked.
export function answer(bytes, year, region, size) {
  let d;
  try { d = JSON.parse(Buffer.from(bytes).toString('utf8')).data; } catch { throw new Error(`poverty-guidelines: ${year}/${region}/${size} is not JSON`); }
  if (!d || String(d.year) !== String(year) || String(d.state).toLowerCase() !== region || String(d.household_size) !== String(size)) {
    throw new Error(`poverty-guidelines: asked for ${year}/${region}/${size}, the API answered ${d ? `${d.year}/${d.state}/${d.household_size}` : 'nothing'}`);
  }
  const income = Number(d.income);
  if (!Number.isFinite(income) || income <= 0) throw new Error(`poverty-guidelines: ${year}/${region}/${size} income "${d.income}" is not a number`);
  return income;
}

export async function discover(http) {
  const y = new Date().getUTCFullYear();
  let latest = null;
  // The newest published year: next year's appears in January. An unpublished year echoes back as another.
  for (const year of [y + 1, y]) {
    const r = await http.get(urlOf(year, 'us', 1));
    try { answer(r.bytes, year, 'us', 1); latest = year; break; } catch { /* not published */ }
  }
  if (!latest) throw new Error(`poverty-guidelines: neither ${y + 1} nor ${y} is published`);
  const urls = [];
  for (let year = FIRST_YEAR; year <= latest; year += 1) for (const region of REGIONS) for (const size of SIZES) urls.push(urlOf(year, region, size));
  return { url: urls[0], parts: urls.slice(1), edition: String(latest), effectiveFrom: `${latest}-01-01`, nextExpected: `${latest + 1}-01-31`, expiresOn: `${latest + 1}-03-31` };
}

// moduleText(records) -> the guidelines.js the calculators import.
export function moduleText(records) {
  const byYear = {};
  for (const r of records) (byYear[r.year] ||= {})[r.region] = [r.base, r.per];
  return '// Written by scripts/data/builders/poverty-guidelines.mjs from the ASPE poverty-guidelines API.\n'
    + '// Do not edit: the weekly data refresh rewrites it. year -> region -> [first person, each additional person].\n'
    + `export const POVERTY_GUIDELINES = ${JSON.stringify(byYear)};\n`;
}

export async function parse(bytes, found) {
  const all = [found.url, ...(found.parts || [])];
  const body = (u) => (u === found.url ? bytes : found.partBytes[u]);
  const records = [];
  for (let year = FIRST_YEAR; year <= Number(found.edition); year += 1) {
    for (const region of REGIONS) {
      const inc = {};
      for (const size of SIZES) {
        const u = urlOf(year, region, size);
        if (!all.includes(u)) throw new Error(`poverty-guidelines: ${u} was not fetched`);
        inc[size] = answer(body(u), year, region, size);
      }
      const base = inc[1];
      const per = inc[2] - inc[1];
      if (inc[8] !== base + 7 * per || inc[9] !== base + 8 * per) {
        throw new Error(`poverty-guidelines: ${year} ${region} is not a base plus a fixed step (${inc[1]}, ${inc[2]}, ${inc[8]}, ${inc[9]})`);
      }
      records.push({ key: `${year}-${region}`, year, region, base, per });
    }
  }
  return { records, ancillary: { 'guidelines.js': moduleText(records) } };
}

export default {
  id: 'poverty-guidelines',
  label: 'HHS poverty guidelines',
  agency: 'HHS ASPE',
  sourceUrl: LANDING,
  cadence: 'annual (January)',
  notes: 'One record per year and region (48 contiguous states and DC, Alaska, Hawaii): the guideline for one person and the amount for each additional person, read from the ASPE API at household sizes 1, 2, 8 and 9 with every answer checked against the request. guidelines.js carries the same table for the income calculators.',
  recordBounds: { min: 6, max: 30 },
  shardKey: () => 'guidelines',
  discover,
  parse,
  shape: (r) => (REGIONS.includes(r.region) && Number.isInteger(r.year) && r.base > 0 && r.per > 0 ? null : 'a row without region, year, base or step'),
  stableCanaries: [
    { label: '2026, 48 states and DC: $15,960 plus $5,680', value: (rs) => { const r = rs.find((x) => x.key === '2026-us'); return r ? `${r.base}+${r.per}` : null; }, expect: '15960+5680' },
    { label: '2025, Alaska: $19,550 plus $6,880', value: (rs) => { const r = rs.find((x) => x.key === '2025-ak'); return r ? `${r.base}+${r.per}` : null; }, expect: '19550+6880' },
  ],
  canaries: null,
};
