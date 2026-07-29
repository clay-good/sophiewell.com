// spec-v590: the original 1996 Five-Factor Score for systemic necrotizing vasculitis. A PREDECESSOR GAP:
// `ffs-2011`, the revision, has been in the catalog since spec-v148, and the score it revised was absent.
// `grep -c "id: 'ffs-1996'" app.js` returned 0.
//
// **THE TWO SCORES SHARE A NAME, A RANGE AND A BAND STRUCTURE, AND ONLY ONE ITEM.** Both run 0 to 5 and both
// are read as 0, 1, or 2 or more. But of the five factors, ONLY GASTROINTESTINAL INVOLVEMENT survives
// unchanged. Cardiomyopathy became cardiac insufficiency; renal involvement survived but its threshold MOVED
// and proteinuria was dropped from the score entirely; CENTRAL NERVOUS SYSTEM INVOLVEMENT WAS DROPPED; and
// AGE OVER 65 -- a demographic variable, not an organ -- WAS ADDED. An identical number from the two scores
// does not mean the same thing, and a value cannot be carried between them.
//
// **THE RENAL THRESHOLD MOVED BY 10 MICROMOL PER LITRE, WHICH IS ENOUGH TO CROSS.** 1996 counts a creatinine
// ABOVE 140 micromol/L (1.58 mg/dL); the 2011 revision counts one AT OR ABOVE 150. A patient at 145
// micromol/L scores the renal factor on this score and does NOT score it on the revision. This lib reports
// that crossing explicitly whenever it happens, because the two scores are routinely quoted
// interchangeably.
//
// **THE SUCCESSOR CONTAINS AN ITEM THAT SCORES FOR ITS ABSENCE; THIS ONE HAS NOTHING LIKE IT.** In the 2011
// revision the ABSENCE of ear, nose and throat manifestations scores a point, because their presence marks a
// better-prognosis phenotype. Every factor in the 1996 score counts for something being PRESENT. A reader
// moving between the two who assumes all factors point the same way will invert that item.
//
// **THIS SCORE WAS NEVER DERIVED IN GRANULOMATOSIS WITH POLYANGIITIS.** The 1996 cohort was 342 patients
// with polyarteritis nodosa and Churg-Strauss syndrome; microscopic polyangiitis is conventionally included
// with them. Granulomatosis with polyangiitis (Wegener) was added only in the 2011 revision's cohort of
// 1108. Applying this score to it is outside its derivation, and this tool says so rather than quietly
// accepting the input.
//
// **THE FIVE-YEAR MORTALITY FIGURES FOR THIS VERSION ARE DELIBERATELY WITHHELD.** The mortality percentages
// most often quoted alongside "the Five-Factor Score" belong to the 2011 revision's cohort, and the 1996
// figures could not be confirmed from two independent sources. Under the spec-v97 gate an unconfirmed number
// is not reported, so this lib returns the score and its band and NO percentage, and says why. Quoting the
// revision's percentages against this score would be attaching one cohort's outcomes to a different set of
// factors.
//
// HIGH-STAKES: this is a PROGNOSTIC score at a group level, used historically to decide how intensively to
// treat. It does NOT diagnose vasculitis, does not classify which vasculitis, and does not measure disease
// ACTIVITY -- that is a separate axis. It does not select immunosuppression, does not set a
// cyclophosphamide or rituximab decision, and a score of 0 is not a reason to withhold treatment
// (spec-v11 section 5.3).
//
// FACTORS AND THRESHOLDS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT REPRODUCTIONS, NEVER
// RECALLED (spec-v97):
//   - Guillevin L, Lhote F, Gayraud M, et al. Prognostic factors in polyarteritis nodosa and Churg-Strauss
//     syndrome. A prospective study in 342 patients. Medicine (Baltimore). 1996;75(1):17-28.
//   - Guillevin L, Pagnoux C, Seror R, et al. The Five-Factor Score revisited. Medicine (Baltimore).
//     2011;90(1):19-27 (the revision, and the source of the compared item list).

export const CREATININE_THRESHOLD_UMOL = 140;      // above this scores; 1.58 mg/dL
export const CREATININE_THRESHOLD_MGDL = 1.58;
export const REVISION_CREATININE_UMOL = 150;       // at or above this scores on FFS-2011
export const PROTEINURIA_THRESHOLD_G = 1;          // g per 24 hours
export const FFS_MAX = 5;

export const FACTORS = [
  { key: 'proteinuria', text: `Proteinuria above ${PROTEINURIA_THRESHOLD_G} g per 24 hours`, fate: 'DROPPED from the 2011 revision entirely.' },
  { key: 'renalInsufficiency', text: `Serum creatinine above ${CREATININE_THRESHOLD_UMOL} micromol/L (${CREATININE_THRESHOLD_MGDL} mg/dL)`, fate: `Survived, but the threshold MOVED to at or above ${REVISION_CREATININE_UMOL} micromol/L.` },
  { key: 'gastrointestinal', text: 'Gastrointestinal involvement (hemorrhage, infarction or pancreatitis)', fate: 'THE ONLY FACTOR THAT SURVIVED UNCHANGED.' },
  { key: 'cardiomyopathy', text: 'Cardiomyopathy', fate: 'Survived in altered form, as cardiac insufficiency.' },
  { key: 'cns', text: 'Central nervous system involvement', fate: 'DROPPED from the 2011 revision.' },
];

export const REVISION_ONLY_FACTORS = [
  'Age over 65 years - a demographic variable, not an organ, added by the revision',
  'ABSENCE of ear, nose and throat manifestations - the revision’s one factor that scores for something NOT being present',
];

export const DERIVED_DISEASES = ['polyarteritis nodosa', 'Churg-Strauss syndrome (eosinophilic granulomatosis with polyangiitis)', 'microscopic polyangiitis'];
export const OUT_OF_DERIVATION = 'granulomatosis with polyangiitis';

const BANDS = [
  { max: 0, label: 'FFS 0' },
  { max: 1, label: 'FFS 1' },
  { max: FFS_MAX, label: 'FFS 2 or more' },
];

export const WITHHELD_MORTALITY_NOTE = 'The five-year mortality percentages usually quoted alongside "the Five-Factor Score" belong to the 2011 revision’s cohort, and the 1996 figures could not be confirmed from two independent sources. Under this catalog’s sourcing rule an unconfirmed number is not reported, so no percentage is given here. Quoting the revision’s percentages against this score would attach one cohort’s outcomes to a different set of factors.';
export const OVERLAP_NOTE = 'The two scores share a name, a 0 to 5 range and the same 0 / 1 / 2-or-more band structure, and only ONE factor: gastrointestinal involvement. Cardiomyopathy became cardiac insufficiency, the renal threshold moved and proteinuria was dropped, central nervous system involvement was dropped, and age over 65 was added. An identical number from the two scores does not mean the same thing.';
export const INVERSION_NOTE = 'The 2011 revision contains a factor that scores for its ABSENCE - absence of ear, nose and throat manifestations. Nothing in the 1996 score works that way: every factor here counts something being PRESENT. A reader moving between the two who assumes all factors point the same way will invert that item.';

const NOTE = `The original Five-Factor Score (Guillevin and colleagues 1996) is a prognostic score for systemic necrotizing vasculitis, one point for each of five factors, 0 to ${FFS_MAX}: proteinuria above ${PROTEINURIA_THRESHOLD_G} g per 24 hours; serum creatinine above ${CREATININE_THRESHOLD_UMOL} micromol/L, that is ${CREATININE_THRESHOLD_MGDL} mg/dL; gastrointestinal involvement in the form of hemorrhage, infarction or pancreatitis; cardiomyopathy; and central nervous system involvement. It is read as 0, 1, or 2 or more. The 2011 revision, also in this catalog, shares the name, the range and the band structure but only ONE factor, gastrointestinal involvement: cardiomyopathy became cardiac insufficiency, the renal threshold moved to at or above ${REVISION_CREATININE_UMOL} micromol/L and proteinuria was dropped, central nervous system involvement was dropped, and age over 65 was added along with a factor that scores for the ABSENCE of ear, nose and throat manifestations. An identical number from the two scores does not mean the same thing and a value cannot be carried between them. Because the renal threshold moved by only 10 micromol/L, a patient at 145 scores the renal factor here and not on the revision. This score was derived in 342 patients with polyarteritis nodosa and Churg-Strauss syndrome, with microscopic polyangiitis conventionally included; granulomatosis with polyangiitis was added only in the revision, so applying this score to it is outside its derivation. The five-year mortality percentages usually quoted alongside the Five-Factor Score belong to the revision, and the 1996 figures could not be confirmed from two independent sources, so none is reported here. This is a group-level prognostic score. It does not diagnose vasculitis, does not classify which vasculitis, and does not measure disease activity, which is a separate axis. It does not select immunosuppression and a score of 0 is not a reason to withhold treatment.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}
function readNum(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} must be a number that is 0 or more.`);
  return n;
}

// input: one key per FACTORS entry (yes/no), plus optional creatinineUmol for the crossover check,
// plus optional disease.
export function ffs1996(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let read, creat;
  try {
    read = FACTORS.map((f) => ({ f, v: readBool(o[f.key], f.text) }));
    creat = readNum(o.creatinineUmol, 'Serum creatinine in micromol/L');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = read.filter((x) => x.v === null).map((x) => x.f.key);
  if (missing.length) {
    return { valid: false, message: `Answer every factor. Still needed: ${missing.join(', ')}.` };
  }

  const total = read.filter((x) => x.v).length;
  const band = BANDS.find((b) => total <= b.max);
  const disease = o.disease ? String(o.disease).trim() : '';
  const outOfDerivation = disease === 'granulomatosis-with-polyangiitis';

  // The 10 micromol/L window in which the two scores disagree on the renal factor.
  const renalCrossover = creat !== null
    && creat > CREATININE_THRESHOLD_UMOL && creat < REVISION_CREATININE_UMOL;

  const parts = [];
  parts.push(`FFS-1996 ${total} of ${FFS_MAX}: ${band.label}.`);
  parts.push(OVERLAP_NOTE);
  if (renalCrossover) {
    parts.push(`A creatinine of ${creat} micromol/L sits in the 10 micromol/L window where the two scores disagree: it is ABOVE the 1996 threshold of ${CREATININE_THRESHOLD_UMOL} and BELOW the revision's ${REVISION_CREATININE_UMOL}, so the renal factor scores here and does NOT score on the revision.`);
  }
  parts.push(INVERSION_NOTE);
  if (outOfDerivation) {
    parts.push(`${OUT_OF_DERIVATION} was NOT in this score's derivation cohort - it was added only in the 2011 revision - so this result is outside the setting in which the 1996 score was validated.`);
  }
  parts.push(WITHHELD_MORTALITY_NOTE);
  parts.push('This is a group-level prognostic score. It does not diagnose vasculitis, does not classify which vasculitis, and does not measure disease activity, which is a separate axis. It does not select immunosuppression, and a score of 0 is not a reason to withhold treatment.');

  return {
    valid: true,
    total,
    max: FFS_MAX,
    metFactors: read.filter((x) => x.v).map((x) => x.f.key),
    band: band.label,
    fiveYearMortalityPercent: null,   // deliberately withheld; see WITHHELD_MORTALITY_NOTE
    renalThresholdCrossover: renalCrossover,
    outsideDerivationCohort: outOfDerivation,
    bandLabel: `FFS-1996 ${total} of ${FFS_MAX}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
