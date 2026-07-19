// spec-v468: the Brouet classification of cryoglobulinemia, by the clonality of the cryoprecipitating
// immunoglobulins — types I / II / III. It is the standard immunochemical classification and companions the
// vasculitis prognosis tiles (cryoglobulinemic vasculitis). "brouet" / "cryoglobulinemia type" routed to
// nothing.
//
// HIGH-STAKES: this reports the immunochemical TYPE the clinician has determined from the cryoglobulin
// characterization, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11
// §5.3). The management decision stays with the hematology / rheumatology team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Brouet JC, Clauvel JP, Danon F, Klein M, Seligmann M. Biologic and clinical significance of
//     cryoglobulins. A report of 86 cases. Am J Med. 1974;57(5):775-788.
//   - Hematology / rheumatology references reproducing the same monoclonal-only (I) / mixed-monoclonal-plus-
//     polyclonal (II) / mixed-polyclonal-only (III) grouping. Types II and III are "mixed" cryoglobulinemia.
//
// Types (clonality of the cryoglobulin):
//   I   : a single monoclonal immunoglobulin (usually IgM or IgG); associated with lymphoproliferative
//         disorders (Waldenstrom macroglobulinemia, multiple myeloma, monoclonal gammopathy).
//   II  : mixed - a monoclonal immunoglobulin (usually IgM with rheumatoid-factor activity) plus polyclonal
//         IgG; strongly associated with hepatitis C, other infections, and autoimmune disease.
//   III : mixed - polyclonal immunoglobulins only (polyclonal IgM and IgG); associated with autoimmune and
//         chronic infectious diseases.

const TYPES = {
  I: { type: 'I', text: 'Brouet type I - a single monoclonal immunoglobulin (usually IgM or IgG); associated with lymphoproliferative disorders (Waldenstrom macroglobulinemia, multiple myeloma, monoclonal gammopathy).' },
  II: { type: 'II', text: 'Brouet type II - mixed: a monoclonal immunoglobulin (usually IgM with rheumatoid-factor activity) plus polyclonal IgG; strongly associated with hepatitis C, other infections, and autoimmune disease.' },
  III: { type: 'III', text: 'Brouet type III - mixed: polyclonal immunoglobulins only (polyclonal IgM and IgG); associated with autoimmune and chronic infectious diseases.' },
};

const NOTE = 'The Brouet classification (Brouet 1974) groups cryoglobulinemia by the clonality of the cryoprecipitating immunoglobulins. I: a single monoclonal immunoglobulin (lymphoproliferative disorders). II: mixed, a monoclonal immunoglobulin plus polyclonal IgG (strongly linked to hepatitis C). III: mixed, polyclonal immunoglobulins only. Types II and III are "mixed" cryoglobulinemia. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function brouetCryoglobulinemia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Brouet type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Brouet type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
