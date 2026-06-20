// spec-v125 (Wave 5 of the spec-v100 MDCalc Parity Completion program): five
// deterministic hepatology severity and encephalopathy instruments that complete
// the acute-hepatology cluster beside meld-childpugh, albi-grade, and fib4. None
// duplicates a live tile; each takes lab values or the bedside exam as input.
//
//   peldScore             - Pediatric End-Stage Liver Disease score (under-12 listing)
//   clifCAclf             - CLIF-C ACLF mortality model (acute-on-chronic liver failure)
//   gahs                  - Glasgow Alcoholic Hepatitis Score (5-12; >= 9 steroid context)
//   westHavenHe           - West Haven (Conn) hepatic-encephalopathy grade 0-4
//   hepaticSteatosisIndex - Hepatic Steatosis Index (NAFLD screen; < 30 out, > 36 in)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v125.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score / grade and the source's framing; the
// listing, steroid, and management decisions stay with the clinician (spec-v11
// §5.3).
//
// COEFFICIENTS / BANDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-
// verified across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - peldScore (McDiarmid 2002, Transplantation): 4.80 x ln(bilirubin) + 18.57 x
//     ln(INR) - 6.87 x ln(albumin) + 4.36 (age < 1 yr) + 6.67 (growth failure < -2
//     SD), albumin g/dL and bilirubin mg/dL, each lab floored at 1.0 before the log.
//     The RAW McDiarmid form is used (no x10 -- that is the UNOS allocation
//     presentation only); rounded to an integer.
//   - clifCAclf (Jalan 2014, J Hepatol): CLIF-C ACLF = 10 x [0.33 x CLIF-OF + 0.04 x
//     age + 0.63 x ln(WBC in 10^9/L) - 2]. CLIF-OF is the 6-organ failure sub-score
//     (liver/kidney/brain/coagulation/circulation/respiratory), each 1-3, total
//     6-18. SOURCE-GOVERNANCE: the circulation organ scores 3 for VASOPRESSOR USE
//     (not the MAP < 65 of CLIF-SOFA -- a documented secondary-table conflation);
//     the canonical CLIF-OF is MAP >= 70 = 1, MAP < 70 = 2, vasopressors = 3.
//     Reported on a 0-100 scale; higher means higher short-term mortality.
//   - gahs (Forrest 2005, Gut): five banded items -- age (< 50 = 1, >= 50 = 2), WBC
//     (< 15 = 1, >= 15 = 2), blood UREA in mmol/L (< 5 = 1, >= 5 = 2), INR/PT ratio
//     (< 1.5 = 1, 1.5-2.0 = 2, > 2.0 = 3), and BILIRUBIN in micromol/L (< 125 = 1,
//     125-250 = 2, > 250 = 3) -- total 5-12. UNIT TRAP (the one real GAHS pitfall):
//     urea is mmol/L and bilirubin is micromol/L (UK/SI units), NOT BUN mg/dL or
//     bilirubin mg/dL; the tile takes the SI units natively. >= 9 marks higher
//     28/84-day mortality and the cohort in which corticosteroids showed benefit.
//   - westHavenHe (Conn 1977, Gastroenterology): the canonical 0-4 grade -- 0
//     minimal (no detectable change), 1 (trivial unawareness, euphoria/anxiety,
//     impaired addition), 2 (lethargy/apathy, disorientation to time, asterixis), 3
//     (somnolence to semi-stupor, responsive to stimuli, gross disorientation), 4
//     (coma). An ordinal classification, not a sum.
//   - hepaticSteatosisIndex (Lee 2010, Dig Liver Dis): HSI = 8 x (ALT/AST) + BMI
//     (+2 if female) (+2 if diabetes). < 30.0 rules NAFLD out (sensitivity ~93%);
//     > 36.0 rules it in (specificity ~92%); 30-36 indeterminate.

import { r2 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const lvl = (v, lo, hi) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return lo;
  const r = Math.round(n);
  return r < lo ? lo : r > hi ? hi : r;
};
const INCOMPLETE = 'Enter all required positive values.';

// --- 2.1 peld-score -----------------------------------------------------------
const PELD_NOTE = 'Pediatric End-Stage Liver Disease score (McDiarmid SV, Anand R, Lindblad AS; SPLIT Research Group, Transplantation 2002): the under-12 transplant-listing severity score (the adult MELD does not apply to small children). PELD = 4.80 x ln(bilirubin) + 18.57 x ln(INR) - 6.87 x ln(albumin) + 4.36 if age under 1 year + 6.67 if growth failure (more than 2 SD below mean), with albumin in g/dL, bilirubin in mg/dL, and each lab floored at 1.0 before the log. A higher score indicates greater severity and higher waitlist priority. It frames severity; the listing decision stays with the transplant team.';

export function peldScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const albumin = pos(o.albumin);
  const bilirubin = pos(o.bilirubin);
  const inr = pos(o.inr);
  if (albumin === null || bilirubin === null || inr === null) return { valid: false, message: INCOMPLETE };
  const a = Math.max(albumin, 1.0);
  const b = Math.max(bilirubin, 1.0);
  const i = Math.max(inr, 1.0);
  let raw = 4.80 * Math.log(b) + 18.57 * Math.log(i) - 6.87 * Math.log(a);
  const counted = [];
  if (onFlag(o.ageUnder1)) { raw += 4.36; counted.push('age under 1 year (+4.36)'); }
  if (onFlag(o.growthFailure)) { raw += 6.67; counted.push('growth failure (+6.67)'); }
  const score = Math.round(raw);
  return {
    valid: true, score,
    abnormal: score >= 15,
    band: `PELD ${score}: a higher score indicates greater liver-disease severity and waitlist priority.`,
    counted: counted.length ? counted.join(', ') : 'no age/growth points (labs only)',
    note: PELD_NOTE,
  };
}

// --- 2.2 clif-c-aclf ----------------------------------------------------------
const CLIF_NOTE = 'CLIF-C ACLF score (Jalan R, Saliba F, Pavesi M, et al, J Hepatol 2014): the mortality model for acute-on-chronic liver failure. It is built on the CLIF Organ Failure (CLIF-OF) sub-score -- six organ systems (liver, kidney, brain, coagulation, circulation, respiratory) each scored 1-3, total 6-18 -- then CLIF-C ACLF = 10 x [0.33 x CLIF-OF + 0.04 x age + 0.63 x ln(white-cell count in 10^9/L) - 2], reported on a 0-100 scale. The circulation organ scores 3 for vasopressor use (the canonical CLIF-OF, not the MAP-under-65 of CLIF-SOFA). A higher score indicates higher short-term mortality. It frames prognosis; the management and escalation-of-care decisions stay with the clinician.';

export function clifCAclf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age);
  const wbc = pos(o.wbc);
  if (age === null || wbc === null) return { valid: false, message: INCOMPLETE };
  const organs = ['liver', 'kidney', 'brain', 'coag', 'circ', 'resp'];
  let clifOF = 0;
  for (const k of organs) clifOF += lvl(o[k], 1, 3);
  const score = Math.round(10 * (0.33 * clifOF + 0.04 * age + 0.63 * Math.log(wbc) - 2));
  return {
    valid: true, clifOF, score,
    abnormal: score >= 50,
    band: `CLIF-C ACLF ${score} (CLIF-OF organ-failure sub-score ${clifOF}/18): a higher score indicates higher short-term mortality in acute-on-chronic liver failure.`,
    note: CLIF_NOTE,
  };
}

// --- 2.3 gahs -----------------------------------------------------------------
const GAHS_NOTE = 'Glasgow Alcoholic Hepatitis Score (Forrest EH, Evans CD, Stewart S, et al, Gut 2005): five banded items -- age (under 50 = 1, 50 or older = 2), white-cell count (under 15 = 1, 15 or higher = 2), blood urea in mmol/L (under 5 = 1, 5 or higher = 2), INR or PT ratio (under 1.5 = 1, 1.5-2.0 = 2, over 2.0 = 3), and bilirubin in micromol/L (under 125 = 1, 125-250 = 2, over 250 = 3) -- for a total of 5-12. Urea is in mmol/L and bilirubin in micromol/L (UK/SI units), not BUN or mg/dL. A total of 9 or more marks higher 28- and 84-day mortality and the cohort in which corticosteroids showed benefit. It frames mortality and steroid candidacy; the treatment decision stays with the clinician.';

export function gahs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age);
  const wbc = pos(o.wbc);
  const urea = pos(o.urea);     // mmol/L
  const inr = pos(o.inr);
  const bili = pos(o.bilirubin); // micromol/L
  if (age === null || wbc === null || urea === null || inr === null || bili === null) return { valid: false, message: INCOMPLETE };
  let total = 0;
  total += age >= 50 ? 2 : 1;
  total += wbc >= 15 ? 2 : 1;
  total += urea >= 5 ? 2 : 1;
  total += inr > 2.0 ? 3 : inr >= 1.5 ? 2 : 1;
  total += bili > 250 ? 3 : bili >= 125 ? 2 : 1;
  const high = total >= 9;
  return {
    valid: true, total,
    abnormal: high,
    band: `GAHS ${total}/12: ${high ? '9 or more -- higher 28/84-day mortality, the cohort in which corticosteroids showed benefit' : 'below 9 -- lower mortality, no clear corticosteroid benefit'}.`,
    note: GAHS_NOTE,
  };
}

// --- 2.4 west-haven-he --------------------------------------------------------
const WH_NOTE = 'West Haven (Conn) criteria for hepatic encephalopathy (Conn HO, Leevy CM, Vlahcevic ZR, et al, Gastroenterology 1977): the canonical 0-4 grade. Grade 0 has no detectable change (minimal HE is detectable only on testing); grade 1 is a trivial lack of awareness with euphoria or anxiety and impaired addition; grade 2 is lethargy or apathy with disorientation to time and asterixis; grade 3 is somnolence to semi-stupor, responsive to stimuli, with gross disorientation; grade 4 is coma. Grades 2 and above are overt encephalopathy. It classifies severity; the management decision stays with the clinician.';
const WH_GRADES = {
  '0': 'Grade 0 -- minimal (no detectable personality or behavior change; deficits only on neuropsychological testing)',
  '1': 'Grade 1 -- trivial lack of awareness, euphoria or anxiety, shortened attention span, impaired addition',
  '2': 'Grade 2 -- lethargy or apathy, disorientation to time, obvious personality change, inappropriate behavior, asterixis',
  '3': 'Grade 3 -- somnolence to semi-stupor but responsive to stimuli, confusion, gross disorientation, bizarre behavior',
  '4': 'Grade 4 -- coma (unresponsive to verbal or noxious stimuli)',
};

export function westHavenHe(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const g = lvl(o.grade, 0, 4);
  const overt = g >= 2;
  return {
    valid: true, grade: g,
    abnormal: overt,
    band: `${WH_GRADES[String(g)]}${overt ? ' -- overt hepatic encephalopathy' : ''}.`,
    note: WH_NOTE,
  };
}

// --- 2.5 hepatic-steatosis-index ----------------------------------------------
const HSI_NOTE = 'Hepatic Steatosis Index (Lee JH, Kim D, Kim HJ, et al, Dig Liver Dis 2010): a NAFLD screen, HSI = 8 x (ALT/AST) + BMI + 2 if female + 2 if diabetes mellitus. A value below 30.0 rules NAFLD out (sensitivity about 93%); above 36.0 rules it in (specificity about 92%); 30 to 36 is indeterminate and ultrasound is suggested. It is a screen; imaging and management stay with the clinician.';

export function hepaticSteatosisIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alt = pos(o.alt);
  const ast = pos(o.ast);
  const bmi = pos(o.bmi);
  if (alt === null || ast === null || bmi === null) return { valid: false, message: INCOMPLETE };
  let hsi = 8 * (alt / ast) + bmi;
  if (onFlag(o.female)) hsi += 2;
  if (onFlag(o.diabetes)) hsi += 2;
  let band; let high;
  if (hsi < 30.0) { band = 'below 30 -- NAFLD is ruled out'; high = false; }
  else if (hsi > 36.0) { band = 'above 36 -- NAFLD is likely (consider further workup)'; high = true; }
  else { band = 'between 30 and 36 -- indeterminate; ultrasound is suggested'; high = false; }
  return {
    valid: true, hsi: r2(hsi),
    abnormal: high,
    band: `Hepatic Steatosis Index ${r2(hsi)}: ${band}.`,
    note: HSI_NOTE,
  };
}
