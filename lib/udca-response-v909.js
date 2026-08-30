// spec-v909: the threshold definitions of biochemical response to ursodeoxycholic acid in
// primary biliary cholangitis.
//
// Sources:
//   Pares A, Caballeria L, Rodes J. Excellent long-term survival in patients with primary biliary
//   cirrhosis and biochemical response to ursodeoxycholic acid. Gastroenterology.
//   2006;130(3):715-720. (Barcelona)
//   Corpechot C, Abenavoli L, Rabahi N, et al. Biochemical response to ursodeoxycholic acid and
//   long-term prognosis in primary biliary cirrhosis. Hepatology. 2008;48(3):871-877. (Paris I)
//   Corpechot C, Chazouilleres O, Poupon R. Early primary biliary cirrhosis: biochemical response
//   to treatment and prediction of long-term outcome. J Hepatol. 2011;55(6):1361-1367. (Paris II)
//   Kumagi T, Guindi M, Fischer SE, et al. Baseline ductopenia and treatment response predict
//   long-term histological progression in primary biliary cirrhosis. Am J Gastroenterol.
//   2010;105(10):2186-2194. (Toronto)
//
//   BARCELONA, at 12 months: alkaline phosphatase falls more than 40% from baseline, or
//     normalizes.
//   PARIS I, at 12 months: alkaline phosphatase at or below 3x the upper limit of normal, AST at
//     or below 2x, and bilirubin at or below 1 mg/dL.
//   PARIS II, at 12 months, for early-stage disease: alkaline phosphatase at or below 1.5x, AST
//     at or below 1.5x, and bilirubin at or below 1 mg/dL.
//   TORONTO, at 24 months: alkaline phosphatase at or below 1.67x the upper limit of normal.
//
// THEY DO NOT AGREE, AND THAT IS WHY THIS TILE EXISTS. Each set was drawn on a different cohort
// against a different endpoint, and a patient can be a responder by Barcelona and a
// non-responder by Paris II on the same blood draw. Where they part, this reports the split and
// picks none of them.
//
// THE TIME POINT IS PART OF THE CRITERION. Barcelona and the Paris sets are read at 12 months and
// Toronto at 24. Reading Toronto at six months is not Toronto, and the result says which sets the
// elapsed time actually supports.
//
// NON-RESPONSE IS A REASON TO CONSIDER SECOND-LINE THERAPY, NOT A REASON TO STOP. None of these
// definitions is a treatment decision, and none of them says to stop ursodeoxycholic acid.
//
// Pure: no DOM, no clock, no network.

export const UDCA_RESPONSE_NOTE = 'Biochemical response to ursodeoxycholic acid in primary biliary cholangitis has four widely used threshold definitions and they do not agree. Barcelona, read at 12 months, asks that the alkaline phosphatase fall more than 40% from baseline or normalize. Paris I, also at 12 months, asks for an alkaline phosphatase at or below three times the upper limit of normal, an AST at or below twice, and a bilirubin at or below 1 mg/dL. Paris II tightens the same three to 1.5 times, 1.5 times and 1 mg/dL for early-stage disease. Toronto, read at 24 months, asks only for an alkaline phosphatase at or below 1.67 times the upper limit of normal. Each was drawn on a different cohort against a different endpoint, so a patient can be a responder by one set and a non-responder by another on the same blood draw, and where they part nothing here picks between them. The time point is part of the criterion: Barcelona and the Paris sets are read at 12 months and Toronto at 24, and reading a set early is not that set. Non-response identifies who is considered for second-line therapy. It is not itself a treatment decision, and it is not a reason to stop ursodeoxycholic acid. Continuous models exist for the same question and use the same labs on a scale rather than a threshold. This checks entered numbers against published thresholds. It does not diagnose, and it does not choose therapy.';

function joinList(list) {
  if (list.length <= 1) return list.join('');
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function udcaResponse(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const alp = num(o.alp);
  const alpUln = num(o.alpUln);
  const baselineAlp = num(o.baselineAlp);
  const ast = num(o.ast);
  const astUln = num(o.astUln);
  const bilirubin = num(o.bilirubin);
  const months = num(o.monthsOnUdca);

  if (alp === null || alpUln === null || alpUln <= 0) {
    return { valid: false, message: 'Enter the current alkaline phosphatase with its upper limit of normal. Every one of the four definitions is written on it.' };
  }
  if (months === null || months < 0) {
    return { valid: false, message: 'Enter the months on ursodeoxycholic acid. The time point is part of each criterion, and reading a set early is not that set.' };
  }

  const alpRatio = alp / alpUln;
  const astRatio = ast !== null && astUln !== null && astUln > 0 ? ast / astUln : null;
  const alpDrop = baselineAlp !== null && baselineAlp > 0 ? (baselineAlp - alp) / baselineAlp : null;
  // Scaling by 100 can overflow a large but finite input to Infinity, which would then be
  // printed. Fall back to the number itself when it does.
  const round = (n) => { const r = Math.round(n * 100) / 100; return Number.isFinite(r) ? r : n; };

  const missing = (what) => `Not assessable: ${what} is missing.`;

  const barcelonaMet = alpDrop === null ? null : (alpDrop > 0.40 || alpRatio <= 1);
  const parisOneMet = astRatio === null || bilirubin === null
    ? null
    : (alpRatio <= 3 && astRatio <= 2 && bilirubin <= 1);
  const parisTwoMet = astRatio === null || bilirubin === null
    ? null
    : (alpRatio <= 1.5 && astRatio <= 1.5 && bilirubin <= 1);
  const torontoMet = alpRatio <= 1.67;

  const sets = [
    {
      key: 'barcelona',
      name: 'Barcelona',
      readAt: 12,
      met: barcelonaMet,
      why: alpDrop === null
        ? missing('the baseline alkaline phosphatase')
        : `Alkaline phosphatase has fallen ${round(alpDrop * 100)}% from baseline and now sits at ${round(alpRatio)}x the upper limit of normal. A fall over 40%, or normalization, is asked for.`,
    },
    {
      key: 'paris-i',
      name: 'Paris I',
      readAt: 12,
      met: parisOneMet,
      why: parisOneMet === null
        ? missing('an AST with its upper limit of normal, or the bilirubin')
        : `Alkaline phosphatase ${round(alpRatio)}x (3x allowed), AST ${round(astRatio)}x (2x allowed), bilirubin ${bilirubin} mg/dL (1 mg/dL allowed).`,
    },
    {
      key: 'paris-ii',
      name: 'Paris II',
      readAt: 12,
      met: parisTwoMet,
      why: parisTwoMet === null
        ? missing('an AST with its upper limit of normal, or the bilirubin')
        : `Alkaline phosphatase ${round(alpRatio)}x (1.5x allowed), AST ${round(astRatio)}x (1.5x allowed), bilirubin ${bilirubin} mg/dL (1 mg/dL allowed). This set was drawn on early-stage disease.`,
    },
    {
      key: 'toronto',
      name: 'Toronto',
      readAt: 24,
      met: torontoMet,
      why: `Alkaline phosphatase is ${round(alpRatio)}x the upper limit of normal, and 1.67x is allowed.`,
    },
  ].map((s) => ({
    ...s,
    onTime: months >= s.readAt,
    timeNote: months >= s.readAt
      ? `Read at ${s.readAt} months; ${round(months)} months recorded.`
      : `This set is read at ${s.readAt} months and only ${round(months)} are recorded, so the reading above is early and is not this set.`,
  }));

  const assessable = sets.filter((s) => s.met !== null && s.onTime);
  const responders = assessable.filter((s) => s.met).map((s) => s.name);
  const nonResponders = assessable.filter((s) => !s.met).map((s) => s.name);

  const verdict = assessable.length === 0
    ? 'none-assessable'
    : responders.length && nonResponders.length
      ? 'split'
      : responders.length
        ? 'response'
        : 'non-response';

  const bandLabel = {
    'none-assessable': 'No set can be read yet',
    split: 'The definitions disagree',
    response: 'Biochemical response',
    'non-response': 'Not a biochemical response',
  }[verdict];

  const band = {
    'none-assessable': `None of the four sets can be read from what is here. Each needs a time point it has reached and the labs it is written on, and at ${round(months)} months neither condition is met.`,
    split: `Response by ${joinList(responders)}. Not a response by ${joinList(nonResponders)}. The sets were drawn on different cohorts against different endpoints, and nothing here picks between them.`,
    response: `A response by ${responders.length === 1 ? 'the one set readable here' : 'every set readable here'}: ${joinList(responders)}.`,
    'non-response': `Not a response by ${nonResponders.length === 1 ? 'the one set readable here' : 'any set readable here'}: ${joinList(nonResponders)}.`,
  }[verdict];

  const disagreeNote = 'The four sets do not agree. Each was drawn on a different cohort against a different endpoint, so a patient can be a responder by one and a non-responder by another on the same blood draw.';

  const timingNote = 'The time point is part of the criterion. Barcelona and the two Paris sets are read at 12 months and Toronto at 24, and reading a set early is not that set.';

  const purposeNote = 'Non-response identifies who is considered for second-line therapy. It is not itself a treatment decision, and it is not a reason to stop ursodeoxycholic acid.';

  const continuousNote = 'Continuous models answer the same question with the same labs on a scale rather than a threshold, and give a survival estimate instead of a yes or no.';

  const scopeNote = 'This checks entered numbers against published thresholds. It does not diagnose, and it does not choose therapy.';

  return {
    valid: true,
    verdict,
    months,
    alpRatio: round(alpRatio),
    astRatio: astRatio === null ? null : round(astRatio),
    alpDropPercent: alpDrop === null ? null : round(alpDrop * 100),
    sets,
    responders,
    nonResponders,
    disagreeNote,
    timingNote,
    purposeNote,
    continuousNote,
    scopeNote,
    abnormal: verdict === 'non-response' || verdict === 'split',
    bandLabel,
    band,
    detail: 'Barcelona asks at 12 months for an alkaline phosphatase fall over 40% from baseline or normalization. Paris I asks at 12 months for alkaline phosphatase at or below 3x the upper limit of normal, AST at or below 2x, and bilirubin at or below 1 mg/dL. Paris II tightens those to 1.5x, 1.5x and 1 mg/dL for early-stage disease. Toronto asks at 24 months for an alkaline phosphatase at or below 1.67x.',
    note: UDCA_RESPONSE_NOTE,
  };
}
