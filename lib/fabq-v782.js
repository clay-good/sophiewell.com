// spec-v782: FABQ (Fear-Avoidance Beliefs Questionnaire).
//
// Source:
//   Waddell G, Newton M, Henderson I, Somerville D, Main CJ. A Fear-Avoidance
//   Beliefs Questionnaire (FABQ) and the role of fear-avoidance beliefs in chronic
//   low back pain and disability. Pain. 1993;52(2):157-168. (PMID 8455963.)
//
// Sixteen statements, each rated 0 (completely disagree) to 6 (completely agree).
// Only ELEVEN of them are scored - the other five are administered but deliberately
// left out of both subscales:
//
//   Physical activity (FABQ-PA)  items 2, 3, 4, 5                    0 to 24
//   Work (FABQ-W)                items 6, 7, 9, 10, 11, 12, 15       0 to 42
//   Not scored                   items 1, 8, 13, 14, 16
//
// The two subscales are reported separately and are NOT added together. Doing so is
// a common error: several published calculators state a combined range of 0 to 96,
// which is arithmetically impossible when the parts are 24 and 42.
//
// Higher is more fear-avoidance. Only neutral item-topic labels are used.
//
// Pure: no DOM, no clock, no network.

export const FABQ_NOTE = 'The Fear-Avoidance Beliefs Questionnaire (Waddell G, Newton M, Henderson I, Somerville D, Main CJ, Pain 1993;52(2):157-168) measures how far someone believes that activity or work will harm their back. Sixteen statements are each rated from 0, completely disagree, to 6, completely agree, but only eleven of them are scored: four make up the physical activity subscale, which runs 0 to 24, and seven make up the work subscale, which runs 0 to 42. The remaining five items are asked but deliberately count toward neither subscale. The two subscales are reported separately and are never added together, and higher means stronger fear-avoidance beliefs. It measures beliefs, not physical capacity or damage, and the 1993 source publishes no cutoff, so no threshold is asserted here.';

const PA_ITEMS = [2, 3, 4, 5];
const WORK_ITEMS = [6, 7, 9, 10, 11, 12, 15];
export const UNSCORED_ITEMS = [1, 8, 13, 14, 16];

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 6) return undefined;
  return n;
}

function scaleScore(o, items, label) {
  let sum = 0;
  let count = 0;
  for (const i of items) {
    const v = optIn(o[`q${i}`]);
    if (v === undefined) return { error: { field: `q${i}`, message: `Item ${i} must be 0 to 6.` } };
    if (v === null) continue;
    sum += v;
    count += 1;
  }
  return { sum, count, label, complete: count === items.length };
}

export function fabq(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  // Validate the unscored items too, so a typo there is caught rather than ignored.
  for (const i of UNSCORED_ITEMS) {
    if (optIn(o[`q${i}`]) === undefined) {
      return { valid: false, code: 'INVALID_INPUT', field: `q${i}`, message: `Item ${i} must be 0 to 6.`, note: FABQ_NOTE };
    }
  }

  const pa = scaleScore(o, PA_ITEMS, 'FABQ-PA');
  if (pa.error) return { valid: false, code: 'INVALID_INPUT', field: pa.error.field, message: pa.error.message, note: FABQ_NOTE };
  const work = scaleScore(o, WORK_ITEMS, 'FABQ-W');
  if (work.error) return { valid: false, code: 'INVALID_INPUT', field: work.error.field, message: work.error.message, note: FABQ_NOTE };

  if (pa.count === 0 && work.count === 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'q2', message: 'Answer at least one scored item.', note: FABQ_NOTE };
  }

  const paText = pa.count === 0 ? 'not answered' : `${pa.sum} of 24`;
  const workText = work.count === 0 ? 'not answered' : `${work.sum} of 42`;

  return {
    valid: true,
    physicalActivity: pa.count === 0 ? null : pa.sum,
    work: work.count === 0 ? null : work.sum,
    answered: { physicalActivity: pa.count, work: work.count },
    complete: { physicalActivity: pa.complete, work: work.complete },
    // Any endorsed fear-avoidance belief is the state worth noticing; the 1993 source
    // publishes no cutoff, so no threshold is claimed.
    abnormal: (pa.sum + work.sum) > 0,
    bandLabel: `FABQ physical activity ${paText}, work ${workText}`,
    band: `FABQ — physical activity ${paText}, work ${workText}.`,
    detail: `Physical activity sums items ${PA_ITEMS.join(', ')} for 0 to 24. Work sums items ${WORK_ITEMS.join(', ')} for 0 to 42. Items ${UNSCORED_ITEMS.join(', ')} are asked but count toward neither. The two subscales are reported separately and are never added together; a combined 0 to 96 range, which several calculators quote, is arithmetically impossible when the parts are 24 and 42. Higher is stronger fear-avoidance belief, and no cutoff is asserted because the 1993 source publishes none.`,
    note: FABQ_NOTE,
  };
}
