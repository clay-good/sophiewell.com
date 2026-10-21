// Regression tests for the defects an independent review found in the pre-v300 multi-calculator libs on 2026-10-20
// (spec-v1681), each with the input that showed it, run through the same compute path agents use.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';

const run = (id, inputs) => computeCalculator({ id, inputs });
const band = (id, inputs) => { const r = run(id, inputs); assert.equal(r.valid, true, JSON.stringify(r)); return r.result.band; };

test('a value between printed rows takes its row, not 0 points or "outside the range"', () => {
  assert.equal(band('pospom', { 'pospom-age': '95.5', 'pospom-surg': 'major-gi' }), band('pospom', { 'pospom-age': '95', 'pospom-surg': 'major-gi' }));
  assert.match(band('cpis-vap', { 'cp-temp': '38.45', 'cp-wbc': '8000', 'cp-sec': 'non-purulent', 'cp-oxy': 'low', 'cp-cxr': 'diffuse', 'cp-cult': 'none' }), /CPIS 5\/12/);
  assert.match(band('sipa', { 'sp-age': '6.5', 'sp-hr': '140', 'sp-sbp': '100' }), /^Elevated SIPA .*> 1\.22/);
  assert.equal(run('heparin-nomogram', { 'hep-wt': '80', 'hep-ind': 'vte', 'hep-aptt': '35' }).result.titration.rebolusUnits, 3200);
});

test('values at a cut are printed on the side they were judged', () => {
  assert.match(band('albi-grade', { 'al-alb': '2.9', 'al-bili': '2.5' }), /^ALBI score -1\.389 -> grade 3/);
  assert.match(band('palbi', { 'palbi-albumin': '2.4', 'palbi-bilirubin': '0.4', 'palbi-platelets': '50' }), /^PALBI score -2\.528 → grade 2/);
  assert.match(band('forns-index', { 'fo-age': '30', 'fo-ggt': '20', 'fo-plt': '108.22', 'fo-chol': '220' }), /^Forns index 4\.196: below 4\.2/);
  assert.match(band('cardiac-power-output', { 'cp-map': '53.7', 'cp-co': '5' }), /0\.595 W: below/);
  assert.match(band('ufr-dialysis', { 'uf-vol': '3.5', 'uf-hr': '3.845', 'uf-wt': '70' }), /13\.004 mL\/kg\/hr: above/);
  assert.match(band('transfusion-threshold', { 'tt-hb': '6.995', 'tt-pop': 'stable-adult' }), /^Hgb 6\.995 g\/dL is below/);
  assert.match(band('gold-spirometry', { 'gs-pct': '45', 'gs-ratio': '0.695' }), /FEV1\/FVC 0\.695 < 0\.70/);
  assert.match(band('iv-osmolarity', { 'io-dex': '5', 'io-aa': '5.495', 'io-na': '30', 'io-k': '20' }), /^899\.5 mOsm\/L \u2014 below 900/);
  assert.equal(run('corrected-phenytoin', { 'cp-meas': '8', 'cp-alb': '3.51' }).result.corrected, 9.98);
  assert.match(band('lv-mass-index', { 'lvmi-lvidd': '5.2', 'lvmi-pwtd': '1.1', 'lvmi-ivsd': '1.2', 'lvmi-bsa': '2.0', 'lvmi-sex': 'male' }), /RWT 0\.423 \u2014 concentric/);
});

test('incomplete or impossible pairs are refused', () => {
  assert.equal(run('rifle-aki', { 'ri-base': '1.0' }).valid, false);
  assert.equal(run('ivc-fluid-responsiveness', { 'iv-mode': 'mechanical', 'iv-dmax': '1.6', 'iv-dmin': '2.0' }).valid, false);
  assert.equal(run('ppv-svv', { 'pv-mode': 'ppv', 'pv-max': '40', 'pv-min': '50' }).valid, false);
  assert.equal(run('papi', { 'papi-pasp': '20', 'papi-padp': '30', 'papi-rap': '10' }).valid, false);
  assert.equal(run('vanc-auc', { 'va-peak': '30', 'va-tpeak': '1', 'va-trough': '10', 'va-ttrough': '1.01', 'va-tinf': '1', 'va-tau': '12', 'va-mic': '1' }).valid, false);
});
