// spec-v426: the Gell and Coombs classification of hypersensitivity reactions, the classic grouping of
// immune-mediated hypersensitivity by mechanism — types I / II / III / IV. It is the standard teaching
// framework for hypersensitivity. "gell coombs" / "hypersensitivity type" routed to nothing.
//
// HIGH-STAKES: this reports the mechanism TYPE the clinician has selected, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). Many real reactions involve more than
// one mechanism; this reports the classic single-type grouping the clinician selects, and the clinical
// decision stays with the treating team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Gell PGH, Coombs RRA. Clinical Aspects of Immunology. Oxford: Blackwell Scientific; 1963 (the original
//     four-type classification).
//   - Rajan TV. The Gell-Coombs classification of hypersensitivity reactions: a re-interpretation. Trends
//     Immunol. 2003;24(7):376-379 (a widely cited restatement of the same four types).
//
// Types (by immune mechanism):
//   I   : immediate, IgE-mediated (mast-cell / basophil degranulation) - anaphylaxis, atopy, urticaria.
//   II  : antibody-mediated cytotoxic, IgG / IgM against cell-surface or matrix antigens - autoimmune
//         hemolytic anemia, Goodpasture, acute transfusion reactions.
//   III : immune-complex-mediated, antigen-antibody complexes deposit - serum sickness, SLE, Arthus reaction.
//   IV  : delayed, cell-mediated (T-cell) - contact dermatitis, the tuberculin reaction, some drug reactions.

const TYPES = {
  I: { type: 'I', text: 'Gell and Coombs type I - immediate, IgE-mediated (mast-cell / basophil degranulation): anaphylaxis, atopy, urticaria.' },
  II: { type: 'II', text: 'Gell and Coombs type II - antibody-mediated cytotoxic, IgG / IgM against cell-surface or matrix antigens: autoimmune hemolytic anemia, Goodpasture, acute transfusion reactions.' },
  III: { type: 'III', text: 'Gell and Coombs type III - immune-complex-mediated, antigen-antibody complexes deposit: serum sickness, SLE, the Arthus reaction.' },
  IV: { type: 'IV', text: 'Gell and Coombs type IV - delayed, cell-mediated (T-cell): contact dermatitis, the tuberculin reaction, some drug reactions.' },
};

const NOTE = 'The Gell and Coombs classification (Gell & Coombs 1963) groups hypersensitivity reactions by immune mechanism. I: immediate, IgE-mediated (anaphylaxis, atopy). II: antibody-mediated cytotoxic, IgG/IgM (autoimmune hemolytic anemia, Goodpasture). III: immune-complex-mediated (serum sickness, SLE). IV: delayed, cell-mediated / T-cell (contact dermatitis, tuberculin reaction). Many real reactions involve more than one mechanism; this reports the classic single-type grouping the clinician selects, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function gellCoombs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Gell and Coombs hypersensitivity type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Gell and Coombs type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
