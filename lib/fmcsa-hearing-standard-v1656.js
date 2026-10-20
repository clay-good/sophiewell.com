// spec-v1656 tool 5: the commercial driver hearing standard, by forced whisper or audiometry.
//
// Sources, read on the eCFR (title 49 current to October 16, 2026) on October 19, 2026:
//   49 CFR 391.41(b)(11): a driver "First perceives a forced whispered voice in the better ear at not
//     less than 5 feet with or without the use of a hearing aid or, if tested by use of an audiometric
//     device, does not have an average hearing loss in the better ear greater than 40 decibels at
//     500 Hz, 1,000 Hz, and 2,000 Hz ... when the audiometric device is calibrated to American
//     National Standard (formerly ASA Standard) Z24.5—1951".
//   Part 391 Appendix A, section I (advisory): ISO results convert to ANSI by subtracting 14 dB at
//     500 Hz, 10 dB at 1,000 Hz and 8.5 dB at 2,000 Hz; "To average, add the readings for the 3
//     frequencies tested and divide by 3." A driver who "fails the whispered voice test in both
//     ears" should have the audiometric test.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const ISO_TO_ANSI = [14, 10, 8.5];
const round1 = (n) => Math.round(n * 10) / 10;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function fmcsaHearingStandard(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lines = [];
  const notes = [];
  let whisperPass = null;
  let audioPass = null;
  let average = null;
  let thresholds = null;

  if (!blank(o.whisperFeet)) {
    const f = inputFault([['the whisper distance', o.whisperFeet, 0, 30, 'feet']]);
    if (f) return { valid: false, message: f };
    const ft = Number(o.whisperFeet);
    whisperPass = ft >= 5;
    lines.push(whisperPass
      ? `Forced whisper perceived at ${ft} ft in the better ear: meets the 5-foot standard.`
      : `Forced whisper perceived at ${ft} ft in the better ear: under the 5-foot standard.`);
    if (!whisperPass) notes.push('Appendix A advises the audiometric test when the whispered voice test is failed in both ears; either test can meet §391.41(b)(11).');
  }

  const freqs = [o.hz500, o.hz1000, o.hz2000];
  if (freqs.some((v) => !blank(v))) {
    const f = inputFault([
      ['the 500 Hz threshold', o.hz500, -10, 120, 'dB'],
      ['the 1,000 Hz threshold', o.hz1000, -10, 120, 'dB'],
      ['the 2,000 Hz threshold', o.hz2000, -10, 120, 'dB'],
    ]);
    if (f) return { valid: false, message: f };
    if (o.calibration !== 'ansi' && o.calibration !== 'iso') return { valid: false, message: 'Choose the audiometer calibration, ANSI or ISO.' };
    const raw = freqs.map(Number);
    thresholds = o.calibration === 'iso' ? raw.map((v, i) => v - ISO_TO_ANSI[i]) : raw;
    average = round1(thresholds.reduce((s, v) => s + v, 0) / 3);
    audioPass = average <= 40;
    const conv = o.calibration === 'iso' ? ` (ISO converted to ANSI: ${thresholds.join(', ')} dB)` : '';
    lines.push(audioPass
      ? `Better-ear average ${average} dB at 500, 1,000 and 2,000 Hz${conv}: not greater than 40 dB, so it meets the standard.`
      : `Better-ear average ${average} dB at 500, 1,000 and 2,000 Hz${conv}: greater than 40 dB, so it does not meet the standard.`);
  }

  if (whisperPass === null && audioPass === null) {
    return { valid: false, message: 'Enter the forced whisper distance, or the better ear\'s thresholds at 500, 1,000 and 2,000 Hz.' };
  }
  const meets = whisperPass === true || audioPass === true;
  return {
    valid: true, meets, whisperPass, audioPass, average, thresholds, abnormal: !meets,
    band: `${meets ? 'Meets' : 'Does not meet'} the hearing standard of §391.41(b)(11) on the test${lines.length > 1 ? 's' : ''} entered. ${lines.join(' ')}`,
    bandLabel: meets ? 'Meets the standard' : 'Does not meet the standard',
    notes,
    note: 'The regulation uses the better ear, with or without a hearing aid; enter that ear. The medical examiner decides qualification.',
  };
}
