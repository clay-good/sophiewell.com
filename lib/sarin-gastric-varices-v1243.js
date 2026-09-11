// spec-v1243: the Sarin classification of gastric varices, and the thing the classification is for.
//
// Source:
//   Sarin SK, Lahoti D, Saxena SP, Murthy NS, Makwana UK. Prevalence, classification and natural
//   history of gastric varices: a long-term follow-up study in 568 portal hypertension patients.
//   Hepatology. 1992;16(6):1343-1349. PMID 1446890.
//
// The four types turn on two questions a reader can answer from one endoscopy: are the gastric
// varices CONTINUOUS with esophageal varices, and WHERE are they?
//
//   GOV1  gastroesophageal, extending along the LESSER curvature
//   GOV2  gastroesophageal, extending along the GREATER curvature into the fundus
//   IGV1  isolated, in the FUNDUS, with no esophageal varices
//   IGV2  isolated, ectopic -- elsewhere in the stomach or the first part of the duodenum
//
// THE NUMBERS FROM SARIN'S OWN SERIES, because they are what make the classification worth doing:
// GOV1 was the commonest type (75% of gastric varices); GOV2 bled in 55% of patients; IGV1 bled in
// 78%. The ordering is the point -- the commonest type is not the dangerous one.
//
// AND THE FINDING THAT SITS ABOVE ALL FOUR: gastric varices bled in 25% of patients against 64% for
// esophageal varices, and yet needed 4.8 transfusion units per patient against 2.9, with 45%
// mortality once one had bled. They bleed less often and kill more. A reader who has learned
// "esophageal varices are the dangerous ones" from how often they bleed has learned the wrong half.
//
// IGV1 ALSO MEANS SOMETHING ELSE. Fundal varices with no esophageal varices should raise splenic
// vein thrombosis, which is a segmental portal hypertension with a different treatment, and the type
// is where that question naturally arises.
//
// Pure: no DOM, no clock, no network.

export const SARIN_NOTE = 'The Sarin classification (Sarin 1992) sorts gastric varices by whether they are continuous with esophageal varices and by where they sit: GOV1 along the lesser curvature, GOV2 into the fundus along the greater curvature, IGV1 isolated in the fundus, and IGV2 isolated elsewhere. In Sarin’s 568-patient series gastric varices bled less often than esophageal varices and were more serious when they did, and the commonest type was not the one that bled most. It reports the type entered; it is not a diagnosis and not a treatment decision.';

export const SARIN_TYPES = [
  {
    value: 'GOV1', text: 'GOV1 - continuous with esophageal varices, along the lesser curvature',
    continuous: true, site: 'the lesser curvature',
    prevalence: 75,
    bleedRisk: 'lowest of the four in the original series; persistent GOV1 bled in 28% of patients, against 2% of those whose varices were obliterated',
    rank: 1,
  },
  {
    value: 'GOV2', text: 'GOV2 - continuous with esophageal varices, extending into the fundus along the greater curvature',
    continuous: true, site: 'the greater curvature and the fundus',
    prevalence: null,
    bleedRisk: 'bled in 55% of patients and carried a high mortality',
    rank: 3,
  },
  {
    value: 'IGV1', text: 'IGV1 - isolated fundal varices, with no esophageal varices',
    continuous: false, site: 'the fundus',
    prevalence: null,
    bleedRisk: 'the highest bleeding incidence in the series, 78%',
    rank: 4,
  },
  {
    value: 'IGV2', text: 'IGV2 - isolated ectopic varices elsewhere in the stomach or the first part of the duodenum',
    continuous: false, site: 'an ectopic site',
    prevalence: null,
    bleedRisk: 'the least common pattern, and the one the original series has least to say about',
    rank: 2,
  },
];

const BY_VALUE = new Map(SARIN_TYPES.map((t) => [t.value, t]));

// Sarin 1992, 568 patients.
export const SARIN_SERIES = {
  gastricBleedPercent: 25,
  esophagealBleedPercent: 64,
  gastricUnits: 4.8,
  esophagealUnits: 2.9,
  mortalityAfterBleed: 45,
};

export function sarinGastricVarices(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.type == null ? '' : String(o.type).trim().toUpperCase();
  if (raw === '') {
    return { valid: false, message: 'Choose the Sarin type. There is no default, and the two isolated types are the ones that bleed most, so a blank is not the safe answer.' };
  }
  const t = BY_VALUE.get(raw);
  if (!t) {
    return { valid: false, message: `The Sarin type must be one of: ${SARIN_TYPES.map((x) => x.value).join(', ')}.` };
  }

  const highest = t.value === 'IGV1';

  return {
    valid: true,
    type: t.value,
    continuous: t.continuous,
    site: t.site,
    rank: t.rank,
    abnormal: t.value === 'IGV1' || t.value === 'GOV2',
    bandLabel: `Sarin ${t.value}`,
    band: `Sarin type ${t.value}: varices at ${t.site}, ${t.continuous ? 'continuous with esophageal varices' : 'with no esophageal varices'}. In the original 568-patient series this was ${t.bleedRisk}.`,
    // The sentence that sits above all four types.
    seriesNote: `Gastric varices of any type bled in ${SARIN_SERIES.gastricBleedPercent}% of patients against ${SARIN_SERIES.esophagealBleedPercent}% for esophageal varices, and yet took ${SARIN_SERIES.gastricUnits} transfusion units per patient against ${SARIN_SERIES.esophagealUnits}, with ${SARIN_SERIES.mortalityAfterBleed}% mortality once one had bled. They bleed less often and are more serious when they do, so how often a varix bleeds is the wrong half of the question on its own.`,
    commonestNote: t.value === 'GOV1'
      ? `GOV1 was the commonest type, ${t.prevalence}% of the gastric varices in the series, and the least likely to bleed. The commonest type is not the dangerous one, which is the reading the classification exists to prevent.`
      : null,
    isolatedNote: highest
      ? 'Fundal varices with no esophageal varices also raise the question of splenic vein thrombosis, which is a segmental portal hypertension with a different treatment. IGV1 is where that question naturally arises.'
      : null,
    postureNote: 'Decision support, not a verdict. The type describes what the endoscopy found; the treatment stays with the endoscopist and the hepatology team.',
    note: SARIN_NOTE,
  };
}
