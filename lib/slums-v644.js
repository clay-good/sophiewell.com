// spec-v644: SLUMS (St. Louis University Mental Status) examination.
//
// A public-domain cognitive screen filling a real gap: the catalog had short
// screens (mini-cog) and dementia-staging tools (CDR-SOB, FAST, GDS) but no
// scored MMSE-alternative. SLUMS was developed by Saint Louis University with the
// VA as a free MMSE alternative and may be reproduced without a license.
// Source (per-item points read off the official SLU/VAMC form):
//   Tariq SH, Tumosa N, Chibnall JT, Perry MH 3rd, Morley JE. The Saint Louis
//   University Mental Status (SLUMS) Examination ... Am J Geriatr Psychiatry.
//   2006;14(11):900-910. PMID 17068312.
//
// Ten scored items sum to 0-30 (the five-object registration is setup, not
// scored). The interpretation bands are EDUCATION-ADJUSTED (two sets): the cut
// points are one band higher for patients with less than a high-school education.
// This tile takes the EARNED points per item (the clinician administers and scores
// the actual test); it does not reproduce the test items themselves.
//
// Pure: no DOM, no clock, no network.

const onInt = (raw, max) => {
  if (raw === '' || raw === null || raw === undefined) return 0;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0 || n > max) return NaN;
  return n;
};

export const SLUMS_ITEMS = [
  { key: 'day', max: 1, label: 'day of the week' },
  { key: 'year', max: 1, label: 'year' },
  { key: 'state', max: 1, label: 'state' },
  { key: 'money', max: 3, label: 'money problem (spent / remaining)' },
  { key: 'animals', max: 3, label: 'animal naming in 1 minute (0-4 animals = 0, 5-9 = 1, 10-14 = 2, 15+ = 3)' },
  { key: 'recall', max: 5, label: 'delayed recall of 5 objects' },
  { key: 'digits', max: 2, label: 'backward digit span' },
  { key: 'clock', max: 4, label: 'clock drawing (hour markers 2 + time 2)' },
  { key: 'figures', max: 2, label: 'figure task (X in triangle 1 + largest figure 1)' },
  { key: 'story', max: 8, label: 'story recall (4 questions x 2)' },
];

export const SLUMS_MAX = 30;

// [minScore, label] per education stratum; first match from the top wins.
const BANDS = {
  hs: [
    { min: 27, label: 'normal' },
    { min: 21, label: 'mild neurocognitive disorder' },
    { min: 0, label: 'dementia' },
  ],
  'less-hs': [
    { min: 25, label: 'normal' },
    { min: 20, label: 'mild neurocognitive disorder' },
    { min: 0, label: 'dementia' },
  ],
};

const EDU_LABEL = { hs: 'high-school education or above', 'less-hs': 'less than high-school education' };

export const SLUMS_NOTE = 'SLUMS (St. Louis University Mental Status) examination (Tariq SH, Tumosa N, Chibnall JT, Perry MH, Morley JE, Am J Geriatr Psychiatry 2006;14(11):900-910) — a cognitive screen developed by Saint Louis University with the VA as a free MMSE alternative. Ten scored items (orientation to day, year and state; a money problem; animal naming in one minute; delayed recall of five objects; backward digit span; clock drawing; a figure task; and a five-part story recall) sum to 0-30. The bands are EDUCATION-ADJUSTED: with a high-school education or above, 27-30 is normal, 21-26 mild neurocognitive disorder, and 20 or below dementia; with less than a high-school education, 25-30 is normal, 20-24 mild neurocognitive disorder, and 19 or below dementia. It is a screen, not a diagnosis; a positive screen calls for fuller assessment and the result is read alongside the history, function, and reversible contributors. It may be reproduced without a license.';

// input: earned points per item (see SLUMS_ITEMS), each 0..max (absent = 0),
// plus education 'hs' or 'less-hs' (required).
export function slums(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const edu = o.education === 'hs' || o.education === 'less-hs' ? o.education : null;
  if (!edu) {
    return { valid: false, code: 'MISSING_INPUT', field: 'education', message: 'Select education level: "hs" (high-school or above) or "less-hs" (less than high-school). It sets the interpretation cut points.' };
  }
  const bad = [];
  const unscored = [];
  let total = 0;
  for (const it of SLUMS_ITEMS) {
    const raw = o[it.key];
    if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
      unscored.push(it.label || it.key);
      continue;
    }
    const v = onInt(raw, it.max);
    if (Number.isNaN(v)) { bad.push(`${it.key} (0-${it.max})`); continue; }
    total += v;
  }
  if (bad.length) {
    return { valid: false, code: 'OUT_OF_RANGE', message: `Each item must be a whole number within its range. Check: ${bad.join(', ')}.` };
  }
  // spec-v1016: the lower-bound rule of spec-v1006/v1007, INVERTED, because on
  // SLUMS a higher score is a better one. An unscored item can only ADD points,
  // so a partial total is a floor on the score and therefore a CEILING on the
  // severity: an incomplete exam can be read as normal if it has already earned
  // enough points, and can never be read as dementia. It used to read exactly
  // the wrong way -- an untouched form answered "SLUMS 0 of 30 — dementia",
  // labelling an exam nobody had performed.
  const band = BANDS[edu].find((b) => total >= b.min);
  if (unscored.length && band.label !== 'normal') {
    return {
      valid: false,
      code: 'MISSING_INPUT',
      total,
      unscored: unscored.length,
      message: `Score the remaining ${unscored.length} of ${SLUMS_ITEMS.length} items: ${unscored.join(', ')}. `
        + `The exam has earned ${total} of ${SLUMS_MAX} so far and the unscored items can only add to it, `
        + 'so an incomplete SLUMS cannot be read as impaired.',
      note: SLUMS_NOTE,
    };
  }
  const partial = unscored.length
    ? ` Scored from ${SLUMS_ITEMS.length - unscored.length} of ${SLUMS_ITEMS.length} items; the rest can only raise it.`
    : '';
  return {
    valid: true,
    total,
    max: SLUMS_MAX,
    education: edu,
    band: band.label,
    bandLabel: `SLUMS ${total} of ${SLUMS_MAX} — ${band.label} (${EDU_LABEL[edu]})`,
    abnormal: band.label !== 'normal',
    detail: `Scored ${total} of ${SLUMS_MAX} using the ${EDU_LABEL[edu]} cut points.${partial}`,
    note: SLUMS_NOTE,
  };
}
