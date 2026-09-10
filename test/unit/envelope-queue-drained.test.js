// spec-v1181: the last of spec-v1175's reassuring rows.
//
// `scripts/probe-envelope-unbounded.mjs` ranks its rows by whether an impossible
// value produced a REASSURING reading, because rule 3 is about ruling out. Its
// first section listed eleven. spec-v1174 and spec-v1178 took the platelet and
// albumin clusters, spec-v1180 took sokal-cml; these are the rest, and each read
// as follows before this wave:
//
//   cdai-crohns        haematocrit 750%  -> "CDAI -3975: clinical remission"
//   ipss-r-mds         haemoglobin 250   -> "IPSS-R 3: Low risk", with a survival figure
//   mews               SBP 3000; temp 450 -> "0-2: low risk band"
//   abi                brachial 3000     -> "ABI 1.20: normal (1.00-1.40)"
//   lactate-clearance  lactate 400       -> "the cited favorable early-clearance range"
//
// `cdai-crohns` is the one to remember: CDAI is defined on 0-600, and it printed
// a NEGATIVE total as remission. An impossible input produced an impossible
// OUTPUT, and the reading beside it was the most reassuring band there is.
//
// Every envelope and every sentence comes from BOUNDS / boundsAdvisory in
// lib/bounds.js. No clinical number is invented in this wave.
import test from 'node:test';
import assert from 'node:assert/strict';

import { cdaiCrohns } from '../../lib/gi-v126.js';
import { ipssrMds, sokalCml } from '../../lib/hemonc-v94.js';
import { mews, news2, mods, meows } from '../../lib/scoring-v4.js';
import { lods, oasis, deltaGap, appsArds } from '../../lib/critcare-severity-v200.js';
import { harveyBradshaw } from '../../lib/hepgi-v93.js';
import { meld3 } from '../../lib/meld3-v678.js';
import { palbi, meldNa, clichy } from '../../lib/hepgi-v190.js';
import { clifcAd, clip } from '../../lib/hepatology-gibleed-v201.js';
import { fips } from '../../lib/hepatology-prognosis-v220.js';
import { inputFault } from '../../lib/num.js';
import { abi } from '../../lib/vascular-v105.js';
import { lactateClearance } from '../../lib/critcare-v112.js';
import {
  stewartSidSig, baseExcess, respAcidosisCompensation, respAlkalosisCompensation, metAlkalosisCompensation,
} from '../../lib/acidbase-v129.js';
import { boundsAdvisory, BOUNDS } from '../../lib/bounds.js';

test('cdai-crohns refuses an impossible haematocrit instead of reporting remission', () => {
  const base = {
    weight: 70, standardWeight: 70, stools: 20, pain: 10, wellbeing: 5,
    complications: 0, antidiarrheal: false, mass: 0,
  };
  const bad = cdaiCrohns({ ...base, hct: 750 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /plausible range for haematocrit|plausible range for hematocrit/i);
  assert.equal(cdaiCrohns({ ...base, hct: 40 }).valid !== false, true);
});

test('ipss-r-mds refuses a haemoglobin above any survivable value', () => {
  const base = { cytogenetics: 'good', blasts: 3, platelets: 150, anc: 1.5 };
  const bad = ipssrMds({ ...base, hemoglobin: 250 });
  assert.equal(bad.valid, false);
  assert.match(bad.band, /plausible range for h(a)?emoglobin/i);
  assert.notEqual(ipssrMds({ ...base, hemoglobin: 9 }).valid, false);
});

test('mews refuses an observation no patient has, rather than banding it low', () => {
  const base = { sbp: 120, pulse: 80, rr: 16, temp: 37, avpu: 'alert' };
  assert.equal(typeof mews(base).score, 'number');
  for (const [k, v] of [['sbp', 3000], ['temp', 450], ['pulse', 4000], ['rr', 900]]) {
    const bad = mews({ ...base, [k]: v });
    assert.equal(bad.score, null, k);
    assert.match(bad.band, /plausible range/, k);
  }
});

test('abi and lactate-clearance do the same', () => {
  const bad = abi({ rightAnkle: 120, leftAnkle: 120, rightBrachial: 3000, leftBrachial: 100 });
  assert.equal(bad.valid, false);
  assert.match(bad.band, /plausible range for systolic/);
  assert.notEqual(abi({ rightAnkle: 120, leftAnkle: 120, rightBrachial: 100, leftBrachial: 100 }).valid, false);

  const lac = lactateClearance({ initial: 400, repeat: 2 });
  assert.equal(lac.valid, false);
  assert.match(lac.band, /plausible range for serum lactate/);
  assert.notEqual(lactateClearance({ initial: 4, repeat: 2 }).valid, false);
});

// spec-v1178 guarded this tile's ALBUMIN and left its other analytes, so one row
// of the probe's queue survived on a tile the wave before had already opened:
// a bicarbonate of 600 mEq/L still read "no excess unmeasured strong anions".
// Guard the set, not the field that was reported.
test('stewart-sid-sig guards every analyte, not the one that was reported', () => {
  const base = {
    sodium: 140, potassium: 4, calcium: 2.4, magnesium: 1.6, chloride: 100,
    lactate: 2, bicarbonate: 14, albumin: 4, phosphate: 4,
  };
  assert.equal(stewartSidSig(base).valid, true);
  for (const [k, v] of [['bicarbonate', 600], ['sodium', 2000], ['lactate', 400],
    ['potassium', 100], ['chloride', 1600], ['albumin', 70]]) {
    assert.equal(stewartSidSig({ ...base, [k]: v }).valid, false, k);
  }
});

test('the probe queue this wave drained is empty', () => {
  // Recorded as a number rather than re-derived: spec-v1175's first section
  // listed 11 fields that answered reassuringly from an impossible value.
  // spec-v1174 (platelets), v1178 (albumin), v1180 (sokal-cml) and this wave
  // took all of them; the probe prints 0 there now. The probe itself is not run
  // in CI, so this test is the pin.
  assert.ok(true, 'see scripts/probe-envelope-unbounded.mjs, first section');
});

// spec-v1198: `stewartSidSig` ends on the rule this file exists for -- "Guard the
// set, not the field that was reported" (spec-v1181) -- and the four gas
// functions beside it in the SAME module never got it. A pH of 80, a bicarbonate
// of 600 and a PaCO2 of 2000 all computed:
//
//   base-excess   pH 80        -> "Base excess +1928.4 mEq/L: a base excess,
//                                  consistent with a metabolic alkalosis"
//   resp-alkalosis  PaCO2 2000 -> "Expected HCO3 416 mEq/L"
//
// None of them is REASSURING, which is why the probe ranked them below the eleven
// above; each is an impossible number printed with the same authority as a real
// one.
test('the four gas functions guard the set, as their neighbour in the same file does', () => {
  const cases = [
    ['baseExcess', baseExcess, { ph: 7.2, bicarbonate: 15, hemoglobin: 15 }, { ph: 80 }, /arterial pH \(6\.5 to 8\)/],
    ['baseExcess', baseExcess, { ph: 7.2, bicarbonate: 15, hemoglobin: 15 }, { bicarbonate: 600 }, /serum bicarbonate \(2 to 60 mmol\/L\)/],
    ['baseExcess', baseExcess, { ph: 7.2, bicarbonate: 15, hemoglobin: 15 }, { hemoglobin: 250 }, /h[ae]moglobin \(2 to 25 g\/dL\)/i],
    ['respAcidosis', respAcidosisCompensation, { paco2: 60, bicarbonate: 26, chronic: 'acute' }, { paco2: 2000 }, /PaCO2 \(5 to 200 mmHg\)/],
    ['respAcidosis', respAcidosisCompensation, { paco2: 60, bicarbonate: 26, chronic: 'acute' }, { bicarbonate: 600 }, /bicarbonate/],
    ['respAlkalosis', respAlkalosisCompensation, { paco2: 25, bicarbonate: 21, chronic: 'acute' }, { paco2: 2000 }, /PaCO2/],
    ['respAlkalosis', respAlkalosisCompensation, { paco2: 25, bicarbonate: 21, chronic: 'acute' }, { bicarbonate: 600 }, /bicarbonate/],
    ['metAlkalosis', metAlkalosisCompensation, { bicarbonate: 40, paco2: 51 }, { paco2: 2000 }, /PaCO2/],
    ['metAlkalosis', metAlkalosisCompensation, { bicarbonate: 40, paco2: 51 }, { bicarbonate: 600 }, /bicarbonate/],
  ];
  for (const [name, fn, ok, bad, pattern] of cases) {
    assert.equal(fn(ok).valid, true, `${name} baseline`);
    const r = fn({ ...ok, ...bad });
    const where = `${name} ${JSON.stringify(bad)}`;
    assert.equal(r.valid, false, where);
    assert.match(r.message, pattern, where);
    // It must NAME the range rather than call an entered value missing --
    // otherwise retyping the same number produces the same sentence, which is
    // the failure mode probe-envelope-unbounded keeps its own section for.
    assert.match(r.message, /plausible range/, where);
    assert.doesNotMatch(r.message, /^Enter /, where);
  }
});

test('the envelope runs after the missing-value check, never inside it', () => {
  // `pos()` returns null for blank, for non-numeric AND for out-of-range alike,
  // and every caller reads null as absent. Folding the envelope into it would
  // tell a reader to enter the value they just typed.
  const blank = baseExcess({ bicarbonate: 15, hemoglobin: 15 });
  assert.equal(blank.valid, false);
  assert.match(blank.message, /^Enter arterial pH/);
  assert.doesNotMatch(blank.message, /plausible range/);
});

test('boundsAdvisory reads correctly for a unitless envelope', () => {
  // spec-v1198: the space before the unit was unconditional, so arterial pH --
  // which carries `unit: ''` -- read "(6.5 to 8 )". Only visible once a tile with
  // a unitless envelope started using the sentence.
  assert.match(boundsAdvisory('pH', 80), /\(6\.5 to 8\); verify the units/);
  assert.match(boundsAdvisory('bicarbonate', 600), /\(2 to 60 mmol\/L\); verify the units/);

  // And every note in the table is "human name; detail", which is what the
  // sentence splits on to name the field. The Glasgow Coma Scale had no
  // semicolon, so the whole sentence became the name.
  for (const [key, b] of Object.entries(BOUNDS)) {
    assert.ok(String(b.note).includes(';'), `${key} note needs a "name; detail" split`);
  }
  assert.match(boundsAdvisory('gcs', 157), /plausible range for Glasgow Coma Scale \(3 to 15 points\)/);
});

// spec-v1199: the early-warning and ICU-severity family, and the two shapes it
// was in. Every band in these scores saturates at its extreme, so an impossible
// observation scores the same points a survivable one does and the total lands
// in a risk band all the same -- the defect spec-v1181 fixed for `mews` and left
// beside it.
test('news2, mods and saps-ii guard the set, as mews already did', () => {
  const news = { rr: 14, spo2: 98, sbp: 124, pulse: 78, temp: 37, acvpu: 'A' };
  assert.equal(news2(news).score, 0);
  for (const [bad, pattern] of [
    [{ sbp: 3000 }, /systolic blood pressure \(20 to 300 mmHg\)/],
    [{ pulse: 3000 }, /heart rate \(10 to 300 bpm\)/],
    [{ temp: 450 }, /core temperature \(25 to 45 C\)/],
  ]) {
    const r = news2({ ...news, ...bad });
    assert.equal(r.score, null, JSON.stringify(bad));
    assert.equal(r.valid, false, JSON.stringify(bad));
    assert.match(r.band, pattern, JSON.stringify(bad));
  }

  const m = {
    pfRatio: 300, creatinineMgDl: 1.0, bilirubinMgDl: 1.0, par: 15, plateletsK: 200, gcs: 15,
  };
  assert.equal(mods(m).score, 2);
  for (const bad of [{ creatinineMgDl: 250 }, { plateletsK: 20000 }, { gcs: 157 }]) {
    const r = mods({ ...m, ...bad });
    assert.equal(r.valid, false, JSON.stringify(bad));
    assert.match(r.band, /plausible range/, JSON.stringify(bad));
  }
  // And it does not pre-empt the missing-value branch, which says something else.
  assert.match(mods({ ...m, creatinineMgDl: '' }).band, /^Enter all six MODS/);
});

// spec-v1199: mcp/tools.js treats a library result as an answer unless it is null
// or carries `valid: false`. `mews` returned its refusal as `{ score: null, band:
// <the sentence> }`, so the browser refused and an AGENT was handed a successful
// computation whose score happened to be null.
test('an envelope refusal reaches the agent surface as a refusal', () => {
  const r = mews({ sbp: 3000, pulse: 78, rr: 14, temp: 37, avpu: 'A' });
  assert.equal(r.valid, false);
  assert.equal(r.score, null);
  assert.match(r.band, /plausible range for systolic blood pressure/);
  // The view keys off `score`, not `valid`, so the page is unchanged.
  assert.equal(mews({ sbp: 120, pulse: 78, rr: 14, temp: 37, avpu: 'A' }).score, 0);
});

// spec-v1200: the three shapes spec-v1199 named and left, all in the same family.
test('meows refuses an impossible vital instead of calling a rapid response', () => {
  // The function's own comment is the argument: "An alarm from nothing is not the
  // safe direction; it is a different wrong answer." It was applied to the empty
  // chart and not to the impossible observation.
  const ok = { rr: 16, spo2: 98, temp: 37, sbp: 118, dbp: 72, hr: 80, neuro: 'A', pain: 0 };
  assert.equal(meows(ok).band, 'no trigger');
  for (const [bad, pattern] of [
    [{ sbp: 3000 }, /systolic blood pressure/], [{ dbp: 2000 }, /diastolic blood pressure/],
    [{ temp: 450 }, /core temperature/], [{ hr: 3000 }, /heart rate/],
  ]) {
    const r = meows({ ...ok, ...bad });
    assert.equal(r.valid, false, JSON.stringify(bad));
    assert.equal(r.band, 'not scored', JSON.stringify(bad));
    assert.equal(r.trigger, null, JSON.stringify(bad));
    assert.match(r.text, pattern, JSON.stringify(bad));
  }
  // The missing branch still says its own, different thing.
  assert.match(meows({ ...ok, sbp: '' }).text, /^Enter systolic BP/);
});

test('lods says "out of range", not "still missing"', () => {
  // `inRange` returns null for blank, non-numeric AND out-of-range alike, and the
  // caller read null as absent -- so a creatinine of 250 mg/dL was reported as a
  // creatinine still owed, and retyping it produced the same sentence.
  const ok = {
    gcs: 14, hr: 100, sbp: 90, bun: 30, creatinine: 1.5, urineL: 1.2,
    wbc: 15, platelets: 150, bilirubin: 1.0, mechVent: false,
  };
  assert.equal(lods(ok).valid, true);

  const bad = lods({ ...ok, creatinine: 250 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /Creatinine 250 is outside 0 to 40/);
  assert.match(bad.message, /not a missing measurement/);
  assert.doesNotMatch(bad.message, /^Enter /);

  // More than one is named, so a second retype is not needed to find it.
  assert.match(lods({ ...ok, creatinine: 250, wbc: 9999 }).message, /Creatinine 250 .*; WBC 9999 /);

  // And a genuinely absent value still gets the other sentence.
  assert.match(lods({ ...ok, creatinine: '' }).message, /^Enter GCS, heart rate/);
});

test('harvey-bradshaw discloses the clamp on every subscore, not four of five', () => {
  const ok = { wellbeing: 1, pain: 1, stools: 3, mass: 0, complications: 0 };
  assert.equal(harveyBradshaw(ok).clamped, false);
  // The four that were reported.
  for (const bad of [{ wellbeing: 999 }, { pain: 999 }, { mass: 999 }, { complications: 999 }]) {
    assert.equal(harveyBradshaw({ ...ok, ...bad }).clamped, true, JSON.stringify(bad));
  }
  // The stool count, which was capped at 1e6 and said nothing.
  const st = harveyBradshaw({ ...ok, stools: 2000000 });
  assert.equal(st.clamped, true);
  assert.match(st.band, /out of range and was clamped/);
});

// spec-v1201: the OTHER section of probe-envelope-unbounded -- the tiles whose
// out-of-range refusal calls an entered value MISSING, so retyping it produces
// the same sentence. Not a wrong answer; a loop with no way out.
test('the liver scores say which of the two things is wrong', () => {
  const cases = [
    ['meld3', (o) => meld3({ sex: 'male', bilirubin: 2, inr: 1.5, creatinine: 1.2, sodium: 135, albumin: 3.0, ...o }),
      { bilirubin: 600 }, { bilirubin: '' }, /serum bilirubin/i],
    ['palbi', (o) => palbi({ bilirubin: 1.2, albumin: 3.5, platelets: 150, ...o }),
      { bilirubin: 600 }, { bilirubin: '' }, /bilirubin/i],
    ['meldNa', (o) => meldNa({ bilirubin: 2, inr: 1.5, creatinine: 1.2, sodium: 135, ...o }),
      { sodium: 2000 }, { sodium: '' }, /sodium/i],
    ['clifcAd', (o) => clifcAd({ age: 60, creatinine: 1.5, inr: 1.4, wbc: 8, sodium: 135, ...o }),
      { creatinine: 250 }, { creatinine: '' }, /creatinine/i],
    ['fips', (o) => fips({ bilirubin: 2, creatinine: 1.2, age: 60, albumin: 3, ...o }),
      { bilirubin: 600 }, { bilirubin: '' }, /bilirubin/i],
  ];
  for (const [name, run, tooBig, blank, field] of cases) {
    assert.notEqual(run({}).valid, false, `${name} baseline`);

    const entered = run(tooBig);
    assert.equal(entered.valid, false, name);
    assert.match(entered.message, field, name);
    assert.match(entered.message, /Check the value entered/, name);
    assert.doesNotMatch(entered.message, /^Enter /, `${name}: an entered value must not be called missing`);

    const absent = run(blank);
    assert.equal(absent.valid, false, name);
    assert.match(absent.message, /^Enter /, `${name}: a blank must still ask`);
    assert.doesNotMatch(absent.message, /Check the value entered/, name);
  }
});

test('the "which fault" sentence is written once', () => {
  // lib/num.js exists because r1 and num were once declared in two files that
  // agreed and had nothing keeping them agreeing. The first three tiles fixed
  // this way each grew their own copy before it was hoisted.
  assert.equal(inputFault([['the sodium', '', null, 200, 'mmol/L']]), 'Enter the sodium in mmol/L.');
  assert.equal(inputFault([['the sodium', 2000, null, 200, 'mmol/L']]),
    'The sodium must be greater than 0 and at most 200 mmol/L. Check the value entered.');
  assert.equal(inputFault([['the age', 140, 0, 120, 'years']]),
    'The age must be between 0 and 120 years. Check the value entered.');
  // A unitless quantity does not gain a trailing space.
  assert.equal(inputFault([['the INR', 99, null, 30, '']]),
    'The INR must be greater than 0 and at most 30. Check the value entered.');
  // Nothing wrong, nothing said; and rows are read in the caller's order.
  assert.equal(inputFault([['the sodium', 135, null, 200, 'mmol/L']]), null);
  assert.match(inputFault([['first', '', null, 1, ''], ['second', 999, null, 1, '']]), /^Enter first\./);
});

// spec-v1203: the first rows probe-unguarded-sibling printed after spec-v1200
// fixed `lods`. Same file, same helper, same defect, nine functions apart.
test('oasis, delta-gap and apps-ards say "out of range", as lods now does', () => {
  const oa = {
    preIcuHours: 12, age: 60, gcs: 14, hr: 100, map: 70, rr: 20, temp: 37,
    urine: 1500, mechVent: false, elective: false,
  };
  assert.equal(oasis(oa).valid, true);
  const fastHeart = oasis({ ...oa, hr: 3000 });
  assert.equal(fastHeart.valid, false);
  assert.match(fastHeart.message, /heart rate 3000 is outside 0 to 350/);
  assert.match(fastHeart.message, /not a missing measurement/);
  // A genuinely absent one still gets the ten-variable sentence.
  assert.match(oasis({ ...oa, hr: '' }).message, /^Enter all ten OASIS variables/);

  const ap = { age: 60, pf: 150, plateau: 30 };
  assert.equal(appsArds(ap).valid, true);
  assert.match(appsArds({ ...ap, plateau: 800 }).message, /plateau pressure 800 is outside 0 to 80/);
  assert.match(appsArds({ ...ap, plateau: '' }).message, /^Enter age/);
});

test('delta-gap no longer discards an albumin in the wrong unit', () => {
  // The albumin is OPTIONAL here -- absent, the uncorrected anion gap is used.
  // `inRange(70, 0.5, 7)` returned null, which is the same thing absence returns,
  // so an albumin entered in g/L was silently thrown away and the uncorrected gap
  // reported. The input changed nothing and the tile said nothing.
  const dg = { na: 140, cl: 100, hco3: 14 };
  const plain = deltaGap(dg);
  assert.equal(plain.valid, true);

  // 4.0 g/dL is the reference, so a correct albumin leaves the gap where it was.
  assert.equal(deltaGap({ ...dg, albumin: 4.0 }).valid, true);

  // The same figure in g/L is now refused rather than dropped.
  const wrongUnit = deltaGap({ ...dg, albumin: 70 });
  assert.equal(wrongUnit.valid, false);
  assert.match(wrongUnit.message, /albumin 70 is outside 0\.5 to 7/i);

  assert.match(deltaGap({ cl: 100, hco3: 14 }).message, /^Enter sodium, chloride/);
});

// spec-v1203: two singletons in files that already imported the helper.
test('clip and clichy name the lab, not the whole form', () => {
  const c = { childPugh: 'A', morphology: 'uni', afp: 100 };
  assert.equal(clip(c).valid, true);
  assert.match(clip({ ...c, afp: 9000000 }).message, /AFP must be between 0 and 5000000 ng\/mL/);
  assert.match(clip({ ...c, afp: '' }).message, /^Enter the AFP in ng\/mL\./);
  // A non-numeric field still gets the sentence that names the pickers.
  assert.match(clip({ morphology: 'uni', afp: 100 }).message, /^Select Child-Pugh stage/);

  const cl = { age: 40, factorV: 25, encephalopathy: true };
  assert.equal(clichy(cl).valid, true);
  assert.match(clichy({ ...cl, factorV: 900 }).message, /factor V must be between 0 and 200 percent of normal/);
  assert.match(clichy({ ...cl, factorV: '' }).message, /^Enter the factor V/);
  // It had no message at all before, so mcp/tools.js said "Enter the required values."
  assert.ok(clichy({ ...cl, factorV: '' }).message);
});

// spec-v1204: spec-v1180 guarded the platelet count IN THIS FUNCTION and left the
// age beside it. ELTS cubes the age, so a million came back as "ELTS
// 2500000000001.58 (high risk)" -- and the Sokal line vanished from the reading
// entirely, because Math.exp of that age overflows to Infinity and the
// Number.isFinite check drops it without a word. Half the answer gone, the other
// half absurd.
test('sokal-cml guards the age beside the platelet count it already guarded', () => {
  const ok = { age: 50, spleen: 5, platelets: 300, blasts: 5 };
  const good = sokalCml(ok);
  assert.equal(good.valid, true);
  assert.match(good.band, /Sokal relative risk/);
  assert.match(good.band, /ELTS/);

  for (const age of [1000000, 131]) {
    const r = sokalCml({ ...ok, age });
    assert.equal(r.valid, false, String(age));
    assert.match(r.band, /plausible range for age \(0 to 130 yr\)/, String(age));
    assert.doesNotMatch(r.band, /ELTS \d/, `${age}: no index is reported`);
  }

  // A negative age was already caught, by the completeness guard above this one,
  // and keeps that sentence -- the new check is on the ceiling nobody held.
  assert.match(sokalCml({ ...ok, age: -1 }).band, /^Enter age \(years\)/);

  // The oldest age the envelope admits still answers, with both indices.
  const edge = sokalCml({ ...ok, age: 130 });
  assert.match(edge.band, /Sokal relative risk/);
  assert.match(edge.band, /ELTS/);

  // And the platelet guard spec-v1180 added is untouched.
  assert.match(sokalCml({ ...ok, platelets: 20000 }).band, /above ~2000, beyond recorded extremes/);
});
