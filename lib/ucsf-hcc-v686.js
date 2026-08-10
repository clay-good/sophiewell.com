// spec-v686: UCSF criteria for HCC liver-transplant eligibility.
//
// The modestly expanded companion to the built Milan criteria (milan-criteria) and
// Up-to-Seven (up-to-seven) for hepatocellular carcinoma transplant selection. Source:
//   Yao FY, Ferrell L, Bass NM, et al. Liver transplantation for hepatocellular
//   carcinoma: expansion of the tumor size limits does not adversely impact survival.
//   Hepatology. 2001;33(6):1394-1403. PMID 11391528.
//
// Within UCSF (by tumor burden) requires EITHER:
//   - a solitary tumor <= 6.5 cm, OR
//   - <= 3 nodules with the largest lesion <= 4.5 cm AND total tumor diameter <= 8 cm.
// As with Milan, macrovascular (gross vascular) invasion or extrahepatic spread makes
// the patient ineligible regardless of size. Milan is single <= 5 cm or <= 3 nodules
// each <= 3 cm; UCSF raises the ceilings and adds the total-diameter cap.
//
// Pure: no DOM, no clock, no network.

export const UCSF_NOTE = 'UCSF criteria for hepatocellular carcinoma liver-transplant eligibility (Yao FY, et al., Hepatology 2001;33(6):1394-1403). A patient is within UCSF, by tumor burden, if there is a single tumor 6.5 cm or smaller, or no more than 3 nodules with the largest lesion 4.5 cm or smaller and a total tumor diameter of 8 cm or less. As with the Milan criteria, gross (macro)vascular invasion or extrahepatic spread makes a patient ineligible regardless of size. UCSF is the modestly expanded version of Milan (single 5 cm or 3 nodules each 3 cm): the nodule cap stays at 3, the size ceilings rise, and a total-diameter limit is added, with reported post-transplant survival comparable to Milan. This classifies radiologic tumor burden against the criteria to support candidacy discussion; final listing decisions rest with the transplant team and its regional policy.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}
function flag(v) { return v === true || v === 1 || v === '1' || v === 'on'; }

export function ucsfHcc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const nodules = num(o.nodules);
  if (!Number.isInteger(nodules) || nodules < 1 || nodules > 50) {
    return { valid: false, code: 'MISSING_INPUT', field: 'nodules', message: 'Enter the number of tumor nodules (a whole number, 1 or more).' };
  }
  const largest = num(o.largest);
  if (!Number.isFinite(largest) || largest <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'largest', message: 'Enter the largest tumor diameter in cm.' };
  }
  const total = num(o.total);
  if (!Number.isFinite(total) || total <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'total', message: 'Enter the total (summed) tumor diameter in cm.' };
  }
  if (total + 1e-9 < largest) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'total', message: 'Total tumor diameter cannot be less than the largest single tumor.' };
  }
  const vascular = flag(o.vascular);
  const extrahepatic = flag(o.extrahepatic);

  // Tumor-burden test.
  let sizeWithin;
  let sizeReason;
  if (nodules === 1) {
    sizeWithin = largest <= 6.5;
    sizeReason = sizeWithin ? `solitary tumor ${largest} cm (<= 6.5 cm)` : `solitary tumor ${largest} cm exceeds 6.5 cm`;
  } else if (nodules <= 3) {
    sizeWithin = largest <= 4.5 && total <= 8;
    sizeReason = sizeWithin
      ? `${nodules} nodules, largest ${largest} cm (<= 4.5 cm), total ${total} cm (<= 8 cm)`
      : `${nodules} nodules fail the limits (largest <= 4.5 cm and total <= 8 cm): largest ${largest} cm, total ${total} cm`;
  } else {
    sizeWithin = false;
    sizeReason = `${nodules} nodules exceeds the maximum of 3`;
  }

  const vetoes = [];
  if (vascular) vetoes.push('macrovascular invasion');
  if (extrahepatic) vetoes.push('extrahepatic spread');
  const within = sizeWithin && vetoes.length === 0;

  let detail;
  if (within) {
    detail = `Within UCSF: ${sizeReason}; no macrovascular invasion or extrahepatic spread.`;
  } else if (vetoes.length > 0 && sizeWithin) {
    detail = `Outside UCSF: tumor size is within limits (${sizeReason}) but ${vetoes.join(' and ')} makes the patient ineligible.`;
  } else {
    detail = `Outside UCSF: ${sizeReason}${vetoes.length ? `; also ${vetoes.join(' and ')}` : ''}.`;
  }

  return {
    valid: true,
    within,
    status: within ? 'within' : 'outside',
    // Flag ineligibility (outside UCSF) as the management-changing result.
    abnormal: !within,
    band: `${within ? 'Within' : 'Outside'} UCSF criteria for HCC transplant.`,
    detail,
    note: UCSF_NOTE,
  };
}
