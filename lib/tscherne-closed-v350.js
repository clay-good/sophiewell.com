// spec-v350: Oestern-Tscherne classification of the soft-tissue injury of a CLOSED fracture (grades
// 0-III, i.e. C0-C3) — grades the soft-tissue envelope damage of a closed fracture, on the principle
// that the energy imparted to the bone is transferred to the surrounding soft tissues. It is the
// closed-fracture counterpart to the Gustilo-Anderson open-fracture classification already in the
// catalog. "tscherne classification" / "closed fracture soft tissue grade" routed to nothing.
//
// HIGH-STAKES: this reports the Tscherne GRADE the clinician has determined from the examination /
// imaging, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11
// §5.3). The primary-fixation (lower grades) vs staged-treatment (higher grades) association is the
// classically taught pattern, not an order; a compartment syndrome is a clinical emergency assessed
// on its own, and the management decision stays with the orthopedic / trauma surgeon.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Tscherne H, Oestern HJ. Die Klassifizierung des Weichteilschadens bei offenen und geschlossenen
//     Frakturen. Unfallheilkunde. 1982;85(3):111-115 (the closed C0-C3 grades).
//   - Orthopedic-trauma references (AO / Radiopaedia / review articles) reproducing the same closed
//     grade-0-III soft-tissue definitions.
//
// Grades (closed-fracture soft-tissue injury):
//   0 (C0)  : little or no soft-tissue injury; indirect (low-energy) trauma; a simple fracture.
//   I (C1)  : superficial abrasion or skin contusion from fragment pressure; mild to moderate
//             fracture.
//   II (C2) : deep, contaminated abrasion with local skin or muscle contusion from direct trauma;
//             an impending (imminent) compartment syndrome belongs here; moderate to severe
//             (transverse / complex) fracture. Flagged.
//   III (C3): extensive skin contusion or crush, severe muscle damage, subcutaneous degloving, an
//             overt compartment syndrome, or an associated major vascular injury; a severe fracture.
//             Flagged.

const GRADES = {
  0: { grade: '0', label: 'C0', severe: false, text: 'Tscherne grade 0 (C0) - little or no soft-tissue injury; indirect (low-energy) trauma with a simple fracture.' },
  I: { grade: 'I', label: 'C1', severe: false, text: 'Tscherne grade I (C1) - superficial abrasion or skin contusion from fragment pressure; a mild to moderate fracture.' },
  II: { grade: 'II', label: 'C2', severe: true, text: 'Tscherne grade II (C2) - deep, contaminated abrasion with local skin or muscle contusion from direct trauma; an impending compartment syndrome belongs here. A moderate to severe fracture.' },
  III: { grade: 'III', label: 'C3', severe: true, text: 'Tscherne grade III (C3) - extensive skin contusion or crush, severe muscle damage, subcutaneous degloving, an overt compartment syndrome, or an associated major vascular injury. A severe fracture.' },
};

const NOTE = 'The Oestern-Tscherne classification (Tscherne & Oestern 1982) grades the soft-tissue injury of a CLOSED fracture (the energy to the bone is transferred to the soft tissues). 0/C0: little or no injury (low-energy). I/C1: superficial abrasion / contusion. II/C2: deep contaminated abrasion, local contusion, impending compartment syndrome. III/C3: extensive crush, degloving, overt compartment syndrome, or major vascular injury. It is the closed-fracture counterpart to the Gustilo-Anderson open-fracture classification. Primary fixation (lower grades) vs staged treatment (higher grades) is the classically taught pattern, not an order; a compartment syndrome is a clinical emergency assessed on its own. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', I: 'I', II: 'II', III: 'III',
  C0: '0', C1: 'I', C2: 'II', C3: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   grade: '0' / 'I' / 'II' / 'III' (case-insensitive; also accepts C0-C3 and 0-3)
export function tscherneClosed(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = GRADES[key];
  if (!t) {
    return { valid: false, message: 'Select the Tscherne grade (0, I, II, or III; equivalently C0-C3).' };
  }
  return {
    valid: true,
    grade: t.grade,
    closedGrade: t.label,
    severe: t.severe,
    abnormal: t.severe,
    bandLabel: `Tscherne grade ${t.grade} (${t.label})`,
    band: t.text,
    note: NOTE,
  };
}
