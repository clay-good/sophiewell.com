// spec-v333: Kikuchi classification of submucosal invasion in a SESSILE malignant colorectal
// lesion (Sm1 / Sm2 / Sm3). Kikuchi divides the submucosa into thirds and grades how deeply an
// invasive carcinoma has invaded: Sm1 (upper third) carries a low risk of lymph-node metastasis
// and is often amenable to endoscopic resection alone; Sm2 (middle) and Sm3 (lower, adjacent to
// the muscularis propria) carry a materially higher metastasis risk. Kikuchi is the sessile-lesion
// counterpart to the Haggitt classification (which applies to pedunculated polyps); the catalog
// now carries Haggitt (spec-v332) but had no Kikuchi. "kikuchi" / "submucosal invasion depth"
// routed to nothing.
//
// HIGH-STAKES: this reports the submucosal-invasion LEVEL the pathologist has determined, NOT a
// diagnosis, a resection recommendation, or a metastasis prediction for an individual patient
// (spec-v11 §5.3). The endoscopic-vs-surgical management decision stays with the clinician and the
// patient.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Kikuchi R, Takano M, Takagi K, et al. Management of early invasive colorectal cancer: risk
//     of recurrence and clinical guidelines. Dis Colon Rectum. 1995;38(12):1286-1295 (the
//     submucosa-in-thirds Sm1/Sm2/Sm3 scale).
//   - Reproductions in the Haggitt/Kikuchi comparison literature and endoscopy references giving
//     the same thirds and the ~0% / ~10% / ~25% lymph-node-metastasis figures, and the practical
//     Sm1 < 1000 microns (shallow, low-risk) vs Sm2/3 (deep, higher-risk) threshold.
//
// Levels (submucosa divided into thirds, for sessile / non-pedunculated lesions):
//   Sm1: invasion into the upper (superficial) third of the submucosa. ~0-3% node metastasis; low
//        risk, often managed by endoscopic resection alone when other features are favorable.
//   Sm2: invasion into the middle third. ~10% node metastasis.
//   Sm3: invasion into the lower third, adjacent to the muscularis propria. ~25% node metastasis;
//        surgical resection generally considered.

const LEVELS = {
  SM1: { level: 'Sm1', text: 'Kikuchi Sm1 — invasion into the upper (superficial) third of the submucosa. Low risk of lymph-node metastasis (~0-3%); often amenable to endoscopic resection alone when other histologic features are favorable.', highRisk: false },
  SM2: { level: 'Sm2', text: 'Kikuchi Sm2 — invasion into the middle third of the submucosa. Higher risk of lymph-node metastasis (~10%); surgical resection is generally considered.', highRisk: true },
  SM3: { level: 'Sm3', text: 'Kikuchi Sm3 — invasion into the lower third of the submucosa, adjacent to the muscularis propria. Highest risk of lymph-node metastasis (~25%); surgical resection is generally considered.', highRisk: true },
};

const NOTE = 'Kikuchi classification (Kikuchi 1995) grades submucosal invasion depth in a SESSILE (non-pedunculated) malignant colorectal lesion by dividing the submucosa into thirds. Sm1: upper third (~0-3% node metastasis, low risk). Sm2: middle third (~10%). Sm3: lower third, adjacent to the muscularis propria (~25%). Sm1 (roughly < 1000 microns of invasion) with favorable histology is often managed by endoscopic resection alone; Sm2 and Sm3 (deep invasion) carry a materially higher lymph-node-metastasis risk and generally prompt consideration of surgical resection. Kikuchi is the sessile-lesion counterpart to the Haggitt classification used for pedunculated polyps. This reports the invasion level the pathologist has determined, not a diagnosis, a resection recommendation, or an individual metastasis prediction.';

const ALIAS = { 1: 'SM1', 2: 'SM2', 3: 'SM3', SM1: 'SM1', SM2: 'SM2', SM3: 'SM3' };

// input:
//   level: 'Sm1' | 'Sm2' | 'Sm3' (case-insensitive; also accepts 1 / 2 / 3)
export function kikuchi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.level == null ? '' : o.level).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = LEVELS[key];
  if (!t) {
    return { valid: false, message: 'Select the Kikuchi level (Sm1, Sm2, or Sm3).' };
  }
  return {
    valid: true,
    level: t.level,
    highRisk: t.highRisk,
    abnormal: t.highRisk,
    bandLabel: `Kikuchi ${t.level}`,
    band: t.text,
    note: NOTE,
  };
}
