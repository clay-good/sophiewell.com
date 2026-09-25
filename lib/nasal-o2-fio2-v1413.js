// spec-v1413: estimated FiO2 from a nasal oxygen flow rate, for a patient whose FiO2 is not measured.
//
// Sources, read 2026-09-24:
//   Matthay MA, Arabi Y, Arroliga AC, et al. A New Global Definition of Acute Respiratory Distress
//     Syndrome. Am J Respir Crit Care Med 2024;209(1):37-47 (PMC10870872). Table 1, footnote to the
//     nonintubated and resource-limited criteria: "Estimated FiO2 = ambient FiO2 (e.g., 0.21) +
//     0.03 x O2 flow rate (L/min)." The same table: "SpO2:FiO2 is not valid above saturation values
//     of 97%."
//   Wettstein RB, Shelledy DC, Peters JI. Delivered oxygen concentrations using low-flow and
//     high-flow nasal cannulas. Respir Care 2005;50(5):604-609. Pharyngeal FiO2 in 10 normal
//     subjects: mean at rest 0.26-0.54 across 1-6 L/min; 0.24-0.45 breathing rapidly; "varied widely
//     within and between subjects"; higher with the mouth open.
//
// The estimate is the definition's convention, not a measurement. Pure: no DOM, no clock, no network.

const AMBIENT = 0.21;
const PER_LPM = 0.03;

function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}
const r2 = (x) => Math.round(x * 100) / 100;

export function nasalO2Fio2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.flowLpm)) return { valid: false, message: 'Enter the oxygen flow rate (L/min).' };
  const flow = Number(o.flowLpm);
  if (!Number.isFinite(flow)) return { valid: false, message: 'Enter the oxygen flow rate as a number (L/min).' };
  if (flow <= 0) {
    return { valid: false, message: 'The flow must be greater than 0 L/min. On room air the FiO2 is the ambient 0.21.' };
  }
  const raw = AMBIENT + PER_LPM * flow;
  if (raw > 1) {
    return {
      valid: false,
      message: `At ${flow} L/min the estimate passes 1.0, so it cannot apply. On heated high-flow oxygen, use the FiO2 set on the device.`,
    };
  }
  const fio2 = r2(raw);
  const pct = Math.round(raw * 100);
  return {
    valid: true,
    abnormal: false,
    fio2,
    percent: pct,
    band: `Estimated FiO2 ${fio2.toFixed(2)} (${pct}%) at ${flow} L/min: 0.21 + 0.03 x ${flow}, the estimate the 2024 Global Definition of ARDS uses when the FiO2 is not measured.`,
    bandLabel: `${fio2.toFixed(2)} (${pct}%)`,
    notes: [
      'This is a convention for calculating a ratio, not what the patient breathes. Measured at the back of the throat in healthy adults on 1 to 6 L/min, the mean FiO2 ran from 0.26 to 0.54 at rest and from 0.24 to 0.45 breathing fast, it varied widely within and between people, and it was higher with the mouth open (Wettstein 2005).',
      'For an SpO2/FiO2 ratio, the same definition says the ratio is not valid when the SpO2 is above 97%.',
    ],
    note: 'Matthay MA et al, A New Global Definition of ARDS, Am J Respir Crit Care Med 2024 (Table 1). Wettstein RB et al, Respir Care 2005. '
      + 'Nasal oxygen only. A mask, a Venturi device, or a heated high-flow system sets or delivers its own FiO2; use that instead.',
  };
}
