// spec-v826: 2022 ESC/ERS haemodynamic definitions of pulmonary hypertension.
//
// Source:
//   Humbert M, Kovacs G, Hoeper MM, et al. 2022 ESC/ERS Guidelines for the diagnosis and
//   treatment of pulmonary hypertension. Eur Heart J. 2022;43(38):3618-3731 / Eur Respir J.
//   2023;61(1):2200879.
//
// THE DEFINITIONS:
//   PH                              mPAP > 20 mmHg at rest
//   pre-capillary PH                mPAP > 20, PAWP <= 15, PVR > 2 WU
//   isolated post-capillary PH      mPAP > 20, PAWP > 15,  PVR <= 2 WU
//   combined pre- and post-capillary  mPAP > 20, PAWP > 15, PVR > 2 WU
//   unclassified PH                 mPAP > 20, PAWP <= 15, PVR <= 2 WU
//
// TWO THRESHOLDS MOVED IN 2022, AND BOTH MOVED DOWN:
//   * mPAP for any PH fell from >=25 mmHg to >20 mmHg.
//   * The PVR cut that separates a significant pre-capillary component from none fell from
//     >3 WU to >2 WU, and PVR became a mandatory criterion for pre-capillary PH rather than
//     an optional supporting number.
//
// So a tool still on the 2015 thresholds does two distinct wrong things. It calls a patient
// with an mPAP of 22 mmHg normal when the current guideline calls that pulmonary
// hypertension. And in a patient with a raised wedge pressure and a PVR of 2.5 WU it reports
// isolated post-capillary PH where the current guideline reports a combined pre- and
// post-capillary picture - a different disease process and a different treatment
// conversation. Both errors run in the direction of under-calling.
//
// PVR is computed rather than merely asked for: PVR in Wood units = (mPAP - PAWP) / cardiac
// output in L/min. An entered PVR wins when supplied, since a measured value may come from a
// different cardiac-output method than the one to hand.
//
// Pure: no DOM, no clock, no network.

export const PH_NOTE = 'The 2022 ESC/ERS guidelines (Humbert M, Kovacs G, Hoeper MM, et al, Eur Heart J 2022;43(38):3618-3731) define pulmonary hypertension as a mean pulmonary arterial pressure above 20 millimeters of mercury at rest. Within that, a wedge pressure at or below 15 with a pulmonary vascular resistance above 2 Wood units is pre-capillary; a wedge pressure above 15 with a resistance at or below 2 is isolated post-capillary; a wedge pressure above 15 with a resistance above 2 is combined pre- and post-capillary; and a wedge pressure at or below 15 with a resistance at or below 2 is unclassified. Two thresholds moved in 2022 and both moved down. The pressure threshold for any pulmonary hypertension fell from 25 or more to above 20, and the resistance cut separating a significant pre-capillary component from none fell from above 3 Wood units to above 2, with resistance becoming a mandatory criterion rather than a supporting number. A tool still using the older figures therefore does two separate wrong things: it calls a mean pressure of 22 normal, and in someone with a raised wedge pressure and a resistance of 2.5 it reports isolated post-capillary disease where the current guideline reports a combined picture, which is a different process and a different treatment conversation. Resistance is calculated here as mean pressure minus wedge pressure divided by cardiac output in liters per minute. It classifies numbers from a right heart catheterization already performed and it does not start pulmonary vasodilators or decide who should be catheterized.';

export const MPAP_THRESHOLD = 20;   // strictly greater than
export const PAWP_THRESHOLD = 15;   // at or below is the pre-capillary side
export const PVR_THRESHOLD = 2;     // Wood units, strictly greater than
export const MPAP_2015 = 25;
export const PVR_2015 = 3;

function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function phHemodynamics2022(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const mpap = num(o.mpap);
  const pawp = num(o.pawp);
  const co = num(o.cardiacOutput);
  const pvrEntered = num(o.pvr);

  for (const [label, v, lo, hi] of [
    ['Mean pulmonary arterial pressure', mpap, 0, 200],
    ['Pulmonary arterial wedge pressure', pawp, 0, 100],
    ['Cardiac output', co, 0.1, 30],
    ['Pulmonary vascular resistance', pvrEntered, 0, 100],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `${label} is out of range (${lo} to ${hi}).` };
    }
  }

  if (mpap === null) return { valid: false, message: 'Enter the mean pulmonary arterial pressure.' };

  // PVR: entered wins, otherwise computed.
  let pvr = pvrEntered;
  let pvrSource = pvrEntered !== null ? 'entered' : null;
  if (pvr === null && pawp !== null && co !== null && co > 0) {
    pvr = (mpap - pawp) / co;
    pvrSource = 'computed';
  }
  const pvrRounded = pvr === null ? null : Math.round(pvr * 100) / 100;

  const ph = mpap > MPAP_THRESHOLD;

  let category = null;
  if (ph && pawp !== null && pvr !== null) {
    if (pawp <= PAWP_THRESHOLD) {
      category = pvr > PVR_THRESHOLD ? 'Pre-capillary PH' : 'Unclassified PH';
    } else {
      category = pvr > PVR_THRESHOLD ? 'Combined pre- and post-capillary PH' : 'Isolated post-capillary PH';
    }
  }

  // What the 2015 thresholds would have said, wherever they would have said something else.
  const oldPh = mpap >= MPAP_2015;
  const notes = [];
  if (ph && !oldPh) {
    notes.push(`A mean pressure of ${mpap} mmHg is pulmonary hypertension under the 2022 definition, which lowered the threshold from ${MPAP_2015} mmHg or more to above ${MPAP_THRESHOLD}. The 2015 definition would have called this normal.`);
  }
  if (ph && pawp !== null && pawp > PAWP_THRESHOLD && pvr !== null && pvr > PVR_THRESHOLD && pvr <= PVR_2015) {
    notes.push(`A resistance of ${pvrRounded} Wood units makes this a combined pre- and post-capillary picture under the 2022 cut of ${PVR_THRESHOLD} Wood units. The 2015 cut of ${PVR_2015} would have called the same numbers isolated post-capillary PH - a different process and a different treatment conversation.`);
  }
  if (ph && pawp !== null && pawp <= PAWP_THRESHOLD && pvr !== null && pvr > PVR_THRESHOLD && pvr <= PVR_2015) {
    notes.push(`Pre-capillary PH here rests on a resistance of ${pvrRounded} Wood units, above the 2022 cut of ${PVR_THRESHOLD} but below the ${PVR_2015} used before 2022.`);
  }
  if (mpap === MPAP_THRESHOLD) {
    notes.push(`A mean pressure of exactly ${MPAP_THRESHOLD} mmHg is NOT pulmonary hypertension. The threshold is strictly above ${MPAP_THRESHOLD}.`);
  }

  const missing = [];
  if (ph && pawp === null) missing.push('the wedge pressure');
  if (ph && pvr === null) missing.push('the pulmonary vascular resistance, or a cardiac output to compute it from');

  return {
    valid: true,
    ph,
    category,
    mpap,
    pawp,
    pvr: pvrRounded,
    pvrSource,
    versionNotes: notes,
    missing,
    abnormal: ph,
    bandLabel: category || (ph ? 'Pulmonary hypertension, not yet classified' : 'No pulmonary hypertension'),
    band: ph
      ? (category
        ? `${category} — mean pressure ${mpap} mmHg, wedge ${pawp} mmHg, resistance ${pvrRounded} Wood units.`
        : `Pulmonary hypertension by mean pressure ${mpap} mmHg, but not classifiable without ${missing.join(' and ')}.`)
      : `No pulmonary hypertension — a mean pressure of ${mpap} mmHg is not above ${MPAP_THRESHOLD} mmHg.`,
    detail: `Pulmonary hypertension is a mean pressure above ${MPAP_THRESHOLD} mmHg at rest. Within it: wedge at or below ${PAWP_THRESHOLD} with resistance above ${PVR_THRESHOLD} Wood units is pre-capillary; wedge above ${PAWP_THRESHOLD} with resistance at or below ${PVR_THRESHOLD} is isolated post-capillary; wedge above ${PAWP_THRESHOLD} with resistance above ${PVR_THRESHOLD} is combined; wedge at or below ${PAWP_THRESHOLD} with resistance at or below ${PVR_THRESHOLD} is unclassified.`,
    note: PH_NOTE,
  };
}
