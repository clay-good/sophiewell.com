// spec-v882: the US Multi-Society Task Force post-polypectomy surveillance intervals.
//
// Source:
//   Gupta S, Lieberman D, Anderson JC, et al. Recommendations for Follow-Up After Colonoscopy and
//   Polypectomy: A Consensus Update by the US Multi-Society Task Force on Colorectal Cancer.
//   Gastroenterology. 2020;158(4):1131-1153.
//
//   Normal colonoscopy, or hyperplastic polyps under 10 mm in the rectum or sigmoid:  10 years
//   1 to 2 tubular adenomas under 10 mm:                                              7 to 10 years
//   3 to 4 tubular adenomas under 10 mm:                                              3 to 5 years
//   5 to 10 adenomas under 10 mm:                                                     3 years
//   Any adenoma 10 mm or larger, with villous or tubulovillous histology, or with
//     high-grade dysplasia:                                                           3 years
//   More than 10 adenomas:                                                            1 year
//   Piecemeal resection of an adenoma 20 mm or larger:                                6 months
//
// THE INTERVAL DEPENDS ON A COMPLETE AND ADEQUATE EXAMINATION, AND THAT IS WHY THIS TILE EXISTS.
// Every interval in the table presumes the colonoscopy reached the cecum and the preparation was
// adequate. If either failed, the recommendation is an early repeat, and no number from the
// table applies.
//
// PIECEMEAL RESECTION OF A LARGE LESION IS A SEPARATE TRACK. Its 6-month interval is a check that
// the resection was complete, not a surveillance interval, and it outranks everything else.
//
// SIZE, HISTOLOGY AND DYSPLASIA EACH SHORTEN THE INTERVAL ON THEIR OWN. One 12 mm adenoma is a
// 3-year interval even though the count is 1.
//
// THIS IS AVERAGE-RISK SURVEILLANCE AFTER POLYPECTOMY. It does not cover a personal or family
// history that puts a patient on a different schedule, or inflammatory bowel disease.
//
// Pure: no DOM, no clock, no network.

export const POLYP_NOTE = 'The US Multi-Society Task Force 2020 recommendations set the interval to the next colonoscopy after polypectomy. A normal examination, or hyperplastic polyps under 10 mm in the rectum or sigmoid, is ten years. One or two tubular adenomas under 10 mm is seven to ten years; three or four is three to five years; five to ten is three years; more than ten is one year. Any adenoma 10 mm or larger, or with villous or tubulovillous histology, or with high-grade dysplasia, is three years whatever the count. Piecemeal resection of an adenoma 20 mm or larger is six months. Four things about the table are worth stating plainly. Every interval presumes a complete examination to the cecum with an adequate preparation, so if either failed the recommendation is an early repeat and no number from the table applies. Piecemeal resection of a large lesion is a separate track whose six-month interval is a check that the resection was complete rather than a surveillance interval, and it outranks everything else. Size, histology and dysplasia each shorten the interval on their own, so a single 12 mm adenoma is a three-year interval even though the count is one. And this is average-risk surveillance after polypectomy: it does not cover a personal or family history that puts a patient on a different schedule, or inflammatory bowel disease. It applies a published interval table to findings already recorded. It does not decide when a patient is scheduled.';

export const HISTOLOGY = [
  { value: 'none', text: 'No polyps found' },
  { value: 'hyperplastic-small', text: 'Hyperplastic polyps under 10 mm, rectum or sigmoid only' },
  { value: 'tubular-adenoma', text: 'Tubular adenoma' },
  { value: 'villous', text: 'Villous or tubulovillous adenoma' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function polypSurveillance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const histology = oneOf(HISTOLOGY, o.histology, 'none');
  const count = num(o.adenomaCount);
  const largest = num(o.largestSizeMm);

  for (const [label, v, lo, hi] of [
    ['number of adenomas', count, 0, 200],
    ['largest polyp size in mm', largest, 0, 200],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }

  const completeExam = on(o.completeToCecum);
  const adequatePrep = on(o.adequatePreparation);
  const piecemealLarge = on(o.piecemealTwentyMm);
  const highGrade = on(o.highGradeDysplasia);

  const examOk = completeExam && adequatePrep;

  const adenomatous = histology === 'tubular-adenoma' || histology === 'villous';
  const bigOrBad = adenomatous && ((largest !== null && largest >= 10) || histology === 'villous' || highGrade);

  let interval = null;
  let basis = null;

  if (piecemealLarge) {
    interval = '6 months';
    basis = 'piecemeal resection of an adenoma 20 mm or larger, which is a check that the resection was complete rather than a surveillance interval';
  } else if (!examOk) {
    interval = null;
    basis = null;
  } else if (!adenomatous) {
    interval = '10 years';
    basis = histology === 'none' ? 'a normal examination' : 'hyperplastic polyps under 10 mm confined to the rectum or sigmoid';
  } else if (count !== null && count > 10) {
    interval = '1 year';
    basis = `${count} adenomas, more than ten`;
  } else if (bigOrBad) {
    interval = '3 years';
    const why = [];
    if (largest !== null && largest >= 10) why.push(`an adenoma of ${largest} mm, 10 mm or larger`);
    if (histology === 'villous') why.push('villous or tubulovillous histology');
    if (highGrade) why.push('high-grade dysplasia');
    basis = why.join(', and ');
  } else if (count !== null && count >= 5) {
    interval = '3 years';
    basis = `${count} adenomas under 10 mm, in the five to ten band`;
  } else if (count !== null && count >= 3) {
    interval = '3 to 5 years';
    basis = `${count} tubular adenomas under 10 mm`;
  } else if (count !== null && count >= 1) {
    interval = '7 to 10 years';
    basis = `${count} tubular adenoma${count === 1 ? '' : 's'} under 10 mm`;
  }

  const action = piecemealLarge
    ? `Repeat at 6 months, on ${basis}.`
    : !examOk
      ? `No interval from the table applies: ${!completeExam ? 'the examination did not reach the cecum' : 'the preparation was not adequate'}. The recommendation is an early repeat colonoscopy.`
      : interval
        ? `Next colonoscopy in ${interval}, on ${basis}.`
        : 'The entered findings do not select an interval. Enter the histology, and the number and size of any adenomas.';

  // The reason the tile exists, on every result.
  const examNote = examOk || piecemealLarge
    ? 'Every interval in this table presumes a complete examination to the cecum with an adequate preparation. Both are recorded here.'
    : 'Every interval in this table presumes a complete examination to the cecum with an adequate preparation. Without both, no number from the table applies and the recommendation is an early repeat.';

  const piecemealNote = piecemealLarge
    ? 'Piecemeal resection of an adenoma 20 mm or larger is a separate track. The six months is a check that the resection was complete, and it outranks every other row in the table.'
    : null;

  const sizeNote = adenomatous && !bigOrBad && largest !== null && largest < 10 && largest >= 7
    ? `At ${largest} mm this is under the 10 mm line. Size, villous histology and high-grade dysplasia each shorten the interval to three years on their own, whatever the count.`
    : bigOrBad && count !== null && count <= 2
      ? `The count is ${count}, and the interval is still three years. Size, histology and dysplasia each shorten it on their own.`
      : null;

  const scopeOfTableNote = 'This is average-risk surveillance after polypectomy. It does not cover a personal or family history that puts a patient on a different schedule, or inflammatory bowel disease.';

  const recordedNote = `Recorded: ${histology === 'none' ? 'no polyps' : HISTOLOGY.find((h) => h.value === histology).text.toLowerCase()}, ${count === null ? 'no adenoma count entered' : `${count} adenoma${count === 1 ? '' : 's'}`}, largest ${largest === null ? 'not entered' : `${largest} mm`}.`;

  const scopeNote = 'This applies a published interval table to findings already recorded. It does not decide when a patient is scheduled.';

  return {
    valid: true,
    interval,
    basis,
    examOk,
    histology,
    adenomaCount: count,
    largestSizeMm: largest,
    piecemealLarge,
    action,
    recordedNote,
    examNote,
    piecemealNote,
    sizeNote,
    scopeOfTableNote,
    scopeNote,
    abnormal: piecemealLarge || !examOk || (interval !== null && interval !== '10 years'),
    bandLabel: piecemealLarge ? '6 months' : !examOk ? 'Early repeat' : interval || 'No interval selected',
    band: action,
    detail: 'Normal, or small hyperplastic polyps in the rectum or sigmoid: 10 years. One or two small tubular adenomas: 7 to 10 years. Three or four: 3 to 5 years. Five to ten: 3 years. More than ten: 1 year. Any adenoma 10 mm or larger, villous, or with high-grade dysplasia: 3 years. Piecemeal resection of an adenoma 20 mm or larger: 6 months.',
    note: POLYP_NOTE,
  };
}
