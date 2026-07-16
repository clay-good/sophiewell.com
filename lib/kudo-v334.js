// spec-v334: Kudo pit-pattern classification of a colorectal lesion (types I / II / IIIS / IIIL /
// IV / V), read on magnifying chromoendoscopy. The pit (crypt-opening) pattern predicts histology:
// types I-II are non-neoplastic (normal / hyperplastic), types IIIS / IIIL / IV are neoplastic
// (adenomatous), and type V is suggestive of invasive carcinoma / deep submucosal invasion. It is
// the endoscopic surface-pattern companion to the Paris morphologic classification already in the
// catalog; "kudo" / "pit pattern" routed to nothing.
//
// HIGH-STAKES: this reports the pit-pattern TYPE the endoscopist has determined and its usual
// histologic correlate, NOT a tissue diagnosis, a resection recommendation, or a cancer diagnosis
// for an individual patient (spec-v11 §5.3). The biopsy / resection / referral decision stays with
// the endoscopist and the pathologist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Kudo S, Tamura S, Nakajima T, Yamano H, Kusaka H, Watanabe H. Diagnosis of colorectal
//     tumorous lesions by magnifying endoscopy. Gastrointest Endosc. 1996;44:8-14 (the pit-pattern
//     scale).
//   - Kudo's-pit-pattern meta-analysis (World J Gastroenterol 2014) and magnifying-endoscopy
//     references reproducing the same type definitions and the non-neoplastic (I-II) /
//     adenomatous (IIIS-IV) / invasive (V) histologic correlates.
//
// Types (pit appearance -> usual histology):
//   I  : roundish pits — normal colorectal mucosa (non-neoplastic).
//   II : stellar or papillary pits — hyperplastic / inflammatory (non-neoplastic).
//   IIIS: small roundish or tubular pits, smaller than type I — neoplastic (adenoma); often seen in
//         depressed lesions and carries the highest malignant potential among the type-III patterns.
//   IIIL: roundish or tubular pits, larger than type I — neoplastic (adenoma).
//   IV : branch-like or gyrus-like pits — neoplastic (adenoma, frequently villous / advanced).
//   V  : non-structured (irregular or amorphous) pits — suggestive of invasive carcinoma / deep
//        submucosal invasion (revised Kudo: Vi irregular, VN non-structural).

const TYPES = {
  I: { type: 'I', neoplastic: false, invasive: false, text: 'Kudo type I — roundish pits. Normal colorectal mucosa; non-neoplastic.' },
  II: { type: 'II', neoplastic: false, invasive: false, text: 'Kudo type II — stellar or papillary pits. Hyperplastic or inflammatory; non-neoplastic.' },
  IIIS: { type: 'IIIS', neoplastic: true, invasive: false, text: 'Kudo type IIIS — small roundish or tubular pits (smaller than type I). Neoplastic (adenoma); often a depressed lesion and carries the highest malignant potential among the type-III patterns.' },
  IIIL: { type: 'IIIL', neoplastic: true, invasive: false, text: 'Kudo type IIIL — roundish or tubular pits larger than type I. Neoplastic (adenoma).' },
  IV: { type: 'IV', neoplastic: true, invasive: false, text: 'Kudo type IV — branch-like or gyrus-like pits. Neoplastic (adenoma, frequently villous / advanced).' },
  V: { type: 'V', neoplastic: true, invasive: true, text: 'Kudo type V — non-structured (irregular or amorphous) pits. Suggestive of invasive carcinoma / deep submucosal invasion (revised Kudo: Vi irregular, VN non-structural); resect with staging in mind rather than piecemeal.' },
};

const NOTE = 'Kudo pit-pattern classification (Kudo 1996), read on magnifying chromoendoscopy, predicts a colorectal lesion\'s histology from its crypt-opening (pit) pattern. I: roundish (normal). II: stellar/papillary (hyperplastic, non-neoplastic). IIIS: small tubular, smaller than type I (adenoma; often depressed, highest malignant potential of type III). IIIL: tubular, larger than type I (adenoma). IV: branch/gyrus-like (adenoma, often villous). V: non-structured/irregular (suggestive of invasive carcinoma / deep submucosal invasion). Types I-II are non-neoplastic; IIIS-IV are neoplastic adenomas; V raises concern for invasion. This reports the pit-pattern type the endoscopist has determined and its usual histologic correlate, not a tissue diagnosis, a resection recommendation, or a cancer diagnosis.';

const ALIAS = { '3S': 'IIIS', '3L': 'IIIL', IIISMALL: 'IIIS', IIILARGE: 'IIIL' };

// input:
//   type: 'I' | 'II' | 'IIIS' | 'IIIL' | 'IV' | 'V' (case-insensitive)
export function kudo(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Kudo pit-pattern type (I, II, IIIS, IIIL, IV, or V).' };
  }
  return {
    valid: true,
    type: t.type,
    neoplastic: t.neoplastic,
    invasive: t.invasive,
    abnormal: t.invasive,
    bandLabel: `Kudo type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
