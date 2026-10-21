// spec-v1636 tool 19: the spec's verify-at-build cases, against Table 1 of Bratzler 2013.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { surgicalProphylaxisRedose as sp } from '../../lib/surgical-prophylaxis-redose-v1636.js';

test('cefazolin at 119.9 kg is 2 g and at 120 kg is 3 g', () => {
  assert.equal(sp({ agent: 'cefazolin', patient: 'adult', weightKg: '119.9' }).doseMg, 2000);
  assert.equal(sp({ agent: 'cefazolin', patient: 'adult', weightKg: '120' }).doseMg, 3000);
});

test('a dose started at 07:30 redoses at 11:30 regardless of incision time', () => {
  for (const inc of ['2026-10-18T08:00', '2026-10-18T08:25']) {
    const r = sp({ agent: 'cefazolin', patient: 'adult', weightKg: '80', startTime: '2026-10-18T07:30', incisionTime: inc });
    assert.match(r.notes.join(' '), /Redose at 2026-10-18 11:30/);
  }
});

test('vancomycin started 100 minutes before incision passes; cefazolin fails', () => {
  const t = { patient: 'adult', weightKg: '80', startTime: '2026-10-18T06:20', incisionTime: '2026-10-18T08:00' };
  assert.equal(sp({ ...t, agent: 'vancomycin' }).timing, 'within');
  assert.equal(sp({ ...t, agent: 'cefazolin' }).timing, 'outside');
  assert.equal(sp({ ...t, agent: 'cefazolin', startTime: '2026-10-18T08:05' }).timing, 'outside');
});

test('a 30 kg child on cefazolin is 900 mg; an 80 kg child is capped at 2 g', () => {
  assert.equal(sp({ agent: 'cefazolin', patient: 'child', weightKg: '30' }).doseMg, 900);
  assert.equal(sp({ agent: 'cefazolin', patient: 'child', weightKg: '80' }).doseMg, 2000);
});

test('gentamicin uses the dosing weight; vancomycin is per kg; NA intervals say so', () => {
  const g = sp({ agent: 'gentamicin', patient: 'adult', weightKg: '120', ibwKg: '70' });
  assert.equal(g.doseMg, 450); // DW = 70 + 0.4 x 50 = 90 kg; 5 mg/kg = 450 mg
  assert.equal(sp({ agent: 'gentamicin', patient: 'adult', weightKg: '80', ibwKg: '70' }).doseMg, 400);
  assert.equal(sp({ agent: 'gentamicin', patient: 'adult', weightKg: '80' }).valid, false);
  assert.equal(sp({ agent: 'vancomycin', patient: 'adult', weightKg: '90' }).doseMg, 1350);
  assert.match(sp({ agent: 'ertapenem', patient: 'adult', weightKg: '80' }).band, /no redosing interval/);
});

test('pediatric special rows: piperacillin-tazobactam bands, neonatal metronidazole, ceftriaxone range', () => {
  assert.equal(sp({ agent: 'piperacillin-tazobactam', patient: 'child', weightKg: '6', pipAge: 'infant' }).doseMg, 480);
  assert.equal(sp({ agent: 'piperacillin-tazobactam', patient: 'child', weightKg: '20', pipAge: 'child' }).doseMg, 2000);
  assert.equal(sp({ agent: 'piperacillin-tazobactam', patient: 'child', weightKg: '45', pipAge: 'child' }).flag, 'no-recommendation-given');
  assert.equal(sp({ agent: 'piperacillin-tazobactam', patient: 'child', weightKg: '20' }).valid, false);
  assert.equal(sp({ agent: 'metronidazole', patient: 'child', weightKg: '1.0' }).doseMg, 7.5);
  assert.match(sp({ agent: 'ceftriaxone', patient: 'child', weightKg: '20' }).band, /1 g to 1\.5 g/);
});

test('blank and malformed inputs refuse', () => {
  assert.equal(sp({ agent: '', patient: 'adult', weightKg: '80' }).valid, false);
  assert.equal(sp({ agent: 'cefazolin', patient: '', weightKg: '80' }).valid, false);
  assert.equal(sp({ agent: 'cefazolin', patient: 'adult', weightKg: '' }).valid, false);
  assert.equal(sp({ agent: 'cefazolin', patient: 'adult', weightKg: '80', startTime: '7:30' }).valid, false);
});
