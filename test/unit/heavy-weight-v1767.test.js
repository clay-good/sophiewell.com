// spec-v1767: four adult tools whose every printed dose is already held to a label or guideline
// maximum now take a weight up to the lib/bounds.js envelope (500 kg). Tools that would print an
// uncapped per-kilogram dose, or whose source population excludes such weights, still refuse.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';
import { BOUNDS } from '../../lib/bounds.js';
import { ltbiRegimenDosing } from '../../lib/ltbi-regimen-dosing-v1400.js';
import { thrombolyticDose, REGIMENS as THD_REGIMENS } from '../../lib/thrombolytic-dose-v1636.js';
import { neostigmineReversalDose } from '../../lib/neostigmine-reversal-dose-v1636.js';
import { gcsfTimingCheck } from '../../lib/gcsf-timing-check-v1635.js';

const now = new Date('2026-10-12T12:00:00Z');
const at = (id, dom, kg) => computeCalculator({ id, inputs: { ...META[id].example.fields, [dom]: String(kg) } });
const HEAVY = [350, 450, BOUNDS.weightKg.max];

test('every widened tool answers its worked example at 350 and 450 kg, and refuses past the envelope', () => {
  for (const [id, dom] of [['ltbi-regimen-dosing', 'ltbi-weight'], ['thrombolytic-dose', 'thd-weight'], ['neostigmine-reversal-dose', 'nrd-weight'], ['gcsf-timing-check', 'gtc-weight']]) {
    for (const kg of HEAVY) assert.notEqual(at(id, dom, kg).valid, false, `${id} at ${kg} kg`);
    assert.equal(at(id, dom, BOUNDS.weightKg.max + 1).valid, false, `${id} past the envelope`);
  }
});

test('ltbi: every regimen holds each drug to its CDC maximum at 350 and 450 kg', () => {
  const caps = { Isoniazid: 900, Rifampin: 600, Rifapentine: 900 };
  for (const kg of HEAVY) {
    for (const [regimen, frequency] of [['3HP'], ['4R'], ['3HR'], ['6H', 'daily'], ['9H', 'twice-weekly']]) {
      for (const ageYears of [35, 14, 10]) {
        const r = ltbiRegimenDosing({ regimen, frequency, weightKg: kg, ageYears, pregnant: 'no', hiv: 'negative' });
        assert.equal(r.valid, true, `${regimen} at ${kg} kg`);
        for (const line of r.doses) {
          const drug = Object.keys(caps).find((d) => line.includes(d));
          for (const m of line.matchAll(/(\d+) mg/g)) assert.ok(Number(m[1]) <= caps[drug], `${line}`);
        }
        if (regimen === '3HR') assert.ok(r.doses.some((l) => /Isoniazid 300 mg/.test(l)), r.doses.join(' | '));
      }
    }
  }
});

test('thrombolytic: every regimen stays within the label maximum at 350 and 450 kg', () => {
  const caps = { 'alteplase-ischemic-stroke': 90, 'alteplase-mi-accelerated': 100, 'alteplase-mi-3-hour': 100, 'alteplase-pulmonary-embolism': 100, 'tenecteplase-ischemic-stroke': 25, 'tenecteplase-stemi': 50, 'cathflo-occluded-line': 2 };
  for (const kg of HEAVY) {
    for (const { value } of THD_REGIMENS) {
      const r = thrombolyticDose({ regimen: value, weight: kg }, now);
      assert.equal(r.valid, true, `${value} at ${kg} kg`);
      assert.ok(r.totalMg <= caps[value], `${value} at ${kg} kg gave ${r.totalMg} mg`);
    }
  }
  assert.equal(thrombolyticDose({ regimen: 'alteplase-ischemic-stroke', weight: 450 }, now).totalMg, 90);
});

test('neostigmine: the dose is held to 5 mg at 350 and 450 kg on both label rows', () => {
  for (const kg of HEAVY) {
    for (const [twitch, halfLife] of [['first-twitch-near-10-percent', 'longer-acting-blocker'], ['first-twitch-well-above-10-percent', 'shorter-acting-blocker'], ['first-twitch-near-10-percent', 'shorter-acting-blocker']]) {
      const r = neostigmineReversalDose({ weight: kg, twitch, halfLife, concentration: '1-mg-ml' }, now);
      assert.equal(r.valid, true);
      assert.equal(r.maximumMg, 5);
      assert.ok(r.doseMg === null || r.doseMg <= 5, `${kg} kg gave ${r.doseMg} mg`);
    }
  }
});

test('pegfilgrastim: 6 mg at 350 and 450 kg, adult or pediatric', () => {
  for (const kg of HEAVY) {
    for (const population of ['adult', 'child']) {
      const r = gcsfTimingCheck({ product: 'pegfilgrastim', chemoEnd: '2026-10-12T10:00', planned: '2026-10-14T10:00', nextChemo: '2026-11-02T10:00', population, weight: kg }, now);
      assert.equal(r.valid, true);
      assert.equal(r.doseMg, 6, `${population} at ${kg} kg`);
    }
  }
});

test('in-range weights compute as before', () => {
  assert.equal(thrombolyticDose({ regimen: 'alteplase-ischemic-stroke', weight: 80 }, now).totalMg, 72);
  assert.equal(neostigmineReversalDose({ weight: 50, twitch: 'first-twitch-well-above-10-percent', halfLife: 'shorter-acting-blocker', concentration: '1-mg-ml' }, now).doseMg, 1.5);
  assert.match(ltbiRegimenDosing({ regimen: '4R', weightKg: 50, ageYears: 35, pregnant: 'no', hiv: 'negative' }).doses[0], /Rifampin 500 mg/);
});

test('tools that would print an uncapped per-kilogram dose, or whose source excludes the weight, still refuse 350 kg', () => {
  for (const [id, dom] of [['strongyloides-presumptive', 'sg-weight'], ['fomepizole-schedule', 'fms-weight'], ['rsi-dose-sheet', 'rds-weight'], ['chatelut-carboplatin', 'chc-weight'], ['vanc-hd-dose', 'vhd-weight'], ['dantrolene-mh-vials', 'dmv-weight'], ['kdri-kdpi', 'kdpi-weight']]) {
    assert.equal(at(id, dom, 350).valid, false, id);
  }
});
