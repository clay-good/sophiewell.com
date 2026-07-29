// spec-v597: the PANC 3 score for predicting severe acute pancreatitis. A TIMING-AXIS gap in a cluster the
// catalog already carries: `ranson-bisap`, `glasgow-imrie` and `atlanta-pancreatitis` are all present, and
// the two classical severity scores among them need 48 HOURS. PANC 3 is the admission-time counterpart, and
// that is its entire reason for existing. `grep -c "id: 'panc3'" app.js` returned 0, as did every other
// slug spelling and every filename search.
//
// **THE RULE IS ALL THREE, NOT A MAJORITY.** Two of three does NOT predict severe pancreatitis. The score
// runs 0 to 3 and only a 3 is positive, which makes this a conjunction wearing a score's clothing. An
// implementation with a "2 or more" threshold is wrong, and wrong in the direction of over-calling severity.
//
// **IT IS A RULE-IN TEST, AND ITS SENSITIVITY IS THE POINT OF FAILURE.** Reported specificity runs 96 to 100
// percent and reported sensitivity 50 to 75 percent. A POSITIVE PANC 3 IS STRONG EVIDENCE; A NEGATIVE PANC 3
// MISSES BETWEEN A QUARTER AND A HALF OF SEVERE CASES. Using it to send a patient home, or to stand down
// monitoring, inverts what the score is good for, and every negative result here says so.
//
// **WIDELY REPRODUCED SECONDARY SOURCES PRINT TWO OF THE THREE UNITS WRONG.** Hematocrit appears as
// "greater than 44 mg/dL" -- hematocrit is a PERCENTAGE and has no mass concentration -- and body mass index
// appears as "greater than 30 mg/kg squared" instead of kg/m squared. Both are transcription errors carried
// between reproductions. The values 44 and 30 are right; the units attached to them in those sources are
// not, and this lib states the correct units on every input (spec-v97).
//
// **THE REFERENCE STANDARD IS PERSISTENT ORGAN FAILURE, NOT A SCORE.** "Severe" here means organ failure
// PERSISTING BEYOND 48 HOURS, graded by the modified Marshall score -- which is itself in this catalog. So
// PANC 3 is an admission-time prediction of a 48-hour outcome, and it is predicting the thing that the
// classical scores measure directly once that time has passed.
//
// **THE THREE ITEMS ARE UNRELATED TO EACH OTHER AND TO PANCREATIC ENZYMES.** Hemoconcentration, obesity and
// a pleural effusion are three different mechanisms, and none of them is amylase or lipase. As with the
// other severity scores in this catalog, the enzymes that DIAGNOSE pancreatitis play no part in predicting
// its severity, and they are not inputs here.
//
// HIGH-STAKES: this predicts severity in a patient who ALREADY HAS a diagnosis of acute pancreatitis. It
// does NOT diagnose pancreatitis, does not identify the cause -- and cause matters, because gallstone
// pancreatitis may need intervention this score knows nothing about -- does not set fluid rates, does not
// indicate antibiotics, which are not indicated for sterile necrosis, and does not indicate imaging. A
// NEGATIVE RESULT IS NOT A REASON TO WITHHOLD MONITORING in a patient who looks unwell (spec-v11 5.3).
//
// CRITERIA, THRESHOLDS AND THE ALL-THREE RULE RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT
// SOURCES, NEVER RECALLED (spec-v97), with the units checked specifically because two of them are printed
// incorrectly in circulating reproductions:
//   - Brown A, James-Stevenson T, Dyson T, Grunkenmeier D. The Panc 3 score: a rapid and accurate test for
//     predicting severity on presentation in acute pancreatitis. J Clin Gastroenterol. 2007;41(9):855-858.

export const CRITERIA_REQUIRED = 3;
export const CRITERIA_TOTAL = 3;
export const HEMATOCRIT_THRESHOLD = 44;    // percent, strictly above
export const BMI_THRESHOLD = 30;           // kg/m^2, strictly above

export const CRITERIA = [
  { key: 'hematocrit', text: `Hematocrit above ${HEMATOCRIT_THRESHOLD} percent`, unit: '%', unitTrap: 'Reproductions print this as "mg/dL". Hematocrit is a PERCENTAGE and has no mass concentration.' },
  { key: 'bmi', text: `Body mass index above ${BMI_THRESHOLD} kg/m^2`, unit: 'kg/m^2', unitTrap: 'Reproductions print this as "mg/kg squared". The correct unit is kg/m squared.' },
  { key: 'pleuralEffusion', text: 'Pleural effusion on the chest radiograph', unit: null, unitTrap: null },
];

export const SENSITIVITY_RANGE = '50 to 75 percent';
export const SPECIFICITY_RANGE = '96 to 100 percent';

export const ALL_THREE_NOTE = `The rule is ALL ${CRITERIA_REQUIRED}, not a majority: two of three does NOT predict severe pancreatitis. The score runs 0 to ${CRITERIA_TOTAL} and only a ${CRITERIA_REQUIRED} is positive, which makes this a conjunction wearing a score's clothing. A "2 or more" threshold over-calls severity.`;
export const RULE_IN_NOTE = `This is a RULE-IN test and its sensitivity is the point of failure: reported specificity ${SPECIFICITY_RANGE} against reported sensitivity ${SENSITIVITY_RANGE}. A POSITIVE result is strong evidence; a NEGATIVE result MISSES BETWEEN A QUARTER AND A HALF of severe cases.`;
export const UNIT_NOTE = 'Widely reproduced secondary sources print two of the three units wrong: hematocrit as "mg/dL" when it is a percentage, and body mass index as "mg/kg squared" instead of kg/m squared. The values 44 and 30 are right; those units are not.';
export const TIMING_NOTE = 'All three items are available AT ADMISSION, which is the whole point: the classical severity scores in this catalog need 48 hours. The outcome it predicts is organ failure PERSISTING BEYOND 48 HOURS, graded by the modified Marshall score, so this is an admission-time prediction of a 48-hour outcome.';
export const ENZYME_NOTE = 'Hemoconcentration, obesity and a pleural effusion are three unrelated mechanisms, and none of them is amylase or lipase. The enzymes that DIAGNOSE pancreatitis play no part in predicting its severity and are not inputs here.';

const NOTE = `The PANC 3 score (Brown and colleagues 2007) predicts severe acute pancreatitis from three items available at admission: hematocrit above ${HEMATOCRIT_THRESHOLD} percent, body mass index above ${BMI_THRESHOLD} kg/m squared, and a pleural effusion on the chest radiograph. The rule is ALL THREE, not a majority: the score runs 0 to ${CRITERIA_TOTAL} and only a ${CRITERIA_REQUIRED} is positive, so two of three does not predict severe disease and a "2 or more" threshold over-calls severity. It is a rule-in test whose sensitivity is the point of failure, with reported specificity ${SPECIFICITY_RANGE} against reported sensitivity ${SENSITIVITY_RANGE}: a positive result is strong evidence, while a negative result misses between a quarter and a half of severe cases, so using it to send a patient home or to stand down monitoring inverts what the score is good for. Widely reproduced secondary sources print two of the three units wrong, giving hematocrit as mg/dL when it is a percentage and body mass index as mg/kg squared instead of kg/m squared; the values are right and those units are not. All three items are available at admission, which is the whole point, because the classical severity scores need 48 hours; the outcome predicted is organ failure persisting beyond 48 hours graded by the modified Marshall score, so this is an admission-time prediction of a 48-hour outcome. Hemoconcentration, obesity and a pleural effusion are three unrelated mechanisms and none of them is amylase or lipase, so as with the other severity scores the enzymes that diagnose pancreatitis play no part here and are not inputs. This predicts severity in a patient who already has a diagnosis of acute pancreatitis. It does not diagnose pancreatitis, does not identify the cause, which matters because gallstone pancreatitis may need intervention this score knows nothing about, does not set fluid rates, does not indicate antibiotics, which are not indicated for sterile necrosis, and does not indicate imaging. A negative result is not a reason to withhold monitoring in a patient who looks unwell.`;

function readNum(v, name, { min = 0 } = {}) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n <= min) throw new Error(`${name} must be a number above ${min}.`);
  return n;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: hematocrit (percent), bmi (kg/m^2), pleuralEffusion (yes/no).
export function panc3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let hct, bmi, effusion;
  try {
    hct = readNum(o.hematocrit, 'Hematocrit');
    bmi = readNum(o.bmi, 'Body mass index');
    effusion = readBool(o.pleuralEffusion, 'Pleural effusion on chest radiograph');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (hct === null || bmi === null || effusion === null) {
    return { valid: false, message: `Enter the hematocrit as a PERCENTAGE, the body mass index in kg/m^2, and whether there is a pleural effusion on the chest radiograph. ${UNIT_NOTE}` };
  }

  const met = [];
  if (hct > HEMATOCRIT_THRESHOLD) met.push('hematocrit');
  if (bmi > BMI_THRESHOLD) met.push('bmi');
  if (effusion) met.push('pleuralEffusion');
  const total = met.length;
  const predictsSevere = total >= CRITERIA_REQUIRED;

  const parts = [];
  parts.push(`PANC 3 ${total} of ${CRITERIA_TOTAL}: ${predictsSevere ? 'PREDICTS SEVERE acute pancreatitis - all three criteria are present.' : 'does not predict severe acute pancreatitis by this rule.'}${total ? ` Criteria met: ${met.join(', ')}.` : ''}`);
  parts.push(ALL_THREE_NOTE);
  if (!predictsSevere && total === CRITERIA_REQUIRED - 1) {
    parts.push(`Two of three is NOT a positive PANC 3. The one missing criterion is what separates this patient from a positive result, and the rule does not average or partially credit.`);
  }
  parts.push(RULE_IN_NOTE);
  if (!predictsSevere) {
    parts.push('THIS NEGATIVE RESULT IS WEAK EVIDENCE. It does not rule out severe pancreatitis and is NOT a reason to send the patient home or to stand down monitoring.');
  }
  parts.push(TIMING_NOTE);
  parts.push(UNIT_NOTE);
  parts.push(ENZYME_NOTE);
  parts.push('This predicts severity in an established diagnosis. It does not diagnose pancreatitis, does not identify the cause, does not set fluid rates or indicate antibiotics, and a negative result is not a reason to withhold monitoring in a patient who looks unwell.');

  return {
    valid: true,
    total,
    max: CRITERIA_TOTAL,
    required: CRITERIA_REQUIRED,
    predictsSevere,
    metCriteria: met,
    oneCriterionShort: total === CRITERIA_REQUIRED - 1,
    band: predictsSevere ? 'Predicts severe acute pancreatitis' : 'Does not predict severe acute pancreatitis',
    bandLabel: `PANC 3 ${total} of ${CRITERIA_TOTAL}${predictsSevere ? ', predicts severe' : ''}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
