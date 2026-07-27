// spec-v526: the neonatal Sequential Organ Failure Assessment (nSOFA). Zero-hit before this tile: "nsofa"
// and "wynn" across corpus.json, app.js, and lib/meta.js (the one "sofa" substring near it is
// `derivationSofa`, a variable name, not an instrument).
//
// AGE-BAND GAP WITH A REAL STRUCTURAL DIFFERENCE. The catalog already has adult SOFA/qSOFA and pSOFA
// (pediatric). The nSOFA is not those with neonatal cut points substituted: it has only THREE organ systems
// where SOFA has six. It DROPS the neurologic, hepatic, and renal domains outright, because a Glasgow Coma
// Scale cannot be scored in a 26-week infant, neonatal bilirubin is dominated by physiologic jaundice rather
// than by sepsis, and urine output and creatinine in the first days of life reflect maternal creatinine and
// the postnatal diuresis rather than the infant's own kidneys. Scoring an infant on the adult or pediatric
// instrument imports three domains that do not mean what they mean in an older patient.
//
// THREE SUBSCORES, TOTAL 0-15 (note the maximum is 15, not the adult SOFA's 24):
//   respiratory     0-8   intubation status and the SpO2/FiO2 ratio
//   cardiovascular  0-4   number of inotropes and systemic steroid treatment
//   hematologic     0-3   platelet count
//
// THE RESPIRATORY DOMAIN HAS A DELIBERATE BLIND SPOT, AND THIS TILE NAMES IT RATHER THAN QUIETLY PATCHING
// IT. SpO2/FiO2 is evaluated ONLY when the infant is intubated. A non-intubated infant scores 0 on the
// respiratory domain no matter how much oxygen they are receiving -- an infant on nasal CPAP at an FiO2 of
// 0.60 scores the same zero as an infant in room air. There is no "not intubated, on supplemental oxygen"
// row in the published table, in any source. Inventing one would be inventing a scale. Instead the tile
// reports the respiratory subscore as 0 AND says plainly that a non-intubated infant on significant oxygen
// is a patient the respiratory domain cannot see.
//
// THE HEMATOLOGIC ROWS OVERLAP AS PUBLISHED. Platelets of 40 satisfies both "below 100" (2 points) and
// "below 50" (3 points); every source writes "<100" and none writes "50-99". The SOFA-family convention
// applies: take the HIGHEST point value whose criterion is met. That is stated here rather than left to the
// reader, and pinned by a test.
//
// HIGH-STAKES: this is an organ-dysfunction score, not a diagnosis and not a treatment threshold. It was
// derived and validated to predict MORTALITY FROM LATE-ONSET SEPSIS IN PRETERM VERY-LOW-BIRTH-WEIGHT
// INFANTS. It does not diagnose sepsis, does not rule sepsis out, and a low score in an infant who looks
// unwell is not reassurance; it is also not an indication to start, continue, or stop antibiotics, inotropes,
// or steroids (spec-v11 section 5.3). Applying it outside the population it was validated in -- a term
// infant, an infant with early-onset sepsis, an infant with a congenital cardiac lesion -- is extrapolation,
// and the tile says so instead of implying the number travels. The clinical decision stays with the
// clinician.
//
// SUBSCORES AND CUT POINTS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent sources
// whose values agree exactly:
//   - Wynn JL, Polin RA. A neonatal sequential organ failure assessment score predicts mortality to
//     late-onset sepsis in preterm very low birth weight infants. Pediatr Res. 2020;88(1):85-90.
//   - A subsequent cohort study reproducing the same three domains with the same point rows, the same
//     SpO2/FiO2 thresholds, the same inotrope-and-steroid combinations, and the same platelet cut points.

const RESP_ROWS = [
  { points: 8, below: 100 },
  { points: 6, below: 150 },
  { points: 4, below: 200 },
  { points: 2, below: 300 },
];

const PLATELET_ROWS = [
  { points: 3, below: 50 },
  { points: 2, below: 100 },
  { points: 1, below: 150 },
];

export const INOTROPE_OPTIONS = [
  { value: '0', text: 'None' },
  { value: '1', text: 'One' },
  { value: '2', text: 'Two or more' },
];

const MAX_TOTAL = 15;

const NOTE = 'The neonatal SOFA (Wynn and Polin 2020) scores three organ systems for a total of 0 to 15: respiratory 0 to 8, cardiovascular 0 to 4, and hematologic 0 to 3. It has three domains where the adult SOFA has six, dropping the neurologic, hepatic, and renal domains because a coma scale cannot be scored in a very preterm infant, neonatal bilirubin is dominated by physiologic jaundice, and early creatinine and urine output reflect maternal creatinine and the postnatal diuresis. The respiratory domain evaluates the SpO2 to FiO2 ratio only when the infant is intubated, so a non-intubated infant scores 0 on that domain however much oxygen they are receiving: an infant on nasal CPAP at an FiO2 of 0.60 scores the same zero as an infant in room air. There is no not-intubated-on-oxygen row in the published table, so this is a blind spot in the instrument rather than something the tile can fill in. The published platelet rows overlap, since a count of 40 satisfies both below 100 and below 50, and the SOFA-family convention of taking the highest point value whose criterion is met applies. This is an organ-dysfunction score, not a diagnosis. It was derived and validated to predict mortality from late-onset sepsis in preterm very-low-birth-weight infants: it does not diagnose sepsis, does not rule it out, and a low score in an infant who looks unwell is not reassurance. It is not an indication to start, continue, or stop antibiotics, inotropes, or steroids, and applying it to a term infant, to early-onset sepsis, or to an infant with a congenital cardiac lesion is extrapolation beyond the population it was validated in.';

function readNumber(v, { min = 0 } = {}) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min) return NaN;
  return n;
}

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// Cardiovascular: the published table is a grid over (inotrope count) x (systemic steroids).
//   0 inotropes, no steroids -> 0      0 inotropes, steroids  -> 1
//   1 inotrope,  no steroids -> 2      1 inotrope,  steroids  -> 3
//  2+ inotropes, no steroids -> 3     2+ inotropes, steroids  -> 4
function cardiovascularPoints(inotropes, steroids) {
  if (inotropes === 0) return steroids ? 1 : 0;
  if (inotropes === 1) return steroids ? 3 : 2;
  return steroids ? 4 : 3;
}

// input:
//   intubated: yes/no. spo2: percent. fio2: fraction 0.21-1.0 (only used when intubated).
//   inotropes: '0' | '1' | '2' (2 means two or more). steroids: yes/no.
//   platelets: x10^9/L.
export function nsofa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const intubated = readBool(o.intubated);
  const steroids = readBool(o.steroids);
  const inotropesRaw = o.inotropes;
  const platelets = readNumber(o.platelets);

  if (intubated === null || steroids === null || inotropesRaw === '' || inotropesRaw === null
      || inotropesRaw === undefined || platelets === null) {
    return { valid: false, message: 'Enter intubation status, the number of inotropes, whether systemic steroids are being given, and the platelet count.' };
  }
  if (Number.isNaN(intubated) || Number.isNaN(steroids)) {
    return { valid: false, message: 'Intubation status and systemic steroid treatment must each be yes or no.' };
  }
  const inotropes = Number(inotropesRaw);
  if (!Number.isInteger(inotropes) || inotropes < 0 || inotropes > 2) {
    return { valid: false, message: 'Inotropes must be 0, 1, or 2 (2 meaning two or more).' };
  }
  if (Number.isNaN(platelets)) {
    return { valid: false, message: 'The platelet count must be a non-negative number, in x10^9/L.' };
  }

  let respiratory = 0;
  let ratio = null;
  if (intubated) {
    const spo2 = readNumber(o.spo2);
    const fio2 = readNumber(o.fio2);
    if (spo2 === null || fio2 === null) {
      return { valid: false, message: 'An intubated infant needs an SpO2 and an FiO2 so the SpO2 to FiO2 ratio can be scored.' };
    }
    if (Number.isNaN(spo2) || Number.isNaN(fio2) || fio2 <= 0) {
      return { valid: false, message: 'SpO2 must be a percentage and FiO2 a fraction above 0 (for example 0.4 for 40 percent).' };
    }
    ratio = spo2 / fio2;
    const row = RESP_ROWS.find((r) => ratio < r.below);
    respiratory = row ? row.points : 0;
  }

  const cardiovascular = cardiovascularPoints(inotropes, steroids);
  // The published platelet rows overlap; take the highest point value whose criterion is met.
  const hemRow = PLATELET_ROWS.find((r) => platelets < r.below);
  const hematologic = hemRow ? hemRow.points : 0;

  const total = respiratory + cardiovascular + hematologic;

  const respNote = intubated
    ? `Respiratory ${respiratory} of 8 from an SpO2 to FiO2 ratio of ${Math.round(ratio)}.`
    : 'Respiratory 0 of 8: the SpO2 to FiO2 ratio is scored only when the infant is intubated, so a non-intubated infant on significant supplemental oxygen is a patient this domain cannot see.';

  return {
    valid: true,
    total,
    respiratory,
    cardiovascular,
    hematologic,
    sfRatio: ratio === null ? null : Math.round(ratio),
    bandLabel: `nSOFA ${total} of ${MAX_TOTAL}`,
    band: `nSOFA ${total} of ${MAX_TOTAL}. ${respNote} Cardiovascular ${cardiovascular} of 4, hematologic ${hematologic} of 3. An organ-dysfunction score, not a diagnosis of sepsis and not a treatment threshold.`,
    note: NOTE,
  };
}
