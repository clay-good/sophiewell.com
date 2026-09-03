// spec-v570: the New Global Definition of ARDS (2023/2024). A REVISED-SUCCESSOR GAP: the catalog already
// has `berlin-ards`, the 2012 Berlin definition, and this is its successor.
//
// WHAT THE SUCCESSOR ACTUALLY CHANGED. Berlin required intubation and an arterial blood gas. The global
// definition adds two whole categories that Berlin could not express -- a NONINTUBATED category on
// high-flow oxygen or noninvasive support, and a RESOURCE-LIMITED category needing neither a blood gas nor
// any positive pressure -- and it admits pulse oximetry and lung ultrasound as evidence.
//
// **NONINTUBATED ARDS HAS NO SEVERITY GRADING AT ALL.** Mild, moderate and severe exist ONLY for intubated
// ARDS. A nonintubated patient either has ARDS or does not; there is no such thing as "moderate
// nonintubated ARDS". A definition that grades one branch invites grading all of them, so this lib returns
// `severity: null` for the other branches and says why.
//
// **THE RESOURCE-LIMITED BRANCH IS A TERMINAL DEAD END, NOT A MILDER CATEGORY.** It requires NO positive
// end-expiratory pressure and NO minimum oxygen flow rate, accepts ONLY the oxygen-saturation ratio, and
// carries no severity grade. It is a different denominator rather than a lower rung: a patient meeting it
// has not been shown to be less sick, only to have been assessed with fewer resources.
//
// **THE SATURATION RATIO IS INVALID ABOVE AN OXYGEN SATURATION OF 97 PERCENT, AND THAT IS A GATE RATHER
// THAN A CAVEAT.** Above 97 percent the saturation is on the flat part of the dissociation curve and the
// ratio no longer tracks oxygenation, so it cannot be used at all. A tile that computed it anyway would
// return a confident number from a measurement the source excludes. This lib refuses.
//
// **EVERY INTUBATED SEVERITY CATEGORY REQUIRES A MINIMUM PEEP OF 5 cm H2O.** Severity is not read off the
// ratio alone: without that PEEP the intubated categories do not apply. And the nonintubated category has
// its own support floor -- high-flow nasal oxygen at 30 L/min or more, or noninvasive ventilation or CPAP
// with at least 5 cm H2O end-expiratory pressure.
//
// TWO CORRECTIONS THE SOURCE SPECIFIES AND THIS LIB CARRIES RATHER THAN HIDING. Estimated inspired oxygen
// fraction on nasal flow is ambient plus 0.03 times the flow rate in litres per minute. And above 1,000
// metres altitude the ratio is multiplied by barometric pressure over 760.
//
// PATIENTS MOVE BETWEEN CATEGORIES DURING THEIR ILLNESS, which the source states explicitly. A severity
// grade is a description of one moment, not a label attached to the admission.
//
// HIGH-STAKES: this is a DEFINITION for identifying a syndrome, not a severity score and not a prognostic
// model. It does NOT identify the cause, which is what gets treated -- pneumonia, aspiration, pancreatitis,
// transfusion and trauma all produce it and diverge sharply in management. It does not exclude
// cardiogenic pulmonary edema, which is a clinical judgment the definition requires the user to have
// already made. It does not indicate intubation, prone positioning, neuromuscular blockade or
// extracorporeal support, and meeting a severity category is not by itself an indication for any of them
// (spec-v11 section 5.3). The clinical decision stays with the intensivist.
//
// CRITERIA AND THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the published table and
// verified against an independent rendering of the same table with correct inequality glyphs:
//   - Matthay MA, Arabi Y, Arroliga AC, et al. A New Global Definition of Acute Respiratory Distress
//     Syndrome. Am J Respir Crit Care Med. 2024;209(1):37-47.

export const ARDS_SETTINGS = [
  {
    value: 'nonintubated',
    label: 'Nonintubated',
    graded: false,
    text: 'On high-flow nasal oxygen at 30 L/min or more, or noninvasive ventilation or CPAP with at least 5 cm H2O end-expiratory pressure.',
  },
  {
    value: 'intubated',
    label: 'Intubated',
    graded: true,
    text: 'Invasively ventilated. A minimum PEEP of 5 cm H2O is required for every severity category.',
  },
  {
    value: 'resource-limited',
    label: 'Resource-limited setting',
    graded: false,
    text: 'Neither positive end-expiratory pressure nor a minimum oxygen flow rate is required, and only the saturation ratio is used.',
  },
];

export const RATIO_TYPES = [
  { value: 'pf', label: 'PaO2:FiO2', unit: 'mmHg' },
  { value: 'sf', label: 'SpO2:FiO2', unit: 'ratio' },
];

export const SPO2_VALIDITY_CEILING = 97;
export const MIN_PEEP = 5;
export const MIN_HFNO_FLOW = 30;
export const ALTITUDE_CORRECTION_THRESHOLD = 1000; // meters

// Intubated only. Upper bounds are inclusive; the next category starts strictly above.
const INTUBATED_SEVERITY = {
  pf: [
    { upTo: 100, label: 'Severe' },
    { upTo: 200, label: 'Moderate' },
    { upTo: 300, label: 'Mild' },
  ],
  sf: [
    { upTo: 148, label: 'Severe' },
    { upTo: 235, label: 'Moderate' },
    { upTo: 315, label: 'Mild' },
  ],
};

// The ceiling above which the ratio does not meet ARDS criteria at all.
const ARDS_CEILING = { pf: 300, sf: 315 };

export const FIO2_ESTIMATE = 'Estimated FiO2 on nasal flow is ambient FiO2 (about 0.21) plus 0.03 times the oxygen flow rate in L/min.';
export const ALTITUDE_CORRECTION = `Above ${ALTITUDE_CORRECTION_THRESHOLD} m altitude, multiply the ratio by barometric pressure divided by 760.`;

const NO_GRADING_TEXT = 'This category has NO severity grading. Mild, moderate and severe exist ONLY for intubated ARDS: a patient here either meets the definition or does not.';

const RESOURCE_LIMITED_TEXT = 'The resource-limited category is a different denominator, not a milder rung: it requires no positive end-expiratory pressure and no minimum oxygen flow, and a patient meeting it has not been shown to be less sick, only to have been assessed with fewer resources.';

const SPO2_GATE = `The saturation ratio is not valid when the oxygen saturation is above ${SPO2_VALIDITY_CEILING} percent, because the saturation is then on the flat part of the dissociation curve and the ratio no longer tracks oxygenation. It cannot be used at all above that value.`;

const MOVES_TEXT = 'Patients move between categories during their illness, so a severity grade describes one moment rather than labelling the admission.';

const NOTE = 'The New Global Definition of ARDS (Matthay and colleagues 2024) succeeds the 2012 Berlin definition and adds two categories Berlin could not express: a nonintubated category on high-flow nasal oxygen at 30 L/min or more or on noninvasive ventilation or CPAP with at least 5 cm H2O end-expiratory pressure, and a resource-limited category requiring neither an arterial blood gas nor any positive pressure. It also admits pulse oximetry and lung ultrasound as evidence. Criteria applying to every category are an acute predisposing risk factor such as pneumonia, nonpulmonary infection, trauma, transfusion, aspiration or shock; edema not exclusively or primarily attributable to cardiogenic pulmonary edema or fluid overload, and hypoxemia not primarily attributable to atelectasis; onset or worsening within one week of the risk factor or of new or worsening respiratory symptoms; and bilateral opacities on radiography or computed tomography, or bilateral B lines or consolidations on ultrasound, not fully explained by effusions, atelectasis or nodules. Nonintubated ARDS has no severity grading at all: mild, moderate and severe exist only for intubated ARDS, where mild is a PaO2 to FiO2 ratio above 200 and up to 300 or a SpO2 to FiO2 ratio above 235 and up to 315, moderate is above 100 up to 200 or above 148 up to 235, and severe is 100 or below or 148 or below. Every intubated severity category requires a minimum PEEP of 5 cm H2O. The resource-limited category is a terminal branch and a different denominator rather than a milder rung, since it requires no positive end-expiratory pressure and no minimum oxygen flow and carries no severity grade. The saturation ratio is invalid when the oxygen saturation is above 97 percent, because the saturation then sits on the flat part of the dissociation curve and the ratio no longer tracks oxygenation, and pulse oximetry is not recommended at all when a hemoglobin abnormality such as methemoglobinemia or carboxyhemoglobinemia is suspected. Estimated inspired oxygen fraction on nasal flow is ambient plus 0.03 times the flow rate in liters per minute, and above 1,000 meters the ratio is multiplied by barometric pressure over 760. Patients move between categories during their illness, so a severity grade describes one moment rather than the admission. This is a definition for identifying a syndrome, not a severity score and not a prognostic model. It does not identify the cause, which is what gets treated, and pneumonia, aspiration, pancreatitis, transfusion and trauma all produce it while diverging sharply in management. It does not exclude cardiogenic pulmonary edema, which is a clinical judgment the definition requires the user to have already made. It does not indicate intubation, prone positioning, neuromuscular blockade or extracorporeal support, and meeting a severity category is not by itself an indication for any of them.';

const COMMON_CRITERIA = [
  { key: 'riskFactor', text: 'An acute predisposing risk factor is present (pneumonia, nonpulmonary infection, trauma, transfusion, burn, aspiration, or shock)' },
  { key: 'notCardiogenic', text: 'Edema is not exclusively or primarily attributable to cardiogenic pulmonary edema or fluid overload, and hypoxemia is not primarily attributable to atelectasis' },
  { key: 'timing', text: 'Onset or worsening of hypoxemic respiratory failure within 1 week of the risk factor or of new or worsening respiratory symptoms' },
  { key: 'imaging', text: 'Bilateral opacities on radiography or CT, or bilateral B lines and/or consolidations on ultrasound, not fully explained by effusions, atelectasis, or nodules/masses' },
];

export { COMMON_CRITERIA };

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

export function globalArds(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const setting = ARDS_SETTINGS.find((s) => s.value === String(o.setting || '').trim().toLowerCase());
  if (!setting) {
    return { valid: false, message: `Choose the setting: ${ARDS_SETTINGS.map((s) => s.value).join(', ')}. Severity grading exists only for the intubated category.` };
  }

  const criteria = {};
  for (const c of COMMON_CRITERIA) {
    const v = readBool(o[c.key]);
    if (v === null) {
      return { valid: false, message: `Answer every criterion that applies to all ARDS categories. Still needed: ${c.key}.` };
    }
    if (Number.isNaN(v)) {
      return { valid: false, message: `Each criterion must be yes or no. Unrecognized: ${c.key}.` };
    }
    criteria[c.key] = v;
  }

  const ratioType = RATIO_TYPES.find((r) => r.value === String(o.ratioType || '').trim().toLowerCase());
  if (!ratioType) {
    return { valid: false, message: 'Choose the oxygenation ratio: PaO2:FiO2 or SpO2:FiO2.' };
  }
  if (setting.value === 'resource-limited' && ratioType.value !== 'sf') {
    return { valid: false, message: 'The resource-limited category uses the SpO2:FiO2 ratio only, because it does not assume an arterial blood gas is available.' };
  }

  const rawRatio = o.ratioValue;
  if (rawRatio === '' || rawRatio === null || rawRatio === undefined) {
    return { valid: false, message: 'Enter the oxygenation ratio value.' };
  }
  const ratio = Number(String(rawRatio).trim());
  if (!Number.isFinite(ratio) || ratio <= 0 || ratio > 1000) {
    return { valid: false, message: 'The oxygenation ratio must be a positive number.' };
  }

  // The saturation ratio is gated on SpO2, not merely caveated.
  let spo2 = null;
  if (ratioType.value === 'sf') {
    const rawSpo2 = o.spo2;
    if (rawSpo2 === '' || rawSpo2 === null || rawSpo2 === undefined) {
      return { valid: false, message: `Enter the oxygen saturation. ${SPO2_GATE}` };
    }
    spo2 = Number(String(rawSpo2).trim());
    if (!Number.isFinite(spo2) || spo2 <= 0 || spo2 > 100) {
      return { valid: false, message: 'The oxygen saturation must be a percentage between 0 and 100.' };
    }
    if (spo2 > SPO2_VALIDITY_CEILING) {
      return {
        valid: true,
        applicable: false,
        setting: setting.value,
        meetsDefinition: null,
        severity: null,
        bandLabel: 'Saturation ratio not valid',
        bandText: `${SPO2_GATE} No assessment is made from this measurement. Use an arterial blood gas, or repeat once the saturation is at or below ${SPO2_VALIDITY_CEILING} percent.`,
        note: NOTE,
      };
    }
  }

  // Support floors.
  let supportMet = true;
  let supportText = '';
  if (setting.value === 'intubated') {
    const peep = readBool(o.peepAtLeast5);
    if (peep === null) return { valid: false, message: `Say whether the PEEP is at least ${MIN_PEEP} cm H2O. Every intubated severity category requires it.` };
    if (Number.isNaN(peep)) return { valid: false, message: 'The PEEP answer must be yes or no.' };
    supportMet = peep;
    supportText = peep
      ? `PEEP of at least ${MIN_PEEP} cm H2O, as every intubated severity category requires.`
      : `A minimum PEEP of ${MIN_PEEP} cm H2O is required for every intubated severity category, and it is not met, so no intubated severity category applies.`;
  } else if (setting.value === 'nonintubated') {
    const support = readBool(o.nonintubatedSupport);
    if (support === null) return { valid: false, message: `Say whether the patient is on high-flow nasal oxygen at ${MIN_HFNO_FLOW} L/min or more, or on noninvasive ventilation or CPAP with at least ${MIN_PEEP} cm H2O end-expiratory pressure.` };
    if (Number.isNaN(support)) return { valid: false, message: 'The respiratory support answer must be yes or no.' };
    supportMet = support;
    supportText = support
      ? `On qualifying noninvasive support: high-flow nasal oxygen at ${MIN_HFNO_FLOW} L/min or more, or noninvasive ventilation or CPAP with at least ${MIN_PEEP} cm H2O.`
      : `The nonintubated category requires high-flow nasal oxygen at ${MIN_HFNO_FLOW} L/min or more, or noninvasive ventilation or CPAP with at least ${MIN_PEEP} cm H2O end-expiratory pressure, and that is not met.`;
  } else {
    supportText = RESOURCE_LIMITED_TEXT;
  }

  const commonMet = COMMON_CRITERIA.every((c) => criteria[c.key]);
  const oxygenationMet = ratio <= ARDS_CEILING[ratioType.value];
  const meetsDefinition = commonMet && oxygenationMet && supportMet;

  let severity = null;
  if (meetsDefinition && setting.graded) {
    severity = INTUBATED_SEVERITY[ratioType.value].find((s) => ratio <= s.upTo).label;
  }

  const failures = [];
  if (!commonMet) failures.push('the criteria that apply to all categories are not all met');
  if (!oxygenationMet) failures.push(`the ${ratioType.label} of ${ratio} is above the ceiling of ${ARDS_CEILING[ratioType.value]}`);
  if (!supportMet) failures.push('the respiratory support requirement for this category is not met');

  return {
    valid: true,
    applicable: true,
    setting: setting.value,
    settingLabel: setting.label,
    graded: setting.graded,
    ratioType: ratioType.value,
    ratioValue: ratio,
    spo2,
    meetsDefinition,
    severity,
    failures,
    bandLabel: meetsDefinition
      ? `ARDS by the global definition${severity ? `, ${severity.toLowerCase()}` : ''} (${setting.label.toLowerCase()})`
      : `Does not meet the global definition (${setting.label.toLowerCase()})`,
    bandText: meetsDefinition
      ? `Meets the New Global Definition of ARDS in the ${setting.label.toLowerCase()} category${severity ? `, severity ${severity.toLowerCase()}` : ''}. ${supportText} ${setting.graded ? MOVES_TEXT : NO_GRADING_TEXT}${setting.value === 'resource-limited' ? ` ${RESOURCE_LIMITED_TEXT}` : ''} ${FIO2_ESTIMATE} ${ALTITUDE_CORRECTION} This is a definition, not a severity score or a prognostic model, and it does not identify the cause or indicate any intervention.`
      : `Does not meet the New Global Definition of ARDS in the ${setting.label.toLowerCase()} category, because ${failures.join('; ')}. ${supportText} ${FIO2_ESTIMATE} ${ALTITUDE_CORRECTION}`,
    note: NOTE,
  };
}
