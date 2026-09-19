// spec-v1401 Part A: prevention after exposure, and arrival screening.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { npep2025 as np } from '../../lib/npep-2025-v1401.js';
import { doxyPep as dx } from '../../lib/doxy-pep-v1401.js';
import { strongyloidesPresumptive as sg } from '../../lib/strongyloides-presumptive-v1401.js';

const SEX = { route: 'sexual', risk: 'yes', prep: 'none' };

test('npep: 80 hours is not recommended, with the testing and PrEP pathway -- never a blank', () => {
  const r = np({ ...SEX, hours: '80', source: 'hiv-viremic' });
  assert.equal(r.decision, 'not-recommended');
  assert.match(r.steps.join(' '), /Test for HIV now/);
  assert.match(r.steps.join(' '), /PrEP/);
});

test('npep: a suppressed source prints the 2025 statement, not a bare no', () => {
  const r = np({ ...SEX, hours: '10', source: 'hiv-suppressed' });
  assert.equal(r.decision, 'not-routine');
  assert.match(r.band, /not expected to transmit HIV sexually/);
  assert.match(r.whatsNew, /2025/);
  assert.equal(np({ route: 'injection', risk: 'yes', prep: 'none', hours: '10', source: 'hiv-suppressed' }).decision, 'case-by-case');
});

test('npep: viremic source is recommended with the preferred regimen; PrEP taken as directed is not generally', () => {
  const r = np({ ...SEX, hours: '12', source: 'hiv-viremic' });
  assert.equal(r.decision, 'recommended');
  assert.match(r.regimen, /bictegravir/);
  assert.match(r.band, /within the ideal 24 hours/);
  assert.equal(np({ ...SEX, prep: 'consistent', hours: '12', source: 'hiv-viremic' }).decision, 'not-generally');
  assert.equal(np({ ...SEX, prep: 'gap', hours: '12', source: 'hiv-viremic' }).decision, 'recommended');
  assert.equal(np({ ...SEX, hours: '' }).valid, false);
});

test('doxy-pep: MSM or TGW with an STI in 12 months -- offer; others -- no CDC recommendation', () => {
  const r = dx({ population: 'msm-tgw', recentSti: 'yes' });
  assert.equal(r.offer, true);
  assert.match(r.dose, /200 mg/);
  assert.equal(dx({ population: 'other' }).offer, null);
  assert.equal(dx({ population: 'msm-tgw' }).valid, false);
});

test('strongyloides: Cameroonian origin with a steroid plan -- blood smear first, never ivermectin up front', () => {
  const r = sg({ region: 'loa', overseas: 'no', pregnant: 'no', steroids: 'yes', weightKg: '70' });
  assert.equal(r.action, 'smear-first');
  assert.equal(r.dose, null);
  assert.match(r.band, /10 a\.m\. and 2 p\.m\./);
  assert.match(r.steroidNote, /hyperinfection/);
});

test('strongyloides: presumptive dose from weight; pregnancy and under 15 kg test instead', () => {
  assert.match(sg({ region: 'asia', overseas: 'no', pregnant: 'no', steroids: 'no', weightKg: '62' }).dose, /12\.4 mg/);
  assert.equal(sg({ region: 'latam', overseas: 'no', pregnant: 'yes', steroids: 'no', weightKg: '60' }).action, 'test');
  assert.equal(sg({ region: 'asia', overseas: 'no', pregnant: 'no', steroids: 'no', weightKg: '12' }).action, 'test');
  const done = sg({ region: 'asia', overseas: 'yes', pregnant: 'no', steroids: 'yes', weightKg: '62' });
  assert.match(done.steroidNote, /hyperinfection/);
});
