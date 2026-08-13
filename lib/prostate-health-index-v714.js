// spec-v714: Prostate Health Index (phi).
//
// Combines total PSA, free PSA, and [-2]proPSA (p2PSA) into a single index that stratifies
// the probability of prostate cancer on biopsy. Source:
//   Catalona WJ, Partin AW, Sanda MG, et al. A multicenter study of [-2]pro-prostate specific
//   antigen combined with prostate specific antigen and free PSA for prostate cancer detection
//   in the 2.0 to 10.0 ng/mL PSA range. J Urol. 2011;185(5):1650-1655. (PMID 21419439.)
//
//   phi = (p2PSA / free PSA) x sqrt(total PSA)
//     p2PSA   = [-2]proPSA in pg/mL
//     free PSA in ng/mL
//     total PSA in ng/mL
//
// Reference probability of prostate cancer on biopsy (Beckman Coulter / Catalona), for total
// PSA 2-10 ng/mL with a normal DRE, age >= 50:
//   phi 0-26.9    ~ 11%
//   phi 27.0-35.9 ~ 21%
//   phi 36.0-54.9 ~ 33%
//   phi >= 55.0   ~ 50%
//
// Pure: no DOM, no clock, no network.

export const PHI_NOTE = 'Prostate Health Index (phi) (Catalona WJ, Partin AW, Sanda MG, et al, J Urol 2011;185(5):1650-1655). It combines three blood tests into one index: phi equals p2PSA divided by free PSA, multiplied by the square root of the total PSA, with p2PSA (that is, minus-2 proPSA) in pg/mL and both free and total PSA in ng/mL. A higher phi means a higher probability of finding prostate cancer on biopsy. Using the Beckman Coulter reference ranges for a total PSA of 2 to 10 ng/mL with a normal digital rectal exam, a phi of 0 to 26.9 corresponds to roughly an 11 percent probability of cancer, 27.0 to 35.9 to about 21 percent, 36.0 to 54.9 to about 33 percent, and 55.0 or more to about 50 percent; these probabilities are approximate reference figures. It is intended to refine the decision to biopsy within the 2 to 10 ng/mL PSA range, not to diagnose cancer, and it supports rather than replaces urologic assessment and shared decision-making.';

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function band(phi) {
  if (phi < 27) return { tier: 'low', prob: 'about 11%' };
  if (phi < 36) return { tier: 'moderate-low', prob: 'about 21%' };
  if (phi < 55) return { tier: 'moderate-high', prob: 'about 33%' };
  return { tier: 'high', prob: 'about 50%' };
}

export function prostateHealthIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const totalPsa = pos(o.totalPsa);
  if (!Number.isFinite(totalPsa) || totalPsa <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'totalPsa', message: 'Enter total PSA (ng/mL).', note: PHI_NOTE };
  }
  const freePsa = pos(o.freePsa);
  if (!Number.isFinite(freePsa) || freePsa <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'freePsa', message: 'Enter free PSA (ng/mL).', note: PHI_NOTE };
  }
  const p2psa = pos(o.p2psa);
  if (!Number.isFinite(p2psa) || p2psa <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'p2psa', message: 'Enter p2PSA ([-2]proPSA) in pg/mL.', note: PHI_NOTE };
  }
  if (freePsa > totalPsa) {
    return { valid: false, code: 'INVALID_INPUT', field: 'freePsa', message: 'Free PSA cannot exceed total PSA.', note: PHI_NOTE };
  }

  const phi = (p2psa / freePsa) * Math.sqrt(totalPsa);
  const rounded = Math.round(phi * 10) / 10;
  const b = band(phi);

  return {
    valid: true,
    phi: rounded,
    tier: b.tier,
    probability: b.prob,
    abnormal: phi >= 36,
    bandLabel: `phi ${rounded}`,
    band: `phi ${rounded} — ${b.prob} probability of prostate cancer on biopsy.`,
    detail: `phi = (p2PSA ${p2psa} / free PSA ${freePsa}) x sqrt(total PSA ${totalPsa}) = ${rounded}. Reference bands: 0-26.9 ~11%, 27-35.9 ~21%, 36-54.9 ~33%, >= 55 ~50% (total PSA 2-10 ng/mL, normal DRE).`,
    note: PHI_NOTE,
  };
}
