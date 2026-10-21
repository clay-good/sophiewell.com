// spec-v1655: the six infection-prevention tools, against the worked examples their sources print.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nhsnSir } from '../../lib/nhsn-sir-v1655.js';
import { deviceUtilizationRatio as dur } from '../../lib/device-utilization-ratio-v1655.js';
import { deviceInfectionRate as rate } from '../../lib/device-infection-rate-v1655.js';
import { outbreakAttackRates as oar, parseRows } from '../../lib/outbreak-attack-rates-v1655.js';
import { hcpExposureClock as exp } from '../../lib/hcp-exposure-clock-v1655.js';
import { hcpIllnessReturnDate as ret } from '../../lib/hcp-illness-return-date-v1655.js';

test('SIR: the guide example, 5 observed over 2.365 predicted, is 2.114', () => {
  const r = nhsnSir({ observed: '5', predicted: '2.365' });
  assert.equal(r.sir, 2.114);
  assert.match(r.band, /more infections were observed than predicted/);
});

test('SIR: no ratio below 1.0 predicted; 1.0 itself is calculated', () => {
  const r = nhsnSir({ observed: '1', predicted: '0.99' });
  assert.equal(r.sir, null);
  assert.equal(r.bandLabel, 'Not calculated');
  assert.equal(nhsnSir({ observed: '0', predicted: '1' }).sir, 0);
  assert.equal(nhsnSir({ observed: '1.5', predicted: '2' }).valid, false);
  assert.equal(nhsnSir({}).valid, false);
});

test('DUR: device days over patient days, refused when device days are more', () => {
  assert.equal(dur({ device: 'central-line', deviceDays: '310', patientDays: '1000' }).dur, 0.31);
  assert.equal(dur({ device: 'ventilator', deviceDays: '1200', patientDays: '1000' }).valid, false);
  assert.equal(dur({ device: 'urinary-catheter', deviceDays: '10', patientDays: '0' }).valid, false);
  assert.equal(dur({ deviceDays: '10', patientDays: '20' }).valid, false);
});

test('rate: the SIR guide facility, 5 CLABSIs over 1,850 central line days, is 2.70 per 1,000', () => {
  assert.equal(rate({ device: 'central-line', events: '5', deviceDays: '1850' }).rate, 2.7);
  const v = rate({ device: 'ventilator', events: '3', deviceDays: '600', episodes: '120' });
  assert.equal(v.rate, 5);
  assert.equal(v.emvRate, 2.5);
  assert.equal(rate({ device: 'central-line', events: '9', deviceDays: '8' }).valid, false);
});

test('attack rates: the CDC potato salad, overall and secondary examples', () => {
  const r = oar({ rows: 'Potato salad, 30, 99' });
  assert.match(r.band, /30\.3% of those exposed \(30 of 99\); no unexposed counts/);
  const o = oar({ totalIll: '18', totalPersons: '1000', householdMembers: '86', primaryCases: '18', secondaryCases: '17' });
  assert.equal(o.overallAttackRate, 0.018);
  assert.equal(o.secondaryAttackRate, 0.25);
  assert.match(o.notes.join(' '), /17 ÷ \(86 - 18\) = 17 ÷ 68 contacts/);
});

test('attack rates: rows sort by risk ratio and reuse the two-by-two interval', () => {
  const r = oar({ rows: 'Ham, 10, 50, 10, 50\nPotato salad, 30, 99, 5, 100' });
  assert.equal(r.exposures[0].name, 'Potato salad');
  assert.ok(Math.abs(r.exposures[0].riskRatio - (30 / 99) / (5 / 100)) < 1e-12);
  assert.equal(r.exposures[1].riskRatio, 1);
  assert.equal(parseRows('Ham, 10').error.startsWith('Line 1'), true);
  assert.equal(oar({ rows: 'Ham, 60, 50' }).valid, false);
  assert.equal(oar({}).valid, false);
});

test('exposure: non-immune measles, first March 1 and last March 3, excluded March 6 to March 24', () => {
  const r = exp({ pathogen: 'measles', firstExposure: '2026-03-01', lastExposure: '2026-03-03', immunity: 'not-immune' });
  assert.equal(r.action, 'exclude');
  assert.equal(r.start, '2026-03-06');
  assert.equal(r.end, '2026-03-24');
  assert.match(r.notes.join(' '), /regardless of receipt of postexposure prophylaxis/);
});

test('exposure: each pathogen window at both ends', () => {
  const d = { firstExposure: '2026-01-10', immunity: 'immune' };
  for (const [p, a, b] of [['measles', '2026-01-15', '2026-01-31'], ['mumps', '2026-01-20', '2026-02-04'], ['rubella', '2026-01-17', '2026-02-02'], ['varicella', '2026-01-18', '2026-01-31']]) {
    const r = exp({ ...d, pathogen: p });
    assert.equal(r.action, 'monitor', p);
    assert.equal(r.start, a, p);
    assert.equal(r.end, b, p);
  }
});

test('exposure: varicella immune globulin runs to day 28; a second dose within 5 days lifts the exclusion', () => {
  const base = { pathogen: 'varicella', firstExposure: '2026-01-10', immunity: 'not-immune' };
  assert.equal(exp({ ...base, immuneGlobulin: 'yes' }).end, '2026-02-07');
  assert.equal(exp({ ...base, secondDoseWithin5Days: 'yes' }).action, 'monitor');
  assert.equal(exp({ ...base, pathogen: 'mumps', firstMmrBeforeExposure: 'yes' }).action, 'monitor');
});

test('exposure: unknown immunity prints both; pertussis by contact and prophylaxis; bad dates refused', () => {
  assert.equal(exp({ pathogen: 'rubella', firstExposure: '2026-01-10', immunity: 'unknown' }).action, 'unknown');
  const p = { pathogen: 'pertussis', firstExposure: '2026-01-10' };
  assert.equal(exp({ ...p, highRiskContact: 'yes' }).action, 'restrict');
  assert.equal(exp({ ...p, highRiskContact: 'yes' }).end, '2026-01-31');
  assert.equal(exp({ ...p, highRiskContact: 'yes', prophylaxis: 'yes' }).action, 'none');
  assert.equal(exp({ ...p, highRiskContact: 'no' }).action, 'monitor');
  assert.equal(exp({ ...p }).valid, false);
  assert.equal(exp({ pathogen: 'measles', firstExposure: '2026-03-05', lastExposure: '2026-03-01', immunity: 'immune' }).valid, false);
  assert.equal(exp({ pathogen: 'measles', firstExposure: '2026-02-30', immunity: 'immune' }).valid, false);
});

test('illness: measles 4 days after rash, mumps 5, rubella 7', () => {
  assert.equal(ret({ condition: 'measles', onsetDate: '2026-03-01' }).endsAt, '2026-03-05');
  assert.equal(ret({ condition: 'mumps-parotitis', onsetDate: '2026-03-01' }).endsAt, '2026-03-06');
  assert.equal(ret({ condition: 'rubella', onsetDate: '2026-03-01' }).endsAt, '2026-03-08');
  assert.equal(ret({ condition: 'measles' }).valid, false);
});

test('illness: pertussis is whichever comes first, day 21 of cough or 5 days after therapy', () => {
  assert.equal(ret({ condition: 'pertussis', onsetDate: '2026-03-01' }).endsAt, '2026-03-22');
  assert.equal(ret({ condition: 'pertussis', onsetDate: '2026-03-01', therapyStart: '2026-03-11T09:00' }).endsAt, '2026-03-16');
  assert.equal(ret({ condition: 'pertussis', onsetDate: '2026-03-01', therapyStart: '2026-03-20T09:00' }).endsAt, '2026-03-22');
  assert.equal(ret({ condition: 'pertussis', onsetDate: '2026-03-10', therapyStart: '2026-03-01T09:00' }).valid, false);
});

test('illness: varicella sets no date until lesions are crusted; 24-hour rules use the clock', () => {
  assert.equal(ret({ condition: 'varicella' }).flag, 'condition-unmet');
  assert.equal(ret({ condition: 'varicella', lesionsCrusted: 'yes' }).flag, 'ends');
  assert.equal(ret({ condition: 'meningococcal', therapyStart: '2026-03-01T22:30' }).endsAt, '2026-03-02T22:30');
  assert.equal(ret({ condition: 'group-a-strep' }).valid, false);
});
