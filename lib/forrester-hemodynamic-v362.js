// spec-v362: Forrester hemodynamic classification (subsets I-IV) of acute myocardial infarction /
// acute heart failure — derives the hemodynamic subset from the cardiac index (CI) and the pulmonary
// capillary wedge pressure (PCWP), the invasive counterpart to the clinical Killip classification. The
// catalog carries the Killip classification and a hemodynamics suite (CI, SVR/PVR) but not the Forrester
// subset. "forrester classification" / "hemodynamic subset" / "warm and wet" routed to nothing.
//
// HIGH-STAKES: this reports the Forrester SUBSET computed from the CI and PCWP the clinician has
// measured, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11
// §5.3). The mortality figures are the 1976 derivation-cohort averages, not an individual prediction;
// the management decision stays with the treating clinician.
//
// CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Forrester JS, Diamond GA, Swan HJC. Correlative classification of clinical and hemodynamic
//     function after acute myocardial infarction. Am J Cardiol. 1977;39(2):137-145 (the CI 2.2 /
//     PCWP 18 subsets I-IV and their derivation-cohort mortality).
//   - Cardiology references reproducing the same warm/cold (CI 2.2) x dry/wet (PCWP 18) 2x2 grid.
//
// Subsets (perfusion CI x congestion PCWP):
//   I   : CI >= 2.2 and PCWP <= 18 - warm and dry (no hypoperfusion, no congestion). ~2.2% mortality.
//   II  : CI >= 2.2 and PCWP > 18  - warm and wet (pulmonary congestion). ~10.1% mortality. Flagged.
//   III : CI < 2.2 and PCWP <= 18  - cold and dry (hypoperfusion, hypovolemic). ~22.4% mortality.
//         Flagged.
//   IV  : CI < 2.2 and PCWP > 18   - cold and wet (hypoperfusion + congestion; cardiogenic shock
//         physiology). ~55.5% mortality. Flagged.
//
// Cutoffs: perfusion divides at CI 2.2 L/min/m2 (cold if below); congestion divides at PCWP 18 mmHg
// (wet if above).

const CI_CUT = 2.2;   // L/min/m2
const PCWP_CUT = 18;  // mmHg

const SUBSETS = {
  I: { subset: 'I', profile: 'warm and dry', mortality: '~2.2%', flag: false },
  II: { subset: 'II', profile: 'warm and wet', mortality: '~10.1%', flag: true },
  III: { subset: 'III', profile: 'cold and dry', mortality: '~22.4%', flag: true },
  IV: { subset: 'IV', profile: 'cold and wet', mortality: '~55.5%', flag: true },
};

const NOTE = 'The Forrester classification (Forrester, Diamond & Swan 1977) assigns a hemodynamic subset from the cardiac index (perfusion) and the pulmonary capillary wedge pressure (congestion). Cold = CI below 2.2 L/min/m2 (hypoperfusion); wet = PCWP above 18 mmHg (pulmonary congestion). I warm and dry; II warm and wet; III cold and dry; IV cold and wet (cardiogenic shock physiology). It is the invasive counterpart to the clinical Killip classification. The mortality figures are the 1976 derivation-cohort averages, not an individual prediction. This reports the subset computed from the entered values, not a diagnosis, a treatment decision, or a prognosis.';

function num(v) {
  if (v === '' || v == null) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

// input:
//   ci:   cardiac index, L/min/m2
//   pcwp: pulmonary capillary wedge pressure, mmHg
export function forresterHemodynamic(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ci = num(o.ci);
  const pcwp = num(o.pcwp);
  if (Number.isNaN(ci) || Number.isNaN(pcwp)) {
    return { valid: false, message: 'Enter the cardiac index (L/min/m2) and the PCWP (mmHg).' };
  }
  if (ci < 0 || ci > 15 || pcwp < 0 || pcwp > 60) {
    return { valid: false, message: 'Enter a plausible cardiac index (0-15 L/min/m2) and PCWP (0-60 mmHg).' };
  }
  const cold = ci < CI_CUT;
  const wet = pcwp > PCWP_CUT;
  const key = !cold && !wet ? 'I' : !cold && wet ? 'II' : cold && !wet ? 'III' : 'IV';
  const s = SUBSETS[key];
  return {
    valid: true,
    subset: s.subset,
    profile: s.profile,
    perfusion: cold ? 'cold (hypoperfusion)' : 'warm',
    congestion: wet ? 'wet (congestion)' : 'dry',
    mortality: s.mortality,
    abnormal: s.flag,
    bandLabel: `Forrester subset ${s.subset} (${s.profile})`,
    band: `Forrester subset ${s.subset} (${s.profile}) - CI ${ci} L/min/m2 and PCWP ${pcwp} mmHg; derivation-cohort mortality ${s.mortality}.`,
    note: NOTE,
  };
}
