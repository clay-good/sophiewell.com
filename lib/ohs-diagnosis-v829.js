// spec-v829: obesity hypoventilation syndrome - the 2019 ATS clinical practice guideline
// definition, and its serum bicarbonate screening rule.
//
// Source:
//   Mokhlesi B, Masa JF, Brozek JL, et al. Evaluation and Management of Obesity
//   Hypoventilation Syndrome. An Official American Thoracic Society Clinical Practice
//   Guideline. Am J Respir Crit Care Med. 2019;200(3):e6-e24.
//
// THE DEFINITION - all four:
//   obesity, body mass index of 30 kg/m2 or more
//   sleep-disordered breathing
//   awake daytime hypercapnia, a resting PaCO2 of 45 mmHg or more AT SEA LEVEL
//   other causes of hypoventilation excluded
//
// THE SCREENING RULE, AND THE POPULATION IT BELONGS TO:
//   In patients with a LOW TO MODERATE probability of OHS - the guideline puts this at under
//   20%, giving a body mass index of 30 to 40 as its example - a serum bicarbonate below
//   27 mmol/L precludes the need for an arterial blood gas. At or above 27, measure the
//   PaCO2.
//
// THAT RULE HAS A STATED POPULATION AND IS ROUTINELY APPLIED OUTSIDE IT. In someone with a
// high pretest probability - a body mass index well above 40, or daytime somnolence with
// known severe sleep apnoea - a bicarbonate under 27 does NOT rule OHS out, and treating it
// as if it did skips the arterial gas in exactly the patient most likely to be hypercapnic.
// A screening threshold borrowed out of its population is not a screening threshold.
//
// AND BICARBONATE CANNOT DIAGNOSE OHS IN EITHER DIRECTION. A raised bicarbonate is a reason
// to measure the PaCO2, not a substitute for it.
//
// Pure: no DOM, no clock, no network.

export const OHS_NOTE = 'Obesity hypoventilation syndrome, as defined by the 2019 American Thoracic Society clinical practice guideline (Mokhlesi B, Masa JF, Brozek JL, et al, Am J Respir Crit Care Med 2019;200(3):e6-e24), is the combination of a body mass index of 30 kilograms per square metre or more, sleep-disordered breathing, an awake resting arterial carbon dioxide tension of 45 millimetres of mercury or more at sea level, and exclusion of other causes of hypoventilation. The guideline also offers a screening rule: in patients whose probability of the syndrome is low to moderate, which it puts at under twenty percent and illustrates with a body mass index between thirty and forty, a serum bicarbonate below 27 millimoles per litre removes the need for an arterial blood gas, while a value at or above 27 should prompt one. That rule carries its population with it and is routinely applied outside it. In someone with a high pretest probability, a bicarbonate under 27 does not rule the syndrome out, and treating it as though it did skips the arterial gas in exactly the patient most likely to be retaining carbon dioxide. Bicarbonate cannot make the diagnosis in either direction; a raised value is a reason to measure the carbon dioxide tension, not a substitute for measuring it. The carbon dioxide threshold is for an awake resting sample at sea level, so oximetry does not answer this question and altitude changes it. It applies published criteria to results already obtained and it does not start positive airway pressure or arrange a sleep study.';

export const BMI_THRESHOLD = 30;
export const PACO2_THRESHOLD = 45;     // mmHg, at or above, awake and resting, at sea level
export const BICARB_THRESHOLD = 27;    // mmol/L, at or above prompts a blood gas
export const LOW_PROB_BMI_MAX = 40;    // the guideline's own example of low-to-moderate probability

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ohsDiagnosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const bmi = num(o.bmi);
  const paco2 = num(o.paco2);
  const bicarb = num(o.bicarbonate);
  for (const [label, v, lo, hi] of [
    ['Body mass index', bmi, 5, 150],
    ['PaCO2', paco2, 5, 200],
    ['Serum bicarbonate', bicarb, 0, 80],
  ]) {
    if (v !== null && (v < lo || v > hi)) return { valid: false, message: `${label} is out of range (${lo} to ${hi}).` };
  }

  const obese = bmi !== null && bmi >= BMI_THRESHOLD;
  const sdb = truthy(o.sleepDisorderedBreathing);
  const hypercapnia = paco2 !== null && paco2 >= PACO2_THRESHOLD;
  const excluded = truthy(o.otherCausesExcluded);

  const diagnosis = obese && sdb && hypercapnia && excluded;

  // The screening rule, and whether this patient is in its population.
  const highProbability = truthy(o.highProbability) || (bmi !== null && bmi > LOW_PROB_BMI_MAX);
  let screening = null;
  let screeningNote = null;
  if (paco2 === null && bicarb !== null) {
    if (bicarb < BICARB_THRESHOLD) {
      if (highProbability) {
        screening = 'blood gas still indicated';
        screeningNote = `A serum bicarbonate of ${bicarb} mmol/L is below ${BICARB_THRESHOLD}, but the rule that lets that defer an arterial gas applies only where the probability of the syndrome is LOW TO MODERATE - the guideline's example is a body mass index of ${BMI_THRESHOLD} to ${LOW_PROB_BMI_MAX}. ${bmi !== null && bmi > LOW_PROB_BMI_MAX ? `A body mass index of ${bmi} is above that.` : 'A high pretest probability is recorded here.'} A low bicarbonate does not rule the syndrome out in this patient, and measuring the PaCO2 is still indicated.`;
      } else {
        screening = 'blood gas can be deferred';
        screeningNote = `A serum bicarbonate of ${bicarb} mmol/L is below ${BICARB_THRESHOLD} in a patient of low to moderate probability, which the guideline says removes the need for an arterial blood gas.`;
      }
    } else {
      screening = 'measure the PaCO2';
      screeningNote = `A serum bicarbonate of ${bicarb} mmol/L is at or above ${BICARB_THRESHOLD}, which should prompt measurement of the PaCO2. It is not itself a diagnosis - bicarbonate cannot establish or exclude the syndrome, only decide whether to measure the carbon dioxide.`;
    }
  }

  const missing = [];
  if (!obese) missing.push(`a body mass index of ${BMI_THRESHOLD} or more`);
  if (!sdb) missing.push('sleep-disordered breathing');
  if (!hypercapnia) missing.push(`an awake resting PaCO2 of ${PACO2_THRESHOLD} mmHg or more at sea level`);
  if (!excluded) missing.push('exclusion of other causes of hypoventilation');

  return {
    valid: true,
    diagnosis,
    criteria: { obesity: obese, sleepDisorderedBreathing: sdb, hypercapnia, exclusion: excluded },
    screening,
    screeningNote,
    highProbability,
    missing,
    abnormal: diagnosis,
    bandLabel: diagnosis ? 'Obesity hypoventilation syndrome criteria met' : 'Criteria not met',
    band: diagnosis
      ? `Obesity hypoventilation syndrome criteria met — body mass index ${bmi}, sleep-disordered breathing, awake PaCO2 ${paco2} mmHg, other causes excluded.`
      : `Obesity hypoventilation syndrome criteria not met — outstanding: ${missing.join('; ')}.`,
    detail: `All four are required: a body mass index of ${BMI_THRESHOLD} or more; sleep-disordered breathing; an awake resting PaCO2 of ${PACO2_THRESHOLD} mmHg or more at sea level; and exclusion of other causes. Serum bicarbonate is a screening step only, and its ${BICARB_THRESHOLD} mmol/L threshold belongs to patients of low to moderate probability.`,
    note: OHS_NOTE,
  };
}
