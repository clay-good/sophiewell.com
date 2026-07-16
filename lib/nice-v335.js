// spec-v335: NICE classification (NBI International Colorectal Endoscopic) of a colorectal lesion
// (types 1 / 2 / 3), read on narrow-band imaging. NICE grades a lesion by three features — color,
// vessels, and surface pattern — to predict histology WITHOUT requiring optical magnification:
// type 1 is hyperplastic, type 2 is adenoma (or superficial cancer), type 3 is deep submucosal
// invasive cancer. It is the narrow-band-imaging companion to the Kudo chromoendoscopy pit pattern
// (spec-v334) already in the catalog; "nice classification" / "nbi polyp" routed to nothing.
//
// HIGH-STAKES: this reports the NICE TYPE the endoscopist has determined and its usual histologic
// correlate, NOT a tissue diagnosis, a resection recommendation, or a cancer diagnosis for an
// individual patient (spec-v11 §5.3). The biopsy / resection / referral decision stays with the
// endoscopist and the pathologist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Hewett DG, Kaltenbach T, Sano Y, et al. Validation of a simple classification system for
//     endoscopic diagnosis of small colorectal polyps using narrow-band imaging. Gastroenterology.
//     2012;143(3):599-607 (types 1-2).
//   - Hayashi N, Tanaka S, Hewett DG, et al. Endoscopic prediction of deep submucosal invasive
//     carcinoma: validation of the NICE classification. Gastrointest Endosc. 2013;78(4):625-632
//     (added type 3, deep submucosal invasion).
//   - Endoscopy-Campus / review reproductions of the same color / vessels / surface three-feature
//     table and the hyperplastic (1) / adenoma (2) / deep-invasive-cancer (3) correlates.
//
// Types (three features -> usual histology):
//   1: color same or lighter than background; vessels absent or isolated lacy; surface uniform
//      dark/white spots or homogeneous absence of pattern — hyperplastic (non-neoplastic).
//   2: browner than background; brown vessels surrounding white structures; oval/tubular/branched
//      white structures surrounded by brown vessels — adenoma (or superficial submucosal cancer).
//   3: brown to dark brown (sometimes patchy whiter areas); disrupted or missing vessels; amorphous
//      or absent surface pattern — deep submucosal invasive cancer.

const TYPES = {
  1: { type: '1', neoplastic: false, invasive: false, text: 'NICE type 1 — color same or lighter than the background; vessels absent or only isolated lacy vessels; surface of uniform dark/white spots or a homogeneous absence of pattern. Hyperplastic (non-neoplastic).' },
  2: { type: '2', neoplastic: true, invasive: false, text: 'NICE type 2 — browner than the background; brown vessels surrounding white structures; oval, tubular, or branched white structures surrounded by brown vessels. Adenoma (or superficial submucosal cancer).' },
  3: { type: '3', neoplastic: true, invasive: true, text: 'NICE type 3 — brown to dark brown relative to the background (sometimes patchy whiter areas); areas of disrupted or missing vessels; amorphous or absent surface pattern. Deep submucosal invasive cancer; endoscopic cure is unlikely, weigh surgical referral.' },
};

const NOTE = 'NICE classification (NBI International Colorectal Endoscopic; Hewett 2012 for types 1-2, Hayashi 2013 for type 3), read on narrow-band imaging WITHOUT requiring magnification. It grades a colorectal lesion on three features — color, vessels, and surface pattern. Type 1: same/lighter color, absent or lacy vessels, uniform or absent surface pattern (hyperplastic, non-neoplastic). Type 2: browner color, brown vessels around white structures, oval/tubular/branched white structures (adenoma, or superficial cancer). Type 3: brown to dark brown, disrupted/missing vessels, amorphous or absent surface (deep submucosal invasive cancer). This reports the NICE type the endoscopist has determined and its usual histologic correlate, not a tissue diagnosis, a resection recommendation, or a cancer diagnosis.';

// input:
//   type: '1' | '2' | '3' (also accepts numbers)
export function nice(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim();
  const key = /^[123]$/.test(raw) ? Number(raw) : null;
  const t = key == null ? null : TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the NICE type (1, 2, or 3).' };
  }
  return {
    valid: true,
    type: t.type,
    neoplastic: t.neoplastic,
    invasive: t.invasive,
    abnormal: t.invasive,
    bandLabel: `NICE type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
