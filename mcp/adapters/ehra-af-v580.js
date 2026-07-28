// spec-v580 MCP wave: adapter for the modified EHRA symptom scale in lib/ehra-af-v580.js. The dom keys
// mirror the browser renderer (views/group-v580.js) and META['ehra-af'].example.
//
// **THERE IS NO CLASS 2. THE LADDER IS 1, 2a, 2b, 3, 4.** Five levels with a NON-NUMERIC label in the
// middle. The class must be handled as a STRING: storing it as an integer silently collapses 2a into 2b and
// destroys exactly the distinction the modification exists to draw. Do not sum, average or round it.
//
// **2a AND 2b SHARE THE SAME OBJECTIVE CRITERION.** Both are "normal daily activity not affected". They are
// separated ONLY by whether the patient is TROUBLED by the symptoms. Everywhere else on this scale the
// discriminator is FUNCTION; at this one boundary it is SUBJECTIVE - and that boundary is the whole point
// of the modification. The tool asks it as its own question, and only when activity is unaffected.
//
// **THE SIX EVALUATED SYMPTOMS ARE NOT INPUTS.** Palpitations, fatigue, dizziness, dyspnea, chest pain and
// anxiety are the DOMAINS the rater considers. The class depends ONLY on the effect on daily activity, so
// no combination of symptoms determines it, and an agent that scored the six would be scoring a different
// instrument.
//
// **PHYSICIAN-ASSESSED, NOT PATIENT-REPORTED.** The guideline states the scale does not consider anxiety,
// treatment concerns or medication adverse effects, and that physician and patient assessments frequently
// diverge. A class is a clinician's judgment about activity, not the patient's account of how they feel.
//
// **IT SAYS NOTHING ABOUT STROKE RISK.** A completely asymptomatic class 1 patient can carry a high
// CHA2DS2-VASc score. Anticoagulation is decided on that axis, not this one, and reading a low symptom
// class as reassurance about stroke is the most damaging misreading available here.

import * as E from '../../lib/ehra-af-v580.js';

export default [
  {
    id: 'ehra-af',
    summary: `The MODIFIED EHRA SYMPTOM SCALE for atrial fibrillation (Wynn and colleagues, Europace 2014; adopted in the 2020 ESC AF guideline). It is the SYMPTOM axis, the companion to the stroke (CHA2DS2-VASc), bleeding (HAS-BLED, ATRIA, ORBIT) and recurrence (HATCH, APPLE, CAAP-AF) axes, and the one the guideline makes a Class I recommendation to record. CLASSES: 1 = none, atrial fibrillation does not cause any symptoms. 2a = MILD, normal daily activity not affected by symptoms related to AF, and the patient is NOT troubled by them. 2b = MODERATE, normal daily activity not affected, BUT the patient IS troubled by symptoms. 3 = SEVERE, normal daily activity affected. 4 = DISABLING, normal daily activity discontinued. **THERE IS NO CLASS 2 - THE LADDER IS 1, 2a, 2b, 3, 4**, five levels with a NON-NUMERIC label in the middle. Handle the class as a STRING: storing it as an integer silently collapses 2a into 2b and destroys exactly the distinction the modification exists to draw. Do not sum, average or round it. **2a AND 2b SHARE THE SAME OBJECTIVE CRITERION** - both are "normal daily activity not affected" - and are separated ONLY by whether the patient is TROUBLED. Everywhere else on this scale the discriminator is FUNCTION; at this one boundary it is SUBJECTIVE, which is deliberate, because that boundary is the point of the modification and the one carrying the treatment implication. **THE SIX EVALUATED SYMPTOMS ARE NOT INPUTS**: palpitations, fatigue, dizziness, dyspnea, chest pain and anxiety during AF are the DOMAINS the rater considers, and the class depends ONLY on the effect on daily activity, so no combination of symptoms determines it. **IT IS PHYSICIAN-ASSESSED, NOT PATIENT-REPORTED**, and the guideline states the scale does not consider symptom dimensions such as anxiety, treatment concerns and medication adverse effects, and that physician and patient assessments FREQUENTLY DIVERGE. A naming inconsistency exists inside the guideline of record: its table is titled "EHRA symptom scale" while the recommendation in the same document says "MODIFIED EHRA symptom scale" - one instrument, two names. This classifies SYMPTOM BURDEN. It does NOT diagnose atrial fibrillation, which needs an electrocardiographic recording. **IT SAYS NOTHING ABOUT STROKE RISK**: a completely asymptomatic class 1 patient can carry a high CHA2DS2-VASc score, anticoagulation is decided on that axis rather than this one, and reading a low symptom class as reassurance about stroke is the most damaging misreading available. It does not select rate versus rhythm control, does not indicate ablation, and does not grade the arrhythmia burden in time, which is a separate measurement.`,
    compute: E.ehraAf,
    fields: [
      {
        dom: 'ehra-any', arg: 'anySymptoms', kind: 'enum', values: ['no', 'yes'], required: true,
        label: 'Whether atrial fibrillation causes any symptoms. NO gives class 1 outright.',
      },
      {
        dom: 'ehra-activity', arg: 'activityImpact', kind: 'enum',
        values: E.ACTIVITY_LEVELS.map((a) => a.value), required: false,
        label: `Effect on normal daily activity. The discriminator everywhere except the 2a/2b boundary [${E.ACTIVITY_LEVELS.map((a) => `${a.value} = ${a.text}`).join('; ')}]`,
      },
      {
        dom: 'ehra-troubled', arg: 'troubledBySymptoms', kind: 'enum', values: ['no', 'yes'], required: false,
        label: 'Whether the patient is TROUBLED by the symptoms. Read ONLY when daily activity is not affected: it is the entire 2a versus 2b split, and the one place this scale turns on a subjective judgment.',
      },
    ],
  },
];
