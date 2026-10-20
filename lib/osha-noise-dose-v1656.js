// spec-v1656 tool 1: OSHA noise dose and 8-hour TWA from a day's exposure segments.
//
// Source: 29 CFR 1910.95 and its Appendix A (mandatory), read on the eCFR (title 29 current to
// October 16, 2026) on October 19, 2026:
//   App. A I(1)(ii): "D = 100(C1 / T1 + C2 / T2 + Cn / Tn)", Cn the time at a level and Tn the
//     reference duration for that level from Table G-16a.
//   Table G-16a: reference durations from 80 dBA (32 h) to 130 dBA (0.031 h). Its footnote formula
//     is an image on the page; T = 8 / 2^((L - 90) / 5) reproduces every printed row.
//   App. A I(2): "TWA = 16.61 log10 (D/100) + 90". App. A II: a 91% dose is a TWA of 89.3 dB and a
//     50% dose is 85 dB; Table A-1 rows 100 -> 90.0, 200 -> 95.0, 500 -> 101.6.
//   (c)(1)-(2): the hearing conservation program, and the action level, at a TWA of 85 dBA
//     "or, equivalently, a dose of fifty percent", computed without regard to hearing protectors.
//   (d)(2)(i): "All continuous, intermittent and impulsive sound levels from 80 decibels to 130
//     decibels shall be integrated into the noise measurements." So a segment below 80 adds nothing.
//   Table G-16 footnote: the mixed exposure exceeds the limit when the sum of C/T "exceeds unity";
//     "Exposure to impulsive or impact noise should not exceed 140 dB peak sound pressure level."
//     Table G-16's last row is 115 dBA for "1/4 or less" hours.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const NOTE = 'Computed as Appendix A to 29 CFR 1910.95 directs, without credit for hearing protectors. It reports what the standard\'s numbers say for the segments entered; it does not certify compliance.';

const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;

export function referenceHours(level) {
  return 8 / Math.pow(2, (level - 90) / 5);
}

export function twaFromDose(dose) {
  return 16.61 * Math.log10(dose / 100) + 90;
}

// "92, 2" or "92, 1:30" per line: a level in dBA and a duration in hours, or hours:minutes.
export function parseSegments(text) {
  const segs = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const at = `Line ${i + 1}`;
    const cells = line.split(/[,\t]/).map((c) => c.trim());
    if (cells.length !== 2) return { error: `${at} needs a sound level in dBA and a duration, such as 92, 2 or 92, 1:30.` };
    const level = Number(cells[0]);
    if (cells[0] === '' || !Number.isFinite(level)) return { error: `${at}: "${cells[0]}" is not a sound level.` };
    let hours;
    const hm = /^(\d+):([0-5]\d)$/.exec(cells[1]);
    if (hm) hours = Number(hm[1]) + Number(hm[2]) / 60;
    else if (/^\d*\.?\d+$/.test(cells[1])) hours = Number(cells[1]);
    else return { error: `${at}: "${cells[1]}" is not a duration in hours or hours:minutes.` };
    if (level > 130) return { error: `${at}: ${level} dBA is above 130, where Table G-16a and paragraph (d)(2)(i) stop. Table G-16 has no row above 115 dBA, so any exposure at that level is above the table.` };
    if (level < 0) return { error: `${at}: the sound level cannot be negative.` };
    if (hours <= 0) return { error: `${at}: the duration must be more than zero.` };
    segs.push({ level, hours });
  }
  return { segs };
}

export function oshaNoiseDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const impulse = o.impulseOver140 === 'yes';
  let dose;
  let rows = [];
  let hoursTotal = null;
  const notes = [];
  const segText = String(o.segments ?? '').trim();
  const doseRaw = String(o.dosimeterDose ?? '').trim();

  if (segText) {
    const p = parseSegments(segText);
    if (p.error) return { valid: false, message: p.error };
    hoursTotal = p.segs.reduce((s, x) => s + x.hours, 0);
    if (hoursTotal > 24) return { valid: false, message: `The segments add up to ${round2(hoursTotal)} hours, more than a day. Check the durations.` };
    rows = p.segs.map((s) => {
      if (s.level < 80) return { ...s, t: null, fraction: 0 };
      const t = referenceHours(s.level);
      return { ...s, t, fraction: s.hours / t };
    });
    dose = 100 * rows.reduce((s, r) => s + r.fraction, 0);
    if (rows.some((r) => r.level < 80)) {
      notes.push('A segment below 80 dBA adds nothing to the dose: paragraph (d)(2)(i) integrates sound levels from 80 to 130 decibels.');
    }
  } else if (doseRaw) {
    const f = inputFault([['the dosimeter dose', doseRaw, null, 100000, 'percent']]);
    if (f) return { valid: false, message: f };
    dose = Number(doseRaw);
  } else {
    return { valid: false, message: 'Enter the exposure segments, one per line as a level in dBA and a duration, or a dosimeter dose in percent.' };
  }

  if (dose === 0) {
    return {
      valid: true, dose: 0, twa: null, actionLevel: false, overPel: false, abnormal: false,
      band: 'Dose 0%: every segment is below 80 dBA, which the standard does not integrate. No TWA is computed from a zero dose.',
      bandLabel: '0%', rows, notes, note: NOTE,
    };
  }

  const twa = round1(twaFromDose(dose));
  const d = round1(dose);
  const actionLevel = dose >= 50 || twa >= 85;
  const overPel = dose > 100;
  const over115 = rows.filter((r) => r.level > 115 || (r.level === 115 && r.hours > 0.25));

  const lines = [
    actionLevel
      ? `Action level reached: a TWA of 85 dBA or a dose of 50% requires a hearing conservation program (§1910.95(c)).`
      : `Action level not reached: below a TWA of 85 dBA and a dose of 50% (§1910.95(c)).`,
    overPel
      ? `Permissible exposure exceeded: the sum of C/T exceeds unity, a dose over 100% (Table G-16 footnote).`
      : `Permissible exposure not exceeded: the dose is 100% or less (Table G-16).`,
  ];
  for (const r of over115) {
    lines.push(`${r.level} dBA for ${round2(r.hours)} h is above Table G-16's last row, 115 dBA for a quarter hour or less.`);
  }
  if (impulse) lines.push('Impulsive or impact noise above 140 dB peak was reported; the Table G-16 footnote says it should not exceed 140 dB peak.');

  return {
    valid: true, dose: d, twa, actionLevel, overPel, hoursTotal: hoursTotal === null ? null : round2(hoursTotal),
    abnormal: overPel || over115.length > 0 || impulse || actionLevel,
    band: `Dose ${d}%, 8-hour TWA ${twa} dBA. ${lines[0]} ${lines[1]}`,
    bandLabel: `${d}% / ${twa} dBA`,
    rows: rows.map((r) => ({ level: r.level, hours: round2(r.hours), referenceHours: r.t === null ? null : round2(r.t), fraction: round2(r.fraction) })),
    notes: [...lines.slice(2), ...notes],
    note: NOTE,
  };
}
