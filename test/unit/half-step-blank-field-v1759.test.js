// spec-v1759: an ordinal item, grade or count that the worked example leaves blank was scored (or answered past)
// at a half step. Each field now refuses x + 0.5 by name; a whole in-range value still answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { modifiedMarshall } from '../../lib/gi-v126.js';
import { piRads } from '../../lib/dermuro-v191.js';
import { guss } from '../../lib/scoring-v4.js';
import { psofa } from '../../lib/scoring-v6.js';
import { poseidon } from '../../lib/poseidon-v549.js';
import { mchatScore } from '../../lib/mchat-v862.js';
import { partdOpioidSafetyEdit } from '../../lib/partd-opioid-safety-edit-v1638.js';
import { deviceInfectionRate } from '../../lib/device-infection-rate-v1655.js';
import { suppositoryDisplacement } from '../../lib/suppository-displacement-v1629.js';

test('modified-marshall: the cardiovascular score refuses a half step', () => {
  const base = { pao2: 200, fio2: 100, creatinine: 2 };
  const r = modifiedMarshall({ ...base, cardiovascular: 2.5 });
  assert.equal(r.valid, false);
  assert.match(r.message, /cardiovascular score must be a whole number/);
  assert.equal(modifiedMarshall({ ...base, cardiovascular: 2 }).valid, true);
  assert.equal(modifiedMarshall(base).valid, true, 'blank stays not assessed');
});

test('pi-rads: the T2W score refuses a half step in either zone', () => {
  for (const zone of ['transition', 'peripheral']) {
    const r = piRads({ zone, dwi: 3, t2w: 3.5, dce: 'positive' });
    assert.equal(r.valid, false, zone);
    assert.match(r.message, /T2W score must be a whole number/);
  }
  assert.equal(piRads({ zone: 'transition', t2w: 3, dwi: 5 }).valid, true);
  assert.equal(piRads({ zone: 'transition', t2w: 6 }).valid, false, 'out of range refused');
});

test('guss: a gated solid subtest item refuses a half step', () => {
  // The liquid stage scores 4, so the solid stage is gated; its items were read past.
  const base = {
    vigilance: 1, coughClear: 1, salivaSwallow: 1, salivaNoDrool: 1, salivaNoVoiceChange: 1,
    semisolidSwallow: 2, semisolidNoCough: 1, semisolidNoDrool: 1, semisolidNoVoiceChange: 1,
    liquidSwallow: 1, liquidNoCough: 1, liquidNoDrool: 1, liquidNoVoiceChange: 1,
  };
  assert.throws(() => guss({ ...base, solidSwallow: 1.5 }), /solidSwallow must be integer 0-2/);
  for (const k of ['solidNoCough', 'solidNoDrool', 'solidNoVoiceChange']) {
    assert.throws(() => guss({ ...base, [k]: 0.5 }), new RegExp(`${k} must be integer 0 or 1`));
    assert.equal(guss({ ...base, [k]: 1 }).valid, true, k);
  }
  assert.equal(guss({ ...base, solidSwallow: 1 }).valid, true);
  assert.equal(guss(base).valid, true, 'blank stays not performed');
});

test('psofa: the vasoactive grade refuses a half step', () => {
  const base = { ageMonths: 24, pao2fio2: 250, vent: true, platelets: 120, bilirubin: 1.5, map: 50, gcs: 13, creatinine: 0.7 };
  assert.throws(() => psofa({ ...base, vasoactive: 2.5 }), /vasoactive grade must be a whole number/);
  assert.equal(typeof psofa({ ...base, vasoactive: 2 }).score, 'number');
});

test('poseidon: the antral follicle count refuses a half step', () => {
  const base = { age: 32, amh: 2, priorCycle: 'yes', oocytes: 6 };
  const r = poseidon({ ...base, afc: 4.5 });
  assert.equal(r.valid, false);
  assert.match(r.message, /antral follicle count must be a whole number/);
  assert.equal(poseidon({ ...base, afc: 4 }).valid, true);
});

test('mchat-rf: the Follow-Up score refuses a half step', () => {
  const items = {};
  for (let i = 1; i <= 20; i++) items[`item${i}`] = 'yes';
  Object.assign(items, { item2: 'no', item5: 'no', item12: 'no', item1: 'no', item3: 'no', item6: 'no' });
  const base = { ageMonths: 20, ...items };
  const r = mchatScore({ ...base, followUp: 1.5 });
  assert.equal(r.valid, false);
  assert.match(r.message, /Follow-Up score must be a whole number/);
  assert.equal(mchatScore({ ...base, followUp: 1 }).valid, true);
});

test('partd-opioid-safety-edit: the numbers of prescribers and pharmacies refuse a half step', () => {
  const base = {
    exemption: 'no-exemption', cumulativeMme: 120, daysSupply: 30, recentOpioidFill: 'yes',
    hardEdit200: 'no', benzodiazepine: 'no', duplicateLongActing: 'no',
  };
  for (const [k, word] of [['prescribers', 'prescribers'], ['pharmacies', 'pharmacies']]) {
    const r = partdOpioidSafetyEdit({ ...base, [k]: 2.5 });
    assert.equal(r.valid, false, k);
    assert.match(r.message, new RegExp(`number of opioid ${word} must be a whole number`));
    assert.equal(partdOpioidSafetyEdit({ ...base, [k]: 2 }).valid, true, k);
  }
});

test('device-infection-rate: the episodes of mechanical ventilation refuse a half step', () => {
  for (const device of ['central-line', 'ventilator']) {
    const r = deviceInfectionRate({ device, events: 5, deviceDays: 1850, episodes: 10.5 });
    assert.equal(r.valid, false, device);
    assert.match(r.message, /episodes of mechanical ventilation/);
    assert.equal(deviceInfectionRate({ device, events: 5, deviceDays: 1850, episodes: 10 }).valid, true, device);
  }
});

test('suppository-displacement: the batch number of units refuses a half step in either mode', () => {
  const cal = { mode: 'calibrate', blankWeight: 2, drugPerUnit: 0.3, medicatedWeight: 2.15 };
  const r = suppositoryDisplacement({ ...cal, units: 10.5 });
  assert.equal(r.valid, false);
  assert.match(r.message, /number of units must be a whole number/);
  assert.equal(suppositoryDisplacement({ ...cal, units: 10 }).valid, true);
  const batch = { mode: 'batch', definition: 'density', blankWeight: 2, drugPerUnit: 0.3, factor: 2 };
  assert.equal(suppositoryDisplacement({ ...batch, units: 10.5 }).valid, false);
  assert.equal(suppositoryDisplacement({ ...batch, units: 10 }).valid, true);
});
