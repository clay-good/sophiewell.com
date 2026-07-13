// spec-v297: Seddon-Sunderland peripheral nerve-injury classification (a noted
// catalog gap from the spec-v293 search sweep). Given the Sunderland grade (I-V)
// the tile reports which structures are disrupted, the Seddon equivalent, the
// expected recovery, and whether surgical repair is typically required.
//
// This reports the classification's own descriptors, NOT a diagnosis and NOT a
// surgical decision (spec-v11 §5.3) — grading and the operate/observe decision
// stay with the clinician.
//
// TABLE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against two
// independent sources that agree on every grade's disrupted structures, Seddon
// equivalent, and surgical need:
//   - Sunderland S. A classification of peripheral nerve injuries producing loss
//     of function. Brain. 1951;74(4):491-516. (five degrees)
//   - Seddon HJ. Three types of nerve injury. Brain. 1943;66(4):237-288.
//   Cross-checked against StatPearls (Nerve Injury) and the standard
//   nerve-injury-classification reference table.

// Grades ordered I..V. `seddon` is the Seddon equivalent; `surgery` marks grades
// at/above which surgical repair is typically required.
const GRADES = [
  { grade: 'I', seddon: 'neurapraxia', structures: 'Myelin only (focal demyelination / conduction block); axon and all connective-tissue layers intact.', recovery: 'Complete recovery in days to weeks via remyelination; no Wallerian degeneration.', surgery: false },
  { grade: 'II', seddon: 'axonotmesis', structures: 'Axon and myelin disrupted; endoneurium, perineurium, and epineurium intact.', recovery: 'Wallerian degeneration then axonal regrowth (~1 mm/day) along intact endoneurial tubes; generally good spontaneous recovery.', surgery: false },
  { grade: 'III', seddon: 'axonotmesis', structures: 'Axon, myelin, and endoneurium disrupted; perineurium and epineurium intact.', recovery: 'Slower and often incomplete — regenerating axons may be misdirected across disrupted endoneurial tubes; recovery is variable.', surgery: false },
  { grade: 'IV', seddon: 'axonotmesis (severe) / neurotmesis boundary', structures: 'Axon, myelin, endoneurium, and perineurium disrupted; only the epineurium remains intact (neuroma-in-continuity).', recovery: 'Little useful spontaneous recovery; a scar/neuroma blocks regeneration — surgical repair is usually required.', surgery: true },
  { grade: 'V', seddon: 'neurotmesis', structures: 'Complete transection of the entire nerve, including the epineurium.', recovery: 'No spontaneous recovery; surgical repair (coaptation or grafting) is required for any functional restoration.', surgery: true },
];

const GRADE_INDEX = new Map(GRADES.map((g, i) => [g.grade, i]));

const NOTE = 'Seddon-Sunderland peripheral nerve-injury classification (Seddon 1943; Sunderland 1951). Sunderland grade I = neurapraxia (myelin/conduction block, structures intact); grades II-IV = axonotmesis (progressive disruption of axon, then endoneurium at III, then perineurium at IV); grade V = neurotmesis (complete transection). Grades I-II usually recover spontaneously; grade III is variable; grades IV-V (perineurium/epineurium disrupted) typically require surgical repair. This reports the classification descriptor, not a diagnosis or a surgical decision; grading and management stay with the clinician.';

// Grade IV is the source-stated threshold at/above which surgical repair is
// typically required (perineurium disrupted; neuroma-in-continuity or transection).
const SURGERY_THRESHOLD_INDEX = GRADE_INDEX.get('IV');

// input.grade: one of 'I'..'V' (case-insensitive). Returns the disrupted
// structures, Seddon equivalent, recovery, and surgical-repair flag.
export function nerveInjuryGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const code = typeof o.grade === 'string' ? o.grade.trim().toUpperCase() : String(o.grade || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, message: 'Select the Sunderland grade (I-V).' };
  }
  if (!GRADE_INDEX.has(code)) {
    throw new RangeError('Sunderland grade must be one of I, II, III, IV, or V.');
  }
  const idx = GRADE_INDEX.get(code);
  const entry = GRADES[idx];
  const surgeryLikely = idx >= SURGERY_THRESHOLD_INDEX;

  let band = `Sunderland grade ${entry.grade} (${entry.seddon}): ${entry.structures} ${entry.recovery}`;
  if (surgeryLikely) {
    band += ' Surgical repair is typically required at this grade.';
  }

  return {
    valid: true,
    grade: entry.grade,
    seddon: entry.seddon,
    structures: entry.structures,
    recovery: entry.recovery,
    surgeryLikely,
    abnormal: surgeryLikely,
    bandLabel: `Sunderland grade ${entry.grade}`,
    band,
    note: NOTE,
  };
}
