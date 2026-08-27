// spec-v808: HRS-AKI diagnostic criteria (2024 ADQI / ICA consensus).
//
// Source:
//   Nadim MK, Kellum JA, Forni L, et al. Acute kidney injury in patients with cirrhosis:
//   Acute Disease Quality Initiative (ADQI) and International Club of Ascites (ICA) joint
//   multidisciplinary consensus meeting. J Hepatol. 2024;81(1):163-183. (PMID 38527522.)
//
// ALL FOUR are required:
//   cirrhosis with ascites
//   an increase in serum creatinine of 0.3 mg/dL or more within 48 hours, or 50% or more
//     from a baseline known or presumed within the prior 7 days, and/or urine output of
//     0.5 mL/kg/h or less for 6 hours or more
//   no improvement in serum creatinine or urine output within 24 HOURS of adequate volume
//     resuscitation, where clinically indicated
//   no strong evidence for an alternative explanation as the PRIMARY cause of the injury
//
// THIS IS NOT THE 2015 RULE, and the differences run the other way from what most people
// expect:
//   * The 48-hour albumin challenge at 1 g/kg/day is NO LONGER a prerequisite. The
//     consensus recommends against requiring it, and asks instead for no improvement at
//     24 hours after adequate volume resuscitation.
//   * Proteinuria above 500 mg/day, microhematuria above 50 red cells per high power field
//     and abnormal renal ultrasound NO LONGER EXCLUDE the diagnosis. HRS-AKI may coexist
//     with tubular injury, proteinuria and pre-existing chronic kidney disease. All of that
//     is replaced by the single alternative-explanation criterion.
//
// A tool still applying the 2015 exclusions will call HRS-AKI absent in patients who have
// it, which is why this tile names the change.
//
// Pure: no DOM, no clock, no network.

export const HRS_AKI_NOTE = 'The 2024 diagnostic criteria for hepatorenal syndrome with acute kidney injury (Nadim MK, Kellum JA, Forni L, et al, J Hepatol 2024;81(1):163-183) require all four of cirrhosis with ascites, an acute rise in creatinine of at least 0.3 milligrams per decilitre within 48 hours or at least half above a baseline from the previous week or a urine output at or below 0.5 millilitres per kilogram per hour for six hours or more, no improvement within 24 hours of adequate volume resuscitation where that is clinically indicated, and no strong evidence of an alternative explanation as the primary cause. Two things changed from the older 2015 rule and both run against expectation. The 48-hour albumin challenge is no longer a prerequisite, and the consensus recommends against requiring it. And proteinuria, microhematuria and an abnormal renal ultrasound no longer exclude the diagnosis, because hepatorenal syndrome can coexist with tubular injury, proteinuria and pre-existing chronic kidney disease; those exclusions are replaced by the single alternative-explanation criterion. A tool still applying the 2015 exclusions will call this absent in patients who have it. It applies criteria to findings already gathered and it does not start terlipressin, albumin or dialysis.';

const CRITERIA = [
  { arg: 'cirrhosisWithAscites', text: 'cirrhosis with ascites' },
  { arg: 'akiPresent', text: 'an acute kidney injury by the creatinine or urine-output definition' },
  { arg: 'noImprovementAfterVolume', text: 'no improvement within 24 hours of adequate volume resuscitation' },
  { arg: 'noAlternativeCause', text: 'no strong evidence for an alternative primary cause' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function hrsAki(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const met = CRITERIA.filter((c) => truthy(o[c.arg])).map((c) => c.text);
  const missing = CRITERIA.filter((c) => !truthy(o[c.arg])).map((c) => c.text);
  const diagnosis = missing.length === 0;

  // These were 2015 exclusions and are NOT exclusions now. They are collected so the tile
  // can say so explicitly, because that is the change most likely to mislead.
  const oldExclusions = [];
  if (truthy(o.proteinuria)) oldExclusions.push('proteinuria');
  if (truthy(o.microhematuria)) oldExclusions.push('microhematuria');
  if (truthy(o.abnormalUltrasound)) oldExclusions.push('an abnormal renal ultrasound');

  const note2015 = oldExclusions.length
    ? `Recorded but NOT excluding: ${oldExclusions.join(', ')}. Under the 2015 criteria these ruled HRS-AKI out; under the 2024 consensus they do not, because it can coexist with tubular injury, proteinuria and chronic kidney disease.`
    : null;

  return {
    valid: true,
    diagnosis,
    criteriaMet: met.length,
    met,
    missing,
    nonExcluding: oldExclusions,
    note2015,
    abnormal: diagnosis,
    bandLabel: diagnosis ? 'HRS-AKI criteria met' : 'HRS-AKI criteria not met',
    band: diagnosis
      ? `HRS-AKI criteria met — all four present.${oldExclusions.length ? ' Findings that the 2015 rule would have excluded on are present and do not exclude it now.' : ''}`
      : `HRS-AKI criteria not met — still needed: ${missing.join('; ')}.`,
    detail: 'All four required: cirrhosis with ascites; an acute kidney injury by the creatinine or urine-output definition; no improvement within 24 hours of adequate volume resuscitation where clinically indicated; and no strong evidence for an alternative primary cause. The 2024 consensus dropped the 48-hour albumin challenge as a prerequisite and dropped proteinuria, microhematuria and abnormal ultrasound as exclusions.',
    note: HRS_AKI_NOTE,
  };
}
