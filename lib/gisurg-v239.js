// spec-v239: hepatology / GI-surgery scores — the Bonacini cirrhosis discriminant
// score, the Goteborg University Cirrhosis Index (GUCI), the Mannheim Peritonitis
// Index, and the Boey score for perforated peptic ulcer. Each id was verified
// absent by a fixed-string scan of the extracted app.js id/name lists AND the MCP
// adapter set first (spec-v85 §6.2). v239 runs no AI and makes no runtime network
// call.
//
// These score / classify risk — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   bonacini-cds              - Bonacini cirrhosis discriminant score
//   guci                      - Goteborg University Cirrhosis Index
//   mannheim-peritonitis-index - Mannheim Peritonitis Index
//   boey-score                - Boey score (perforated peptic ulcer)
//
// POINT SYSTEMS / FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function headers).

import { num, r2 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}

// --- Bonacini cirrhosis discriminant score -----------------------------------
// Bonacini M, et al. Am J Gastroenterol. 1997: platelets (>340=0, 280-340=1,
// 220-279=2, 160-219=3, 100-159=4, 40-99=5, <40=6), ALT/AST ratio (>1.7=0,
// 1.2-1.7=1, 0.6-1.19=2, <0.6=3), INR (<1.1=0, 1.1-1.4=1, >1.4=2). Total 0-11;
// <= 3 cirrhosis unlikely, >= 8 cirrhosis likely. Cross-verified: PubMed 9260794;
// EBMcalc.
const BONACINI_NOTE = 'Bonacini cirrhosis discriminant score (Bonacini M, et al. Am J Gastroenterol. 1997): platelets (>340=0, 280-340=1, 220-279=2, 160-219=3, 100-159=4, 40-99=5, <40=6), ALT/AST ratio (>1.7=0, 1.2-1.7=1, 0.6-1.19=2, <0.6=3), INR (<1.1=0, 1.1-1.4=1, >1.4=2). Total 0-11; <= 3 cirrhosis unlikely, 4-7 indeterminate, >= 8 cirrhosis likely. A discriminant score, not a diagnosis or treatment order.';
function binPlt(p) { if (p > 340) return 0; if (p >= 280) return 1; if (p >= 220) return 2; if (p >= 160) return 3; if (p >= 100) return 4; if (p >= 40) return 5; return 6; }
function binRatio(r) { if (r > 1.7) return 0; if (r >= 1.2) return 1; if (r >= 0.6) return 2; return 3; }
function binInr(i) { if (i < 1.1) return 0; if (i <= 1.4) return 1; return 2; }
export function bonaciniCds(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const plt = fin(o.platelet, 1, 1000);
  const ratio = fin(o.altAstRatio, 0.05, 20);
  const inr = fin(o.inr, 0.5, 15);
  if (plt === null || ratio === null || inr === null) {
    return { valid: false, message: 'Enter platelet count (10^3/uL), ALT/AST ratio, and INR.' };
  }
  const score = Math.round(num('Bonacini', binPlt(plt) + binRatio(ratio) + binInr(inr), { min: 0, max: 11 }));
  let tier; let abnormal = true;
  if (score >= 8) tier = 'cirrhosis likely (>= 8)';
  else if (score >= 4) tier = 'indeterminate (4-7)';
  else { tier = 'cirrhosis unlikely (<= 3)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `Bonacini ${score}`, band: `Bonacini score ${score} — ${tier}.`, detail: `Platelet ${binPlt(plt)}, ALT/AST ${binRatio(ratio)}, INR ${binInr(inr)}.`, note: BONACINI_NOTE };
}

// --- Goteborg University Cirrhosis Index (GUCI) ------------------------------
// Islam S, et al. Scand J Gastroenterol. 2005: GUCI = (AST / ULN) x INR x 100 /
// platelet count (10^9/L). A value > 1.0 suggests cirrhosis (sens ~80%, spec
// ~78%). Cross-verified: PMC12452163; Islam 2005.
const GUCI_NOTE = 'Goteborg University Cirrhosis Index (Islam S, et al. Scand J Gastroenterol. 2005) = (AST / upper-limit-of-normal) x INR x 100 / platelet count (10^9/L). A value > 1.0 suggests cirrhosis (sens ~80%, spec ~78%). A non-invasive index, not a diagnosis or treatment order.';
export function guci(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ast = fin(o.ast, 1, 5000);
  const uln = fin(o.astUln, 5, 100);
  const inr = fin(o.inr, 0.5, 15);
  const plt = fin(o.platelet, 1, 1000);
  if (ast === null || uln === null || inr === null || plt === null) {
    return { valid: false, message: 'Enter AST (U/L), AST upper limit of normal (U/L), INR, and platelet count (10^9/L).' };
  }
  const score = r2(num('GUCI', (ast / uln) * inr * 100 / plt, { min: 0, max: 1000 }));
  const abnormal = score > 1.0;
  return { valid: true, score, abnormal, bandLabel: `GUCI ${score}`, band: `GUCI ${score} — ${abnormal ? 'above the ~1.0 cirrhosis threshold' : 'below the ~1.0 cirrhosis threshold'}.`, detail: `(AST ${ast} / ULN ${uln}) x INR ${inr} x 100 / platelets ${plt}.`, note: GUCI_NOTE };
}

// --- Mannheim Peritonitis Index ----------------------------------------------
// Wacha H, Linder MM, et al. 1987: age > 50 (5), female (5), organ failure (7),
// malignancy (4), preoperative duration > 24 h (4), origin of sepsis not colonic
// (4), diffuse generalized peritonitis (6), exudate clear (0) / cloudy-purulent
// (6) / fecal (12). Total 0-47; > 26 marks high mortality risk. Cross-verified:
// PMC5013738; FPnotebook.
const MPI_NOTE = 'Mannheim Peritonitis Index (Wacha H, Linder MM, et al. 1987): age > 50 (5), female (5), organ failure (7), malignancy (4), preoperative duration > 24 h (4), origin not colonic (4), diffuse generalized peritonitis (6), exudate clear (0) / cloudy-purulent (6) / fecal (12). Total 0-47; < 21 ~low, 21-29 intermediate, >= 30 high mortality; > 26 the common high-risk cutoff. A prognostic index, not a diagnosis or treatment order.';
export function mannheimPeritonitisIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  if (bool(o.ageOver50)) s += 5;
  if (bool(o.female)) s += 5;
  if (bool(o.organFailure)) s += 7;
  if (bool(o.malignancy)) s += 4;
  if (bool(o.duration24)) s += 4;
  if (bool(o.nonColonic)) s += 4;
  if (bool(o.diffuse)) s += 6;
  s += lvl(o.exudate, 12); // 0 clear / 6 purulent / 12 fecal (select supplies 0/6/12)
  const score = Math.round(num('MPI', s, { min: 0, max: 47 }));
  const abnormal = score >= 26;
  return { valid: true, score, abnormal, bandLabel: `MPI ${score}`, band: `Mannheim Peritonitis Index ${score} — ${abnormal ? 'high mortality risk (>= 26)' : 'lower mortality risk (< 26)'}.`, detail: '< 21 ~low, 21-29 intermediate, >= 30 high mortality band.', note: MPI_NOTE };
}

// --- Boey score (perforated peptic ulcer) ------------------------------------
// Boey J, et al. Ann Surg. 1987: preoperative shock (SBP < 100), perforation
// present > 24 h, and significant medical comorbidity, each 1 point. Total 0-3;
// mortality ~ 0 / 10 / 45 / 100% (0/1/2/3 factors). Cross-verified: PMC7282445;
// PubMed 18958520.
const BOEY_NOTE = 'Boey score (Boey J, et al. Ann Surg. 1987): preoperative shock (SBP < 100 mmHg), perforation present > 24 h, and significant medical comorbidity, each 1 point. Total 0-3; operative mortality rises steeply with each factor (roughly 0 / 10 / 45 / 100%). A risk score, not a diagnosis or treatment order.';
export function boeyScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  if (bool(o.shock)) s += 1;
  if (bool(o.delayed)) s += 1;
  if (bool(o.comorbidity)) s += 1;
  const score = Math.round(num('Boey', s, { min: 0, max: 3 }));
  const abnormal = score >= 2;
  return { valid: true, score, abnormal, bandLabel: `Boey ${score}`, band: `Boey score ${score} of 3 — ${score} operative risk factor${score === 1 ? '' : 's'}.`, detail: 'Shock, perforation > 24 h, comorbidity. Mortality rises steeply with each factor.', note: BOEY_NOTE };
}
