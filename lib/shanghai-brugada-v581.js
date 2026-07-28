// spec-v581: the Shanghai Score System for Brugada syndrome. "shanghai" was zero-hit and
// `grep -c "id: 'shanghai-brugada'" app.js` returned 0.
//
// A NAME COLLISION WORTH STATING: the catalog already has `brugada-vt`, which is the Brugada ALGORITHM for
// distinguishing ventricular tachycardia from supraventricular tachycardia with aberrancy. Same surname,
// entirely different clinical question -- that one reads a wide-complex tachycardia, this one diagnoses a
// channelopathy. Neither is a version of the other.
//
// **THE CATEGORIES TAKE THEIR MAXIMUM, THEY DO NOT SUM WITHIN THEMSELVES.** Within the ECG, clinical
// history and family history categories, only the SINGLE HIGHEST-SCORING item counts. A patient with an
// aborted cardiac arrest, nocturnal agonal respirations AND unexplained syncope scores 3 for that category,
// not 6. Only the categories are added together.
//
// **THERE IS A HARD GATE THAT IS NOT A SCORE: AT LEAST ONE ECG FINDING IS REQUIRED.** This is the single
// most important thing about the instrument. A patient with an aborted cardiac arrest (3), a first-degree
// relative with definite Brugada syndrome (2) and a probable pathogenic mutation (0.5) totals 5.5 points --
// well above the diagnostic threshold -- and is still NON-DIAGNOSTIC, because the ECG category is empty.
// Any implementation that sums the categories and reads a band off the total is wrong, and wrong in the
// direction of over-diagnosing a condition whose management includes an implantable defibrillator.
//
// **ONE ITEM IS AGE-CONDITIONAL AND SILENTLY DISAPPEARS ABOVE THE THRESHOLD.** Atrial flutter or
// fibrillation scores 0.5 ONLY in patients under 30 with no alternative etiology. At 30 and above the item
// does not exist, so the same finding contributes nothing. This lib requires the age whenever that item is
// selected and zeroes it above the threshold rather than accepting it silently.
//
// **TWO FAMILY-HISTORY ITEMS ARE UNUSUAL AND ARE REPRODUCED AS PUBLISHED.** The definite-Brugada relative
// item counts SECOND-degree relatives as well as first, which is broader than most family-history criteria.
// And the sudden-death item requires a NEGATIVE AUTOPSY -- an absence of finding scored as a positive
// input, so a death that was never autopsied does not qualify.
//
// **GENOTYPE IS DELIBERATELY DE-WEIGHTED.** A probable pathogenic mutation in a susceptibility gene scores
// 0.5 -- the same as the weakest clinical item, and one seventh of the 3.5 carried by a spontaneous type 1
// pattern. A positive genetic test is nowhere near sufficient on its own, and cannot even open the ECG gate.
//
// **THE TOP BAND DOES NOT DISTINGUISH PROBABLE FROM DEFINITE.** It is labeled "probable and/or definite",
// and the score offers no way to separate them. A tile that reported "definite Brugada syndrome" would be
// making a claim the instrument does not support.
//
// HIGH-STAKES: a diagnostic scoring system for a channelopathy whose management can include an implantable
// cardioverter-defibrillator. It does NOT decide that, and it does not risk-stratify for sudden death,
// which is a separate question from whether the diagnosis is met -- many patients meeting these criteria
// are at low arrhythmic risk. It does not read the electrocardiogram: the type 1, 2 and 3 patterns are a
// morphological judgment made before this score is applied. It does not select or interpret provocative
// drug challenge, which carries its own risk and is not indicated by a score. It does not evaluate
// relatives, who need their own assessment (spec-v11 section 5.3). The decision stays with the
// electrophysiologist.
//
// ITEMS, POINTS, THE GATE AND THE BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the expert
// consensus report and checked against an independent journal rendering of the same table, which are
// identical:
//   - Antzelevitch C, Yan GX, Ackerman MJ, et al. J-Wave syndromes expert consensus conference report:
//     Emerging concepts and gaps in knowledge. J Arrhythm. 2016;32(5):315-339 (co-published in Europace and
//     Heart Rhythm).

// Categories I to III award the HIGHEST scoring item only.
export const ECG_ITEMS = [
  { value: 'none', points: 0, text: 'No qualifying ECG finding' },
  { value: 'spontaneous-type1', points: 3.5, text: 'Spontaneous type 1 Brugada ECG pattern at nominal or high leads' },
  { value: 'fever-type1', points: 3, text: 'Fever-induced type 1 Brugada ECG pattern at nominal or high leads' },
  { value: 'type2-3-converts', points: 2, text: 'Type 2 or 3 Brugada ECG pattern that converts with provocative drug challenge' },
];

export const CLINICAL_ITEMS = [
  { value: 'none', points: 0, text: 'No qualifying clinical history' },
  { value: 'arrest-vf-vt', points: 3, text: 'Unexplained cardiac arrest, or documented ventricular fibrillation or polymorphic ventricular tachycardia' },
  { value: 'nocturnal-agonal', points: 2, text: 'Nocturnal agonal respirations' },
  { value: 'arrhythmic-syncope', points: 2, text: 'Suspected arrhythmic syncope' },
  { value: 'unclear-syncope', points: 1, text: 'Syncope of unclear mechanism or etiology' },
  { value: 'af-under-30', points: 0.5, text: 'Atrial flutter or fibrillation without alternative etiology, ONLY under 30 years of age', ageGated: true },
];

export const FAMILY_ITEMS = [
  { value: 'none', points: 0, text: 'No qualifying family history' },
  { value: 'definite-brs-relative', points: 2, text: 'First- or SECOND-degree relative with definite Brugada syndrome' },
  { value: 'suspicious-scd', points: 1, text: 'Suspicious sudden cardiac death in a relative (fever, nocturnal, or Brugada-aggravating drugs)' },
  { value: 'unexplained-scd-negative-autopsy', points: 0.5, text: 'Unexplained sudden cardiac death under 45 in a first- or second-degree relative WITH A NEGATIVE AUTOPSY' },
];

export const GENETIC_POINTS = 0.5;
export const AF_AGE_LIMIT = 30;
export const SHANGHAI_MAX = 9; // 3.5 + 3 + 2 + 0.5

const BANDS = [
  { min: 3.5, label: 'Probable and/or definite Brugada syndrome' },
  { min: 2, label: 'Possible Brugada syndrome' },
  { min: 0, label: 'Non-diagnostic' },
];

const GATE_TEXT = 'At least one ECG finding is REQUIRED. This is a gate, not a score: without an ECG finding the result is non-diagnostic no matter how high the other categories total.';

const CATEGORY_MAX_TEXT = 'Within the ECG, clinical history and family history categories only the single HIGHEST-scoring item counts, so several findings in one category do not add. Only the categories themselves are summed.';

const AGE_GATE_TEXT = `Atrial flutter or fibrillation scores ${GENETIC_POINTS} ONLY under ${AF_AGE_LIMIT} years of age. At ${AF_AGE_LIMIT} and above the item does not exist and the same finding contributes nothing.`;

const GENOTYPE_TEXT = `A probable pathogenic mutation scores ${GENETIC_POINTS}, the same as the weakest clinical item and one seventh of the 3.5 carried by a spontaneous type 1 pattern. Genotype is deliberately de-weighted, and a positive genetic test cannot open the ECG gate.`;

const TOP_BAND_TEXT = 'The top band is labeled "probable and/or definite" and the score offers no way to separate them, so it must not be reported as "definite".';

const FAMILY_ODDITIES = 'Two family-history items are unusual as published: the definite-Brugada item counts SECOND-degree relatives as well as first, and the sudden-death item requires a NEGATIVE AUTOPSY, so a death that was never autopsied does not qualify.';

const NOTE = 'The Shanghai Score System for Brugada syndrome (Antzelevitch and colleagues 2016, endorsed by the international rhythm societies) scores four categories to a maximum of 9. The ECG category awards 3.5 for a spontaneous type 1 pattern, 3 for a fever-induced type 1, and 2 for a type 2 or 3 pattern that converts with provocative drug challenge. Clinical history awards 3 for unexplained cardiac arrest or documented ventricular fibrillation or polymorphic ventricular tachycardia, 2 for nocturnal agonal respirations, 2 for suspected arrhythmic syncope, 1 for syncope of unclear mechanism, and 0.5 for atrial flutter or fibrillation without alternative etiology in patients under 30. Family history awards 2 for a first- or second-degree relative with definite Brugada syndrome, 1 for a suspicious sudden cardiac death in a relative, and 0.5 for an unexplained sudden death under 45 in a first- or second-degree relative with a negative autopsy. A probable pathogenic mutation scores 0.5. Within the first three categories only the single highest-scoring item counts, so several findings in one category do not add; only the categories themselves are summed. At least one ECG finding is required, and this is a gate rather than a score: a patient with an aborted cardiac arrest, a relative with definite Brugada syndrome and a probable pathogenic mutation totals 5.5 points and is still non-diagnostic if the ECG category is empty, so any implementation that sums and reads a band off the total is wrong, and wrong in the direction of over-diagnosing a condition whose management can include an implantable defibrillator. The atrial fibrillation item is age-conditional and silently disappears at 30 and above. Two family-history items are unusual as published, since the definite-Brugada item counts second-degree relatives and the sudden-death item requires a negative autopsy, meaning an un-autopsied death does not qualify. Genotype is deliberately de-weighted, scoring the same as the weakest clinical item and one seventh of a spontaneous type 1 pattern, and it cannot open the ECG gate. The bands are 3.5 or more for probable and/or definite Brugada syndrome, 2 to 3 for possible, and under 2 for non-diagnostic; the top band does not distinguish probable from definite and must not be reported as definite. This is a diagnostic scoring system, not a risk stratification: whether the diagnosis is met is a separate question from arrhythmic risk, and many patients meeting these criteria are at low risk. It does not read the electrocardiogram, since the type 1, 2 and 3 patterns are a morphological judgment made before the score is applied. It does not select or interpret provocative drug challenge, which carries its own risk. It does not decide on an implantable defibrillator and does not evaluate relatives, who need their own assessment. Note also that the catalog contains a different Brugada instrument, the algorithm distinguishing ventricular tachycardia from supraventricular tachycardia with aberrancy, which shares only the surname.';

function pick(items, raw, name) {
  if (raw === '' || raw === null || raw === undefined) return { missing: name };
  const found = items.find((i) => i.value === String(raw).trim().toLowerCase());
  return found ? { found } : { bad: name };
}

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input:
//   ecg, clinical, family -- the single highest-scoring item in each category, or 'none'.
//   geneticMutation -- yes/no.
//   age -- years. Required only when the age-gated clinical item is selected.
export function shanghaiBrugada(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ecg = pick(ECG_ITEMS, o.ecg, 'ecg');
  if (ecg.missing) return { valid: false, message: `Choose the ECG finding, or "none". ${GATE_TEXT}` };
  if (ecg.bad) return { valid: false, message: `The ECG item must be one of: ${ECG_ITEMS.map((i) => i.value).join(', ')}.` };

  const clinical = pick(CLINICAL_ITEMS, o.clinical, 'clinical');
  if (clinical.missing) return { valid: false, message: `Choose the highest-scoring clinical history item, or "none". ${CATEGORY_MAX_TEXT}` };
  if (clinical.bad) return { valid: false, message: `The clinical item must be one of: ${CLINICAL_ITEMS.map((i) => i.value).join(', ')}.` };

  const family = pick(FAMILY_ITEMS, o.family, 'family');
  if (family.missing) return { valid: false, message: 'Choose the highest-scoring family history item, or "none".' };
  if (family.bad) return { valid: false, message: `The family item must be one of: ${FAMILY_ITEMS.map((i) => i.value).join(', ')}.` };

  const genetic = readBool(o.geneticMutation);
  if (genetic === null) return { valid: false, message: `Say whether a probable pathogenic mutation in a Brugada susceptibility gene is present. ${GENOTYPE_TEXT}` };
  if (Number.isNaN(genetic)) return { valid: false, message: 'The genetic answer must be yes or no.' };

  // The age-gated clinical item.
  let clinicalPoints = clinical.found.points;
  let ageGateApplied = false;
  if (clinical.found.ageGated) {
    const rawAge = o.age;
    if (rawAge === '' || rawAge === null || rawAge === undefined) {
      return { valid: false, message: `The atrial fibrillation item is age-conditional. Enter the age: it scores only under ${AF_AGE_LIMIT} years.` };
    }
    const age = Number(String(rawAge).trim());
    if (!Number.isFinite(age) || age < 0 || age > 120) {
      return { valid: false, message: 'Age must be a number of years between 0 and 120.' };
    }
    if (age >= AF_AGE_LIMIT) {
      clinicalPoints = 0;
      ageGateApplied = true;
    }
  }

  const geneticPoints = genetic ? GENETIC_POINTS : 0;
  const total = ecg.found.points + clinicalPoints + family.found.points + geneticPoints;
  const rounded = Math.round(total * 10) / 10;

  const ecgFindingPresent = ecg.found.points > 0;
  const band = ecgFindingPresent
    ? BANDS.find((b) => rounded >= b.min)
    : BANDS[BANDS.length - 1];
  const gateBlocked = !ecgFindingPresent && rounded >= 2;

  return {
    valid: true,
    total: rounded,
    max: SHANGHAI_MAX,
    ecgFindingPresent,
    gateBlocked,
    ageGateApplied,
    categoryPoints: {
      ecg: ecg.found.points, clinical: clinicalPoints,
      family: family.found.points, genetic: geneticPoints,
    },
    band: band.label,
    bandLabel: `Shanghai score ${rounded} of ${SHANGHAI_MAX}: ${band.label.toLowerCase()}`,
    bandText: `Shanghai Brugada score ${rounded} of ${SHANGHAI_MAX}: ${band.label}. Categories: ECG ${ecg.found.points}, clinical ${clinicalPoints}, family ${family.found.points}, genetic ${geneticPoints}.${gateBlocked ? ` NON-DIAGNOSTIC DESPITE A TOTAL OF ${rounded}, because there is no ECG finding. ${GATE_TEXT}` : ` ${GATE_TEXT}`} ${CATEGORY_MAX_TEXT}${ageGateApplied ? ` The atrial fibrillation item was selected but scored 0: ${AGE_GATE_TEXT}` : ''} ${FAMILY_ODDITIES} ${GENOTYPE_TEXT} ${TOP_BAND_TEXT} This is a diagnostic score, not a risk stratification, and it does not decide on an implantable defibrillator.`,
    note: NOTE,
  };
}
