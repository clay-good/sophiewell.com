// spec-v1640 shared machinery: the CPIC builder against a fake API serving a few real rows of each table
// (read October 15, 2026). PharmGKB's columns never reach the records; recommendation texts are stored
// once; the check date is the fetch plus 14 days.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import cpic, { discover, parse, TABLES } from '../../scripts/data/builders/cpic.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';

const ROWS = {
  allele: [{ genesymbol: 'CYP2D6', name: '*4', clinicalfunctionalstatus: 'No function', activityvalue: '0.0' }, { genesymbol: 'CYP2C19', name: '*17', clinicalfunctionalstatus: 'Increased function', activityvalue: 'n/a' }],
  result: [{ id: 1, genesymbol: 'CYP2D6', result: 'Poor Metabolizer', activityscore: '0.0' }],
  lookup: [{ phenotypeid: 1, lookupkey: { '0.0': 2 }, totalactivityscore: '0.0', description: 'An individual carrying two no function alleles' }],
  gene: [{ symbol: 'CYP2D6', lookupmethod: 'ACTIVITY_SCORE', notesondiplotype: null }, { symbol: 'F5', lookupmethod: 'PHENOTYPE', notesondiplotype: null }],
  recommendation: [
    { id: 9, guidelineid: 100416, drugid: 'RxNorm:2670', implications: { CYP2D6: 'Greatly reduced morphine formation' }, drugrecommendation: 'Avoid codeine use because of possibility of diminished analgesia.', classification: 'Strong', lookupkey: { CYP2D6: '0.0' }, population: 'general', comments: 'n/a' },
    { id: 10, guidelineid: 100416, drugid: 'RxNorm:10689', implications: { CYP2D6: 'Greatly reduced morphine formation' }, drugrecommendation: 'Avoid tramadol use because of possibility of diminished analgesia.', classification: 'Strong', lookupkey: { CYP2D6: '0.0' }, population: 'general', comments: 'n/a' },
  ],
  guideline: [{ id: 100416, name: 'CYP2D6, OPRM1, COMT, and Opioids', url: 'https://www.clinpgx.org/guideline/PA166251454', genes: ['CYP2D6', 'COMT', 'OPRM1'], notesonusage: null }],
  pair: [{ drugid: 'RxNorm:2670', drugname: 'codeine', genesymbol: 'CYP2D6', guidelinename: 'CYP2D6, OPRM1, COMT, and Opioids', cpiclevel: 'A', usedforrecommendation: 'Yes', provisional: false, clinpgxlevel: '1A', pgxtesting: 'Actionable PGx' }],
  publication: [{ guidelineid: 100416, year: 2014, pmid: '24458010' }, { guidelineid: 100416, year: 2021, pmid: '33387367' }],
};

function fakeApi(rows = ROWS) {
  const byUrl = Object.fromEntries(Object.entries(TABLES).map(([k, u]) => [u, rows[k]]));
  const getText = async (url) => {
    if (url.includes('/change_log')) return JSON.stringify([{ date: '2026-08-03' }]);
    if (!(url in byUrl)) throw new Error(`unexpected ${url}`);
    return JSON.stringify(byUrl[url]);
  };
  return { getText, get: async (url) => ({ bytes: Buffer.from(await getText(url)) }) };
}
async function build(http) {
  const found = await discover(http, new Date('2026-10-15T09:00:00Z'));
  found.partBytes = Object.fromEntries(await Promise.all(found.parts.map(async (u) => [u, (await http.get(u)).bytes])));
  return { found, ...(await parse((await http.get(found.url)).bytes, found, { bounds: false })) };
}

test('discover: the edition is the newest change-log date; checked again in 7 days, lapsed after 14', async () => {
  const found = await discover(fakeApi(), new Date('2026-10-15T09:00:00Z'));
  assert.deepEqual([found.edition, found.nextExpected, found.expiresOn, found.parts.length], ['2026-08-03', '2026-10-22', '2026-10-29', 7]);
  assert.equal(cpic.renewOnUnchanged, true);
});

test('parse: kept columns only, PharmGKB dropped, texts once, drug names from the pairs', async () => {
  const { records, ancillary } = await build(fakeApi());
  const strings = ancillary['strings.json'];
  const rec = records.filter((r) => r.t === 'rec');
  assert.deepEqual(rec.map((r) => r.drug), ['codeine', 'RxNorm:10689']);
  assert.equal(rec[0].impl.CYP2D6, rec[1].impl.CYP2D6, 'one implication text, stored once');
  assert.equal(strings[rec[0].rec], 'Avoid codeine use because of possibility of diminished analgesia.');
  const pair = records.find((r) => r.t === 'pair');
  assert.deepEqual(Object.keys(pair).sort(), ['drug', 'gene', 'guideline', 'level', 'provisional', 't', 'used']);
  assert.ok(!JSON.stringify(records).includes('Actionable PGx'));
  assert.deepEqual(records.filter((r) => r.t === 'gene').map((r) => r.gene), ['CYP2D6'], 'only genes a rule or recommendation uses');
  const g = records.find((r) => r.t === 'guideline');
  assert.deepEqual([g.first, g.latest, g.pmid], [2014, 2021, '33387367']);
  const rule = records.find((r) => r.t === 'rule');
  assert.deepEqual([rule.gene, rule.result, rule.key], ['CYP2D6', 'Poor Metabolizer', { '0.0': 2 }]);
  const check = checkDataset({ records, ancillary, recordBounds: { min: 1, max: 100 }, previousCount: null, canaries: cpic.stableCanaries.slice(0, 1), shape: cpic.shape });
  assert.deepEqual(check.problems, []);
});

test('parse: a classification CPIC does not use, or a rule with no phenotype, stops the build', async () => {
  await assert.rejects(build(fakeApi({ ...ROWS, recommendation: [{ ...ROWS.recommendation[0], classification: 'Mandatory' }] })), /unknown classification "Mandatory"/);
  await assert.rejects(build(fakeApi({ ...ROWS, lookup: [{ ...ROWS.lookup[0], phenotypeid: 2 }] })), /names phenotype 2/);
  await assert.rejects(parse(Buffer.from('[]'), { partBytes: Object.fromEntries(Object.values(TABLES).slice(1).map((u) => [u, Buffer.from('[]')])) }), /0 allele rows/);
});
