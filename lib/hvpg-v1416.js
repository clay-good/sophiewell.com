// spec-v1416: hepatic venous pressure gradient (HVPG) and what Baveno VII says each level means.
//
// Source, read 2026-09-24 from PMC11090185: de Franchis R, Bosch J, Garcia-Tsao G, et al. Baveno
// VII - Renewing consensus in portal hypertension. J Hepatol 2022;76(4):959-974.
//   1.7  the wedged-to-FREE hepatic vein gradient "should be used as the standard reference".
//   1.8  "If the free hepatic vein pressure is more than 2 mmHg above IVC pressures, the presence of a
//        hepatic vein outflow obstruction should be ruled out".
//   1.9  "HVPG values >5 mmHg indicate sinusoidal portal hypertension."
//   1.10 in viral- and alcohol-related cirrhosis, CSPH "is defined as an HVPG >=10 mmHg".
//   1.11 in primary biliary cholangitis, a pre-sinusoidal component means HVPG "may underestimate the
//        prevalence and severity of PH".
//   1.12 in NASH-related cirrhosis, signs of portal hypertension "can also be present in a small
//        proportion of patients with HVPG values <10 mmHg".
//   1.13 signs of portal hypertension with HVPG <10 mmHg: porto-sinusoidal vascular disorder "must be
//        ruled out".
//   1.19 before non-hepatic abdominal surgery, "a HVPG >=16 mmHg is associated with an increased risk
//        of short-term mortality after surgery".
//   6.27 pre-emptive TIPS in oesophageal / type 1-2 gastro-oesophageal variceal bleeding when any
//        criterion is met, one being "HVPG >20 mmHg at the time of haemorrhage".
//
// Pure: no DOM, no clock, no network.

export const HVPG_ETIOLOGIES = [
  { value: 'viral-alcohol', text: 'Viral or alcohol-related cirrhosis' },
  { value: 'nash', text: 'MASH / NASH-related cirrhosis' },
  { value: 'pbc', text: 'Primary biliary cholangitis' },
  { value: 'other', text: 'Other or unknown' },
];
export const HVPG_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}
function reading(v) {
  if (isBlank(v)) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : NaN;
}
const r1 = (x) => Math.round(x * 10) / 10;

export function hvpg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wedged = reading(o.whvp);
  const free = reading(o.fhvp);
  const ivc = reading(o.ivc);
  const missing = [];
  if (wedged === null) missing.push('the wedged hepatic vein pressure');
  if (free === null) missing.push('the free hepatic vein pressure');
  if (missing.length) return { valid: false, message: `Enter ${missing.join(' and ')} (mmHg).` };
  for (const [label, v] of [['wedged hepatic vein pressure', wedged], ['free hepatic vein pressure', free], ['IVC pressure', ivc]]) {
    if (Number.isNaN(v)) return { valid: false, message: `Enter the ${label} as a number (mmHg).` };
  }
  const gradient = r1(wedged - free);
  if (gradient < 0) {
    return { valid: false, message: 'The wedged pressure is below the free pressure, which gives a negative gradient. Check the two tracings.' };
  }

  const bleeding = o.bleeding === 'yes';
  const signs = o.signs === 'yes' ? true : o.signs === 'no' ? false : null;
  const etiology = HVPG_ETIOLOGIES.some((e) => e.value === o.etiology) ? o.etiology : null;

  let level;
  let band;
  if (gradient >= 10) {
    level = 'csph';
    band = `HVPG ${gradient} mmHg: clinically significant portal hypertension (Baveno VII defines CSPH as 10 mmHg or more).`;
  } else if (gradient > 5) {
    level = 'sinusoidal';
    band = `HVPG ${gradient} mmHg: sinusoidal portal hypertension (above 5 mmHg), below the 10 mmHg that defines CSPH.`;
  } else {
    level = 'not-raised';
    band = `HVPG ${gradient} mmHg: not above 5 mmHg, so no sinusoidal portal hypertension by this measure.`;
  }

  const notes = [];
  if (bleeding && gradient > 20) {
    notes.push('Above 20 mmHg at the time of hemorrhage: this meets one of the Baveno VII criteria for pre-emptive TIPS in bleeding from esophageal or type 1 or 2 gastroesophageal varices.');
  }
  if (gradient >= 16) {
    notes.push('16 mmHg or more: before non-hepatic abdominal surgery, Baveno VII links this to a higher risk of short-term mortality after the operation.');
  }
  if (gradient < 10 && signs === true) {
    notes.push('Signs of portal hypertension with an HVPG below 10 mmHg: Baveno VII says porto-sinusoidal vascular disorder must be ruled out.');
  }
  if (etiology === 'pbc') {
    notes.push('Primary biliary cholangitis can add a pre-sinusoidal component the HVPG does not measure, so it may underestimate the portal hypertension.');
  } else if (etiology === 'nash' && gradient < 10) {
    notes.push('In MASH / NASH-related cirrhosis, signs of portal hypertension can appear in a small proportion of patients below 10 mmHg.');
  } else if (etiology === null || etiology === 'other') {
    if (level === 'csph') notes.push('Baveno VII states the 10 mmHg CSPH definition for viral- and alcohol-related cirrhosis; other causes need their own reading.');
  }
  if (ivc !== null && free - ivc > 2) {
    notes.push(`The free hepatic vein pressure is ${r1(free - ivc)} mmHg above the IVC pressure (more than 2): rule out a hepatic vein outflow obstruction with a small contrast injection before trusting the gradient.`);
  }

  return {
    valid: true,
    abnormal: level !== 'not-raised',
    gradient,
    level,
    band,
    bandLabel: `${gradient} mmHg`,
    notes,
    note: 'HVPG = wedged minus free hepatic vein pressure, the reference Baveno VII sets (not wedged minus right atrial). Its technique statements: a balloon occlusion catheter, a stable wedged tracing of at least 1 minute recorded in triplicate, permanent slow-speed tracings rather than on-screen readings, and no deep sedation. '
      + 'de Franchis R et al, Baveno VII, J Hepatol 2022.',
  };
}
