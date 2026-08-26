// spec-v796: EU-TIRADS (European Thyroid Association ultrasound risk stratification).
//
// Source:
//   Russ G, Bonnema SJ, Erdogan MF, Durante C, Ngu R, Leenhardt L. European Thyroid
//   Association guidelines for ultrasound malignancy risk stratification of thyroid nodules
//   in adults: the EU-TIRADS. Eur Thyroid J. 2017;6(5):225-237. (PMID 29167761.)
//
// FOUR high-risk features. Any ONE of them makes the nodule category 5, whatever else it
// looks like:
//   taller-than-wide (non-oval) shape
//   irregular margins
//   microcalcifications
//   marked hypoechogenicity
//
// With none of them present, the category comes from the basic appearance:
//   no nodule                                   category 1
//   pure cyst or entirely spongiform            category 2, benign
//   ovoid, smooth, iso- or hyperechoic          category 3, low risk
//   ovoid, smooth, mildly hypoechoic            category 4, intermediate risk
//
// FNA size thresholds, which differ per category and are the practical output:
//   category 2   no FNA on ultrasound grounds
//   category 3   FNA above 20 mm
//   category 4   FNA above 15 mm
//   category 5   FNA above 10 mm
//
// The thresholds run the intuitive way round: the more suspicious the nodule, the SMALLER
// it needs to be before a needle is indicated.
//
// Pure: no DOM, no clock, no network.

export const EU_TIRADS_NOTE = 'EU-TIRADS (Russ G, Bonnema SJ, Erdogan MF, Durante C, Ngu R, Leenhardt L, Eur Thyroid J 2017;6(5):225-237) sorts a thyroid nodule on ultrasound into one of five categories and says at what size a needle is indicated. Four features count as high risk: a taller-than-wide shape, irregular margins, microcalcifications, and marked hypoechogenicity. Any one of them puts the nodule in category 5 whatever else it looks like. With none of them, a pure cyst or an entirely spongiform nodule is category 2 and benign, an ovoid smooth iso- or hyperechoic nodule is category 3, and an ovoid smooth mildly hypoechoic one is category 4. Fine-needle aspiration is indicated above 20 millimetres in category 3, above 15 in category 4 and above 10 in category 5, and is not indicated on ultrasound grounds in category 2, so the more suspicious the nodule the smaller it needs to be before a needle is warranted. This reports an ultrasound category and the size rule that goes with it; it does not read the images, and a needle decision also weighs clinical risk factors, suspicious lymph nodes and what the patient wants.';

const HIGH_RISK = [
  { arg: 'tallerThanWide', text: 'taller-than-wide shape' },
  { arg: 'irregularMargins', text: 'irregular margins' },
  { arg: 'microcalcifications', text: 'microcalcifications' },
  { arg: 'markedHypoechogenicity', text: 'marked hypoechogenicity' },
];

const APPEARANCE = {
  'no-nodule': { category: 1, label: 'no nodule' },
  benign: { category: 2, label: 'pure cyst or entirely spongiform' },
  'iso-hyperechoic': { category: 3, label: 'ovoid, smooth, iso- or hyperechoic' },
  'mildly-hypoechoic': { category: 4, label: 'ovoid, smooth, mildly hypoechoic' },
};

// Category -> the size in mm ABOVE which FNA is indicated. null means no FNA on
// ultrasound grounds.
const FNA_THRESHOLD = { 1: null, 2: null, 3: 20, 4: 15, 5: 10 };
const CATEGORY_NAME = { 1: 'no nodule', 2: 'benign', 3: 'low risk', 4: 'intermediate risk', 5: 'high risk' };

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function euTirads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const key = o.appearance === undefined || o.appearance === null || o.appearance === '' ? 'iso-hyperechoic' : String(o.appearance).trim();
  if (!Object.prototype.hasOwnProperty.call(APPEARANCE, key)) {
    return { valid: false, code: 'INVALID_INPUT', field: 'appearance', message: 'Appearance must be no-nodule, benign, iso-hyperechoic or mildly-hypoechoic.', note: EU_TIRADS_NOTE };
  }

  let size = null;
  if (o.sizeMm !== '' && o.sizeMm !== null && o.sizeMm !== undefined) {
    const n = typeof o.sizeMm === 'number' ? o.sizeMm : Number(String(o.sizeMm).trim());
    if (!Number.isFinite(n) || n < 0 || n > 200) {
      return { valid: false, code: 'INVALID_INPUT', field: 'sizeMm', message: 'Enter a nodule size between 0 and 200 mm.', note: EU_TIRADS_NOTE };
    }
    size = n;
  }

  const features = HIGH_RISK.filter((f) => truthy(o[f.arg])).map((f) => f.text);
  // A high-risk feature overrides the basic appearance - except that there is no nodule
  // to classify when the reader has said there is none.
  const category = key === 'no-nodule' ? 1 : (features.length > 0 ? 5 : APPEARANCE[key].category);
  const threshold = FNA_THRESHOLD[category];

  let fna;
  if (threshold === null) {
    fna = category === 1 ? 'No nodule to sample.' : 'Fine-needle aspiration not indicated on ultrasound grounds.';
  } else if (size === null) {
    fna = `Enter a size: fine-needle aspiration is indicated above ${threshold} mm in this category.`;
  } else if (size > threshold) {
    fna = `Fine-needle aspiration indicated: ${size} mm is above the ${threshold} mm threshold for this category.`;
  } else {
    fna = `Fine-needle aspiration not indicated on size: ${size} mm is at or below the ${threshold} mm threshold for this category.`;
  }

  return {
    valid: true,
    category,
    categoryName: CATEGORY_NAME[category],
    highRiskFeatures: features,
    fnaThresholdMm: threshold,
    fnaIndicated: threshold !== null && size !== null && size > threshold,
    fna,
    abnormal: category >= 4,
    bandLabel: `EU-TIRADS ${category}`,
    band: `EU-TIRADS ${category} — ${CATEGORY_NAME[category]}. ${fna}`,
    detail: 'Any one of a taller-than-wide shape, irregular margins, microcalcifications or marked hypoechogenicity makes the nodule category 5 whatever else it looks like. Otherwise: pure cyst or entirely spongiform is 2, ovoid smooth iso- or hyperechoic is 3, ovoid smooth mildly hypoechoic is 4. Fine-needle aspiration above 20 mm in category 3, above 15 in category 4, above 10 in category 5, and not on ultrasound grounds in category 2.',
    note: EU_TIRADS_NOTE,
  };
}
