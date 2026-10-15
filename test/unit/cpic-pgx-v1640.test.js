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
  assert.deepEqual(genes(DB, NOW), ['CYP2C19', 'CYP2C9', 'G6PD', 'MT-RNR1']);
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
  assert.match(gd({ drug: 'codeine', results: 'CYP2D6: 0' }, DB, new Date('2026-10-30T12:00:00Z')).message, /past their check date.*No CPIC recommendation is shown.*FDA, section/);
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
