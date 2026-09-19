// spec-v1398: Air Quality Index from a 24-hour PM2.5 concentration, and back, with EPA's 2024
// breakpoints.
//
// Source: U.S. EPA, Technical Assistance Document for the Reporting of Daily Air Quality -- the Air
// Quality Index (AQI), AirNow, May 2026, Table 6 and Equation 1 (read 2026-09-18). PM2.5 24-hour
// breakpoints (ug/m3) after the 2024 PM NAAQS revision: 0.0-9.0 Good (0-50); 9.1-35.4 Moderate
// (51-100); 35.5-55.4 Unhealthy for Sensitive Groups (101-150); 55.5-125.4 Unhealthy (151-200);
// 125.5-225.4 Very Unhealthy (201-300); 225.5 and above Hazardous (301+), with AQI 500 at 325.4 and
// values above 500 extended on that last segment. The concentration is TRUNCATED to one decimal,
// then Equation 1 is applied and the index rounded to the nearest integer. Before May 2024 Good ran
// to 12.0, so an older calculator calls 10 ug/m3 "Good"; this one calls it Moderate.
//
// Pure: no DOM, no clock, no network.

export const AQI_VERIFIED = '2026-09-18';
export const SENSITIVE = [
  { value: 'yes', text: 'Yes: heart or lung disease, a child, an older adult, or pregnant' },
  { value: 'no', text: 'No' },
];
export const BANDS = [
  { cLo: 0.0, cHi: 9.0, iLo: 0, iHi: 50, name: 'Good' },
  { cLo: 9.1, cHi: 35.4, iLo: 51, iHi: 100, name: 'Moderate' },
  { cLo: 35.5, cHi: 55.4, iLo: 101, iHi: 150, name: 'Unhealthy for Sensitive Groups' },
  { cLo: 55.5, cHi: 125.4, iLo: 151, iHi: 200, name: 'Unhealthy' },
  { cLo: 125.5, cHi: 225.4, iLo: 201, iHi: 300, name: 'Very Unhealthy' },
  { cLo: 225.5, cHi: 325.4, iLo: 301, iHi: 500, name: 'Hazardous' },
];
// Short paraphrases of EPA's PM2.5 cautionary guidance by category.
const ADVICE = {
  Good: { general: 'Air quality is satisfactory.', sensitive: 'No special precautions.' },
  Moderate: { general: 'Acceptable for most people.', sensitive: 'Unusually sensitive people should consider shorter, less intense outdoor activity and go inside if symptoms start.' },
  'Unhealthy for Sensitive Groups': { general: 'Most people are not likely to be affected.', sensitive: 'Reduce long or heavy outdoor exertion; take breaks and watch for coughing or shortness of breath. People with asthma should follow their asthma action plan.' },
  Unhealthy: { general: 'Everyone should reduce long or heavy outdoor exertion.', sensitive: 'Avoid long or heavy outdoor exertion; move activities indoors or reschedule.' },
  'Very Unhealthy': { general: 'Everyone should avoid long or heavy outdoor exertion.', sensitive: 'Avoid all physical activity outdoors.' },
  Hazardous: { general: 'Everyone should avoid all physical activity outdoors.', sensitive: 'Stay indoors, keep activity low, and follow the local health department\'s advice.' },
};

const trunc1 = (c) => Math.floor(c * 10 + 1e-9) / 10;

// Concentration (ug/m3) -> AQI, per Equation 1 with the concentration truncated to 0.1.
export function pm25ToAqi(conc) {
  const c = trunc1(conc);
  const band = BANDS.find((b) => c >= b.cLo && c <= b.cHi) || (c > 325.4 ? BANDS[5] : null);
  if (!band) return null;
  const i = ((band.iHi - band.iLo) / (band.cHi - band.cLo)) * (c - band.cLo) + band.iLo;
  return { aqi: Math.round(i), category: band.name, conc: c };
}
// AQI -> the lowest one-decimal concentration that reports that AQI (so the round trip holds).
export function aqiToPm25(aqi) {
  const a = Math.round(aqi);
  const band = BANDS.find((b) => a >= b.iLo && a <= b.iHi) || (a > 500 ? BANDS[5] : null);
  if (!band) return null;
  const guess = ((a - band.iLo) * (band.cHi - band.cLo)) / (band.iHi - band.iLo) + band.cLo;
  for (let c = Math.max(band.cLo, trunc1(guess) - 1); c <= band.cHi + 400; c = Math.round((c + 0.1) * 10) / 10) {
    const r = pm25ToAqi(c);
    if (r && r.aqi === a) return c;
    if (r && r.aqi > a) break;
  }
  return null;
}

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function aqiPm25(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hasC = !isBlank(o.conc);
  const hasA = !isBlank(o.aqi);
  if (!hasC && !hasA) return { valid: false, message: 'Enter a 24-hour PM2.5 concentration in ug/m3, or an AQI value.' };
  if (hasC && hasA) return { valid: false, message: 'Enter the concentration or the AQI, not both; each is computed from the other.' };
  let conc;
  let aqi;
  let category;
  if (hasC) {
    const c = Number(String(o.conc).trim());
    if (!Number.isFinite(c) || c < 0 || c > 1000) return { valid: false, message: 'Enter a PM2.5 concentration between 0 and 1,000 ug/m3.' };
    const r = pm25ToAqi(c);
    ({ aqi, category } = r);
    conc = r.conc;
  } else {
    const a = Number(String(o.aqi).trim());
    if (!Number.isFinite(a) || a < 0 || a > 999) return { valid: false, message: 'Enter an AQI between 0 and 999.' };
    conc = aqiToPm25(a);
    const r = pm25ToAqi(conc);
    ({ aqi, category } = r);
  }
  const sens = o.sensitive === 'yes' ? true : o.sensitive === 'no' ? false : null;
  const adv = ADVICE[category];
  return {
    valid: true,
    aqi,
    category,
    conc,
    abnormal: aqi > 100,
    bandLabel: `AQI ${aqi}: ${category}`,
    band: hasC
      ? `PM2.5 ${conc.toFixed(1)} ug/m3 (truncated to one decimal) is AQI ${aqi}, ${category}.`
      : `AQI ${aqi} (${category}) corresponds to PM2.5 of ${conc.toFixed(1)} ug/m3 or a little more.`,
    advice: sens === null
      ? [`Everyone: ${adv.general}`, `Sensitive groups: ${adv.sensitive}`]
      : [sens ? `This patient (a sensitive group): ${adv.sensitive}` : `This patient: ${adv.general}`],
    breakpointNote: 'EPA revised the PM2.5 breakpoints in 2024: Good now ends at 9.0 ug/m3 (it was 12.0), so a calculator from before May 2024 calls 10 ug/m3 Good. These are 24-hour values; the hourly NowCast that AirNow shows is computed the same way.',
  };
}
