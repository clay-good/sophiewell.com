// spec-v727: Functional Oral Intake Scale (FOIS).
//
// A 7-level ordinal scale of the functional level of oral intake in patients with dysphagia.
// Source:
//   Crary MA, Mann GD, Groher ME. Initial psychometric assessment of a functional oral intake
//   scale for dysphagia in stroke patients. Arch Phys Med Rehabil. 2005;86(8):1516-1520.
//   (PMID 16084801.)
//
// Levels (select one):
//   1 = No oral intake
//   2 = Tube-dependent with minimal/inconsistent oral intake
//   3 = Tube supplements with consistent oral intake
//   4 = Total oral intake of a single consistency
//   5 = Total oral intake of multiple consistencies requiring special preparation
//   6 = Total oral intake with no special preparation, but must avoid specific foods/liquids
//   7 = Total oral intake with no restrictions
//
// Levels 1-3 involve tube feeding; 4-7 are total oral intake. Higher = less restricted.
//
// Pure: no DOM, no clock, no network.

export const FOIS_NOTE = 'Functional Oral Intake Scale (FOIS) (Crary MA, Mann GD, Groher ME, Arch Phys Med Rehabil 2005;86(8):1516-1520), a seven-level ordinal scale of the functional level of oral intake in dysphagia. Level 1 is no oral intake; level 2 is tube dependence with minimal or inconsistent oral intake; level 3 is tube supplements with consistent oral intake; level 4 is total oral intake of a single consistency; level 5 is total oral intake of multiple consistencies requiring special preparation; level 6 is total oral intake with no special preparation but avoiding specific foods or liquids; and level 7 is total oral intake with no restrictions. Levels 1 to 3 involve tube feeding while levels 4 to 7 are total oral intake, and a higher level is a less restricted diet. It describes the current functional intake to document status and track change, not to prescribe a diet, and it supports rather than replaces the swallowing evaluation and clinical judgment.';

const LEVEL = {
  1: 'no oral intake',
  2: 'tube-dependent with minimal/inconsistent oral intake',
  3: 'tube supplements with consistent oral intake',
  4: 'total oral intake of a single consistency',
  5: 'total oral intake of multiple consistencies, special preparation',
  6: 'total oral intake, no special preparation, avoid specific foods/liquids',
  7: 'total oral intake with no restrictions',
};

export function fois(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const raw = o.level;
  const n = raw === '' || raw === null || raw === undefined ? NaN : (typeof raw === 'number' ? raw : Number(String(raw).trim()));
  if (!Number.isInteger(n) || n < 1 || n > 7) {
    return { valid: false, code: 'MISSING_INPUT', field: 'level', message: 'Select the FOIS level (1-7).', note: FOIS_NOTE };
  }

  const tubeDependent = n <= 3;
  return {
    valid: true,
    level: n,
    tier: `level-${n}`,
    // Levels 1-3 (tube feeding) are the actionable/restricted state.
    abnormal: tubeDependent,
    tubeDependent,
    bandLabel: `FOIS Level ${n}`,
    band: `FOIS Level ${n} — ${LEVEL[n]}.`,
    detail: tubeDependent
      ? 'Levels 1-3 involve tube feeding. Higher levels are less restricted; the goal is safe progression as swallowing allows.'
      : 'Levels 4-7 are total oral intake. Higher levels are less restricted.',
    note: FOIS_NOTE,
  };
}
