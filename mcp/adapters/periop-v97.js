// spec-v183 (wave 2): adapters for four lib/periop-v97.js perioperative-risk
// tiles. dom keys mirror views/group-v23.js and META.example.fields; arg names
// mirror the lib signatures. The shared procedure list is read from the lib's
// own SURGERY_OPTIONS so the enum can never drift from the model coefficients.
//
// pospom is not adapted in this wave: its comorbidity input is a variable-length
// array assembled from the lib's POSPOM_COMORBIDITIES list, which needs a bespoke
// toArgs rather than the flat field->arg mapping; deferred to a later wave.

import * as P from '../../lib/periop-v97.js';

const ASA = ['1', '2', '3', '4', '5'];
const FUNCTIONAL = ['independent', 'partial', 'total'];
const SURGERY = P.SURGERY_OPTIONS.map((o) => o.value);
const YESNO = ['no', 'yes'];

export default [
  {
    id: 'gupta-mica',
    summary: 'Gupta MICA: predicted 30-day risk of perioperative MI or cardiac arrest from age, ASA class, functional status, creatinine, and procedure.',
    compute: P.guptaMica,
    fields: [
      { dom: 'mica-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mica-asa', arg: 'asa', kind: 'enum', values: ASA, label: 'ASA physical status class' },
      { dom: 'mica-func', arg: 'functional', kind: 'enum', values: FUNCTIONAL, label: 'Functional status' },
      { dom: 'mica-creat', arg: 'creatinine', kind: 'enum', values: ['normal', 'elevated', 'unknown'], label: 'Serum creatinine' },
      { dom: 'mica-surg', arg: 'surgery', kind: 'enum', values: SURGERY, label: 'Procedure type' },
    ],
  },
  {
    id: 'gupta-respiratory-failure',
    summary: 'Gupta postoperative respiratory failure risk from ASA class, preoperative sepsis, functional status, emergency status, and procedure.',
    compute: P.guptaRespiratoryFailure,
    fields: [
      { dom: 'resp-asa', arg: 'asa', kind: 'enum', values: ASA, label: 'ASA physical status class' },
      { dom: 'resp-sepsis', arg: 'sepsis', kind: 'enum', values: ['none', 'sirs', 'sepsis', 'septic-shock'], label: 'Preoperative sepsis status' },
      { dom: 'resp-func', arg: 'functional', kind: 'enum', values: FUNCTIONAL, label: 'Functional status' },
      { dom: 'resp-emerg', arg: 'emergency', kind: 'enum', values: YESNO, label: 'Emergency case' },
      { dom: 'resp-surg', arg: 'surgery', kind: 'enum', values: SURGERY, label: 'Procedure type' },
    ],
  },
  {
    id: 'arozullah-pneumonia',
    summary: 'Arozullah postoperative pneumonia risk index: a point score from surgery type, age, function, BUN, and ten clinical risk flags mapped to a risk class.',
    compute: P.arozullahPneumonia,
    fields: [
      { dom: 'aroz-surg', arg: 'surgery', kind: 'enum', values: ['other', 'aaa', 'thoracic', 'upper-abdominal', 'neck', 'neurosurgery', 'vascular'], label: 'Type of surgery' },
      { dom: 'aroz-age', arg: 'age', kind: 'enum', values: ['under-50', '50-59', '60-69', '70-79', '80+'], label: 'Age band' },
      { dom: 'aroz-func', arg: 'functional', kind: 'enum', values: FUNCTIONAL, label: 'Functional status' },
      { dom: 'aroz-bun', arg: 'bun', kind: 'enum', values: ['under-8', '8-21', '22-30', 'over-30'], label: 'Blood urea nitrogen (BUN)' },
      { dom: 'aroz-weightloss', arg: 'weightLoss', kind: 'bool', label: 'Weight loss > 10% in 6 months (7)' },
      { dom: 'aroz-copd', arg: 'copd', kind: 'bool', label: 'History of COPD (5)' },
      { dom: 'aroz-ga', arg: 'generalAnesthesia', kind: 'bool', label: 'General anesthesia (4)' },
      { dom: 'aroz-sensorium', arg: 'sensorium', kind: 'bool', label: 'Impaired sensorium (4)' },
      { dom: 'aroz-cva', arg: 'cva', kind: 'bool', label: 'History of cerebrovascular accident (4)' },
      { dom: 'aroz-transfusion', arg: 'transfusion', kind: 'bool', label: 'Transfusion > 4 units (3)' },
      { dom: 'aroz-emergency', arg: 'emergency', kind: 'bool', label: 'Emergency surgery (3)' },
      { dom: 'aroz-steroids', arg: 'steroids', kind: 'bool', label: 'Chronic steroid use (3)' },
      { dom: 'aroz-smoker', arg: 'smoker', kind: 'bool', label: 'Current smoker within 1 year (3)' },
      { dom: 'aroz-alcohol', arg: 'alcohol', kind: 'bool', label: 'Alcohol > 2 drinks/day (2)' },
    ],
  },
  {
    id: 'el-ganzouri',
    summary: 'El-Ganzouri difficult-airway risk index (0-12): seven airway predictors mapped to the >= 4 difficult-laryngoscopy threshold.',
    compute: P.elGanzouri,
    fields: [
      { dom: 'eg-mouth', arg: 'mouth', kind: 'enum', values: ['ge-4', 'lt-4'], label: 'Mouth opening (interincisor gap)' },
      { dom: 'eg-thyro', arg: 'thyromental', kind: 'enum', values: ['gt-6.5', '6-6.5', 'lt-6'], label: 'Thyromental distance' },
      { dom: 'eg-mall', arg: 'mallampati', kind: 'enum', values: ['1', '2', '3', '4'], label: 'Mallampati class' },
      { dom: 'eg-neck', arg: 'neck', kind: 'enum', values: ['gt-90', '80-90', 'lt-80'], label: 'Neck movement (range of motion)' },
      { dom: 'eg-prog', arg: 'prognath', kind: 'enum', values: ['yes', 'no'], label: 'Ability to prognath (protrude jaw)' },
      { dom: 'eg-weight', arg: 'weight', kind: 'enum', values: ['under-90', '90-110', 'over-110'], label: 'Body weight' },
      { dom: 'eg-history', arg: 'history', kind: 'enum', values: ['none', 'questionable', 'definite'], label: 'History of difficult intubation' },
    ],
  },
];
