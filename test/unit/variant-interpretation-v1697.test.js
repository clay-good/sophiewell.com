// spec-v1697: ACMG/AMP class by three methods (Richards 2015 Table 5, Tavtigian 2020 points, Tavtigian 2018
// posterior) and Whiffin 2017's maximum credible allele frequency. Every vector is from the change's design.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acmgVariantClassify as acmg, posterior, pointsClass, parseCodes } from '../../lib/acmg-variant-classify-v1697.js';
import { maxCredibleAlleleFrequency as maf, poissonQuantile, sci } from '../../lib/max-credible-allele-frequency-v1697.js';

const has = (r, re) => r.notes.some((n) => re.test(n));

test('PVS1 + PS3: Pathogenic (i), 12 points, posterior 0.9986, no disagreement', () => {
  const r = acmg({ codes: 'PVS1\nPS3' });
  assert.equal(r.richardsClass, 'Pathogenic');
  assert.equal(r.richardsRule, 'Pathogenic (i)');
  assert.equal(r.points, 12);
  assert.equal(r.pointsClass, 'Pathogenic');
  assert.equal(r.posterior, 0.9986);
  assert.ok(!has(r, /disagree/));
});

test('PS1 + PS3: Pathogenic (ii), 8 points Likely pathogenic, the 2018 inconsistency flag', () => {
  const r = acmg({ codes: 'PS1, PS3' });
  assert.equal(r.richardsRule, 'Pathogenic (ii)');
  assert.equal(r.points, 8);
  assert.equal(r.pointsClass, 'Likely pathogenic');
  assert.ok(has(r, /disagree/));
  assert.ok(has(r, /Tavtigian 2018 found Pathogenic \(ii\) inconsistent/));
});

test('PVS1 + PM2: Likely pathogenic (i), 10 points Pathogenic, same flag', () => {
  const r = acmg({ codes: 'PVS1 PM2' });
  assert.equal(r.richardsRule, 'Likely pathogenic (i)');
  assert.equal(r.points, 10);
  assert.equal(r.pointsClass, 'Pathogenic');
  assert.ok(has(r, /Likely pathogenic \(i\) inconsistent/));
});

test('PVS1 + PM2_Supporting: no 2015 rule, 9 points, posterior 0.9878, SVI 2020 note', () => {
  const r = acmg({ codes: 'PVS1\nPM2_Supporting' });
  assert.deepEqual(r.codesWritten, ['PVS1', 'PM2_Supporting']);
  assert.equal(r.richardsClass, 'Uncertain significance');
  assert.equal(r.richardsRule, null);
  assert.equal(r.points, 9);
  assert.equal(r.pointsClass, 'Likely pathogenic');
  assert.equal(r.posterior, 0.9878);
  assert.ok(has(r, /PM2 recommendation \(approved September 4, 2020\)/));
});

test('PS3 + BS3: conflicting, uncertain, 0 points, posterior 0.10', () => {
  const r = acmg({ codes: 'PS3\nBS3' });
  assert.equal(r.richardsClass, 'Uncertain significance');
  assert.match(r.band, /criteria conflict/);
  assert.equal(r.points, 0);
  assert.equal(r.posterior, 0.1);
});

test('BA1: Benign (i), not scored', () => {
  const r = acmg({ codes: 'BA1' });
  assert.equal(r.richardsRule, 'Benign (i)');
  assert.ok(has(r, /BA1 is not scored/));
  assert.ok(!has(r, /disagree/));
});

test('posterior at 6 points and the prior note; -1 and -7', () => {
  assert.equal(Number(posterior(6, 0.1).toFixed(4)), 0.8999);
  assert.equal(Number(posterior(6, 0.102).toFixed(4)), 0.9019);
  assert.equal(Number(posterior(-1).toFixed(4)), 0.0507);
  assert.equal(Number(posterior(-7).toFixed(5)), 0.00066);
  const r = acmg({ codes: 'PS3 PP1 PP3' });
  assert.equal(r.points, 6);
  assert.equal(r.posterior, 0.8999);
  assert.ok(has(r, /just above 0\.10/));
  assert.equal(acmg({ codes: 'PS3 PP1 PP3', prior: '0.102' }).posterior, 0.9019);
});

test('point bands at their edges', () => {
  const want = { [-7]: 'Benign', [-6]: 'Likely benign', [-1]: 'Likely benign', 0: 'Uncertain significance', 5: 'Uncertain significance', 6: 'Likely pathogenic', 9: 'Likely pathogenic', 10: 'Pathogenic' };
  for (const [p, cls] of Object.entries(want)) assert.equal(pointsClass(Number(p)), cls, p);
});

test('every Table 5 rule fires on a minimal code set', () => {
  const cases = [
    ['PVS1 PS1', 'Pathogenic (i)'], ['PVS1 PM1 PM3', 'Pathogenic (i)'], ['PVS1 PM1 PP1', 'Pathogenic (i)'], ['PVS1 PP1 PP2', 'Pathogenic (i)'],
    ['PS1 PS2', 'Pathogenic (ii)'],
    ['PS1 PM1 PM3 PM4', 'Pathogenic (iii)'], ['PS1 PM1 PM3 PP1 PP2', 'Pathogenic (iii)'], ['PS1 PM1 PP1 PP2 PP3 PP4', 'Pathogenic (iii)'],
    ['PVS1 PM1', 'Likely pathogenic (i)'], ['PS1 PM1', 'Likely pathogenic (ii)'], ['PS1 PM1 PM3', 'Likely pathogenic (ii)'],
    ['PS1 PP1 PP2', 'Likely pathogenic (iii)'], ['PM1 PM3 PM4', 'Likely pathogenic (iv)'], ['PM1 PM3 PP1 PP2', 'Likely pathogenic (v)'],
    ['PM1 PP1 PP2 PP3 PP4', 'Likely pathogenic (vi)'],
    ['BA1', 'Benign (i)'], ['BS1 BS2', 'Benign (ii)'], ['BS1 BP1', 'Likely benign (i)'], ['BP1 BP4', 'Likely benign (ii)'],
  ];
  for (const [codes, rule] of cases) assert.equal(acmg({ codes }).richardsRule, rule, codes);
  for (const codes of ['PVS1', 'PS1', 'PM1 PM2', 'PM1 PP1 PP2 PP3', 'BS1', 'BP1']) assert.equal(acmg({ codes }).richardsRule, null, codes);
});

test('applied strengths count at the applied weight and print in ClinGen notation', () => {
  const r = acmg({ codes: 'PS3_Moderate, PP1_Strong, pm2 supporting' });
  assert.deepEqual(r.codesWritten, ['PS3_Moderate', 'PP1_Strong', 'PM2_Supporting']);
  assert.equal(r.points, 2 + 4 + 1);
  assert.equal(r.richardsRule, 'Likely pathogenic (ii)');
  assert.equal(acmg({ codes: 'PS3_VeryStrong PM1' }).richardsRule, 'Likely pathogenic (i)');
});

test('refusals: blank, unknown, duplicate, BA1 moved, benign moderate without the tick, bad prior', () => {
  assert.match(acmg({}).message, /^Enter the evidence codes/);
  assert.match(acmg({ codes: 'PVS1 PX9' }).message, /not an ACMG\/AMP code/);
  assert.match(acmg({ codes: 'PS3 PS3_Moderate' }).message, /listed twice/);
  assert.match(acmg({ codes: 'BA1_Strong' }).message, /stand-alone/);
  assert.match(acmg({ codes: 'BS1_VeryStrong' }).message, /very strong/);
  assert.match(acmg({ codes: 'BP4_Moderate' }).message, /gene-specific/);
  assert.equal(acmg({ codes: 'BP4_Moderate', otherBenignWeights: true }).points, -2);
  assert.match(acmg({ codes: 'PVS1', prior: '1' }).message, /above 0 and below 1/);
  assert.equal(parseCodes('PS1_standalone').message.includes('Only BA1'), true);
});

test('Whiffin dominant HCM: maxAF 4.0e-5, ceiling 9 at AN 121,412; AC 3 kept, AC 12 too common', () => {
  const base = { inheritance: 'dominant', prevalence: '1 in 500', allelicContribution: '0.02', geneticContribution: '1', penetrance: '0.5', alleleNumber: '121412' };
  const r = maf({ ...base, alleleCount: '3' });
  assert.equal(r.maxAF, 4e-5);
  assert.equal(sci(r.maxAF), '4.0 × 10⁻⁵');
  assert.equal(r.ceiling, 9);
  assert.equal(r.tooCommon, false);
  assert.equal(maf({ ...base, alleleCount: '12' }).tooCommon, true);
  assert.equal(maf({ ...base, penetrance: '1' }).ceiling, 5);
  assert.equal(maf({ ...base, geneticContribution: '' }).maxAF, 4e-5);
});

test('Whiffin recessive PCD: maxAF 2.418e-3, ceiling 322', () => {
  const r = maf({ inheritance: 'recessive', prevalence: '1 in 10000', allelicContribution: '0.57', geneticContribution: '0.09', penetrance: '0.5', alleleNumber: '121,412' });
  assert.equal(r.maxAF, 0.002418);
  assert.equal(r.ceiling, 322);
});

test('Poisson ceiling: the paper\'s check and a large lambda', () => {
  assert.equal(poissonQuantile(1e-4 * 100000), 15);
  const big = poissonQuantile(300);
  assert.ok(big > 300 && big < 340, String(big));
  assert.equal(poissonQuantile(0), 0);
});

test('a filtering allele frequency at or above maxAF is too common', () => {
  const base = { inheritance: 'dominant', prevalence: '1/500', allelicContribution: '0.02', penetrance: '0.5' };
  assert.equal(maf({ ...base, filteringAf: '5e-5' }).tooCommon, true);
  assert.equal(maf({ ...base, filteringAf: '0.00004' }).tooCommon, true);
  assert.equal(maf({ ...base, filteringAf: '3e-5' }).tooCommon, false);
  assert.equal(maf(base).tooCommon, null);
});

test('maxAF refusals', () => {
  assert.match(maf({}).message, /^Choose whether/);
  const base = { inheritance: 'dominant', prevalence: '1 in 500', allelicContribution: '0.02', penetrance: '0.5' };
  assert.match(maf({ ...base, allelicContribution: '0' }).message, /cannot be 0/);
  assert.match(maf({ ...base, penetrance: '1.5' }).message, /between 0 and 1/);
  assert.match(maf({ ...base, alleleCount: '3' }).message, /allele number/);
  assert.match(maf({ ...base, alleleCount: '30', alleleNumber: '20' }).message, /cannot exceed/);
  assert.match(maf({ ...base, alleleNumber: '12.5' }).message, /whole number/);
});

test('spec-v1713 review fixes: an impossible maxAF is refused; BA1 beside pathogenic codes flags the unscored posterior', () => {
  const r = maf({ inheritance: 'dominant', prevalence: '0.5', allelicContribution: '1', penetrance: '0.1', alleleCount: '1', alleleNumber: '100' });
  assert.equal(r.valid, false);
  assert.match(r.message, /2\.5, above 1/);
  assert.equal(maf({ inheritance: 'recessive', prevalence: '0.5', allelicContribution: '1', penetrance: '0.1', alleleCount: '100', alleleNumber: '100' }).valid, false);
  const mixed = acmg({ codes: 'BA1\nPVS1\nPS1' });
  assert.equal(mixed.richardsClass, 'Uncertain significance');
  assert.match(mixed.notes.join(' '), /BA1 is not scored, so the points/);
  assert.match(acmg({ codes: 'BA1\nPP3' }).notes.join(' '), /leave the stand-alone benign evidence out/);
  assert.doesNotMatch(acmg({ codes: 'BA1' }).notes.join(' '), /not scored, so the points/);
});
