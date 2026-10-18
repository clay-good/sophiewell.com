// spec-v1630 tool 17: air changes per hour and clearance time.
//
// CDC, Guidelines for Environmental Infection Control in Health-Care Facilities (2003), Appendix B,
// Table B.1 and its formula (page dated January 11, 2024), re-read on October 11, 2026:
//   t2 - t1 = -[ln(C2 / C1) / (Q / V)] x 60, with t1 = 0
//   C2 / C1 = 1 - (removal efficiency / 100); Q = air flow rate in cubic feet/hour; V = room volume
//   in cubic feet; Q / V = ACH.
// So air changes per hour = airflow (CFM) x 60 / volume (cubic feet), and the minutes to remove 99%
// and 99.9% of an airborne contaminant are ln(100) / ACH x 60 and ln(1,000) / ACH x 60. CDC prints
// its table to the whole minute (12 ACH: 23 and 35); the tool shows one decimal place.
//
// CDC's footnote: the values "apply to an empty room with no aerosol-generating source" and "assume
// perfect mixing of the air within the space (i.e., mixing factor = 1)"; "removal times will be
// longer in rooms or areas with imperfect mixing or air stagnation." The result repeats that.
//
// One reference point is shown as text, never applied as a band: FDA's aseptic processing guidance
// (September 2004), "For Class 100,000 (ISO 8) supporting rooms, airflow sufficient to achieve at
// least 20 air changes per hour is typically acceptable." CDC's Table B.2 (ventilation requirements
// by room) is reprinted there from the 2001 AIA guidelines with permission; on the owner's rule of
// October 17, 2026 (anything that can be proved, reprints included) two of its figures are shown as a
// second reference point, re-read that day: an airborne infection isolation room and a protective
// environment room each a minimum of 12 total air changes per hour, and the table's note "Differential
// pressure shall be a minimum of 0.01" water gauge (2.5 Pa)". A required air change rate is the
// reader's own.
//
// 1 foot = 0.3048 m exactly, so 1 cubic foot = 0.028316846592 cubic meters. The CDC page is under
// the weekly page watch.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const SOURCE = {
  edition: 'January 11, 2024', route: 'B', readOn: '2026-10-11',
  source: { label: 'CDC, Environmental Infection Control Guidelines, Appendix B. Air (Table B.1)', url: 'https://www.cdc.gov/infection-control/hcp/environmental-control/appendix-b-air.html' },
};
export const AIRFLOW_UNITS = [
  { value: 'cfm', text: 'CFM (cubic feet per minute)' },
  { value: 'm3h', text: 'm³/hour' },
];
export const ROOM_UNITS = [
  { value: 'ft', text: 'Feet (volume in cubic feet)' },
  { value: 'm', text: 'Meters (volume in cubic meters)' },
];
const FT3_PER_M3 = 1 / 0.028316846592;
const NOTE = 'CDC: these times apply to an empty room with no aerosol-generating source and assume perfect mixing; they are longer with imperfect mixing or air stagnation. The tool does the arithmetic; it does not say a room is safe to enter or fit for use.';
const REFERENCE = 'A reference point, not applied here: FDA\'s 2004 aseptic processing guidance calls at least 20 air changes per hour typically acceptable for Class 100,000 (ISO 8) supporting rooms. Your own standard sets the requirement.';
const REFERENCE_B2 = 'Another, not applied here: CDC Table B.2 (from the 2001 AIA guidelines) gives an airborne infection isolation room and a protective environment room at least 12 total air changes per hour, with at least 0.01 in. water gauge (2.5 Pa) differential pressure.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
const one = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function roomAirChanges(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const au = String(o.airflowUnit ?? '').trim();
  if (au !== 'cfm' && au !== 'm3h') return { valid: false, message: 'Choose the airflow unit: CFM or m³/hour.' };
  const ru = String(o.roomUnit ?? '').trim();
  if (ru !== 'ft' && ru !== 'm') return { valid: false, message: 'Choose the room unit: feet or meters.' };
  const af = inputFault([['the airflow', o.airflow, null, 1e9, au === 'cfm' ? 'CFM' : 'm³/hour']]);
  if (af) return { valid: false, message: af };
  const vu = ru === 'ft' ? 'ft³' : 'm³';
  const dims = [['the room length', o.length], ['the room width', o.width], ['the room height', o.height]];
  const anyDim = dims.some(([, v]) => !blank(v));
  let volume; let volumeLine;
  if (!blank(o.volume)) {
    if (anyDim) return { valid: false, message: 'Enter the room volume or its three dimensions, not both.' };
    const vf = inputFault([['the room volume', o.volume, null, 1e9, vu]]);
    if (vf) return { valid: false, message: vf };
    volume = Number(o.volume); volumeLine = `Room volume: ${show(volume)} ${vu}.`;
  } else {
    if (!anyDim) return { valid: false, message: 'Enter the room volume, or its length, width and height.' };
    const df = inputFault(dims.map(([label, v]) => [label, v, null, 1e4, ru]));
    if (df) return { valid: false, message: df };
    const [l, w, h] = dims.map(([, v]) => Number(v));
    volume = l * w * h; volumeLine = `Room volume: ${show(l)} × ${show(w)} × ${show(h)} = ${show(volume)} ${vu}.`;
  }
  // Both as cubic feet per hour and cubic feet, CDC's own units.
  const airflow = Number(o.airflow);
  const qFt3h = au === 'cfm' ? airflow * 60 : airflow * FT3_PER_M3;
  const vFt3 = ru === 'ft' ? volume : volume * FT3_PER_M3;
  const ach = qFt3h / vFt3;
  if (!(ach > 0) || !Number.isFinite(ach)) return { valid: false, message: 'These values do not give an air change rate. Check the airflow and the room size.' };
  const t99 = (Math.log(100) / ach) * 60; const t999 = (Math.log(1000) / ach) * 60;
  const same = (au === 'cfm') === (ru === 'ft');
  const achLine = au === 'cfm' && ru === 'ft'
    ? `Air changes per hour: ${show(airflow)} CFM × 60 ÷ ${show(volume)} ft³ = ${show(ach)}.`
    : au === 'm3h' && ru === 'm'
      ? `Air changes per hour: ${show(airflow)} m³/hour ÷ ${show(volume)} m³ = ${show(ach)}.`
      : `Air changes per hour: ${show(qFt3h)} ft³/hour ÷ ${show(vFt3)} ft³ = ${show(ach)} (1 ft³ = 0.028316846592 m³).`;
  const notes = [
    volumeLine, achLine,
    `Time to remove 99%: ln(100) ÷ ${show(ach)} × 60 = ${one(t99)} minutes. Time to remove 99.9%: ln(1,000) ÷ ${show(ach)} × 60 = ${one(t999)} minutes. CDC's table prints whole minutes.`,
  ];
  const out = { valid: true, ach: sig(ach), minutes99: Math.round(t99 * 10) / 10, minutes999: Math.round(t999 * 10) / 10, volume: sig(volume), sameUnits: same };
  let band = `${show(ach)} air changes per hour: about ${one(t99)} minutes to remove 99% and ${one(t999)} minutes to remove 99.9%.`;
  if (!blank(o.requiredAch)) {
    const rf = inputFault([['the required air changes per hour', o.requiredAch, null, 1e5, '']]);
    if (rf) return { valid: false, message: rf };
    const req = Number(o.requiredAch);
    const needFt3h = req * vFt3;
    const need = au === 'cfm' ? needFt3h / 60 : needFt3h / FT3_PER_M3;
    const unit = au === 'cfm' ? 'CFM' : 'm³/hour';
    const below = sig(ach) < req;
    notes.push(`Your requirement of ${show(req)} air changes per hour takes ${show(need)} ${unit} in this room; the airflow entered is ${show(airflow)} ${unit}${below ? `, ${show(need - airflow)} ${unit} short` : ''}.`);
    band = `${show(ach)} air changes per hour, ${below ? 'below' : 'at or above'} your requirement of ${show(req)}. About ${one(t99)} minutes to remove 99% and ${one(t999)} minutes to remove 99.9%.`;
    Object.assign(out, { requiredAch: req, airflowNeeded: sig(need), belowRequirement: below, abnormal: below });
  }
  notes.push(REFERENCE);
  notes.push(REFERENCE_B2);
  return { ...out, band, bandLabel: `${show(ach)} air changes per hour`, notes, note: NOTE };
}
