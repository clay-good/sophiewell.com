// spec-v296: benzodiazepine dose-equivalence converter (a noted catalog gap from
// the spec-v293 search sweep). Given a source benzodiazepine and daily dose it
// reports the approximate oral-diazepam equivalent and, for a chosen target
// benzodiazepine, the equivalent target dose — the estimate a clinician needs
// when transitioning one BZD to another for tapering.
//
// This is a planning estimate for tapering, NOT a prescription or an order
// (spec-v11 §5.3). Benzodiazepine equivalence carries real cross-source variance,
// so the tile reports BOTH published systems side by side (as the ASAM guideline
// does) rather than picking one silently; the clinician individualizes.
//
// FACTORS RE-FETCHED, NEVER RECALLED (spec-v97). The single authoritative source
// is the ASAM 2025 Joint Clinical Practice Guideline on Benzodiazepine Tapering,
// whose "Benzodiazepine Dose Equivalents" table presents TWO independent guideline
// systems side by side (built-in cross-verification):
//   - VA/DoD Clinical Practice Guideline for Management of SUD (2021)
//   - The Ashton Manual (Ashton CH, Newcastle University, 2002; revised 2007)
// All factors are "mg of the drug ≈ 10 mg oral diazepam." Ashton lists ranges for
// estazolam (1-2) and flurazepam (15-30); those produce an equivalent RANGE.

const REFERENCE_DIAZEPAM_MG = 10;

// factor = mg of this benzodiazepine approximately equal to 10 mg oral diazepam.
// vadod is a single number; ashton is a number or a [lo, hi] range.
const AGENTS = {
  alprazolam: { label: 'alprazolam', vadod: 1, ashton: 0.5 },
  chlordiazepoxide: { label: 'chlordiazepoxide', vadod: 25, ashton: 25 },
  clonazepam: { label: 'clonazepam', vadod: 1, ashton: 0.5 },
  clorazepate: { label: 'clorazepate', vadod: 15, ashton: 15 },
  diazepam: { label: 'diazepam', vadod: 10, ashton: 10 },
  estazolam: { label: 'estazolam', vadod: 1, ashton: [1, 2] },
  flurazepam: { label: 'flurazepam', vadod: 15, ashton: [15, 30] },
  lorazepam: { label: 'lorazepam', vadod: 2, ashton: 1 },
  oxazepam: { label: 'oxazepam', vadod: 30, ashton: 20 },
  quazepam: { label: 'quazepam', vadod: 10, ashton: 20 },
  temazepam: { label: 'temazepam', vadod: 15, ashton: 20 },
  triazolam: { label: 'triazolam', vadod: 0.25, ashton: 0.5 },
};

const NOTE = 'Benzodiazepine dose equivalents (ASAM 2025 Joint Clinical Practice Guideline on Benzodiazepine Tapering, which tabulates the VA/DoD 2021 SUD guideline and the Ashton Manual 2002 side by side). Factors are mg of the drug approximately equal to 10 mg oral diazepam; the two systems differ, so both are shown. Ashton lists ranges for estazolam and flurazepam. Equivalents are approximate and intended for guidance only — dose decisions must be individualized to patient response, and long half-life agents (diazepam, chlordiazepoxide) accumulate. This is a tapering planning estimate, not a prescription; confirm against your protocol and an independent check.';

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Convert `mg` of a drug with `factor` (single number or [lo,hi]) to oral
// diazepam mg. Returns { lo, hi, text } — lo === hi for a single factor.
function toDiazepam(mg, factor) {
  if (Array.isArray(factor)) {
    // A larger factor (more mg per 10 mg diazepam) => a SMALLER diazepam
    // equivalent, so the factor range inverts: hi factor -> lo equivalent.
    const a = round2((mg / factor[0]) * REFERENCE_DIAZEPAM_MG);
    const b = round2((mg / factor[1]) * REFERENCE_DIAZEPAM_MG);
    const lo = Math.min(a, b); const hi = Math.max(a, b);
    return { lo, hi, text: `${lo}-${hi}` };
  }
  const v = round2((mg / factor) * REFERENCE_DIAZEPAM_MG);
  return { lo: v, hi: v, text: String(v) };
}

// Convert oral diazepam mg to a target drug with `factor`. Same range handling.
function fromDiazepam(diazMg, factor) {
  if (Array.isArray(factor)) {
    const a = round2((diazMg / REFERENCE_DIAZEPAM_MG) * factor[0]);
    const b = round2((diazMg / REFERENCE_DIAZEPAM_MG) * factor[1]);
    const lo = Math.min(a, b); const hi = Math.max(a, b);
    return { lo, hi, text: `${lo}-${hi}` };
  }
  const v = round2((diazMg / REFERENCE_DIAZEPAM_MG) * factor);
  return { lo: v, hi: v, text: String(v) };
}

// source: agent key. dose: mg (number). target: agent key (default diazepam).
export function benzoEquivalence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const src = AGENTS[o.source];
  if (!src) return { valid: false, message: 'Choose the source benzodiazepine.' };
  const target = o.target && AGENTS[o.target] ? o.target : 'diazepam';
  const tgt = AGENTS[target];

  const dose = o.dose;
  if (dose === null || dose === undefined || dose === '' || typeof dose !== 'number' || !Number.isFinite(dose) || dose <= 0) {
    return { valid: false, message: 'Enter the source benzodiazepine dose in mg (a positive number).' };
  }
  if (dose > 10000) {
    throw new RangeError('Benzodiazepine dose must be a positive number of mg (<= 10000).');
  }

  // Diazepam equivalents by each system.
  const diazVaDod = toDiazepam(dose, src.vadod);
  const diazAshton = toDiazepam(dose, src.ashton);

  // Target-drug equivalents (skip the round trip if target is diazepam).
  const tgtVaDod = target === 'diazepam' ? diazVaDod : fromDiazepam(diazVaDod.lo === diazVaDod.hi ? diazVaDod.lo : (diazVaDod.lo + diazVaDod.hi) / 2, tgt.vadod);
  const tgtAshton = target === 'diazepam' ? diazAshton : fromDiazepam(diazAshton.lo === diazAshton.hi ? diazAshton.lo : (diazAshton.lo + diazAshton.hi) / 2, tgt.ashton);

  const isDiazTarget = target === 'diazepam';
  const band = isDiazTarget
    ? `${round2(dose)} mg ${src.label} ≈ ${diazVaDod.text} mg oral diazepam (VA/DoD 2021) or ${diazAshton.text} mg (Ashton 2002).`
    : `${round2(dose)} mg ${src.label} ≈ ${tgtVaDod.text} mg ${tgt.label} (VA/DoD 2021) or ${tgtAshton.text} mg (Ashton 2002); via ${diazVaDod.text}/${diazAshton.text} mg oral-diazepam equivalent.`;

  return {
    valid: true,
    sourceLabel: src.label,
    targetLabel: tgt.label,
    diazepamEquivVaDod: diazVaDod.text,
    diazepamEquivAshton: diazAshton.text,
    targetDoseVaDod: tgtVaDod.text,
    targetDoseAshton: tgtAshton.text,
    referenceDiazepamMg: REFERENCE_DIAZEPAM_MG,
    abnormal: false,
    bandLabel: `${src.label} → ${tgt.label} equivalent`,
    band,
    note: NOTE,
  };
}
