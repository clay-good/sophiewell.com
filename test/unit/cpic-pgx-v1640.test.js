// spec-v1640 tools 1 to 3 (owner decision 12, October 15, 2026): CPIC's diplotype-to-phenotype rules,
// the CYP2D6 activity score and the opioid guideline's inhibitor rule. The tables are a fixture of real
// CPIC rows (test/fixtures/cpic/), so a weekly refresh of data/cpic does not move these tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pgxDiplotypePhenotype as pd, genes } from '../../lib/pgx-diplotype-phenotype-v1640.js';
import { cyp2d6ActivityScore as ca } from '../../lib/cyp2d6-activity-score-v1640.js';
import { cyp2d6Phenoconversion as pc } from '../../lib/cyp2d6-phenoconversion-v1640.js';

const DB = JSON.parse(readFileSync(new URL('../fixtures/cpic/tables-2026-10-15.json', import.meta.url), 'utf8'));
const NOW = new Date('2026-10-15T12:00:00Z');

test('diplotype to phenotype: function pairs and activity scores from the tables', () => {
  assert.equal(pd({ gene: 'CYP2C19', allele1: '*2', allele2: '*17' }, DB, NOW).band, 'CYP2C19 *2/*17: Intermediate Metabolizer.');
  assert.equal(pd({ gene: 'cyp2c19', allele1: '1', allele2: '1' }, DB, NOW).phenotype, 'Normal Metabolizer');
  const c = pd({ gene: 'CYP2C9', allele1: '*1', allele2: '*3' }, DB, NOW);
  assert.deepEqual([c.phenotype, c.activityScore], ['Intermediate Metabolizer', '1.0']);
  assert.match(c.notes.join(' '), /not applicable to the warfarin guideline/);
  assert.match(c.notes.at(-1), /CC0\. Data version: change log of 2026-08-03; read 2026-10-15\..*confirm the current content at ClinPGx/);
  assert.deepEqual(genes(DB, NOW), ['CYP2C19', 'CYP2C9', 'DPYD', 'G6PD', 'MT-RNR1']);
});

test('one allele only where CPIC\'s rules take one; no "*1 by default"', () => {
  assert.match(pd({ gene: 'CYP2C19', allele1: '*1' }, DB, NOW).message, /A blank allele is not read as normal/);
  assert.equal(pd({ gene: 'G6PD', allele1: 'A- 202A_376G' }, DB, NOW).phenotype, 'Deficient');
  assert.match(pd({ gene: 'G6PD', allele1: 'A- 202A_376G' }, DB, NOW).notes.join(' '), /hemizygous/);
  assert.equal(pd({ gene: 'G6PD', allele1: 'B (reference)', allele2: 'A- 202A_376G' }, DB, NOW).phenotype, 'Variable');
  assert.equal(pd({ gene: 'MT-RNR1', allele1: 'm.1555A>G' }, DB, NOW).phenotype, 'increased risk of aminoglycoside-induced hearing loss');
});

test('an allele with no function assigned, an unknown allele, CYP2D6 and HLA are refused or unanswered', () => {
  const r = pd({ gene: 'CYP2C19', allele1: '*43', allele2: '*1' }, DB, NOW);
  assert.deepEqual([r.valid, r.phenotype, r.flag], [true, null, 'no-function-assigned']);
  assert.match(pd({ gene: 'CYP2C19', allele1: '*99', allele2: '*1' }, DB, NOW).message, /not in CPIC's CYP2C19 allele list/);
  assert.match(pd({ gene: 'CYP2D6', allele1: '*1', allele2: '*4' }, DB, NOW).message, /its own tool/);
  assert.match(pd({ gene: 'HLA-B', allele1: '*57:01' }, DB, NOW).message, /positive or negative/);
});

test('past the check date, or with no tables, nothing is computed', () => {
  assert.match(pd({ gene: 'CYP2C19', allele1: '*1', allele2: '*2' }, DB, new Date('2026-10-30T12:00:00Z')).message, /past their check date \(2026-10-29\)\. Use the phenotype printed on the lab report/);
  assert.match(pd({ gene: 'CYP2C19', allele1: '*1', allele2: '*2' }).message, /did not load/);
  assert.match(ca({ allele1: '*1', allele2: '*4' }, { manifest: null }, NOW).message, /did not load/);
});

test('CYP2D6: CPIC table values, copy-number rows, tandems; *41 is 0.25 in the table', () => {
  assert.equal(ca({ allele1: '*1', allele2: '*4' }, DB, NOW).band, 'CYP2D6 *1/*4: activity score 1.0, Intermediate Metabolizer.');
  assert.equal(ca({ allele1: '*1', allele2: '*41' }, DB, NOW).activityScore, '1.25');
  assert.equal(ca({ allele1: '*4', allele2: '*41' }, DB, NOW).activityScore, '0.25');
  assert.deepEqual([ca({ allele1: '*1x2', allele2: '*4' }, DB, NOW).activityScore, ca({ allele1: '*1x2', allele2: '*4' }, DB, NOW).phenotype], ['2.0', 'Normal Metabolizer']);
  assert.equal(ca({ allele1: '*1X>=3', allele2: '*1' }, DB, NOW).phenotype, 'Ultrarapid Metabolizer');
  assert.equal(ca({ allele1: '*36+*10', allele2: '*10' }, DB, NOW).activityScore, '0.5');
  assert.match(ca({ allele1: '*17x3', allele2: '*1' }, DB, NOW).message, /CPIC lists no activity value for CYP2D6 "\*17x3"/);
  assert.match(ca({ allele1: '*1', allele2: '' }, DB, NOW).message, /not read as \*1/);
});

test('CYP2D6: a duplication on an unnamed allele gives both readings', () => {
  const r = ca({ allele1: '*1', allele2: '*4', duplication: 'unknown' }, DB, NOW);
  assert.equal(r.ambiguous, true);
  assert.deepEqual(r.options.map((x) => [x.diplotype, x.activityScore, x.phenotype]), [['*1x2/*4', '2.0', 'Normal Metabolizer'], ['*1/*4x2', '1.0', 'Intermediate Metabolizer']]);
  assert.match(r.notes.join(' '), /does not decide between these/);
  assert.match(ca({ allele1: '*1x2', allele2: '*4', duplication: 'unknown' }, DB, NOW).message, /already names its copy number/);
});

test('phenoconversion: strong to 0, moderate halves, weak unchanged; the SSRI sentence on every result', () => {
  const s = pc({ activityScore: 2, inhibitor: 'strong' }, NOW);
  assert.deepEqual([s.adjustedScore, s.adjustedPhenotype, s.genotypePhenotype], [0, 'Poor Metabolizer', 'Normal Metabolizer']);
  assert.equal(pc({ activityScore: 2, inhibitor: 'moderate' }, NOW).adjustedPhenotype, 'Intermediate Metabolizer');
  const off = pc({ activityScore: 1.25, inhibitor: 'moderate' }, NOW);
  assert.deepEqual([off.adjustedScore, off.offGrid], [0.625, true]);
  assert.match(off.notes.join(' '), /recommendations keyed by score do not apply/);
  assert.equal(pc({ activityScore: 3, inhibitor: 'moderate' }, NOW).adjustedPhenotype, 'Normal Metabolizer');
  assert.equal(pc({ activityScore: 1.5, inhibitor: 'weak' }, NOW).changed, false);
  assert.match(pc({ activityScore: 1.5, inhibitor: 'none' }, NOW).notes.join(' '), /Consensus approaches for adjusting CYP2D6, CYP2C19, or CYP2B6/);
  assert.match(pc({ activityScore: 1.1, inhibitor: 'none' }, NOW).message, /step by 0\.25/);
  assert.match(pc({ activityScore: 1, inhibitor: '' }, NOW).message, /Choose the strength/);
  assert.match(pc({ activityScore: 1, inhibitor: 'strong' }, new Date('2027-10-16T12:00:00Z')).message, /past its check date/);
});

import { cpicGeneDrug as gd } from '../../lib/cpic-gene-drug-v1640.js';
import { pgxPanelReview as pr } from '../../lib/pgx-panel-review-v1640.js';
import { ROWS as FDA_ROWS } from '../../lib/fda-pgx-associations-2026.js';

test('the FDA snapshot carries its three sections whole', () => {
  assert.deepEqual([1, 2, 3].map((s) => FDA_ROWS.filter((r) => r[0] === s).length), [82, 25, 40]);
  assert.ok(FDA_ROWS.some((r) => r[1] === 'Clopidogrel' && r[2] === 'CYP2C19' && /Consider use of another platelet P2Y12 inhibitor\.$/.test(r[4])));
});

test('gene-drug: exact match on the key CPIC uses, quoted whole, with the FDA row beside it', () => {
  const c = gd({ drug: 'Codeine', results: 'CYP2D6: 0' }, DB, NOW);
  assert.deepEqual([c.matched, c.classification, c.key], [true, 'Strong', { CYP2D6: '0.0' }]);
  assert.match(c.recommendation, /^Avoid codeine use because of possibility of diminished analgesia/);
  assert.match(c.notes.join(' '), /FDA, section 2 .*poor metabolizers.*reduced efficacy/);
  assert.match(c.notes.join(' '), /FDA, section 1 .*ultrarapid metabolizers/);
  assert.equal(gd({ drug: 'codeine', results: 'CYP2D6 0.25' }, DB, NOW).classification, 'Moderate');
  const a = gd({ drug: 'abacavir', results: 'HLA-B*57:01 positive' }, DB, NOW);
  assert.equal(a.recommendation, 'Abacavir is not recommended');
  const t = gd({ drug: 'tacrolimus', results: 'CYP3A5: NM' }, DB, NOW);
  assert.match(t.notes.join(' '), /Increase starting dose 1\.5 to 2 times/);
  assert.match(t.notes.join(' '), /Measure drug concentrations and adjust dosage based on trough/);
});

test('gene-drug: a missing gene is No Result where CPIC has that row, and asked for where it does not', () => {
  const s = gd({ drug: 'sertraline', results: 'CYP2C19 PM' }, DB, NOW);
  assert.deepEqual(s.key, { CYP2B6: 'No Result', CYP2C19: 'Poor Metabolizer' });
  assert.match(s.recommendation, /50% reduction of standard maintenance dose/);
  assert.match(gd({ drug: 'codeine', results: '' }, DB, NOW).message, /Enter the CYP2D6 result.*activity score/);
  assert.match(gd({ drug: 'codeine', results: 'CYP2D6: fast' }, DB, NOW).message, /"fast" is not a CYP2D6 result/);
});

test('gene-drug: populations, drugs with a guideline but no rows, and unknown drugs', () => {
  assert.match(gd({ drug: 'clopidogrel', results: 'CYP2C19: IM' }, DB, NOW).message, /CPIC splits clopidogrel by population/);
  const pop = (gd({ drug: 'clopidogrel', results: 'CYP2C19: IM' }, DB, NOW).message.match(/Choose one: ([^;]+);/) || [])[1];
  assert.equal(gd({ drug: 'clopidogrel', population: pop, results: 'CYP2C19: IM' }, DB, NOW).matched, true);
  assert.match(gd({ drug: 'warfarin' }, DB, NOW).band, /CPIC has a guideline for warfarin, but no recommendation rows/);
  assert.match(gd({ drug: 'warfarin' }, DB, NOW).notes.join(' '), /does not follow simple diplotype to phenotype translation/);
  assert.match(gd({ drug: 'ondansetron' }, DB, NOW).notes.join(' '), /CYP2D6 and Ondansetron and Tropisetron, 2026/);
  assert.match(gd({ drug: 'aspirin' }, DB, NOW).message, /Neither CPIC's database nor the FDA table/);
  // The refusal is one sentence: as the only child of the live region, a long one is lifted out by the
  // intro-note hoist in app.js and the reader sees an empty result.
  const expired = gd({ drug: 'codeine', results: 'CYP2D6: 0' }, DB, new Date('2026-10-30T12:00:00Z'));
  assert.match(expired.message, /past their check date \(2026-10-29\)\. No CPIC recommendation is shown\.$/);
  assert.ok(expired.message.length < 200, `a refusal stays short; this one ran ${expired.message.length}`);
});

test('panel review: HLA-B*15:02 positive touches the four antiseizure drugs; a normal result changes nothing', () => {
  const r = pr({ results: 'HLA-B*15:02 positive' }, DB, NOW);
  assert.deepEqual([...new Set(r.found.map((f) => f.drug))].sort(), ['carbamazepine', 'fosphenytoin', 'oxcarbazepine', 'phenytoin']);
  assert.equal(r.found[0].classification, 'Strong');
  assert.match(r.csv.split('\n')[0], /^result,drug,population,CPIC classification,CPIC recommendation/);
  assert.equal(pr({ results: 'CYP2C19: Normal Metabolizer' }, DB, NOW).found.length, 0);
  assert.ok(pr({ results: 'CYP2C19: PM' }, DB, NOW).found.some((f) => f.drug === 'clopidogrel'));
  assert.match(pr({ results: 'XYZ1: PM' }, DB, NOW).message, /no CPIC recommendation is keyed by that gene/);
  assert.match(pr({ results: '' }, DB, NOW).message, /one per line/);
});

import { dpydFluoropyrimidineDose as dp } from '../../lib/dpyd-fluoropyrimidine-dose-v1635.js';
import { tpmtNudt15ThiopurineDose as tn } from '../../lib/tpmt-nudt15-thiopurine-dose-v1635.js';
import { ugt1a1IrinotecanLabel as ui } from '../../lib/ugt1a1-irinotecan-label-v1635.js';
import { opioidCyp2d6WithCpic as oc } from '../../lib/opioid-cyp2d6-pediatric-check-v1640.js';

test('DPYD: the two lowest values, CPIC\'s row whole, and a variant by its HGVS name or alias', () => {
  const r = dp({ drug: 'fluorouracil', variants: 'c.1905+1G>A (*2A)\nReference' }, DB, NOW);
  assert.deepEqual([r.activityScore, r.phenotype, r.classification], [1, 'Intermediate Metabolizer', 'Strong']);
  assert.match(r.recommendation, /^Reduce starting dose by 50%/);
  assert.equal(dp({ drug: 'fluorouracil', variants: '*2A\nReference' }, DB, NOW).activityScore, 1);
  assert.equal(dp({ drug: 'fluorouracil', variants: 'HapB3\nReference' }, DB, NOW).classification, 'Moderate');
  assert.equal(dp({ drug: 'fluorouracil', variants: 'c.1905+1G>A; c.2846A>T; Reference' }, DB, NOW).activityScore, 0.5, 'three variants: the two lowest');
  assert.match(dp({ drug: 'fluorouracil', variants: 'Reference' }, DB, NOW).message, /at least two DPYD variants/);
  assert.match(dp({ drug: 'fluorouracil', variants: 'Reference\nReference', activityScore: '2' }, DB, NOW).message, /not both/);
  assert.equal(dp({ drug: 'fluorouracil', activityScore: '0' }, DB, NOW).phenotype, 'Poor Metabolizer');
  const c = dp({ drug: 'capecitabine', activityScore: '2' }, DB, NOW);
  assert.match(c.notes.join(' '), /XELODA label, section 2\.1 .*test patients for genetic variants of the DPYD gene/);
  assert.doesNotMatch(dp({ drug: 'fluorouracil', activityScore: '2' }, DB, NOW).notes.join(' '), /XELODA/);
});

test('thiopurines: the combined TPMT and NUDT15 row; "No result" is a choice', () => {
  const r = tn({ drug: 'mercaptopurine', tpmt: 'Intermediate Metabolizer', nudt15: 'Normal Metabolizer' }, DB, NOW);
  assert.match(r.recommendation, /30-80% of standard starting dose/);
  assert.equal(tn({ drug: 'azathioprine', tpmt: 'Poor Metabolizer', nudt15: 'No Result' }, DB, NOW).recommendation, 'Consider alternative nonthiopurine immunosuppressant therapy.');
  assert.match(tn({ drug: 'mercaptopurine', tpmt: 'Normal Metabolizer', nudt15: '' }, DB, NOW).message, /NUDT15 phenotype/);
});

test('irinotecan: the label names three genotypes; the others get no statement', () => {
  const r = ui({ genotype: '*28/*28' }, NOW);
  assert.deepEqual([r.labelNamed, r.flag], [true, 'label-reduction']);
  assert.match(r.notes[0], /by at least one level/);
  assert.equal(ui({ genotype: '*6/*28' }, NOW).labelNamed, true);
  assert.equal(ui({ genotype: '*1/*28' }, NOW).flag, 'no-label-statement');
  assert.match(ui({ genotype: '' }, NOW).message, /Choose the UGT1A1 genotype/);
});

test('codeine and tramadol: the CPIC row for a score follows the label statements', () => {
  const base = { drug: 'codeine', age: '30', procedure: 'another-use', status: 'poor' };
  const r = oc({ ...base, activityScore: '0' }, DB, NOW);
  assert.equal(r.cpicClassification, 'Strong');
  assert.match(r.notes.join(' '), /CPIC recommendation: "Avoid codeine use because of possibility of diminished analgesia/);
  assert.equal(oc(base, DB, NOW).cpicClassification, undefined, 'no score, the label rules alone');
  assert.match(oc({ ...base, status: 'normal', activityScore: '3' }, DB, NOW).notes.join(' '), /is an ultrarapid metabolizer by CPIC's bands, but the status chosen is normal/);
  assert.match(oc({ ...base, activityScore: '1.1' }, DB, NOW).message, /step by 0\.25/);
  assert.match(oc({ ...base, activityScore: '1' }, { manifest: null }, NOW).notes.join(' '), /CPIC row not shown: .*did not load/);
});

import { FACTORS, BY_HASH, doseArithmetic } from '../../lib/cpic-dose-factors-v1640.js';

test('the dose side table: every row names a hash, drugs and an arithmetic kind, each hash once', () => {
  assert.equal(FACTORS.length, 44);
  assert.equal(BY_HASH.size, FACTORS.length, 'one row per CPIC sentence');
  for (const f of FACTORS) {
    assert.match(f.sha256, /^[0-9a-f]{64}$/, f.id);
    assert.ok(f.drugs.length >= 1, f.id);
    assert.ok(['multiply', 'ceiling', 'fixed', 'range'].includes(f.kind), f.id);
    if (f.kind === 'multiply') assert.ok(f.lo > 0 && f.hi >= f.lo && f.dose, f.id);
    if (f.kind === 'ceiling') assert.ok(f.max > 0, f.id);
  }
  assert.equal(new Set(FACTORS.map((f) => f.id)).size, FACTORS.length, 'ids are unique');
});

test('the side table applies the factors CPIC states, to the dose entered', () => {
  const t = gd({ drug: 'tacrolimus', results: 'CYP3A5: NM', dose: '5', weight: '70' }, DB, NOW);
  assert.deepEqual([t.arithmetic.low, t.arithmetic.high, t.arithmetic.cap, t.arithmetic.capped], [7.5, 10, 21, false]);
  assert.match(t.notes.join(' '), /× 1\.5 to × 2 applied to the recommended starting dose you entered \(5 mg\): 7\.5 to 10 mg/);
  assert.match(t.notes.join(' '), /cap at 0\.3 mg\/kg\/day is 21 mg a day at 70 kg; the figures above are within it/);
  const c = gd({ drug: 'celecoxib', results: 'CYP2C9: 0.5', dose: '100', maxDose: '400' }, DB, NOW);
  assert.deepEqual([c.arithmetic.low, c.arithmetic.high, c.arithmetic.maxLow, c.arithmetic.maxHigh], [25, 50, 100, 200]);
  const s = gd({ drug: 'simvastatin', results: 'SLCO1B1: Decreased Function', dose: '20' }, DB, NOW);
  assert.deepEqual([s.arithmetic.ceiling, s.arithmetic.overCeiling], [20, true], 'the simvastatin sentence says under 20, so 20 is above it');
  assert.equal(gd({ drug: 'simvastatin', results: 'SLCO1B1: Decreased Function', dose: '15' }, DB, NOW).arithmetic.overCeiling, false);
  const e = gd({ drug: 'efavirenz', results: 'CYP2B6: PM' }, DB, NOW);
  assert.deepEqual(e.arithmetic.fixedDoses, [400, 200]);
  assert.match(e.notes.join(' '), /names the dose itself: 400 or 200 mg\/day\. Nothing is multiplied/);
});

test('the side table asks for a dose rather than supplying one, and never invents a figure', () => {
  const t = gd({ drug: 'tacrolimus', results: 'CYP3A5: NM' }, DB, NOW);
  assert.equal(t.arithmetic, null);
  assert.match(t.notes.join(' '), /Enter the recommended starting dose to apply CPIC's arithmetic to it/);
  assert.match(gd({ drug: 'tacrolimus', results: 'CYP3A5: NM', dose: '-5' }, DB, NOW).message, /dose/);
  // A recommendation whose text states no factor gets none, and the result is otherwise unchanged.
  const a = gd({ drug: 'abacavir', results: 'HLA-B*57:01 positive', dose: '600' }, DB, NOW);
  assert.equal(a.arithmetic, null);
  assert.doesNotMatch(a.notes.join(' '), /applied to|ceiling/);
});

test('a reworded CPIC sentence drops the arithmetic instead of changing it', () => {
  const row = FACTORS.find((f) => f.id === 'tacrolimus-increase');
  assert.deepEqual(doseArithmetic({ hash: row.sha256, drug: 'tacrolimus', dose: 10 }).values.high, 20);
  assert.deepEqual(doseArithmetic({ hash: `${row.sha256.slice(0, 63)}0`, drug: 'tacrolimus', dose: 10 }), { none: 'none-recorded' });
  assert.deepEqual(doseArithmetic({ hash: row.sha256, drug: 'celecoxib', dose: 10 }), { none: 'drug-mismatch' });
  assert.deepEqual(doseArithmetic({}), { none: 'none-recorded' });
});

test('every side-table hash is a recommendation the shipped CPIC tables still carry', async () => {
  const { readFileSync } = await import('node:fs');
  const rec = JSON.parse(readFileSync(new URL('../../data/cpic/shards/rec.json', import.meta.url), 'utf8'));
  const live = new Set(rec.map((r) => r.sha));
  const stale = FACTORS.filter((f) => !live.has(f.sha256)).map((f) => f.id);
  assert.deepEqual(stale, [], 'a factor whose sentence has left the tables should be re-read and removed');
  for (const f of FACTORS) {
    const drugs = new Set(rec.filter((r) => r.sha === f.sha256).map((r) => r.drug));
    assert.deepEqual(f.drugs.filter((d) => !drugs.has(d)), [], `${f.id}: names a drug the sentence does not belong to`);
  }
});

import { footer } from '../../lib/cpic-tables.js';

test('the attribution footer says what it knows and never prints "undefined"', () => {
  assert.match(footer({ edition: '2026-08-03', fetchedAt: '2026-10-15' }), /Data version: change log of 2026-08-03; read 2026-10-15\./);
  assert.match(footer({ edition: '2026-08-03' }), /Data version: change log of 2026-08-03\./);
  for (const ix of [{}, null, undefined, 0, 'x']) {
    const t = footer(ix);
    assert.match(t, /Data version: not recorded in the tables shipped\./);
    assert.doesNotMatch(t, /undefined|NaN/);
  }
});

test('one gene given twice with two results is refused, not answered from the last line', () => {
  assert.match(gd({ drug: 'codeine', results: 'CYP2D6: 0\nCYP2D6: 2.0' }, DB, NOW).message, /CYP2D6 is given twice, as "0\.0" and "2\.0"/);
  assert.equal(gd({ drug: 'codeine', results: 'CYP2D6: 0\nCYP2D6: 0.0' }, DB, NOW).matched, true, 'the same result twice is not a contradiction');
  assert.match(pr({ results: 'CYP2C19: PM\nCYP2C19: NM' }, DB, NOW).message, /CYP2C19 is given twice/);
  // Several HLA alleles in one report are normal and still read.
  assert.ok(pr({ results: 'HLA-B*15:02 positive\nHLA-B*57:01 positive' }, DB, NOW).found.length > 0);
});

test('DPYD takes a report\'s variants, not an unbounded list', () => {
  assert.match(dp({ drug: 'fluorouracil', variants: Array(51).fill('Reference').join('\n') }, DB, NOW).message, /at most 50/);
  assert.equal(dp({ drug: 'fluorouracil', variants: Array(50).fill('Reference').join('\n') }, DB, NOW).activityScore, 2);
});
