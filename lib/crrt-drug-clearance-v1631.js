// spec-v1631 tool 20: drug clearance by CRRT from flow and sieving coefficient.
//
// Li L, Li X, Xia Y, et al. Front Pharmacol. 2020;11:786 (PMC7273837, CC BY 4.0), re-read on October
// 11, 2026: "convention clearance (ml/min) = SC x ultrafiltrate flow rate (ml/min); diffusion
// clearance = SA x dialysate flow rate (ml/min)", SC and SA being the ratio of the drug's
// concentration in the ultrafiltrate or dialysate to that in blood.
// Corona A, Veronese A, Santini S, et al. Antibiotics. 2022;11:1811 (PMC9774802, CC BY 4.0), re-read
// the same day, for hemofiltration with fluid given before the filter:
//   CL = Cs x Quf x Qp / (Qp + PBP), with Cs the sieving coefficient, Quf the effluent flow, Qp the
//   plasma flow and PBP the pre-filter flow.
//
//   hemofiltration      = SC x ultrafiltrate flow [x Qp / (Qp + pre-filter flow)]
//   hemodialysis        = SA x dialysate flow
//   hemodiafiltration   = the two added together
//   CRRT share of total = CRRT clearance / (CRRT clearance + the patient's other clearance)
// The pre-filter correction is the one read for hemofiltration, so it is applied to the convective
// part only. No sieving or saturation coefficient ships: they differ by filter, drug and study, and
// are the reader's (or the measured effluent-to-plasma ratio). The tool does not turn a clearance
// into a dose.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MODES = [
  { value: 'hemofiltration', text: 'Hemofiltration (CVVH)' },
  { value: 'hemodialysis', text: 'Hemodialysis (CVVHD)' },
  { value: 'hemodiafiltration', text: 'Hemodiafiltration (CVVHDF)' },
];
export const FLOW_UNITS = [
  { value: 'mL-h', text: 'mL/hour' },
  { value: 'mL-min', text: 'mL/min' },
  { value: 'L-h', text: 'L/hour' },
];
const TO_ML_MIN = { 'mL-h': 1 / 60, 'mL-min': 1, 'L-h': 1000 / 60 };
const NOTE = 'A clearance from flows and a coefficient you supply: coefficients differ by filter, drug and study, and fall as a filter ages. The tool does not turn the clearance into a dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function crrtDrugClearance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose the mode: hemofiltration, hemodialysis or hemodiafiltration.' };
  const fu = String(o.flowUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_ML_MIN, fu)) return { valid: false, message: 'Choose the unit the flows are entered in: mL/hour, mL/min or L/hour.' };
  const unit = FLOW_UNITS.find((u) => u.value === fu).text; const kf = TO_ML_MIN[fu];
  const convective = mode !== 'hemodialysis'; const diffusive = mode !== 'hemofiltration';
  const rows = [];
  if (convective) rows.push(['the ultrafiltrate flow', o.ultrafiltrateFlow, null, 1e6, unit], ['the sieving coefficient', o.sievingCoefficient, null, 1.5, '']);
  if (diffusive) rows.push(['the dialysate flow', o.dialysateFlow, null, 1e6, unit], ['the saturation coefficient', o.saturationCoefficient, null, 1.5, '']);
  const f = inputFault(rows);
  if (f) return { valid: false, message: f };
  const stray = [[!convective, o.ultrafiltrateFlow, 'ultrafiltrate flow'], [!convective, o.sievingCoefficient, 'sieving coefficient'], [!diffusive, o.dialysateFlow, 'dialysate flow'], [!diffusive, o.saturationCoefficient, 'saturation coefficient']].find(([off, v]) => off && !blank(v));
  if (stray) return { valid: false, message: `The ${stray[2]} is not part of ${mode}. Clear it, or choose another mode.` };
  const notes = []; let conv = 0; let diff = 0;
  if (convective) {
    const sc = Number(o.sievingCoefficient); const quf = Number(o.ultrafiltrateFlow) * kf;
    conv = sc * quf;
    const hasQp = !blank(o.plasmaFlow); const hasPre = !blank(o.preFilterFlow);
    if (hasQp !== hasPre) return { valid: false, message: 'For fluid given before the filter enter both the plasma flow and the pre-filter flow.' };
    if (hasQp) {
      const pf = inputFault([['the plasma flow', o.plasmaFlow, null, 1e6, unit], ['the pre-filter flow', o.preFilterFlow, 0, 1e6, unit]]);
      if (pf) return { valid: false, message: pf };
      const qp = Number(o.plasmaFlow) * kf; const pre = Number(o.preFilterFlow) * kf;
      conv = sc * quf * (qp / (qp + pre));
      notes.push(`Convective: ${show(sc)} × ${show(quf)} mL/min × ${show(qp)} ÷ (${show(qp)} + ${show(pre)}) = ${show(conv)} mL/min, with the fluid given before the filter diluting the blood.`);
    } else notes.push(`Convective: ${show(sc)} × ${show(quf)} mL/min = ${show(conv)} mL/min.`);
  }
  if (diffusive) {
    const sa = Number(o.saturationCoefficient); const qd = Number(o.dialysateFlow) * kf;
    diff = sa * qd;
    notes.push(`Diffusive: ${show(sa)} × ${show(qd)} mL/min = ${show(diff)} mL/min.`);
    if (!blank(o.plasmaFlow) && mode === 'hemodialysis') return { valid: false, message: 'The pre-filter correction read is for hemofiltration. Clear the plasma and pre-filter flows, or choose a mode with filtration.' };
  }
  const crrt = conv + diff;
  notes.push(`CRRT clearance: ${show(crrt)} mL/min, which is ${show((crrt * 60) / 1000)} L/hour.`);
  const out = { valid: true, convectiveMlMin: sig(conv), diffusiveMlMin: sig(diff), crrtMlMin: sig(crrt), crrtLPerHour: sig((crrt * 60) / 1000) };
  let band = `CRRT clears ${show(crrt)} mL/min (${show((crrt * 60) / 1000)} L/hour)`;
  if (!blank(o.otherClearance)) {
    const of = inputFault([['the patient\'s other clearance', o.otherClearance, 0, 1e4, 'mL/min']]);
    if (of) return { valid: false, message: of };
    const other = Number(o.otherClearance); const total = crrt + other; const share = (crrt / total) * 100;
    Object.assign(out, { totalMlMin: sig(total), crrtSharePercent: sig(share) });
    notes.push(`With ${show(other)} mL/min from the patient: total ${show(total)} mL/min, of which CRRT is ${show(share)}%.`);
    band += `, ${show(share)}% of a total of ${show(total)} mL/min`;
  } else notes.push('No other clearance was entered, so only the CRRT clearance is given.');
  return { ...out, band: `${band}.`, bandLabel: `${show(crrt)} mL/min`, notes, note: NOTE };
}
