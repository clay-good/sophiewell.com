// spec-v505: the METAVIR necroinflammatory ACTIVITY grade (A0-A3), the second axis of the METAVIR system.
// Companion to the fibrosis stage shipped in spec-v504 (metavir-fibrosis): a METAVIR read is reported as an
// activity grade AND a fibrosis stage together (for example A2F3), so the pair belongs together in the
// catalog. "metavir activity" routed to nothing.
//
// HIGH-STAKES: this reports the activity GRADE the pathologist has assigned, NOT a diagnosis, a non-invasive
// substitute for biopsy, or a treatment decision (spec-v11 section 5.3). Activity and fibrosis are separate
// axes: activity describes ongoing necroinflammation, fibrosis describes accumulated scarring. The management
// decision stays with the hepatology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Bedossa P, Poynard T; The METAVIR Cooperative Study Group. An algorithm for the grading of activity in
//     chronic hepatitis C. Hepatology. 1996;24(2):289-293.
//   - Hepatology references reproducing the same A0 (none) through A3 (severe) activity grading, derived from
//     the combination of piecemeal (interface) necrosis and lobular necrosis.
//
// Activity grades (A0-A3), from the piecemeal-plus-lobular-necrosis algorithm:
//   A0 : no necroinflammatory activity.
//   A1 : mild activity.
//   A2 : moderate activity.
//   A3 : severe activity.

const GRADES = {
  A0: { grade: 'A0', text: 'METAVIR A0 - no necroinflammatory activity.' },
  A1: { grade: 'A1', text: 'METAVIR A1 - mild necroinflammatory activity.' },
  A2: { grade: 'A2', text: 'METAVIR A2 - moderate necroinflammatory activity.' },
  A3: { grade: 'A3', text: 'METAVIR A3 - severe necroinflammatory activity.' },
};

const NOTE = 'The METAVIR activity grade (Bedossa and Poynard, METAVIR Cooperative Study Group 1996) grades necroinflammatory activity on liver biopsy from A0 to A3, derived from the combination of piecemeal (interface) necrosis and lobular necrosis. A0: none. A1: mild. A2: moderate. A3: severe. Activity and fibrosis are separate axes and are reported together (for example A2F3): activity describes ongoing necroinflammation, fibrosis describes accumulated scarring. This reports the grade the pathologist has assigned, not a diagnosis, a non-invasive substitute for biopsy, or a treatment decision.';

const ALIAS = {
  A0: 'A0', A1: 'A1', A2: 'A2', A3: 'A3',
  0: 'A0', 1: 'A1', 2: 'A2', 3: 'A3',
};

// input:
//   grade: 'A0' / 'A1' / 'A2' / 'A3' (case-insensitive; also accepts 0-3).
export function metavirActivity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the METAVIR activity grade (A0, A1, A2, or A3).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `METAVIR ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
