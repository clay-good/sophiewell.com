// spec-v355: Lachman test grade of anterior cruciate ligament (ACL) laxity (grades I-III) — the
// clinician's read of anterior tibial translation (vs the contralateral knee) and the endpoint quality
// on the Lachman maneuver. The catalog carries knee decision rules (ottawa-knee, pittsburgh-knee-rule)
// but had no ACL-laxity exam grade. "lachman test grade" / "acl laxity grade" / "anterior drawer grade"
// routed to nothing.
//
// HIGH-STAKES: this reports the Lachman GRADE the clinician has determined on examination, NOT a
// diagnosis (a partial vs complete ACL tear), an imaging substitute, or a treatment decision
// (spec-v11 §5.3). The grade is one exam finding; MRI and the overall clinical picture decide
// management, which stays with the treating clinician.
//
// BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Lachman grading as reported in StatPearls (Lachman Test, NCBI Bookshelf) and Physiopedia and the
//     IKDC knee-examination convention: grade by anterior tibial translation vs the uninjured side plus
//     the endpoint quality.
//
// Grades (anterior tibial translation vs the contralateral knee + endpoint):
//   I   : 0-5 mm translation, firm endpoint (mild).
//   II  : 6-10 mm translation, soft endpoint (moderate). Flagged (5 mm or more is highly suggestive of
//         a complete ACL tear).
//   III : 11-15 mm translation, no discernible endpoint (severe). Flagged.

const GRADES = {
  I: { grade: 'I', severe: false, text: 'Lachman grade I - 0 to 5 mm anterior tibial translation with a firm endpoint; mild laxity.' },
  II: { grade: 'II', severe: true, text: 'Lachman grade II - 6 to 10 mm anterior tibial translation with a soft endpoint; moderate laxity. Translation of 5 mm or more is highly suggestive of a complete ACL tear.' },
  III: { grade: 'III', severe: true, text: 'Lachman grade III - 11 to 15 mm anterior tibial translation with no discernible endpoint; severe laxity.' },
};

const NOTE = 'The Lachman test grades ACL laxity by the anterior tibial translation (compared with the uninjured knee) and the endpoint quality. I: 0-5 mm, firm endpoint. II: 6-10 mm, soft endpoint. III: 11-15 mm, no endpoint. Five mm or more of translation is highly suggestive of a complete ACL tear, and the endpoint quality reflects how well the ligament restrains the knee. This is one examination finding, not a diagnosis, an imaging substitute, or a treatment decision; MRI and the overall picture decide management. This reports the grade the clinician has determined.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
  '1+': 'I', '2+': 'II', '3+': 'III',
};

// input:
//   grade: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3 and 1+/2+/3+)
export function lachmanAcl(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Lachman grade (I, II, or III; equivalently 1-3).' };
  }
  return {
    valid: true,
    grade: g.grade,
    severe: g.severe,
    abnormal: g.severe,
    bandLabel: `Lachman grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
