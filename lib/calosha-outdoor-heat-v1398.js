// spec-v1398: California outdoor heat rule -- what 8 CCR 3395 requires at this temperature.
//
// Source: Cal/OSHA, Title 8 section 3395 (dir.ca.gov, read 2026-09-18).
//   (a) Applies to all outdoor places of employment; (e) high-heat procedures apply only to the
//     industries in (a)(2): agriculture; construction; landscaping; oil and gas extraction; and
//     transportation or delivery of agricultural products, construction materials, or other heavy
//     materials (not operating an air-conditioned vehicle without loading or unloading).
//   (c) Water: enough at the start of the shift for one quart per employee per hour, or effective
//     replenishment.
//   (d) Shade "when the temperature exceeds 80 degrees Fahrenheit".
//   (e) High-heat procedures "when the temperature equals or exceeds 95 degrees Fahrenheit";
//     (e)(6) AGRICULTURE ONLY: a minimum ten-minute net preventative cool-down rest every two hours.
//   (g)(1) Close observation during a heat wave: a day whose predicted high is at least 80F and at
//     least 10F above the average high of the preceding five days. (g)(2) A worker newly assigned to a
//     high-heat area is closely observed for the first 14 days.
//
// Pure: no DOM, no clock, no network.

export const OH_VERIFIED = '2026-09-18';
export const INDUSTRIES = [
  { value: 'agriculture', text: 'Agriculture' },
  { value: 'construction', text: 'Construction' },
  { value: 'landscaping', text: 'Landscaping' },
  { value: 'oil-gas', text: 'Oil and gas extraction' },
  { value: 'heavy-transport', text: 'Transporting agricultural products, construction materials, or other heavy materials' },
  { value: 'other', text: 'Another outdoor industry' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function num(v) {
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

export function caloshaOutdoorHeat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.tempF)) return { valid: false, message: 'Enter the temperature in degrees Fahrenheit. Shade starts above 80F and high-heat procedures at 95F.' };
  const t = num(o.tempF);
  if (t === null || t < -40 || t > 140) return { valid: false, message: 'Enter a temperature between -40 and 140F.' };
  const ind = INDUSTRIES.find((x) => x.value === o.industry);
  if (!ind) return { valid: false, message: 'Choose the industry. High-heat procedures apply only to five listed industries.' };

  const req = ['Water free of charge, as close as practicable: enough for one quart per worker per hour for the shift, or effective replenishment (3395(c)).'];
  if (t > 80) req.push('Shade, open to the air or ventilated, for everyone on a rest or recovery period (3395(d)).');
  const listed = ind.value !== 'other';
  if (t >= 95) {
    if (listed) {
      req.push('High-heat procedures: reliable communication with a supervisor, observation of workers (a supervisor for 20 or fewer, a buddy system, or regular contact), a designated person to call emergency services, water reminders, and a pre-shift meeting (3395(e)).');
      if (ind.value === 'agriculture') req.push('Agriculture: a ten-minute net preventative cool-down rest every two hours, and another at the end of the eighth and tenth hours of a longer day (3395(e)(6)).');
    }
  }

  let heatWave = null;
  if (!isBlank(o.priorHighs)) {
    const vals = String(o.priorHighs).split(/[,;\s]+/).filter(Boolean).map(num);
    if (vals.length !== 5 || vals.some((v) => v === null)) return { valid: false, message: 'Enter the high temperatures of the preceding five days, separated by commas.' };
    const avg = vals.reduce((a, b) => a + b, 0) / 5;
    heatWave = { is: t >= 80 && t >= avg + 10, avg: Math.round(avg * 10) / 10 };
    if (heatWave.is) req.push(`Heat wave: ${t}F is at least 80F and at least 10F above the prior five-day average high of ${heatWave.avg}F, so every worker is closely observed (3395(g)(1)).`);
  }
  const newNote = 'A worker newly assigned to a high-heat area is closely observed for the first 14 days (3395(g)(2)).';
  return {
    valid: true,
    abnormal: t > 80,
    bandLabel: t >= 95 && listed ? 'High-heat procedures in force' : t > 80 ? 'Shade required' : 'Water and planning only',
    band: `At ${t}F in ${ind.text.toLowerCase()}: ${t >= 95 ? (listed ? 'shade and high-heat procedures apply.' : 'shade applies; high-heat procedures do not, because the industry is not one of the five listed.') : t > 80 ? 'shade applies; high-heat procedures start at 95F.' : 'no shade trigger yet (above 80F); water and the prevention plan always apply.'}`,
    requirements: req,
    heatWaveNote: heatWave === null
      ? 'Enter the preceding five days\' highs to check for a heat wave (at least 80F and at least 10F above their average).'
      : (heatWave.is ? null : `Not a heat wave: the prior five-day average high was ${heatWave.avg}F, so ${t}F is less than 10F above it or below 80F.`),
    newNote,
  };
}
