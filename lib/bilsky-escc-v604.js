// spec-v604: the Bilsky epidural spinal cord compression (ESCC) scale. An AXIS GAP in a cluster the catalog
// already carries three members of: `sins-score` grades STABILITY, and `tokuhashi-revised`, `tomita-score`
// and `bauer-score` grade SURVIVAL. None of them grades the CORD ITSELF. Every slug spelling and filename
// search returned 0.
//
// **THE GRADES ARE NOT NUMBERS AND MUST NOT BE STORED AS ONE.** The scale is nominally 4-point but grade 1
// is subdivided into 1a, 1b and 1c, giving six grades whose labels are 0, 1a, 1b, 1c, 2 and 3. THEY CANNOT
// BE AVERAGED, SUMMED, OR PARSED AS INTEGERS: `parseInt` maps 1a, 1b and 1c all to 1 and destroys exactly
// the distinction the subdivision exists to draw. A "mean ESCC grade" is not a quantity this scale supports.
// This lib returns the grade as a STRING and exposes an explicit ordinal rank separately for sorting.
//
// **THE CLINICALLY DECISIVE SPLIT SITS INSIDE GRADE 1, NOT AT THE NUMERIC MIDDLE.** Low grade is 0 through
// 1c and high grade is 2 and 3, so FOUR of the six grades are low and the boundary falls between 1c and 2 --
// between cord ABUTMENT and cord COMPRESSION. A reader who splits "1 versus 2 and 3" by the leading digit
// gets the right answer by accident; a reader who splits at the middle of a six-point list does not.
//
// **THE SCALE GRADES ANATOMY, NOT NEUROLOGY, AND THE SEVERITY OF PARALYSIS DID NOT CORRELATE WITH IT.** In
// the cited analysis the severity of paralysis was NOT correlated with the ESCC grade. A patient can have
// grade 3 compression with normal power, and a patient with grade 1b can be severely impaired. Neurological
// deficit is a separate assessment and this scale does not substitute for it.
//
// **THE SAME GRADE MEANS DIFFERENT THINGS AT DIFFERENT SPINAL LEVELS, AND THE SCALE CARRIES NO LEVEL
// INFORMATION.** At C1 to T2, at least half of patients with grade 1b or worse developed moderate-to-severe
// paralysis; at T3 to L5 that threshold was grade 1c or worse. The level is therefore part of the
// interpretation and no part of the grade, so this lib takes it as an optional input and reports the
// level-specific threshold rather than folding it into the answer.
//
// **IT IS A SINGLE-SLICE, SINGLE-SEQUENCE JUDGMENT**: axial T2-weighted magnetic resonance imaging, at the
// site of MOST SEVERE canal compromise. T2 axial images were found more useful than T1. A grade read from a
// sagittal image, from computed tomography, or away from the worst level is not this scale's grade.
//
// HIGH-STAKES: this grades an IMAGING APPEARANCE. It does NOT diagnose cord compression as a clinical
// syndrome, does not measure neurological function, and does not by itself indicate surgery, radiotherapy or
// corticosteroids. It is one input to a decision -- the widely used framework combines it with neurological
// status, oncological factors, mechanical stability and systemic disease, and this scale supplies only the
// first letter of that. Suspected malignant cord compression is a time-critical emergency and imaging plus
// specialist referral should not wait on a grading exercise (spec-v11 section 5.3).
//
// GRADE DEFINITIONS, THE IMAGING REQUIREMENT AND THE LEVEL-DEPENDENT THRESHOLDS RE-FETCHED AND
// DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER RECALLED (spec-v97):
//   - Bilsky MH, Laufer I, Fourney DR, et al. Reliability analysis of the epidural spinal cord compression
//     scale. J Neurosurg Spine. 2010;13(3):324-328.

export const SEQUENCE = 'axial T2-weighted magnetic resonance imaging, at the site of most severe canal compromise';

export const GRADES = [
  { grade: '0', rank: 0, text: 'Bone involvement alone, with no epidural disease', highGrade: false },
  { grade: '1a', rank: 1, text: 'Epidural impingement WITHOUT deformation of the thecal sac', highGrade: false },
  { grade: '1b', rank: 2, text: 'Deformation of the thecal sac WITHOUT spinal cord abutment', highGrade: false },
  { grade: '1c', rank: 3, text: 'Deformation of the thecal sac WITH spinal cord abutment, but no cord compression', highGrade: false },
  { grade: '2', rank: 4, text: 'Spinal cord compression WITH cerebrospinal fluid still visible around the cord', highGrade: true },
  { grade: '3', rank: 5, text: 'Spinal cord compression WITHOUT visible cerebrospinal fluid around the cord', highGrade: true },
];

// The level-specific grade at or above which at least half of patients had moderate-to-severe paralysis.
export const LEVELS = [
  { value: 'c1-t2', text: 'C1 to T2', paralysisThresholdGrade: '1b' },
  { value: 't3-l5', text: 'T3 to L5', paralysisThresholdGrade: '1c' },
];

export const NOT_NUMERIC_NOTE = 'The grades are NOT numbers: 0, 1a, 1b, 1c, 2, 3. They cannot be averaged, summed or parsed as integers - parseInt maps 1a, 1b and 1c all to 1 and destroys exactly the distinction the subdivision exists to draw. A "mean ESCC grade" is not a quantity this scale supports. The grade is returned here as a STRING, with an ordinal rank exposed separately for sorting only.';
export const SPLIT_NOTE = 'The clinically decisive split sits INSIDE grade 1, not at the numeric middle: low grade is 0 through 1c and high grade is 2 and 3, so FOUR of the six grades are low. The boundary is between cord ABUTMENT (1c) and cord COMPRESSION (2).';
export const NEUROLOGY_NOTE = 'The scale grades ANATOMY, not neurology, and in the cited analysis the severity of paralysis was NOT correlated with the grade. A patient can have grade 3 compression with normal power, and a patient with grade 1b can be severely impaired. Neurological deficit is a separate assessment.';
export const LEVEL_NOTE = 'The same grade means different things at different spinal levels, and the scale carries NO level information. At C1 to T2 at least half of patients with grade 1b or worse developed moderate-to-severe paralysis; at T3 to L5 that threshold was grade 1c or worse.';
export const IMAGING_NOTE = `It is a single-slice, single-sequence judgment: ${SEQUENCE}. T2 axial images were found more useful than T1. A grade read from a sagittal image, from computed tomography, or away from the worst level is not this scale's grade.`;

const NOTE = `The Bilsky epidural spinal cord compression scale grades how far a spinal metastasis has encroached on the canal, on ${SEQUENCE}. The grades are 0, bone involvement alone; 1a, epidural impingement without deformation of the thecal sac; 1b, deformation of the thecal sac without spinal cord abutment; 1c, deformation with cord abutment but no compression; 2, cord compression with cerebrospinal fluid still visible; and 3, cord compression without visible cerebrospinal fluid. The grades are not numbers and cannot be averaged, summed or parsed as integers, since parseInt maps 1a, 1b and 1c all to 1 and destroys the distinction the subdivision exists to draw. The clinically decisive split sits inside grade 1 rather than at the numeric middle: low grade is 0 through 1c and high grade is 2 and 3, so four of the six grades are low and the boundary falls between cord abutment and cord compression. The scale grades anatomy and not neurology, and in the cited analysis the severity of paralysis was not correlated with the grade, so a patient can have grade 3 compression with normal power and a patient with grade 1b can be severely impaired. The same grade also means different things at different spinal levels while the scale carries no level information: at C1 to T2 at least half of patients with grade 1b or worse developed moderate-to-severe paralysis, and at T3 to L5 that threshold was grade 1c or worse. This grades an imaging appearance. It does not diagnose cord compression as a clinical syndrome, does not measure neurological function, and does not by itself indicate surgery, radiotherapy or corticosteroids; it is one input to a decision that also weighs neurological status, oncological factors, mechanical stability and systemic disease. Suspected malignant cord compression is a time-critical emergency and imaging plus specialist referral should not wait on a grading exercise.`;

function pick(list, v, name, key = 'value') {
  if (v === '' || v === null || v === undefined) return null;
  const found = list.find((i) => i[key] === String(v).trim());
  if (!found) throw new Error(`${name} must be one of: ${list.map((i) => i[key]).join(', ')}.`);
  return found;
}

// input: grade (one of GRADES), level (optional, one of LEVELS).
export function bilskyEscc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let entry, level;
  try {
    entry = pick(GRADES, o.grade, 'Grade', 'grade');
    level = o.level === '' || o.level === undefined || o.level === null
      ? null : pick(LEVELS, o.level, 'Spinal level');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (!entry) {
    return { valid: false, message: `Choose a grade: ${GRADES.map((g) => g.grade).join(', ')}. These are LABELS, not numbers - 1a, 1b and 1c are distinct grades that all parse to the integer 1.` };
  }

  let atOrAboveLevelThreshold = null;
  if (level) {
    const threshold = GRADES.find((g) => g.grade === level.paralysisThresholdGrade);
    atOrAboveLevelThreshold = entry.rank >= threshold.rank;
  }

  const parts = [];
  parts.push(`ESCC grade ${entry.grade}: ${entry.text}. ${entry.highGrade ? 'HIGH grade.' : 'LOW grade.'}`);
  parts.push(SPLIT_NOTE);
  parts.push(NOT_NUMERIC_NOTE);
  if (level) {
    parts.push(atOrAboveLevelThreshold
      ? `At ${level.text}, this grade is AT OR ABOVE the level-specific threshold of ${level.paralysisThresholdGrade}, at which at least half of patients in the cited analysis had moderate-to-severe paralysis. ${LEVEL_NOTE}`
      : `At ${level.text}, this grade is BELOW the level-specific threshold of ${level.paralysisThresholdGrade}. ${LEVEL_NOTE}`);
  } else {
    parts.push(LEVEL_NOTE);
  }
  parts.push(NEUROLOGY_NOTE);
  parts.push(IMAGING_NOTE);
  parts.push('This grades an imaging appearance. It does not diagnose cord compression as a clinical syndrome, does not measure neurological function, and does not by itself indicate surgery, radiotherapy or corticosteroids. Suspected malignant cord compression is a time-critical emergency and imaging plus specialist referral should not wait on a grading exercise.');

  return {
    valid: true,
    grade: entry.grade,          // a STRING, deliberately
    ordinalRank: entry.rank,     // for sorting only
    definition: entry.text,
    highGrade: entry.highGrade,
    severity: entry.highGrade ? 'high grade' : 'low grade',
    level: level ? level.text : null,
    levelThresholdGrade: level ? level.paralysisThresholdGrade : null,
    atOrAboveLevelThreshold,
    band: `ESCC grade ${entry.grade}`,
    bandLabel: `ESCC grade ${entry.grade} (${entry.highGrade ? 'high' : 'low'} grade)`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
