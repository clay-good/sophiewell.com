// spec-v444: the McCormick neurological grading scale for spinal-cord (intramedullary) lesion function, by
// the motor / sensory deficit and ambulation — grades I / II / III / IV. It is the standard functional grade
// in spinal-cord tumor / lesion reporting. "mccormick" / "spinal cord function grade" routed to nothing.
//
// HIGH-STAKES: this reports the functional GRADE the clinician has determined on examination, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management
// decision stays with the neurosurgery / neurology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - McCormick PC, Torres R, Post KD, Stein BM. Intramedullary ependymoma of the spinal cord. J Neurosurg.
//     1990;72(4):523-532 (the McCormick functional grading scale).
//   - Neurosurgery references reproducing the same intact/mild (I) / deficit-but-independent (II) /
//     needs-aid (III) / severe-dependent (IV) grading.
//
// Grades (function and ambulation):
//   I   : neurologically intact or mild focal deficit not significantly affecting function; normal gait.
//   II  : sensorimotor deficit affecting function of the involved limb; mild to moderate gait difficulty;
//         still functions and ambulates independently.
//   III : more severe neurological deficit; requires a cane or brace to ambulate, or has significant
//         bilateral upper-limb impairment.
//   IV  : severe deficit; requires a wheelchair (or a cane/brace with bilateral upper-limb impairment);
//         usually not independent.

const GRADES = {
  I: { grade: 'I', text: 'McCormick grade I - neurologically intact or mild focal deficit not significantly affecting function; normal gait.' },
  II: { grade: 'II', text: 'McCormick grade II - sensorimotor deficit affecting function of the involved limb; mild to moderate gait difficulty; still functions and ambulates independently.' },
  III: { grade: 'III', text: 'McCormick grade III - more severe neurological deficit; requires a cane or brace to ambulate, or has significant bilateral upper-limb impairment.' },
  IV: { grade: 'IV', text: 'McCormick grade IV - severe deficit; requires a wheelchair (or a cane/brace with bilateral upper-limb impairment); usually not independent.' },
};

const NOTE = 'The McCormick grading scale (McCormick 1990) grades spinal-cord lesion function by the motor/sensory deficit and ambulation. I: intact or mild deficit, normal gait. II: deficit affecting the involved limb but functions and ambulates independently. III: needs a cane or brace, or significant bilateral upper-limb impairment. IV: severe, needs a wheelchair, usually not independent. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function mccormick(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the McCormick grade (I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `McCormick grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
