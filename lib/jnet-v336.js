// spec-v336: JNET classification (Japan NBI Expert Team) of a colorectal lesion (types 1 / 2A / 2B
// / 3), read on magnifying narrow-band imaging. JNET grades a lesion by its vessel pattern and
// surface pattern to predict histology: type 1 is hyperplastic / sessile-serrated, 2A is low-grade
// adenoma, 2B is high-grade neoplasia / shallow submucosal cancer, and 3 is deep submucosal
// invasive cancer. It is the magnified-NBI refinement of the NICE classification (spec-v335) — NICE
// works without magnification, JNET splits NICE type 2 into 2A/2B on magnifying NBI. The catalog
// now carries Kudo (chromoendoscopy) and NICE (non-magnified NBI) but had no JNET; "jnet" routed to
// nothing.
//
// HIGH-STAKES: this reports the JNET TYPE the endoscopist has determined and its usual histologic
// correlate, NOT a tissue diagnosis, a resection recommendation, or a cancer diagnosis for an
// individual patient (spec-v11 §5.3). The biopsy / resection / referral decision stays with the
// endoscopist and the pathologist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Sano Y, Tanaka S, Kudo SE, et al. Narrow-band imaging (NBI) magnifying endoscopic
//     classification of colorectal tumors proposed by the Japan NBI Expert Team (JNET). Dig Endosc.
//     2016;28(5):526-533 (the four-category vessel/surface scale).
//   - JNET validation / diagnostic-yield studies (Dig Endosc 2018; Gastrointest Endosc 2019)
//     reproducing the same vessel-pattern / surface-pattern / histology table.
//
// Types (vessel pattern; surface pattern -> usual histology):
//   1 : invisible vessels; regular dark/white spots or similar to normal mucosa — hyperplastic
//       polyp / sessile-serrated polyp (non-neoplastic).
//   2A: regular caliber, regular distribution (meshed/spiral); regular (tubular/branched/papillary)
//       surface — low-grade intramucosal neoplasia (adenoma).
//   2B: variable caliber, irregular distribution; irregular or obscure surface — high-grade
//       intramucosal neoplasia / shallow submucosal invasive cancer.
//   3 : loose vessel areas, interruption of thick vessels; amorphous surface areas — deep
//       submucosal invasive cancer.

const TYPES = {
  '1': { type: '1', neoplastic: false, invasive: false, text: 'JNET type 1 — invisible vessels; surface of regular dark/white spots or similar to normal mucosa. Hyperplastic polyp / sessile-serrated polyp (non-neoplastic).' },
  '2A': { type: '2A', neoplastic: true, invasive: false, text: 'JNET type 2A — regular-caliber vessels in regular distribution (meshed/spiral); regular (tubular/branched/papillary) surface. Low-grade intramucosal neoplasia (adenoma).' },
  '2B': { type: '2B', neoplastic: true, invasive: false, text: 'JNET type 2B — variable-caliber vessels in irregular distribution; irregular or obscure surface. High-grade intramucosal neoplasia / shallow submucosal invasive cancer; consider magnified/chromo assessment before piecemeal resection.' },
  '3': { type: '3', neoplastic: true, invasive: true, text: 'JNET type 3 — loose vessel areas with interruption of thick vessels; amorphous surface areas. Deep submucosal invasive cancer; endoscopic cure is unlikely, weigh surgical referral.' },
};

const NOTE = 'JNET classification (Japan NBI Expert Team; Sano 2016) grades a colorectal lesion on magnifying narrow-band imaging by its vessel pattern and surface pattern. Type 1: invisible vessels, regular spots (hyperplastic / sessile-serrated, non-neoplastic). Type 2A: regular vessels and surface (low-grade adenoma). Type 2B: irregular vessels and surface (high-grade neoplasia / shallow submucosal cancer). Type 3: loose/interrupted vessels, amorphous surface (deep submucosal invasive cancer). JNET refines the NICE classification by splitting NICE type 2 into 2A / 2B on magnifying NBI. This reports the JNET type the endoscopist has determined and its usual histologic correlate, not a tissue diagnosis, a resection recommendation, or a cancer diagnosis.';

// input:
//   type: '1' | '2A' | '2B' | '3' (case-insensitive)
export function jnet(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the JNET type (1, 2A, 2B, or 3).' };
  }
  return {
    valid: true,
    type: t.type,
    neoplastic: t.neoplastic,
    invasive: t.invasive,
    abnormal: t.invasive,
    bandLabel: `JNET type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
