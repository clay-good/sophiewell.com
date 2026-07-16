// spec-v351: Goligher classification of INTERNAL hemorrhoids (grades I-IV) — the worldwide-standard
// grading of internal hemorrhoidal disease by the degree of prolapse the clinician observes. Grade I
// bleeds without prolapse; grade II prolapses on straining but reduces spontaneously; grade III
// prolapses and requires manual reduction; grade IV is irreducible (permanently prolapsed). The
// GI-bleed / anorectal domain has the bleeding-severity scores (forrest, rockall, glasgow-blatchford)
// but the internal-hemorrhoid prolapse grade routed to nothing. "goligher classification" / "internal
// hemorrhoid grade" / "hemorrhoid grade" routed to nothing.
//
// HIGH-STAKES: this reports the Goligher GRADE the clinician has determined from anoscopy /
// examination, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient
// (spec-v11 §5.3). The office/conservative (lower grades) vs procedural/operative (higher grades)
// association is the classically taught pattern, not an order; the management decision stays with the
// colorectal / general surgeon.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Goligher JC. Surgery of the Anus, Rectum and Colon. 5th ed. London: Bailliere Tindall; 1984
//     (the internal-hemorrhoid grade I-IV prolapse definitions).
//   - Rorvik HD, et al. Is the Goligher classification a valid tool in clinical practice and research
//     for hemorrhoidal disease? Tech Coloproctol. 2022;26(5):341-349 (doi:10.1007/s10151-022-02591-3),
//     reproducing the same four-grade prolapse definitions.
//
// Grades (internal hemorrhoids, by degree of prolapse):
//   I   : bleed but do not prolapse; the cushions project into the anal canal without descending
//         through the anus.
//   II  : prolapse through the anus on straining or defecation but reduce spontaneously.
//   III : prolapse on straining or defecation and require MANUAL reduction. Flagged (advanced).
//   IV  : irreducible; permanently prolapsed and cannot be reduced (may be thrombosed or
//         strangulated). Flagged (advanced).

const GRADES = {
  I: { grade: 'I', advanced: false, text: 'Goligher grade I - internal hemorrhoids that bleed but do not prolapse; the anal cushions project into the anal canal without descending through the anus.' },
  II: { grade: 'II', advanced: false, text: 'Goligher grade II - prolapse through the anus on straining or defecation but reduce spontaneously.' },
  III: { grade: 'III', advanced: true, text: 'Goligher grade III - prolapse on straining or defecation and require manual reduction. An advanced (higher) grade.' },
  IV: { grade: 'IV', advanced: true, text: 'Goligher grade IV - irreducible; permanently prolapsed and cannot be manually reduced (may be thrombosed or strangulated). An advanced (higher) grade.' },
};

const NOTE = 'The Goligher classification grades INTERNAL hemorrhoids by the degree of prolapse. I: bleed, no prolapse. II: prolapse on straining, reduce spontaneously. III: prolapse, require manual reduction. IV: irreducible / permanently prolapsed (may be thrombosed or strangulated). Office/conservative management (lower grades) vs procedural or operative management (higher grades) is the classically taught pattern, not an order. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4)
export function goligherHemorrhoids(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Goligher grade (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    advanced: g.advanced,
    abnormal: g.advanced,
    bandLabel: `Goligher grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
