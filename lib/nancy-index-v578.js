// spec-v578: the Nancy histological index for ulcerative colitis. "nancy" was zero-hit and there is no
// nancy-index tile in app.js.
//
// A COMPANION GAP ON A DIFFERENT AXIS. The catalog already has the ENDOSCOPIC ulcerative colitis scores --
// the Mayo endoscopic subscore and UCEIS -- and had no HISTOLOGIC one. Endoscopic and histologic activity
// diverge in real patients, and histologic remission is the stricter target, so this is not a duplicate of
// what the scope already covers.
//
// **THIS IS NOT A SUM. IT IS A THREE-ITEM DECISION TREE EVALUATED IN STRICT PRIORITY ORDER.** Ulceration is
// checked first, then the acute (neutrophilic) infiltrate, then the chronic infiltrate. The first one that
// fires decides the grade and the others are not consulted. Building it as an additive score would be
// wrong in both directions -- it would let mild findings accumulate into a high grade, and it would let a
// biopsy with ulceration score below 4 because its other features were unremarkable.
//
// **A BIOPSY WITH ULCERATION IS GRADE 4 REGARDLESS OF EVERYTHING ELSE.** That is the top of the tree, not
// the top of a ladder, so it cannot be offset by an otherwise quiet specimen.
//
// **GRADE 1 IS A DEAD END FOR CHRONIC INFLAMMATION.** However florid the lymphoplasmacytic and eosinophilic
// infiltrate, it can NEVER push the grade above 1. Chronic inflammation only decides 0 against 1, and only
// when neutrophils and ulcers are both absent. A pathologist reading a heavily chronically inflamed biopsy
// with no neutrophils is looking at a grade 1, and no amount of chronic change makes it a 2.
//
// **THE THRESHOLDS ARE STATED CONDITIONALLY, AND THE CONDITION TURNS OUT TO BE STRUCTURALLY GUARANTEED.**
// The source defines histological response as an index of 1 or less "when there are no neutrophils in the
// epithelium, nor erosions or ulcers". Because of the priority order, a grade of 0 or 1 can ONLY arise when
// neutrophils and ulcers are absent -- so the stated condition is automatically satisfied whenever the
// numeric threshold is met, and cannot be violated. This lib reports the condition rather than dropping it,
// because a reader who applies "index 1 or less" to a score computed some other way could reach it with
// neutrophils present.
//
// **THE DENOMINATOR IS THE SET OF BIOPSIES FROM THE VISIT, NOT ONE SLIDE: THE WORST BIOPSY WINS.** A
// comparative study instead AVERAGED several ratings, which is an operationally different denominator and
// will not reproduce this index. The unit of assessment is stated because it changes the answer.
//
// HIGH-STAKES: a histologic activity grade. It does NOT diagnose ulcerative colitis, and it does not
// distinguish it from the things that mimic it on a biopsy -- infectious colitis, Crohn colitis, ischemic
// colitis, and drug-induced injury can all produce an active colitis picture, and the distinction rests on
// clinical context, distribution and culture rather than on this grade. It does not assess dysplasia or
// cancer risk, which is a separate reading of the same specimen entirely. It does not measure endoscopic or
// symptomatic activity, which diverge from histology in both directions. It does not select or escalate
// therapy (spec-v11 section 5.3). The clinical decision stays with the gastroenterologist and the
// pathologist.
//
// GRADES AND THE ALGORITHM RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from a review reproducing the
// index table and its algorithm verbatim, and checked against the authors' own practical guide, which gives
// the same descriptors with slightly different wording at grade 0:
//   - Marchal-Bressenot A, Salleron J, Boulagnon-Rombi C, et al. Development and validation of the Nancy
//     histological index for UC. Gut. 2017;66(1):43-49.
//   - Marchal-Bressenot A, et al. A practical guide to assess the Nancy histological index for UC. Gut.
//     2016;65(11):1919-1920.

export const ULCERATION_GRADE = 4;

export const NEUTROPHIL_LEVELS = [
  { value: 'none', grade: null, text: 'No neutrophils' },
  { value: 'mild', grade: 2, text: 'Mild increase: few or rare neutrophils in the lamina propria or epithelium, difficult to see' },
  { value: 'moderate-severe', grade: 3, text: 'Moderate or severe increase: multiple clusters of neutrophils in the lamina propria and/or epithelium, easily apparent' },
];

export const CHRONIC_LEVELS = [
  { value: 'none-or-mild', grade: 0, text: 'No or only mild increase in chronic inflammatory cells' },
  { value: 'moderate-severe', grade: 1, text: 'Moderate or severe increase in chronic inflammatory cells (lymphocytes, plasma cells and eosinophils), easily apparent' },
];

export const NANCY_GRADES = {
  0: 'No or only mild increase in chronic inflammatory cells',
  1: 'Moderate or severe increase in chronic inflammatory cells',
  2: 'Mild increase in neutrophils',
  3: 'Moderate or severe increase in neutrophils',
  4: 'Ulcers or erosions',
};

export const REMISSION_GRADE = 0;
export const RESPONSE_MAX_GRADE = 1;

const DECISION_TREE = 'This is a decision tree, not a sum. Ulceration is checked first, then the neutrophilic infiltrate, then the chronic infiltrate, and the first that fires decides the grade. Building it additively would let mild findings accumulate into a high grade and would let an ulcerated biopsy score below 4.';

const CHRONIC_DEAD_END = `Chronic inflammation is a dead end at grade ${RESPONSE_MAX_GRADE}: however florid the lymphoplasmacytic and eosinophilic infiltrate, it can NEVER push the grade above ${RESPONSE_MAX_GRADE}. It only decides 0 against ${RESPONSE_MAX_GRADE}, and only when neutrophils and ulcers are both absent.`;

const CONDITION_TEXT = `Histological remission is an index of ${REMISSION_GRADE}; histological response is ${RESPONSE_MAX_GRADE} or less, stated in the source as applying only when there are no neutrophils in the epithelium and no erosions or ulcers. Because of the priority order, a grade of ${RESPONSE_MAX_GRADE} or less can ONLY arise when neutrophils and ulcers are absent, so that condition is structurally guaranteed here and cannot be violated. It is reported anyway, because a reader applying the same numeric threshold to a score computed some other way could reach it with neutrophils present.`;

const DENOMINATOR_TEXT = 'The denominator is the SET of biopsies from the visit rather than one slide: the worst biopsy wins. A comparative study instead averaged several ratings, which is an operationally different denominator and will not reproduce this index.';

const NAME_NOTE = 'The index is named after the city of Nancy in France, not after a person.';

const NOTE = 'The Nancy histological index (Marchal-Bressenot and colleagues 2017) grades histologic activity in ulcerative colitis from 0 to 4, and is the histologic companion to the endoscopic Mayo subscore and UCEIS, which the catalog already covers; endoscopic and histologic activity diverge in real patients, and histologic remission is the stricter target. It is not a sum but a three-item decision tree evaluated in strict priority order: ulceration or erosion first, giving grade 4 regardless of everything else; then the neutrophilic infiltrate, giving grade 2 for few or rare neutrophils that are difficult to see and grade 3 for multiple easily apparent clusters; and only if neutrophils are absent, the chronic infiltrate, giving grade 1 for a moderate or severe increase in lymphocytes, plasma cells and eosinophils and grade 0 for no or only mild increase. Building it additively would be wrong in both directions, letting mild findings accumulate into a high grade and letting an ulcerated biopsy score below 4. Chronic inflammation is a dead end at grade 1: however florid, it can never push the grade above 1, and it only decides 0 against 1 when neutrophils and ulcers are both absent. Histological remission is an index of 0 and histological response is 1 or less, which the source states as applying only when there are no neutrophils in the epithelium and no erosions or ulcers; because of the priority order that condition is structurally guaranteed whenever the numeric threshold is met, though it is reported anyway since a reader applying the threshold to a differently computed score could reach it with neutrophils present. The denominator is the set of biopsies from the visit rather than one slide, and the worst biopsy wins; a comparative study instead averaged several ratings, which is an operationally different denominator and will not reproduce this index. This is a histologic activity grade. It does not diagnose ulcerative colitis and does not distinguish it from what mimics it on a biopsy, since infectious colitis, Crohn colitis, ischemic colitis and drug-induced injury can all produce an active colitis picture, and the distinction rests on clinical context, distribution and culture rather than on this grade. It does not assess dysplasia or cancer risk, which is a separate reading of the same specimen. It does not measure endoscopic or symptomatic activity, which diverge from histology in both directions. It does not select or escalate therapy.';

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
//   ulceration          -- yes/no. Checked FIRST; yes gives grade 4 outright.
//   neutrophils         -- 'none', 'mild' or 'moderate-severe'. Checked second.
//   chronicInflammation -- 'none-or-mild' or 'moderate-severe'. Consulted only when neutrophils are absent.
export function nancyIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ulceration = readBool(o.ulceration);
  if (ulceration === null) {
    return { valid: false, message: `Say whether ulcers or erosions are present. This is checked FIRST: their presence gives grade ${ULCERATION_GRADE} regardless of the other features. ${DECISION_TREE}` };
  }
  if (Number.isNaN(ulceration)) {
    return { valid: false, message: 'The ulceration answer must be yes or no.' };
  }

  if (ulceration) {
    return {
      valid: true,
      grade: ULCERATION_GRADE,
      gradeText: NANCY_GRADES[ULCERATION_GRADE],
      decidedBy: 'ulceration',
      featuresConsulted: ['ulceration'],
      remission: false,
      response: false,
      bandLabel: `Nancy index ${ULCERATION_GRADE}`,
      bandText: `Nancy histological index ${ULCERATION_GRADE}: ${NANCY_GRADES[ULCERATION_GRADE]}. Decided by ulceration alone, which is the top of the tree: the neutrophilic and chronic infiltrates were not consulted and cannot lower this grade. ${DECISION_TREE} ${CONDITION_TEXT} ${DENOMINATOR_TEXT} ${NAME_NOTE} This grades histologic activity and does not diagnose ulcerative colitis, assess dysplasia, or select therapy.`,
      note: NOTE,
    };
  }

  const rawNeutrophils = o.neutrophils;
  if (rawNeutrophils === '' || rawNeutrophils === null || rawNeutrophils === undefined) {
    return { valid: false, message: 'Choose the neutrophilic infiltrate level: none, mild, or moderate-severe. It is checked before the chronic infiltrate.' };
  }
  const neutrophils = NEUTROPHIL_LEVELS.find((n) => n.value === String(rawNeutrophils).trim().toLowerCase());
  if (!neutrophils) {
    return { valid: false, message: `The neutrophilic infiltrate must be one of: ${NEUTROPHIL_LEVELS.map((n) => n.value).join(', ')}.` };
  }

  if (neutrophils.grade !== null) {
    return {
      valid: true,
      grade: neutrophils.grade,
      gradeText: NANCY_GRADES[neutrophils.grade],
      decidedBy: 'neutrophils',
      featuresConsulted: ['ulceration', 'neutrophils'],
      remission: false,
      response: false,
      bandLabel: `Nancy index ${neutrophils.grade}`,
      bandText: `Nancy histological index ${neutrophils.grade}: ${NANCY_GRADES[neutrophils.grade]}. Decided by the neutrophilic infiltrate; the chronic infiltrate was not consulted and could not have changed this grade. ${DECISION_TREE} ${CHRONIC_DEAD_END} ${CONDITION_TEXT} ${DENOMINATOR_TEXT} ${NAME_NOTE} This grades histologic activity and does not diagnose ulcerative colitis, assess dysplasia, or select therapy.`,
      note: NOTE,
    };
  }

  const rawChronic = o.chronicInflammation;
  if (rawChronic === '' || rawChronic === null || rawChronic === undefined) {
    return { valid: false, message: `Choose the chronic inflammatory infiltrate level. ${CHRONIC_DEAD_END}` };
  }
  const chronic = CHRONIC_LEVELS.find((c) => c.value === String(rawChronic).trim().toLowerCase());
  if (!chronic) {
    return { valid: false, message: `The chronic infiltrate must be one of: ${CHRONIC_LEVELS.map((c) => c.value).join(', ')}.` };
  }

  const grade = chronic.grade;
  return {
    valid: true,
    grade,
    gradeText: NANCY_GRADES[grade],
    decidedBy: 'chronic inflammation',
    featuresConsulted: ['ulceration', 'neutrophils', 'chronicInflammation'],
    remission: grade === REMISSION_GRADE,
    response: grade <= RESPONSE_MAX_GRADE,
    bandLabel: `Nancy index ${grade}`,
    bandText: `Nancy histological index ${grade}: ${NANCY_GRADES[grade]}. Decided by the chronic infiltrate, reached only because neutrophils and ulcers are both absent. ${grade === REMISSION_GRADE ? 'This meets histological REMISSION.' : 'This meets histological RESPONSE but not remission.'} ${DECISION_TREE} ${CHRONIC_DEAD_END} ${CONDITION_TEXT} ${DENOMINATOR_TEXT} ${NAME_NOTE} This grades histologic activity and does not diagnose ulcerative colitis, assess dysplasia, or select therapy.`,
    note: NOTE,
  };
}
