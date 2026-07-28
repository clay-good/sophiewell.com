// spec-v580: the modified EHRA symptom scale for atrial fibrillation. "ehra" was zero-hit apart from the
// unrelated `mehran-cin` substring, and `grep -c "id: 'ehra-af'" app.js` returned 0.
//
// A COMPANION GAP: THE MISSING AXIS. The catalog already carries the atrial fibrillation STROKE axis
// (CHA2DS2-VASc), the BLEEDING axis (HAS-BLED, ATRIA, ORBIT) and the RECURRENCE axis (HATCH, APPLE,
// CAAP-AF, MB-LATER, CHARGE-AF). It had no SYMPTOM axis at all, which is the one the guidelines make a
// Class I recommendation to record.
//
// **THERE IS NO CLASS 2. THE LADDER IS 1, 2a, 2b, 3, 4.** Five levels, with a non-numeric label in the
// middle. It cannot be summed, averaged, or stored as an integer without loss: a database column typed as
// an integer will silently collapse 2a and 2b, and the collapse destroys exactly the distinction the
// modification was made to introduce. This lib returns the class as a STRING and exports the ladder, so no
// caller can quietly round it.
//
// **2a AND 2b SHARE THE SAME OBJECTIVE CRITERION AND ARE SPLIT ON A SUBJECTIVE ONE.** Both are "normal
// daily activity not affected". The only thing separating them is whether the patient is TROUBLED by the
// symptoms. Everywhere else on this scale the discriminator is function; at this one boundary it is not,
// and that is deliberate -- it is the boundary the modification was created to draw, and the one that
// carries the treatment implication. This lib therefore asks the two questions separately, so the
// subjective step is visible rather than buried in a five-way pick.
//
// **THE SIX SYMPTOMS ARE A FIXED LIST BUT THEY ARE NOT INPUTS.** Palpitations, fatigue, dizziness,
// dyspnea, chest pain and anxiety during atrial fibrillation are the DOMAINS the rater considers. The class
// depends only on the effect on daily activity, so no combination of symptoms determines it, and a tile
// that scored the six would be scoring a different instrument.
//
// **IT IS PHYSICIAN-ASSESSED, NOT PATIENT-REPORTED, AND THE GUIDELINE SAYS THE TWO DIVERGE.** The guideline
// text notes explicitly that the scale does not consider symptom dimensions such as anxiety, treatment
// concerns and medication adverse effects, and that physician and patient assessments frequently disagree.
// A class recorded here is a clinician's judgment about activity, not the patient's account of how they
// feel.
//
// A NAMING INCONSISTENCY INSIDE THE GUIDELINE OF RECORD, CARRIED SO IT IS NOT MISTAKEN FOR TWO
// INSTRUMENTS: the 2020 guideline titles its table "EHRA symptom scale" while the accompanying
// recommendation in the same document says "modified EHRA symptom scale". Same instrument, two names, one
// document (spec-v97).
//
// HIGH-STAKES: this classifies SYMPTOM BURDEN. It does NOT diagnose atrial fibrillation, which needs an
// electrocardiographic recording, and it says nothing about stroke risk -- a patient in class 1, entirely
// asymptomatic, can carry a high CHA2DS2-VASc score, and anticoagulation is decided on that axis and not
// this one. Treating a low symptom class as reassurance about stroke is the most damaging misreading
// available here. It does not select rate against rhythm control, does not indicate ablation, and does not
// grade the arrhythmia's burden in time, which is a separate measurement (spec-v11 section 5.3). The
// clinical decision stays with the clinician.
//
// CLASSES AND WORDING RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the validation paper and the
// guideline table, which agree on every class; the guideline adds only a "related to AF" qualifier:
//   - Wynn GJ, Todd DM, Webber M, et al. The European Heart Rhythm Association symptom classification for
//     atrial fibrillation: validation and improvement through a simple modification. Europace.
//     2014;16(7):965-972.
//   - Hindricks G, Potpara T, Dagres N, et al. 2020 ESC Guidelines for the diagnosis and management of
//     atrial fibrillation. Eur Heart J. 2021;42(5):373-498, Table 6.

export const EHRA_CLASSES = [
  { value: '1', label: 'Class 1', severity: 'None', text: 'Atrial fibrillation does not cause any symptoms.' },
  { value: '2a', label: 'Class 2a', severity: 'Mild', text: 'Normal daily activity not affected by symptoms related to atrial fibrillation, and the patient is not troubled by them.' },
  { value: '2b', label: 'Class 2b', severity: 'Moderate', text: 'Normal daily activity not affected by symptoms related to atrial fibrillation, but the patient is troubled by them.' },
  { value: '3', label: 'Class 3', severity: 'Severe', text: 'Normal daily activity affected by symptoms related to atrial fibrillation.' },
  { value: '4', label: 'Class 4', severity: 'Disabling', text: 'Normal daily activity discontinued.' },
];

// The domains the rater considers. Not inputs.
export const EVALUATED_SYMPTOMS = [
  'palpitations', 'fatigue', 'dizziness', 'dyspnea', 'chest pain', 'anxiety during atrial fibrillation',
];

export const ACTIVITY_LEVELS = [
  { value: 'not-affected', text: 'Normal daily activity NOT affected' },
  { value: 'affected', text: 'Normal daily activity affected' },
  { value: 'discontinued', text: 'Normal daily activity discontinued' },
];

const NO_CLASS_2 = 'There is no class 2. The ladder is 1, 2a, 2b, 3, 4 — five levels with a non-numeric label in the middle, so the class cannot be summed, averaged, or stored as an integer without collapsing 2a into 2b and destroying the distinction the modification exists to draw.';

const SUBJECTIVE_SPLIT = '2a and 2b share the SAME objective criterion, that normal daily activity is not affected. They are separated only by whether the patient is TROUBLED by the symptoms. Everywhere else on this scale the discriminator is function; at this one boundary it is not, and that boundary is the point of the modification.';

const SYMPTOMS_NOT_INPUTS = `The six evaluated symptoms — ${EVALUATED_SYMPTOMS.join(', ')} — are the domains the rater considers, not inputs. The class depends only on the effect on daily activity, so no combination of symptoms determines it.`;

const PHYSICIAN_ASSESSED = 'This is physician-assessed rather than patient-reported. The guideline notes that it does not consider symptom dimensions such as anxiety, treatment concerns and medication adverse effects, and that physician and patient assessments frequently diverge.';

const NOT_STROKE_RISK = 'This says nothing about stroke risk. A completely asymptomatic class 1 patient can carry a high CHA2DS2-VASc score, and anticoagulation is decided on that axis, not this one.';

const NAMING_NOTE = 'The guideline of record titles its table "EHRA symptom scale" while the recommendation in the same document says "modified EHRA symptom scale". Same instrument, two names.';

const NOTE = 'The modified EHRA symptom scale (Wynn and colleagues 2014, adopted in the 2020 ESC atrial fibrillation guideline) classifies symptom burden in atrial fibrillation, and is the symptom axis to go alongside the stroke, bleeding and recurrence scores. Class 1 is no symptoms; class 2a is normal daily activity not affected and the patient not troubled; class 2b is normal daily activity not affected but the patient troubled by symptoms; class 3 is normal daily activity affected; class 4 is normal daily activity discontinued. There is no class 2: the ladder is 1, 2a, 2b, 3, 4, five levels with a non-numeric label in the middle, so the class cannot be summed, averaged or stored as an integer without collapsing 2a into 2b and destroying the very distinction the modification was made to introduce. Classes 2a and 2b share the same objective criterion, that normal daily activity is not affected, and are separated only by whether the patient is troubled by the symptoms; everywhere else on the scale the discriminator is function, and at this one boundary it is not, which is deliberate because that boundary is the point of the modification. The six evaluated symptoms, palpitations, fatigue, dizziness, dyspnea, chest pain and anxiety during atrial fibrillation, are the domains the rater considers rather than inputs, since the class depends only on the effect on daily activity and no combination of symptoms determines it. The scale is physician-assessed rather than patient-reported, and the guideline notes that it does not consider symptom dimensions such as anxiety, treatment concerns and medication adverse effects, and that physician and patient assessments frequently diverge. The guideline of record titles its table the EHRA symptom scale while the recommendation in the same document calls it the modified EHRA symptom scale, which is one instrument under two names. This classifies symptom burden. It does not diagnose atrial fibrillation, which needs an electrocardiographic recording, and it says nothing about stroke risk: a completely asymptomatic class 1 patient can carry a high CHA2DS2-VASc score, anticoagulation is decided on that axis rather than this one, and reading a low symptom class as reassurance about stroke is the most damaging misreading available. It does not select rate against rhythm control, does not indicate ablation, and does not grade the arrhythmia burden in time, which is a separate measurement.';

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
//   anySymptoms -- yes/no. No gives class 1 outright.
//   activityImpact -- 'not-affected', 'affected' or 'discontinued'.
//   troubledBySymptoms -- yes/no. Read ONLY when activity is not affected: it is the 2a/2b split.
export function ehraAf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const anySymptoms = readBool(o.anySymptoms);
  if (anySymptoms === null) {
    return { valid: false, message: `Say whether atrial fibrillation causes any symptoms. No gives class 1. ${NO_CLASS_2}` };
  }
  if (Number.isNaN(anySymptoms)) {
    return { valid: false, message: 'The symptoms answer must be yes or no.' };
  }

  if (!anySymptoms) {
    const cls = EHRA_CLASSES[0];
    return {
      valid: true,
      ehraClass: cls.value,
      classLabel: cls.label,
      severity: cls.severity,
      decidedBy: 'no symptoms',
      subjectiveSplitApplied: false,
      bandLabel: `${cls.label} (${cls.severity.toLowerCase()})`,
      bandText: `${cls.label}: ${cls.text} ${NO_CLASS_2} ${SYMPTOMS_NOT_INPUTS} ${PHYSICIAN_ASSESSED} ${NOT_STROKE_RISK} ${NAMING_NOTE}`,
      note: NOTE,
    };
  }

  const rawActivity = o.activityImpact;
  if (rawActivity === '' || rawActivity === null || rawActivity === undefined) {
    return { valid: false, message: `Choose the effect on normal daily activity: ${ACTIVITY_LEVELS.map((a) => a.value).join(', ')}. This is the discriminator everywhere except the 2a/2b boundary.` };
  }
  const activity = ACTIVITY_LEVELS.find((a) => a.value === String(rawActivity).trim().toLowerCase());
  if (!activity) {
    return { valid: false, message: `The activity impact must be one of: ${ACTIVITY_LEVELS.map((a) => a.value).join(', ')}.` };
  }

  if (activity.value === 'discontinued') {
    const cls = EHRA_CLASSES.find((c) => c.value === '4');
    return {
      valid: true,
      ehraClass: cls.value,
      classLabel: cls.label,
      severity: cls.severity,
      decidedBy: 'activity discontinued',
      subjectiveSplitApplied: false,
      bandLabel: `${cls.label} (${cls.severity.toLowerCase()})`,
      bandText: `${cls.label}: ${cls.text} ${NO_CLASS_2} ${SYMPTOMS_NOT_INPUTS} ${PHYSICIAN_ASSESSED} ${NOT_STROKE_RISK} ${NAMING_NOTE}`,
      note: NOTE,
    };
  }

  if (activity.value === 'affected') {
    const cls = EHRA_CLASSES.find((c) => c.value === '3');
    return {
      valid: true,
      ehraClass: cls.value,
      classLabel: cls.label,
      severity: cls.severity,
      decidedBy: 'activity affected',
      subjectiveSplitApplied: false,
      bandLabel: `${cls.label} (${cls.severity.toLowerCase()})`,
      bandText: `${cls.label}: ${cls.text} ${NO_CLASS_2} ${SYMPTOMS_NOT_INPUTS} ${PHYSICIAN_ASSESSED} ${NOT_STROKE_RISK} ${NAMING_NOTE}`,
      note: NOTE,
    };
  }

  // Activity not affected: the only place the scale turns on a subjective question.
  const troubled = readBool(o.troubledBySymptoms);
  if (troubled === null) {
    return { valid: false, message: `Normal daily activity is not affected, so the class turns on whether the patient is TROUBLED by the symptoms. ${SUBJECTIVE_SPLIT}` };
  }
  if (Number.isNaN(troubled)) {
    return { valid: false, message: 'The troubled-by-symptoms answer must be yes or no.' };
  }

  const cls = EHRA_CLASSES.find((c) => c.value === (troubled ? '2b' : '2a'));
  return {
    valid: true,
    ehraClass: cls.value,
    classLabel: cls.label,
    severity: cls.severity,
    decidedBy: 'the subjective 2a/2b split',
    subjectiveSplitApplied: true,
    bandLabel: `${cls.label} (${cls.severity.toLowerCase()})`,
    bandText: `${cls.label}: ${cls.text} ${SUBJECTIVE_SPLIT} ${NO_CLASS_2} ${SYMPTOMS_NOT_INPUTS} ${PHYSICIAN_ASSESSED} ${NOT_STROKE_RISK} ${NAMING_NOTE}`,
    note: NOTE,
  };
}
