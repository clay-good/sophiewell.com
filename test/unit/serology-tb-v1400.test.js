// spec-v1400: syphilis, congenital syphilis, hepatitis B and C serology, the CDPH adult TB risk
// assessment, and latent TB regimen dosing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syphilisSerologySequence as syph } from '../../lib/syphilis-serology-sequence-v1400.js';
import { congenitalSyphilisScenario as cs, CS_DAYS_CUT } from '../../lib/congenital-syphilis-scenario-v1400.js';
import { hbvSerology as hbv } from '../../lib/hbv-serology-v1400.js';
import { hcvTestSequence as hcv } from '../../lib/hcv-test-sequence-v1400.js';
import { caAdultTbRisk as catb, STEROID_NOTE } from '../../lib/ca-adult-tb-risk-v1400.js';
import { ltbiRegimenDosing as ltbi, rifapentineDose, isoniazid3hpDose } from '../../lib/ltbi-regimen-dosing-v1400.js';

// --- Syphilis serology ------------------------------------------------------

test('syphilis: reverse sequence, EIA reactive and RPR nonreactive is discordant until the TP-PA', () => {
  const r = syph({ algorithm: 'reverse', treponemal: 'reactive', nontreponemal: 'nonreactive', secondTreponemal: 'not-done' });
  assert.equal(r.interpretation, 'discordant');
  assert.doesNotMatch(r.band, /is a false positive/);
  assert.match(r.band, /TP-PA/);
});

test('syphilis: the TP-PA decides the discordant result', () => {
  const base = { algorithm: 'reverse', treponemal: 'reactive', nontreponemal: 'nonreactive' };
  assert.equal(syph({ ...base, secondTreponemal: 'reactive' }).interpretation, 'past-or-present');
  assert.equal(syph({ ...base, secondTreponemal: 'nonreactive' }).interpretation, 'unlikely');
});

test('syphilis: traditional sequence, reactive RPR with nonreactive treponemal is a biologic false positive', () => {
  assert.equal(syph({ algorithm: 'traditional', nontreponemal: 'reactive', treponemal: 'nonreactive' }).interpretation, 'biologic-false-positive');
  assert.equal(syph({ algorithm: 'traditional', nontreponemal: 'reactive', treponemal: 'not-done' }).interpretation, 'confirm');
});

test('syphilis: a fourfold change is two dilutions, and only on the same test', () => {
  const base = { algorithm: 'traditional', nontreponemal: 'reactive', treponemal: 'reactive' };
  assert.equal(syph({ ...base, titer: '32', priorTiter: '8', priorSameTest: 'yes' }).fourfold, 'rise');
  assert.equal(syph({ ...base, titer: '4', priorTiter: '32', priorSameTest: 'yes' }).fourfold, 'fall');
  assert.equal(syph({ ...base, titer: '16', priorTiter: '8', priorSameTest: 'yes' }).fourfold, 'none');
  const mixed = syph({ ...base, titer: '32', priorTiter: '8', priorSameTest: 'no' });
  assert.equal(mixed.fourfold, null);
  assert.match(mixed.titerNote, /not interchangeable/);
});

test('syphilis: a titer must be a doubling dilution, and no sequence means no answer', () => {
  assert.equal(syph({ algorithm: 'traditional', nontreponemal: 'reactive', treponemal: 'reactive', titer: '12' }).valid, false);
  assert.equal(syph({ nontreponemal: 'reactive' }).valid, false);
});

// --- Congenital syphilis ----------------------------------------------------

const CS_BASE = { exam: 'normal', direct: 'no', infantTiter: '4', maternalTiter: '16', maternalTreatment: 'penicillin-pregnancy', reinfection: 'no', delivery: '2026-09-01', weightKg: '3.2' };

test('congenital syphilis: 35 days is Scenario 3 and 25 days is Scenario 2 (the acceptance pair)', () => {
  const at35 = cs({ ...CS_BASE, treatmentStart: '2026-07-28' });
  const at25 = cs({ ...CS_BASE, treatmentStart: '2026-08-07' });
  assert.equal(at35.days, 35);
  assert.equal(at35.scenario, 3);
  assert.equal(at25.days, 25);
  assert.equal(at25.scenario, 2);
});

test('congenital syphilis: exactly 30 days is adequate; 29 is not', () => {
  assert.equal(CS_DAYS_CUT, 30);
  assert.equal(cs({ ...CS_BASE, treatmentStart: '2026-08-02' }).scenario, 3);
  assert.equal(cs({ ...CS_BASE, treatmentStart: '2026-08-03' }).scenario, 2);
});

test('congenital syphilis: an abnormal exam, a positive PCR, or a fourfold titer is Scenario 1', () => {
  assert.equal(cs({ exam: 'abnormal' }).scenario, 1);
  assert.equal(cs({ exam: 'normal', direct: 'yes' }).scenario, 1);
  assert.equal(cs({ ...CS_BASE, infantTiter: '64', maternalTiter: '16', treatmentStart: '2026-07-01' }).scenario, 1);
});

test('congenital syphilis: untreated, inadequate, and non-penicillin treatment are Scenario 2', () => {
  for (const t of ['none', 'inadequate', 'non-penicillin']) assert.equal(cs({ ...CS_BASE, maternalTreatment: t }).scenario, 2);
});

test('congenital syphilis: treatment before pregnancy with a low stable titer is Scenario 4', () => {
  const r = cs({ ...CS_BASE, maternalTreatment: 'penicillin-before', maternalLowStable: 'yes' });
  assert.equal(r.scenario, 4);
  const notStable = cs({ ...CS_BASE, maternalTreatment: 'penicillin-before', maternalLowStable: 'no' });
  assert.equal(notStable.scenario, null);
});

test('congenital syphilis: doses are 50,000 units/kg from the weight', () => {
  const r = cs({ ...CS_BASE, treatmentStart: '2026-08-07' });
  assert.match(r.regimens[0], /160,000 units/);
  assert.match(r.regimens[0], /every 12 hours for the first 7 days of life, then every 8 hours/);
  const noWeight = cs({ ...CS_BASE, weightKg: '', treatmentStart: '2026-08-07' });
  assert.match(noWeight.regimens[0], /50,000 units\/kg/);
  assert.ok(noWeight.weightNote);
});

test('congenital syphilis: impossible dates are refused', () => {
  assert.equal(cs({ ...CS_BASE, treatmentStart: '2026-09-10' }).valid, false);
  assert.equal(cs({ ...CS_BASE, treatmentStart: '2026-02-31' }).valid, false);
  assert.equal(cs({ ...CS_BASE, treatmentStart: '' }).valid, false);
});

// --- Hepatitis B ------------------------------------------------------------

test('hbv: isolated anti-HBc prints all four meanings and is not immunity', () => {
  const r = hbv({ hbsag: 'negative', antiHbc: 'positive', igmAntiHbc: 'not-done', antiHbs: 'negative' });
  assert.equal(r.interpretation, 'isolated-anti-hbc');
  assert.equal(r.possibilities.length, 4);
  assert.match(r.band, /not immunity/);
});

test('hbv: with anti-HBs not done the panel never prints "immune"', () => {
  for (const c of ['positive', 'negative', 'not-done']) {
    const r = hbv({ hbsag: 'negative', antiHbc: c, igmAntiHbc: 'negative', antiHbs: 'not-done' });
    assert.doesNotMatch(r.band + ' ' + r.bandLabel, /\bimmune\b/i, `anti-HBc ${c}`);
    assert.ok(r.cannotTell);
  }
});

test('hbv: the five named patterns from the CDC table', () => {
  assert.equal(hbv({ hbsag: 'negative', antiHbc: 'negative', igmAntiHbc: 'negative', antiHbs: 'negative' }).interpretation, 'susceptible');
  assert.equal(hbv({ hbsag: 'negative', antiHbc: 'negative', igmAntiHbc: 'negative', antiHbs: 'positive' }).interpretation, 'immune-vaccine');
  assert.equal(hbv({ hbsag: 'negative', antiHbc: 'positive', igmAntiHbc: 'negative', antiHbs: 'positive' }).interpretation, 'immune-natural');
  assert.equal(hbv({ hbsag: 'positive', antiHbc: 'positive', igmAntiHbc: 'positive', antiHbs: 'negative' }).interpretation, 'acute');
  assert.equal(hbv({ hbsag: 'positive', antiHbc: 'positive', igmAntiHbc: 'negative', antiHbs: 'negative' }).interpretation, 'chronic');
});

test('hbv: a blank marker is not a negative', () => {
  assert.equal(hbv({ hbsag: 'negative', antiHbc: 'negative', antiHbs: 'positive' }).valid, false);
});

// --- Hepatitis C ------------------------------------------------------------

test('hcv: a reactive antibody with RNA not done is never a verdict', () => {
  for (const recent of ['yes', 'no']) {
    const r = hcv({ antibody: 'reactive', rna: 'not-done', recentExposure: recent });
    assert.equal(r.interpretation, 'rna-needed');
    assert.doesNotMatch(r.band + ' ' + r.bandLabel, /infected/i);
  }
});

test('hcv: RNA decides current infection', () => {
  assert.equal(hcv({ antibody: 'reactive', rna: 'detected', recentExposure: 'no' }).interpretation, 'current');
  assert.equal(hcv({ antibody: 'reactive', rna: 'not-detected', recentExposure: 'no' }).interpretation, 'no-current');
});

test('hcv: after a recent exposure a nonreactive antibody does not exclude early infection', () => {
  const r = hcv({ antibody: 'nonreactive', rna: 'not-done', recentExposure: 'yes' });
  assert.equal(r.interpretation, 'window');
  assert.match(r.nextStep, /RNA/);
  assert.equal(hcv({ antibody: 'nonreactive', rna: 'not-done', recentExposure: 'no' }).interpretation, 'no-antibody');
});

// --- CDPH adult TB risk -----------------------------------------------------

const TB_NO = { symptoms: 'no', country: 'no', immunosuppression: 'no', contact: 'no', congregate: 'no' };

test('ca tb: any one of the four boxes means test', () => {
  for (const k of ['country', 'immunosuppression', 'contact', 'congregate']) {
    assert.equal(catb({ ...TB_NO, [k]: 'yes' }).testLtbi, true, k);
  }
  assert.equal(catb(TB_NO).testLtbi, false);
});

test('ca tb: symptoms route to an active-disease workup, and a blank box is not a no', () => {
  assert.equal(catb({ ...TB_NO, symptoms: 'yes' }).testLtbi, null);
  assert.equal(catb({ ...TB_NO, contact: '' }).valid, false);
});

test('ca tb: the steroid threshold is per day, and the note says the form got it wrong', () => {
  assert.match(STEROID_NOTE, /15 mg\/kg\/day/);
  assert.match(STEROID_NOTE, /15 mg per DAY/);
});

// --- LTBI regimen dosing ----------------------------------------------------

const LT = { pregnant: 'no', hiv: 'negative' };

test('ltbi: a 60 kg adult on 3HP gets rifapentine 900 mg and isoniazid 900 mg', () => {
  const r = ltbi({ ...LT, regimen: '3HP', weightKg: 60, ageYears: 35 });
  assert.match(r.doses[0], /Isoniazid 900 mg/);
  assert.match(r.doses[1], /Rifapentine 900 mg/);
});

test('ltbi: a 30 kg 10-year-old gets isoniazid by the 25 mg/kg rule', () => {
  assert.deepEqual(isoniazid3hpDose(30, 10), { perKg: 25, dose: 750, capped: false });
  assert.equal(rifapentineDose(30), 600);
});

test('ltbi: 3HP rounds up to 50 mg and caps at 900; rifapentine bands', () => {
  assert.equal(isoniazid3hpDose(47, 40).dose, 750); // 705 -> 750
  assert.equal(isoniazid3hpDose(90, 40).dose, 900);
  assert.equal(rifapentineDose(9.9), null);
  assert.equal(rifapentineDose(14.0), 300);
  assert.equal(rifapentineDose(14.1), 450);
  assert.equal(rifapentineDose(49.9), 750);
  assert.equal(rifapentineDose(50), 900);
});

test('ltbi: 3HP is not recommended in pregnancy or under 2', () => {
  assert.equal(ltbi({ ...LT, regimen: '3HP', weightKg: 60, ageYears: 30, pregnant: 'yes' }).recommended, false);
  assert.equal(ltbi({ ...LT, regimen: '3HP', weightKg: 11, ageYears: 1 }).recommended, false);
});

test('ltbi: 4R and 3HR cap at 600 and 300 mg', () => {
  assert.match(ltbi({ ...LT, regimen: '4R', weightKg: 80, ageYears: 40 }).doses[0], /Rifampin 600 mg/);
  const hr = ltbi({ ...LT, regimen: '3HR', weightKg: 80, ageYears: 40 });
  assert.match(hr.doses[0], /Isoniazid 300 mg/);
  assert.match(hr.doses[1], /Rifampin 600 mg/);
});

test('ltbi: ages 12 to 17 get both adult and child doses rather than an invented cut', () => {
  const r = ltbi({ ...LT, regimen: '4R', weightKg: 45, ageYears: 15 });
  assert.equal(r.doses.length, 2);
  assert.ok(r.cautions.some((c) => /without an age cut/.test(c)));
});

test('ltbi: rifamycin interactions are flagged, and isoniazid alone is called the alternative', () => {
  const r = ltbi({ ...LT, regimen: '3HP', weightKg: 60, ageYears: 35, hiv: 'hiv-art' });
  assert.ok(r.cautions.some((c) => /antiretrovirals/.test(c)));
  assert.ok(r.cautions.some((c) => /hormonal contraceptives/.test(c)));
  const h = ltbi({ ...LT, regimen: '9H', weightKg: 60, ageYears: 35, frequency: 'daily' });
  assert.ok(h.cautions.some((c) => /alternative, not the preference/.test(c)));
  assert.match(h.band, /270 doses/);
});

test('ltbi: an impossible weight is refused', () => {
  assert.equal(ltbi({ ...LT, regimen: '3HP', weightKg: 1e308, ageYears: 35 }).valid, false);
});
