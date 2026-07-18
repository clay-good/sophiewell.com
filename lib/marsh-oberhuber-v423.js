// spec-v423: modified Marsh (Marsh-Oberhuber) classification of the duodenal/small-bowel histology in celiac
// disease, by the intraepithelial-lymphocyte (IEL) infiltrate, crypt architecture, and villous atrophy —
// types 0 / 1 / 2 / 3a / 3b / 3c. It is the standard grading a pathologist reports on a celiac duodenal
// biopsy. "marsh oberhuber" / "celiac histology grade" routed to nothing.
//
// This tile reports the MODIFIED Marsh (Oberhuber 1999) grading, types 0 through 3c, which is the grading in
// modern pathology use. The original Marsh (1992) type 4 (hypoplastic/atrophic-flat lesion) is not part of
// the modified grading and is not reported here.
//
// HIGH-STAKES: this reports the histologic TYPE the pathologist has determined from the biopsy, NOT a
// diagnosis of celiac disease (which needs serology and the clinical picture), a treatment decision, or a
// prognosis (spec-v11 §5.3). The diagnostic and management decisions stay with the gastroenterology /
// pathology team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Oberhuber G, Granditsch G, Vogelsang H. The histopathology of coeliac disease: time for a
//     standardized report scheme for pathologists. Eur J Gastroenterol Hepatol. 1999;11(10):1185-1194.
//   - Marsh MN. Gluten, major histocompatibility complex, and the small intestine. Gastroenterology.
//     1992;102(1):330-354 (the original Marsh scheme the Oberhuber modification refines).
//
// Types (increasing severity):
//   0  : preinfiltrative - normal mucosa (normal IEL count, normal architecture).
//   1  : infiltrative - increased intraepithelial lymphocytes, normal villous architecture.
//   2  : hyperplastic - increased IELs plus crypt hyperplasia, normal villi.
//   3a : partial villous atrophy (with increased IELs and crypt hyperplasia).
//   3b : subtotal villous atrophy.
//   3c : total villous atrophy.

const TYPES = {
  '0': { type: '0', text: 'Marsh-Oberhuber type 0 - preinfiltrative: normal mucosa (normal IEL count, normal architecture).' },
  '1': { type: '1', text: 'Marsh-Oberhuber type 1 - infiltrative: increased intraepithelial lymphocytes, normal villous architecture.' },
  '2': { type: '2', text: 'Marsh-Oberhuber type 2 - hyperplastic: increased IELs plus crypt hyperplasia, normal villi.' },
  '3A': { type: '3a', text: 'Marsh-Oberhuber type 3a - partial villous atrophy (with increased IELs and crypt hyperplasia).' },
  '3B': { type: '3b', text: 'Marsh-Oberhuber type 3b - subtotal villous atrophy.' },
  '3C': { type: '3c', text: 'Marsh-Oberhuber type 3c - total villous atrophy.' },
};

const NOTE = 'The modified Marsh (Marsh-Oberhuber, Oberhuber 1999) classification grades the duodenal histology in celiac disease by the intraepithelial-lymphocyte infiltrate, crypt architecture, and villous atrophy. 0: preinfiltrative (normal). 1: infiltrative (increased IELs, normal villi). 2: hyperplastic (increased IELs + crypt hyperplasia). 3a: partial villous atrophy. 3b: subtotal. 3c: total. This reports the histologic type the pathologist has determined, not a diagnosis of celiac disease (which needs serology and the clinical picture), a treatment decision, or a prognosis.';

const ALIAS = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3A': '3A', '3': '3A',
  '3B': '3B',
  '3C': '3C',
};

// input:
//   type: '0' / '1' / '2' / '3a' / '3b' / '3c' (case-insensitive; a bare '3' maps to 3a).
export function marshOberhuber(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Marsh-Oberhuber type (0, 1, 2, 3a, 3b, or 3c).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Marsh-Oberhuber type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
