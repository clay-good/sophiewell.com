// spec-v806: PSS-10 (Perceived Stress Scale, 10-item).
//
// Source:
//   Cohen S, Kamarck T, Mermelstein R. A global measure of perceived stress. J Health Soc
//   Behav. 1983;24(4):385-396. (PMID 6668417.) Ten-item form and scoring rules as published
//   by the distributor and by independent outcome-measure registries.
//
// Ten items answered never / almost never / sometimes / fairly often / very often, scored
// 0 to 4. FOUR ITEMS ARE REVERSE SCORED - items 4, 5, 7 and 8, the positively worded ones -
// and reversing them is the whole difficulty of the instrument. Total 0 to 40, higher is
// more perceived stress.
//
// THERE IS NO PUBLISHED CUTOFF. The scale is not a diagnostic instrument and its developer
// has never published score cut-offs, so this tile reports the total and refuses to invent
// a threshold. Bands circulating online are not the developer's.
//
// The item wording is distributed under licence, so it is not reproduced here; each item is
// identified by its number and its scoring direction, which is the part a scorer needs.
//
// Pure: no DOM, no clock, no network.

export const PSS10_NOTE = 'The Perceived Stress Scale (Cohen S, Kamarck T, Mermelstein R, J Health Soc Behav 1983;24(4):385-396) asks ten questions about how unpredictable, uncontrollable and overloaded the past month has felt. Each is answered never, almost never, sometimes, fairly often or very often and scored 0 to 4, giving a total of 0 to 40 where higher means more perceived stress. Four of the items, numbers 4, 5, 7 and 8, are worded positively and are reverse scored, and getting that reversal right is the whole difficulty of the instrument. There is no published cutoff: the scale is not a diagnostic instrument and its developer has never published score cut-offs, so any band you may have seen is not theirs and none is asserted here. The item wording is distributed under licence and is not reproduced; each item is identified by its number and its scoring direction, which is what a scorer actually needs. It measures a self-reported appraisal over the past month, not a diagnosis, and a high score is not by itself a disorder.';

export const REVERSE_SCORED = [4, 5, 7, 8];
const ALLOWED = new Set([0, 1, 2, 3, 4]);

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!ALLOWED.has(n)) return undefined;
  return n;
}

export function pss10(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (let n = 1; n <= 10; n += 1) {
    const raw = optIn(o[`q${n}`]);
    if (raw === undefined) {
      return { valid: false, code: 'INVALID_INPUT', field: `q${n}`, message: `Item ${n} must be 0, 1, 2, 3 or 4.`, note: PSS10_NOTE };
    }
    if (raw === null) {
      return { valid: false, code: 'MISSING_INPUT', field: `q${n}`, message: `Answer item ${n} from 0 to 4.`, note: PSS10_NOTE };
    }
    // The positively worded items run the other way.
    total += REVERSE_SCORED.includes(n) ? 4 - raw : raw;
  }

  return {
    valid: true,
    score: total,
    // No cutoff exists, so nothing here is flagged as abnormal.
    abnormal: false,
    bandLabel: `PSS-10 ${total} of 40`,
    band: `PSS-10 ${total} of 40 — higher is more perceived stress. No cutoff is published for this scale, so no threshold is applied.`,
    detail: 'Ten items scored 0 to 4, total 0 to 40. Items 4, 5, 7 and 8 are positively worded and are REVERSE scored, so answering every item the same way does not give a uniform total. The developer has never published score cut-offs and the scale is not a diagnostic instrument, so bands circulating online are not theirs and none is applied here.',
    note: PSS10_NOTE,
  };
}
