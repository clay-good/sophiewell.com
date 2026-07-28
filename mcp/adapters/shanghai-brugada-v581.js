// spec-v581 MCP wave: adapter for the Shanghai Brugada score in lib/shanghai-brugada-v581.js. The dom keys
// mirror the browser renderer (views/group-v581.js) and META['shanghai-brugada'].example.
//
// **THERE IS A HARD GATE THAT IS NOT A SCORE: AT LEAST ONE ECG FINDING IS REQUIRED.** This is the single
// most important thing here. A patient with an aborted cardiac arrest (3), a first-degree relative with
// definite Brugada syndrome (2) and a probable pathogenic mutation (0.5) totals 5.5 - well above the
// diagnostic threshold - and is STILL NON-DIAGNOSTIC, because the ECG category is empty. Any agent that
// sums the categories and reads a band off the total is wrong, and wrong in the direction of
// OVER-DIAGNOSING a condition whose management can include an implantable defibrillator.
//
// **THE CATEGORIES TAKE THEIR MAXIMUM, THEY DO NOT SUM WITHIN THEMSELVES.** Within ECG, clinical history
// and family history only the SINGLE HIGHEST-scoring item counts: arrest plus nocturnal agonal respirations
// plus syncope is 3 for that category, not 6. Only the categories are added together.
//
// **ONE ITEM IS AGE-CONDITIONAL AND SILENTLY DISAPPEARS.** Atrial flutter or fibrillation scores 0.5 ONLY
// under 30 years. At 30 and above the item does not exist and the same finding contributes NOTHING. The
// tool requires the age when that item is selected and zeroes it above the threshold.
//
// **TWO FAMILY-HISTORY ITEMS ARE UNUSUAL AS PUBLISHED**: the definite-Brugada item counts SECOND-degree
// relatives, and the sudden-death item requires a NEGATIVE AUTOPSY - an absence of finding scored as a
// positive input, so an un-autopsied death does not qualify.
//
// **GENOTYPE IS DELIBERATELY DE-WEIGHTED**: a probable pathogenic mutation scores 0.5, the same as the
// weakest clinical item and one seventh of a spontaneous type 1 pattern, and it CANNOT open the ECG gate.
//
// **THE TOP BAND DOES NOT DISTINGUISH PROBABLE FROM DEFINITE** - it is labeled "probable and/or definite" -
// so never report "definite Brugada syndrome" from this score.
//
// NAME COLLISION: the catalog also has `brugada-vt`, the algorithm distinguishing ventricular tachycardia
// from SVT with aberrancy. Same surname, entirely different clinical question.

import * as S from '../../lib/shanghai-brugada-v581.js';

export default [
  {
    id: 'shanghai-brugada',
    summary: `The SHANGHAI SCORE SYSTEM for Brugada syndrome (Antzelevitch and colleagues 2016, endorsed by the international rhythm societies), maximum ${S.SHANGHAI_MAX}. **NOT TO BE CONFUSED WITH THE BRUGADA ALGORITHM for wide-complex tachycardia**, which is a different instrument answering a different question and also present in this catalog. CATEGORY I, ECG: spontaneous type 1 Brugada pattern at nominal or high leads = 3.5; fever-induced type 1 = 3; type 2 or 3 pattern that converts with provocative drug challenge = 2. CATEGORY II, CLINICAL HISTORY: unexplained cardiac arrest or documented VF/polymorphic VT = 3; nocturnal agonal respirations = 2; suspected arrhythmic syncope = 2; syncope of unclear mechanism = 1; atrial flutter or fibrillation without alternative etiology UNDER ${S.AF_AGE_LIMIT} YEARS = 0.5. CATEGORY III, FAMILY HISTORY: first- or SECOND-degree relative with definite Brugada syndrome = 2; suspicious sudden cardiac death in a relative = 1; unexplained sudden death under 45 in a first- or second-degree relative WITH A NEGATIVE AUTOPSY = 0.5. CATEGORY IV, GENETICS: probable pathogenic mutation = ${S.GENETIC_POINTS}. **THE CATEGORIES TAKE THEIR MAXIMUM AND DO NOT SUM WITHIN THEMSELVES**: within categories I to III only the SINGLE HIGHEST-scoring item counts, so arrest plus nocturnal agonal respirations plus syncope is 3 for that category, not 6. Only the categories are added together. **THERE IS A HARD GATE THAT IS NOT A SCORE - AT LEAST ONE ECG FINDING IS REQUIRED.** A patient with an aborted cardiac arrest, a relative with definite Brugada syndrome and a probable pathogenic mutation totals 5.5 points, well above the diagnostic threshold, and is STILL NON-DIAGNOSTIC because the ECG category is empty. Summing the categories and reading a band off the total is WRONG, and wrong in the direction of OVER-DIAGNOSING a condition whose management can include an implantable defibrillator. **ONE ITEM IS AGE-CONDITIONAL AND SILENTLY DISAPPEARS**: atrial fibrillation or flutter scores only under ${S.AF_AGE_LIMIT} years, and at ${S.AF_AGE_LIMIT} or above the item does not exist. **TWO FAMILY-HISTORY ITEMS ARE UNUSUAL**: second-degree relatives count, and the sudden-death item requires a NEGATIVE AUTOPSY, so an un-autopsied death does not qualify. **GENOTYPE IS DELIBERATELY DE-WEIGHTED**, scoring the same as the weakest clinical item and one seventh of a spontaneous type 1 pattern, and it cannot open the ECG gate. BANDS: 3.5 or more = probable and/or definite Brugada syndrome; 2 to 3 = possible; under 2 = non-diagnostic. **THE TOP BAND DOES NOT DISTINGUISH PROBABLE FROM DEFINITE**, so never report "definite Brugada syndrome" from this score. This is a DIAGNOSTIC score, NOT a risk stratification: whether the diagnosis is met is a separate question from arrhythmic risk, and many patients meeting these criteria are at low risk. It does not read the electrocardiogram, since the type 1, 2 and 3 patterns are a morphological judgment made before the score is applied. It does not select or interpret provocative drug challenge, which carries its own risk. It does not decide on an implantable defibrillator, and it does not evaluate relatives, who need their own assessment.`,
    compute: S.shanghaiBrugada,
    fields: [
      {
        dom: 'shanghai-ecg', arg: 'ecg', kind: 'enum',
        values: S.ECG_ITEMS.map((i) => i.value), required: true,
        label: `Category I, the HIGHEST-scoring ECG finding. THIS IS A GATE: "none" makes the result non-diagnostic regardless of the total [${S.ECG_ITEMS.map((i) => `${i.value} = ${i.text} (${i.points})`).join('; ')}]`,
      },
      {
        dom: 'shanghai-clinical', arg: 'clinical', kind: 'enum',
        values: S.CLINICAL_ITEMS.map((i) => i.value), required: true,
        label: `Category II, the SINGLE HIGHEST-scoring clinical item - they do not add [${S.CLINICAL_ITEMS.map((i) => `${i.value} = ${i.text} (${i.points})`).join('; ')}]`,
      },
      {
        dom: 'shanghai-family', arg: 'family', kind: 'enum',
        values: S.FAMILY_ITEMS.map((i) => i.value), required: true,
        label: `Category III, the SINGLE HIGHEST-scoring family item - they do not add [${S.FAMILY_ITEMS.map((i) => `${i.value} = ${i.text} (${i.points})`).join('; ')}]`,
      },
      {
        dom: 'shanghai-genetic', arg: 'geneticMutation', kind: 'enum', values: ['no', 'yes'], required: true,
        label: `Category IV, a probable pathogenic mutation in a Brugada susceptibility gene. ${S.GENETIC_POINTS} point, deliberately de-weighted, and it cannot open the ECG gate.`,
      },
      {
        dom: 'shanghai-age', arg: 'age', kind: 'number', unit: 'years', required: false,
        label: `Age. Required ONLY when the atrial fibrillation clinical item is selected, because that item scores only under ${S.AF_AGE_LIMIT} years and contributes nothing at or above it.`,
      },
    ],
  },
];
