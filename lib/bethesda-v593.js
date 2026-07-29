// spec-v593: the revised Bethesda guidelines for microsatellite-instability testing in colorectal cancer.
// A COMPANION with DELIBERATELY INVERTED LOGIC to `amsterdam-ii`, shipped in spec-v592: the Amsterdam II
// criteria are an AND of six requirements that a family must ALL satisfy; the Bethesda guidelines are an OR
// of five criteria of which ANY ONE triggers testing. They were written to catch the families Amsterdam II
// misses, and running one and not the other is the commonest way a Lynch family is lost.
//
// **ANY ONE CRITERION IS ENOUGH. THIS IS THE OPPOSITE OF ITS COMPANION.** There is no count and no
// threshold: one criterion met means the tumor should be tested. Applying Amsterdam-style conjunction logic
// here would suppress testing in nearly everyone it was written for.
//
// **THE TUMOR SPECTRUM IS FAR BROADER THAN AMSTERDAM II'S, AND THAT IS THE POINT.** Amsterdam II counts five
// cancers. The Bethesda spectrum is colorectal, endometrial, stomach, ovarian, pancreas, ureter and renal
// pelvis, biliary tract, small bowel, brain, and sebaceous gland adenomas and keratoacanthomas. A FAMILY
// WHOSE CANCERS ARE GASTRIC AND OVARIAN FAILS AMSTERDAM II ON SPECTRUM ALONE AND STILL TRIGGERS BETHESDA.
// Both tiles are in this catalog and they will disagree for exactly that family.
//
// **THERE ARE THREE DIFFERENT AGE RULES IN FIVE CRITERIA, AND TWO CRITERIA HAVE NONE.** Criterion 1 is under
// 50. Criterion 3 is under 60. Criterion 4 needs one of the cancers under 50. Criteria 2 and 5 apply
// REGARDLESS OF AGE. Carrying one age threshold across the set is the easiest way to get this wrong.
//
// **THE 60-YEAR THRESHOLD WAS SETTLED BY A VOTE, NOT BY DATA.** The revision's own account records that
// there was no consensus among the participants on whether to include an age criterion at all, and that they
// voted to keep "less than 60 years". A threshold arrived at that way is a convention, and the result says
// so rather than presenting it as a measured cut point.
//
// **CRITERION 3 USES A PATHOLOGIST'S IMPRESSION OF MSI TO DECIDE WHETHER TO TEST FOR MSI.** "MSI-H
// histology" is a morphological judgment -- tumor-infiltrating lymphocytes, a Crohn's-like lymphocytic
// reaction, mucinous or signet-ring differentiation, or a medullary growth pattern -- not a laboratory
// result. It is a screening step for the screening test, and it depends on who read the slide.
//
// **ADJACENT CRITERIA USE DIFFERENT DEGREES OF RELATIVE.** Criterion 4 counts FIRST-degree relatives only.
// Criterion 5 counts first- OR SECOND-degree. They sit next to each other and are easily conflated.
//
// HIGH-STAKES: these guidelines decide WHO GETS A TEST, not who has Lynch syndrome. Meeting a criterion is
// not a diagnosis and not a prediction; failing all five does not exclude Lynch syndrome, and many centers
// have moved to universal tumor testing precisely because criteria-driven selection misses cases. A normal
// MSI or mismatch-repair result does not exclude the syndrome either. Germline testing carries implications
// for relatives and belongs with genetic counseling (spec-v11 section 5.3).
//
// CRITERIA RE-FETCHED AND ADJUDICATED ACROSS THREE SOURCES, NEVER RECALLED (spec-v97). Two renderings
// disagreed on three cells -- whether criterion 1 includes endometrial cancer, whether criterion 3 carries
// the under-60 limit, and whether criterion 5 admits second-degree relatives. A third source, which records
// the vote on the 60-year threshold and quotes criterion 5 as "first- or second-degree", resolved all three
// in favour of the verbatim 2004 text, which is what is implemented here. The dissenting rendering was a
// modernized paraphrase in a genetics reference, not a competing account of the same text:
//   - Umar A, Boland CR, Terdiman JP, et al. Revised Bethesda guidelines for hereditary nonpolyposis
//     colorectal cancer (Lynch syndrome) and microsatellite instability. J Natl Cancer Inst.
//     2004;96(4):261-268.

export const AGE_EARLY_ONSET = 50;
export const AGE_MSI_HISTOLOGY = 60;

export const SPECTRUM = [
  'colorectal', 'endometrial', 'stomach', 'ovarian', 'pancreas',
  'ureter and renal pelvis', 'biliary tract', 'small bowel', 'brain',
  'sebaceous gland adenomas and keratoacanthomas',
];
// The companion tile's spectrum, carried only so the disagreement can be shown.
export const AMSTERDAM_II_SPECTRUM = ['colorectal', 'endometrium', 'small intestine', 'ureter', 'renal pelvis'];

export const MSI_HISTOLOGY_FEATURES = [
  'tumor-infiltrating lymphocytes',
  "Crohn's-like lymphocytic reaction",
  'mucinous or signet-ring differentiation',
  'medullary growth pattern',
];

export const CRITERIA = [
  { key: 'underFifty', text: `Colorectal cancer diagnosed under age ${AGE_EARLY_ONSET}`, ageRule: `under ${AGE_EARLY_ONSET}` },
  { key: 'synchronousOrMetachronous', text: 'Synchronous or metachronous colorectal or other Lynch-associated tumors, REGARDLESS OF AGE', ageRule: 'none' },
  { key: 'msiHistologyUnderSixty', text: `Colorectal cancer with MSI-high HISTOLOGY diagnosed under age ${AGE_MSI_HISTOLOGY}`, ageRule: `under ${AGE_MSI_HISTOLOGY}` },
  { key: 'oneFirstDegreeUnderFifty', text: `Colorectal cancer in a patient with ONE OR MORE FIRST-DEGREE relatives with a Lynch-associated tumor, one of the cancers diagnosed under age ${AGE_EARLY_ONSET}`, ageRule: `one cancer under ${AGE_EARLY_ONSET}` },
  { key: 'twoRelativesAnyAge', text: 'Colorectal cancer in a patient with TWO OR MORE FIRST- OR SECOND-DEGREE relatives with Lynch-associated tumors, REGARDLESS OF AGE', ageRule: 'none' },
];

export const OR_LOGIC_NOTE = 'ANY ONE criterion is enough. There is no count and no threshold, and this is the OPPOSITE of the Amsterdam II criteria in this catalog, which require ALL SIX of their requirements. Applying conjunction logic here would suppress testing in nearly everyone these guidelines were written for.';
export const SPECTRUM_NOTE = `The tumor spectrum here is far broader than Amsterdam II's five: ${SPECTRUM.join(', ')}. A family whose cancers are gastric and ovarian FAILS Amsterdam II on spectrum alone and still triggers Bethesda, and the two tiles will disagree for exactly that family.`;
export const AGE_NOTE = `Three different age rules across five criteria, and two criteria have none: criterion 1 is under ${AGE_EARLY_ONSET}, criterion 3 is under ${AGE_MSI_HISTOLOGY}, criterion 4 needs one cancer under ${AGE_EARLY_ONSET}, and criteria 2 and 5 apply regardless of age. Carrying one threshold across the set is the easiest way to get this wrong.`;
export const VOTE_NOTE = `The ${AGE_MSI_HISTOLOGY}-year threshold was settled by a VOTE, not by data: the revision's own account records that there was no consensus on whether to include an age criterion at all, and that the participants voted to keep "less than ${AGE_MSI_HISTOLOGY} years". It is a convention rather than a measured cut point.`;
export const HISTOLOGY_NOTE = `Criterion 3 uses a PATHOLOGIST'S IMPRESSION OF MSI to decide whether to TEST for MSI. "MSI-high histology" means ${MSI_HISTOLOGY_FEATURES.join(', ')} - a morphological judgment, not a laboratory result, so it is a screening step for the screening test and depends on who read the slide.`;
export const DEGREE_NOTE = 'Adjacent criteria use different degrees of relative: criterion 4 counts FIRST-degree relatives only, criterion 5 counts first- OR SECOND-degree. They sit next to each other and are easily conflated.';
export const NEGATIVE_NOTE = 'Failing all five does NOT exclude Lynch syndrome. Many centers have moved to universal tumor testing precisely because criteria-driven selection misses cases, and a normal MSI or mismatch-repair result does not exclude the syndrome either.';

const NOTE = `The revised Bethesda guidelines (Umar and colleagues 2004) identify colorectal tumors that should be tested for microsatellite instability. ANY ONE of five criteria is enough: colorectal cancer under age ${AGE_EARLY_ONSET}; synchronous or metachronous colorectal or other Lynch-associated tumors regardless of age; colorectal cancer with MSI-high histology under age ${AGE_MSI_HISTOLOGY}; colorectal cancer with one or more FIRST-degree relatives with a Lynch-associated tumor and one cancer under ${AGE_EARLY_ONSET}; and colorectal cancer with two or more first- or SECOND-degree relatives with Lynch-associated tumors regardless of age. This is the OPPOSITE logic to the Amsterdam II criteria, which require all six of their requirements, and applying conjunction logic here would suppress testing in nearly everyone these guidelines were written for. The tumor spectrum is far broader than Amsterdam II's five, so a family whose cancers are gastric and ovarian fails Amsterdam II on spectrum alone and still triggers Bethesda. There are three different age rules across the five criteria and two criteria have none, so carrying one threshold across the set is the easiest way to get this wrong. The ${AGE_MSI_HISTOLOGY}-year threshold was settled by a vote rather than by data, the revision's own account recording that there was no consensus on whether to include an age criterion at all. Criterion 3 uses a pathologist's impression of MSI to decide whether to test for MSI, since MSI-high histology is a morphological judgment and not a laboratory result. Adjacent criteria use different degrees of relative, criterion 4 counting first-degree only and criterion 5 first- or second-degree. These guidelines decide WHO GETS A TEST, not who has Lynch syndrome. Meeting a criterion is not a diagnosis and not a prediction. Failing all five does not exclude Lynch syndrome, many centers have moved to universal tumor testing because criteria-driven selection misses cases, and a normal MSI or mismatch-repair result does not exclude the syndrome either. Germline testing carries implications for relatives and belongs with genetic counseling.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: one key per CRITERIA entry, each yes/no.
export function bethesda(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let read;
  try {
    read = CRITERIA.map((c) => ({ c, v: readBool(o[c.key], c.text) }));
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = read.filter((x) => x.v === null).map((x) => x.c.key);
  if (missing.length) {
    return { valid: false, message: `Answer every criterion. Still needed: ${missing.join(', ')}. ${OR_LOGIC_NOTE}` };
  }

  const met = read.filter((x) => x.v).map((x) => x.c.key);
  const testingIndicated = met.length > 0;

  const parts = [];
  parts.push(testingIndicated
    ? `MSI TESTING IS INDICATED. Criteria met: ${met.join(', ')}. One is enough.`
    : 'None of the five criteria is met, so these guidelines do not indicate MSI testing.');
  parts.push(OR_LOGIC_NOTE);
  parts.push(SPECTRUM_NOTE);
  parts.push(AGE_NOTE);
  if (met.includes('msiHistologyUnderSixty')) {
    parts.push(`${HISTOLOGY_NOTE} ${VOTE_NOTE}`);
  }
  parts.push(DEGREE_NOTE);
  if (!testingIndicated) parts.push(NEGATIVE_NOTE);
  parts.push('These guidelines decide who gets a test, not who has Lynch syndrome. Meeting a criterion is not a diagnosis. Germline testing has implications for relatives and belongs with genetic counseling.');

  return {
    valid: true,
    testingIndicated,
    metCriteria: met,
    criteriaTotal: CRITERIA.length,
    band: testingIndicated ? 'MSI testing indicated' : 'No Bethesda criterion met',
    bandLabel: `${testingIndicated ? 'MSI testing indicated' : 'No criterion met'} (${met.length} of ${CRITERIA.length})`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
