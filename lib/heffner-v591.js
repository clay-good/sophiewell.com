// spec-v591: the Heffner criteria (abbreviated Light's criteria) for exudative pleural effusion. A
// COMPANION GAP: `light-criteria` is already in the catalog, and Light's criteria REQUIRE A PAIRED SERUM
// SAMPLE drawn at the same time. Heffner's rules were derived to answer the same question without one.
// `grep -ci heffner app.js` returned 0.
//
// **"NO SERUM SAMPLE NEEDED" IS NOT QUITE TRUE, AND THE EXCEPTION IS THE LDH TEST.** The cholesterol and
// protein tests use the pleural fluid alone. The LDH test does NOT: it compares pleural fluid LDH against
// 0.45 times THE LABORATORY'S UPPER LIMIT OF NORMAL FOR SERUM LDH. That is a reference value, not the
// patient's serum -- so no extra blood is drawn -- but it is NOT a fixed number, because the upper limit of
// normal for serum LDH differs between laboratories and assays. An implementation that hard-codes a single
// LDH cutoff is wrong wherever the local reference differs, so this lib REQUIRES the local upper limit as an
// input and refuses to default one.
//
// **THE THRESHOLDS ARE DELIBERATELY NOT THE ROUND NUMBERS THEY RESEMBLE.** Protein is 2.9 g/dL, not 3.0. The
// LDH multiplier is 0.45, not the two-thirds (about 0.667) that Light's criteria use. Each was re-derived
// for use WITHOUT a serum comparison, so "pleural protein over 3" and "pleural LDH over two-thirds of the
// serum upper limit" are DIFFERENT TESTS from these, not casual roundings of them.
//
// **THERE ARE TWO PUBLISHED RULES AND THE NUMBER OF TESTS IS A CHOICE.** Heffner showed the protein test
// could be dropped without loss of accuracy, giving a TWO-TEST rule (LDH or cholesterol) alongside the
// THREE-TEST rule (LDH or cholesterol or protein). Both are reported here from the same inputs, because
// which one a source means by "Heffner's criteria" is often left unstated.
//
// **THE TRADE IS SPECIFICITY, AND IT IS A LARGE ONE.** The three-test rule runs about 98.4 percent sensitive
// and about 85 percent specific. Light's criteria are far more specific, and already misclassify 15 to 20
// percent of transudates as exudates. So this rule buys freedom from a serum draw by calling MORE
// transudates exudative, and a positive result here is weaker evidence of an exudate than a positive Light's
// result. That is the whole trade and the result says so.
//
// **ANY ONE TEST IS ENOUGH; THEY DO NOT VOTE.** A single positive test classifies the effusion as an
// exudate. Two negatives do not outweigh one positive, and there is no count.
//
// HIGH-STAKES: this classifies an effusion as exudative or transudative. It does NOT give the CAUSE of
// either -- an exudate can be infection, malignancy, pulmonary embolism, or a dozen other things, and the
// classification is the beginning of the workup, not the end. It does not indicate or contraindicate
// drainage, does not diagnose empyema or malignancy, and a transudative result does not exclude a
// coexisting exudative process (spec-v11 section 5.3).
//
// A KNOWN FAILURE MODE SHARED WITH LIGHT'S: diuretic treatment concentrates a transudate and pushes protein
// and LDH upward, so a patient diuresed for heart failure can be misclassified as exudative by either rule.
//
// THRESHOLDS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER RECALLED (spec-v97), with
// the LDH multiplier checked specifically because 0.45 is easily conflated with Light's two-thirds:
//   - Heffner JE, Brown LK, Barbieri CA. Diagnostic value of tests that discriminate between exudative and
//     transudative pleural effusions. Chest. 1997;111(4):970-980, and Heffner JE, et al. Chest. 2002.

export const LDH_MULTIPLIER = 0.45;          // times the laboratory upper limit of normal for SERUM LDH
export const CHOLESTEROL_THRESHOLD = 45;     // mg/dL, pleural fluid
export const PROTEIN_THRESHOLD = 2.9;        // g/dL, pleural fluid
export const LIGHTS_LDH_MULTIPLIER = 2 / 3;  // for contrast only

export const THREE_TEST_SENSITIVITY = 98.4;
export const THREE_TEST_SPECIFICITY = 85;

export const TESTS = [
  { key: 'ldh', text: `Pleural fluid LDH above ${LDH_MULTIPLIER} times the laboratory upper limit of normal for SERUM LDH`, inTwoTestRule: true },
  { key: 'cholesterol', text: `Pleural fluid cholesterol above ${CHOLESTEROL_THRESHOLD} mg/dL`, inTwoTestRule: true },
  { key: 'protein', text: `Pleural fluid protein above ${PROTEIN_THRESHOLD} g/dL`, inTwoTestRule: false },
];

export const SERUM_NOTE = `"No serum sample needed" is not quite true, and the exception is the LDH test. Cholesterol and protein use the pleural fluid alone, but the LDH test compares pleural fluid LDH against ${LDH_MULTIPLIER} times THE LABORATORY'S UPPER LIMIT OF NORMAL FOR SERUM LDH. That is a reference value rather than the patient's blood, so no extra sample is drawn - but it is not a fixed number, because the upper limit of normal differs between laboratories and assays. The local value is required here and none is defaulted.`;
export const ROUNDING_NOTE = `The thresholds are deliberately NOT the round numbers they resemble: protein is ${PROTEIN_THRESHOLD} g/dL and not 3.0, and the LDH multiplier is ${LDH_MULTIPLIER} and not the two-thirds that Light's criteria use. Each was re-derived for use without a serum comparison, so "protein over 3" and "LDH over two-thirds" are DIFFERENT tests, not roundings of these.`;
export const TRADE_NOTE = `The three-test rule runs about ${THREE_TEST_SENSITIVITY} percent sensitive and about ${THREE_TEST_SPECIFICITY} percent specific. Light's criteria are far more specific and already misclassify 15 to 20 percent of transudates as exudates, so this rule buys freedom from a serum draw by calling MORE transudates exudative. A positive result here is weaker evidence of an exudate than a positive Light's result.`;
export const DIURETIC_NOTE = 'A failure mode shared with Light’s criteria: diuretic treatment concentrates a transudate and pushes protein and LDH upward, so a patient diuresed for heart failure can be misclassified as exudative by either rule.';

const NOTE = `The Heffner criteria, also called the abbreviated Light’s criteria, classify a pleural effusion as exudative without a paired serum sample. Any ONE of three tests classifies the effusion as an exudate: pleural fluid LDH above ${LDH_MULTIPLIER} times the laboratory upper limit of normal for serum LDH; pleural fluid cholesterol above ${CHOLESTEROL_THRESHOLD} mg/dL; pleural fluid protein above ${PROTEIN_THRESHOLD} g/dL. The tests do not vote - one positive is enough and two negatives do not outweigh it. There are two published rules and the number of tests is a choice, because the protein test can be dropped without loss of accuracy, giving a two-test rule of LDH or cholesterol; both are reported here from the same inputs, since which one a source means by "Heffner’s criteria" is often unstated. "No serum sample needed" is not quite true: the LDH test uses the laboratory upper limit of normal for serum LDH, which is a reference value rather than the patient’s blood but is not a fixed number, so the local value is required and none is defaulted. The thresholds are deliberately not the round numbers they resemble, protein being ${PROTEIN_THRESHOLD} rather than 3.0 and the LDH multiplier ${LDH_MULTIPLIER} rather than the two-thirds Light’s uses. The trade is specificity: about ${THREE_TEST_SENSITIVITY} percent sensitivity and about ${THREE_TEST_SPECIFICITY} percent specificity, against far higher specificity for Light’s criteria, so a positive result here is weaker evidence of an exudate. Diuretic treatment concentrates a transudate and can push either rule toward a false exudate. This classifies an effusion; it does NOT give the cause of either category. An exudate can be infection, malignancy, pulmonary embolism or many other things, and the classification is the beginning of the workup rather than the end. It does not indicate or contraindicate drainage, does not diagnose empyema or malignancy, and a transudative result does not exclude a coexisting exudative process.`;

function readNum(v, name, { min = 0 } = {}) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < min) throw new Error(`${name} must be a number that is ${min} or more.`);
  return n;
}

// input: pleuralLdh, serumLdhUln, pleuralCholesterol, pleuralProtein.
export function heffner(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let ldh, uln, chol, prot;
  try {
    ldh = readNum(o.pleuralLdh, 'Pleural fluid LDH');
    uln = readNum(o.serumLdhUln, 'Laboratory upper limit of normal for serum LDH', { min: 1 });
    chol = readNum(o.pleuralCholesterol, 'Pleural fluid cholesterol');
    prot = readNum(o.pleuralProtein, 'Pleural fluid protein');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if ([ldh, uln, chol, prot].some((x) => x === null)) {
    return { valid: false, message: `Enter the pleural fluid LDH, cholesterol and protein, and YOUR LABORATORY'S upper limit of normal for SERUM LDH. ${SERUM_NOTE}` };
  }

  const ldhCutoff = Number((LDH_MULTIPLIER * uln).toFixed(2));
  const results = {
    ldh: ldh > ldhCutoff,
    cholesterol: chol > CHOLESTEROL_THRESHOLD,
    protein: prot > PROTEIN_THRESHOLD,
  };
  const positives = TESTS.filter((t) => results[t.key]).map((t) => t.key);
  const threeTestExudate = positives.length > 0;
  const twoTestExudate = results.ldh || results.cholesterol;
  const rulesDisagree = threeTestExudate !== twoTestExudate;

  // For contrast only: the multiplier Light's criteria use against the same reference value.
  const lightsCutoff = Number((LIGHTS_LDH_MULTIPLIER * uln).toFixed(2));

  const parts = [];
  parts.push(`${threeTestExudate ? 'EXUDATE' : 'Transudate'} by the three-test rule${positives.length ? ` (positive: ${positives.join(', ')})` : ' (no test positive)'}. Any ONE test is enough; the tests do not vote.`);
  parts.push(`By the two-test rule, which drops the protein test: ${twoTestExudate ? 'EXUDATE' : 'transudate'}.`);
  if (rulesDisagree) {
    parts.push('THE TWO PUBLISHED RULES DISAGREE FOR THIS PATIENT: the protein test is the only positive one, so the three-test rule calls it an exudate and the two-test rule does not. Which rule a source means by "Heffner’s criteria" is often left unstated.');
  }
  parts.push(`The LDH cutoff used here is ${ldhCutoff} from your laboratory upper limit of ${uln}. ${SERUM_NOTE}`);
  parts.push(`For contrast, Light's criteria compare pleural LDH against two-thirds of the same reference value, which for your laboratory is ${lightsCutoff}. ${ROUNDING_NOTE}`);
  parts.push(TRADE_NOTE);
  parts.push(DIURETIC_NOTE);
  parts.push('This classifies the effusion and does not give the cause. An exudate can be infection, malignancy, pulmonary embolism or many other things. It does not indicate or contraindicate drainage.');

  return {
    valid: true,
    exudate: threeTestExudate,
    exudateByTwoTestRule: twoTestExudate,
    rulesDisagree,
    positiveTests: positives,
    ldhCutoffUsed: ldhCutoff,
    lightsLdhCutoffForContrast: lightsCutoff,
    testResults: results,
    band: threeTestExudate ? 'Exudate' : 'Transudate',
    bandLabel: `${threeTestExudate ? 'Exudate' : 'Transudate'} (three-test rule)`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
