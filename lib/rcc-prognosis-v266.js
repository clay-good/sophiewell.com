// spec-v266: localized renal-cell-carcinoma prognosis after nephrectomy. Third feature
// spec of the Advanced Sub-specialty Prognostic Instruments program. Each id was verified
// absent by a fixed-string scan of the extracted app.js id/name lists first (spec-v85
// §6.2). v266 runs no AI and makes no runtime network call.
//
// These compute a risk group / predicted survival — none is a surveillance,
// adjuvant-therapy, or biopsy order (spec-v11 §5.3). The decision to surveil, treat, or
// enroll stays with the oncology team.
//
//   ssign-score  - SSIGN score (Stage, Size, Grade, Necrosis), 0-17, cancer-specific survival
//
// SHIPPED THIS SLICE: ssign-score only.
//
// PARKED (spec-v266 §7 / spec-v97 / spec-v259 precedent):
//   - leibovich-rcc: the exact 2003 point table could not be confirmed from >= 2
//     INDEPENDENT open, fetchable sources in-session (the reachable detailed renders trace
//     to a single validation lineage; Radiopaedia/MDCalc/KCUK were 403/404, and known
//     variant reproductions differ on the pN and pT weights). Re-open when the 2003 point
//     table is reproducible from >= 2 independent open sources, or is supplied directly.
//   - uiss: the localized-branch group-assignment table (TNM x Fuhrman grade x ECOG ->
//     group) is not reproducible from >= 2 open, fetchable sources in-session (the primary
//     Zisman 2001 table and the cliot R source are not extractable here; secondary renders
//     give only partial rules). Re-open when the assignment table is reproducible.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at implementation:
//   SSIGN - Frank I et al., J Urol 2002;168(6):2395-2400. Point table cross-verified against
//           MDCalc "SSIGN Score" (pT1 0 / pT2 1 / pT3 2 / pT4 4; Nx-N0 0 / N1-N2 2; M0 0 /
//           M1 4; size < 5cm 0 / >= 5cm 2; Fuhrman grade 1-2 0 / 3 1 / 4 3; necrosis absent 0
//           / present 2; max 17). 5-year cancer-specific survival by score band from the
//           Frank 2002 derivation, confirmed across external validations: 0-2 ~96.8%, 3-4
//           ~92.5%, 5-6 ~78.8%, 7-9 ~57.7%, >= 10 ~18.1%. Uses the 1997 TNM staging edition
//           and Fuhrman nuclear grade of the derivation cohort.

function pickPoints(map, key, def = 0) {
  const v = map[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : def;
}

const SSIGN_NOTE = 'SSIGN score (Frank/Mayo 2002): cancer-specific survival after radical nephrectomy for clear-cell RCC, built on Stage, Size, Grade, and Necrosis. Primary tumor pT1 0 / pT2 1 / pT3 2 / pT4 4; regional nodes Nx-N0 0 / N1-N2 2; metastasis M0 0 / M1 4; tumor size < 5 cm 0 / >= 5 cm 2; Fuhrman nuclear grade 1-2 0 / 3 1 / 4 3; coagulative tumor necrosis absent 0 / present 2. Total 0-17. 5-year cancer-specific survival by score band (derivation): 0-2 ~96.8%, 3-4 ~92.5%, 5-6 ~78.8%, 7-9 ~57.7%, >= 10 ~18.1%. Uses the 1997 TNM edition and Fuhrman grade of the derivation cohort. A survival estimate, not a treatment order.';
const SSIGN_T = { pt1: 0, pt2: 1, pt3: 2, pt4: 4 };
const SSIGN_N = { n0: 0, n1: 2 };
const SSIGN_M = { m0: 0, m1: 4 };
const SSIGN_SIZE = { lt5: 0, ge5: 2 };
const SSIGN_GRADE = { g12: 0, g3: 1, g4: 3 };
const SSIGN_NECROSIS = { absent: 0, present: 2 };
function ssignSurvival(s) {
  if (s <= 2) return '~96.8% (score 0-2)';
  if (s <= 4) return '~92.5% (score 3-4)';
  if (s <= 6) return '~78.8% (score 5-6)';
  if (s <= 9) return '~57.7% (score 7-9)';
  return '~18.1% (score >= 10)';
}
function ssignGroup(s) {
  if (s <= 2) return 'low';
  if (s <= 5) return 'intermediate';
  return 'high';
}
export function ssign(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const parts = [
    ['primary tumor', pickPoints(SSIGN_T, o.tStage)],
    ['regional nodes', pickPoints(SSIGN_N, o.nStage)],
    ['metastasis', pickPoints(SSIGN_M, o.mStage)],
    ['tumor size', pickPoints(SSIGN_SIZE, o.size)],
    ['nuclear grade', pickPoints(SSIGN_GRADE, o.grade)],
    ['tumor necrosis', pickPoints(SSIGN_NECROSIS, o.necrosis)],
  ];
  let total = 0;
  const fired = [];
  for (const [label, pts] of parts) { total += pts; if (pts > 0) fired.push(`${label} (+${pts})`); }
  const group = ssignGroup(total);
  const survival = ssignSurvival(total);
  return { valid: true, score: total, abnormal: total >= 6, bandLabel: `SSIGN ${total}`,
    band: `SSIGN ${total} of 17 — ${group} risk; ${survival} 5-year cancer-specific survival per source.`,
    detail: `Contributing: ${fired.length ? fired.join(', ') : 'all factors at their lowest band (score 0)'}.`, note: SSIGN_NOTE };
}
