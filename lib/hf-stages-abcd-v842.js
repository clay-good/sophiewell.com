// spec-v842: the ACC/AHA/HFSA stages of heart failure, A to D.
//
// Source:
//   Heidenreich PA, Bozkurt B, Aguilar D, et al. 2022 AHA/ACC/HFSA Guideline for the
//   Management of Heart Failure. Circulation. 2022;145(18):e895-e1032.
//
//   A  AT RISK. Risk factors - hypertension, cardiovascular disease, obesity, diabetes,
//      exposure to cardiotoxic agents, a genetic variant for cardiomyopathy or a family
//      history of one - WITHOUT symptoms, structural heart disease, or biomarker evidence of
//      cardiac injury.
//   B  PRE-HF. No symptoms or signs, but ONE of: structural heart disease, such as a reduced
//      ejection fraction, chamber enlargement, a wall-motion abnormality or valve disease;
//      increased filling pressures on echocardiography; or stage A risk factors PLUS an
//      increased natriuretic peptide or a persistently elevated cardiac troponin.
//   C  SYMPTOMATIC HF. Structural heart disease with CURRENT OR PREVIOUS symptoms.
//   D  ADVANCED HF. Symptoms that interfere with daily life, are difficult to control, and
//      result in recurrent hospitalizations despite guideline-directed medical therapy.
//
// STAGE C IS DEFINED TO INCLUDE PREVIOUS SYMPTOMS, AND THAT IS THE POINT. A patient whose
// symptoms have resolved on treatment is still stage C. They do not return to stage B. The
// staging describes how far the disease has progressed, not how the patient is today - which
// is exactly the opposite of the 2023 atrial fibrillation stages, where patients move in both
// directions. Two staging systems for two cardiac diseases, one directional and one not, and
// they are easy to reason about interchangeably and wrongly.
//
// STAGE B NOW INCLUDES BIOMARKERS. The 2022 guideline added the route of stage A risk factors
// PLUS a raised natriuretic peptide or a persistently elevated troponin. So a hypertensive
// patient with a structurally normal heart and a raised natriuretic peptide is stage B, not
// stage A - which is a treatment-relevant difference, and one a structure-only reading misses.
//
// AND STAGE A REQUIRES THE ABSENCE OF ALL OF IT. Risk factors alone, with no symptoms, no
// structural finding and no biomarker abnormality.
//
// Pure: no DOM, no clock, no network.

export const HF_STAGES_NOTE = 'The heart failure stages of the 2022 guideline (Heidenreich PA, Bozkurt B, Aguilar D, et al, Circulation 2022;145(18):e895-e1032) run from A to D. Stage A is being at risk, with hypertension, cardiovascular disease, obesity, diabetes, exposure to cardiotoxic agents, a genetic variant for cardiomyopathy or a family history of one, and without symptoms, structural heart disease or biomarker evidence of cardiac injury. Stage B is pre-heart failure, meaning no symptoms but one of structural heart disease such as a reduced ejection fraction, chamber enlargement, a wall-motion abnormality or valve disease; raised filling pressures on echocardiography; or stage A risk factors together with a raised natriuretic peptide or a persistently elevated troponin. Stage C is symptomatic heart failure, structural disease with current or previous symptoms. Stage D is advanced disease, with symptoms that interfere with daily life, resist control and cause repeated hospital admissions despite guideline-directed therapy. Two points matter. Stage C is defined to include previous symptoms, so someone whose symptoms have resolved on treatment remains stage C and does not go back to stage B; the staging describes how far the disease has progressed rather than how the patient is today, which is the opposite of the atrial fibrillation stages where movement runs both ways. And the biomarker route into stage B was added in 2022, so a hypertensive patient with a structurally normal heart and a raised natriuretic peptide is stage B rather than stage A, a difference a structure-only reading misses. It applies a published staging to findings already gathered and it does not select or adjust therapy.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function hfStagesAbcd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const riskFactors = truthy(o.riskFactors);
  const structural = truthy(o.structuralHeartDisease);
  const fillingPressures = truthy(o.raisedFillingPressures);
  const biomarkers = truthy(o.raisedBiomarkers);
  const currentSymptoms = truthy(o.currentSymptoms);
  const previousSymptoms = truthy(o.previousSymptoms);
  const advanced = truthy(o.advancedFeatures);

  const everSymptomatic = currentSymptoms || previousSymptoms;
  // The biomarker route into stage B requires risk factors alongside it.
  const biomarkerRoute = biomarkers && riskFactors;
  const preHfEvidence = structural || fillingPressures || biomarkerRoute;

  let stage = null;
  let basis = null;
  if (advanced && everSymptomatic) {
    stage = 'D';
    basis = 'symptoms that interfere with daily life, resist control and cause repeated admissions despite guideline-directed therapy';
  } else if (everSymptomatic && structural) {
    stage = 'C';
    basis = `structural heart disease with ${currentSymptoms ? 'current symptoms' : 'previous symptoms'}`;
  } else if (preHfEvidence) {
    stage = 'B';
    basis = structural
      ? 'structural heart disease without symptoms'
      : (fillingPressures ? 'raised filling pressures without symptoms' : 'risk factors with a raised natriuretic peptide or persistently elevated troponin, without symptoms');
  } else if (riskFactors) {
    stage = 'A';
    basis = 'risk factors, with no symptoms, no structural heart disease and no biomarker abnormality';
  }

  // The directionality, and the contrast with the AF stages.
  const directionNote = stage === 'C' && !currentSymptoms && previousSymptoms
    ? 'Stage C is defined to include PREVIOUS symptoms, so symptoms resolving on treatment does not move a patient back to stage B. The staging describes how far the disease has progressed, not how the patient is today - the opposite of the atrial fibrillation stages, where movement runs both ways.'
    : null;

  // The 2022 addition.
  const biomarkerNote = biomarkerRoute && !structural && !fillingPressures && !everSymptomatic
    ? 'This is stage B on the biomarker route the 2022 guideline added: stage A risk factors plus a raised natriuretic peptide or persistently elevated troponin, with a structurally normal heart. A structure-only reading would call this stage A.'
    : null;

  const orphanBiomarkerNote = biomarkers && !riskFactors && !structural && !fillingPressures && !everSymptomatic
    ? 'A raised biomarker is recorded but no stage A risk factor is. The stage B biomarker route requires the risk factors alongside it.'
    : null;

  const symptomsWithoutStructureNote = everSymptomatic && !structural && stage !== 'D'
    ? 'Symptoms are recorded without structural heart disease. Stage C requires both, so this does not reach stage C on these entries.'
    : null;

  return {
    valid: true,
    stage,
    basis,
    everSymptomatic,
    directionNote,
    biomarkerNote,
    orphanBiomarkerNote,
    symptomsWithoutStructureNote,
    abnormal: stage === 'C' || stage === 'D',
    bandLabel: stage ? `Stage ${stage}` : 'No stage assigned',
    band: stage
      ? `Heart failure stage ${stage} — ${basis}.`
      : 'No stage assigned. Stage A needs at least one risk factor for heart failure.',
    detail: 'A is at risk, with no symptoms, structural disease or biomarker abnormality. B is pre-HF: structural disease, raised filling pressures, or risk factors with a raised natriuretic peptide or troponin, all without symptoms. C is structural disease with current OR previous symptoms. D is advanced disease despite guideline-directed therapy.',
    note: HF_STAGES_NOTE,
  };
}
