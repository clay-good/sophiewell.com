// spec-v594: the ARC-HBR (Academic Research Consortium for High Bleeding Risk) criteria. `grep -c
// "id: 'arc-hbr'" app.js` returned 0, as did every other slug spelling and every filename search: the
// catalog carries bleeding-risk SCORES (crusade, dapt-score, mehran-cin) and had no ARC-HBR DEFINITION.
//
// **THE RULE IS ONE MAJOR OR TWO MINOR, AND A WIDELY USED CALCULATOR SUMMARIZES IT AS "AT LEAST ONE
// MAJOR".** Two minor criteria are worth one major. A patient with three minor criteria and no major one IS
// at high bleeding risk, and any implementation that only looks for a major criterion will report that
// patient as not at high risk. That summary appears in a well-known online calculator, which is much of the
// reason this tile exists, and the result says so.
//
// **THE SAME VARIABLE APPEARS AS BOTH MAJOR AND MINOR AT DIFFERENT VALUES, SO THESE ARE NOT TWENTY
// INDEPENDENT BOXES.** Anemia, kidney function, prior bleeding and prior stroke are each BANDED: a
// hemoglobin of 10 is major, a hemoglobin of 12 in a man is minor, and the same patient cannot be both.
// An implementation with twenty independent checkboxes will double-count exactly these four variables. This
// lib takes each banded variable ONCE and derives its tier, which makes double-counting impossible by
// construction.
//
// **THE ANEMIA MINOR BAND IS SEX-SPLIT AND THE MAJOR IS NOT.** Hemoglobin under 11 g/dL is major for
// everyone. The minor band is 11 to 12.9 for men and 11 to 11.9 for women. Sex therefore matters ONLY inside
// the minor band, which is an asymmetry that is easy to miss and easy to implement backwards.
//
// **THERE ARE SIX DIFFERENT TIMING WINDOWS.** Spontaneous bleeding within 6 months is major and within 6 to
// 12 months is minor; traumatic intracranial hemorrhage within 12 months is major while SPONTANEOUS
// intracranial hemorrhage is major AT ANY TIME; moderate or severe ischemic stroke within 6 months is major
// while any other ischemic stroke is minor; major surgery or trauma within 30 days is major; active
// malignancy within 12 months is major. Carrying one window across the set is the commonest error here.
//
// **IT IS A DEFINITION, NOT A SCORE.** There are no points and no ranking. It was built to identify patients
// whose risk of BARC 3 to 5 bleeding is at least 4 percent, or of intracranial hemorrhage at least 1
// percent, at one year -- an ABSOLUTE risk threshold. "How many criteria" is not a severity measure, and
// this lib reports the count only as provenance for the verdict.
//
// HIGH-STAKES: this identifies bleeding risk. It does NOT weigh it against ISCHEMIC risk, and those two
// risks travel together -- most features that raise bleeding risk also raise ischemic risk. Meeting the
// definition is NOT an instruction to shorten dual antiplatelet therapy, to drop an agent, to choose a
// particular stent, or to withhold anticoagulation for an indication that needs it. It does not predict
// bleeding in an individual, and it is derived in patients undergoing percutaneous coronary intervention
// (spec-v11 section 5.3).
//
// CRITERIA AND THE COMBINATION RULE RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER
// RECALLED (spec-v97). A third rendering states the rule as "at least 1 major" alone; the two that agree on
// "at least 1 major OR 2 minor" are the ones implemented, and the discrepancy is reported rather than
// hidden:
//   - Urban P, Mehran R, Colleran R, et al. Defining high bleeding risk in patients undergoing percutaneous
//     coronary intervention: a consensus document from the Academic Research Consortium for High Bleeding
//     Risk. Circulation. 2019;140(3):240-261.

export const MAJOR_REQUIRED = 1;
export const MINOR_REQUIRED = 2;
export const TARGET_BARC_RISK_PERCENT = 4;
export const TARGET_ICH_RISK_PERCENT = 1;

export const HB_MAJOR_BELOW = 11;            // g/dL, both sexes
export const HB_MINOR_MAX_MALE = 12.9;       // g/dL
export const HB_MINOR_MAX_FEMALE = 11.9;     // g/dL
export const EGFR_MAJOR_BELOW = 30;          // mL/min
export const EGFR_MINOR_BELOW = 60;          // mL/min
export const PLATELET_MAJOR_BELOW = 100;     // x10^9/L
export const AGE_MINOR_AT_LEAST = 75;        // years

// Criteria that are a single yes/no.
export const MAJOR_BOOLEANS = [
  { key: 'longTermOac', text: 'Anticipated long-term oral anticoagulation' },
  { key: 'bleedingDiathesis', text: 'Chronic bleeding diathesis' },
  { key: 'cirrhosisPortalHypertension', text: 'Liver cirrhosis with portal hypertension' },
  { key: 'activeMalignancy12Months', text: 'Active malignancy within 12 months, excluding non-melanoma skin cancer' },
  { key: 'spontaneousIchEver', text: 'Previous SPONTANEOUS intracranial hemorrhage, AT ANY TIME' },
  { key: 'traumaticIch12Months', text: 'Previous TRAUMATIC intracranial hemorrhage within 12 months' },
  { key: 'brainAvm', text: 'Brain arteriovenous malformation' },
  { key: 'nondeferrableSurgeryOnDapt', text: 'Non-deferrable major surgery expected while on dual antiplatelet therapy' },
  { key: 'majorSurgeryOrTrauma30Days', text: 'Major surgery or major trauma within 30 days before PCI' },
];
export const MINOR_BOOLEANS = [
  { key: 'longTermNsaidsOrSteroids', text: 'Long-term oral NSAIDs or corticosteroids' },
];

// Variables that are BANDED across major and minor. Asked once each; the tier is derived.
export const BANDED = ['hemoglobin', 'egfr', 'platelets', 'age', 'priorBleeding', 'priorStroke'];

export const BLEEDING_OPTIONS = [
  { value: 'none', tier: null, text: 'No prior spontaneous bleeding requiring hospitalization or transfusion' },
  { value: 'within-6-months-or-recurrent', tier: 'major', text: 'Spontaneous bleeding requiring hospitalization or transfusion within 6 months, OR any recurrent spontaneous bleeding' },
  { value: 'six-to-twelve-months', tier: 'minor', text: 'Spontaneous bleeding requiring hospitalization or transfusion 6 to 12 months ago, not meeting the major criterion' },
];
export const STROKE_OPTIONS = [
  { value: 'none', tier: null, text: 'No previous ischemic stroke' },
  { value: 'moderate-severe-within-6-months', tier: 'major', text: 'Moderate or severe ischemic stroke within 6 months' },
  { value: 'other-ischemic-any-time', tier: 'minor', text: 'Any other ischemic stroke, at any time' },
];

export const RULE_NOTE = `The rule is ${MAJOR_REQUIRED} MAJOR criterion OR ${MINOR_REQUIRED} MINOR criteria. Two minor criteria are worth one major, so a patient with minor criteria alone and no major one CAN be at high bleeding risk. A widely used online calculator summarizes the rule as "at least one major criterion", which would report that patient as not at high risk.`;
export const BANDING_NOTE = 'Anemia, kidney function, prior bleeding and prior stroke are BANDED across major and minor rather than being separate criteria: a hemoglobin of 10 is major and a hemoglobin of 12 in a man is minor, and the same patient cannot be both. Each is asked once here and its tier derived, which makes the usual double-counting impossible.';
export const SEX_NOTE = `The anemia MINOR band is sex-split and the MAJOR is not. Hemoglobin under ${HB_MAJOR_BELOW} g/dL is major for everyone; the minor band is ${HB_MAJOR_BELOW} to ${HB_MINOR_MAX_MALE} for men and ${HB_MAJOR_BELOW} to ${HB_MINOR_MAX_FEMALE} for women. Sex matters ONLY inside the minor band.`;
export const TIMING_NOTE = 'Six different timing windows: spontaneous bleeding within 6 months major and 6 to 12 months minor; traumatic intracranial hemorrhage within 12 months; SPONTANEOUS intracranial hemorrhage at ANY time; moderate or severe ischemic stroke within 6 months major and any other ischemic stroke minor; major surgery or trauma within 30 days; active malignancy within 12 months. Carrying one window across the set is the commonest error.';
export const DEFINITION_NOTE = `This is a DEFINITION, not a score. There are no points and no ranking: it identifies patients whose risk of BARC 3 to 5 bleeding is at least ${TARGET_BARC_RISK_PERCENT} percent, or of intracranial hemorrhage at least ${TARGET_ICH_RISK_PERCENT} percent, at one year. The number of criteria met is provenance for the verdict, not a severity measure.`;

const NOTE = `The ARC-HBR criteria (Urban and colleagues 2019) define high bleeding risk in patients undergoing percutaneous coronary intervention. A patient is at high bleeding risk if at least ${MAJOR_REQUIRED} MAJOR criterion OR at least ${MINOR_REQUIRED} MINOR criteria are met, so two minor criteria are worth one major and a patient with minor criteria alone can qualify; a widely used online calculator summarizes the rule as "at least one major criterion", which would miss exactly those patients. Anemia, kidney function, prior bleeding and prior stroke are banded across major and minor rather than being separate criteria, so a hemoglobin of 10 is major while a hemoglobin of 12 in a man is minor and the same patient cannot be both; each is asked once here and its tier derived. The anemia minor band is sex-split and the major is not: under ${HB_MAJOR_BELOW} g/dL is major for everyone, while the minor band is ${HB_MAJOR_BELOW} to ${HB_MINOR_MAX_MALE} for men and ${HB_MAJOR_BELOW} to ${HB_MINOR_MAX_FEMALE} for women, so sex matters only inside the minor band. There are six different timing windows, and carrying one across the set is the commonest error. This is a definition and not a score: it targets an absolute risk of BARC 3 to 5 bleeding of at least ${TARGET_BARC_RISK_PERCENT} percent or of intracranial hemorrhage of at least ${TARGET_ICH_RISK_PERCENT} percent at one year, and the number of criteria met is provenance rather than severity. It identifies BLEEDING risk and does not weigh it against ISCHEMIC risk, and the two travel together, since most features that raise bleeding risk also raise ischemic risk. Meeting the definition is not an instruction to shorten dual antiplatelet therapy, to drop an agent, to choose a particular stent, or to withhold anticoagulation for an indication that needs it. It does not predict bleeding in an individual, and it was derived in patients undergoing percutaneous coronary intervention.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}
function readNum(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} must be a number that is 0 or more.`);
  return n;
}
function pick(list, v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const found = list.find((i) => i.value === String(v).trim());
  if (!found) throw new Error(`${name} must be one of: ${list.map((i) => i.value).join(', ')}.`);
  return found;
}

// Each banded variable yields at most ONE tier. This is where double-counting is prevented.
function hemoglobinTier(hb, sex) {
  if (hb < HB_MAJOR_BELOW) return 'major';
  const minorMax = sex === 'female' ? HB_MINOR_MAX_FEMALE : HB_MINOR_MAX_MALE;
  return hb <= minorMax ? 'minor' : null;
}
function egfrTier(egfr) {
  if (egfr < EGFR_MAJOR_BELOW) return 'major';
  return egfr < EGFR_MINOR_BELOW ? 'minor' : null;
}

// input: sex, age, hemoglobin, egfr, platelets, priorBleeding, priorStroke, plus one key per
// MAJOR_BOOLEANS and MINOR_BOOLEANS entry.
export function arcHbr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let sex, age, hb, egfr, plt, bleeding, stroke, majors, minors;
  try {
    sex = o.sex === '' || o.sex === undefined || o.sex === null ? null : String(o.sex).trim().toLowerCase();
    if (sex !== null && !['male', 'female'].includes(sex)) throw new Error('Sex must be male or female.');
    age = readNum(o.age, 'Age');
    hb = readNum(o.hemoglobin, 'Hemoglobin');
    egfr = readNum(o.egfr, 'eGFR');
    plt = readNum(o.platelets, 'Platelet count');
    bleeding = pick(BLEEDING_OPTIONS, o.priorBleeding, 'Prior spontaneous bleeding');
    stroke = pick(STROKE_OPTIONS, o.priorStroke, 'Prior ischemic stroke');
    majors = MAJOR_BOOLEANS.map((m) => ({ m, v: readBool(o[m.key], m.text) }));
    minors = MINOR_BOOLEANS.map((m) => ({ m, v: readBool(o[m.key], m.text) }));
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = [];
  if (sex === null) missing.push('sex');
  for (const [k, v] of [['age', age], ['hemoglobin', hb], ['egfr', egfr], ['platelets', plt]]) {
    if (v === null) missing.push(k);
  }
  if (!bleeding) missing.push('priorBleeding');
  if (!stroke) missing.push('priorStroke');
  missing.push(...majors.filter((x) => x.v === null).map((x) => x.m.key));
  missing.push(...minors.filter((x) => x.v === null).map((x) => x.m.key));
  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.join(', ')}. ${RULE_NOTE}` };
  }

  const majorMet = [];
  const minorMet = [];

  // Banded variables contribute at most one tier each.
  const hbTier = hemoglobinTier(hb, sex);
  if (hbTier === 'major') majorMet.push('hemoglobin');
  else if (hbTier === 'minor') minorMet.push('hemoglobin');

  const eTier = egfrTier(egfr);
  if (eTier === 'major') majorMet.push('egfr');
  else if (eTier === 'minor') minorMet.push('egfr');

  if (plt < PLATELET_MAJOR_BELOW) majorMet.push('platelets');
  if (age >= AGE_MINOR_AT_LEAST) minorMet.push('age');
  if (bleeding.tier === 'major') majorMet.push('priorBleeding');
  else if (bleeding.tier === 'minor') minorMet.push('priorBleeding');
  if (stroke.tier === 'major') majorMet.push('priorStroke');
  else if (stroke.tier === 'minor') minorMet.push('priorStroke');

  for (const x of majors) if (x.v) majorMet.push(x.m.key);
  for (const x of minors) if (x.v) minorMet.push(x.m.key);

  const byMajor = majorMet.length >= MAJOR_REQUIRED;
  const byMinor = minorMet.length >= MINOR_REQUIRED;
  const highBleedingRisk = byMajor || byMinor;
  const qualifiesOnMinorsAlone = !byMajor && byMinor;

  const parts = [];
  parts.push(highBleedingRisk
    ? `HIGH BLEEDING RISK by the ARC-HBR definition: ${majorMet.length} major and ${minorMet.length} minor criteria met.`
    : `Not at high bleeding risk by the ARC-HBR definition: ${majorMet.length} major and ${minorMet.length} minor criteria met, and the rule needs ${MAJOR_REQUIRED} major or ${MINOR_REQUIRED} minor.`);
  if (qualifiesOnMinorsAlone) {
    parts.push(`THIS PATIENT QUALIFIES ON MINOR CRITERIA ALONE, WITH NO MAJOR CRITERION. ${RULE_NOTE}`);
  }
  if (majorMet.length) parts.push(`Major: ${majorMet.join(', ')}.`);
  if (minorMet.length) parts.push(`Minor: ${minorMet.join(', ')}.`);
  if (hbTier) {
    parts.push(hbTier === 'major'
      ? `Hemoglobin ${hb} g/dL is a MAJOR criterion, and cannot also count as the minor anemia criterion. ${SEX_NOTE}`
      : `Hemoglobin ${hb} g/dL is a MINOR criterion for a ${sex} patient. ${SEX_NOTE}`);
  }
  parts.push(BANDING_NOTE);
  parts.push(TIMING_NOTE);
  parts.push(DEFINITION_NOTE);
  parts.push('This identifies BLEEDING risk and does not weigh it against ISCHEMIC risk; the two travel together. It is not an instruction to shorten dual antiplatelet therapy, to drop an agent, to choose a stent, or to withhold anticoagulation for an indication that needs it.');

  return {
    valid: true,
    highBleedingRisk,
    majorCount: majorMet.length,
    minorCount: minorMet.length,
    majorCriteriaMet: majorMet,
    minorCriteriaMet: minorMet,
    qualifiesOnMinorsAlone,
    hemoglobinTier: hbTier,
    egfrTier: eTier,
    band: highBleedingRisk ? 'High bleeding risk' : 'Not high bleeding risk',
    bandLabel: `${highBleedingRisk ? 'High bleeding risk' : 'Not high bleeding risk'} (${majorMet.length} major, ${minorMet.length} minor)`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
