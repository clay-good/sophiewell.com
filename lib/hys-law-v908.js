// spec-v908: whether a liver-injury lab set meets Hy's Law.
//
// Source:
//   US Food and Drug Administration. Guidance for Industry -- Drug-Induced Liver Injury:
//   Premarketing Clinical Evaluation. July 2009.
//
//   A Hy's Law case has all three of:
//     1. an aminotransferase (ALT or AST) at or above 3x the upper limit of normal;
//     2. a total bilirubin above 2x the upper limit of normal;
//     3. no other reason for the combination -- and, at the outset, no cholestasis, taken as an
//        alkaline phosphatase below 2x the upper limit of normal.
//
// THE LABS ALONE MAKE A *POTENTIAL* CASE. The third criterion is a judgment, not a measurement:
// viral hepatitis A, B, C and E, pre-existing or acute liver disease of another kind, and any
// other drug capable of the same injury all have to be ruled out first. Until they are, what the
// numbers support is a potential Hy's Law case. That distinction is the one this tile exists to
// hold, and it is the one most often dropped.
//
// A RAISED ALKALINE PHOSPHATASE TAKES THE CASE OUT. Hy's Law was written for hepatocellular
// injury. A cholestatic picture carrying the same bilirubin is a different thing and the rule
// does not describe it.
//
// IT IS A SIGNAL ABOUT A DRUG, NOT A PROGNOSIS FOR A PATIENT. The observation behind the rule is
// that a drug producing such cases in trials goes on to cause severe injury at a rate in the
// wider population. One case says something about the drug. It does not forecast this patient.
//
// Pure: no DOM, no clock, no network.

export const HYS_LAW_NOTE = `Hy's Law describes a lab combination seen in drug trials: an aminotransferase at or above three times the upper limit of normal, a total bilirubin above twice the upper limit of normal, and no other reason for the two together -- including, at the outset, no cholestasis, taken as an alkaline phosphatase below twice its upper limit. Three things about it are worth stating plainly. The labs on their own make a potential case, not a case: the third criterion is a judgment rather than a measurement, and viral hepatitis A, B, C and E, other pre-existing or acute liver disease, and any other drug capable of the same injury all have to be ruled out before a potential case becomes a Hy's Law case. A raised alkaline phosphatase takes the picture out of the rule entirely, because the rule was written for hepatocellular injury and a cholestatic picture with the same bilirubin is a different thing. And it is a signal about a drug rather than a prognosis for a patient: the observation behind it is that a drug producing these cases in trials goes on to cause severe injury at a rate in the wider population, which says nothing about how one person in front of you will do. This checks entered numbers against the published thresholds. It does not diagnose, and it does not attribute the injury to any drug.`;

const AT_THRESHOLD = 3;
const BILI_THRESHOLD = 2;
const ALP_THRESHOLD = 2;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function ratio(value, uln) {
  const v = Number(value);
  const u = Number(uln);
  if (!Number.isFinite(v) || !Number.isFinite(u) || u <= 0 || v < 0) return null;
  const r = v / u;
  // A tiny upper limit against a huge value overflows the quotient; that is not a ratio.
  return Number.isFinite(r) ? r : null;
}

export function hysLaw(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const altRatio = ratio(o.alt, o.altUln);
  const astRatio = ratio(o.ast, o.astUln);
  const biliRatio = ratio(o.bilirubin, o.bilirubinUln);
  const alpRatio = ratio(o.alp, o.alpUln);

  if (altRatio === null && astRatio === null) {
    return { valid: false, message: 'Enter an ALT or an AST with its upper limit of normal. The first criterion is written on whichever aminotransferase is higher.' };
  }
  if (biliRatio === null) {
    return { valid: false, message: 'Enter a total bilirubin with its upper limit of normal. Without it the second criterion cannot be checked.' };
  }
  if (alpRatio === null) {
    return { valid: false, message: 'Enter an alkaline phosphatase with its upper limit of normal. A raised alkaline phosphatase takes the picture out of the rule, so it has to be checked, not assumed.' };
  }

  const atRatio = Math.max(altRatio === null ? 0 : altRatio, astRatio === null ? 0 : astRatio);
  const atSource = astRatio !== null && astRatio > (altRatio === null ? -1 : altRatio) ? 'AST' : 'ALT';

  const atMet = atRatio >= AT_THRESHOLD;
  const biliMet = biliRatio > BILI_THRESHOLD;
  const noCholestasis = alpRatio < ALP_THRESHOLD;
  const excluded = on(o.otherCausesExcluded);

  const labsMet = atMet && biliMet && noCholestasis;
  const verdict = labsMet ? (excluded ? 'case' : 'potential') : 'not-met';

  const round = (n) => { const r = Math.round(n * 100) / 100; return Number.isFinite(r) ? r : n; };

  const criteria = [
    {
      key: 'aminotransferase',
      text: `${atSource} at or above ${AT_THRESHOLD}x the upper limit of normal`,
      met: atMet,
      detail: `${atSource} is ${round(atRatio)}x its upper limit of normal.`,
    },
    {
      key: 'bilirubin',
      text: `Total bilirubin above ${BILI_THRESHOLD}x the upper limit of normal`,
      met: biliMet,
      detail: `Total bilirubin is ${round(biliRatio)}x its upper limit of normal.`,
    },
    {
      key: 'no-cholestasis',
      text: `Alkaline phosphatase below ${ALP_THRESHOLD}x the upper limit of normal`,
      met: noCholestasis,
      detail: noCholestasis
        ? `Alkaline phosphatase is ${round(alpRatio)}x its upper limit of normal, so the picture is not cholestatic at the outset.`
        : `Alkaline phosphatase is ${round(alpRatio)}x its upper limit of normal. A cholestatic picture is outside the rule, which was written for hepatocellular injury.`,
    },
    {
      key: 'other-causes',
      text: 'No other reason for the combination',
      met: excluded,
      detail: excluded
        ? 'Recorded as ruled out. This is a judgment, not a measurement.'
        : 'Not recorded as ruled out. Viral hepatitis A, B, C and E, other pre-existing or acute liver disease, and any other drug capable of the same injury all have to be excluded first.',
    },
  ];

  const bandLabel = {
    case: `Meets Hy's Law`,
    potential: `Potential Hy's Law case`,
    'not-met': `Does not meet Hy's Law`,
  }[verdict];

  const shortName = {
    aminotransferase: 'the aminotransferase threshold',
    bilirubin: 'the bilirubin threshold',
    'no-cholestasis': 'the absence of cholestasis',
  };
  const unmetLabs = criteria.slice(0, 3).filter((c) => !c.met).map((c) => shortName[c.key]);

  const band = {
    case: `All three lab criteria are met and other causes are recorded as ruled out. On the published definition this is a Hy's Law case.`,
    potential: `The three lab criteria are met, but other causes are not recorded as ruled out. That makes this a potential case, not a case.`,
    'not-met': `${unmetLabs.length === 1 ? 'One lab criterion is not met' : `${unmetLabs.length} lab criteria are not met`}: ${unmetLabs.join(', ')}. The rule is not reached.`,
  }[verdict];

  const potentialNote = `The labs alone make a potential case. The third criterion is a judgment rather than a measurement, and a potential case becomes a Hy's Law case only once viral hepatitis A, B, C and E, other liver disease and other drugs have been ruled out.`;

  const cholestasisNote = `A raised alkaline phosphatase takes the picture out of the rule. Hy's Law was written for hepatocellular injury, and a cholestatic picture carrying the same bilirubin is a different thing.`;

  const signalNote = `This is a signal about a drug, not a prognosis for a patient. The observation behind the rule is that a drug producing such cases in trials goes on to cause severe injury at a rate in the wider population.`;

  const timingNote = `The two elevations do not have to be drawn on the same day, but they belong to the same episode, and the bilirubin rising after the aminotransferase is the pattern the rule describes.`;

  const scopeNote = 'This checks entered numbers against the published thresholds. It does not diagnose, and it does not attribute the injury to any drug.';

  return {
    valid: true,
    verdict,
    atRatio: round(atRatio),
    atSource,
    bilirubinRatio: round(biliRatio),
    alpRatio: round(alpRatio),
    criteria,
    potentialNote,
    cholestasisNote,
    signalNote,
    timingNote,
    scopeNote,
    abnormal: labsMet,
    bandLabel,
    band,
    detail: `Hy's Law asks for an aminotransferase at or above 3x its upper limit of normal, a total bilirubin above 2x its upper limit, an alkaline phosphatase below 2x its upper limit, and no other explanation for the combination.`,
    note: HYS_LAW_NOTE,
  };
}
