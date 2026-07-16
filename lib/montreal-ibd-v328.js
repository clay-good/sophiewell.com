// spec-v328: Montreal classification of inflammatory bowel disease (IBD). Composes the
// Montreal phenotype for Crohn's disease (age at diagnosis A, location L, behavior B) or
// ulcerative colitis (extent E, severity S). The catalog had no Montreal IBD tile (the only
// "Montreal" corpus hit was a geographic reference in the PRAM asthma note); it is the
// standard IBD phenotype classification, used in every IBD clinic. "montreal" / "crohn
// phenotype" / "ulcerative colitis extent" routed to nothing.
//
// HIGH-STAKES: this composes and reports the CITED PHENOTYPE from the categories the
// clinician selects, NOT a diagnosis or a treatment order (spec-v11 §5.3).
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Silverberg MS, Satsangi J, Ahmad T, et al. Toward an integrated clinical, molecular
//     and serological classification of IBD: Report of a Working Party of the 2005 Montreal
//     World Congress of Gastroenterology. Can J Gastroenterol. 2005;19 Suppl A:5A-36A.
//   - Satsangi J, et al. The Montreal classification of IBD: controversies, consensus, and
//     implications. Gut. 2006;55(6):749-753 (reproduces the A/L/B and E/S tables).
//
// Crohn's disease:
//   Age (A)      : A1 <= 16 y; A2 17-40 y; A3 > 40 y.
//   Location (L) : L1 ileal; L2 colonic; L3 ileocolonic; +L4 isolated upper GI (modifier).
//   Behavior (B) : B1 non-stricturing, non-penetrating; B2 stricturing; B3 penetrating;
//                  "p" perianal disease modifier.
// Ulcerative colitis:
//   Extent (E)   : E1 ulcerative proctitis; E2 left-sided (distal); E3 extensive (pancolitis).
//   Severity (S) : S0 clinical remission; S1 mild; S2 moderate; S3 severe.

const A = { A1: 'A1 (age at diagnosis <= 16 years)', A2: 'A2 (17-40 years)', A3: 'A3 (> 40 years)' };
const L = { L1: 'L1 (ileal)', L2: 'L2 (colonic)', L3: 'L3 (ileocolonic)' };
const B = { B1: 'B1 (non-stricturing, non-penetrating)', B2: 'B2 (stricturing)', B3: 'B3 (penetrating)' };
const E = { E1: 'E1 (ulcerative proctitis)', E2: 'E2 (left-sided / distal)', E3: 'E3 (extensive / pancolitis)' };
const S = { S0: 'S0 (clinical remission)', S1: 'S1 (mild)', S2: 'S2 (moderate)', S3: 'S3 (severe)' };

const NOTE = 'Montreal classification of IBD (Silverberg 2005). Crohn’s disease: age at diagnosis A1 (<= 16 y), A2 (17-40 y), A3 (> 40 y); location L1 (ileal), L2 (colonic), L3 (ileocolonic), with +L4 for isolated upper-GI disease; behavior B1 (non-stricturing, non-penetrating), B2 (stricturing), B3 (penetrating), with a "p" suffix for perianal disease. Ulcerative colitis: extent E1 (proctitis), E2 (left-sided / distal), E3 (extensive / pancolitis); severity S0 (clinical remission), S1 (mild), S2 (moderate), S3 (severe). This composes and reports the phenotype from the categories selected; it is a classification, not a diagnosis or a treatment order.';

// input (Crohn's): disease='crohn', crohnAge (A1-A3), crohnLocation (L1-L3),
//   crohnUpperGI (bool, +L4), crohnBehavior (B1-B3), crohnPerianal (bool, p)
// input (UC): disease='uc', ucExtent (E1-E3), ucSeverity (S0-S3)
export function montrealIbd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const disease = o.disease === 'uc' ? 'uc' : 'crohn';

  if (disease === 'crohn') {
    const age = A[o.crohnAge];
    const loc = L[o.crohnLocation];
    const beh = B[o.crohnBehavior];
    if (!age || !loc || !beh) {
      return { valid: false, message: 'Select the Crohn’s age (A1-A3), location (L1-L3), and behavior (B1-B3).' };
    }
    const upperGI = o.crohnUpperGI === true;
    const perianal = o.crohnPerianal === true;
    const locCode = o.crohnLocation + (upperGI ? '+L4' : '');
    const behCode = o.crohnBehavior + (perianal ? 'p' : '');
    const phenotype = `${o.crohnAge} ${locCode} ${behCode}`;
    const parts = [age, upperGI ? `${loc} with +L4 (isolated upper GI)` : loc, perianal ? `${beh} with a perianal (p) modifier` : beh];
    return {
      valid: true,
      disease: 'crohn',
      phenotype,
      abnormal: false,
      bandLabel: `Montreal ${phenotype}`,
      band: `Montreal Crohn’s disease phenotype ${phenotype} — ${parts.join(', ')}.`,
      note: NOTE,
    };
  }

  const ext = E[o.ucExtent];
  const sev = S[o.ucSeverity];
  if (!ext || !sev) {
    return { valid: false, message: 'Select the ulcerative colitis extent (E1-E3) and severity (S0-S3).' };
  }
  const phenotype = `${o.ucExtent} ${o.ucSeverity}`;
  return {
    valid: true,
    disease: 'uc',
    phenotype,
    abnormal: o.ucSeverity === 'S3',
    bandLabel: `Montreal ${phenotype}`,
    band: `Montreal ulcerative colitis phenotype ${phenotype} — ${ext}, ${sev}.`,
    note: NOTE,
  };
}
