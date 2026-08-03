// spec-v643: Oswestry Disability Index (ODI) for low-back-pain disability.
//
// The low-back companion to the built Roland-Morris Disability Questionnaire
// (roland-morris-disability) and Neck Disability Index (neck-disability-index);
// ODI is the most widely used low-back disability instrument and was the gap.
// Source:
//   Fairbank JC, Pynsent PB. The Oswestry Disability Index. Spine. 2000;25(22):2940-2952. PMID 11074683.
//   (Original: Fairbank JC, Couper J, Davies JB, O'Brien JP. Physiotherapy. 1980;66(8):271-273.)
//
// Ten sections, each scored 0-5 (higher = worse). The canonical version's sections
// are Pain intensity, Personal care, Lifting, Walking, Sitting, Standing, Sleeping,
// Sex life, Social life, Travelling. The percentage uses a VARIABLE DENOMINATOR:
//   ODI% = round( sum / (5 x sections answered) x 100 )
// so an omitted section (e.g. "sex life", legitimately skipped) drops the divisor
// by 5 rather than counting as zero. Rounding to a whole percent (a convention;
// Fairbank prints no rounding rule) makes the integer bands below exact. Bands are
// Fairbank's original percentage grades. This tile implements the SCORING only; the
// copyright-bearing 6-statement response wording per section is NOT reproduced -
// each section is a generic 0-5 severity rating.
//
// Pure: no DOM, no clock, no network.

export const ODI_SECTIONS = [
  { key: 'pain', label: 'Pain intensity' },
  { key: 'personalCare', label: 'Personal care (washing, dressing)' },
  { key: 'lifting', label: 'Lifting' },
  { key: 'walking', label: 'Walking' },
  { key: 'sitting', label: 'Sitting' },
  { key: 'standing', label: 'Standing' },
  { key: 'sleeping', label: 'Sleeping' },
  { key: 'sexLife', label: 'Sex life (if applicable)' },
  { key: 'socialLife', label: 'Social life' },
  { key: 'travelling', label: 'Travelling' },
];

export const ODI_MAX_PER_SECTION = 5;

// Fairbank's original percentage grades. Boundaries are consistent across every
// source; the top two labels are Fairbank's originals (some references soften them).
const BANDS = [
  { max: 20, label: 'minimal disability' },
  { max: 40, label: 'moderate disability' },
  { max: 60, label: 'severe disability' },
  { max: 80, label: 'crippled' },
  { max: 100, label: 'bed-bound (or symptoms exaggerated)' },
];

export const ODI_NOTE = 'Oswestry Disability Index (Fairbank JC, Pynsent PB, Spine 2000;25(22):2940-2952) — a low-back-pain disability questionnaire. Ten sections (pain intensity, personal care, lifting, walking, sitting, standing, sleeping, sex life, social life, travelling), each rated 0-5 with higher meaning greater disability. The score is a percentage with a variable denominator: the sum of the answered sections divided by five times the number of sections answered, times 100, so an omitted section drops the divisor by 5 rather than scoring zero. Fairbank’s grades: 0-20% minimal disability, 21-40% moderate, 41-60% severe, 61-80% crippled, 81-100% bed-bound (or symptoms exaggerated). A patient-reported disability measure, not a diagnosis; the exact 6-statement response wording is the copyright-bearing instrument’s and is not reproduced here.';

function readSection(raw) {
  if (raw === '' || raw === null || raw === undefined) return { answered: false };
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0 || n > ODI_MAX_PER_SECTION) return { answered: false, bad: true };
  return { answered: true, points: n };
}

// input: one key per section (see ODI_SECTIONS), each 0-5, or absent/'' to omit.
export function oswestryDisabilityIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const reads = ODI_SECTIONS.map((s) => ({ s, r: readSection(o[s.key]) }));
  const bad = reads.filter((x) => x.r.bad);
  if (bad.length) {
    return { valid: false, message: `Each section must be a whole number 0 to 5 (or omitted). Unrecognized: ${bad.map((x) => x.s.key).join(', ')}.` };
  }
  const answered = reads.filter((x) => x.r.answered);
  if (!answered.length) {
    return { valid: false, message: 'Answer at least one of the ten sections (0 to 5 each).' };
  }
  const sum = answered.reduce((a, x) => a + x.r.points, 0);
  const count = answered.length;
  const pct = Math.round((sum / (ODI_MAX_PER_SECTION * count)) * 100);
  const band = BANDS.find((b) => pct <= b.max) || BANDS[BANDS.length - 1];
  return {
    valid: true,
    total: pct,
    max: 100,
    sum,
    sectionsAnswered: count,
    band: band.label,
    bandLabel: `ODI ${pct}% — ${band.label}`,
    detail: `Raw ${sum} of ${ODI_MAX_PER_SECTION * count} across ${count} answered section${count === 1 ? '' : 's'}.`,
    note: ODI_NOTE,
  };
}
