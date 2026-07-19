// spec-v465: the Stamey grading of stress urinary incontinence, by the degree of physical stress that
// provokes leakage — grades 1 / 2 / 3. It is a classic bedside severity grade for female stress incontinence
// and companions the Sandvik severity index and ICIQ-UI tiles. "stamey" / "stress incontinence grade" routed
// to nothing.
//
// HIGH-STAKES: this reports the severity GRADE the clinician has determined from the history, NOT a diagnosis,
// a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the urology / urogynecology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Stamey TA. Endoscopic suspension of the vesical neck for urinary incontinence in females. Ann Surg.
//     1980;192(4):465-471.
//   - Urology / urogynecology references reproducing the same sudden-pressure (1) / lesser-stress (2) /
//     total-continuous (3) grading.
//
// Grades (provoking stress):
//   1 : incontinence with sudden increases in intra-abdominal pressure (coughing, sneezing, laughing), but
//       not in bed at night.
//   2 : incontinence with lesser degrees of stress - walking, standing erect, or sitting up in bed.
//   3 : total (continuous) incontinence - urine loss without any relation to physical activity or position.

const GRADES = {
  1: { grade: '1', text: 'Stamey grade 1 - incontinence with sudden increases in intra-abdominal pressure (coughing, sneezing, laughing), but not in bed at night.' },
  2: { grade: '2', text: 'Stamey grade 2 - incontinence with lesser degrees of stress (walking, standing erect, or sitting up in bed).' },
  3: { grade: '3', text: 'Stamey grade 3 - total (continuous) incontinence; urine loss without any relation to physical activity or position.' },
};

const NOTE = 'The Stamey grading (Stamey 1980) grades stress urinary incontinence by the physical stress that provokes leakage. 1: sudden increases in abdominal pressure (cough, sneeze, laugh), not at night. 2: lesser stress (walking, standing, sitting up). 3: total, continuous incontinence regardless of activity or position. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: '1', 2: '2', 3: '3',
  I: '1', II: '2', III: '3',
};

// input:
//   grade: 1 / 2 / 3 (also accepts I / II / III).
export function stameyIncontinence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Stamey grade (1, 2, or 3).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Stamey grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
