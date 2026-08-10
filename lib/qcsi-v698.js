// spec-v698: Quick COVID-19 Severity Index (qCSI).
//
// Predicts 24-hour risk of critical respiratory illness (respiratory decompensation) in
// admitted COVID-19 patients, from three bedside measures. Source:
//   Haimovich AD, Ravindra NG, Stoytchev S, et al. Development and Validation of the Quick
//   COVID-19 Severity Index: A Prognostic Tool for Early Clinical Decompensation. Ann Emerg
//   Med. 2020;76(4):442-453. (PMID 32447121.)
//
// Three items, summed to a total of 0-12:
//   Respiratory rate (breaths/min): <= 22 = 0; 23-28 = 1; > 28 = 2
//   Pulse oximetry SpO2 (%):        > 92 = 0; 89-92 = 2; <= 88 = 5
//   O2 flow rate (L/min):           <= 2 = 0; 3-4 = 4; >= 5 = 5
//     (the derivation used low-flow O2, categories <=2 / 3-4 / 5-6; flows above 6 sit in the
//      top category here.)
//
// Approximate 24-hour risk of respiratory decompensation by band: 0-3 low (~4%), 4-6 (~30%),
// 7-9 (~44%), 10-12 (~57%). A commonly used dichotomy is <= 3 low vs > 3 elevated.
//
// Pure: no DOM, no clock, no network.

export const QCSI_NOTE = 'Quick COVID-19 Severity Index (qCSI) (Haimovich AD, Ravindra NG, Stoytchev S, et al, Ann Emerg Med 2020;76(4):442-453). It predicts the 24-hour risk of respiratory decompensation in an admitted COVID-19 patient from three bedside measures, summed to 0 to 12: respiratory rate (22 or fewer breaths per minute scores 0, 23 to 28 scores 1, over 28 scores 2), pulse oximetry (above 92 percent scores 0, 89 to 92 percent scores 2, 88 percent or below scores 5), and oxygen flow rate (2 L/min or less scores 0, 3 to 4 scores 4, 5 or more scores 5). The approximate 24-hour risk of respiratory decompensation is about 4 percent for a total of 0 to 3, 30 percent for 4 to 6, 44 percent for 7 to 9, and 57 percent for 10 to 12; a total above 3 is commonly treated as elevated. It was derived on admitted patients on low-flow oxygen and is not a substitute for continuous monitoring; it supports rather than replaces clinical judgment.';

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function rrPts(rr) { if (rr <= 22) return 0; if (rr <= 28) return 1; return 2; }
function spo2Pts(s) { if (s > 92) return 0; if (s >= 89) return 2; return 5; }
function o2Pts(f) { if (f <= 2) return 0; if (f <= 4) return 4; return 5; }

function band(total) {
  if (total <= 3) return { tier: 'low', risk: 'about 4%' };
  if (total <= 6) return { tier: 'intermediate', risk: 'about 30%' };
  if (total <= 9) return { tier: 'high', risk: 'about 44%' };
  return { tier: 'very-high', risk: 'about 57%' };
}

export function qcsi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rr = pos(o.respiratoryRate);
  if (!Number.isFinite(rr) || rr < 0 || rr > 100) {
    return { valid: false, code: 'MISSING_INPUT', field: 'respiratoryRate', message: 'Enter the respiratory rate in breaths/min.', note: QCSI_NOTE };
  }
  const spo2 = pos(o.spo2);
  if (!Number.isFinite(spo2) || spo2 <= 0 || spo2 > 100) {
    return { valid: false, code: 'MISSING_INPUT', field: 'spo2', message: 'Enter the SpO2 (%).', note: QCSI_NOTE };
  }
  const o2 = pos(o.o2Flow);
  if (!Number.isFinite(o2) || o2 < 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'o2Flow', message: 'Enter the oxygen flow rate in L/min (0 for room air).', note: QCSI_NOTE };
  }

  const total = rrPts(rr) + spo2Pts(spo2) + o2Pts(o2);
  const b = band(total);

  return {
    valid: true,
    score: total,
    tier: b.tier,
    risk: b.risk,
    // A total > 3 is the common "elevated" flag.
    abnormal: total > 3,
    bandLabel: `qCSI ${total} of 12`,
    band: `qCSI ${total} of 12 — ${b.tier === 'low' ? 'low' : b.tier} risk of 24-hour respiratory decompensation (${b.risk}).`,
    detail: `Respiratory rate ${rrPts(rr)}, SpO2 ${spo2Pts(spo2)}, O2 flow ${o2Pts(o2)}. Bands: 0-3 ~4%, 4-6 ~30%, 7-9 ~44%, 10-12 ~57%. A total over 3 is commonly treated as elevated.`,
    note: QCSI_NOTE,
  };
}
