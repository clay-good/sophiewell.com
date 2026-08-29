import test from 'node:test';
import assert from 'node:assert/strict';
import { priapismGas as pg } from '../../lib/priapism-gas-v859.js';

const ISCHEMIC = { po2: 12, pco2: 78, ph: 7.05 };
const NON = { po2: 95, pco2: 35, ph: 7.4 };

test('priapism: the ischemic gas set', () => {
  const r = pg(ISCHEMIC);
  assert.equal(r.valid, true);
  assert.equal(r.type, 'ischemic');
  assert.equal(r.ischemicGas, true);
  assert.equal(r.abnormal, true);
  assert.match(r.bandLabel, /^Ischemic/);
});

test('priapism: the non-ischemic gas set', () => {
  const r = pg(NON);
  assert.equal(r.type, 'non-ischemic');
  assert.equal(r.nonIschemicGas, true);
  assert.equal(r.abnormal, false);
  assert.equal(r.clockNote, null);
});

test('priapism: each gas threshold is exclusive at its edge', () => {
  assert.equal(pg({ po2: 29, pco2: 61, ph: 7.24 }).type, 'ischemic');
  assert.equal(pg({ po2: 30, pco2: 61, ph: 7.24 }).type, 'undetermined');
  assert.equal(pg({ po2: 29, pco2: 60, ph: 7.24 }).type, 'undetermined');
  assert.equal(pg({ po2: 29, pco2: 61, ph: 7.25 }).type, 'undetermined');
  assert.equal(pg({ po2: 91, pco2: 39, ph: 7.35 }).type, 'non-ischemic');
  assert.equal(pg({ po2: 90, pco2: 39, ph: 7.35 }).type, 'undetermined');
  assert.equal(pg({ po2: 91, pco2: 40, ph: 7.35 }).type, 'undetermined');
  assert.equal(pg({ po2: 91, pco2: 39, ph: 7.34 }).type, 'undetermined');
});

test('priapism: a trauma history does not classify the episode', () => {
  // The over-call this tile exists to prevent.
  const r = pg({ ...ISCHEMIC, trauma: 'yes' });
  assert.equal(r.type, 'ischemic');
  assert.match(r.traumaNote, /does not classify/);
});

test('priapism: a discordant gas is settled by the duplex, not guessed', () => {
  const mid = { po2: 60, pco2: 50, ph: 7.3 };
  const alone = pg(mid);
  assert.equal(alone.discordant, true);
  assert.equal(alone.type, 'undetermined');
  assert.equal(alone.treatedAsIschemic, true);
  assert.match(alone.discordantNote, /No duplex finding was entered/);

  assert.equal(pg({ ...mid, flow: 'absent' }).type, 'ischemic');
  assert.equal(pg({ ...mid, flow: 'normal' }).type, 'non-ischemic');
});

test('priapism: the gas outranks the duplex when both are given', () => {
  assert.equal(pg({ ...ISCHEMIC, flow: 'normal' }).type, 'ischemic');
  assert.equal(pg({ ...NON, flow: 'absent' }).type, 'non-ischemic');
});

test('priapism: the duplex alone can classify', () => {
  assert.equal(pg({ flow: 'absent' }).type, 'ischemic');
  assert.equal(pg({ flow: 'normal' }).type, 'non-ischemic');
});

test('priapism: the duration bands are the prognosis', () => {
  assert.match(pg({ ...ISCHEMIC, hours: 2 }).clockNote, /before an ischemic episode becomes a compartment syndrome/);
  assert.match(pg({ ...ISCHEMIC, hours: 4 }).clockNote, /compartment syndrome of the erectile tissue/);
  assert.match(pg({ ...ISCHEMIC, hours: 24 }).clockNote, /past the point where necrosis/);
  assert.match(pg({ ...ISCHEMIC, hours: 36 }).clockNote, /rarely preserved/);
  assert.match(pg(ISCHEMIC).clockNote, /so enter it/);
});

test('priapism: sickle cell care does not replace the local intervention', () => {
  assert.match(pg({ ...ISCHEMIC, sickle: 'yes' }).sickleNote, /must not delay or replace/);
  // Nothing to delay if it is not the ischemic type.
  assert.equal(pg({ ...NON, sickle: 'yes' }).sickleNote, null);
});

test('priapism: nothing entered is refused rather than graded', () => {
  const r = pg({});
  assert.equal(r.valid, false);
  assert.match(r.message, /corpus cavernosum/);
  assert.equal(pg({ po2: 12, pco2: 78 }).valid, false);
});

test('priapism: implausible values are refused', () => {
  assert.equal(pg({ ...ISCHEMIC, ph: 3 }).valid, false);
  assert.equal(pg({ ...ISCHEMIC, po2: 900 }).valid, false);
  assert.equal(pg({ ...ISCHEMIC, hours: -1 }).valid, false);
});

test('priapism: string inputs from the DOM behave like numbers', () => {
  assert.deepEqual(pg({ po2: '12', pco2: '78', ph: '7.05' }).type, 'ischemic');
});
