// spec-v649: Nottingham histologic grade for breast cancer (Elston-Ellis modified
// Scarff-Bloom-Richardson).
//
// The histologic GRADE that feeds the built nottingham-prognostic-index (NPI):
// this tile computes the grade itself, not the NPI (NPI = 0.2 x size + nodal stage +
// grade, and the grade is one input). Source:
//   Elston CW, Ellis IO. Pathological prognostic factors in breast cancer. I. The
//   value of histological grade in breast cancer... Histopathology. 1991;19(5):403-410.
//   PMID 1757079.
//
// Three components, each scored 1-3, summed to 3-9:
//   tubule/gland formation (> 75% = 1, 10-75% = 2, < 10% = 3),
//   nuclear pleomorphism (small/uniform = 1, moderate = 2, marked variation = 3),
//   mitotic count (scored 1-3; the raw-count thresholds are field-diameter-dependent,
//     so the pathologist's 1-3 mitotic SCORE is entered directly).
// Total 3-5 = grade 1 (well differentiated), 6-7 = grade 2 (moderately), 8-9 = grade 3
// (poorly differentiated).
//
// Pure: no DOM, no clock, no network.

const LEVELS = {
  tubules: { 1: '> 75% tubule formation', 2: '10-75% tubule formation', 3: '< 10% tubule formation' },
  pleomorphism: { 1: 'small, regular, uniform nuclei', 2: 'moderate increase in size/variation', 3: 'marked variation in size and shape' },
  mitoses: { 1: 'mitotic score 1 (lowest tier for the field size)', 2: 'mitotic score 2 (intermediate tier)', 3: 'mitotic score 3 (highest tier)' },
};

export const NOTTINGHAM_COMPONENTS = [
  { key: 'tubules', label: 'Tubule / gland formation' },
  { key: 'pleomorphism', label: 'Nuclear pleomorphism' },
  { key: 'mitoses', label: 'Mitotic count score' },
];

export const NOTTINGHAM_MIN = 3;
export const NOTTINGHAM_MAX = 9;

const GRADE = (total) => {
  if (total <= 5) return { grade: 1, label: 'well differentiated' };
  if (total <= 7) return { grade: 2, label: 'moderately differentiated' };
  return { grade: 3, label: 'poorly differentiated' };
};

export const NOTTINGHAM_NOTE = 'Nottingham histologic grade for breast cancer (Elston-Ellis modification of the Scarff-Bloom-Richardson system; Elston CW, Ellis IO, Histopathology 1991;19(5):403-410). Three components are each scored 1 to 3: tubule/gland formation (more than 75% of the tumor forming tubules is 1, 10 to 75% is 2, less than 10% is 3); nuclear pleomorphism (small, regular, uniform nuclei is 1, a moderate increase in size and variation is 2, marked variation is 3); and the mitotic count (scored 1 to 3, where the raw-count thresholds depend on the microscope field diameter, so the pathologist enters the 1-3 mitotic score directly). The sum is 3 to 9: 3 to 5 is grade 1 (well differentiated), 6 to 7 is grade 2 (moderately differentiated), and 8 to 9 is grade 3 (poorly differentiated). This is the histologic grade, not the Nottingham Prognostic Index (the grade is one input to the NPI). It is a pathologist’s grading applied to a specimen, read with the full pathology report.';

export function nottinghamGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const bad = [];
  const parts = [];
  let total = 0;
  for (const c of NOTTINGHAM_COMPONENTS) {
    const raw = o[c.key];
    if (raw === '' || raw === null || raw === undefined) { missing.push(c.key); continue; }
    const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
    if (!Number.isInteger(n) || n < 1 || n > 3) { bad.push(`${c.key} = "${raw}"`); continue; }
    total += n;
    parts.push(`${c.label}: ${LEVELS[c.key][n]} (${n})`);
  }
  if (missing.length) {
    return { valid: false, code: 'MISSING_INPUT', field: missing[0], message: `Score all three components 1 to 3. Still needed: ${missing.join(', ')}.` };
  }
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Each component is 1, 2, or 3. Check: ${bad.join('; ')}.` };
  }
  const g = GRADE(total);
  return {
    valid: true,
    total,
    min: NOTTINGHAM_MIN,
    max: NOTTINGHAM_MAX,
    grade: g.grade,
    differentiation: g.label,
    abnormal: g.grade === 3,
    bandLabel: `Nottingham ${total} of ${NOTTINGHAM_MAX} — grade ${g.grade} (${g.label})`,
    detail: parts.join('; ') + '.',
    note: NOTTINGHAM_NOTE,
  };
}
