// spec-v606: the new Katagiri (2014) prognostic score for skeletal metastasis. A CLUSTER-COMPLETION gap:
// `tokuhashi-revised`, `tomita-score` and `bauer-score` are all in the catalog, and this fourth member --
// the only one derived in patients treated mostly NON-surgically -- was not. Every slug spelling and
// filename search returned 0.
//
// **THE PRIMARY-SITE ITEM IS DEFINED BY TREATABILITY, NOT BY ORGAN, AND THE SAME ORGAN APPEARS IN TWO
// DIFFERENT GROUPS.** Breast and prostate cancer are SLOW growth (0 points) when HORMONE-DEPENDENT and
// MODERATE growth (2 points) when hormone-INDEPENDENT. Lung cancer is MODERATE (2) when molecularly targeted
// and RAPID (3) when it is not. So naming the organ does not determine the score -- the score turns on
// whether the disease still has a treatment that works. An implementation that maps organ to group will be
// wrong for the commonest primaries in the series.
//
// **THE LABORATORY ITEM IS TWO TIERS OF DIFFERENT ANALYTES, NOT A SEVERITY LADDER OF THE SAME ONES.**
// "Abnormal" (1 point) means C-reactive protein at or above 0.4 mg/dL, lactate dehydrogenase at or above 250
// IU/L, or albumin below 3.7 g/dL. "Critical" (2 points) means platelets below 100,000 per microlitre,
// calcium at or above 10.3 mg/dL, or total bilirubin at or above 1.4. THE TWO TIERS SHARE NO ANALYTE. A
// patient with a CRP of 200 scores 1, while a patient whose only abnormality is a platelet count of 99,000
// scores 2. Reading the tiers as mild-versus-severe of the same measurement is wrong.
//
// **EACH LABORATORY TIER IS ANY-OF, AND CRITICAL OUTRANKS ABNORMAL.** One qualifying value in a tier is
// enough, three do not score more, and any critical value fixes the item at 2 regardless of how many
// abnormal ones are present.
//
// **THE 2014 SCORE UPDATED A 2005 PREDECESSOR BY ADDING THE LABORATORY ITEM.** A score computed without it
// is the older instrument, not this one.
//
// HIGH-STAKES: this is a group-level SURVIVAL estimate for a patient who already has symptomatic skeletal
// metastasis. It does NOT decide whether to operate, does not choose between surgery, radiotherapy and
// systemic treatment, and does not grade the bone -- mechanical stability and fracture risk are separate
// axes covered by other tiles in this catalog. It was derived in a cohort treated mostly NON-surgically, so
// applying it to a purely surgical series is outside its derivation. Survival estimates from any era of
// oncology date quickly, and the primary-site groupings in particular assume the therapies available when
// the score was built (spec-v11 section 5.3).
//
// FACTORS, POINTS, THE LABORATORY THRESHOLDS AND THE SURVIVAL BANDS RE-FETCHED AND DOUBLE-CONFIRMED, NEVER
// RECALLED (spec-v97), the full table taken from the primary's own open-access text:
//   - Katagiri H, Okada R, Takagi T, et al. New prognostic factors and scoring system for patients with
//     skeletal metastasis. Cancer Med. 2014;3(5):1359-1367.

export const MAX_SCORE = 10;

export const PRIMARY_SITE_GROUPS = [
  {
    value: 'slow', points: 0, text: 'Slow growth',
    examples: 'hormone-DEPENDENT breast or prostate cancer, thyroid cancer, multiple myeloma, malignant lymphoma',
  },
  {
    value: 'moderate', points: 2, text: 'Moderate growth',
    examples: 'molecularly targeted lung cancer, hormone-INDEPENDENT breast or prostate cancer, renal cell carcinoma, sarcoma',
  },
  {
    value: 'rapid', points: 3, text: 'Rapid growth',
    examples: 'non-targeted lung cancer, colorectal, gastric, pancreatic, head and neck, esophageal, hepatocellular carcinoma, melanoma, and cancer of unknown origin',
  },
];

export const VISCERAL_GROUPS = [
  { value: 'none', points: 0, text: 'No visceral or cerebral metastases' },
  { value: 'nodular', points: 1, text: 'Nodular visceral or cerebral metastasis' },
  { value: 'disseminated', points: 2, text: 'Disseminated metastasis - pleural, peritoneal or leptomeningeal' },
];

// The two laboratory tiers share NO analyte. That is the point.
export const ABNORMAL_LABS = [
  { key: 'crpHigh', text: 'C-reactive protein at or above 0.4 mg/dL' },
  { key: 'ldhHigh', text: 'Lactate dehydrogenase at or above 250 IU/L' },
  { key: 'albuminLow', text: 'Serum albumin below 3.7 g/dL' },
];
export const CRITICAL_LABS = [
  { key: 'plateletsLow', text: 'Platelets below 100,000 per microliter' },
  { key: 'calciumHigh', text: 'Serum calcium at or above 10.3 mg/dL' },
  { key: 'bilirubinHigh', text: 'Total bilirubin at or above 1.4' },
];

export const BINARY_ITEMS = [
  { key: 'poorPerformanceStatus', points: 1, text: 'ECOG performance status 3 or 4' },
  { key: 'previousChemotherapy', points: 1, text: 'Previous chemotherapy' },
  { key: 'multipleSkeletalMetastases', points: 1, text: 'Multiple skeletal metastases' },
];

// Derivation-cohort one-year survival.
export const BANDS = [
  { max: 3, label: '0 to 3', risk: 'low risk', oneYearSurvival: 91 },
  { max: 6, label: '4 to 6', risk: 'intermediate risk', oneYearSurvival: 49 },
  { max: MAX_SCORE, label: '7 to 10', risk: 'high risk', oneYearSurvival: 6 },
];

export const TREATABILITY_NOTE = 'The primary-site item is defined by TREATABILITY, not by organ, and the same organ appears in two different groups: breast and prostate are SLOW growth when hormone-DEPENDENT and MODERATE when hormone-INDEPENDENT, and lung is MODERATE when molecularly targeted and RAPID when it is not. Naming the organ does not determine the score - it turns on whether the disease still has a treatment that works.';
export const LAB_TIER_NOTE = 'The laboratory item is TWO TIERS OF DIFFERENT ANALYTES, not a severity ladder of the same ones. Abnormal means C-reactive protein, lactate dehydrogenase or albumin; critical means platelets, calcium or bilirubin. THE TWO TIERS SHARE NO ANALYTE, so a patient with a C-reactive protein of 200 scores 1 while a patient whose only abnormality is a platelet count of 99,000 scores 2.';
export const ANY_OF_NOTE = 'Each laboratory tier is ANY-OF: one qualifying value is enough, three do not score more, and any critical value fixes the item at 2 regardless of how many abnormal values are present.';
export const PREDECESSOR_NOTE = 'The 2014 score updated a 2005 predecessor by ADDING the laboratory item. A score computed without it is the older instrument, not this one.';
export const COHORT_NOTE = 'It was derived in a cohort treated mostly NON-surgically, unlike the other skeletal-metastasis scores in this catalog, so applying it to a purely surgical series is outside its derivation. The one-year survival figures are the derivation cohort’s; validation cohorts report different rates.';

const NOTE = `The new Katagiri score (Katagiri and colleagues 2014) estimates survival in a patient with symptomatic skeletal metastasis, from six factors totalling 0 to ${MAX_SCORE}: primary site by growth rate, 0 for slow, 2 for moderate and 3 for rapid; visceral or cerebral metastases, 0 for none, 1 for nodular and 2 for disseminated; laboratory data, 0 for normal, 1 for abnormal and 2 for critical; ECOG performance status 3 or 4, 1; previous chemotherapy, 1; and multiple skeletal metastases, 1. The primary-site item is defined by treatability rather than by organ, and the same organ appears in two groups, since breast and prostate are slow growth when hormone-dependent and moderate when hormone-independent, and lung is moderate when molecularly targeted and rapid when it is not. The laboratory item is two tiers of different analytes rather than a severity ladder: abnormal means C-reactive protein at or above 0.4 mg/dL, lactate dehydrogenase at or above 250 IU/L or albumin below 3.7 g/dL, while critical means platelets below 100,000 per microliter, calcium at or above 10.3 mg/dL or bilirubin at or above 1.4, and the two tiers share no analyte. Each tier is any-of, and any critical value fixes the item at 2. One-year survival in the derivation cohort was 91 percent at a score of 0 to 3, 49 percent at 4 to 6 and 6 percent at 7 to 10. The 2014 score updated a 2005 predecessor by adding the laboratory item, so a score computed without it is the older instrument. This is a group-level survival estimate. It does not decide whether to operate, does not choose between surgery, radiotherapy and systemic treatment, and does not grade the bone, since mechanical stability and fracture risk are separate axes. It was derived in a cohort treated mostly non-surgically, so applying it to a purely surgical series is outside its derivation, and the primary-site groupings assume the therapies available when the score was built.`;

function pick(list, v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const found = list.find((i) => i.value === String(v).trim());
  if (!found) throw new Error(`${name} must be one of: ${list.map((i) => i.value).join(', ')}.`);
  return found;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: primarySite, visceralMetastases, one key per ABNORMAL_LABS / CRITICAL_LABS / BINARY_ITEMS entry.
export function katagiri(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let site, visceral, abnormal, critical, binaries;
  try {
    site = pick(PRIMARY_SITE_GROUPS, o.primarySite, 'Primary site');
    visceral = pick(VISCERAL_GROUPS, o.visceralMetastases, 'Visceral or cerebral metastases');
    abnormal = ABNORMAL_LABS.map((l) => ({ l, v: readBool(o[l.key], l.text) }));
    critical = CRITICAL_LABS.map((l) => ({ l, v: readBool(o[l.key], l.text) }));
    binaries = BINARY_ITEMS.map((b) => ({ b, v: readBool(o[b.key], b.text) }));
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = [];
  if (!site) missing.push('primarySite');
  if (!visceral) missing.push('visceralMetastases');
  missing.push(...abnormal.filter((x) => x.v === null).map((x) => x.l.key));
  missing.push(...critical.filter((x) => x.v === null).map((x) => x.l.key));
  missing.push(...binaries.filter((x) => x.v === null).map((x) => x.b.key));
  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.join(', ')}. The two laboratory tiers use DIFFERENT analytes - they are not mild and severe versions of the same test.` };
  }

  const anyCritical = critical.some((x) => x.v);
  const anyAbnormal = abnormal.some((x) => x.v);
  const labPoints = anyCritical ? 2 : (anyAbnormal ? 1 : 0);
  const labTier = anyCritical ? 'critical' : (anyAbnormal ? 'abnormal' : 'normal');

  const binaryPoints = binaries.filter((x) => x.v).reduce((a, x) => a + x.b.points, 0);
  const total = site.points + visceral.points + labPoints + binaryPoints;
  const band = BANDS.find((b) => total <= b.max);

  const parts = [];
  parts.push(`Katagiri score ${total} of ${MAX_SCORE}: ${band.label}, ${band.risk}. One-year survival in the derivation cohort was ${band.oneYearSurvival} percent.`);
  parts.push(`Contributions: primary site ${site.points} (${site.text.toLowerCase()}), visceral or cerebral ${visceral.points}, laboratory ${labPoints} (${labTier}), and ${binaryPoints} from the three one-point items.`);
  parts.push(`${site.text} covers ${site.examples}. ${TREATABILITY_NOTE}`);
  if (anyCritical && anyAbnormal) {
    parts.push(`Both tiers have a qualifying value, and CRITICAL outranks abnormal, so the laboratory item scores 2 rather than 3. ${ANY_OF_NOTE}`);
  } else {
    parts.push(ANY_OF_NOTE);
  }
  parts.push(LAB_TIER_NOTE);
  parts.push(PREDECESSOR_NOTE);
  parts.push(COHORT_NOTE);
  parts.push('This is a group-level survival estimate. It does not decide whether to operate, does not choose between surgery, radiotherapy and systemic treatment, and does not grade the bone - mechanical stability and fracture risk are separate axes.');

  return {
    valid: true,
    total,
    max: MAX_SCORE,
    band: band.label,
    risk: band.risk,
    oneYearSurvivalPercent: band.oneYearSurvival,
    primarySitePoints: site.points,
    visceralPoints: visceral.points,
    laboratoryPoints: labPoints,
    laboratoryTier: labTier,
    binaryPoints,
    bothLabTiersPresent: anyCritical && anyAbnormal,
    bandLabel: `Katagiri ${total} of ${MAX_SCORE}, ${band.risk}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
