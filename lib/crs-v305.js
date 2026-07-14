// spec-v305: Cytokine release syndrome (CRS) severity — the ASTCT consensus
// grading (a catalog gap surfaced by the SESSION-40 third fresh-domain search
// sweep: "car t cytokine release grade" had no tile). Given the fever,
// hypotension, and hypoxia status of a patient after immune-effector-cell therapy
// (e.g. CAR-T), the tile reports the ASTCT CRS grade (1-4), taking the more severe
// of the hypotension-driven and hypoxia-driven grades.
//
// This reports the classification's own grade, NOT a treatment order
// (spec-v11 §5.3) — tocilizumab / steroids / ICU escalation stay with the
// clinician.
//
// TABLE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against two
// independent sources that agree on the four grades and the oxygen / vasopressor
// thresholds:
//   - Lee DW, Santomasso BD, Locke FL, et al. ASTCT consensus grading for cytokine
//     release syndrome and neurologic toxicity associated with immune effector
//     cells. Biol Blood Marrow Transplant. 2019;25(4):625-638.
//   - The NCBI/PDQ reproduction of the same ASTCT CRS consensus grading table.

// Severity contributed by each organ axis (0 = none; 2/3/4 = grade at that level).
const HYPOTENSION = { none: 0, novaso: 2, onevaso: 3, multivaso: 4 };
const HYPOXIA = { none: 0, lowflow: 2, highflow: 3, pospressure: 4 };

const DRIVER = {
  hypotension: { 2: 'hypotension not requiring vasopressors', 3: 'hypotension requiring one vasopressor (± vasopressin)', 4: 'hypotension requiring multiple vasopressors (excluding vasopressin)' },
  hypoxia: { 2: 'hypoxia requiring low-flow nasal cannula (≤6 L/min) or blow-by', 3: 'hypoxia requiring high-flow nasal cannula (>6 L/min), facemask, nonrebreather, or Venturi mask', 4: 'hypoxia requiring positive pressure (CPAP, BiPAP, or intubation/mechanical ventilation)' },
};

const NOTE = 'ASTCT consensus CRS grading (Lee 2019) after immune-effector-cell (e.g. CAR-T) therapy. Fever (≥38°C, not otherwise explained) is the entry criterion; the grade is then the MORE SEVERE of the hypotension axis and the hypoxia axis. Grade 1 = fever only; grade 2 = hypotension not needing vasopressors and/or hypoxia on low-flow O2; grade 3 = hypotension needing one vasopressor and/or hypoxia on high-flow O2 or a mask; grade 4 = hypotension needing multiple vasopressors and/or hypoxia needing positive pressure. Grades ≥3 are severe (typically ICU-level; anti-cytokine therapy such as tocilizumab and/or steroids is often escalated). This reports the ASTCT grade, not a treatment order, which stays with the clinician.';

// input.fever (bool): temperature ≥38°C not otherwise explained. input.hypotension:
// 'none' | 'novaso' | 'onevaso' | 'multivaso'. input.hypoxia: 'none' | 'lowflow' |
// 'highflow' | 'pospressure'. Returns the ASTCT CRS grade (0-4; 0 = does not meet).
export function crsGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on';
  const fever = b(o.fever);
  const hypoKey = Object.prototype.hasOwnProperty.call(HYPOTENSION, o.hypotension) ? o.hypotension : 'none';
  const hypoxKey = Object.prototype.hasOwnProperty.call(HYPOXIA, o.hypoxia) ? o.hypoxia : 'none';
  const hypoSev = HYPOTENSION[hypoKey];
  const hypoxSev = HYPOXIA[hypoxKey];
  const maxSev = Math.max(hypoSev, hypoxSev);

  let grade;
  if (maxSev === 0) grade = fever ? 1 : 0;
  else grade = maxSev;

  const drivers = [];
  if (hypoSev >= 2) drivers.push(DRIVER.hypotension[hypoSev]);
  if (hypoxSev >= 2) drivers.push(DRIVER.hypoxia[hypoxSev]);

  let band;
  if (grade === 0) {
    band = 'Does not meet CRS criteria (no fever, hypotension, or hypoxia).';
  } else if (grade === 1) {
    band = 'ASTCT CRS grade 1 of 4: fever ≥38°C without hypotension or hypoxia.';
  } else {
    band = `ASTCT CRS grade ${grade} of 4: ${drivers.join('; and/or ')}.`;
  }
  if (grade >= 3) band += ' Severe CRS — typically ICU-level care.';

  return {
    valid: true,
    grade,
    fever,
    severe: grade >= 3,
    abnormal: grade >= 3,
    meetsCriteria: grade >= 1,
    bandLabel: grade === 0 ? 'No CRS' : `CRS grade ${grade}`,
    band,
    note: NOTE,
  };
}
