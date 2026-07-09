// spec-v261: acute-abdomen & emergency-general-surgery risk instruments — the RIPASA
// appendicitis score, the PULP peptic-ulcer-perforation mortality score, and the
// Emergency Surgery Score (ESS). First feature spec of the Bedside Acute-Care
// Instruments program. Each id was verified absent by a fixed-string scan of the
// extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2). v261
// runs no AI and makes no runtime network call.
//
// These compute a probability or mortality-risk CATEGORY — none is an operative,
// imaging, admission, or discharge order (spec-v11 §5.3). The decision to operate,
// scan, admit, or discharge stays with the surgeon.
//
//   ripasa                   - RIPASA appendicitis score (0-16, 7.5 diagnostic cutoff)
//   pulp                     - PULP peptic-ulcer-perforation mortality (0-18, <= 7 low / >= 8 high)
//   emergency-surgery-score  - Emergency Surgery Score (0-29, monotone mortality gradient)
//
// CRITERIA / WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified against the
// primary papers and independent calculators at implementation:
//   RIPASA - Chong CF et al., Singapore Med J 2010;51(3):220-225; max 16, cutoff 7.5.
//   PULP   - Møller MH et al., Acta Anaesthesiol Scand 2012;56(5):655-662; point table
//            confirmed against IJPCR 2024;16(6):1978-1981 Table 1 (age>65 +3, malignancy/
//            AIDS +1, cirrhosis +2, steroid +1, delay>24h +1, shock +1, creatinine>130 +2,
//            ASA 2/3/4/5 = 1/3/5/7; max 18).
//   ESS    - Sangji NF et al., J Trauma Acute Care Surg 2016;81(2):213-220; 22 preop
//            variables across three domains, max 29; derivation mortality gradient
//            ~0% (low) -> ~36-39% at ESS 11 -> ~100% at ESS >= 22 (c-statistic ~0.86).

// --- RIPASA appendicitis score -----------------------------------------------
// Higher-sensitivity alternative to Alvarado in populations where Alvarado misses.
// Demographics (gender, age band, symptom duration) always contribute; the remaining
// items are boolean. Diagnostic cutoff 7.5 (~88% sensitivity / 67% specificity).
const RIPASA_NOTE = 'RIPASA score (Chong 2010): a 15-item appendicitis probability score built for populations where Alvarado underperforms. Demographics — male +1 / female +0.5, age <= 40 +1 / > 40 +0.5; symptoms — RIF pain +0.5, migration of pain to RIF +0.5, anorexia +1, nausea & vomiting +1, duration < 48h +1 / > 48h +0.5; signs — RIF tenderness +1, guarding +2, rebound +1, Rovsing sign +2, fever 37-39 C +1; investigations — raised WBC +1, negative urinalysis +1; plus the foreign-NRIC demographic item +1. Max 16. Bands: < 5 unlikely, 5-7 low/moderate, 7.5-11.5 high probability (7.5 optimal cutoff), >= 12 very high. A probability band, not an operative decision.';
function ripasaBand(s) {
  if (s < 5) return 'unlikely';
  if (s < 7.5) return 'low/moderate probability (observe or image per source)';
  if (s < 12) return 'high probability of appendicitis';
  return 'very high probability of appendicitis';
}
export function ripasa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const fired = [];
  // Demographics — each always contributes one of two weights.
  if (o.gender === 'female') { total += 0.5; fired.push('female (+0.5)'); }
  else { total += 1; fired.push('male (+1)'); }
  if (o.ageBand === 'gt40') { total += 0.5; fired.push('age > 40 (+0.5)'); }
  else { total += 1; fired.push('age <= 40 (+1)'); }
  if (o.duration === 'gt48') { total += 0.5; fired.push('symptom duration > 48h (+0.5)'); }
  else { total += 1; fired.push('symptom duration < 48h (+1)'); }
  // Boolean items.
  const boxes = [
    [o.rifPain, 'RIF pain (+0.5)', 0.5],
    [o.migration, 'migration of pain to RIF (+0.5)', 0.5],
    [o.anorexia, 'anorexia (+1)', 1],
    [o.nauseaVomiting, 'nausea & vomiting (+1)', 1],
    [o.rifTenderness, 'RIF tenderness (+1)', 1],
    [o.guarding, 'guarding (+2)', 2],
    [o.rebound, 'rebound tenderness (+1)', 1],
    [o.rovsing, "Rovsing's sign (+2)", 2],
    [o.fever, 'fever 37-39 C (+1)', 1],
    [o.raisedWbc, 'raised WBC (+1)', 1],
    [o.negativeUrinalysis, 'negative urinalysis (+1)', 1],
    [o.foreignNric, 'foreign NRIC (+1)', 1],
  ];
  for (const [on, label, pts] of boxes) { if (on === true) { total += pts; fired.push(label); } }
  const label = ripasaBand(total);
  const cutoffText = total >= 7.5 ? ' (>= 7.5 diagnostic cutoff)' : '';
  return { valid: true, score: total, abnormal: total >= 7.5, bandLabel: `RIPASA ${total}`,
    band: `RIPASA ${total} of 16 — ${label}${cutoffText}.`,
    detail: `Contributing: ${fired.join(', ')}.`, note: RIPASA_NOTE };
}

// --- PULP peptic-ulcer-perforation mortality score ---------------------------
// Eight variables, total 0-18. <= 7 low risk (< 25% 30-day mortality), >= 8 high
// risk (> 25%). Outperforms the Boey score and ASA alone (derivation AUC ~0.83).
const PULP_NOTE = 'PULP (Peptic Ulcer Perforation) score (Møller 2012): 30-day mortality after peptic-ulcer-perforation surgery. Age > 65 +3, active malignancy or AIDS +1, liver cirrhosis +2, concomitant steroid use +1, time from perforation to admission > 24h +1, shock on admission (SBP < 100) +1, serum creatinine > 130 umol/L +2, and the ASA class (ASA 2 +1 / ASA 3 +3 / ASA 4 +5 / ASA 5 +7; ASA 1 = 0). Total 0-18. <= 7 = low risk (< 25% mortality), >= 8 = high risk (> 25%). Outperforms the Boey score and ASA alone. A mortality-risk band, not an operative or disposition order.';
const PULP_ASA = { 1: 0, 2: 1, 3: 3, 4: 5, 5: 7 };
export function pulp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const fired = [];
  const boxes = [
    [o.ageOver65, 'age > 65 (+3)', 3],
    [o.malignancyAids, 'active malignancy or AIDS (+1)', 1],
    [o.cirrhosis, 'liver cirrhosis (+2)', 2],
    [o.steroids, 'concomitant steroid use (+1)', 1],
    [o.delayedAdmission, 'perforation to admission > 24h (+1)', 1],
    [o.shock, 'shock on admission, SBP < 100 (+1)', 1],
    [o.creatinine, 'serum creatinine > 130 umol/L (+2)', 2],
  ];
  for (const [on, label, pts] of boxes) { if (on === true) { total += pts; fired.push(label); } }
  const asaKey = Number(o.asa);
  const asaPts = Object.prototype.hasOwnProperty.call(PULP_ASA, asaKey) ? PULP_ASA[asaKey] : 0;
  if (asaPts > 0) { total += asaPts; fired.push(`ASA ${asaKey} (+${asaPts})`); }
  const high = total >= 8;
  const label = high ? 'high risk (> 25% 30-day mortality per source)' : 'low risk (< 25% 30-day mortality per source)';
  return { valid: true, score: total, abnormal: high, bandLabel: `PULP ${total}`,
    band: `PULP ${total} of 18 — ${label}.`,
    detail: `Contributing: ${fired.length ? fired.join(', ') : 'no risk factors positive (ASA 1)'}.`, note: PULP_NOTE };
}

// --- Emergency Surgery Score (ESS) -------------------------------------------
// 22 preoperative variables across demographic, comorbidity, and laboratory domains;
// total 0-29. The white-race term is a derivation coefficient reproduced as published,
// not a clinical recommendation. Transfer source and WBC band are single-choice.
// Derivation mortality gradient rises monotonically across the range.
const ESS_NOTE = 'Emergency Surgery Score (ESS) (Sangji 2016): a 22-variable preoperative 30-day-mortality engine for emergency general surgery (derivation c-statistic ~0.86). Demographic — age > 60 +2, white race +1 (a derivation coefficient reproduced as published, not a clinical recommendation), transfer from an outside ED or an acute-care inpatient facility +1. Comorbidity — ascites, BMI < 20, dyspnea, functional dependence, COPD, hypertension, steroid use, and > 10% weight loss in 6 months each +1; disseminated cancer and ventilator dependence within 48h preop each +3. Laboratory — albumin < 3.0, alkaline phosphatase > 125, BUN > 40, INR > 1.5, platelets < 150k, AST > 40, sodium > 145, and an abnormal WBC (< 4.5 or 15-25k) +1; creatinine > 1.2 and WBC > 25k each +2. Total 0-29. Derivation mortality ~0% at the low end, ~36-39% near ESS 11, approaching 100% at ESS >= 22. A mortality band, not an operative order.';
function essBand(s) {
  if (s <= 3) return 'low predicted 30-day mortality (~0-4% in the derivation cohort)';
  if (s <= 10) return 'intermediate, rising predicted 30-day mortality';
  if (s <= 16) return 'high predicted 30-day mortality (~36-50% near mid-range)';
  return 'very high predicted 30-day mortality (approaching 100% at ESS >= 22)';
}
export function emergencySurgeryScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const fired = [];
  const boxes = [
    // Demographic
    [o.ageOver60, 'age > 60 (+2)', 2],
    [o.whiteRace, 'white race (+1, derivation coefficient)', 1],
    // Comorbidity — +1 each
    [o.ascites, 'ascites (+1)', 1],
    [o.bmiUnder20, 'BMI < 20 (+1)', 1],
    [o.dyspnea, 'dyspnea (+1)', 1],
    [o.functionalDependence, 'functional dependence (+1)', 1],
    [o.copd, 'COPD (+1)', 1],
    [o.hypertension, 'hypertension (+1)', 1],
    [o.steroids, 'steroid use (+1)', 1],
    [o.weightLoss, '> 10% weight loss in 6 months (+1)', 1],
    // Comorbidity — +3 each
    [o.disseminatedCancer, 'disseminated cancer (+3)', 3],
    [o.ventilatorDependence, 'ventilator dependence within 48h preop (+3)', 3],
    // Laboratory — +1 each
    [o.albumin, 'albumin < 3.0 (+1)', 1],
    [o.alkPhos, 'alkaline phosphatase > 125 (+1)', 1],
    [o.bun, 'BUN > 40 (+1)', 1],
    [o.inr, 'INR > 1.5 (+1)', 1],
    [o.platelets, 'platelets < 150k (+1)', 1],
    [o.ast, 'AST > 40 (+1)', 1],
    [o.sodium, 'sodium > 145 (+1)', 1],
    // Laboratory — creatinine +2
    [o.creatinine, 'creatinine > 1.2 (+2)', 2],
  ];
  for (const [on, label, pts] of boxes) { if (on === true) { total += pts; fired.push(label); } }
  // Transfer source — single choice, +1 for either transfer.
  if (o.transfer === 'ed') { total += 1; fired.push('transfer from an outside ED (+1)'); }
  else if (o.transfer === 'inpatient') { total += 1; fired.push('transfer from an acute-care inpatient facility (+1)'); }
  // WBC band — single choice; abnormal (< 4.5 or 15-25k) +1, high (> 25k) +2.
  if (o.wbc === 'high') { total += 2; fired.push('WBC > 25k (+2)'); }
  else if (o.wbc === 'abnormal') { total += 1; fired.push('abnormal WBC, < 4.5 or 15-25k (+1)'); }
  const label = essBand(total);
  return { valid: true, score: total, abnormal: total >= 11, bandLabel: `ESS ${total}`,
    band: `ESS ${total} of 29 — ${label}.`,
    detail: `Contributing: ${fired.length ? fired.join(', ') : 'no variables positive'}.`, note: ESS_NOTE };
}
