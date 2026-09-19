// spec-v1398: California indoor heat rule -- does 8 CCR 3396 apply, and are control measures required?
//
// Source: Cal/OSHA, Title 8 section 3396 (dir.ca.gov, read 2026-09-18).
//   (a)(1) Applies to indoor work areas where the temperature equals or exceeds 82F while employees
//     are present. Exception (C): incidental exposure at or above 82F and below 95F for less than 15
//     minutes in any 60 -- except in vehicles without working air conditioning and in shipping or
//     intermodal containers during loading or unloading. Exceptions (B), (D), (E): telework,
//     emergency operations, and certain correctional facilities.
//   (a)(2) Assessment and control measures (subsection (e)) are required when the temperature or the
//     heat index equals or exceeds 87F, or the temperature equals or exceeds 82F and employees wear
//     clothing that restricts heat removal or work in a high radiant heat area.
//
// Pure: no DOM, no clock, no network.

export const IH_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function caloshaIndoorHeat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.tempF)) return { valid: false, message: 'Enter the indoor temperature in degrees Fahrenheit. The rule starts at 82F.' };
  const t = Number(String(o.tempF).trim());
  if (!Number.isFinite(t) || t < 32 || t > 160) return { valid: false, message: 'Enter an indoor temperature between 32 and 160F.' };
  let hi = null;
  if (!isBlank(o.heatIndexF)) {
    hi = Number(String(o.heatIndexF).trim());
    if (!Number.isFinite(hi) || hi < 32 || hi > 200) return { valid: false, message: 'Enter a heat index between 32 and 200F, or leave it blank.' };
  }
  for (const [k, what] of [['clothing', 'whether workers wear clothing that restricts heat removal'], ['radiant', 'whether they work in a high radiant heat area']]) {
    if (o[k] !== 'yes' && o[k] !== 'no') return { valid: false, message: `Answer ${what}. At 82F either one requires control measures.` };
  }
  let minutes = null;
  if (!isBlank(o.minutesPerHour)) {
    minutes = Number(String(o.minutesPerHour).trim());
    if (!Number.isFinite(minutes) || minutes < 0 || minutes > 60) return { valid: false, message: 'Enter the minutes of exposure in any 60-minute period, 0 to 60.' };
  }
  const vehicle = o.vehicleOrContainer === 'yes';

  if (t < 82) {
    return { valid: true, applies: false, controls: false, abnormal: false, bandLabel: 'Below 82F', band: `At ${t}F the indoor heat rule does not apply; it starts at 82F (3396(a)(1)).` };
  }
  if (t < 95 && minutes !== null && minutes < 15 && !vehicle) {
    return { valid: true, applies: false, controls: false, abnormal: false, bandLabel: 'Incidental exposure: exempt', band: `${minutes} minutes in 60 at ${t}F is incidental exposure, under 15 minutes and below 95F, so the rule does not apply (3396(a)(1)(C)). The exemption does not cover vehicles without working air conditioning or loading containers.` };
  }
  const triggers = [];
  if (t >= 87) triggers.push(`temperature ${t}F is 87F or more`);
  if (hi !== null && hi >= 87) triggers.push(`heat index ${hi}F is 87F or more`);
  if (o.clothing === 'yes') triggers.push('clothing restricts heat removal at 82F or more');
  if (o.radiant === 'yes') triggers.push('high radiant heat at 82F or more');
  const controls = triggers.length > 0;
  return {
    valid: true,
    applies: true,
    controls,
    abnormal: true,
    bandLabel: controls ? 'Rule applies; control measures required' : 'Rule applies; control measures not triggered',
    band: controls
      ? `At ${t}F the indoor heat rule applies, and assessment and control measures are required because ${triggers.join('; ')} (3396(a)(2), (e)). Measure and record the temperature or heat index, whichever is greater, and use engineering and administrative controls.`
      : `The indoor heat rule applies at ${t}F: water, cool-down areas, emergency response, close observation, and training. Control measures are not triggered${hi === null ? ', but the heat index was not entered, and at 87F or more it would trigger them' : ''} (3396(a)).`,
    minutesNote: minutes === null && t < 95 ? 'If exposure is under 15 minutes in any hour and below 95F, the rule does not apply; enter the minutes to check.' : null,
  };
}
