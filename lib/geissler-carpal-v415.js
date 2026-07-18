// spec-v415: Geissler arthroscopic classification of interosseous (scapholunate / lunotriquetral)
// carpal-ligament injury, grading instability by what is seen from the radiocarpal vs midcarpal joint and
// whether a probe / arthroscope passes the interval — grades I / II / III / IV. It is the arthroscopic
// companion to the Mayfield radiographic staging of perilunar instability. "geissler" / "scapholunate
// instability grade" routed to nothing.
//
// HIGH-STAKES: this reports the GRADE the clinician has determined at arthroscopy, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision
// stays with the hand / orthopedic team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Geissler WB, Freeland AE, Savoie FH, McIntyre LW, Whipple TL. Intracarpal soft-tissue lesions
//     associated with an intra-articular fracture of the distal end of the radius. J Bone Joint Surg Am.
//     1996;78(3):357-365 (the four-grade arthroscopic classification).
//   - Hand-surgery / radiology references reproducing the same radiocarpal-attenuation (I) /
//     midcarpal-incongruency (II) / probe-passes (III) / arthroscope-passes-drive-through (IV) grading.
//
// Grades (radiocarpal appearance / midcarpal congruency / probe or arthroscope passage):
//   I   : attenuation or hemorrhage of the interosseous ligament seen from the radiocarpal joint; carpal
//         alignment is still congruent in the midcarpal space.
//   II  : attenuation or hemorrhage seen from the radiocarpal joint, plus incongruency / step-off of carpal
//         alignment in the midcarpal space; the gap is not yet wide enough to pass a probe.
//   III : incongruency / step-off of carpal alignment seen from both the radiocarpal and midcarpal spaces;
//         a probe can be passed through the gap between the carpal bones.
//   IV  : incongruency / step-off with gross instability; a 2.7 mm arthroscope can be passed through the gap
//         between the carpal bones (the "drive-through" sign).

const GRADES = {
  I: { grade: 'I', text: 'Geissler grade I - attenuation or hemorrhage of the interosseous ligament seen from the radiocarpal joint, with carpal alignment still congruent in the midcarpal space.' },
  II: { grade: 'II', text: 'Geissler grade II - attenuation or hemorrhage seen from the radiocarpal joint, plus incongruency or step-off of carpal alignment in the midcarpal space; the gap is not yet wide enough to pass a probe.' },
  III: { grade: 'III', text: 'Geissler grade III - incongruency or step-off of carpal alignment seen from both the radiocarpal and midcarpal spaces; a probe can be passed through the gap between the carpal bones.' },
  IV: { grade: 'IV', text: 'Geissler grade IV - incongruency or step-off with gross instability; a 2.7 mm arthroscope can be passed through the gap between the carpal bones (the drive-through sign).' },
};

const NOTE = 'The Geissler classification (Geissler 1996) grades an interosseous carpal-ligament injury at arthroscopy by what is seen from the radiocarpal vs midcarpal joint and whether a probe or arthroscope passes the interval. I: radiocarpal attenuation, midcarpal alignment still congruent. II: added midcarpal incongruency, no probe passage. III: incongruency from both joints, a probe passes. IV: gross instability, a 2.7 mm arthroscope passes (the drive-through sign). This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function geisslerCarpal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Geissler grade (I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Geissler grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
