// spec-v466: the Judet-Letournel classification of acetabular fractures, by fracture pattern — five elementary
// and five associated patterns. It is the standard acetabular fracture classification that drives surgical
// approach, and companions the Thompson-Epstein posterior-hip-dislocation tile. "letournel" / "acetabular
// fracture" routed to nothing.
//
// HIGH-STAKES: this reports the fracture PATTERN the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the orthopedic-trauma team.
//
// PATTERNS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Judet R, Judet J, Letournel E. Fractures of the acetabulum: classification and surgical approaches for
//     open reduction. J Bone Joint Surg Am. 1964;46:1615-1646.
//   - Orthopedic-trauma references reproducing the same five elementary (posterior wall, posterior column,
//     anterior wall, anterior column, transverse) and five associated patterns.
//
// Patterns:
//   ELEMENTARY (a single fracture line or one wall/column):
//     posterior-wall     : posterior wall fracture.
//     posterior-column   : posterior column (ilioischial) fracture.
//     anterior-wall      : anterior wall fracture.
//     anterior-column    : anterior column (iliopubic) fracture.
//     transverse         : a single transverse line dividing the acetabulum into upper and lower halves.
//   ASSOCIATED (two or more elementary patterns combined):
//     pc-pw              : posterior column plus posterior wall.
//     transverse-pw      : transverse plus posterior wall.
//     t-shaped           : a transverse fracture with a vertical (stem) split of the inferior fragment.
//     ac-pht             : anterior column (or wall) plus a posterior hemitransverse.
//     both-column        : both columns; no part of the articular surface remains attached to the axial skeleton.

const PATTERNS = {
  'posterior-wall': { pattern: 'Posterior wall', group: 'elementary', text: 'Judet-Letournel posterior wall - an elementary posterior wall fracture.' },
  'posterior-column': { pattern: 'Posterior column', group: 'elementary', text: 'Judet-Letournel posterior column - an elementary posterior (ilioischial) column fracture.' },
  'anterior-wall': { pattern: 'Anterior wall', group: 'elementary', text: 'Judet-Letournel anterior wall - an elementary anterior wall fracture.' },
  'anterior-column': { pattern: 'Anterior column', group: 'elementary', text: 'Judet-Letournel anterior column - an elementary anterior (iliopubic) column fracture.' },
  'transverse': { pattern: 'Transverse', group: 'elementary', text: 'Judet-Letournel transverse - a single transverse line dividing the acetabulum into upper and lower halves.' },
  'pc-pw': { pattern: 'Posterior column + posterior wall', group: 'associated', text: 'Judet-Letournel posterior column plus posterior wall - an associated pattern combining both posterior injuries.' },
  'transverse-pw': { pattern: 'Transverse + posterior wall', group: 'associated', text: 'Judet-Letournel transverse plus posterior wall - an associated pattern combining a transverse fracture with a posterior wall fragment.' },
  't-shaped': { pattern: 'T-shaped', group: 'associated', text: 'Judet-Letournel T-shaped - a transverse fracture with an additional vertical (stem) split of the inferior fragment.' },
  'ac-pht': { pattern: 'Anterior column + posterior hemitransverse', group: 'associated', text: 'Judet-Letournel anterior column plus posterior hemitransverse - an associated pattern combining an anterior column (or wall) fracture with a posterior hemitransverse.' },
  'both-column': { pattern: 'Both-column', group: 'associated', text: 'Judet-Letournel both-column - both columns are fractured and no part of the articular surface remains attached to the axial skeleton (the floating acetabulum).' },
};

const NOTE = 'The Judet-Letournel classification (Judet & Letournel 1964) groups acetabular fractures into five elementary patterns (posterior wall, posterior column, anterior wall, anterior column, transverse) and five associated patterns (posterior column + posterior wall, transverse + posterior wall, T-shaped, anterior column + posterior hemitransverse, both-column). This reports the pattern the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  'POSTERIOR-WALL': 'posterior-wall', 'POSTERIOR-COLUMN': 'posterior-column',
  'ANTERIOR-WALL': 'anterior-wall', 'ANTERIOR-COLUMN': 'anterior-column',
  'TRANSVERSE': 'transverse', 'PC-PW': 'pc-pw', 'TRANSVERSE-PW': 'transverse-pw',
  'T-SHAPED': 't-shaped', 'AC-PHT': 'ac-pht', 'BOTH-COLUMN': 'both-column',
};

// input:
//   pattern: one of the ten pattern slugs (case-insensitive), e.g. 'transverse' or 'both-column'.
export function letournelAcetabulum(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.pattern == null ? '' : o.pattern).trim();
  const key = Object.prototype.hasOwnProperty.call(PATTERNS, raw)
    ? raw
    : (Object.prototype.hasOwnProperty.call(ALIAS, raw.toUpperCase()) ? ALIAS[raw.toUpperCase()] : raw);
  const p = PATTERNS[key];
  if (!p) {
    return { valid: false, message: 'Select one of the ten Judet-Letournel acetabular fracture patterns.' };
  }
  return {
    valid: true,
    pattern: p.pattern,
    group: p.group,
    bandLabel: `Judet-Letournel: ${p.pattern} (${p.group})`,
    band: p.text,
    note: NOTE,
  };
}
