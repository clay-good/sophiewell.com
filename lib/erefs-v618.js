// spec-v618: the EREFS endoscopic reference score for eosinophilic esophagitis. A WHOLE-CONCEPT gap -
// "eosinophilic esophagitis" was zero-hit across app.js, and every slug spelling returned 0.
//
// **THE PROXIMAL AND DISTAL ESOPHAGUS ARE SCORED SEPARATELY: 0 TO 9 EACH, 0 TO 18 OVERALL.** Reporting a
// single 0-to-9 figure as "the EREFS" halves the scale. This lib returns both regional scores AND the total,
// and never presents one region as the whole.
//
// **THE FIVE FEATURES HAVE DIFFERENT MAXIMA, SO THEY ARE NOT EQUALLY WEIGHTED**: edema 0 to 1, rings 0 to 3,
// exudates 0 to 2, furrows 0 to 2, stricture 0 to 1 - nine points per region.
//
// **STRICTURE, THE MOST CONSEQUENTIAL FINDING, IS PRESENT-OR-ABSENT ONLY.** It is the least granular item on
// the instrument while rings get four grades. A stricture moves the regional score by one point, the same as
// edema.
//
// **"THE EREFS SCORE" IS AMBIGUOUS: AT LEAST THREE COMPOSITE SCORES ARE PUBLISHED FROM THE SAME FIVE
// FEATURES.** A full composite; an INFLAMMATORY subscore that adds only edema, exudates and furrows and
// EXCLUDES rings and stricture; and a MODIFIED score that reduces every feature to present-or-absent. A bare
// number is uninterpretable unless the variant is named, so this lib returns all three, named.
//
// **THE EXUDATE BOUNDARY AT EXACTLY 10% IS RENDERED BOTH WAYS.** One rendering makes mild "under 10%" and
// severe "10% or more"; another makes mild "10% or less" and severe "over 10%". This lib uses 10% or more as
// severe and discloses the divergence AT that grade only - the numbers agree everywhere else (spec-v97).
//
// **THE RINGS GRADATIONS ARE NAMED BUT NOT DEFINED HERE.** Published descriptors for mild, moderate and
// severe rings differ between renderings and were not double-confirmed, so this lib carries the four grade
// LABELS and does not assert a descriptor for each. Withholding a single-sourced descriptor is preferred to
// printing one (spec-v97).
//
// **THERE ARE NO VALIDATED SEVERITY BANDS.** No band is returned. The instrument was built as a reference for
// describing and following endoscopic findings, and it is used as a trial endpoint by CHANGE from a patient's
// own baseline.
//
// HIGH-STAKES: this describes endoscopic APPEARANCE. It does NOT diagnose eosinophilic esophagitis - that
// requires an esophageal biopsy with an eosinophil count, and a normal-looking esophagus can still be
// histologically active - does NOT measure symptoms or dysphagia, does NOT decide dilation, diet elimination,
// topical steroid or biologic therapy, and does NOT establish treatment response on its own (spec-v11 5.3).
//
// FEATURES, MAXIMA AND THE REGIONAL STRUCTURE RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97).
// The furrows range resolved 2 sources to 1 in favor of 0 to 2, and the separate-region 0-9 / 0-18 structure
// was confirmed twice:
//   - Hirano I, Moy N, Heckman MG, Thomas CS, Gonsalves N, Achem SR. Endoscopic assessment of the
//     oesophageal features of eosinophilic oesophagitis: validation of a novel classification and grading
//     system. Gut. 2013;62(4):489-495.

export const REGIONS = [
  { key: 'proximal', text: 'Proximal esophagus' },
  { key: 'distal', text: 'Distal esophagus' },
];

export const FEATURES = [
  {
    key: 'edema', text: 'Edema', inflammatory: true,
    grades: [
      { grade: 0, text: 'Absent' },
      { grade: 1, text: 'Present - loss of normal vascular markings, pallor or decreased transparency' },
    ],
  },
  {
    key: 'rings', text: 'Rings', inflammatory: false,
    grades: [
      { grade: 0, text: 'Absent' },
      { grade: 1, text: 'Mild' },
      { grade: 2, text: 'Moderate' },
      { grade: 3, text: 'Severe' },
    ],
  },
  {
    key: 'exudates', text: 'Exudates', inflammatory: true,
    grades: [
      { grade: 0, text: 'Absent' },
      { grade: 1, text: 'Mild - under 10% of the mucosal surface' },
      { grade: 2, text: 'Severe - 10% or more of the mucosal surface' },
    ],
  },
  {
    key: 'furrows', text: 'Furrows', inflammatory: true,
    grades: [
      { grade: 0, text: 'Absent' },
      { grade: 1, text: 'Mild' },
      { grade: 2, text: 'Severe' },
    ],
  },
  {
    key: 'stricture', text: 'Stricture', inflammatory: false,
    grades: [
      { grade: 0, text: 'Absent' },
      { grade: 1, text: 'Present' },
    ],
  },
];

export const REGION_MAX = FEATURES.reduce((a, f) => a + f.grades.length - 1, 0);      // 9
export const TOTAL_MAX = REGION_MAX * REGIONS.length;                                  // 18
export const INFLAMMATORY_MAX = FEATURES.filter((f) => f.inflammatory)
  .reduce((a, f) => a + f.grades.length - 1, 0) * REGIONS.length;                       // 10
export const MODIFIED_MAX = FEATURES.length * REGIONS.length;                          // 10

export const REGION_NOTE = `THE PROXIMAL AND DISTAL ESOPHAGUS ARE SCORED SEPARATELY: 0 to ${REGION_MAX} each, 0 to ${TOTAL_MAX} overall. Reporting a single 0-to-${REGION_MAX} figure as "the EREFS" halves the scale.`;
export const WEIGHT_NOTE = `THE FIVE FEATURES HAVE DIFFERENT MAXIMA, SO THEY ARE NOT EQUALLY WEIGHTED: ${FEATURES.map((f) => `${f.text} 0 to ${f.grades.length - 1}`).join(', ')} - ${REGION_MAX} points per region.`;
export const STRICTURE_NOTE = 'STRICTURE, THE MOST CONSEQUENTIAL FINDING, IS PRESENT-OR-ABSENT ONLY. It is the least granular item on the instrument while rings get four grades, so a stricture moves the regional score by one point - the same as edema.';
export const VARIANT_NOTE = `"THE EREFS SCORE" IS AMBIGUOUS: at least THREE composite scores are published from the same five features - a FULL composite (0 to ${TOTAL_MAX}), an INFLAMMATORY subscore that adds only edema, exudates and furrows and EXCLUDES rings and stricture (0 to ${INFLAMMATORY_MAX}), and a MODIFIED score that reduces every feature to present-or-absent (0 to ${MODIFIED_MAX}). A bare number is uninterpretable unless the variant is named, so all three are returned here.`;
export const EXUDATE_BOUNDARY_NOTE = 'DISCLOSURE AT THIS GRADE ONLY: the exudate boundary at exactly 10% is rendered both ways - one source makes mild "under 10%" and severe "10% or more", another makes mild "10% or less" and severe "over 10%". This tile treats 10% or more as severe. The two renderings agree at every other value.';
export const RINGS_NOTE = 'THE RINGS GRADATIONS ARE NAMED BUT NOT DEFINED HERE. Published descriptors for mild, moderate and severe rings differ between renderings and were not double-confirmed, so the four grade labels are carried without asserting a descriptor for each.';
export const NO_BANDS_NOTE = 'THERE ARE NO VALIDATED SEVERITY BANDS and none is returned. The instrument was built as a reference for describing and following endoscopic findings, and it is used as a trial endpoint by CHANGE from a patient own baseline.';

const NOTE = `The EREFS endoscopic reference score (Hirano and colleagues 2013) grades five endoscopic features of eosinophilic esophagitis - edema, rings, exudates, furrows and stricture. ${REGION_NOTE} ${WEIGHT_NOTE} ${STRICTURE_NOTE} ${VARIANT_NOTE} ${RINGS_NOTE} ${NO_BANDS_NOTE} This describes endoscopic appearance. It does not diagnose eosinophilic esophagitis, which requires an esophageal biopsy with an eosinophil count and where a normal-looking esophagus can still be histologically active, does not measure symptoms or dysphagia, does not decide dilation, diet elimination, topical steroid or biologic therapy, and does not establish treatment response on its own.`;

const argKey = (region, feature) => `${region}${feature[0].toUpperCase()}${feature.slice(1)}`;
export { argKey };

// Grade 0 is a real grade here, so an empty value must be rejected BEFORE coercion - Number('') is 0, which
// would silently grade an unanswered item as absent.
export function findGrade(feature, value) {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (raw === '') return null;
  const n = Number(raw);
  if (!Number.isInteger(n)) return null;
  return feature.grades.find((g) => g.grade === n) || null;
}

// input: one grade per region-feature pair, e.g. proximalEdema, distalRings.
export function erefs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const chosen = {};
  for (const r of REGIONS) {
    for (const f of FEATURES) chosen[argKey(r.key, f.key)] = findGrade(f, o[argKey(r.key, f.key)]);
  }
  const missing = Object.entries(chosen).filter(([, v]) => !v);
  if (missing.length) {
    return {
      valid: false,
      message: `Grade all ${REGIONS.length * FEATURES.length} items - five features in each of the two regions. ${missing.length} still ungraded. ${REGION_NOTE}`,
    };
  }

  const perRegion = REGIONS.map((r) => {
    const items = FEATURES.map((f) => ({
      key: f.key, text: f.text, inflammatory: f.inflammatory,
      grade: chosen[argKey(r.key, f.key)].grade,
      gradeText: chosen[argKey(r.key, f.key)].text,
      max: f.grades.length - 1,
    }));
    return {
      region: r.key, text: r.text, items,
      score: items.reduce((a, i) => a + i.grade, 0),
      max: REGION_MAX,
    };
  });

  const total = perRegion.reduce((a, r) => a + r.score, 0);
  const inflammatory = perRegion.reduce(
    (a, r) => a + r.items.filter((i) => i.inflammatory).reduce((b, i) => b + i.grade, 0), 0);
  const modified = perRegion.reduce(
    (a, r) => a + r.items.filter((i) => i.grade > 0).length, 0);
  const exudateAtBoundary = perRegion.some((r) => r.items.some((i) => i.key === 'exudates' && i.grade === 2));
  const strictureAnywhere = perRegion.some((r) => r.items.some((i) => i.key === 'stricture' && i.grade === 1));

  const parts = [];
  parts.push(`EREFS full composite ${total} of ${TOTAL_MAX}: ${perRegion.map((r) => `${r.text} ${r.score} of ${r.max}`).join(', ')}.`);
  parts.push(`Named variants: full composite ${total} of ${TOTAL_MAX}; inflammatory subscore ${inflammatory} of ${INFLAMMATORY_MAX} (edema, exudates and furrows only); modified presence-or-absence score ${modified} of ${MODIFIED_MAX}. ${VARIANT_NOTE}`);
  parts.push(REGION_NOTE);
  parts.push(WEIGHT_NOTE);
  if (strictureAnywhere) {
    parts.push(`A stricture is recorded and contributed 1 point. ${STRICTURE_NOTE}`);
  } else {
    parts.push(STRICTURE_NOTE);
  }
  if (exudateAtBoundary) parts.push(EXUDATE_BOUNDARY_NOTE);
  parts.push(RINGS_NOTE);
  parts.push(NO_BANDS_NOTE);
  parts.push('This describes endoscopic appearance. It does not diagnose eosinophilic esophagitis, which requires a biopsy with an eosinophil count, does not measure symptoms or dysphagia, does not decide dilation, diet elimination, topical steroid or biologic therapy, and does not establish treatment response on its own.');

  return {
    valid: true,
    total,
    totalMax: TOTAL_MAX,
    perRegion,
    inflammatoryScore: inflammatory,
    inflammatoryMax: INFLAMMATORY_MAX,
    modifiedScore: modified,
    modifiedMax: MODIFIED_MAX,
    strictureAnywhere,
    band: null,                 // deliberately: no validated severity bands exist
    bandLabel: `EREFS ${total} of ${TOTAL_MAX} (proximal ${perRegion[0].score}, distal ${perRegion[1].score})`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
