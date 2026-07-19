// spec-v486: the Samilson-Prieto classification of dislocation arthropathy of the shoulder (post-instability
// glenohumeral osteoarthritis), by the size of the inferior humeral / glenoid osteophyte on radiographs — mild
// / moderate / severe. It joins the shoulder tiles (Hamada cuff-tear arthropathy, Goutallier). "samilson" /
// "dislocation arthropathy shoulder" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Samilson RL, Prieto V. Dislocation arthropathy of the shoulder. J Bone Joint Surg Am. 1983;65(4):456-460.
//   - Shoulder references reproducing the same osteophyte-<3mm (mild) / 3-7mm-with-irregularity (moderate) /
//     >7mm-with-narrowing-and-sclerosis (severe) grouping.
//
// Grades (inferior osteophyte size):
//   mild     : an inferior humeral and/or glenoid osteophyte less than 3 mm in size.
//   moderate : an inferior osteophyte 3 to 7 mm, with slight glenohumeral joint irregularity.
//   severe   : an inferior osteophyte greater than 7 mm, with glenohumeral joint-space narrowing and sclerosis.

const GRADES = {
  MILD: { grade: 'Mild', text: 'Samilson-Prieto mild - an inferior humeral and/or glenoid osteophyte less than 3 mm in size.' },
  MODERATE: { grade: 'Moderate', text: 'Samilson-Prieto moderate - an inferior osteophyte 3 to 7 mm, with slight glenohumeral joint irregularity.' },
  SEVERE: { grade: 'Severe', text: 'Samilson-Prieto severe - an inferior osteophyte greater than 7 mm, with glenohumeral joint-space narrowing and sclerosis.' },
};

const NOTE = 'The Samilson-Prieto classification (Samilson & Prieto 1983) grades dislocation arthropathy of the shoulder by the size of the inferior humeral / glenoid osteophyte. Mild: osteophyte less than 3 mm. Moderate: 3 to 7 mm, with slight joint irregularity. Severe: greater than 7 mm, with joint-space narrowing and sclerosis. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  MILD: 'MILD', MODERATE: 'MODERATE', SEVERE: 'SEVERE',
  1: 'MILD', 2: 'MODERATE', 3: 'SEVERE',
  I: 'MILD', II: 'MODERATE', III: 'SEVERE',
};

// input:
//   grade: 'mild' / 'moderate' / 'severe' (case-insensitive; also accepts 1-3 or I-III).
export function samilsonPrieto(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Samilson-Prieto grade (mild, moderate, or severe).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Samilson-Prieto: ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
