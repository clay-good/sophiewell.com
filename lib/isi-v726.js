// spec-v726: Insomnia Severity Index (ISI).
//
// A brief self-report of insomnia severity. Source:
//   Bastien CH, Vallieres A, Morin CM. Validation of the Insomnia Severity Index as an outcome
//   measure for insomnia research. Sleep Med. 2001;2(4):297-307. (PMID 11438246.)
//
// Seven items, each rated 0-4, summed to a total of 0-28 (only neutral item labels are used;
// the item and response wording is copyrighted):
//   1. Difficulty falling asleep
//   2. Difficulty staying asleep
//   3. Problem waking up too early
//   4. Dissatisfaction with the current sleep pattern
//   5. How noticeable to others the sleep problem is (in terms of impairing quality of life)
//   6. How worried/distressed about the current sleep problem
//   7. Interference with daily functioning
//
// Bands: 0-7 no clinically significant insomnia; 8-14 subthreshold insomnia; 15-21 moderate;
// 22-28 severe. A score >= 15 correlates with a clinical insomnia diagnosis.
//
// Pure: no DOM, no clock, no network.

export const ISI_NOTE = 'Insomnia Severity Index (ISI) (Bastien CH, Vallieres A, Morin CM, Sleep Med 2001;2(4):297-307), a brief self-report of insomnia severity. Seven items are each rated from 0 to 4 and summed to a total of 0 to 28: the severity of difficulty falling asleep, difficulty staying asleep, and waking too early; dissatisfaction with the current sleep pattern; how noticeable the sleep problem is to others; how worried or distressed the person is about it; and how much it interferes with daily functioning. A total of 0 to 7 indicates no clinically significant insomnia, 8 to 14 is subthreshold insomnia, 15 to 21 is moderate insomnia, and 22 to 28 is severe insomnia; a score of 15 or more correlates with a clinical insomnia diagnosis. It grades severity and tracks response to treatment, it is not a stand-alone diagnosis, and it supports rather than replaces clinical assessment.';

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 4) return null;
  return n;
}

const ITEMS = ['fallingAsleep', 'stayingAsleep', 'wakingEarly', 'dissatisfaction', 'noticeable', 'worried', 'interference'];

function band(total) {
  if (total <= 7) return { tier: 'none', label: 'no clinically significant insomnia' };
  if (total <= 14) return { tier: 'subthreshold', label: 'subthreshold insomnia' };
  if (total <= 21) return { tier: 'moderate', label: 'moderate insomnia' };
  return { tier: 'severe', label: 'severe insomnia' };
}

export function isi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const k of ITEMS) {
    const v = optIn(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate ${k} from 0 to 4.`, note: ISI_NOTE };
    }
    total += v;
  }

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    // A score >= 15 (moderate or severe) correlates with a clinical insomnia diagnosis.
    abnormal: total >= 15,
    bandLabel: `ISI ${total} of 28`,
    band: `ISI ${total} of 28 — ${b.label}.`,
    detail: 'Bands: 0-7 none, 8-14 subthreshold, 15-21 moderate, 22-28 severe. A score >= 15 correlates with a clinical insomnia diagnosis.',
    note: ISI_NOTE,
  };
}
