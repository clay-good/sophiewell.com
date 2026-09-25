// spec-v1472: CGM time in range against the International Consensus targets.
//
// Source, read 2026-09-25: Battelino T, Danne T, Bergenstal RM, et al. Clinical Targets for
// Continuous Glucose Monitoring Data Interpretation: Recommendations From the International
// Consensus on Time in Range. Diabetes Care. 2019;42(8):1593-1603. doi:10.2337/dci19-0028
// (PMC6973648).
//
// Table 2 defines the five Ambulatory Glucose Profile ranges (below 54, 54-69, 70-180, 181-250 and
// above 250 mg/dL), a %CV target of 36% or less (footnote: lower targets, below 33%, may add
// protection against hypoglycemia on insulin or sulfonylureas), and data sufficiency: 14 days worn
// with 70% of the data. Table 3 sets the targets, with STRICT inequalities, so a value equal to the
// cutoff does not meet it:
//   type 1 / type 2:   TIR > 70%, TBR < 70 mg/dL < 4%, TBR < 54 mg/dL < 1%,
//                      TAR > 180 mg/dL < 25%, TAR > 250 mg/dL < 5%
//   older / high risk: TIR > 50%, TBR < 70 mg/dL < 1%, TAR > 250 mg/dL < 10%
// The older / high-risk row lists only those three; no other target is invented for it.
//
// Pregnancy is not covered: its targets use 63-140 mg/dL, which the five 70-180 bins cannot give.
// Pure: no DOM, no clock.

import { inputFault, gradeFault } from './num.js';

export const TIR_POPULATIONS = [
  { value: 'standard', text: 'Type 1 or type 2 diabetes' },
  { value: 'older', text: 'Older or high-risk (type 1 or type 2)' },
];

const POP_WORDS = { standard: 'type 1 or type 2 diabetes', older: 'older or high-risk adults' };

// [metric, key, cutoff, direction]: 'gt' means the value must be ABOVE the cutoff, 'lt' BELOW it.
const TARGETS = {
  standard: [
    ['time in range (70 to 180 mg/dL)', 'tir', 70, 'gt'],
    ['time below 70 mg/dL', 'tbr70', 4, 'lt'],
    ['time below 54 mg/dL', 'tbr54', 1, 'lt'],
    ['time above 180 mg/dL', 'tar180', 25, 'lt'],
    ['time above 250 mg/dL', 'tar250', 5, 'lt'],
  ],
  older: [
    ['time in range (70 to 180 mg/dL)', 'tir', 50, 'gt'],
    ['time below 70 mg/dL', 'tbr70', 1, 'lt'],
    ['time above 250 mg/dL', 'tar250', 10, 'lt'],
  ],
};

const r1 = (n) => Math.round(n * 10) / 10;

export function cgmTimeInRange(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pop = TIR_POPULATIONS.some((x) => x.value === o.pop) ? o.pop : null;
  if (!pop) return { valid: false, message: 'Choose the population: type 1 or type 2 diabetes, or older or high-risk.' };
  const fault = inputFault([
    ['the percentage of time below 54 mg/dL', o.vlow, 0, 100, ''],
    ['the percentage of time from 54 to 69 mg/dL', o.low, 0, 100, ''],
    ['the percentage of time from 70 to 180 mg/dL', o.tir, 0, 100, ''],
    ['the percentage of time from 181 to 250 mg/dL', o.high, 0, 100, ''],
    ['the percentage of time above 250 mg/dL', o.vhigh, 0, 100, ''],
  ]) || gradeFault([
    ['the coefficient of variation (%CV)', o.cv, 0, 100],
    ['the days worn', o.days, 1, 90],
    ['the percentage of time the CGM was active', o.active, 1, 100],
  ]);
  if (fault) return { valid: false, message: fault };
  const vlow = Number(o.vlow);
  const low = Number(o.low);
  const tir = Number(o.tir);
  const high = Number(o.high);
  const vhigh = Number(o.vhigh);
  const sum = r1(vlow + low + tir + high + vhigh);
  // Reports round each range, so a total within 1 point of 100 is accepted.
  if (Math.abs(sum - 100) > 1) {
    return { valid: false, message: `Enter the five percentages again: they add up to ${sum}%, and a CGM report's five ranges cover 100% of the time.` };
  }
  const values = { tir, tbr70: r1(vlow + low), tbr54: vlow, tar180: r1(high + vhigh), tar250: vhigh };
  const results = TARGETS[pop].map(([metric, key, cut, dir]) => {
    const value = values[key];
    const met = dir === 'gt' ? value > cut : value < cut;
    return { metric, value, target: `${dir === 'gt' ? 'above' : 'below'} ${cut}%`, met };
  });
  const targetsMet = results.filter((x) => x.met).length;
  const targetsTotal = results.length;
  const unmet = results.filter((x) => !x.met);
  const head = `${targetsMet} of ${targetsTotal} consensus targets met (${POP_WORDS[pop]})`;
  const band = unmet.length
    ? `${head}: ${unmet.map((x) => `${x.metric} ${x.value}% against a target ${x.target}`).join('; ')}.`
    : `${head}: every target is met.`;

  const notes = [];
  const has = (v) => !(v === null || v === undefined || String(v).trim() === '');
  if (has(o.cv)) {
    const cv = Number(o.cv);
    if (cv > 36) notes.push(`Glucose variability (%CV) ${cv}% is above the consensus target of 36% or less.`);
    else if (cv >= 33) notes.push(`Glucose variability (%CV) ${cv}% meets the target of 36% or less; some studies suggest a lower target, below 33%, adds protection against hypoglycemia on insulin or sulfonylureas.`);
    else notes.push(`Glucose variability (%CV) ${cv}% meets the target of 36% or less.`);
  } else {
    notes.push('Glucose variability (%CV) was not entered; the consensus target is 36% or less.');
  }
  if (has(o.days) || has(o.active)) {
    const parts = [];
    if (has(o.days)) {
      const d = Number(o.days);
      parts.push(d >= 14 ? `${d} days worn meets the 14 recommended` : `${d} days worn is fewer than the 14 recommended`);
    } else parts.push('days worn not entered (14 recommended)');
    if (has(o.active)) {
      const a = Number(o.active);
      parts.push(a >= 70 ? `${a}% of time active meets the 70% recommended` : `${a}% of time active is below the 70% recommended`);
    } else parts.push('time active not entered (70% recommended)');
    notes.push(`Data sufficiency: ${parts.join('; ')}.`);
  } else {
    notes.push('Days worn and time the CGM was active were not entered; the consensus recommends 14 days with at least 70% of the data.');
  }
  if (pop === 'standard') notes.push('For age under 25 years, if the A1C goal is 7.5%, the consensus sets the time-in-range target at about 60%.');
  notes.push('Each 5% increase in time in range is associated with clinically significant benefits in type 1 or type 2 diabetes.');
  notes.push('The consensus asks that CGM targets be personalized to the needs of each person with diabetes.');
  notes.push('Pregnancy is not covered: its targets use a 63 to 140 mg/dL range that these five ranges do not give.');

  return {
    valid: true,
    abnormal: unmet.length > 0,
    targetsMet,
    targetsTotal,
    results,
    band,
    bandLabel: `${targetsMet} of ${targetsTotal} targets met`,
    notes,
    note: 'Battelino T et al, International Consensus on Time in Range, Diabetes Care 2019.',
  };
}
