// spec-v1243: the hepatopulmonary syndrome criteria and severity grade.
//
// Source:
//   Rodriguez-Roisin R, Krowka MJ, Herve P, Fallon MB; ERS Task Force Pulmonary-Hepatic Vascular
//   Disorders Scientific Committee. Pulmonary-Hepatic vascular Disorders (PHD). Eur Respir J.
//   2004;24(5):861-880. PMID 15516683.
//
// Three things have to be true at once, and the tile refuses to answer unless all three have been
// asked about:
//
//   1. liver disease, portal hypertension, or both
//   2. an intrapulmonary vascular dilatation -- in practice a positive contrast echocardiogram
//   3. a gas exchange defect: an alveolar-arterial gradient on room air of at least 15 mmHg, or at
//      least 20 mmHg over the age of 64
//
// THE AGE CUT IS THE PART THAT GETS DROPPED. The gradient rises with age on its own, so the task
// force raised the threshold past 64. A tool that applied 15 to everyone would diagnose the syndrome
// from a gradient that is ordinary for the patient's age, and the error runs one way only.
//
// THE SEVERITY GRADE IS A DIFFERENT MEASUREMENT FROM THE DIAGNOSIS. The diagnosis turns on the
// GRADIENT; the severity runs off the PaO2. A patient can meet the criteria with a PaO2 above 80,
// which is the "mild" grade and not a normal result: the gradient is what is abnormal.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const HPS_NOTE = 'The hepatopulmonary syndrome criteria (ERS Task Force 2004) require liver disease or portal hypertension, an intrapulmonary vascular dilatation, and a gas exchange defect: an alveolar-arterial oxygen gradient on room air of at least 15 mmHg, or at least 20 mmHg over the age of 64, because the gradient rises with age on its own. The severity grade runs off the arterial oxygen rather than the gradient, so a patient can meet the criteria with a PaO2 above 80 mmHg -- that is the mild grade, not a normal result. It reports the criteria against the values entered and is not a diagnosis.';

export const HPS_GRADIENT_THRESHOLD = 15;
export const HPS_GRADIENT_THRESHOLD_OVER_64 = 20;
export const HPS_AGE_CUT = 64;

// ERS 2004 severity, by room-air PaO2.
const SEVERITY = [
  { min: 80, label: 'mild', text: 'PaO2 at or above 80 mmHg with a widened gradient' },
  { min: 60, label: 'moderate', text: 'PaO2 from 60 up to 80 mmHg' },
  { min: 50, label: 'severe', text: 'PaO2 from 50 up to 60 mmHg' },
  { min: -Infinity, label: 'very severe', text: 'PaO2 below 50 mmHg' },
];

function blankIfEmpty(v) {
  return typeof v === 'string' && v.trim() === '' ? '' : v;
}
function num(v) {
  return typeof v === 'number' ? v : Number(String(v).trim());
}
function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}
function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function hepatopulmonarySyndrome(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = blankIfEmpty;

  const fault = inputFault([
    ['the age', b(o.age), null, 120, 'years'],
    ['the room-air arterial oxygen', b(o.pao2), null, 600, 'mmHg'],
    ['the room-air alveolar-arterial oxygen gradient', b(o.aaGradient), -10, 600, 'mmHg'],
  ]);
  if (fault) return { valid: false, message: fault };

  // The two yes/no criteria are asked, not assumed. A blank is not a negative contrast echo, and
  // answering "does not meet criteria" from an unasked question is the reassuring direction.
  if (isBlank(o.liverDisease) || isBlank(o.ipvd)) {
    return {
      valid: false,
      message: 'Answer both of the other two criteria: whether there is liver disease or portal hypertension, and whether an intrapulmonary vascular dilatation has been shown. A blank is not a negative finding, and "does not meet criteria" is the reassuring way to be wrong.',
    };
  }

  const age = num(o.age);
  const pao2 = num(o.pao2);
  const gradient = num(o.aaGradient);
  const liver = on(o.liverDisease);
  const ipvd = on(o.ipvd);

  const threshold = age > HPS_AGE_CUT ? HPS_GRADIENT_THRESHOLD_OVER_64 : HPS_GRADIENT_THRESHOLD;
  const gasExchange = gradient >= threshold;
  const meets = liver && ipvd && gasExchange;

  const severity = SEVERITY.find((s) => pao2 >= s.min);

  const missingCriteria = [
    !liver && 'liver disease or portal hypertension',
    !ipvd && 'an intrapulmonary vascular dilatation',
    !gasExchange && `a gradient of at least ${threshold} mmHg`,
  ].filter(Boolean);

  const band = meets
    ? `All three criteria are met, and the gradient of ${gradient} mmHg is at or above the ${threshold} mmHg threshold that applies at ${age} years. On a room-air PaO2 of ${pao2} mmHg the severity grade is ${severity.label}: ${severity.text}.`
    : `The criteria are not all met: ${missingCriteria.join(', ')} ${missingCriteria.length === 1 ? 'is' : 'are'} missing. The gradient entered is ${gradient} mmHg against the ${threshold} mmHg threshold that applies at ${age} years. The other criteria recorded do not make a diagnosis on their own.`;

  // The threshold that moved, printed where it moved.
  const ageNote = age > HPS_AGE_CUT
    ? `At ${age} years the gradient threshold is ${HPS_GRADIENT_THRESHOLD_OVER_64} mmHg rather than ${HPS_GRADIENT_THRESHOLD}, because the gradient widens with age on its own. Applying 15 here would call an ordinary gradient a gas exchange defect.`
    : null;

  const mildNote = meets && severity.label === 'mild'
    ? 'A PaO2 at or above 80 mmHg is the mild grade of the syndrome, not a normal result. What is abnormal is the gradient, and the severity scale starts where the oxygen is still in range.'
    : null;

  const severityScopeNote = 'The diagnosis turns on the gradient and the severity grade on the arterial oxygen. They are two different measurements and a normal-looking oxygen does not rule the syndrome out.';

  return {
    valid: true,
    meets,
    severity: meets ? severity.label : null,
    gradientThreshold: threshold,
    gasExchangeDefect: gasExchange,
    liverDisease: liver,
    ipvd,
    missing: missingCriteria,
    abnormal: meets,
    bandLabel: meets ? `Hepatopulmonary syndrome, ${severity.label}` : 'Criteria not met',
    band,
    ageNote,
    mildNote,
    severityScopeNote,
    postureNote: 'Decision support, not a verdict. The criteria describe the values entered; the diagnosis, and what follows from it, stays with the hepatology and pulmonary teams.',
    note: HPS_NOTE,
  };
}
