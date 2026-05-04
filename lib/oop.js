// Out-of-Pocket Cost Estimator. Standard United States commercial insurance
// math, in-network, plan year, no balance billing assumed.
//
// Order: deductible (up to allowed amount), coinsurance on remainder, copay,
// then cap by remaining out-of-pocket maximum.

export function estimateOop({
  allowedAmount,
  deductible,
  deductibleMet,
  coinsurance, // percent 0-100
  copay,
  oopMax,
  oopMet,
}) {
  for (const [k, v] of Object.entries({ allowedAmount, deductible, deductibleMet, coinsurance, copay, oopMax, oopMet })) {
    if (!Number.isFinite(v) || v < 0) {
      throw new TypeError(`estimateOop: ${k} must be a non-negative finite number.`);
    }
  }
  if (deductibleMet > deductible) {
    throw new RangeError('estimateOop: deductibleMet cannot exceed deductible.');
  }
  if (oopMet > oopMax) {
    throw new RangeError('estimateOop: oopMet cannot exceed oopMax.');
  }
  if (coinsurance < 0 || coinsurance > 100) {
    throw new RangeError('estimateOop: coinsurance must be in [0, 100].');
  }

  const deductibleRemaining = Math.max(0, deductible - deductibleMet);
  const deductiblePortion = Math.min(allowedAmount, deductibleRemaining);
  const postDeductible = allowedAmount - deductiblePortion;
  const coinsurancePortion = postDeductible * (coinsurance / 100);
  const copayPortion = copay;

  const subtotalBeforeCap = deductiblePortion + coinsurancePortion + copayPortion;
  const oopRemaining = Math.max(0, oopMax - oopMet);
  const patientResponsibility = Math.min(subtotalBeforeCap, oopRemaining);
  const planPays = Math.max(0, allowedAmount - (deductiblePortion + coinsurancePortion));

  return {
    allowedAmount: round2(allowedAmount),
    deductibleApplied: round2(deductiblePortion),
    coinsuranceApplied: round2(coinsurancePortion),
    copayApplied: round2(copayPortion),
    cappedByOopMax: subtotalBeforeCap > oopRemaining,
    patientResponsibility: round2(patientResponsibility),
    planPays: round2(planPays),
  };
}

function round2(n) { return Math.round(n * 100) / 100; }
