// spec-v1635 tool 26: molybdenum-99, strontium-82 and strontium-85 breakthrough against the limits.
//
// Sources. 10 CFR 35.204 and 35.3204, read on eCFR as current October 8, 2026 (re-read October 11, 2026):
//   35.204(a)  a licensee may not administer a radiopharmaceutical that contains more than 0.15
//              microcurie of molybdenum-99 per millicurie of technetium-99m, or more than 0.02
//              microcurie of strontium-82 or 0.2 microcurie of strontium-85 per millicurie of
//              rubidium-82 chloride injection.
//   35.204(e), 35.3204  a measurement over those limits "at the time of generator elution" is
//              reported: by telephone to the NRC Operations Center and the generator's distributor
//              within 7 calendar days after discovery, and in writing within 30 calendar days.
// FDA labels, re-read on DailyMed October 11, 2026, each on a label row (spec-v1628 section 1):
//   Technelite: not more than 0.15 microcurie of Mo-99 per millicurie of Tc-99m "per administered
//     dose at the time of administration"; not more than 10 micrograms of aluminum per milliliter of
//     eluate; the eluate is not used after 12 hours from elution. Half-lives 6.02 hours (Tc-99m) and
//     66 hours (Mo-99), so the ratio grows with time:
//       ratio(t) = ratio at elution x 2^(t / 6.02 h - t / 66 h)
//   Cardiogen-82, Expiration Limits (stop using the generator): 17 L cumulative eluate volume, 60 days
//     after calibration, Sr-82 0.01 microCi/mCi Rb-82, Sr-85 0.1 microCi/mCi Rb-82. Alert Limits
//     (additional testing): 14 L, Sr-82 0.002, Sr-85 0.02.
// The rule's limit is on what is administered; its report is for an exceedance at elution. The two
// tests are kept apart, and the rule and the label are shown side by side.
//
// Pure: the clock is a parameter (used only for the label rows).

import { sigSafe } from './cut-display.js';
import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const GENERATORS = [
  { value: 'tc-99m', text: 'Mo-99/Tc-99m generator (Technelite label)', label: { name: 'Technelite', setId: '3ae14c6b-3daf-4dd1-bbdb-e990fe8100e4' } },
  { value: 'rb-82', text: 'Sr-82/Rb-82 generator (Cardiogen-82 label)', label: { name: 'Cardiogen-82', setId: 'ee95aa18-9f2f-40eb-9b4c-583bea6f36bf' } },
];
const NOTE = 'A check of the reader\'s own measurements against the rule and the generator label. It does not replace the eluate testing protocol on the label or the licensee\'s procedures, and another generator\'s label may set different limits. Agreement State rules may differ.';
const REPORT = 'A measurement over the rule\'s limit at the time of elution is reported: by telephone to the NRC Operations Center and the generator\'s distributor within 7 calendar days after discovery, and in writing to the NRC Regional Office within 30 calendar days (10 CFR 35.204(e), 35.3204).';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(x.toPrecision(3)).toLocaleString('en-US', { maximumSignificantDigits: 3 });
// A Mo-99 ratio shown with enough digits to sit on the right side of the 0.15 limit.
const sigR = (x) => sigSafe(x, [0.15], 3).toLocaleString('en-US', { maximumSignificantDigits: 15 });

export function generatorBreakthroughCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const g = GENERATORS.find((x) => x.value === String(o.generator ?? '').trim());
  if (!g) return { valid: false, message: 'Choose the generator: molybdenum-99/technetium-99m, or strontium-82/rubidium-82.' };
  const lr = labelRow(g.label.setId, now, table);
  const labelLine = lr.answers ? `Label: ${lr.edition}.` : `The ${g.label.name} label figures are withheld: ${lr.why}. Only the rule's limits are applied; read the label in hand for the rest.`;
  const base = { valid: true, labelUrl: lr.url, labelAnswers: lr.answers };
  if (g.value === 'tc-99m') {
    const f = inputFault([['the molybdenum-99 activity at elution', o.mo99MicroCi, 0, 1e7, 'µCi'], ['the technetium-99m activity at elution', o.tc99mMilliCi, null, 1e6, 'mCi']]);
    if (f) return { valid: false, message: f };
    const r0 = Number(o.mo99MicroCi) / Number(o.tc99mMilliCi);
    const notes = [`At elution: ${Number(o.mo99MicroCi).toLocaleString('en-US')} µCi Mo-99 ÷ ${Number(o.tc99mMilliCi).toLocaleString('en-US')} mCi Tc-99m = ${sigR(r0)} µCi/mCi, against the limit of 0.15 (10 CFR 35.204(a)(1)).`];
    const overAtElution = r0 > 0.15;
    const out = { ...base, ratioAtElution: Number(r0.toPrecision(6)), exceedsAtElution: overAtElution };
    let band; let label; let abnormal = overAtElution;
    if (overAtElution) {
      band = `Mo-99 breakthrough ${sigR(r0)} µCi/mCi at elution is over the 0.15 limit: the eluate may not be administered.`;
      label = 'Over the limit at elution';
      notes.push(REPORT);
    } else if (!lr.answers) {
      band = `Mo-99 breakthrough ${sigR(r0)} µCi/mCi at elution is within the 0.15 limit. The ratio rises as technetium decays; the label's half-lives are withheld, so no later time is computed.`;
      label = 'Within the limit at elution'; abnormal = true;
    } else {
      // The ratio doubles every 1 / (1/6.02 - 1/66) hours.
      const rate = 1 / 6.02 - 1 / 66;
      const tLimit = r0 > 0 ? Math.log2(0.15 / r0) / rate : Infinity;
      const useBy = Math.min(tLimit, 12);
      out.hoursUntilLimit = Number.isFinite(tLimit) ? Number(tLimit.toPrecision(4)) : null; out.latestAdministrationHours = Number(useBy.toPrecision(4));
      notes.push(`The ratio rises as Tc-99m (6.02 hours) decays faster than Mo-99 (66 hours): it reaches 0.15 ${Number.isFinite(tLimit) ? `${sig(tLimit)} hours after elution` : 'never, with no Mo-99 measured'}. The label also says the eluate is not used after 12 hours from elution, so the latest administration is ${sig(useBy)} hours after elution${tLimit < 12 ? ', set by the breakthrough limit' : ', set by the 12-hour limit'}.`);
      band = `Mo-99 breakthrough ${sigR(r0)} µCi/mCi at elution is within the 0.15 limit; it stays within it for ${sig(useBy)} hours after elution.`;
      label = `Within the limit for ${sig(useBy)} hours`;
      if (!blank(o.hoursToAdministration)) {
        const hf = inputFault([['the hours from elution to administration', o.hoursToAdministration, 0, 1000, '']]);
        if (hf) return { valid: false, message: hf };
        const t = Number(o.hoursToAdministration); const rt = r0 * 2 ** (t * rate);
        const bad = rt > 0.15 || t > 12;
        out.ratioAtAdministration = Number(rt.toPrecision(6)); out.acceptableAtAdministration = !bad; abnormal = bad;
        notes.push(`At ${t} hours after elution the ratio is ${sigR(rt)} µCi/mCi${rt > 0.15 ? ', over the limit' : ', within the limit'}${t > 12 ? '; that is past the label\'s 12 hours' : ''}.`);
        band = `Mo-99 breakthrough ${sigR(rt)} µCi/mCi at ${t} hours after elution: ${bad ? (rt > 0.15 ? 'over the 0.15 limit at administration' : 'within the ratio limit, but past the label\'s 12 hours') : 'within the 0.15 limit at administration'}.`;
        label = bad ? 'Not acceptable at that time' : 'Within the limit at that time';
      }
    }
    if (!blank(o.aluminumMcgPerMl)) {
      const af = inputFault([['the aluminum concentration', o.aluminumMcgPerMl, 0, 1000, 'µg/mL']]);
      if (af) return { valid: false, message: af };
      if (lr.answers) { const over = Number(o.aluminumMcgPerMl) > 10; out.aluminumExceeds = over; abnormal = abnormal || over; notes.push(`Aluminum ${Number(o.aluminumMcgPerMl)} µg/mL: ${over ? 'over' : 'within'} the label's 10 µg/mL.`); if (over) band += ' Aluminum is over the label\'s 10 µg/mL.'; }
    }
    notes.push(labelLine, '10 CFR 35.204, 35.3204.');
    return { ...out, flag: overAtElution ? 'exceeds-at-elution' : abnormal ? 'not-acceptable' : 'within-limits', abnormal, band, bandLabel: label, notes, note: NOTE };
  }
  const f = inputFault([['the strontium-82 level', o.sr82, 0, 100, 'µCi per mCi Rb-82'], ['the strontium-85 level', o.sr85, 0, 100, 'µCi per mCi Rb-82']]);
  if (f) return { valid: false, message: f };
  const s82 = Number(o.sr82); const s85 = Number(o.sr85);
  const overRule = s82 > 0.02 || s85 > 0.2;
  const notes = [`Rule (10 CFR 35.204(a)(2)): Sr-82 ${s82} against 0.02 µCi/mCi, ${s82 > 0.02 ? 'over' : 'within'}; Sr-85 ${s85} against 0.2 µCi/mCi, ${s85 > 0.2 ? 'over' : 'within'}.`];
  const out = { ...base, exceedsRule: overRule };
  let expired = null; let alert = null;
  if (lr.answers) {
    const vol = blank(o.cumulativeVolumeL) ? null : Number(o.cumulativeVolumeL); const days = blank(o.daysSinceCalibration) ? null : Number(o.daysSinceCalibration);
    const vf = inputFault([...(vol === null ? [] : [['the cumulative eluate volume', o.cumulativeVolumeL, 0, 100, 'L']]), ...(days === null ? [] : [['the days since calibration', o.daysSinceCalibration, 0, 1000, '']])]);
    if (vf) return { valid: false, message: vf };
    const exp = []; if (s82 >= 0.01) exp.push('Sr-82 at 0.01 µCi/mCi or more'); if (s85 >= 0.1) exp.push('Sr-85 at 0.1 µCi/mCi or more'); if (vol !== null && vol >= 17) exp.push('17 L of cumulative eluate'); if (days !== null && days >= 60) exp.push('60 days after calibration');
    const al = []; if (s82 >= 0.002) al.push('Sr-82 at 0.002 µCi/mCi or more'); if (s85 >= 0.02) al.push('Sr-85 at 0.02 µCi/mCi or more'); if (vol !== null && vol >= 14) al.push('14 L of cumulative eluate');
    expired = exp.length > 0; alert = al.length > 0;
    out.labelExpirationLimitReached = expired; out.labelAlertLimitReached = alert;
    notes.push(`Label Expiration Limits (stop using the generator): ${expired ? `reached (${exp.join('; ')})` : 'not reached'}${vol === null || days === null ? `; ${[vol === null ? 'the eluate volume' : null, days === null ? 'the days since calibration' : null].filter(Boolean).join(' and ')} not entered, so ${vol === null && days === null ? 'those limits were' : 'that limit was'} not checked` : ''}.`);
    notes.push(`Label Alert Limits (additional eluate testing after each 750 mL): ${alert ? `reached (${al.join('; ')})` : 'not reached'}.`);
  }
  if (overRule) notes.push(REPORT);
  notes.push(labelLine, '10 CFR 35.204, 35.3204.');
  const abnormal = overRule || expired === true || alert === true || !lr.answers;
  const band = overRule ? 'Over the rule\'s limit: the eluate may not be administered.'
    : expired ? 'Within the rule\'s limit, but a Cardiogen-82 Expiration Limit is reached: the label says to stop using the generator.'
      : alert ? 'Within the rule\'s limit and the label\'s Expiration Limits; a label Alert Limit is reached, so additional eluate testing applies.'
        : lr.answers ? 'Within the rule\'s limits and below the label\'s Alert and Expiration Limits checked.' : 'Within the rule\'s limits. The label\'s stricter limits are withheld and were not checked.';
  return { ...out, flag: overRule ? 'exceeds-rule' : expired ? 'label-expiration' : alert ? 'label-alert' : 'within-limits', abnormal, band, bandLabel: overRule ? 'Over the rule limit' : expired ? 'Expiration Limit reached' : alert ? 'Alert Limit reached' : 'Within limits', notes, note: NOTE };
}
