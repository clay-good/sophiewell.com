// spec-v99 (Wave 2 of the spec-v85 Advanced Clinical Calculators program, the
// program-closing feature spec): five deterministic infectious-disease,
// critical-care, and burns decision rules that fill confirmed gaps beside the
// existing acute-infection / critical-care triage tools (curb-65, sirs,
// qsofa-sofa, smart-cop, apache2) and the burn-resuscitation calculator
// (burn-fluid). None duplicates a live tile.
//
//   dukeEndocarditis - Modified Duke criteria for infective endocarditis
//                      (2023 Duke-ISCVID; Fowler 2023 / Li 2000) -> definite/possible/rejected
//   pittBacteremia   - Pitt Bacteremia Score (Paterson 2004 form) -> 0-14 mortality-risk score
//   sapsII           - Simplified Acute Physiology Score II (Le Gall 1993) -> points + predicted mortality
//   lundBrowder      - Lund-Browder age-adjusted %TBSA (Lund-Browder 1944) + adult Rule of Nines
//   refeedingRisk    - NICE CG32 refeeding-syndrome risk stratification
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v25.js wire these to the home grid.
//
// Robustness (spec-v99 §3): sapsII clamps each physiologic variable to its SAPS II
// band, computes the mortality logistic with an overflow-safe form, and guards
// ln(SAPS+1) (SAPS >= 0 always); a blank required variable surfaces a fallback
// rather than a probability from NaN. lundBrowder clamps each region fraction to
// [0,1] and flags an implausible total (> 100%) rather than silently capping; the
// Rule-of-Nines cross-check is computed independently. The criteria tiles
// (duke, pitt, refeeding) are bounded-sum/threshold logic that name which criteria
// fired. None authors an antibiotic, imaging, surgical, or feeding-rate order in
// Sophie's voice (spec-v11 §5.3).

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;

function lookup(map, key) {
  if (key == null) return null;
  const k = String(key).toLowerCase();
  return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null;
}

// --- 2.1 dukeEndocarditis - Modified Duke criteria (2023 Duke-ISCVID) -----------
// definite = 2 major, or 1 major + 3 minor, or 5 minor.
// possible = 1 major + 1 minor, or 3 minor.
// rejected = does not meet possible.
const DUKE_MAJOR = [
  { key: 'microbiologic', label: 'Microbiologic major (typical organism on persistently positive cultures)' },
  { key: 'imaging', label: 'Imaging major (echo/CT/PET evidence of endocardial involvement)' },
  { key: 'surgical', label: 'Surgical major (direct inspection at surgery; 2023 update)' },
];
const DUKE_MINOR = [
  { key: 'predisposition', label: 'Predisposing heart condition or injection drug use' },
  { key: 'fever', label: 'Fever >= 38 C' },
  { key: 'vascular', label: 'Vascular phenomena' },
  { key: 'immunologic', label: 'Immunologic phenomena' },
  { key: 'microbiologic-minor', label: 'Microbiologic evidence not meeting a major criterion' },
];
export const DUKE_MAJOR_CRITERIA = DUKE_MAJOR;
export const DUKE_MINOR_CRITERIA = DUKE_MINOR;
const DUKE_NOTE = 'Modified Duke criteria for infective endocarditis (2023 Duke-ISCVID; Fowler VG et al, Clin Infect Dis 2023, updating Li JS et al 2000). Definite IE = 2 major, or 1 major + 3 minor, or 5 minor criteria. Possible IE = 1 major + 1 minor, or 3 minor. Rejected = does not reach the possible threshold. The tool takes the clinician major/minor determinations; it does not parse a culture or echo report and does not replace the endocarditis-team evaluation.';
export function dukeEndocarditis({ major, minor } = {}) {
  const majorList = Array.isArray(major) ? major : [];
  const minorList = Array.isArray(minor) ? minor : [];
  const majorCount = DUKE_MAJOR.filter((c) => majorList.includes(c.key)).length;
  const minorCount = DUKE_MINOR.filter((c) => minorList.includes(c.key)).length;
  let verdict;
  if ((majorCount >= 2) || (majorCount >= 1 && minorCount >= 3) || (minorCount >= 5)) {
    verdict = 'definite';
  } else if ((majorCount >= 1 && minorCount >= 1) || (minorCount >= 3)) {
    verdict = 'possible';
  } else {
    verdict = 'rejected';
  }
  const verdictText = { definite: 'Definite infective endocarditis', possible: 'Possible infective endocarditis', rejected: 'Rejected (criteria not met)' };
  return {
    valid: true,
    majorCount,
    minorCount,
    verdict,
    band: `${majorCount} major + ${minorCount} minor criteria: ${verdictText[verdict]} by the modified Duke (2023 Duke-ISCVID) rule.`,
    note: DUKE_NOTE,
  };
}

// --- 2.2 pittBacteremia - Pitt Bacteremia Score --------------------------------
// temperature (banded) + hypotension (2) + mechanical ventilation (2) +
// cardiac arrest (4) + mental status (alert 0 / disoriented 1 / stupor 2 / coma 4).
const PITT_TEMP = { normal: 0, mild: 1, severe: 2 };
const PITT_MENTAL = { alert: 0, disoriented: 1, stupor: 2, coma: 4 };
const PITT_NOTE = 'Pitt Bacteremia Score (the widely-applied acute-physiology bacteremia mortality score; Paterson DL et al, Ann Intern Med 2004): temperature (>= 40.0 or <= 35.0 C = 2; 39.0-39.9 or 35.1-36.0 C = 1; 36.1-38.9 C = 0) + hypotension (2) + mechanical ventilation (2) + cardiac arrest (4) + mental status (alert 0, disoriented 1, stupor 2, coma 4). Total 0-14; a score >= 4 is commonly used to denote high mortality risk. A bedside severity score, not a prognosis for the individual patient.';
export function pittBacteremia({ temperature, hypotension, mechVent, cardiacArrest, mentalStatus } = {}) {
  const tempP = lookup(PITT_TEMP, temperature);
  const mentalP = lookup(PITT_MENTAL, mentalStatus);
  if (tempP == null || mentalP == null) {
    return { valid: false, band: '(select temperature band and mental status)', note: PITT_NOTE };
  }
  const items = [
    { label: 'Temperature band', value: tempP },
    { label: 'Hypotension', value: onFlag(hypotension) ? 2 : 0 },
    { label: 'Mechanical ventilation', value: onFlag(mechVent) ? 2 : 0 },
    { label: 'Cardiac arrest', value: onFlag(cardiacArrest) ? 4 : 0 },
    { label: 'Mental status', value: mentalP },
  ];
  const total = items.reduce((a, it) => a + it.value, 0);
  const highRisk = total >= 4;
  return {
    valid: true,
    total,
    highRisk,
    items,
    band: `Pitt Bacteremia Score ${total}/14: ${highRisk ? 'at or above' : 'below'} the >= 4 high-mortality-risk threshold.`,
    note: PITT_NOTE,
  };
}

// --- 2.3 sapsII - Simplified Acute Physiology Score II -------------------------
// 17 variables -> point total -> predicted hospital mortality via the published
// logistic conversion. Point bands transcribed from Le Gall 1993, cross-verified
// against MDCalc / ClinCalc; uses US units (BUN mg/dL, bilirubin mg/dL).
// logit = -7.7631 + 0.0737*score + 0.9971*ln(score+1).
const SAPS_CHRONIC = { none: 0, metastatic: 9, hematologic: 10, aids: 17 };
const SAPS_ADMISSION = { 'scheduled-surgical': 0, medical: 6, 'unscheduled-surgical': 8 };
const SAPS_NOTE = 'Simplified Acute Physiology Score II (SAPS II; Le Gall JR, Lemeshow S, Saulnier F, JAMA 1993): a 17-variable ICU admission severity model. Each physiologic variable is scored against its fixed band; the point total drives the predicted hospital mortality through the published logistic conversion logit = -7.7631 + 0.0737*SAPS + 0.9971*ln(SAPS+1), mortality = e^logit / (1 + e^logit). Companion to the already-shipped apache2. Worst values in the first 24 hours are used; this tool scores the values you enter (BUN in mg/dL, bilirubin in mg/dL). A model estimate for benchmarking, not an individual prognosis.';
// bandPoints(value, bands): bands is an ordered array of { hi, pts } evaluated as
// value < hi; the final band uses hi = Infinity. Each band is a clamped range.
function agePts(a) { return a < 40 ? 0 : a < 60 ? 7 : a < 70 ? 12 : a < 75 ? 15 : a < 80 ? 16 : 18; }
function hrPts(v) { return v < 40 ? 11 : v < 70 ? 2 : v < 120 ? 0 : v < 160 ? 4 : 7; }
function sbpPts(v) { return v < 70 ? 13 : v < 100 ? 5 : v < 200 ? 0 : 2; }
function tempPts(v) { return v < 39 ? 0 : 3; }
function pfPts(v) { return v < 100 ? 11 : v < 200 ? 9 : 6; }
function urinePts(v) { return v < 0.5 ? 11 : v < 1.0 ? 4 : 0; }
function bunPts(v) { return v < 28 ? 0 : v < 84 ? 6 : 10; }
function sodiumPts(v) { return v < 125 ? 5 : v < 145 ? 0 : 1; }
function potassiumPts(v) { return v < 3.0 ? 3 : v < 5.0 ? 0 : 3; }
function bicarbPts(v) { return v < 15 ? 6 : v < 20 ? 3 : 0; }
function bilirubinPts(v) { return v < 4.0 ? 0 : v < 6.0 ? 4 : 9; }
function wbcPts(v) { return v < 1.0 ? 12 : v < 20.0 ? 0 : 3; }
function gcsPts(v) { return v < 6 ? 26 : v < 9 ? 13 : v < 11 ? 7 : v < 14 ? 5 : 0; }
export function sapsII(input = {}) {
  const {
    age, heartRate, sbp, temperature, ventilated, paO2, fio2, urineOutput,
    bun, sodium, potassium, bicarbonate, bilirubin, wbc, gcs,
    chronicDisease, admissionType,
  } = input;
  const a = fin(age), hr = fin(heartRate), bp = fin(sbp), temp = fin(temperature);
  const uo = fin(urineOutput), bn = fin(bun), na = fin(sodium), k = fin(potassium);
  const hco3 = fin(bicarbonate), bili = fin(bilirubin), w = fin(wbc), g = fin(gcs);
  const chronicC = lookup(SAPS_CHRONIC, chronicDisease == null || chronicDisease === '' ? 'none' : chronicDisease);
  const admitC = lookup(SAPS_ADMISSION, admissionType);
  const isVent = onFlag(ventilated);
  const required = [a, hr, bp, temp, uo, bn, na, k, hco3, bili, w, g];
  if (required.some((v) => v == null) || chronicC == null || admitC == null) {
    return { valid: false, band: '(enter all 17 SAPS II variables -- the physiologic values, chronic disease, and admission type)', note: SAPS_NOTE };
  }
  // PaO2/FiO2 only scores when ventilated/CPAP; otherwise 0. When ventilated but
  // the gas values are blank, the term is treated as not-measured (0).
  let pfPoints = 0;
  let pfRatio = null;
  if (isVent) {
    const pa = fin(paO2);
    const f = fin(fio2);
    if (pa != null && f != null && f > 0) {
      pfRatio = pa / f;
      pfPoints = pfPts(Math.max(0, pfRatio));
    }
  }
  const items = [
    { label: 'Age', value: agePts(Math.max(0, Math.min(130, a))) },
    { label: 'Heart rate', value: hrPts(Math.max(0, Math.min(400, hr))) },
    { label: 'Systolic BP', value: sbpPts(Math.max(0, Math.min(400, bp))) },
    { label: 'Temperature', value: tempPts(Math.max(20, Math.min(46, temp))) },
    { label: 'PaO2/FiO2 (if ventilated)', value: pfPoints },
    { label: 'Urine output', value: urinePts(Math.max(0, uo)) },
    { label: 'BUN', value: bunPts(Math.max(0, bn)) },
    { label: 'Sodium', value: sodiumPts(Math.max(0, na)) },
    { label: 'Potassium', value: potassiumPts(Math.max(0, k)) },
    { label: 'Bicarbonate', value: bicarbPts(Math.max(0, hco3)) },
    { label: 'Bilirubin', value: bilirubinPts(Math.max(0, bili)) },
    { label: 'WBC', value: wbcPts(Math.max(0, w)) },
    { label: 'Glasgow Coma Scale', value: gcsPts(Math.max(3, Math.min(15, g))) },
    { label: 'Chronic disease', value: chronicC },
    { label: 'Admission type', value: admitC },
  ];
  const score = items.reduce((acc, it) => acc + it.value, 0);
  // Mortality logistic. score >= 0 always, so ln(score + 1) is finite.
  const logit = -7.7631 + 0.0737 * score + 0.9971 * Math.log(score + 1);
  const clamped = Math.max(-40, Math.min(40, logit));
  const mortality = Math.max(0, Math.min(100, (1 / (1 + Math.exp(-clamped))) * 100));
  return {
    valid: true,
    score,
    mortality: r1(mortality),
    pfRatio: pfRatio == null ? null : r1(pfRatio),
    items,
    band: `SAPS II ${score} points: predicted hospital mortality ${r1(mortality)}%.`,
    note: SAPS_NOTE,
  };
}

// --- 2.4 lundBrowder - Lund-Browder age-adjusted %TBSA + Rule of Nines ----------
// Whole-region (bilateral-combined) Lund-Browder percentages. Head, thighs, and
// lower legs are age-adjusted; the rest are age-independent. Age bands index:
// 0=infant(<1), 1=1yr, 2=5yr, 3=10yr, 4=15yr, 5=adult. The `ron` share is the
// adult Rule-of-Nines macro-region apportioned to each fine region (area-weighted
// by the adult Lund-Browder sub-areas), so a fully-burned body yields exactly
// 100% on either method. Constants transcribed from the Lund-Browder chart
// (cross-verified against the Joint Trauma System adult/pediatric charts).
export const LB_AGE_BANDS = [
  { key: 'infant', label: 'Infant (< 1 year)' },
  { key: '1', label: '1 year' },
  { key: '5', label: '5 years' },
  { key: '10', label: '10 years' },
  { key: '15', label: '15 years' },
  { key: 'adult', label: 'Adult' },
];
const LB_AGE_INDEX = { infant: 0, '1': 1, '5': 2, '10': 3, '15': 4, adult: 5 };
// Each region: lb is a 6-element age array or a single age-independent number.
const LB_REGIONS = [
  { key: 'head', label: 'Head', lb: [19, 17, 13, 11, 9, 7], ron: 7 },
  { key: 'neck', label: 'Neck', lb: 2, ron: 2 },
  { key: 'ant-trunk', label: 'Anterior trunk', lb: 13, ron: 18 },
  { key: 'post-trunk', label: 'Posterior trunk', lb: 13, ron: 13 },
  { key: 'buttocks', label: 'Buttocks (both)', lb: 5, ron: 5 },
  { key: 'genitalia', label: 'Genitalia', lb: 1, ron: 1 },
  { key: 'upper-arms', label: 'Upper arms (both)', lb: 8, ron: 7.579 },
  { key: 'forearms', label: 'Forearms (both)', lb: 6, ron: 5.684 },
  { key: 'hands', label: 'Hands (both)', lb: 5, ron: 4.737 },
  { key: 'thighs', label: 'Thighs (both)', lb: [11, 13, 16, 17, 18, 19], ron: 17.1 },
  { key: 'lower-legs', label: 'Lower legs (both)', lb: [10, 10, 11, 12, 13, 14], ron: 12.6 },
  { key: 'feet', label: 'Feet (both)', lb: 7, ron: 6.3 },
];
export const LB_REGION_LIST = LB_REGIONS.map((r) => ({ key: r.key, label: r.label }));
const LB_NOTE = 'Lund-Browder chart (Lund CC, Browder NC, Surg Gynecol Obstet 1944): the age-adjusted estimate of percent total body surface area (%TBSA) burned. The head, thighs, and lower legs are age-adjusted (the head shrinks and the legs grow as a share of body surface with age); the remaining regions are age-independent. Enter the fraction (0-1) of each region burned (partial-thickness and deeper). The adult Rule of Nines is shown alongside as an independent cross-check. The %TBSA feeds resuscitation math (burn-fluid); this tool produces the area, it does not order fluids.';
export function lundBrowder({ ageBand, regions } = {}) {
  const idx = LB_AGE_INDEX[String(ageBand).toLowerCase()];
  if (idx == null) {
    return { valid: false, band: '(select an age band and enter the fraction of each region burned)', note: LB_NOTE };
  }
  const frac = (regions && typeof regions === 'object') ? regions : {};
  let lbTotal = 0;
  let ronTotal = 0;
  const items = [];
  for (const r of LB_REGIONS) {
    const raw = fin(frac[r.key]);
    const f = raw == null ? 0 : Math.max(0, Math.min(1, raw));
    const pct = Array.isArray(r.lb) ? r.lb[idx] : r.lb;
    const contrib = pct * f;
    lbTotal += contrib;
    ronTotal += r.ron * f;
    if (f > 0) items.push({ label: `${r.label} (${Math.round(f * 100)}% of ${pct}%)`, value: r2(contrib) });
  }
  const implausible = lbTotal > 100.0001;
  return {
    valid: true,
    tbsa: r1(lbTotal),
    ruleOfNines: r1(ronTotal),
    implausible,
    items,
    band: `Lund-Browder %TBSA: ${r1(lbTotal)}% (adult Rule of Nines cross-check: ${r1(ronTotal)}%).`,
    note: LB_NOTE,
  };
}

// --- 2.5 refeedingRisk - NICE CG32 refeeding-syndrome risk stratification -------
// High risk if ONE major criterion, OR TWO minor criteria.
// Major: BMI < 16; weight loss > 15% in 3-6 mo; > 10 days little/no intake; low
//        pre-feeding K/Mg/PO4.
// Minor: BMI < 18.5; weight loss > 10%; > 5 days little/no intake; history flag
//        (alcohol misuse, or insulin/chemotherapy/antacid/diuretic use).
const REFEEDING_NOTE = 'Refeeding-syndrome risk (NICE CG32: Nutrition support for adults, 2006, updated 2017). High risk if one major criterion -- BMI < 16 kg/m^2, unintentional weight loss > 15% over 3-6 months, > 10 days with little or no nutritional intake, or low pre-feeding potassium/magnesium/phosphate -- OR two minor criteria -- BMI < 18.5, weight loss > 10%, > 5 days little/no intake, or a history of alcohol misuse or of insulin, chemotherapy, antacid, or diuretic use. High-risk patients warrant cautious refeeding with electrolyte monitoring and repletion per the guideline; this tool reports the risk category, not the feeding rate.';
export function refeedingRisk({ bmi, weightLoss, daysNoIntake, lowElectrolytes, historyFlag } = {}) {
  const b = fin(bmi);
  const wl = fin(weightLoss);
  const days = fin(daysNoIntake);
  if (b == null || wl == null || days == null) {
    return { valid: false, band: '(enter BMI, percent unintentional weight loss, and days with little or no intake)', note: REFEEDING_NOTE };
  }
  const major = [];
  const minor = [];
  if (b < 16) major.push('BMI < 16 kg/m^2');
  else if (b < 18.5) minor.push('BMI < 18.5 kg/m^2');
  if (wl > 15) major.push('unintentional weight loss > 15%');
  else if (wl > 10) minor.push('unintentional weight loss > 10%');
  if (days > 10) major.push('> 10 days little or no nutritional intake');
  else if (days > 5) minor.push('> 5 days little or no nutritional intake');
  if (onFlag(lowElectrolytes)) major.push('low pre-feeding potassium/magnesium/phosphate');
  if (onFlag(historyFlag)) minor.push('history of alcohol misuse or insulin, chemotherapy, antacid, or diuretic use');
  const highRisk = major.length >= 1 || minor.length >= 2;
  return {
    valid: true,
    highRisk,
    majorCount: major.length,
    minorCount: minor.length,
    major,
    minor,
    band: highRisk
      ? `High risk of refeeding syndrome -- ${major.length} major + ${minor.length} minor NICE criteria (high risk = >= 1 major or >= 2 minor).`
      : `Not high risk by NICE criteria -- ${major.length} major + ${minor.length} minor (high risk requires >= 1 major or >= 2 minor).`,
    note: REFEEDING_NOTE,
  };
}
