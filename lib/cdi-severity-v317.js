// spec-v317: Clostridioides difficile infection (CDI) severity classification —
// the 2017 IDSA/SHEA severity definitions that sort a CDI episode into non-severe,
// severe, or fulminant. The catalog carries the ATLAS bedside CDI score but not this
// canonical guideline classification, which is what drives the initial oral-vancomycin
// vs fidaxomicin vs fulminant-pathway decision; 'c diff severity' / 'clostridioides
// severity' routed to nothing.
//
// HIGH-STAKES: this reports the SEVERITY CLASSIFICATION (non-severe / severe /
// fulminant), NOT a treatment order (spec-v11 §5.3). The regimen and the management
// pathway stay with the clinician.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), transcribed verbatim from Table 1 of:
//   - McDonald LC, Gerding DN, Johnson S, et al. Clinical Practice Guidelines for
//     Clostridium difficile Infection in Adults and Children: 2017 Update by the
//     Infectious Diseases Society of America (IDSA) and Society for Healthcare
//     Epidemiology of America (SHEA). Clin Infect Dis. 2018;66(7):e1-e48.
//   The 2021 focused update (Johnson S, et al. Clin Infect Dis. 2021;73(5):e1029)
//   revised treatment, not these severity definitions.
//
// Verbatim (Table 1):
//   Non-severe : WBC <= 15,000 cells/uL AND serum creatinine < 1.5 mg/dL.
//   Severe     : WBC >= 15,000 cells/uL OR serum creatinine > 1.5 mg/dL.
//   Fulminant  : hypotension or shock, ileus, or megacolon.
// The printed table leaves exactly 1.5 mg/dL uncovered; this uses the standard
// operationalization (severe at creatinine >= 1.5), noted below.

function toNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}
function on(v) { return v === true; }

const WBC_THRESHOLD = 15000; // cells/uL
const CR_THRESHOLD = 1.5;    // mg/dL

const NOTE = 'CDI severity (2017 IDSA/SHEA guideline, McDonald 2018, Table 1). Non-severe: WBC <= 15,000 cells/uL and serum creatinine < 1.5 mg/dL. Severe: WBC >= 15,000 cells/uL or serum creatinine > 1.5 mg/dL. Fulminant (formerly severe-complicated): hypotension or shock, ileus, or megacolon. The printed table leaves creatinine exactly 1.5 uncovered; this tile classifies creatinine >= 1.5 as severe, the standard operationalization (and the 2021 focused update restates the threshold as >= 1.5). The severity criteria are expert-opinion based. This reports the classification, not a treatment order; the regimen (e.g. oral vancomycin or fidaxomicin, and the fulminant pathway) stays with the clinician.';

// input:
//   wbc: number, white blood cell count in cells/uL (severe if >= 15,000)
//   creatinine: number, serum creatinine in mg/dL (severe if >= 1.5)
//   hypotension: bool (hypotension or shock) -- fulminant
//   ileus: bool -- fulminant
//   megacolon: bool (toxic megacolon) -- fulminant
export function cdiSeverity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const fulminant = on(o.hypotension) || on(o.ileus) || on(o.megacolon);
  const fulminantFindings = [];
  if (on(o.hypotension)) fulminantFindings.push('hypotension or shock');
  if (on(o.ileus)) fulminantFindings.push('ileus');
  if (on(o.megacolon)) fulminantFindings.push('megacolon');

  const wbc = toNum(o.wbc);
  const cr = toNum(o.creatinine);

  if (fulminant) {
    return {
      valid: true,
      category: 'fulminant',
      severe: true,
      fulminant: true,
      wbc: wbc === null || Number.isNaN(wbc) ? null : wbc,
      creatinine: cr === null || Number.isNaN(cr) ? null : cr,
      abnormal: true,
      bandLabel: 'Fulminant CDI',
      band: `Fulminant CDI — ${fulminantFindings.join(', ')} present (${fulminantFindings.length === 1 ? 'a fulminant criterion' : 'fulminant criteria'}, formerly "severe-complicated"), independent of the WBC and creatinine.`,
      note: NOTE,
    };
  }

  // Non-fulminant: both labs are needed to classify severe vs non-severe.
  if (wbc === null && cr === null) {
    return { valid: false, message: 'Enter the WBC (cells/uL) and serum creatinine (mg/dL), or check a fulminant finding (hypotension/shock, ileus, or megacolon).' };
  }
  if (wbc === null || Number.isNaN(wbc) || wbc < 0) {
    return { valid: false, message: 'Enter the WBC in cells/uL (e.g. 18000).' };
  }
  if (cr === null || Number.isNaN(cr) || cr < 0) {
    return { valid: false, message: 'Enter the serum creatinine in mg/dL (e.g. 1.2).' };
  }

  const wbcHigh = wbc >= WBC_THRESHOLD;
  const crHigh = cr >= CR_THRESHOLD;
  const severe = wbcHigh || crHigh;

  const wbcPhrase = `WBC ${wbc} cells/uL is ${wbcHigh ? 'at or above' : 'below'} the 15,000 threshold`;
  const crPhrase = `creatinine ${cr} mg/dL is ${crHigh ? 'at or above' : 'below'} 1.5`;

  return {
    valid: true,
    category: severe ? 'severe' : 'non-severe',
    severe,
    fulminant: false,
    wbc,
    creatinine: cr,
    abnormal: severe,
    bandLabel: severe ? 'Severe CDI' : 'Non-severe CDI',
    band: severe
      ? `Severe CDI — ${wbcPhrase}${wbcHigh && crHigh ? ' and ' : '; '}${crPhrase}. Not fulminant (no hypotension/shock, ileus, or megacolon).`
      : `Non-severe CDI — ${wbcPhrase} and ${crPhrase}. Not fulminant.`,
    note: NOTE,
  };
}
