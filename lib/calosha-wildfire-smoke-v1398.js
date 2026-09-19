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

import { aqiToPm25, pm25ToAqi } from './aqi-pm25-v1398.js';

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
    aqi = pm25ToAqi(c).aqi;
  }
  if (isBlank(o.hours)) return { valid: false, message: 'Enter the hours of exposure during the shift. One hour or less is exempt.' };
  const h = Number(String(o.hours).trim());
  if (!Number.isFinite(h) || h < 0 || h > 24) return { valid: false, message: 'Enter the hours of exposure, 0 to 24.' };
  const base = { valid: true, aqi, concNote: hasA ? `AQI ${aqi} is about ${aqiToPm25(Math.min(aqi, 999)).toFixed(1)} ug/m3 of PM2.5.` : null };

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
