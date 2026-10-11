// spec-v1634 tool 10: AT-HARM10, the assessment tool for identifying hospital admissions related to
// medications.
//
// Source: Kempen TGH, Hedstrom M, Olsson H, et al. Assessment tool for hospital admissions related
// to medications: development and validation in older patients. Int J Clin Pharm 2019;41(1):198-206
// (PMC6394508, CC BY 4.0), Table 1 and the supplementary instructions for use, both re-read on
// October 11, 2026. The question wording is the paper's, used with attribution.
//   - Questions U1 to U3 identify admissions unlikely to be medication-related; P4 to P10 identify
//     possibly medication-related admissions. "The assessment is finished as soon as the answer
//     'Yes' is given for any question."
//   - All ten answered no: the instructions disagree with themselves. The form's note says the
//     admission "should be classified as P (possibly medication-related)" because the tool "has not
//     been able to rule out that the admission is medication-related"; the instructions' text says
//     "the assessment is still indecisive and needs to be examined by an expert panel". Both are
//     reported.
//   - Validity against an expert panel (Table 5 and abstract): sensitivity 70% and 86%, specificity
//     74% and 70%, for the two assessor groups. (One sentence in the Results transposes the two
//     specificities; the table and abstract agree with each other.)
//
// Pure: no DOM, no clock, no network.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const QUESTIONS = [
  { arg: 'u1', code: 'U1', text: 'Was the admission caused by an infection or a previously undiagnosed disease (e.g. diabetes or heart failure) that is not medication-related?' },
  { arg: 'u2', code: 'U2', text: 'Was the admission caused by progression of a previously diagnosed disease that is not medication-related?' },
  { arg: 'u3', code: 'U3', text: 'Was the admission caused by physical trauma, substance intoxication, social circumstances or allergies that are not medication-related?' },
  { arg: 'p4', code: 'P4', text: 'Is it hinted or stated in the medical record that the admission was medication-related (including non-compliance)?' },
  { arg: 'p5', code: 'P5', text: 'Might (side) effects of the medications the patient was taking (prescribed or not prescribed) prior to hospitalization have caused the admission (including over-treatment)?' },
  { arg: 'p6', code: 'P6', text: 'Are there abnormal laboratory results or vital signs that could be medication-related and might have caused the admission?' },
  { arg: 'p7', code: 'P7', text: 'Was there any drug-drug interaction or drug-disease interaction (i.e. a contraindication) that might have caused the admission?' },
  { arg: 'p8', code: 'P8', text: 'Did the patient have any previously diagnosed untreated or sub-optimally treated (e.g. dose too low) indications that might have caused the admission?' },
  { arg: 'p9', code: 'P9', text: 'Was the patient admitted because of a problem with the dosage form or pharmaceutical formulation (i.e. failure to receive the medication)?' },
  { arg: 'p10', code: 'P10', text: 'Is the cause of the admission a response to cessation or withdrawal of medication therapy?' },
];
// Short names for an example row or an agent's field list; the full question is on screen.
export const SHORT = { u1: 'U1 infection or new disease, not medication-related', u2: 'U2 progression of known disease, not medication-related', u3: 'U3 trauma, intoxication, social or allergy, not medication-related', p4: 'P4 record hints at a medication cause', p5: 'P5 side effects may have caused it', p6: 'P6 abnormal laboratory values or vital signs', p7: 'P7 interaction or contraindication', p8: 'P8 untreated or under-treated indication', p9: 'P9 dosage form problem', p10: 'P10 cessation or withdrawal' };
const VALIDITY = 'Against an expert panel, the paper reports sensitivity 70% and 86% and specificity 74% and 70% for its two assessor groups.';
const NOTE = 'A screening classification for research and audit: "possibly" means a medication cause could not be excluded, not that one was shown, and the tool does not judge whether the admission was preventable. It was validated in older patients, with final-year and postgraduate pharmacy students as assessors.';

export function atHarm10(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cite = 'Kempen TGH, et al. Int J Clin Pharm 2019;41:198-206 (CC BY 4.0).';
  for (const q of QUESTIONS) {
    const a = String(o[q.arg] ?? '').trim();
    if (a !== 'yes' && a !== 'no') return { valid: false, message: `Choose yes or no for ${q.code}: ${q.text} The questions are answered in order, and the first yes ends the assessment.` };
    if (a === 'yes') {
      const unlikely = q.code.startsWith('U');
      return {
        valid: true, flag: unlikely ? 'unlikely' : 'possibly', abnormal: !unlikely, classification: unlikely ? 'U' : 'P', decidedBy: q.code,
        band: `${unlikely ? 'Unlikely to be medication-related' : 'Possibly medication-related'}: decided by a yes at ${q.code}.`,
        bandLabel: unlikely ? 'Unlikely (U)' : 'Possibly (P)',
        notes: [`${q.code}: ${q.text} Yes. The assessment ends at the first yes; later questions are not used.`, VALIDITY, cite], note: NOTE,
      };
    }
  }
  return {
    valid: true, flag: 'all-no', abnormal: true, classification: 'P', decidedBy: null,
    band: 'All ten questions answered no: the form classifies the admission as possibly medication-related, because a medication cause has not been ruled out.',
    bandLabel: 'Possibly (P), all no',
    notes: ['The instructions disagree with themselves here. The form says to classify the admission as possibly medication-related; the instructions\' text says the assessment "is still indecisive and needs to be examined by an expert panel". Both are given.', VALIDITY, cite], note: NOTE,
  };
}
