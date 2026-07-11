// spec-v292: restrictive transfusion threshold decision aid (AABB 2023).
//
// Answers the routine bedside question the existing transfusion tiles (all
// massive-transfusion scores or pediatric volume calculators) do not: "is this
// hemoglobin low enough to transfuse THIS patient?" Given a hemoglobin value and
// a patient population, it reports the AABB 2023 restrictive threshold for that
// population and whether the entered hemoglobin sits below it. Per-patient
// computation, not a static reference table (spec-v29 §3).
//
// This reports a guideline-stated threshold comparison — it is NOT a diagnosis
// and NOT a transfusion order (spec-v11 §5.3). The decision stays with the
// clinician and the patient.
//
// THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// primary publication and >= 2 independent summaries at implementation:
//   - Carson JL, Stanworth SJ, Guyatt G, et al. Red Blood Cell Transfusion: 2023
//     AABB International Guidelines. JAMA. 2023;330(19):1892-1902.
//   Cross-checked against the AABB clinical-practice-guideline summary and the
//   Annals of Internal Medicine synopsis (acpjournals.org/doi/10.7326/J23-0116).
//   CORRECTION applied at implementation per spec-v97: the design.md sketch
//   listed cardiac surgery at 8 g/dL; the verified guideline value is 7.5 g/dL
//   (orthopedic surgery and preexisting cardiovascular disease are 8 g/dL). The
//   guideline makes NO numeric recommendation for acute coronary syndrome
//   (insufficient evidence at publication) — the tile reports that, never a
//   fabricated number (Design D2).

// Each population maps to its AABB 2023 restrictive threshold (g/dL, canonical)
// and the phrase used in the decision string. `hb: null` marks a population for
// which the guideline makes no numeric recommendation.
const POPULATIONS = {
  'stable-adult': { hb: 7, label: 'a stable hospitalized adult (including critically ill)' },
  'cardiac-surgery': { hb: 7.5, label: 'cardiac surgery' },
  'orthopedic-surgery': { hb: 8, label: 'orthopedic surgery' },
  'cardiovascular-disease': { hb: 8, label: 'preexisting cardiovascular disease' },
  'stable-child': { hb: 7, label: 'a stable critically ill child' },
  'acute-coronary-syndrome': { hb: null, label: 'acute coronary syndrome' },
};

const NOTE = 'AABB 2023 restrictive transfusion thresholds (Carson JL et al., JAMA 2023;330(19):1892-1902): transfusion is considered when the hemoglobin falls BELOW the threshold; at or above it a restrictive strategy applies and transfusion is not indicated on the number alone. Hemodynamically stable hospitalized adults (including critically ill) and stable critically ill children: 7 g/dL (strong recommendation, moderate certainty). Cardiac surgery: 7.5 g/dL; orthopedic surgery or preexisting cardiovascular disease: 8 g/dL. For acute coronary syndrome the guideline makes no restrictive-threshold recommendation (insufficient evidence). Active symptoms of anemia (angina, heart failure, hemodynamic instability) can justify transfusion above the numeric threshold regardless of population — a clinical-judgment override that does not lower the threshold. This reports a guideline threshold comparison, not a diagnosis or a transfusion order.';

// Trim a threshold/value to a clean display string: 7 -> "7", 7.5 -> "7.5".
function fmt(n) {
  return String(Number(Number(n).toFixed(2)));
}

// hemoglobin: g/dL (canonical). population: one of POPULATIONS' keys.
// symptomatic: boolean — active symptomatic anemia (clinical-judgment override).
export function transfusionThreshold(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pop = POPULATIONS[o.population] ? o.population : 'stable-adult';
  const entry = POPULATIONS[pop];
  const symptomatic = o.symptomatic === true || o.symptomatic === 1 || o.symptomatic === '1'
    || o.symptomatic === 'on' || o.symptomatic === 'yes' || o.symptomatic === 'true';

  const raw = o.hemoglobin;
  if (raw === null || raw === undefined || raw === '') {
    return { valid: false, message: 'Enter a hemoglobin value and select the patient population.' };
  }
  const hb = Number(raw);
  if (!Number.isFinite(hb) || hb <= 0 || hb > 30) {
    throw new RangeError('Hemoglobin must be a number between 0 and 30 g/dL.');
  }

  // No-recommendation population (acute coronary syndrome): report the carve-out,
  // never a fabricated numeric threshold (Design D2).
  if (entry.hb === null) {
    const band = `AABB 2023 makes no restrictive-threshold recommendation for ${entry.label} (insufficient evidence) — decide on symptoms, hemodynamics, and cardiology input, not a hemoglobin number.`;
    return {
      valid: true,
      threshold: null,
      belowThreshold: null,
      abnormal: false,
      bandLabel: 'No AABB numeric threshold',
      band,
      note: NOTE,
    };
  }

  const threshold = entry.hb;
  const belowThreshold = hb < threshold;
  const t = fmt(threshold);
  const h = fmt(hb);
  let band = belowThreshold
    ? `Hgb ${h} g/dL is below the ${t} g/dL AABB restrictive threshold for ${entry.label} — transfusion is reasonable per AABB 2023.`
    : `Hgb ${h} g/dL is at or above the ${t} g/dL AABB restrictive threshold for ${entry.label} — restrictive strategy: do not transfuse on the hemoglobin alone.`;
  if (symptomatic) {
    band += ' Active symptoms of anemia (angina, heart failure, hemodynamic instability) can justify transfusion above the numeric threshold (clinical-judgment override).';
  }

  return {
    valid: true,
    threshold,
    belowThreshold,
    symptomatic,
    abnormal: belowThreshold,
    bandLabel: belowThreshold ? `Below the ${t} g/dL threshold` : `At or above the ${t} g/dL threshold`,
    band,
    note: NOTE,
  };
}
