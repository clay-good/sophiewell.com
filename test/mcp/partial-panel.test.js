// spec-v1045: a panel answers with the halves it has.
//
// Five adapters compute two or more independent things from one input set --
// a corrected calcium AND a corrected sodium, an A-a gradient AND a P/F ratio.
// Each was written to return "whichever of these I can compute", and none of
// them could: every field was declared `required`, so validateInputs refused
// before compute ran, and the library functions throw on a missing argument
// rather than returning null, so the `== null` test never described reality
// either.
//
// The browser has always computed these halves independently. This is the agent
// surface catching up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';

const run = (id, inputs) => computeCalculator({ id, inputs });

test('corrected-ca-na: a sodium and a glucose get a corrected sodium', () => {
  const r = run('corrected-ca-na', { 'csna-na': 130, glu: 600 });
  assert.equal(r.valid, true);
  assert.equal(r.result.correctedCa, null);
  assert.ok(r.result.correctedNa.naBy1_6 > 130);
});

test('corrected-ca-na: with neither pair it is INCOMPLETE, not an error', () => {
  const r = run('corrected-ca-na', {});
  assert.equal(r.valid, false);
  assert.equal(r.code, 'INCOMPLETE');
});

test('corrected-ca-na: both pairs still answer both', () => {
  const r = run('corrected-ca-na', { ca: 7.5, 'cca-alb': 2.5, 'csna-na': 130, glu: 600 });
  assert.equal(r.result.correctedCa, 8.7);
  assert.ok(r.result.correctedNa.naBy1_6 > 130);
});

test('aa-pf-suite: a PaO2 and an FiO2 get a P/F ratio without a PaCO2', () => {
  const r = run('aa-pf-suite', { 'sf-pao2': 80, 'sf-fio2': 0.4 });
  assert.equal(r.valid, true);
  assert.equal(r.result.aaGradient, null);
  assert.equal(r.result.pfRatio.ratio, 200);
});

test('egfr-suite: no weight still yields both eGFRs', () => {
  const r = run('egfr-suite', { 'es-scr': 1.2, 'es-age': 60, 'es-sex': 'F' });
  assert.equal(r.valid, true);
  assert.ok(r.result.ckdEpi2021 > 0);
  assert.ok(r.result.mdrd > 0);
  assert.equal(r.result.cockcroftGault, null);
});

test('shock-index: a pressure and a pulse give the shock index', () => {
  const r = run('shock-index', { 'si-sbp': 90, 'si-hr': 120 });
  assert.equal(r.valid, true);
  assert.ok(Math.abs(r.result.shockIndex - 120 / 90) < 1e-9);
  assert.equal(r.result.map, null);
});

test('fena-feurea: the urea fraction alone, for the patient who had a diuretic', () => {
  const r = run('fena-feurea', { 'fu-uu': 300, 'fu-pu': 30, 'fn-ucr': 60, 'fn-pcr': 1.2 });
  assert.equal(r.valid, true);
  assert.equal(r.result.feNaPct, null);
  assert.ok(r.result.feUreaPct > 0);
});

// The other direction: a value that IS given and is wrong still errors, rather
// than being quietly treated as absent.
test('a bad value is still an error, not a missing one', () => {
  const r = run('aa-pf-suite', { 'sf-pao2': 80, 'sf-fio2': 0.4, 'sf-paco2': 'banana' });
  assert.equal(r.valid, false);
});
