// spec-v1634 tool 2: WHO-UMC causality category for a suspected adverse drug reaction.
//
// Source: Uppsala Monitoring Centre, "The use of the WHO-UMC system for standardised case causality
// assessment", Table 2 (cdn.who.int whocausality-assessment.pdf), re-read October 17, 2026. Six categories,
// in this order: Certain, Probable/Likely, Possible, Unlikely, Conditional/Unclassified,
// Unassessable/Unclassifiable; the table's footnote says all points should be reasonably complied with.
// Owner decision of October 17, 2026: the document carries no license line, so every criterion below is
// the project's own short wording of the table, cited, never the table's text.
//
// Reading of the table used here (spec-v1634 section 2):
//   Certain      time plausible; no other disease or drug explains it; withdrawal response plausible;
//                the event is definitive pharmacologically or phenomenologically; rechallenge satisfactory
//                if it was needed (so "not done" does not block Certain).
//   Probable     time plausible or reasonable; another cause unlikely or absent; withdrawal response
//                clinically reasonable or better; rechallenge not required.
//   Possible     time plausible or reasonable; another cause may also explain it (or none does); the
//                withdrawal information may be lacking. Missing withdrawal information caps the result
//                here.
//   Unlikely     time improbable and another disease or drug gives a plausible explanation.
//   Conditional  more data are needed or under examination.
//   Unassessable the report cannot be judged: information insufficient or contradictory and it cannot be
//                supplemented.
// The first category whose points are all met is the result.
//
// Pure: no DOM, no clock, no network.

export const TIME = [
  { value: 'plausible', text: 'Plausible' },
  { value: 'reasonable', text: 'Reasonable' },
  { value: 'improbable', text: 'Improbable (but not impossible)' },
];
export const ALTERNATIVE = [
  { value: 'none', text: 'No disease or other drug explains it' },
  { value: 'unlikely', text: 'Another cause is unlikely' },
  { value: 'possible', text: 'Disease or other drugs could also explain it' },
  { value: 'plausible', text: 'Disease or other drugs plausibly explain it' },
];
export const WITHDRAWAL = [
  { value: 'plausible', text: 'Response plausible (pharmacologically or pathologically)' },
  { value: 'reasonable', text: 'Response clinically reasonable' },
  { value: 'unclear', text: 'Information lacking or unclear' },
];
export const RECHALLENGE = [
  { value: 'satisfactory', text: 'Done, and satisfactory' },
  { value: 'not-done', text: 'Not done' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

const NOTE = 'A structured judgment the assessor makes, not a computation: the categories describe how strongly the case supports a causal link, and the assessor decides when each point is reasonably met.';
const CITE = 'Uppsala Monitoring Centre. The use of the WHO-UMC system for standardised case causality assessment, Table 2 (criteria restated in this tool\'s own words).';

const pick = (list, v) => list.find((x) => x.value === String(v ?? '').trim());

export function whoUmcCausality(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const asks = [
    ['time', TIME, 'Choose the time relationship between drug intake and the event.'],
    ['alternative', ALTERNATIVE, 'Choose how well disease or other drugs explain the event.'],
    ['withdrawal', WITHDRAWAL, 'Choose what happened when the drug was withdrawn.'],
    ['definitive', YES_NO, 'Say whether the event is definitive pharmacologically or phenomenologically.'],
    ['rechallenge', RECHALLENGE, 'Say whether a rechallenge was done.'],
    ['moreData', YES_NO, 'Say whether more data are needed or under examination.'],
    ['insufficient', YES_NO, 'Say whether the information is insufficient or contradictory and cannot be supplemented.'],
  ];
  const v = {};
  for (const [key, list, msg] of asks) {
    const hit = pick(list, o[key]);
    if (!hit) return { valid: false, message: msg };
    v[key] = hit.value;
  }
  const timeOk = v.time === 'plausible' || v.time === 'reasonable';
  const checks = {
    Certain: [
      ['time plausible', v.time === 'plausible'],
      ['no other disease or drug explains it', v.alternative === 'none'],
      ['withdrawal response plausible', v.withdrawal === 'plausible'],
      ['event definitive pharmacologically or phenomenologically', v.definitive === 'yes'],
      ['rechallenge satisfactory if it was needed', true],
    ],
    'Probable / Likely': [
      ['time plausible or reasonable', timeOk],
      ['another cause unlikely', v.alternative === 'none' || v.alternative === 'unlikely'],
      ['withdrawal response clinically reasonable', v.withdrawal === 'plausible' || v.withdrawal === 'reasonable'],
    ],
    Possible: [
      ['time plausible or reasonable', timeOk],
      ['another cause may also explain it', v.alternative !== 'plausible'],
    ],
    Unlikely: [
      ['time improbable', v.time === 'improbable'],
      ['disease or other drugs plausibly explain it', v.alternative === 'plausible'],
    ],
    'Conditional / Unclassified': [['more data needed or under examination', v.moreData === 'yes']],
    'Unassessable / Unclassifiable': [['information insufficient or contradictory, cannot be supplemented', v.insufficient === 'yes']],
  };
  const order = Object.keys(checks);
  const idx = order.findIndex((c) => checks[c].every(([, ok]) => ok));
  const notes = [];
  if (idx < 0) {
    notes.push('No category has all its points met. The table expects the assessor to try the adjacent category when one does not fit; review the answers.');
    for (const c of order.slice(0, 4)) {
      const fail = checks[c].filter(([, ok]) => !ok).map(([t]) => t);
      notes.push(`${c}: not met (${fail.join('; ')}).`);
    }
    notes.push(CITE);
    return { valid: true, category: null, flag: 'none', abnormal: true, band: 'No WHO-UMC category has all its points met by these answers.', bandLabel: 'No category', notes, note: NOTE };
  }
  const cat = order[idx];
  notes.push(`Met: ${checks[cat].map(([t]) => t).join('; ')}.`);
  if (idx > 0) {
    const up = order[idx - 1];
    const fail = checks[up].filter(([, ok]) => !ok).map(([t]) => t);
    if (fail.length) notes.push(`${up} is not reached: ${fail.join('; ')}.`);
  }
  if (idx < 4 && v.moreData === 'yes') notes.push('More data were marked as needed: the source treats a case still under examination as Conditional, so this category may change.');
  if (idx < 5 && v.insufficient === 'yes') notes.push('The information was marked insufficient or contradictory, which conflicts with the points met above; review the answers.');
  notes.push(CITE);
  return {
    valid: true, category: cat, flag: cat.toLowerCase().split(' ')[0], abnormal: idx <= 2,
    band: `WHO-UMC category: ${cat}.`, bandLabel: cat, notes, note: NOTE,
  };
}
