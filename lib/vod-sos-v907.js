// spec-v907: which published definition of hepatic veno-occlusive disease / sinusoidal
// obstruction syndrome a post-transplant picture actually meets.
//
// Sources:
//   McDonald GB, Hinds MS, Fisher LD, et al. Veno-occlusive disease of the liver and multiorgan
//   failure after bone marrow transplantation. Ann Intern Med. 1993;118(4):255-267.
//   (the modified Seattle criteria)
//   Jones RJ, Lee KS, Beschorner WE, et al. Venoocclusive disease of the liver following bone
//   marrow transplantation. Transplantation. 1987;44(6):778-783. (the Baltimore criteria)
//   Mohty M, Malard F, Abecasis M, et al. Revised diagnosis and severity criteria for
//   sinusoidal obstruction syndrome / veno-occlusive disease in adult patients. Bone Marrow
//   Transplant. 2016;51(7):906-912. (the EBMT 2016 adult criteria)
//
//   MODIFIED SEATTLE, within 20 days of transplant, two of three:
//     bilirubin above 2 mg/dL; hepatomegaly or right upper quadrant pain of liver origin;
//     weight gain above 2% of baseline.
//   BALTIMORE, within 21 days: bilirubin at or above 2 mg/dL AND two of three: painful
//     hepatomegaly; ascites; weight gain above 5%.
//   EBMT 2016 CLASSICAL, within 21 days: the Baltimore items.
//   EBMT 2016 LATE-ONSET, beyond day 21: the classical picture beyond day 21, or histological
//     proof, or two or more of the classical items with hemodynamic or ultrasound evidence.
//
// THE DEFINITIONS DISAGREE, AND THAT IS WHY THIS TILE EXISTS. Baltimore and the 2016 criteria
// will not count anything until the bilirubin is raised. Modified Seattle counts the bilirubin as
// one of three. So a patient with hepatomegaly and a rising weight but a normal bilirubin meets
// modified Seattle and meets neither of the others -- and which paper a unit works from decides
// whether that patient has the diagnosis. Where they part, this prints both readings and offers
// neither as the answer.
//
// DAY 21 IS NO LONGER AN EXIT. The classical definitions put a hard window on the diagnosis; the
// 2016 criteria added a late-onset category precisely because disease beyond day 21 is real. A
// patient past the window is not out of scope, and a "not met" from Seattle or Baltimore on day
// 30 says only that the window closed.
//
// SEVERITY IS A SEPARATE GRADING and is not done here. This says which definition is met.
//
// THESE ARE THE ADULT CRITERIA. The EBMT published separate pediatric criteria in 2018 that carry
// no day limit and do not require a raised bilirubin at all.
//
// Pure: no DOM, no clock, no network.

export const VOD_SOS_NOTE = 'Hepatic veno-occlusive disease, also called sinusoidal obstruction syndrome, has three published definitions and they do not agree. The modified Seattle criteria ask for two of three within 20 days of transplant: a bilirubin above 2 mg/dL, hepatomegaly or right upper quadrant pain of liver origin, and a weight gain above 2% of baseline. The Baltimore criteria ask, within 21 days, for a bilirubin at or above 2 mg/dL and then two of three: painful hepatomegaly, ascites, and a weight gain above 5%. The 2016 EBMT adult criteria keep the Baltimore items for classical disease inside 21 days and add a late-onset category beyond it, met by the classical picture after day 21, by histological proof, or by two or more of the classical items together with hemodynamic or ultrasound evidence. Two differences matter. Baltimore and the 2016 criteria count nothing until the bilirubin is raised, while modified Seattle counts it as one of three, so a patient with hepatomegaly and a rising weight but a normal bilirubin meets one definition and neither of the others. And day 21 is no longer an exit: the late-onset category exists because disease beyond the classical window is real, so a not-met from Seattle or Baltimore on day 30 says only that the window closed. Severity grading is a separate exercise and is not done here, and these are the adult criteria -- the 2018 pediatric criteria carry no day limit and do not require a raised bilirubin at all.';

export const WEIGHT_GAIN_OPTIONS = [
  { value: 'none', text: 'No weight gain above 2% of baseline' },
  { value: 'over2', text: 'Weight gain above 2% but not above 5% of baseline' },
  { value: 'over5', text: 'Weight gain above 5% of baseline' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function vodSos(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  // A blank field and an absent field mean the same thing. Number('') is 0, so without this
  // an empty form reads as day 0 and the tile answers from nothing. spec-v930.
  const rawDay = o.daysSinceTransplant;
  const day = rawDay === null || rawDay === undefined || String(rawDay).trim() === '' ? NaN : Number(rawDay);
  if (!Number.isFinite(day) || day < 0) {
    return { valid: false, message: 'Enter the number of days since the transplant. Every one of the three definitions is written around that count, and two of them close at day 20 or 21.' };
  }

  const bilirubin = on(o.bilirubinAtLeastTwo);
  const painfulHepatomegaly = on(o.painfulHepatomegaly);
  // Painful hepatomegaly is the narrower finding; it satisfies Seattle's broader wording too.
  const hepatomegalyOrPain = painfulHepatomegaly || on(o.hepatomegalyOrRuqPain);
  const ascites = on(o.ascites);
  const weight = String(o.weightGain == null ? 'none' : o.weightGain);
  const weightOver5 = weight === 'over5';
  const weightOver2 = weightOver5 || weight === 'over2';
  const imaging = on(o.hemodynamicOrUltrasoundEvidence);
  const histology = on(o.histologicallyProven);

  // Modified Seattle: two of three, within 20 days.
  const seattleItems = [bilirubin, hepatomegalyOrPain, weightOver2].filter(Boolean).length;
  const seattleWindow = day <= 20;
  const seattleMet = seattleWindow && seattleItems >= 2;

  // Baltimore: a raised bilirubin is mandatory, then two of three, within 21 days.
  const classicalItems = [painfulHepatomegaly, ascites, weightOver5].filter(Boolean).length;
  const baltimoreWindow = day <= 21;
  const baltimoreMet = baltimoreWindow && bilirubin && classicalItems >= 2;

  // EBMT 2016 adult: the Baltimore items inside 21 days, plus a late-onset route beyond it.
  const ebmtClassical = day <= 21 && bilirubin && classicalItems >= 2;
  const ebmtLate = day > 21 && (
    (bilirubin && classicalItems >= 2) || histology || (classicalItems >= 2 && imaging)
  );
  const ebmtMet = ebmtClassical || ebmtLate;

  const definitions = [
    {
      key: 'seattle',
      name: 'Modified Seattle',
      met: seattleMet,
      why: !seattleWindow
        ? `Day ${day} is past the 20-day window this definition is written for.`
        : `${seattleItems} of the three items: a bilirubin above 2 mg/dL, hepatomegaly or right upper quadrant pain, a weight gain above 2%. Two are needed.`,
    },
    {
      key: 'baltimore',
      name: 'Baltimore',
      met: baltimoreMet,
      why: !baltimoreWindow
        ? `Day ${day} is past the 21-day window this definition is written for.`
        : !bilirubin
          ? 'The bilirubin is not at or above 2 mg/dL, and this definition counts nothing until it is.'
          : `Bilirubin at or above 2 mg/dL, with ${classicalItems} of the three items: painful hepatomegaly, ascites, a weight gain above 5%. Two are needed.`,
    },
    {
      key: 'ebmt2016',
      name: 'EBMT 2016 (adult)',
      met: ebmtMet,
      why: ebmtClassical
        ? `Classical disease: inside 21 days, with a raised bilirubin and ${classicalItems} of the three items.`
        : ebmtLate
          ? `Late-onset disease on day ${day}: ${histology ? 'histologically proven' : bilirubin && classicalItems >= 2 ? 'the classical picture beyond day 21' : 'two or more of the classical items with hemodynamic or ultrasound evidence'}.`
          : day <= 21
            ? !bilirubin
              ? 'Inside 21 days this asks for the Baltimore items, and the bilirubin is not at or above 2 mg/dL.'
              : `Inside 21 days this asks for the Baltimore items: ${classicalItems} of three recorded, two needed.`
            : `Beyond day 21 this asks for the classical picture, histological proof, or two or more classical items with hemodynamic or ultrasound evidence. None of those three routes is met.`,
    },
  ];

  const metNames = definitions.filter((d) => d.met).map((d) => d.name);
  const unmetNames = definitions.filter((d) => !d.met).map((d) => d.name);

  const verdict = metNames.length === 3 ? 'all' : metNames.length === 0 ? 'none' : 'split';

  const bandLabel = {
    all: 'All three definitions met',
    none: 'No definition met',
    split: 'The definitions disagree',
  }[verdict];

  const band = {
    all: `All three published definitions are met on day ${day}.`,
    none: `None of the three definitions is met on day ${day} from what is recorded.`,
    split: `Met: ${metNames.join(' and ')}. Not met: ${unmetNames.join(' and ')}. Which paper a unit works from decides the answer here, and this does not pick one.`,
  }[verdict];

  const bilirubinNote = 'Baltimore and the 2016 criteria count nothing until the bilirubin is at or above 2 mg/dL. Modified Seattle counts it as one of three. A patient with hepatomegaly and a rising weight but a normal bilirubin meets modified Seattle and meets neither of the others.';

  const lateOnsetNote = day > 21
    ? `Day ${day} is beyond the classical window, so a not-met from modified Seattle or Baltimore says only that their window closed. The 2016 criteria added the late-onset category for exactly this.`
    : 'Day 21 is not an exit. The 2016 criteria added a late-onset category because disease beyond the classical window is real, so a patient who passes day 21 without meeting anything is not thereby excluded.';

  const severityNote = 'Severity grading is a separate exercise, run on bilirubin kinetics, transaminases, weight, renal function and the presence of organ dysfunction. It is not done here.';

  const pediatricNote = 'These are the adult criteria. The EBMT published separate pediatric criteria in 2018 that carry no day limit and do not require a raised bilirubin at all.';

  const scopeNote = 'This checks recorded findings against three published definitions. It does not diagnose, and it does not decide on treatment.';

  return {
    valid: true,
    day,
    verdict,
    definitions,
    metNames,
    unmetNames,
    bilirubinNote,
    lateOnsetNote,
    severityNote,
    pediatricNote,
    scopeNote,
    abnormal: metNames.length > 0,
    bandLabel,
    band,
    detail: `Modified Seattle asks for two of three within 20 days: bilirubin above 2 mg/dL, hepatomegaly or right upper quadrant pain, weight gain above 2%. Baltimore asks, within 21 days, for a bilirubin at or above 2 mg/dL plus two of three: painful hepatomegaly, ascites, weight gain above 5%. The 2016 EBMT adult criteria keep those items for classical disease and add a late-onset route beyond day 21.`,
    note: VOD_SOS_NOTE,
  };
}
