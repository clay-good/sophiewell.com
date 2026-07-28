// spec-v577: MAGIC acute GVHD staging and grading. A REVISED-SUCCESSOR GAP: the catalog ships
// `gvhd-grade`, the Modified Glucksberg grade, and MAGIC is the consortium standard that superseded it for
// data collection and is the grading used in the ruxolitinib registration trials. `grep -c
// "id: 'magic-gvhd'" app.js` returned 0.
//
// FOUR ORGANS ARE STAGED, THEN A GRADE IS READ OFF A PATTERN TABLE.
//
// **UPPER GASTROINTESTINAL INVOLVEMENT HAS ONLY TWO STATES, 0 AND 1. THERE IS NO UPPER-GI STAGE 2, 3 OR
// 4.** A form that renders a uniform 0-to-4 select for every organ invents three values the instrument does
// not contain. This lib exports the per-organ ladders separately so the asymmetry is structural.
//
// **THE GRADE IS NOT A MAXIMUM OVER THE ORGAN STAGES, AND TREATING IT AS ONE IS THE CENTRAL ERROR.**
// Stage-3 skin ALONE is grade II. Stage-2 lower GI ALONE is grade III. A lower organ stage therefore
// produces a HIGHER overall grade, because the grade table is a set of pattern rules about WHICH organ is
// involved, not an aggregate of how badly. Any implementation that takes the worst organ stage and calls it
// the grade will be wrong in both directions.
//
// **UPPER GI CAN NEVER BY ITSELF DRIVE GRADE III OR IV.** In the grade III and IV rules the upper-GI term
// appears as a CONSTRAINT -- "with stage 0 to 1 upper GI" -- and since 1 is its maximum, that constraint can
// never be violated. Upper GI is a contributor at grade II and a passenger above it. Skin is likewise
// capped at 0 to 3 within grade III, so stage-4 skin escapes to grade IV rather than staying in III.
//
// **LOWER-GI STAGE 4 IS QUALITATIVE AND EXPLICITLY OVERRIDES STOOL VOLUME.** It is severe abdominal pain
// with or without ileus, or grossly bloody stool, REGARDLESS OF STOOL VOLUME. A model that derived the
// lower-GI stage from a volume alone could never reach stage 4, and would cap the sickest gut patients at
// stage 3. This lib takes the STAGE rather than a volume, and says why.
//
// **THE LOWER-GI VOLUME CRITERIA HAVE SEPARATE ADULT AND PEDIATRIC DENOMINATORS, AND TWO ALTERNATIVE
// MEASURES WITHIN EACH.** Adults are staged on millilitres per day OR episodes per day; children on
// millilitres per kilogram per day OR episodes per day. The two measures can disagree for the same patient,
// and the source gives NO tie-break rule. That is a genuine gap, and it is another reason the stage is taken
// as an input rather than computed.
//
// **SKIN STAGE 4 IS A CONJUNCTION, NOT A THRESHOLD.** It requires generalized erythroderma over 50 percent
// of body surface area PLUS bullous formation PLUS desquamation over 5 percent. A patient with generalized
// erythroderma and no bullae stays at stage 3. And skin is scored on ACTIVE ERYTHEMA ONLY -- late
// sclerodermatous change is not an input to acute staging at all.
//
// HIGH-STAKES: this stages and grades an established diagnosis. It does NOT diagnose acute graft-versus-host
// disease, and the things it must be distinguished from are common and dangerous -- drug eruption, viral
// infection including CMV and adenovirus, Clostridioides difficile and other enteric infection, engraftment
// syndrome, and sinusoidal obstruction syndrome all mimic one or more organs of it, and several require
// treatment that is the opposite of immunosuppression. Biopsy and infectious workup are how that is settled,
// not this table. It does not distinguish acute from chronic GVHD, which is defined by features rather than
// by day 100. It does not select or dose immunosuppression, and a grade is not an indication for
// corticosteroids or for any second-line agent (spec-v11 section 5.3). The transplant decision stays with
// the clinician.
//
// STAGES AND GRADE RULES RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the consortium report and
// checked against an independent regulatory reproduction, which matches every cell except two transcription
// artifacts in that second source, so the consortium wording is treated as canonical:
//   - Harris AC, Young R, Devine S, et al. International, Multicenter Standardization of Acute
//     Graft-versus-Host Disease Clinical Data Collection: A Report from the Mount Sinai Acute GVHD
//     International Consortium. Biol Blood Marrow Transplant. 2016;22(1):4-10.

export const SKIN_STAGES = [
  { stage: 0, text: 'No active (erythematous) GVHD rash' },
  { stage: 1, text: 'Maculopapular rash under 25 percent of body surface area' },
  { stage: 2, text: 'Maculopapular rash 25 to 50 percent of body surface area' },
  { stage: 3, text: 'Maculopapular rash over 50 percent of body surface area' },
  { stage: 4, text: 'Generalized erythroderma over 50 percent BSA PLUS bullous formation PLUS desquamation over 5 percent BSA. All three are required.' },
];

export const LIVER_STAGES = [
  { stage: 0, text: 'Bilirubin under 2 mg/dL' },
  { stage: 1, text: 'Bilirubin 2 to 3 mg/dL' },
  { stage: 2, text: 'Bilirubin 3.1 to 6 mg/dL' },
  { stage: 3, text: 'Bilirubin 6.1 to 15 mg/dL' },
  { stage: 4, text: 'Bilirubin over 15 mg/dL' },
];

// Only two states exist. There is no upper-GI stage 2, 3 or 4.
export const UPPER_GI_STAGES = [
  { stage: 0, text: 'No or intermittent nausea, vomiting or anorexia' },
  { stage: 1, text: 'Persistent nausea, vomiting or anorexia' },
];

export const LOWER_GI_STAGES = [
  { stage: 0, text: 'Adult: under 500 mL/day or under 3 episodes/day. Child: under 10 mL/kg/day or under 4 episodes/day.' },
  { stage: 1, text: 'Adult: 500 to 999 mL/day or 3 to 4 episodes/day. Child: 10 to 19.9 mL/kg/day or 4 to 6 episodes/day.' },
  { stage: 2, text: 'Adult: 1000 to 1500 mL/day or 5 to 7 episodes/day. Child: 20 to 30 mL/kg/day or 7 to 10 episodes/day.' },
  { stage: 3, text: 'Adult: over 1500 mL/day or over 7 episodes/day. Child: over 30 mL/kg/day or over 10 episodes/day.' },
  { stage: 4, text: 'Severe abdominal pain with or without ileus, OR grossly bloody stool, REGARDLESS OF STOOL VOLUME.' },
];

export const UPPER_GI_MAX_STAGE = 1;

const NOT_A_MAXIMUM = 'The grade is NOT a maximum over the organ stages. Stage-3 skin alone is grade II, while stage-2 lower GI alone is grade III, so a LOWER organ stage can produce a HIGHER overall grade. The grade table is a set of pattern rules about which organ is involved, not an aggregate of how badly.';

const UPPER_GI_TEXT = `Upper GI has only two states, 0 and ${UPPER_GI_MAX_STAGE}: there is no upper-GI stage 2, 3 or 4. In the grade III and IV rules it appears as a CONSTRAINT rather than a contributor, and since ${UPPER_GI_MAX_STAGE} is its maximum that constraint can never be violated, so upper GI can never by itself drive grade III or IV.`;

const LOWER_GI_QUALITATIVE = 'Lower-GI stage 4 is qualitative and explicitly overrides stool volume: severe abdominal pain with or without ileus, or grossly bloody stool, regardless of volume. A model deriving the stage from a volume alone could never reach stage 4 and would cap the sickest gut patients at stage 3.';

const LOWER_GI_DENOMINATORS = 'The lower-GI volume criteria have separate adult and pediatric denominators, and within each two alternative measures, volume or episode count, which can disagree for the same patient. The source gives no tie-break rule, which is why the stage is taken as an input here rather than computed.';

const SKIN_CONJUNCTION = 'Skin stage 4 is a conjunction, not a threshold: it requires erythroderma over 50 percent BSA PLUS bullous formation PLUS desquamation over 5 percent. Generalized erythroderma without bullae stays at stage 3. Skin is scored on ACTIVE ERYTHEMA ONLY.';

const NOTE = 'The MAGIC acute GVHD staging and grading system (Harris and colleagues 2016) is the consortium standard that superseded the Modified Glucksberg grade for data collection, and is the grading used in the ruxolitinib registration trials. Four organs are staged and a grade is then read off a pattern table. Skin runs 0 to 4 by the extent of active maculopapular rash, with stage 4 requiring erythroderma over 50 percent of body surface area together with bullous formation and desquamation over 5 percent, so generalized erythroderma without bullae stays at stage 3, and skin is scored on active erythema only. Liver runs 0 to 4 by bilirubin. Upper gastrointestinal involvement has only two states, 0 for no or intermittent nausea, vomiting or anorexia and 1 for persistent symptoms: there is no upper-GI stage 2, 3 or 4, so a form rendering a uniform 0 to 4 select for every organ would invent three values the instrument does not contain. Lower GI runs 0 to 4, with stage 4 defined qualitatively as severe abdominal pain with or without ileus or grossly bloody stool regardless of stool volume, so a model deriving the stage from a volume alone could never reach it. The lower-GI volume criteria also have separate adult and pediatric denominators and two alternative measures within each, volume or episode count, which can disagree for the same patient with no tie-break rule given. The overall grade is not a maximum over the organ stages: grade 0 is no stage 1 to 4 of any organ; grade I is stage 1 to 2 skin with no liver, upper GI or lower GI involvement; grade II is stage 3 rash, or stage 1 liver, upper GI or lower GI; grade III is stage 2 to 3 liver or stage 2 to 3 lower GI with skin 0 to 3 and upper GI 0 to 1; and grade IV is stage 4 skin, liver or lower GI with upper GI 0 to 1. Stage-3 skin alone is therefore grade II while stage-2 lower GI alone is grade III, so a lower organ stage can produce a higher overall grade. In grades III and IV the upper-GI term appears as a constraint rather than a contributor, and because 1 is its maximum that constraint can never be violated, so upper GI can never by itself drive grade III or IV. This stages and grades an established diagnosis. It does not diagnose acute graft-versus-host disease, and the conditions it must be distinguished from are common and dangerous: drug eruption, viral infection including cytomegalovirus and adenovirus, Clostridioides difficile and other enteric infection, engraftment syndrome and sinusoidal obstruction syndrome all mimic one or more organs of it, and several require treatment that is the opposite of immunosuppression, with biopsy and infectious workup rather than this table settling the question. It does not distinguish acute from chronic GVHD, which is defined by features rather than by day 100. It does not select or dose immunosuppression, and a grade is not an indication for corticosteroids or for any second-line agent.';

function readStage(ladder, raw, name) {
  if (raw === '' || raw === null || raw === undefined) return { missing: name };
  const n = Number(String(raw).trim());
  const found = ladder.find((s) => s.stage === n);
  return found ? { found } : { bad: name };
}

// input: skin, liver, upperGi, lowerGi -- organ stages. Upper GI accepts only 0 or 1.
export function magicGvhd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const skin = readStage(SKIN_STAGES, o.skin, 'skin');
  if (skin.missing) return { valid: false, message: 'Stage the skin from 0 to 4. Stage 4 is a conjunction: erythroderma over 50 percent BSA PLUS bullae PLUS desquamation over 5 percent.' };
  if (skin.bad) return { valid: false, message: 'Skin stage must be 0 to 4.' };

  const liver = readStage(LIVER_STAGES, o.liver, 'liver');
  if (liver.missing) return { valid: false, message: 'Stage the liver from 0 to 4 by bilirubin.' };
  if (liver.bad) return { valid: false, message: 'Liver stage must be 0 to 4.' };

  const upperGi = readStage(UPPER_GI_STAGES, o.upperGi, 'upperGi');
  if (upperGi.missing) return { valid: false, message: `Stage the upper GI. ${UPPER_GI_TEXT}` };
  if (upperGi.bad) return { valid: false, message: `Upper GI stage must be 0 or ${UPPER_GI_MAX_STAGE}. There is no upper-GI stage 2, 3 or 4.` };

  const lowerGi = readStage(LOWER_GI_STAGES, o.lowerGi, 'lowerGi');
  if (lowerGi.missing) return { valid: false, message: `Stage the lower GI from 0 to 4. ${LOWER_GI_QUALITATIVE}` };
  if (lowerGi.bad) return { valid: false, message: 'Lower GI stage must be 0 to 4.' };

  const s = skin.found.stage;
  const l = liver.found.stage;
  const u = upperGi.found.stage;
  const g = lowerGi.found.stage;

  // Pattern rules, checked from the top down. Not an aggregate.
  let grade;
  let rule;
  if (s === 4 || l === 4 || g === 4) {
    grade = 4;
    rule = 'stage 4 skin, liver or lower GI, with upper GI 0 to 1';
  } else if ((l >= 2 && l <= 3) || (g >= 2 && g <= 3)) {
    grade = 3;
    rule = 'stage 2 to 3 liver and/or stage 2 to 3 lower GI, with skin 0 to 3 and upper GI 0 to 1';
  } else if (s === 3 || l === 1 || u === 1 || g === 1) {
    grade = 2;
    rule = 'stage 3 rash and/or stage 1 liver and/or stage 1 upper GI and/or stage 1 lower GI';
  } else if (s >= 1 && s <= 2) {
    grade = 1;
    rule = 'stage 1 to 2 skin without liver, upper GI or lower GI involvement';
  } else {
    grade = 0;
    rule = 'no stage 1 to 4 of any organ';
  }

  const romanGrade = ['0', 'I', 'II', 'III', 'IV'][grade];
  const maxOrganStage = Math.max(s, l, u, g);
  const gradeExceedsMaxStage = grade > maxOrganStage;
  const gradeBelowMaxStage = grade < maxOrganStage;

  return {
    valid: true,
    grade,
    gradeLabel: `Grade ${romanGrade}`,
    rule,
    stages: { skin: s, liver: l, upperGi: u, lowerGi: g },
    maxOrganStage,
    gradeDiffersFromMaxStage: gradeExceedsMaxStage || gradeBelowMaxStage,
    bandLabel: `MAGIC acute GVHD grade ${romanGrade}`,
    bandText: `MAGIC acute GVHD Grade ${romanGrade}, on the rule: ${rule}. Organ stages: skin ${s}, liver ${l}, upper GI ${u}, lower GI ${g}. ${NOT_A_MAXIMUM} ${UPPER_GI_TEXT} ${LOWER_GI_QUALITATIVE} ${LOWER_GI_DENOMINATORS} ${SKIN_CONJUNCTION} This stages an established diagnosis and does not diagnose GVHD, distinguish it from its mimics, or indicate immunosuppression.`,
    note: NOTE,
  };
}
