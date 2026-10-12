// spec-v1637 tools 8 and 9: prescription transfer and Schedule II prescription form.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csRxTransferCheck } from '../../lib/cs-rx-transfer-check-v1637.js';
import { c2RxFormCheck } from '../../lib/c2-rx-form-check-v1637.js';

const t = (o) => csRxTransferCheck({ stateLaw: 'state-law-allows', transferredBefore: 'not-transferred-before', ...o });

test('transfer: an unfilled electronic prescription, once, Schedule II to V', () => {
  for (const schedule of ['schedule-2', 'schedule-3-to-5']) {
    assert.equal(t({ schedule, filled: 'unfilled-prescription', form: 'electronic-prescription' }).flag, 'transfer-permitted', schedule);
  }
  assert.equal(t({ schedule: 'schedule-2', filled: 'unfilled-prescription', form: 'electronic-prescription', transferredBefore: 'transferred-before' }).flag, 'transfer-not-permitted');
  assert.match(t({ schedule: 'schedule-3-to-5', filled: 'unfilled-prescription', form: 'electronic-prescription' }).note, /refills on a Schedule III, IV or V prescription transfer with it/);
  assert.match(t({ schedule: 'schedule-2', filled: 'unfilled-prescription', form: 'electronic-prescription' }).note, /1306\.08\(h\)/);
});

test('transfer: an unfilled paper or oral prescription has no federal provision', () => {
  const r = csRxTransferCheck({ schedule: 'schedule-3-to-5', filled: 'unfilled-prescription', form: 'paper-or-oral-prescription' });
  assert.equal(r.flag, 'no-federal-provision');
  assert.match(r.note, /silent rather than prohibiting/);
});

test('transfer: refills of Schedule III to V, once unless the pharmacies share a real-time database', () => {
  const r = (o) => t({ schedule: 'schedule-3-to-5', filled: 'filled-at-least-once', form: 'paper-or-oral-prescription', sharedDatabase: 'no-shared-database', ...o });
  assert.equal(r({}).flag, 'transfer-permitted');
  assert.equal(r({ transferredBefore: 'transferred-before' }).flag, 'transfer-not-permitted');
  assert.equal(r({ transferredBefore: 'transferred-before', sharedDatabase: 'shared-realtime-database' }).flag, 'transfer-permitted');
  assert.match(r({}).note, /two years from the date of the last refill/);
  assert.match(csRxTransferCheck({ schedule: 'schedule-3-to-5', filled: 'filled-at-least-once', form: 'electronic-prescription', transferredBefore: 'not-transferred-before', stateLaw: 'state-law-allows' }).message, /^Choose whether the two pharmacies share/);
});

test('transfer: a filled Schedule II has nothing to transfer; state law governs both rules', () => {
  assert.equal(csRxTransferCheck({ schedule: 'schedule-2', filled: 'filled-at-least-once' }).flag, 'nothing-to-transfer');
  assert.equal(t({ schedule: 'schedule-2', filled: 'unfilled-prescription', form: 'electronic-prescription', stateLaw: 'state-law-does-not-allow' }).flag, 'transfer-not-permitted');
  assert.equal(t({ schedule: 'schedule-2', filled: 'unfilled-prescription', form: 'electronic-prescription', stateLaw: 'state-law-not-checked' }).flag, 'permitted-if-state-law-allows');
  assert.match(csRxTransferCheck({}).message, /^Choose the schedule/);
  assert.match(csRxTransferCheck({ schedule: 'schedule-2', filled: 'unfilled-prescription', form: 'electronic-prescription', transferredBefore: 'not-transferred-before' }).message, /^Choose whether state law allows/);
});

test('form: signed paper and electronic', () => {
  assert.equal(c2RxFormCheck({ arrived: 'signed-paper-prescription' }).flag, 'dispense-yes');
  assert.equal(c2RxFormCheck({ arrived: 'electronic-prescription' }).flag, 'dispense-yes-with-conditions');
});

test('form: a fax is for review only, outside the three exceptions; (e) and (g) say narcotic and (f) does not', () => {
  const fax = (o) => c2RxFormCheck({ arrived: 'faxed-prescription', ...o });
  assert.equal(fax({ faxCase: 'none-of-these-cases' }).flag, 'dispense-no');
  assert.match(fax({ faxCase: 'narcotic-compounded-infusion' }).note, /1306\.11\(e\).*The paragraph says narcotic/);
  assert.match(fax({ faxCase: 'ltc-facility-resident' }).note, /any Schedule II substance, not only narcotics/);
  assert.equal(fax({ faxCase: 'hospice-patient-narcotic', hospiceNoted: 'hospice-noted-on-prescription' }).flag, 'dispense-yes');
  assert.equal(fax({ faxCase: 'hospice-patient-narcotic', hospiceNoted: 'hospice-not-noted' }).flag, 'dispense-no');
  assert.match(fax({ faxCase: 'hospice-patient-narcotic' }).message, /^Choose whether the prescription notes/);
  assert.match(fax({}).message, /^Choose whether one of the three fax exceptions/);
});

test('form: an oral order is for an emergency only, never at a central fill pharmacy, with a 7-day written prescription', () => {
  const oral = (o) => c2RxFormCheck({ arrived: 'oral-authorization', ...o });
  assert.equal(oral({ emergency: 'not-an-emergency' }).flag, 'dispense-no');
  assert.equal(oral({ emergency: 'emergency-situation', pharmacy: 'centralized-fill-pharmacy' }).flag, 'dispense-no');
  const ok = oral({ emergency: 'emergency-situation', pharmacy: 'dispensing-pharmacy', authorizedOn: '2026-10-09' });
  assert.deepEqual([ok.flag, ok.writtenPrescriptionDue], ['dispense-yes-with-conditions', '2026-10-16']);
  const undated = oral({ emergency: 'emergency-situation', pharmacy: 'dispensing-pharmacy' });
  assert.equal(undated.writtenPrescriptionDue, undefined);
  assert.match(undated.note, /date of the oral authorization was not entered/);
  assert.match(oral({}).message, /^Choose whether this is an emergency/);
  assert.match(c2RxFormCheck({}).message, /^Choose how the Schedule II prescription arrived/);
});
