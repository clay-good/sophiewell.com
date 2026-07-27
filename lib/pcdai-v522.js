// spec-v522: the Pediatric Crohn's Disease Activity Index (PCDAI). Zero-hit before this tile: "pcdai" and
// "hyams" across corpus.json, app.js, and lib/meta.js, with no test/unit file.
//
// AGE-BAND + DISEASE COMPANION GAP. Every Crohn's instrument in the catalog is validated in ADULTS (CDAI,
// Harvey-Bradshaw, SES-CD, Rutgeerts), and the one pediatric IBD index present is PUCAI, which is ULCERATIVE
// COLITIS. The PCDAI is what fills the corner neither covers, and it is not the adult CDAI with a child's
// weight plugged in: it deliberately ADDS growth parameters and lab measures and DOWN-WEIGHTS the subjective
// items, because Crohn's disease in a child can do its worst damage to growth while the gut symptoms look
// mild.
//
// ELEVEN ITEMS, TOTAL 0-100, AND THE WEIGHTS ARE NOT UNIFORM -- this is the thing to get right:
//   8 items score 0 / 5 / 10   (abdominal pain, stools, well-being, weight, height, abdomen, perirectal, EIM)
//   HEMATOCRIT and ESR score 0 / 2.5 / 5    <-- half weight
//   ALBUMIN scores 0 / 5 / 10               <-- full weight, unlike the other two labs
// 8*10 + 5 + 5 + 10 = 100. Treating all three labs as half-weight caps the index at 95; treating all three
// as full-weight caps it at 110. Both are wrong, and both are easy mistakes, so the albumin item's odd-one-
// out weighting is called out in the item metadata and pinned by a test.
//
// THE HEMATOCRIT THRESHOLD DEPENDS ON AGE AND SEX. There is no single "low hematocrit" cut: a 34% is a
// perfect 0 in a 12-year-old girl and worth 2.5 points in a 12-year-old boy. This tile therefore asks for
// the age/sex band explicitly rather than hiding it, because scoring every child against one threshold is
// the specific error the item exists to prevent.
//
// TWO PUBLISHED BAND EDGES ARE STATED INCONSISTENTLY ACROSS REPRODUCTIONS ("0-10 inactive, 10-30 mild" puts
// 10 in both). The scores move in steps of 2.5, so exactly 10 and exactly 30 are reachable and the boundary
// is not academic. This tile follows the cut scores Hyams and colleagues RECOMMENDED in the 2005 prospective
// evaluation -- below 10 inactive, 30 or above moderate-to-severe -- and says that is the convention it
// follows rather than presenting it as the only reading.
//
// HIGH-STAKES: this is a disease-activity index, not a diagnosis and not a treatment plan. It does not
// diagnose Crohn's disease, does not describe disease LOCATION or BEHAVIOR (that is the Paris
// classification), does not measure MUCOSAL HEALING -- a child can score in the inactive range with active
// endoscopic inflammation, which is why it is not a substitute for endoscopy -- and is not an indication to
// start, stop, escalate, or de-escalate any therapy (spec-v11 section 5.3). The growth items in particular
// need serial measurements plotted against a standard curve, not a single visit. The management decision
// stays with the clinician.
//
// ITEMS, WEIGHTS, AND THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// sources whose numbers agree exactly:
//   - Hyams JS, Ferry GD, Mandel FS, et al. Development and validation of a pediatric Crohn's disease
//     activity index. J Pediatr Gastroenterol Nutr. 1991;12(4):439-447.
//   - Two pediatric Crohn's trial protocols reproducing the complete PCDAI appendix table (one attributing
//     it to Hyams 1991), which agree cell for cell on every hematocrit band, the ESR cut points, the albumin
//     cut points, and the weight and height option wording.
//   - Hyams JS, Markowitz J, Otley A, et al. Evaluation of the pediatric Crohn disease activity index: a
//     prospective multicenter experience. J Pediatr Gastroenterol Nutr. 2005;41(4):416-421, for the
//     recommended cut scores.

const ZERO_FIVE_TEN = (a, b, c) => [
  { value: '0', text: `0 - ${a}` },
  { value: '5', text: `5 - ${b}` },
  { value: '10', text: `10 - ${c}` },
];

// The eight full-weight enum items, in the order the index lists them.
export const PCDAI_ITEMS = [
  {
    key: 'pain', group: 'history', text: 'Abdominal pain',
    options: ZERO_FIVE_TEN('none', 'mild, brief, does not interfere with activities',
      'moderate to severe, daily, longer lasting, affects activities, nocturnal'),
  },
  {
    key: 'stools', group: 'history', text: 'Stools per day',
    options: ZERO_FIVE_TEN('formed stools, or up to 1 liquid stool, no blood',
      'up to 2 semi-formed stools with small blood, or 2 to 5 liquid stools',
      'gross bleeding, or 6 or more liquid stools, or nocturnal diarrhea'),
  },
  {
    key: 'wellbeing', group: 'history', text: 'General well-being',
    options: ZERO_FIVE_TEN('no limitation of activities, well',
      'occasional difficulty maintaining age-appropriate activities, below par',
      'frequent limitation of activity, very poor'),
  },
  {
    key: 'weight', group: 'exam', text: 'Weight',
    options: ZERO_FIVE_TEN('weight gain, or voluntary weight stable or loss',
      'involuntary weight stable, or weight loss of 1 to 9 percent',
      'weight loss of 10 percent or more'),
  },
  {
    key: 'height', group: 'exam', text: 'Linear growth (score by height velocity when possible; the height-channel reading is the alternative)',
    options: ZERO_FIVE_TEN('height velocity at or above minus 1 SD, or less than 1 channel decrease',
      'height velocity below minus 1 SD and above minus 2 SD, or a decrease of 1 to less than 2 channels',
      'height velocity at or below minus 2 SD, or a decrease of 2 or more channels'),
  },
  {
    key: 'abdomen', group: 'exam', text: 'Abdomen',
    options: ZERO_FIVE_TEN('no tenderness, no mass', 'tenderness, or mass without tenderness',
      'tenderness, involuntary guarding, definite mass'),
  },
  {
    key: 'perirectal', group: 'exam', text: 'Perirectal disease',
    options: ZERO_FIVE_TEN('none, or asymptomatic skin tag',
      '1 or 2 indolent fistulae with scant drainage and no tenderness, or inflamed tags or fissures',
      'active fistula with drainage, tenderness, or abscess'),
  },
  {
    key: 'eim', group: 'exam',
    text: 'Extra-intestinal manifestations (fever of 38.5 C or above for 3 days in the past week, definite arthritis, uveitis, erythema nodosum, pyoderma gangrenosum)',
    options: ZERO_FIVE_TEN('none', 'one', 'two or more'),
  },
];

// The hematocrit thresholds are age- and sex-specific: there is no single low-hematocrit cut.
export const HCT_BANDS = [
  { value: 'child', text: '10 years or younger (either sex)', zeroAtOrAbove: 33, halfAtOrAbove: 28 },
  { value: 'male11to14', text: 'Male, 11 to 14 years', zeroAtOrAbove: 35, halfAtOrAbove: 30 },
  { value: 'male15to19', text: 'Male, 15 to 19 years', zeroAtOrAbove: 37, halfAtOrAbove: 32 },
  { value: 'female11to19', text: 'Female, 11 to 19 years', zeroAtOrAbove: 34, halfAtOrAbove: 29 },
];

const MAX_TOTAL = 100;
const INACTIVE_BELOW = 10;
const MODERATE_AT_OR_ABOVE = 30;

const NOTE = 'The Pediatric Crohn’s Disease Activity Index (Hyams and colleagues 1991) scores eleven items for a total of 0 to 100. The weights are not uniform: eight items score 0, 5, or 10; hematocrit and ESR score 0, 2.5, or 5; and albumin scores 0, 5, or 10 like the eight, not 0 to 5 like the other two labs. Treating all three labs as half weight caps the index at 95 and treating all three as full weight caps it at 110, so the albumin weighting is worth checking. The hematocrit threshold depends on age and sex, so a hematocrit of 34 is a 0 in a girl of 12 and worth 2.5 points in a boy of 12. Published reproductions state the band edges inconsistently, putting 10 in both the inactive and the mild range; because the scores move in steps of 2.5 and exactly 10 and exactly 30 are reachable, this tile follows the cut scores Hyams and colleagues recommended in their 2005 prospective evaluation, below 10 inactive and 30 or above moderate to severe, and states that as the convention it follows. This is a disease-activity index, not a diagnosis and not a treatment plan. It does not diagnose Crohn’s disease, does not describe disease location or behavior, and does not measure mucosal healing: a child can score in the inactive range with active endoscopic inflammation, so it is not a substitute for endoscopy. It is not an indication to start, stop, escalate, or de-escalate any therapy, and the growth items need serial measurements plotted against a standard curve rather than a single visit.';

function readEnum(v, allowed) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || !allowed.includes(n)) return NaN;
  return n;
}

function readNumber(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
}

// Hematocrit points. The bands are published as "at or above X" / "X-1 down to Y" / "below Y"; a value
// between the printed integers (32.5 in the 10-and-under band) falls in no printed row, so the reading here
// is the only one that closes the scale without moving a published edge: 0 at or above the zero threshold,
// 2.5 at or above the half threshold, 5 below it.
function hctPoints(hct, band) {
  if (hct >= band.zeroAtOrAbove) return 0;
  if (hct >= band.halfAtOrAbove) return 2.5;
  return 5;
}

// ESR points: below 20 is 0, 20 through 50 is 2.5, above 50 is 5.
function esrPoints(esr) {
  if (esr < 20) return 0;
  if (esr <= 50) return 2.5;
  return 5;
}

// Albumin points: 3.5 or above is 0, 3.1 to 3.4 is 5, 3.0 or below is 10. As with hematocrit, a value
// between the printed rows (3.45) falls in no printed band, so above 3.0 and below 3.5 is read as the
// middle row.
function albuminPoints(alb) {
  if (alb >= 3.5) return 0;
  if (alb > 3.0) return 5;
  return 10;
}

// input:
//   pain, stools, wellbeing, weight, height, abdomen, perirectal, eim -- each 0, 5, or 10
//   hctBand -- one of HCT_BANDS' values; hct -- hematocrit percent
//   esr -- mm/hr; albumin -- g/dL
// All eleven required.
export function pcdai(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const enums = PCDAI_ITEMS.map((item) => readEnum(o[item.key], [0, 5, 10]));
  const band = HCT_BANDS.find((b) => b.value === String(o.hctBand || '').trim());
  const hct = readNumber(o.hct);
  const esr = readNumber(o.esr);
  const albumin = readNumber(o.albumin);

  if (enums.some((n) => n === null) || !o.hctBand || hct === null || esr === null || albumin === null) {
    return { valid: false, message: 'Score all eight clinical items, choose the age and sex band for hematocrit, and enter the hematocrit, ESR, and albumin.' };
  }
  if (enums.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each clinical item must be 0, 5, or 10.' };
  }
  if (!band) {
    return { valid: false, message: 'Choose one of the published hematocrit age and sex bands: 10 or younger, male 11 to 14, male 15 to 19, or female 11 to 19.' };
  }
  if (Number.isNaN(hct) || Number.isNaN(esr) || Number.isNaN(albumin)) {
    return { valid: false, message: 'Hematocrit, ESR, and albumin must be non-negative numbers.' };
  }

  const clinicalTotal = enums.reduce((a, b) => a + b, 0);
  const hctPts = hctPoints(hct, band);
  const esrPts = esrPoints(esr);
  const albPts = albuminPoints(albumin);
  const labTotal = hctPts + esrPts + albPts;
  const total = clinicalTotal + labTotal;

  let activity;
  if (total < INACTIVE_BELOW) activity = 'inactive disease';
  else if (total < MODERATE_AT_OR_ABOVE) activity = 'mild disease';
  else activity = 'moderate to severe disease';

  return {
    valid: true,
    total,
    clinicalTotal,
    labTotal,
    hctPoints: hctPts,
    esrPoints: esrPts,
    albuminPoints: albPts,
    activity,
    bandLabel: `PCDAI ${total} of ${MAX_TOTAL}`,
    band: `PCDAI ${total} of ${MAX_TOTAL}: ${activity}. ${clinicalTotal} from the eight clinical items and ${labTotal} from the three labs. Following the cut scores recommended in the 2005 prospective evaluation, below 10 is inactive and 30 or above is moderate to severe.`,
    note: NOTE,
  };
}
