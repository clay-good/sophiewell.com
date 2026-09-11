// spec-v1243: portopulmonary hypertension -- the hemodynamic criteria, under two definitions of
// pulmonary hypertension that do not agree.
//
// Sources:
//   Rodriguez-Roisin R, Krowka MJ, Herve P, Fallon MB; ERS Task Force Pulmonary-Hepatic Vascular
//   Disorders. Pulmonary-Hepatic vascular Disorders (PHD). Eur Respir J. 2004;24(5):861-880.
//   PMID 15516683 -- the portopulmonary criteria as they are usually quoted.
//   Humbert M, Kovacs G, Hoeper MM, et al. 2022 ESC/ERS Guidelines for the diagnosis and treatment
//   of pulmonary hypertension. Eur Heart J. 2022;43(38):3618-3731. PMID 36017548 -- the definition
//   of pulmonary hypertension that replaced the one above.
//
// THE TWO DEFINITIONS, AND WHY BOTH ARE PRINTED.
//
//   2004 task force   mean pulmonary artery pressure at rest > 25 mmHg
//                     pulmonary vascular resistance > 240 dyn.s.cm-5 (3 Wood units)
//                     pulmonary artery wedge pressure < 15 mmHg
//   2022 ESC/ERS      mean pulmonary artery pressure > 20 mmHg
//                     pulmonary vascular resistance > 2 Wood units
//                     wedge pressure <= 15 mmHg for the pre-capillary form
//
// A patient with an mPAP of 23 mmHg and a PVR of 2.5 Wood units has pulmonary hypertension under the
// current definition and does not under the one most portopulmonary literature was written against.
// Reporting one number under one threshold hides that entirely, so this reports both and says which
// is which. The transplant thresholds below, which are what the measurement is usually for, were
// derived under the older definition, and that is stated where they are printed.
//
// A HIGH WEDGE PRESSURE IS THE CASE THIS EXISTS TO CATCH. A cirrhotic patient with a high output and
// a volume-loaded left heart can have a raised mPAP with a raised wedge pressure -- that is
// post-capillary, not portopulmonary, and the treatment goes the other way. The wedge pressure is the
// criterion that separates them and it is the one a summary report most often leaves out.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const POPH_NOTE = 'Portopulmonary hypertension is pulmonary arterial hypertension in a patient with portal hypertension, and it is defined hemodynamically: a raised mean pulmonary artery pressure, a raised pulmonary vascular resistance, and a wedge pressure that is not raised. Two definitions are in use -- the 2004 task force thresholds most of the portopulmonary literature was written against, and the lower 2022 ESC/ERS thresholds -- and a patient can meet one and not the other, so both are reported. A raised wedge pressure points away from this diagnosis and toward a volume-loaded left heart, which is treated in the opposite direction.';

export const POPH_2004 = { mpap: 25, pvrWood: 3, wedge: 15 };
export const POPH_2022 = { mpap: 20, pvrWood: 2, wedge: 15 };
export const DYNES_PER_WOOD_UNIT = 80;

// Krowka's severity bands, by mean pulmonary artery pressure. Derived under the 2004 definition and
// used in transplant assessment.
const SEVERITY = [
  { min: 45, label: 'severe', text: 'a mean pressure of 45 mmHg or more' },
  { min: 35, label: 'moderate', text: 'a mean pressure from 35 up to 45 mmHg' },
  { min: 25, label: 'mild', text: 'a mean pressure from 25 up to 35 mmHg' },
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
function round(x) {
  return Math.round(x * 100) / 100;
}

export function portopulmonaryHypertension(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = blankIfEmpty;

  const fault = inputFault([
    ['the mean pulmonary artery pressure', b(o.mpap), null, 120, 'mmHg'],
    ['the pulmonary vascular resistance', b(o.pvrWood), null, 40, 'Wood units'],
    ['the pulmonary artery wedge pressure', b(o.wedge), null, 60, 'mmHg'],
  ]);
  if (fault) return { valid: false, message: fault };

  if (isBlank(o.portalHypertension)) {
    return {
      valid: false,
      message: 'Say whether the patient has portal hypertension. The hemodynamics alone describe pulmonary arterial hypertension; what makes it portopulmonary is the portal hypertension, and a blank is not a no.',
    };
  }

  const mpap = num(o.mpap);
  const pvr = num(o.pvrWood);
  const wedge = num(o.wedge);
  const portal = on(o.portalHypertension);

  const meets2004 = portal && mpap > POPH_2004.mpap && pvr > POPH_2004.pvrWood && wedge < POPH_2004.wedge;
  const meets2022 = portal && mpap > POPH_2022.mpap && pvr > POPH_2022.pvrWood && wedge <= POPH_2022.wedge;

  const severity = SEVERITY.find((s) => mpap >= s.min) || null;
  const pvrDynes = round(pvr * DYNES_PER_WOOD_UNIT);

  const band = meets2022
    ? (meets2004
        ? `Meets both definitions of portopulmonary hypertension. Mean pulmonary artery pressure ${mpap} mmHg, pulmonary vascular resistance ${pvr} Wood units (${pvrDynes} dyn.s.cm-5), wedge pressure ${wedge} mmHg.`
        : `Meets the 2022 ESC/ERS definition and NOT the 2004 task force one. Mean pulmonary artery pressure ${mpap} mmHg and pulmonary vascular resistance ${pvr} Wood units clear the current thresholds of ${POPH_2022.mpap} mmHg and ${POPH_2022.pvrWood} Wood units, and not the older ${POPH_2004.mpap} mmHg and ${POPH_2004.pvrWood} Wood units that most of the portopulmonary literature was written against.`)
    : `Does not meet the 2022 ESC/ERS definition${portal ? '' : ', and no portal hypertension was recorded'}. Mean pulmonary artery pressure ${mpap} mmHg, pulmonary vascular resistance ${pvr} Wood units, wedge pressure ${wedge} mmHg.`;

  // The criterion that sends the diagnosis the other way.
  const wedgeNote = wedge > POPH_2022.wedge
    ? `The wedge pressure is ${wedge} mmHg, above ${POPH_2022.wedge}. That is a post-capillary picture -- a volume-loaded or stiff left heart -- rather than portopulmonary hypertension, and it is treated in the opposite direction. A raised mean pressure with a raised wedge pressure is the case this criterion exists to catch.`
    : null;

  const severityNote = meets2004 && severity
    ? `On the mean pressure alone this is ${severity.label} portopulmonary hypertension, ${severity.text}. Those bands were derived under the 2004 definition and are the ones used in transplant assessment; they do not have a counterpart under the 2022 thresholds.`
    : null;

  const definitionNote = 'Two definitions are in use and they disagree at the bottom. The 2022 ESC/ERS thresholds are a mean pressure above 20 mmHg and a resistance above 2 Wood units; the 2004 thresholds most portopulmonary work was written against are 25 mmHg and 3 Wood units. A report that gives one verdict has silently chosen one of them.';

  return {
    valid: true,
    meets2004,
    meets2022,
    severity: meets2004 ? (severity && severity.label) : null,
    mpap,
    pvrWood: pvr,
    pvrDynes,
    wedge,
    portalHypertension: portal,
    abnormal: meets2022,
    bandLabel: meets2022 ? 'Portopulmonary hypertension' : 'Criteria not met',
    band,
    wedgeNote,
    severityNote,
    definitionNote,
    postureNote: 'Decision support, not a verdict. The thresholds describe the catheter numbers entered; the diagnosis and the transplant decision stay with the hepatology and pulmonary hypertension teams.',
    note: POPH_NOTE,
  };
}
