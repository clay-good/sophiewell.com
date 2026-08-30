// spec-v557: the modified Severity-Weighted Assessment Tool (mSWAT) for mycosis fungoides and Sezary
// syndrome. WHOLE-CONCEPT GAP: "mswat", "swat" and "mycosis" were all zero-hit across corpus.json, app.js
// and lib/meta.js. The catalog had no cutaneous lymphoma content of any kind.
//
// mSWAT = (percent body surface area at weight 1) + (2 x percent at weight 2) + (4 x percent at weight 4).
//
// **THE SCORE RUNS 0 TO 400, NOT 0 TO 100.** The inputs are percentages of body surface area, so the
// instinct is to read the output as a percentage too. It is not: 100 percent of the body covered in tumor
// scores 4 x 100 = 400. A reader who caps their mental scale at 100 will treat a score of 180 as impossible
// or as "180 percent", when it is an ordinary score for extensive plaque disease.
//
// **THE THREE LESION CATEGORIES ARE MUTUALLY EXCLUSIVE PER UNIT OF SKIN, SO THE THREE PERCENTAGES SUM TO AT
// MOST 100.** The same square centimetre is counted ONCE -- as patch OR plaque OR tumor, whichever it is.
// They are not three independent measurements of the same skin. This lib enforces the ceiling, because
// three fields each accepting 0-100 invite three independent estimates that silently double-count the
// patient's body.
//
// **THE TUMOR WEIGHT IS 4 IN mSWAT AND WAS 3 IN THE ORIGINAL SWAT.** That is the modification the "m"
// refers to. A score copied from older records without its version is not comparable, so this lib exports
// both weights and states which it applies. Ulcers are scored with tumors, at 4.
//
// **THE ERYTHRODERMIC AND NONERYTHRODERMIC FORMS USE DIFFERENT LESION VOCABULARIES FOR THE SAME
// ARITHMETIC.** An erythrodermic patient is scored as patch, plaque and tumor; a nonerythrodermic patient as
// mild infiltration, moderate infiltration and tumor. The weights are identical -- 1, 2 and 4 -- and only
// the descriptors change. Presenting "patch" to a clinician assessing an erythrodermic patient, or
// "infiltration" to one assessing discrete lesions, asks a question the source does not ask, so the labels
// switch with the erythroderma flag rather than being fixed.
//
// **THERE ARE NO SEVERITY BANDS, AND THIS TILE DOES NOT INVENT ANY.** mSWAT is a continuous burden measure.
// Its published use is as a CHANGE from a patient's own baseline -- a reduction of 50 percent or more is a
// partial skin response -- which is a property of a comparison between two scores, not of one score. There
// is no published mild, moderate or severe cut point, and adding one would be fabrication of exactly the
// kind a calculator makes easy. The result reports the score and what the response threshold applies to.
//
// AREA IS THE PATIENT'S OWN PALM PLUS FINGERS AS 1 PERCENT OF BODY SURFACE AREA. It is patient-relative,
// not an absolute area. Some protocols additionally use the palm without fingers as 0.5 percent.
//
// A 12-REGION PERCENT-BSA REFERENCE TABLE IS DELIBERATELY NOT IMPLEMENTED. Only two of its values could be
// independently confirmed, so shipping the whole table would present ten single-sourced numbers with the
// authority of the rest of the instrument. The core scoring does not need it: the assessor supplies percent
// body surface area directly, which is what the source asks for (spec-v97).
//
// HIGH-STAKES: this measures SKIN TUMOR BURDEN ONLY. It does NOT stage mycosis fungoides or Sezary
// syndrome, which is a TNMB classification requiring assessment of nodes, viscera and BLOOD -- and Sezary
// syndrome is defined by blood involvement that this instrument cannot see at all, so a patient with
// limited skin disease and a high blood tumor burden scores low while having advanced disease. It does not
// diagnose cutaneous lymphoma, which requires biopsy with clonality studies, and does not distinguish it
// from the inflammatory dermatoses it mimics for years. It does not detect large-cell transformation, does
// not select therapy, and is not a response assessment on its own, since global response combines skin with
// the other compartments (spec-v11 section 5.3). The oncologic decision stays with the clinician.
//
// WEIGHTS, FORMULA AND THE PALM RULE RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from three
// independent reproductions agreeing on every weight, the palm rule and both formula variants:
//   - Olsen EA, Whittaker S, Kim YH, et al. Clinical end points and response criteria in mycosis fungoides
//     and Sezary syndrome: a consensus statement of the International Society for Cutaneous Lymphomas, the
//     United States Cutaneous Lymphoma Consortium, and the Cutaneous Lymphoma Task Force of the European
//     Organisation for Research and Treatment of Cancer. J Clin Oncol. 2011;29(18):2598-2607.

export const MSWAT_TUMOR_WEIGHT = 4;        // mSWAT
export const SWAT_ORIGINAL_TUMOR_WEIGHT = 3; // the original SWAT, for comparison only
export const MSWAT_MAX = 400;               // 100 percent body surface area of tumor, at weight 4
export const MAX_TOTAL_BSA = 100;
export const PARTIAL_SKIN_RESPONSE_REDUCTION = 50;

// The same three weights under both vocabularies. Only the descriptors change.
export const MSWAT_CATEGORIES = [
  {
    key: 'weight1', weight: 1,
    erythrodermic: 'Patch (flat lesion)',
    nonerythrodermic: 'Mild infiltration',
  },
  {
    key: 'weight2', weight: 2,
    erythrodermic: 'Plaque (raised lesion)',
    nonerythrodermic: 'Moderate infiltration',
  },
  {
    key: 'weight4', weight: MSWAT_TUMOR_WEIGHT,
    erythrodermic: 'Tumor or ulcer',
    nonerythrodermic: 'Tumor or ulcer',
  },
];

export function categoryLabel(category, erythrodermic) {
  return erythrodermic ? category.erythrodermic : category.nonerythrodermic;
}

const RANGE_TEXT = `The score runs 0 to ${MSWAT_MAX}, NOT 0 to 100: the inputs are percentages of body surface area, but a body wholly covered in tumor scores 4 times 100. A score above 100 is ordinary, not impossible.`;

const EXCLUSIVE_TEXT = `The three categories are mutually exclusive per unit of skin: each square centimeter is counted ONCE, so the three percentages together cannot exceed ${MAX_TOTAL_BSA}.`;

const WEIGHT_TEXT = `Tumors and ulcers are weighted ${MSWAT_TUMOR_WEIGHT} in mSWAT, against ${SWAT_ORIGINAL_TUMOR_WEIGHT} in the original SWAT. A score copied from an older record without its version is not comparable.`;

const NO_BANDS_TEXT = `There are NO published severity bands, and none is given here. mSWAT is a continuous burden measure, and its published threshold is a CHANGE from the same patient’s baseline: a reduction of ${PARTIAL_SKIN_RESPONSE_REDUCTION} percent or more is a partial skin response. That is a property of a comparison between two scores, not of a single score.`;

const NOTE = 'The modified Severity-Weighted Assessment Tool (Olsen and colleagues 2011) measures skin tumor burden in mycosis fungoides and Sezary syndrome. It multiplies the percentage of body surface area involved by each lesion type by that type’s weight and sums the products: weight 1, weight 2, and weight 4 for tumors or ulcers. The score therefore runs 0 to 400 rather than 0 to 100, because a body wholly covered in tumor scores four times one hundred, and a reader who caps a mental scale at 100 will treat an ordinary score of 180 as impossible. The three categories are mutually exclusive per unit of skin, so each square centimeter is counted once and the three percentages together cannot exceed 100; they are not three independent measurements of the same skin. The tumor weight is 4 in mSWAT and was 3 in the original SWAT, which is what the modification refers to, so a score copied from an older record without its version is not comparable. The erythrodermic and nonerythrodermic forms use different lesion vocabularies for identical arithmetic: an erythrodermic patient is scored as patch, plaque and tumor, while a nonerythrodermic patient is scored as mild infiltration, moderate infiltration and tumor, with the same weights of 1, 2 and 4. Area is measured with the patient’s own palm plus fingers taken as 1 percent of body surface area, so the unit is patient-relative rather than absolute. There are no published severity bands and none is invented here: mSWAT is a continuous measure whose published threshold is a change from the same patient’s baseline, a reduction of 50 percent or more being a partial skin response, which is a property of a comparison rather than of a single score. This measures SKIN burden only. It does not stage mycosis fungoides or Sezary syndrome, which is a TNMB classification requiring assessment of nodes, viscera and blood, and Sezary syndrome is defined by blood involvement this instrument cannot see, so a patient with limited skin disease and a high blood tumor burden scores low while having advanced disease. It does not diagnose cutaneous lymphoma, which requires biopsy with clonality studies, and does not distinguish it from the inflammatory dermatoses it can mimic for years. It does not detect large-cell transformation, does not select therapy, and is not a response assessment on its own, because global response combines skin with the other compartments.';

function readPercent(raw) {
  if (raw === '' || raw === null || raw === undefined) return 0;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || n > MAX_TOTAL_BSA) return NaN;
  return n;
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
//   erythrodermic -- yes/no. Required: it selects the lesion vocabulary, though not the arithmetic.
//   weight1, weight2, weight4 -- percent body surface area in each category. Blank counts as 0.
export function mswat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const erythrodermic = readBool(o.erythrodermic);
  if (erythrodermic === null) {
    return { valid: false, message: 'Say whether the patient is erythrodermic. It selects the lesion vocabulary: patch and plaque for erythrodermic disease, mild and moderate infiltration otherwise. The weights are the same either way.' };
  }
  if (Number.isNaN(erythrodermic)) {
    return { valid: false, message: 'The erythroderma answer must be yes or no.' };
  }

  const rows = [];
  for (const category of MSWAT_CATEGORIES) {
    const percent = readPercent(o[category.key]);
    if (Number.isNaN(percent)) {
      return { valid: false, message: `The body surface area for "${categoryLabel(category, erythrodermic)}" must be a percentage from 0 to ${MAX_TOTAL_BSA}.` };
    }
    rows.push({
      key: category.key,
      label: categoryLabel(category, erythrodermic),
      weight: category.weight,
      percent,
      contribution: percent * category.weight,
    });
  }

  const totalBsa = rows.reduce((a, r) => a + r.percent, 0);
  if (totalBsa > MAX_TOTAL_BSA + 1e-9) {
    return { valid: false, message: `The three areas total ${totalBsa} percent of body surface area, which exceeds ${MAX_TOTAL_BSA}. Each square centimeter of skin is counted once, in one category only, so these are not independent measurements.` };
  }

  const total = rows.reduce((a, r) => a + r.contribution, 0);
  const rounded = Math.round(total * 100) / 100;

  return {
    valid: true,
    total: rounded,
    max: MSWAT_MAX,
    erythrodermic,
    totalBsa,
    categories: rows,
    tumorWeight: MSWAT_TUMOR_WEIGHT,
    bandsPublished: false,
    bandLabel: `mSWAT ${rounded} of ${MSWAT_MAX}`,
    bandText: `mSWAT ${rounded} (range 0 to ${MSWAT_MAX}), from ${totalBsa} percent of body surface area involved. ${RANGE_TEXT} ${EXCLUSIVE_TEXT} ${WEIGHT_TEXT} ${NO_BANDS_TEXT} It measures skin burden only and does not stage the disease, which requires nodes, viscera and blood.`,
    note: NOTE,
  };
}
