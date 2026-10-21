// spec-v1398: California wildfire smoke rule -- what 8 CCR 5141.1 requires at this AQI.
//
// Source: Cal/OSHA, Title 8 section 5141.1 (dir.ca.gov, read 2026-09-18).
//   (a)(1) Applies where the current AQI for PM2.5 is 151 or greater and exposure to wildfire smoke
//     is reasonably anticipated. (a)(2) Exempt: filtered enclosed buildings or vehicles kept closed;
//     worksite PM2.5 measured below AQI 151; exposure at AQI 151 or more "for a total of one hour or
//     less during a shift"; wildland firefighters.
//   (f)(3)(A) From 151 to 500: provide NIOSH-approved respirators such as N95s for voluntary use and
//     encourage their use; for filtering facepieces used voluntarily, no fit test or medical
//     evaluation is required. (f)(3)(B) Above 500: respirators are required under section 5144.
//   (f)(1), (2): engineering, then administrative controls, to bring exposure below AQI 151.
//
// Pure: no DOM, no clock, no network.

// 5141.1 Appendix A(d): "The employer shall use the following table to convert the PM2.5 concentration to the AQI
// for PM2.5" (read on dir.ca.gov October 20, 2026). It is the older EPA table, not EPA's 2024 breakpoints: 250.5 to
// 500.4 ug/m3 is AQI 301 to 500, so 325.5 to 500.4 ug/m3 is under AQI 500 here (voluntary N95s), not above it.
const APPENDIX_A = [[0, 12.0, 0, 50], [12.1, 35.4, 51, 100], [35.5, 55.4, 101, 150], [55.5, 150.4, 151, 200], [150.5, 250.4, 201, 300], [250.5, 500.4, 301, 500]];
function appendixAqi(c) {
  const t = Math.floor(c * 10 + 1e-9) / 10; // concentrations are read to 0.1 ug/m3, as the table prints them
  const row = APPENDIX_A.find(([lo, hi]) => t >= lo && t <= hi);
  if (!row) return 501; // above 500.4: past the table, above AQI 500
  const [clo, chi, ilo, ihi] = row;
  return Math.round(((ihi - ilo) / (chi - clo)) * (t - clo) + ilo);
}
function appendixConc(aqi) {
  const row = APPENDIX_A.find(([, , ilo, ihi]) => aqi >= ilo && aqi <= ihi);
  if (!row) return null;
  const [clo, chi, ilo, ihi] = row;
  return ((chi - clo) / (ihi - ilo)) * (aqi - ilo) + clo;
}

export const WS_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function caloshaWildfireSmoke(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hasA = !isBlank(o.aqi);
  const hasC = !isBlank(o.conc);
  if (!hasA && !hasC) return { valid: false, message: 'Enter the current AQI for PM2.5, or a PM2.5 concentration in ug/m3.' };
  if (hasA && hasC) return { valid: false, message: 'Enter the AQI or the concentration, not both.' };
  let aqi;
  if (hasA) {
    aqi = Number(String(o.aqi).trim());
    if (!Number.isFinite(aqi) || aqi < 0 || aqi > 999) return { valid: false, message: 'Enter an AQI between 0 and 999.' };
    aqi = Math.round(aqi);
  } else {
    const c = Number(String(o.conc).trim());
    if (!Number.isFinite(c) || c < 0 || c > 1000) return { valid: false, message: 'Enter a PM2.5 concentration between 0 and 1,000 ug/m3.' };
    aqi = appendixAqi(c);
  }
  if (isBlank(o.hours)) return { valid: false, message: 'Enter the hours of exposure during the shift. One hour or less is exempt.' };
  const h = Number(String(o.hours).trim());
  if (!Number.isFinite(h) || h < 0 || h > 24) return { valid: false, message: 'Enter the hours of exposure, 0 to 24.' };
  const base = { valid: true, aqi, concNote: hasA ? (appendixConc(aqi) === null ? `AQI ${aqi} is above the 500.4 ug/m3 at the top of the 5141.1 Appendix A table.` : `AQI ${aqi} is about ${appendixConc(aqi).toFixed(1)} ug/m3 of PM2.5 by the 5141.1 Appendix A table.`) : (aqi > 500 ? `${Number(String(o.conc).trim())} ug/m3 is above 500.4, the top of the 5141.1 Appendix A table: above AQI 500.` : `${Number(String(o.conc).trim())} ug/m3 is AQI ${aqi} by the 5141.1 Appendix A table.`) };

  if (aqi < 151) return { ...base, level: 'none', abnormal: false, bandLabel: 'No requirement under 5141.1', band: `At AQI ${aqi}, below 151, the wildfire smoke rule does not apply (5141.1(a)(1)).` };
  if (h <= 1) return { ...base, level: 'exempt', abnormal: false, bandLabel: 'Exempt: one hour or less', band: `Exposure of ${h} hour${h === 1 ? '' : 's'} at AQI ${aqi} is a total of one hour or less in the shift, which is exempt (5141.1(a)(2)(D)).` };
  if (aqi <= 500) {
    return {
      ...base, level: 'voluntary', abnormal: true, bandLabel: 'Provide N95s for voluntary use',
      band: `At AQI ${aqi} (151 to 500) for ${h} hours this shift, provide NIOSH-approved respirators such as N95s for voluntary use and encourage their use. No fit test or medical evaluation is needed for voluntary filtering facepieces (5141.1(f)(3)(A)). Use engineering and then administrative controls first where feasible.`,
    };
  }
  return {
    ...base, level: 'required', abnormal: true, bandLabel: 'Respirators required',
    band: `Above AQI 500, respirator use is required under the full respiratory protection program of section 5144, with a protection factor that brings exposure below AQI 151 (5141.1(f)(3)(B)).`,
  };
}
