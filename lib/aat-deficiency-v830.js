// spec-v830: alpha-1 antitrypsin deficiency - serum level, genotype, and who to test.
//
// Sources:
//   American Thoracic Society / European Respiratory Society statement: standards for the
//     diagnosis and management of individuals with alpha-1 antitrypsin deficiency. Am J
//     Respir Crit Care Med. 2003;168(7):818-900.
//   Franciosi AN, Hobbs BD, McElvaney NG, Carroll TP. Alpha-1 antitrypsin deficiency:
//     clarifying the role of the putative protective threshold. Eur Respir J.
//     2022;59(2):2101410. (PMID 34172471.)
//
// LEVELS. Deficiency is a serum level below 100 mg/dL (20 micromol/L). A level of 57 mg/dL
// (11 micromol/L) is the classical "protective threshold".
//
// THE PROTECTIVE THRESHOLD IS THE POINT OF THIS TILE, BECAUSE IT HAS BEEN REFUTED. The
// 11 micromol/L figure was used for decades to predict who would develop COPD. The evidence
// now shows that is inaccurate: no data demonstrate a risk of COPD that turns on that
// threshold, and genotype - PI*ZZ and rare ZZ-equivalents - is the indicator independently
// associated with COPD. A tool that reported "above the protective threshold, therefore not
// at risk" would be repeating a specific, published error.
//
// So this tile reports the level against both published figures AND says plainly that the
// second of them does not do the job it is usually asked to do, pointing at genotype instead.
//
// A NOTE ON UNITS, WHICH ARE NOT INTERCONVERTED HERE. The published pairs are 57 mg/dL with
// 11 micromol/L and 100 mg/dL with 20 micromol/L. Those imply different conversion factors
// (5.18 and 5.0), because they are conventional paired values rather than one exact
// conversion. Converting between them would invent a precision the literature does not have,
// so each unit is compared against its own published thresholds and neither is derived from
// the other.
//
// Pure: no DOM, no clock, no network.

export const AAT_NOTE = 'Alpha-1 antitrypsin deficiency is defined by the American Thoracic Society and European Respiratory Society standards as a serum level below 100 milligrams per decilitre, or 20 micromoles per liter, with 57 milligrams per decilitre or 11 micromoles per liter described as a protective threshold. That protective threshold is the part worth knowing about, because it has been refuted. It was used for decades to predict who would develop chronic obstructive pulmonary disease, and the evidence now shows no risk that turns on it; genotype is the indicator independently associated with the disease, particularly the ZZ genotype and rare equivalents. Reporting a level above the threshold as reassurance repeats a specific published error. The standards recommend testing every adult with chronic obstructive pulmonary disease, emphysema, incompletely reversible asthma or unexplained liver disease, and the siblings of anyone with the deficiency. The two unit systems are not converted into one another here, because the published pairs of 57 with 11 and 100 with 20 imply different factors and are conventional paired values rather than one exact conversion; each is compared against its own thresholds. Laboratory method matters too, since nephelometry and radial immunodiffusion do not give the same number for the same sample. It interprets results already obtained and it does not order testing or start augmentation therapy.';

const THRESHOLDS = {
  'mg-dl': { deficiency: 100, protective: 57, unit: 'mg/dL' },
  'umol-l': { deficiency: 20, protective: 11, unit: 'micromol/L' },
};

// Genotypes, with the risk statement the evidence supports.
const GENOTYPES = {
  mm: { text: 'PI*MM', risk: 'normal', detail: 'the normal genotype' },
  ms: { text: 'PI*MS', risk: 'normal', detail: 'not associated with an increased risk of COPD' },
  ss: { text: 'PI*SS', risk: 'mild', detail: 'mildly reduced levels; not established as an independent COPD risk' },
  mz: { text: 'PI*MZ', risk: 'intermediate', detail: 'carrier; a modest risk that is amplified by smoking, and not equivalent to ZZ' },
  sz: { text: 'PI*SZ', risk: 'intermediate', detail: 'intermediate deficiency; risk falls between MZ and ZZ and is strongly modified by smoking' },
  zz: { text: 'PI*ZZ', risk: 'severe', detail: 'severe deficiency, independently associated with COPD - the genotype the evidence supports as a risk indicator' },
  'rare-severe': { text: 'a rare ZZ-equivalent or null genotype', risk: 'severe', detail: 'severe deficiency, treated as ZZ-equivalent' },
  'not-tested': { text: 'genotype not determined', risk: null, detail: null },
};

const INDICATIONS = [
  { arg: 'copd', text: 'chronic obstructive pulmonary disease' },
  { arg: 'emphysema', text: 'emphysema' },
  { arg: 'irreversibleAsthma', text: 'incompletely reversible asthma' },
  { arg: 'unexplainedLiverDisease', text: 'unexplained liver disease' },
  { arg: 'sibling', text: 'a sibling with alpha-1 antitrypsin deficiency' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function aatDeficiency(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const level = num(o.serumLevel);
  if (level !== null && (level < 0 || level > 1000)) {
    return { valid: false, message: 'Serum alpha-1 antitrypsin level is out of range.' };
  }

  const unitKey = String(o.units == null ? '' : o.units).trim().toLowerCase() || 'mg-dl';
  const t = THRESHOLDS[unitKey];
  if (!t) return { valid: false, message: 'Units must be mg-dl or umol-l.' };

  const genoKey = String(o.genotype == null ? '' : o.genotype).trim().toLowerCase() || 'not-tested';
  const geno = GENOTYPES[genoKey];
  if (!geno) return { valid: false, message: 'Unrecognized genotype.' };

  const indications = INDICATIONS.filter((i) => truthy(o[i.arg])).map((i) => i.text);
  const testingIndicated = indications.length >= 1;

  let levelBand = null;
  let belowProtective = null;
  if (level !== null) {
    belowProtective = level < t.protective;
    levelBand = level < t.protective
      ? `below the classical protective threshold of ${t.protective} ${t.unit}`
      : (level < t.deficiency
        ? `deficient, below ${t.deficiency} ${t.unit}, but above the classical protective threshold of ${t.protective}`
        : `at or above ${t.deficiency} ${t.unit}, not in the deficient range`);
  }

  // The refuted threshold. Raised whenever a level has been given at all, because the error
  // runs in both directions: reassurance above it, and over-weighting below it.
  const thresholdNote = level !== null
    ? `The ${t.protective} ${t.unit} protective threshold has been refuted as a predictor of COPD risk. No data show a risk that turns on it, and genotype - PI*ZZ and rare equivalents - is the indicator independently associated with COPD. A level above this threshold is not reassurance, and a level below it is not a risk estimate.`
    : null;

  const genotypeNote = geno.risk
    ? `${geno.text}: ${geno.detail}.`
    : 'Genotype has not been determined. Since genotype rather than the serum level is what the evidence ties to COPD risk, this is the missing piece.';

  const testingNote = testingIndicated && genoKey === 'not-tested'
    ? `The standards recommend testing every adult with ${indications.join(', ')}. Testing is indicated here and has not been done.`
    : null;

  const methodNote = level !== null
    ? 'Laboratory method matters: nephelometry and radial immunodiffusion do not return the same value for the same sample, so compare a level against the reporting laboratory’s own reference range.'
    : null;

  return {
    valid: true,
    levelBand,
    belowProtective,
    deficient: level !== null && level < t.deficiency,
    units: t.unit,
    genotype: geno.text,
    genotypeRisk: geno.risk,
    testingIndicated,
    indications,
    thresholdNote,
    genotypeNote,
    testingNote,
    methodNote,
    abnormal: (level !== null && level < t.deficiency) || geno.risk === 'severe' || geno.risk === 'intermediate',
    bandLabel: geno.risk === 'severe' ? 'Severe deficiency genotype' : (levelBand ? 'Level interpreted' : 'Nothing to interpret yet'),
    band: level !== null
      ? `Alpha-1 antitrypsin ${level} ${t.unit} — ${levelBand}. Genotype: ${geno.text}.`
      : (geno.risk ? `Genotype ${geno.text} — ${geno.detail}.` : 'Enter a serum level or a genotype.'),
    detail: `Deficiency is a level below ${t.deficiency} ${t.unit}. The ${t.protective} ${t.unit} figure is the classical protective threshold and does NOT predict COPD risk. Units are not interconverted here: the published pairs imply different factors and are conventional rather than exact.`,
    note: AAT_NOTE,
  };
}

export { INDICATIONS, GENOTYPES };
