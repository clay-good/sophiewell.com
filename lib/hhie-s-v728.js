// spec-v728: Hearing Handicap Inventory for the Elderly - Screening (HHIE-S).
//
// A 10-item self-report screen for the emotional and social/situational effects of hearing
// loss in older adults. Source:
//   Ventry IM, Weinstein BE. Identification of elderly people with hearing problems. ASHA.
//   1983;25(7):37-42. (The HHIE-S 10-item screening version.)
//
// Each item is answered No (0), Sometimes (2), or Yes (4). Total = sum, range 0-40 (all totals
// are even). Only neutral item-topic labels are used; the item wording is copyrighted.
//
// Bands: 0-8 no self-perceived handicap (~13% probability of impairment); 10-24 mild-to-moderate
// handicap (~50%); 26-40 significant handicap (~84%). A score > 8 is commonly screen-positive
// and prompts audiologic referral.
//
// Pure: no DOM, no clock, no network.

export const HHIE_S_NOTE = 'Hearing Handicap Inventory for the Elderly, Screening version (HHIE-S) (Ventry IM, Weinstein BE, ASHA 1983;25(7):37-42), a 10-item self-report screen for the emotional and social effects of hearing loss in older adults. Each item is answered no, scoring 0, sometimes, scoring 2, or yes, scoring 4, and the total ranges from 0 to 40. A total of 0 to 8 indicates no self-perceived handicap (about a 13 percent probability of hearing impairment), 10 to 24 indicates a mild-to-moderate handicap (about 50 percent), and 26 to 40 indicates a significant handicap (about 84 percent). A score above 8 is commonly treated as a positive screen and prompts referral for a full audiologic evaluation. It screens self-perceived handicap and is not an audiogram or a diagnosis, and it supports rather than replaces formal hearing assessment and clinical judgment.';

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || ![0, 2, 4].includes(n)) return null;
  return n;
}

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];

function band(total) {
  if (total <= 8) return { tier: 'none', label: 'no self-perceived hearing handicap' };
  if (total <= 24) return { tier: 'mild-moderate', label: 'mild-to-moderate hearing handicap' };
  return { tier: 'significant', label: 'significant hearing handicap' };
}

export function hhieS(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const k of ITEMS) {
    const v = optIn(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Answer ${k} No (0), Sometimes (2), or Yes (4).`, note: HHIE_S_NOTE };
    }
    total += v;
  }

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    // A score > 8 is a positive screen.
    abnormal: total > 8,
    bandLabel: `HHIE-S ${total} of 40`,
    band: `HHIE-S ${total} of 40 — ${b.label}.`,
    detail: 'Each item No 0 / Sometimes 2 / Yes 4. Bands: 0-8 no handicap (~13%), 10-24 mild-moderate (~50%), 26-40 significant (~84%). A score > 8 is a positive screen; refer for audiologic evaluation.',
    note: HHIE_S_NOTE,
  };
}
