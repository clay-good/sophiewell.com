// TST (Mantoux tuberculin skin test) induration interpretation, extracted from
// the group-j renderer into a pure lib fn so the browser tile and the MCP
// surface share one compute. A TST is POSITIVE when the induration meets or
// exceeds the risk-stratified cutoff (CDC/ATS): >= 5 mm for high risk (HIV+,
// recent contact, immunosuppressed, fibrotic CXR), >= 10 mm for moderate risk,
// >= 15 mm for low / no specific risk. This reports the interpretation, not a
// treatment decision. The IGRA reference list stays in the view (it is a static
// data-file lookup, not a per-patient computation).
//
// NaN-safe (fuzz-harness contract): a non-finite input returns a friendly
// prompt rather than rendering "NaN mm". The `band` string is byte-identical to
// the renderer's previous inline output for every valid input.
export function tbTstInterpret({ indurationMm, cutoffMm } = {}) {
  // spec-v930: a blank field and an absent field mean the same thing. Number('') is 0, so
  // without this an empty form read as 0 mm against a 0 mm cutoff and reported POSITIVE.
  const blank = (v) => v === null || v === undefined || String(v).trim() === '';
  const mm = blank(indurationMm) ? NaN : Number(indurationMm);
  const cutoff = blank(cutoffMm) ? NaN : Number(cutoffMm);
  if (!Number.isFinite(mm) || !Number.isFinite(cutoff)) {
    return { valid: false, band: 'Enter the induration in mm and select a risk category.' };
  }
  const positive = mm >= cutoff;
  return {
    valid: true,
    indurationMm: mm,
    cutoffMm: cutoff,
    positive,
    band: `TST: ${mm} mm vs cutoff ${cutoff} mm -> ${positive ? 'POSITIVE' : 'Negative'}`,
  };
}
