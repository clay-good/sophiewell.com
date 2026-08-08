// spec-v668: Coronary artery calcium (CAC) Agatston score interpretation.
//
// A standalone interpretation of a total CAC Agatston score into its risk category. The
// built MESA CHD risk tile (mesa) uses the CAC score only as one input to a risk model;
// this tile classifies the score itself and gives the guideline statin-decision context.
// Sources:
//   Agatston AS, Janowitz WR, Hildner FJ, et al. Quantification of coronary artery
//   calcium using ultrafast computed tomography. J Am Coll Cardiol. 1990;15(4):827-832.
//   PMID 2407762.
//   Grundy SM, Stone NJ, Bailey AL, et al. 2018 AHA/ACC... Guideline on the Management of
//   Blood Cholesterol. Circulation. 2019;139(25):e1082-e1143. PMID 30586774.
//
// Absolute-score bands (the load-bearing breakpoints 0/100/400 are consensus):
//   0 = no identifiable plaque; 1-99 = mild; 100-399 = moderate; >= 400 = severe/extensive.
// A CAC of 0 substantially lowers but does NOT eliminate cardiovascular risk (it reflects
// absence of calcified plaque, not soft/non-calcified plaque).
//
// Pure: no DOM, no clock, no network.

export const CAC_NOTE = 'Coronary artery calcium (CAC) Agatston score (Agatston AS, et al., J Am Coll Cardiol 1990;15(4):827-832). The total score classifies the calcified atherosclerotic burden: 0 is no identifiable plaque, 1 to 99 is mild, 100 to 399 is moderate, and 400 or more is severe or extensive (a finer scheme splits 1-99 into 1-10 minimal and 11-100 mild; the 100 and 400 breakpoints are shared across schemes). In borderline-to-intermediate-risk primary-prevention adults where the statin decision is uncertain, the 2018 AHA/ACC cholesterol guideline uses CAC as a decision aid: a score of 0 makes it reasonable to withhold or defer a statin and reassess (except with diabetes, current smoking, a strong family history, or other high-risk conditions); 1 to 99 favors starting a statin, especially at age 55 or older; and 100 or more, or a score at or above the 75th percentile for age, sex, and race, favors statin therapy. This framing is advisory, not an order. A CAC of 0 lowers but does not eliminate risk, because it does not detect soft (non-calcified) plaque, and it should not override sustained LDL-C elevation, especially in younger adults. This interprets the score entered; the percentile axis needs age, sex, and race and is not computed here.';

function band(score) {
  if (score === 0) return { category: 'none', label: 'no identifiable calcified plaque', range: '0' };
  if (score <= 99) return { category: 'mild', label: 'mild', range: '1-99' };
  if (score <= 399) return { category: 'moderate', label: 'moderate', range: '100-399' };
  return { category: 'severe', label: 'severe / extensive', range: '>= 400' };
}

export function cacAgatston(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.score;
  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'score', message: 'Enter the total coronary artery calcium (Agatston) score.' };
  }
  const score = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(score) || score < 0) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'score', message: `The CAC Agatston score is a whole number (0 or more). Got "${raw}".` };
  }

  const b = band(score);
  const abnormal = score >= 100; // moderate or greater
  return {
    valid: true,
    score,
    category: b.category,
    range: b.range,
    abnormal,
    bandLabel: `CAC ${score} — ${b.label} (${b.range})`,
    detail: score === 0
      ? 'No identifiable calcified plaque. Risk is low but not zero (calcium scoring does not detect soft plaque).'
      : `Calcified plaque burden is ${b.label} for the total score of ${score}.`,
    note: CAC_NOTE,
  };
}
