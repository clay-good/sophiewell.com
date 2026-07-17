// spec-v395: Parks classification of an anal fistula (fistula-in-ano), by the tract's relationship to the
// anal sphincter complex — the standard anatomic classification (intersphincteric / transsphincteric /
// suprasphincteric / extrasphincteric) that guides surgical planning and the continence risk. It sits
// beside the colorectal / GI tiles in the catalog. "parks" / "anal fistula classification" routed to
// nothing.
//
// HIGH-STAKES: this reports the Parks TYPE the clinician has determined from the exam / imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// suprasphincteric and extrasphincteric types are the more complex (higher continence-risk) ones, but the
// management decision stays with the colorectal / surgical team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Parks AG, Gordon PH, Hardcastle JD. A classification of fistula-in-ano. Br J Surg. 1976;63(1):1-12
//     (the four anatomic types, from a series of 400 patients).
//   - Colorectal / radiology references reproducing the same intersphincteric / transsphincteric /
//     suprasphincteric / extrasphincteric grouping by relationship to the sphincter complex.
//
// Types (relationship of the tract to the anal sphincter complex):
//   intersphincteric  : the tract penetrates the internal sphincter and runs in the intersphincteric
//                       plane; it spares the external sphincter. The most common type.
//   transsphincteric  : the tract passes through both the internal and external sphincters into the
//                       ischioanal fossa.
//   suprasphincteric  : the tract begins in the intersphincteric plane, extends above the puborectalis,
//                       then down through the ischioanal fossa. Complex.
//   extrasphincteric  : the tract runs outside the external sphincter, penetrating the levator ani into
//                       the rectum; it bypasses the sphincter complex. Complex.

const TYPES = {
  intersphincteric: { type: 'intersphincteric', complex: false, text: 'Parks intersphincteric - the tract penetrates the internal sphincter and runs in the intersphincteric plane, sparing the external sphincter; the most common type.' },
  transsphincteric: { type: 'transsphincteric', complex: false, text: 'Parks transsphincteric - the tract passes through both the internal and external sphincters into the ischioanal fossa.' },
  suprasphincteric: { type: 'suprasphincteric', complex: true, text: 'Parks suprasphincteric - the tract begins in the intersphincteric plane, extends above the puborectalis, then down through the ischioanal fossa; a complex fistula.' },
  extrasphincteric: { type: 'extrasphincteric', complex: true, text: 'Parks extrasphincteric - the tract runs outside the external sphincter, penetrating the levator ani into the rectum, bypassing the sphincter complex; a complex fistula.' },
};

const NOTE = 'The Parks classification groups an anal fistula by the tract\'s relationship to the anal sphincter complex. Intersphincteric: through the internal sphincter only (most common). Transsphincteric: through both sphincters into the ischioanal fossa. Suprasphincteric: above the puborectalis (complex). Extrasphincteric: outside the sphincter complex, through the levator (complex). The supra- and extrasphincteric types carry a higher continence risk with surgery - the classically taught pattern, not an order. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  INTERSPHINCTERIC: 'intersphincteric', INTER: 'intersphincteric', 1: 'intersphincteric', I: 'intersphincteric',
  TRANSSPHINCTERIC: 'transsphincteric', TRANS: 'transsphincteric', 2: 'transsphincteric', II: 'transsphincteric',
  SUPRASPHINCTERIC: 'suprasphincteric', SUPRA: 'suprasphincteric', 3: 'suprasphincteric', III: 'suprasphincteric',
  EXTRASPHINCTERIC: 'extrasphincteric', EXTRA: 'extrasphincteric', 4: 'extrasphincteric', IV: 'extrasphincteric',
};

// input:
//   type: 'intersphincteric' / 'transsphincteric' / 'suprasphincteric' / 'extrasphincteric'
//         (case-insensitive; also accepts inter/trans/supra/extra and grades I-IV / 1-4)
export function parksFistula(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw.toLowerCase();
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Parks type (intersphincteric, transsphincteric, suprasphincteric, or extrasphincteric).' };
  }
  return {
    valid: true,
    type: t.type,
    complex: t.complex,
    abnormal: t.complex,
    bandLabel: `Parks ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
