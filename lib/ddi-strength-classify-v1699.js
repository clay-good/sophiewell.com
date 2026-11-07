// spec-v1699 (drug-interaction-kinetics tool 3): the strength class an observed AUC ratio falls in, by FDA's
// definitions ("Healthcare Professionals: FDA's Examples of Drugs that Interact with CYP Enzymes and Transporter
// Systems", Table 2 legend, content current as of 05/29/2026, re-read November 7, 2026):
//   inhibitors: strong >=5-fold; moderate >=2-fold to <5-fold; weak >=1.25-fold to <2-fold.
//   inducers (AUC decrease of sensitive substrates): strong >=80%; moderate >=50% to <80%; weak >=20% to <50%.
//   substrates (AUC increase with strong inhibitors): sensitive >=5-fold; moderate sensitive >=2 to <5-fold.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';

export const ROLE_OPTIONS = [
  { value: 'precipitant', text: 'The drug given with it (inhibitor or inducer)' },
  { value: 'substrate', text: 'The drug whose levels changed (substrate)' },
];

// Comparisons at 10 decimal places, so 1 - 0.2 is 80% and not 79.99999999999999%.
const r10 = (x) => (Math.abs(x) < 1e6 ? Math.round(x * 1e10) / 1e10 : x);

function ratioFrom(o) {
  const ratio = measured(o.ratio);
  const withP = measured(o.aucWith);
  const without = measured(o.aucWithout);
  if (ratio !== null && (withP !== null || without !== null)) return { message: 'Enter the AUC ratio or the two AUCs, not both.' };
  if (ratio !== null) {
    if (!(ratio > 0)) return { message: 'The AUC ratio must be above 0.' };
    return { value: ratio, how: `AUC ratio ${ratio} as entered` };
  }
  if (withP === null || without === null) return { message: 'Enter the AUC ratio, or both AUCs (with and without the other drug).' };
  if (!(withP > 0) || !(without > 0)) return { message: 'Both AUCs must be above 0.' };
  const v = withP / without;
  if (!Number.isFinite(v)) return { message: 'These AUCs give no finite ratio.' };
  return { value: v, how: `AUC ratio ${Number(v.toPrecision(4))} = ${withP} with / ${without} without` };
}

export function ddiStrengthClassify(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const role = String(o.role ?? '').trim();
  if (role !== 'precipitant' && role !== 'substrate') return { valid: false, message: 'Choose whether you are classifying the drug given with it or the drug whose levels changed.' };
  const r = ratioFrom(o);
  if (r.message) return { valid: false, message: r.message };
  const x = r10(r.value);
  const notes = [r.how + '.'];
  let cls;
  let sentence;
  if (role === 'precipitant') {
    if (x === 1) { cls = 'No change'; sentence = 'An AUC ratio of 1 is no change in exposure.'; }
    else if (x > 1) {
      if (x >= 5) { cls = 'Strong inhibitor'; sentence = 'FDA: drugs that increase the AUC of sensitive index substrates of a given metabolic pathway "≥5-fold".'; }
      else if (x >= 2) { cls = 'Moderate inhibitor'; sentence = 'FDA: "≥2-fold to < 5-fold".'; }
      else if (x >= 1.25) { cls = 'Weak inhibitor'; sentence = 'FDA: "≥1.25-fold to <2-fold".'; }
      else { cls = 'Below the weak inhibitor threshold'; sentence = 'FDA\'s weak class starts at a 1.25-fold increase.'; }
      notes.push(`${Number(x.toPrecision(4))}-fold increase in AUC.`);
    } else {
      const dec = r10((1 - x) * 100);
      notes.push(`AUC decrease (1 - ratio) x 100 = ${Number(dec.toPrecision(4))}%.`);
      if (dec >= 80) { cls = 'Strong inducer'; sentence = 'FDA: drugs that decrease the AUC of sensitive substrates of a given metabolic pathway "by ≥80%".'; }
      else if (dec >= 50) { cls = 'Moderate inducer'; sentence = 'FDA: "by ≥50% to <80%".'; }
      else if (dec >= 20) { cls = 'Weak inducer'; sentence = 'FDA: "by ≥20% to <50%".'; }
      else { cls = 'Below the weak inducer threshold'; sentence = 'FDA\'s weak class starts at a 20% decrease.'; }
    }
    notes.push('The classes are defined on studies with sensitive index substrates of the pathway; a ratio from another substrate understates or overstates the precipitant.');
  } else {
    if (x < 1) return { valid: false, message: 'Substrate sensitivity is defined on AUC increases with a strong inhibitor; a ratio below 1 has no substrate class.' };
    const strong = o.strongInhibitor === true || o.strongInhibitor === 'true';
    if (!strong) return { valid: false, message: 'A substrate class needs a study with a strong inhibitor of the pathway. Tick that the other drug was a strong inhibitor to classify.' };
    if (x >= 5) { cls = 'Sensitive substrate'; sentence = 'FDA: drugs that demonstrate an increase in AUC of "≥5-fold with strong inhibitors" of a given metabolic pathway.'; }
    else if (x >= 2) { cls = 'Moderate sensitive substrate'; sentence = 'FDA: "≥2 to <5-fold with strong inhibitors".'; }
    else { cls = 'Below the moderate sensitive threshold'; sentence = 'FDA\'s moderate sensitive class starts at a 2-fold increase with a strong inhibitor.'; }
    notes.push(`${Number(x.toPrecision(4))}-fold increase with a strong inhibitor.`);
  }
  notes.push(sentence);
  return {
    valid: true, cls, ratio: Number(r.value.toPrecision(6)), abnormal: false,
    band: `${cls} (AUC ratio ${Number(r.value.toPrecision(4))}).`,
    bandLabel: cls,
    notes,
    note: 'A class describes the size of an exposure change in a study; it is not a statement about any patient. FDA notes its examples "are a guide and not considered a comprehensive list".',
  };
}
