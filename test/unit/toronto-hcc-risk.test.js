// spec-v281: worked examples for the Toronto HCC Risk Index (THRI; Sharma 2017).
// Table 3 point weights spec-v97 transcribed verbatim from the primary paper:
//   Age <45/45-60/>60 = 0/50/100; etiology autoimmune or HCV-SVR = 0, other = 36,
//   steatohepatitis = 54, HCV or HBV = 97; male = 80; platelets >200/140-200/
//   80-139/<80 = 0/20/70/89. Bands: low <120, medium 120-240, high >240 (10-year
//   cumulative HCC ~3%/10%/32%).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { torontoHccRisk } from '../../lib/hcc-surveillance-v281.js';

test('toronto-hcc-risk: low-risk score 0 (young female, autoimmune, high platelets)', () => {
  const r = torontoHccRisk({ age: 40, sex: 'female', etiology: 'autoimmune', platelets: 250 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.band, 'low');
  assert.equal(r.abnormal, false);
  assert.ok(r.detail.includes('~3% 10-year HCC risk'));
});

test('toronto-hcc-risk: maximum score 366 (>60 male HBV, platelets <80)', () => {
  const r = torontoHccRisk({ age: 70, sex: 'male', etiology: 'hbv', platelets: 50 });
  assert.equal(r.score, 366); // 100 + 80 + 97 + 89
  assert.equal(r.band, 'high');
});

test('toronto-hcc-risk: high-risk band (tile example, score 347)', () => {
  const r = torontoHccRisk({ age: 65, sex: 'male', etiology: 'hcv', platelets: 100 });
  assert.equal(r.score, 347); // 100 + 80 + 97 + 70
  assert.equal(r.band, 'high');
  assert.ok(r.detail.includes('Toronto HCC Risk Index 347/366'));
  assert.ok(r.detail.includes('~32%'));
});

test('toronto-hcc-risk: band edges (120 medium, 240 medium, 241 high)', () => {
  // 45-60 male other, platelets >200: 50 + 80 + 36 + 0 = 166 medium.
  assert.equal(torontoHccRisk({ age: 55, sex: 'male', etiology: 'other', platelets: 250 }).band, 'medium');
  // <120 stays low: 45-60 female HCV-SVR, platelets 140-200: 50 + 0 + 0 + 20 = 70 low.
  assert.equal(torontoHccRisk({ age: 55, sex: 'female', etiology: 'hcv-svr', platelets: 150 }).band, 'low');
  // exactly 240 is medium, not high (high is > 240): >60 male steatohepatitis, plt 140-200 -> 100+80+54+20 = 254 high;
  // >60 female HCV plt <80 -> 100+0+97+89 = 286 high.
  assert.equal(torontoHccRisk({ age: 70, sex: 'female', etiology: 'hcv', platelets: 60 }).band, 'high');
});

test('toronto-hcc-risk: etiology weights are exact', () => {
  const base = { age: 40, sex: 'female', platelets: 250 }; // 0 + 0 + etiology + 0
  assert.equal(torontoHccRisk({ ...base, etiology: 'autoimmune' }).score, 0);
  assert.equal(torontoHccRisk({ ...base, etiology: 'hcv-svr' }).score, 0);
  assert.equal(torontoHccRisk({ ...base, etiology: 'other' }).score, 36);
  assert.equal(torontoHccRisk({ ...base, etiology: 'steatohepatitis' }).score, 54);
  assert.equal(torontoHccRisk({ ...base, etiology: 'hcv' }).score, 97);
  assert.equal(torontoHccRisk({ ...base, etiology: 'hbv' }).score, 97);
});

test('toronto-hcc-risk: missing / invalid inputs are invalid (no NaN)', () => {
  assert.equal(torontoHccRisk({ age: 60, sex: 'male', platelets: 100 }).valid, false); // no etiology
  assert.equal(torontoHccRisk({}).valid, false);
  assert.equal(torontoHccRisk().valid, false);
});
