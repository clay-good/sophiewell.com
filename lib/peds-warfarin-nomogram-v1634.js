// spec-v1634 tool 15: pediatric warfarin protocol for a target INR of 2.0 to 3.0.
//
// Sources, both re-read on October 17, 2026:
//   Monagle P et al. Antithrombotic therapy in neonates and children. CHEST 2012;141(2 Suppl):e737S-e801S, Table 6
//   (PMC3278066, read on the PMC page): day 1 "if the baseline INR is 1.0 to 1.3: Dose = 0.2 mg/kg orally"; loading
//   days 2-4: 1.1-1.3 repeat the initial loading dose; 1.4-1.9 50% of it; 2.0-3.0 50%; 3.1-3.5 25%; >3.5 "Hold until
//   INR<3.5 then restart at 50% decreased dose"; maintenance: 1.1-1.4 increase by 20%; "1.15-1.9" increase by 10%;
//   2.0-3.0 no change; 3.1-3.5 decrease by 10%; >3.5 "Hold until INR<3.5, then restart at 20% decreased dose".
//   Monagle P et al. ASH/ISTH 2024 updated guidelines for treatment of VTE in pediatric patients. Blood Adv
//   2025;9:2587-2636, Table 9 (PMC12235321, CC BY-NC-ND), same lead author, citing the CHEST table: maintenance
//   1.1-1.4 +20%, 1.5-1.9 +10%, 2.0-3.0 no change, 3.1-3.5 -10%; warfarin starting dose 0.20 mg/kg (0.10 mg/kg
//   after a Fontan procedure or with liver dysfunction), maximum starting dose 10 mg.
// The CHEST table's "1.15-1.9" overlaps its own first band; the 2024 guideline prints 1.5-1.9, which is used (the
// owner's rule of October 17, 2026: anything that can be proved). The 2024 table's last row reads "restart at 20% of
// dose"; CHEST's "20% decreased dose" is used for that row. The bands are in tenths: an INR between two bands (1.35,
// say) is asked for to one decimal place rather than placed by guess.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const PHASES = [
  { value: 'day1', text: 'Day 1 (starting dose)' },
  { value: 'loading', text: 'Loading, days 2 to 4' },
  { value: 'maintenance', text: 'Maintenance' },
];
export const STARTS = [
  { value: 'standard', text: 'Standard start (0.2 mg/kg)' },
  { value: 'fontan', text: 'After a Fontan procedure (0.1 mg/kg)' },
  { value: 'liver', text: 'Liver dysfunction (0.1 mg/kg)' },
];
const NOTE = 'The pediatric warfarin protocol for a target INR of 2.0 to 3.0 (CHEST 2012 Table 6, with the 2024 ASH/ISTH guideline). A dosing aid to check against the local protocol and the treating team, not an order.';
const r2 = (x) => Math.round(x * 100) / 100;

function band(inr, rows) {
  const t = Math.round(inr * 10) / 10;
  if (Math.abs(t - inr) > 1e-9) return { between: true };
  return rows.find(([lo, hi]) => t >= lo - 1e-9 && t <= hi + 1e-9) || null;
}

export function pedsWarfarinNomogram(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const phase = String(o.phase ?? '').trim();
  if (!PHASES.some((p) => p.value === phase)) return { valid: false, message: 'Choose the phase: day 1, loading days 2 to 4, or maintenance.' };
  const fi = inputFault([['the INR', o.inr, 0.5, 20, '']]);
  if (fi) return { valid: false, message: fi };
  const inr = Number(o.inr);
  const notes = [];
  if (phase === 'day1') {
    const start = STARTS.find((s) => s.value === String(o.start ?? '').trim());
    if (!start) return { valid: false, message: 'Choose the start: standard, after a Fontan procedure, or liver dysfunction.' };
    const fw = inputFault([['the weight', o.weightKg, 1, 150, 'kg']]);
    if (fw) return { valid: false, message: fw };
    if (inr < 1.0 || inr > 1.3) return { valid: true, flag: 'no-recommendation-given', abnormal: true, band: `The protocol gives the day 1 dose for a baseline INR of 1.0 to 1.3; ${inr} is outside it, so no starting dose is reported.`, bandLabel: 'No figure given', notes, note: NOTE };
    const perKg = start.value === 'standard' ? 0.2 : 0.1;
    const raw = perKg * Number(o.weightKg);
    const dose = Math.min(raw, 10);
    if (raw > 10) notes.push(`${perKg} mg/kg of ${o.weightKg} kg is ${r2(raw)} mg; the 2024 ASH/ISTH guideline caps the starting dose at 10 mg.`);
    if (start.value !== 'standard') notes.push('The 0.1 mg/kg start after a Fontan procedure or with liver dysfunction is from the 2024 ASH/ISTH guideline (Table 9).');
    return { valid: true, flag: 'dose', abnormal: false, doseMg: r2(dose), band: `Day 1 warfarin: ${r2(dose)} mg orally (${perKg} mg/kg${raw > 10 ? ', capped at 10 mg' : ''}).`, bandLabel: `${r2(dose)} mg`, notes, note: NOTE };
  }
  const fd = inputFault([[phase === 'loading' ? 'the initial loading dose' : 'the current dose', o.doseMg, 0.1, 50, 'mg']]);
  if (fd) return { valid: false, message: fd };
  const d = Number(o.doseMg);
  if (phase === 'loading') {
    const rows = [[1.1, 1.3, 1, 'repeat the initial loading dose'], [1.4, 1.9, 0.5, '50% of the initial loading dose'], [2.0, 3.0, 0.5, '50% of the initial loading dose'], [3.1, 3.5, 0.25, '25% of the loading dose']];
    if (inr > 3.5) return { valid: true, flag: 'hold', abnormal: true, band: `INR ${inr} on a loading day: hold until the INR is under 3.5, then restart at 50% less: ${r2(d * 0.5)} mg.`, bandLabel: 'Hold', notes, note: NOTE };
    const b = band(inr, rows);
    if (b && b.between) return { valid: false, message: 'Enter the INR to one decimal place: the protocol\'s bands are in tenths.' };
    if (!b) return { valid: true, flag: 'no-recommendation-given', abnormal: true, band: `The loading table starts at an INR of 1.1; it gives no action for ${inr}.`, bandLabel: 'No figure given', notes, note: NOTE };
    return { valid: true, flag: 'dose', abnormal: false, doseMg: r2(d * b[2]), band: `INR ${inr} on a loading day (${b[0].toFixed(1)}-${b[1].toFixed(1)}): ${b[3]}, ${r2(d * b[2])} mg.`, bandLabel: `${r2(d * b[2])} mg`, notes, note: NOTE };
  }
  const rows = [[1.1, 1.4, 1.2, 'increase by 20%'], [1.5, 1.9, 1.1, 'increase by 10%'], [2.0, 3.0, 1, 'no change'], [3.1, 3.5, 0.9, 'decrease by 10%']];
  if (inr > 3.5) return { valid: true, flag: 'hold', abnormal: true, band: `INR ${inr} in maintenance: hold until the INR is under 3.5, then restart at 20% less: ${r2(d * 0.8)} mg.`, bandLabel: 'Hold', notes, note: NOTE };
  const b = band(inr, rows);
  if (b && b.between) return { valid: false, message: 'Enter the INR to one decimal place: the protocol\'s bands are in tenths.' };
  if (!b) return { valid: true, flag: 'no-recommendation-given', abnormal: true, band: `The maintenance table starts at an INR of 1.1; it gives no action for ${inr}.`, bandLabel: 'No figure given', notes, note: NOTE };
  if (b[0] === 1.5) notes.push('CHEST 2012 prints this band as "1.15-1.9", overlapping the band above it; the 2024 ASH/ISTH guideline by the same lead author prints 1.5-1.9, which is used.');
  return { valid: true, flag: 'dose', abnormal: b[2] !== 1, doseMg: r2(d * b[2]), band: `INR ${inr} in maintenance (${b[0].toFixed(1)}-${b[1].toFixed(1)}): ${b[3]}${b[2] === 1 ? '' : `, ${r2(d * b[2])} mg`}.`, bandLabel: `${r2(d * b[2])} mg`, notes, note: NOTE };
}
