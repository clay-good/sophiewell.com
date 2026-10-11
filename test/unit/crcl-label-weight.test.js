// spec-v1632 backfill 5: the weight a drug's label names for Cockcroft-Gault.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crclForLabel as c, DRUGS } from '../../lib/crcl-label-weight-v1632.js';
import { cockcroftGaultByWeight } from '../../lib/clinical.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const pt = { age: 60, weightKg: 120, heightCm: 177.8, scr: 1.0, sex: 'M' };
const bw = cockcroftGaultByWeight(pt);
const at = (drug, extra = {}) => c({ drug, byWeight: bw, weightKg: pt.weightKg, heightCm: pt.heightCm, ...extra }, now);

test('seven labels, each on a watched edition that lists cockcroft-gault', () => {
  assert.equal(DRUGS.length, 7);
  for (const d of DRUGS) {
    assert.equal(labelRow(d.setId, now).answers, true, d.brand);
    assert.ok(LABEL_EDITIONS[d.setId], d.brand);
  }
});

test('actual, ideal and surface-area-adjusted results follow the label', () => {
  for (const d of ['rivaroxaban', 'dofetilide', 'tirofiban', 'zoledronic-acid']) {
    assert.deepEqual([at(d).basis, at(d).crcl, at(d).unit], ['actual', bw.actual, 'mL/min']);
  }
  for (const d of ['tenofovir-df', 'emtricitabine-tenofovir']) {
    assert.deepEqual([at(d).basis, at(d).crcl], ['ideal', bw.ideal]);
    assert.match(at(d).text, /ideal \(lean\) body weight \(73 kg\)/);
  }
  const k = at('levetiracetam');
  const bsa = Math.sqrt((177.8 * 120) / 3600);
  assert.equal(k.unit, 'mL/min/1.73 m²');
  assert.ok(Math.abs(k.crcl - (bw.actual * 1.73) / bsa) < 0.01);
  assert.match(k.text, /Mosteller/);
});

test('nothing is assumed: no drug gives nothing, and a label that needs a height asks for it', () => {
  assert.equal(c({ drug: '' }, now), null);
  assert.equal(c({}, now), null);
  assert.equal(c({ drug: 'warfarin' }, now).valid, false);
  const noHeight = { byWeight: { actual: 133.33 }, weightKg: 120 };
  assert.equal(c({ drug: 'rivaroxaban', ...noHeight }, now).crcl, 133.33);
  assert.match(c({ drug: 'tenofovir-df', ...noHeight }, now).message, /^Enter a height/);
  assert.match(c({ drug: 'levetiracetam', ...noHeight }, now).message, /^Enter a height/);
  // Under 5 ft the Devine formula gives no ideal weight, and the result says so instead of using actual.
  const short = cockcroftGaultByWeight({ ...pt, weightKg: 60, heightCm: 147 });
  const r = c({ drug: 'tenofovir-df', byWeight: short, weightKg: 60, heightCm: 147 }, now);
  assert.equal(r.crcl, null);
  assert.match(r.text, /no ideal weight below 5 ft/);
});

test('a superseded label withholds its sentence', () => {
  const d = DRUGS[0];
  const T = { [d.setId]: { label: d.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' } };
  const r = c({ drug: d.value, byWeight: bw, weightKg: 120, heightCm: 177.8 }, now, T);
  assert.equal(r.withheld, true);
  assert.equal(r.crcl, undefined);
});
