// spec-v710: G8 (Geriatric 8) screening tool.
//
// A short screen that identifies older cancer patients who should have a full comprehensive
// geriatric assessment (CGA). Source:
//   Bellera CA, Rainfray M, Mathoulin-Pelissier S, et al. Screening older cancer patients:
//   first evaluation of the G-8 geriatric screening tool. Ann Oncol. 2012;23(8):2166-2172.
//   (PMID 22250183; ONCODAGE.)
//
// Eight items summed to a total of 0-17 (higher = better; only neutral labels are used, as
// several items are drawn from the copyrighted MNA):
//   Food-intake decline (3 mo):  severe 0 / moderate 1 / none 2
//   Weight loss (3 mo):          > 3 kg 0 / does not know 1 / 1-3 kg 2 / none 3
//   Mobility:                    bed/chair-bound 0 / out of bed but does not go out 1 / goes out 2
//   Neuropsychological problems: severe 0 / mild 1 / none 2
//   Body mass index:             < 19 -> 0 / 19 to < 21 -> 1 / 21 to < 23 -> 2 / >= 23 -> 3
//   Takes more than 3 medications/day:  yes 0 / no 1
//   Self-rated health vs peers:  not as good 0 / does not know 0.5 / as good 1 / better 2
//   Age:                         > 85 -> 0 / 80-85 -> 1 / < 80 -> 2
//
// A total of 14 or LESS is a positive screen and warrants a full comprehensive geriatric
// assessment (~90% sensitivity, ~60% specificity in ONCODAGE).
//
// Pure: no DOM, no clock, no network.

export const G8_NOTE = 'G8 (Geriatric 8) screening tool (Bellera CA, Rainfray M, Mathoulin-Pelissier S, et al, Ann Oncol 2012;23(8):2166-2172), a short screen that identifies older cancer patients who should have a full comprehensive geriatric assessment. Eight items are summed to a total of 0 to 17, where higher is better: a decline in food intake over 3 months (severe 0, moderate 1, none 2), weight loss over 3 months (more than 3 kg 0, unknown 1, 1 to 3 kg 2, none 3), mobility (bed or chair bound 0, out of bed but does not go out 1, goes out 2), neuropsychological problems (severe 0, mild 1, none 2), body mass index (under 19 gives 0, 19 to under 21 gives 1, 21 to under 23 gives 2, 23 or more gives 3), taking more than three medications a day (yes 0, no 1), self-rated health compared with peers (not as good 0, does not know 0.5, as good 1, better 2), and age (over 85 gives 0, 80 to 85 gives 1, under 80 gives 2). A total of 14 or less is a positive screen (about 90 percent sensitive, 60 percent specific) and warrants a full comprehensive geriatric assessment. It is a screening aid to decide who needs deeper assessment, not a diagnosis, and it supports rather than replaces clinical judgment.';

function optIn(v, allowed) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || !allowed.includes(n)) return null;
  return n;
}

const ITEMS = [
  { key: 'foodIntake', allowed: [0, 1, 2] },
  { key: 'weightLoss', allowed: [0, 1, 2, 3] },
  { key: 'mobility', allowed: [0, 1, 2] },
  { key: 'neuropsych', allowed: [0, 1, 2] },
  { key: 'bmi', allowed: [0, 1, 2, 3] },
  { key: 'medications', allowed: [0, 1] },
  { key: 'selfHealth', allowed: [0, 0.5, 1, 2] },
  { key: 'age', allowed: [0, 1, 2] },
];

export function g8Geriatric(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const it of ITEMS) {
    const v = optIn(o[it.key], it.allowed);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: it.key, message: `Select a valid score for ${it.key}.`, note: G8_NOTE };
    }
    total += v;
  }
  const rounded = Math.round(total * 10) / 10;

  const positive = total <= 14;
  return {
    valid: true,
    score: rounded,
    tier: positive ? 'refer' : 'not-refer',
    abnormal: positive,
    bandLabel: `G8 ${rounded} of 17`,
    band: `G8 ${rounded} of 17 — ${positive ? 'positive screen: refer for comprehensive geriatric assessment' : 'negative screen'} (<= 14 positive).`,
    detail: positive
      ? 'Total 14 or less: a positive screen (~90% sensitive) - arrange a full comprehensive geriatric assessment.'
      : 'Total above 14: a negative screen by the G8. Reassess if the clinical picture changes.',
    note: G8_NOTE,
  };
}
