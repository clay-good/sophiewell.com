// spec-v592: the Amsterdam II criteria for Lynch syndrome (hereditary non-polyposis colorectal cancer).
// `grep -ci lynch app.js` and `grep -ci "amsterdam ii" app.js` both returned 0. The catalog carries breast
// and ovarian familial-risk models (`gail`, and the Claus tables) and had nothing on the Lynch axis.
//
// **ALL SIX REQUIREMENTS MUST BE MET. IT IS A CONJUNCTION, NOT A COUNT.** There is no score, no threshold
// and no partial credit: a family meeting five of six does not "nearly" meet Amsterdam II, it fails. Any
// implementation that tallies satisfied requirements is answering a different question.
//
// **THE "3-2-1" MNEMONIC OMITS HALF THE RULE, AND THE PART IT OMITS IS THE PART FAMILIES FAIL.** Three
// affected relatives, two successive generations, one diagnosed under 50 -- that is three of the six. The
// mnemonic leaves out that ONE OF THE THREE MUST BE A FIRST-DEGREE RELATIVE OF THE OTHER TWO, that familial
// adenomatous polyposis must be excluded, and that the tumors must be VERIFIED BY PATHOLOGICAL EXAMINATION.
// A family with three affected cousins satisfies "3" and fails the criteria, and this lib asks the
// first-degree question separately for exactly that reason.
//
// **THE CANCER SPECTRUM IS CLOSED, AND IT IS SHORTER THAN THE SYNDROME.** Only colorectal cancer and cancers
// of the endometrium, small intestine, ureter and renal pelvis count toward the three. A relative with a
// cancer outside that list contributes NOTHING to the count, however strongly the family history suggests
// Lynch syndrome. The list is the criteria's, not a summary of which cancers Lynch syndrome causes.
//
// **THE PREDECESSOR COUNTED COLORECTAL CANCER ONLY, SO THE SAME FAMILY CAN FAIL ONE AND MEET THE OTHER.**
// Amsterdam I required three relatives with histologically confirmed COLORECTAL cancer; Amsterdam II added
// the four extrapelvic sites. Both are reported here from the same inputs, because a family whose three
// cancers include an endometrial one meets Amsterdam II and fails Amsterdam I.
//
// **THE CRITERIA ARE KNOWN TO BE TOO STRICT, AND A NEGATIVE RESULT MUST NOT STOP AN EVALUATION.** The
// Bethesda guidelines were introduced because the Amsterdam criteria were found too strict, and are reported
// to be more sensitive for identifying families at risk. Failing Amsterdam II is NOT evidence against Lynch
// syndrome and is NOT a reason to withhold mismatch-repair immunohistochemistry, microsatellite-instability
// testing or germline testing. This lib says so on every negative result.
//
// HIGH-STAKES: these are FAMILY-HISTORY criteria. They do not diagnose Lynch syndrome, which is a germline
// diagnosis made by genetic testing; they do not identify which gene; they do not assess an individual's
// cancer risk or set surveillance intervals; and they say nothing about a family that has not been asked
// the right questions or whose relatives' tumors were never confirmed. Genetic testing carries implications
// for relatives and belongs with genetic counseling (spec-v11 section 5.3).
//
// REQUIREMENTS AND THE CANCER SPECTRUM RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER
// RECALLED (spec-v97). The frequently quoted sensitivity and specificity percentages appeared in only ONE of
// them and are therefore NOT reported here; the qualitative finding that the criteria are too strict is
// carried by both:
//   - Vasen HFA, Watson P, Mecklin JP, Lynch HT. New clinical criteria for hereditary nonpolyposis
//     colorectal cancer (HNPCC, Lynch syndrome) proposed by the International Collaborative Group on HNPCC.
//     Gastroenterology. 1999;116(6):1453-1456 (the Amsterdam II criteria).
//   - Vasen HFA, Mecklin JP, Khan PM, Lynch HT. The International Collaborative Group on HNPCC. Dis Colon
//     Rectum. 1991;34(5):424-425 (the Amsterdam I criteria).

export const MIN_RELATIVES = 3;
export const MIN_GENERATIONS = 2;
export const AGE_THRESHOLD = 50;

export const SPECTRUM = [
  'colorectal',
  'endometrium',
  'small intestine',
  'ureter',
  'renal pelvis',
];
export const AMSTERDAM_I_SPECTRUM = ['colorectal'];

export const REQUIREMENTS = [
  { key: 'threeRelatives', text: `At least ${MIN_RELATIVES} relatives with a cancer in the Amsterdam II spectrum`, inMnemonic: true },
  { key: 'firstDegree', text: 'One of them is a FIRST-DEGREE relative of the other two', inMnemonic: false },
  { key: 'twoGenerations', text: `At least ${MIN_GENERATIONS} successive generations affected`, inMnemonic: true },
  { key: 'underFifty', text: `At least one diagnosed before age ${AGE_THRESHOLD}`, inMnemonic: true },
  { key: 'fapExcluded', text: 'Familial adenomatous polyposis excluded in the colorectal cases', inMnemonic: false },
  { key: 'pathologyVerified', text: 'Tumors verified by pathological examination', inMnemonic: false },
];

export const CONJUNCTION_NOTE = `All ${REQUIREMENTS.length} requirements must be met. This is a CONJUNCTION, not a count: there is no score, no threshold and no partial credit, and a family meeting ${REQUIREMENTS.length - 1} of ${REQUIREMENTS.length} fails.`;
export const MNEMONIC_NOTE = `The "3-2-1" mnemonic covers only ${REQUIREMENTS.filter((r) => r.inMnemonic).length} of the ${REQUIREMENTS.length} requirements. It leaves out the FIRST-DEGREE relationship, the exclusion of familial adenomatous polyposis, and the requirement that tumors be VERIFIED BY PATHOLOGICAL EXAMINATION - and the first-degree requirement is the one families most often fail, because three affected cousins satisfy "3" and do not satisfy the criteria.`;
export const SPECTRUM_NOTE = `The cancer spectrum is CLOSED and shorter than the syndrome: only ${SPECTRUM.join(', ')}. A relative with a cancer outside that list contributes NOTHING to the count of ${MIN_RELATIVES}, however strongly the family history suggests Lynch syndrome. The list is the criteria’s, not a summary of which cancers Lynch syndrome causes.`;
export const NEGATIVE_NOTE = 'Failing these criteria is NOT evidence against Lynch syndrome. The Bethesda guidelines were introduced because the Amsterdam criteria were found too strict, and are reported to be more sensitive for identifying families at risk. A negative result here is not a reason to withhold mismatch-repair immunohistochemistry, microsatellite-instability testing or germline testing.';
export const WITHHELD_STATS_NOTE = 'The sensitivity and specificity percentages often quoted for these criteria appeared in only one of the two sources checked, so no percentage is reported here. The qualitative finding that the criteria are too strict is carried by both.';

const NOTE = `The Amsterdam II criteria (Vasen and colleagues 1999) identify families that may have Lynch syndrome, also called hereditary non-polyposis colorectal cancer. ALL ${REQUIREMENTS.length} requirements must be met: at least ${MIN_RELATIVES} relatives with a cancer in the spectrum; one of them a FIRST-DEGREE relative of the other two; at least ${MIN_GENERATIONS} successive generations affected; at least one diagnosed before age ${AGE_THRESHOLD}; familial adenomatous polyposis excluded in the colorectal cases; and tumors verified by pathological examination. This is a conjunction, not a count, with no score and no partial credit. The "3-2-1" mnemonic covers only three of the six and leaves out the first-degree relationship, the exclusion of familial adenomatous polyposis and the pathological verification, and the first-degree requirement is the one families most often fail, because three affected cousins satisfy "3" and do not satisfy the criteria. The cancer spectrum is closed and shorter than the syndrome: only ${SPECTRUM.join(', ')} count, and a relative with any other cancer contributes nothing to the count. The predecessor Amsterdam I counted colorectal cancer ONLY, so a family whose three cancers include an endometrial one meets Amsterdam II and fails Amsterdam I; both are reported here from the same inputs. Failing these criteria is not evidence against Lynch syndrome: the Bethesda guidelines were introduced because the Amsterdam criteria were found too strict and are reported to be more sensitive, and a negative result is not a reason to withhold mismatch-repair immunohistochemistry, microsatellite-instability testing or germline testing. The sensitivity and specificity percentages often quoted for these criteria appeared in only one of the two sources checked and are therefore not reported. These are FAMILY-HISTORY criteria. They do not diagnose Lynch syndrome, which is a germline diagnosis made by genetic testing; they do not identify which gene; they do not assess an individual’s cancer risk or set surveillance intervals; and they say nothing about a family that has not been asked the right questions or whose relatives’ tumors were never confirmed. Genetic testing carries implications for relatives and belongs with genetic counseling.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: one key per REQUIREMENTS entry (yes/no), plus optional allThreeColorectal for the Amsterdam I
// comparison.
export function amsterdamII(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let read, allColorectal;
  try {
    read = REQUIREMENTS.map((r) => ({ r, v: readBool(o[r.key], r.text) }));
    allColorectal = readBool(o.allThreeColorectal, 'All three cancers colorectal');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = read.filter((x) => x.v === null).map((x) => x.r.key);
  if (allColorectal === null) missing.push('allThreeColorectal');
  if (missing.length) {
    return { valid: false, message: `Answer every requirement. Still needed: ${missing.join(', ')}. ${CONJUNCTION_NOTE}` };
  }

  const unmet = read.filter((x) => !x.v).map((x) => x.r);
  const meets = unmet.length === 0;
  // Amsterdam I is Amsterdam II with a colorectal-only spectrum.
  const meetsAmsterdamI = meets && allColorectal;
  const differsFromAmsterdamI = meets && !allColorectal;

  const parts = [];
  parts.push(meets
    ? `MEETS the Amsterdam II criteria: all ${REQUIREMENTS.length} requirements are satisfied.`
    : `Does NOT meet the Amsterdam II criteria. Unmet: ${unmet.map((r) => r.text).join('; ')}.`);
  parts.push(CONJUNCTION_NOTE);
  if (unmet.some((r) => r.key === 'firstDegree')) {
    parts.push('The unmet requirement here is the one the mnemonic omits: three affected relatives is not enough unless one of them is a FIRST-DEGREE relative of the other two.');
  }
  parts.push(meetsAmsterdamI
    ? 'Also meets the predecessor Amsterdam I criteria, whose spectrum was COLORECTAL CANCER ONLY.'
    : differsFromAmsterdamI
      ? 'Meets Amsterdam II but NOT the predecessor Amsterdam I, whose spectrum was colorectal cancer only. This family is exactly what the 1999 expansion was written to capture.'
      : 'Amsterdam I, whose spectrum was colorectal cancer only, is not met either.');
  parts.push(MNEMONIC_NOTE);
  parts.push(SPECTRUM_NOTE);
  if (!meets) parts.push(NEGATIVE_NOTE);
  parts.push(WITHHELD_STATS_NOTE);
  parts.push('These are family-history criteria. They do not diagnose Lynch syndrome, which is a germline diagnosis, do not identify which gene, and do not set surveillance intervals. Genetic testing has implications for relatives and belongs with genetic counseling.');

  return {
    valid: true,
    meetsAmsterdamII: meets,
    meetsAmsterdamI,
    metRequirements: read.filter((x) => x.v).map((x) => x.r.key),
    unmetRequirements: unmet.map((r) => r.key),
    requirementsTotal: REQUIREMENTS.length,
    sensitivityPercent: null,   // deliberately withheld; see WITHHELD_STATS_NOTE
    specificityPercent: null,
    band: meets ? 'Meets Amsterdam II' : 'Does not meet Amsterdam II',
    bandLabel: `${meets ? 'Meets' : 'Does not meet'} Amsterdam II (${read.filter((x) => x.v).length} of ${REQUIREMENTS.length})`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
