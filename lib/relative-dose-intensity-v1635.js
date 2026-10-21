// spec-v1635 tool 3: relative dose intensity (RDI) for one drug, by both published time bases.
//
// Source: Hryniuk W, Bush H. The importance of dose intensity in chemotherapy of metastatic breast cancer. J Clin
// Oncol. 1984;2:1281-1288 (a purchase; not read). Built on the owner's decision of October 18, 2026: show both
// definitions the open papers use, each labeled. Both define RDI as delivered dose intensity over planned dose
// intensity (dose intensity = total dose / time); they differ in the time for the delivered intensity:
//   Cycles given: Pietroluongo E et al. Ther Adv Med Oncol 2026;18 (PMC12905096): "total dose (mg/m2)/time to
//     complete chemotherapy"; the time here runs from the first dose to the planned end of the last delivered cycle
//     (the spec's reading).
//   Planned course: Pak J et al. Oncologist 2024;29:311-315 (PMC10994250): a patient stopped after the third of 4
//     full, on-time 21-day cycles "should be 75%", which "would account for the expected number of days for the final
//     missed cycle": the time adds a cycle length for each planned cycle not given.
// Cycles-given RDI factors exactly into a dose ratio (delivered / planned dose for the cycles given) times a time
// ratio (cycles given x cycle length / elapsed time), which is how the loss is split between reduction and delay.
// No band ships: the 85% line is later observational work, not Hryniuk's.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'Relative dose intensity = delivered dose intensity / planned dose intensity, dose intensity being total dose over time. Published papers time the delivered intensity two ways: over the cycles given, or over the planned course with the missed cycles counted. Both are shown, and they differ only when the course stopped early. No cutoff is claimed here.';
const pct = (x) => `${(x * 100).toFixed(1)}%`;

function day(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? t / 86400000 : null;
}

export function relativeDoseIntensity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lines = String(o.delivered ?? '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const f = inputFault([
    ['the planned dose per cycle', o.plannedDose, 0.001, 1e6, ''],
    ['the cycle length', o.cycleDays, 1, 365, 'days'],
    ['the number of planned cycles', o.plannedCycles, 1, 100, ''],
  ]);
  if (f) return { valid: false, message: f };
  if (!lines.length) return { valid: false, message: 'Enter each delivered cycle as its date and dose, one per line.' };
  const P = Number(o.plannedDose); const L = Number(o.cycleDays); const N = Number(o.plannedCycles);
  if (!Number.isInteger(L) || !Number.isInteger(N)) return { valid: false, message: 'Enter the cycle length and planned cycles as whole numbers.' };
  const rows = [];
  for (const [k, line] of lines.entries()) {
    const parts = line.split(/[\s,;]+/).filter(Boolean);
    const d = parts.length === 2 ? day(parts[0]) : null;
    if (d == null) return { valid: false, message: `Line ${k + 1} needs a date as YYYY-MM-DD and the dose given.` };
    const fd = inputFault([[`the dose on line ${k + 1}`, parts[1], 0, 1e6, '']]);
    if (fd) return { valid: false, message: fd };
    if (rows.length && d <= rows[rows.length - 1][0]) return { valid: false, message: `Line ${k + 1} must be dated after the line before it.` };
    rows.push([d, Number(parts[1])]);
  }
  const n = rows.length;
  const D = rows.reduce((s, [, x]) => s + x, 0);
  const elapsed = rows[n - 1][0] - rows[0][0] + L;
  const plannedDI = P / L;
  const rdiGiven = (D / elapsed) / plannedDI;
  const missed = Math.max(0, N - n);
  const rdiCourse = (D / (elapsed + missed * L)) / plannedDI;
  const doseRatio = D / (P * n);
  const timeRatio = (n * L) / elapsed;
  const notes = [
    `Planned: ${P} per cycle every ${L} days for ${N} cycles. Given: ${n} cycle${n === 1 ? '' : 's'}, total ${D}, over ${elapsed} days (first dose to the planned end of the last cycle given).`,
    `Over the cycles given (Pietroluongo 2026): ${pct(rdiGiven)} = dose ratio ${pct(doseRatio)} x time ratio ${pct(timeRatio)}; below 100%, the dose ratio is the loss to reductions and the time ratio the loss to delays.`,
    missed ? `Over the planned course (Pak 2024): ${pct(rdiCourse)}, counting ${missed === 1 ? `1 missed cycle as ${L} days` : `${missed} missed cycles at ${L} days each`}.` : `Over the planned course (Pak 2024): ${pct(rdiCourse)}; no planned cycle was missed, so the two agree.`,
  ];
  if (n > N) notes.push(`${n} cycles were entered against ${N} planned.`);
  return {
    valid: true, rdiCyclesGiven: Number((rdiGiven * 100).toFixed(1)), rdiPlannedCourse: Number((rdiCourse * 100).toFixed(1)),
    doseRatio: Number((doseRatio * 100).toFixed(1)), timeRatio: Number((timeRatio * 100).toFixed(1)),
    band: `Relative dose intensity ${pct(rdiGiven)} over the cycles given; ${pct(rdiCourse)} over the planned course.`,
    bandLabel: missed ? `${pct(rdiGiven)} / ${pct(rdiCourse)}` : pct(rdiGiven), abnormal: false, notes, note: NOTE,
  };
}
