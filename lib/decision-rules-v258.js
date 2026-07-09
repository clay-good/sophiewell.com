// spec-v258: acute & primary-care decision rules — the Canadian CT Head Rule, the
// San Francisco Syncope Rule (CHESS), and the McIsaac score (age-adjusted Centor).
// First feature spec of the Advanced Risk-Stratification Instruments program. Each id
// was verified absent by a fixed-string scan of the extracted app.js id/name lists AND
// the MCP adapter set first (spec-v85 §6.2). v258 runs no AI and makes no runtime
// network call.
//
// These compute a risk / eligibility CATEGORY — none is an imaging, admission,
// discharge, or antibiotic order (spec-v11 §5.3). The scan / admit / treat decision
// stays with the clinician.
//
//   canadian-ct-head  - Canadian CT Head Rule (minor head injury)
//   sf-syncope        - San Francisco Syncope Rule (CHESS)
//   mcisaac           - McIsaac score (modified Centor, strep pharyngitis)
//
// CRITERIA / WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across
// >= 2 independent open sources at implementation (see per-function headers).

function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function truthy(v) { return v === true; }

// --- Canadian CT Head Rule ----------------------------------------------------
// Minor head injury (witnessed LOC / amnesia / disorientation, initial GCS 13-15).
// Five HIGH-risk criteria (predict need for neurosurgical intervention) and two
// MEDIUM-risk criteria (predict any clinically important brain injury on CT). CT is
// recommended if ANY criterion is present. Cross-verified: Stiell IG et al. Lancet
// 2001;357:1391-6; MDCalc "Canadian CT Head Injury/Trauma Rule".
const CCH_NOTE = 'Canadian CT Head Rule: for minor head injury with witnessed loss of consciousness, amnesia, or disorientation and an initial GCS 13-15. NOT validated for non-trauma, GCS < 13, age < 16, anticoagulation/bleeding disorder, obvious open skull fracture, or seizure. CT is recommended when any of the five high-risk (neurosurgical) or two medium-risk (clinically important) criteria is present; sensitivity-first rule that safely reduces head CT. A risk category, not an imaging order (the scan decision stays with the clinician).';
const CCH_HIGH = [
  ['gcs2h', 'GCS < 15 at 2 h post-injury'],
  ['skullFracture', 'suspected open or depressed skull fracture'],
  ['basalFracture', 'sign of basal skull fracture'],
  ['vomiting', '>= 2 vomiting episodes'],
  ['age65', 'age >= 65'],
];
const CCH_MEDIUM = [
  ['retrogradeAmnesia', 'retrograde amnesia >= 30 min'],
  ['dangerousMechanism', 'dangerous mechanism'],
];
export function canadianCtHead(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const high = CCH_HIGH.filter(([k]) => truthy(o[k])).map(([, l]) => l);
  const med = CCH_MEDIUM.filter(([k]) => truthy(o[k])).map(([, l]) => l);
  const score = high.length + med.length;
  if (score === 0) {
    return { valid: true, score: 0, abnormal: false, bandLabel: 'CT not required',
      band: 'CT not required by the rule — all seven criteria absent.',
      detail: 'No high-risk (neurosurgical) or medium-risk (clinically important) criterion present.', note: CCH_NOTE };
  }
  const parts = [];
  if (high.length) parts.push(`high-risk (neurosurgical): ${high.join(', ')}`);
  if (med.length) parts.push(`medium-risk (clinically important): ${med.join(', ')}`);
  return { valid: true, score, abnormal: true, bandLabel: 'CT recommended',
    band: `CT head recommended — ${parts.join('; ')}.`,
    detail: `${score} of 7 criteria present.`, note: CCH_NOTE };
}

// --- San Francisco Syncope Rule (CHESS) --------------------------------------
// Any one CHESS item positive => high risk for a serious 7-day outcome; all five
// negative => low risk (~96 % sensitivity as a rule-out). Cross-verified: Quinn JV
// et al. Ann Emerg Med 2004;43:224-32; MDCalc "San Francisco Syncope Rule".
const SFS_NOTE = 'San Francisco Syncope Rule (CHESS): the original ED syncope disposition screen (the Canadian Syncope and ROSE engines later refined it). Any one positive item => high risk for a serious 7-day outcome; all five negative => low risk. Its value is its high (~96 %) sensitivity as a rule-out. A risk category, not an admission or discharge order.';
const SFS_ITEMS = [
  ['chf', 'history of congestive heart failure'],
  ['hct30', 'hematocrit < 30%'],
  ['abnormalEcg', 'abnormal ECG'],
  ['dyspnea', 'shortness of breath'],
  ['sbp90', 'systolic BP < 90 mmHg'],
];
export function sfSyncope(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fired = SFS_ITEMS.filter(([k]) => truthy(o[k])).map(([, l]) => l);
  const score = fired.length;
  if (score === 0) {
    return { valid: true, score: 0, abnormal: false, bandLabel: 'Low risk',
      band: 'Low risk — all five CHESS criteria negative.',
      detail: 'C=CHF, H=Hct < 30%, E=abnormal ECG, S=shortness of breath, S=SBP < 90.', note: SFS_NOTE };
  }
  return { valid: true, score, abnormal: true, bandLabel: 'High risk',
    band: `High risk for a serious 7-day outcome — CHESS positive: ${fired.join(', ')}.`,
    detail: `${score} of 5 CHESS criteria positive.`, note: SFS_NOTE };
}

// --- McIsaac score (modified Centor) -----------------------------------------
// Centor's four criteria (each +1) plus the age adjustment that distinguishes McIsaac
// from raw Centor: age 3-14 +1, 15-44 0, >= 45 -1. Total -1..5, mapped to the
// estimated probability of group A streptococcal (GAS) pharyngitis and the published
// testing/treatment band. Cross-verified: McIsaac WJ et al. CMAJ 1998;158:75-83;
// MDCalc "McIsaac Modification of the Centor Score".
const MCI_NOTE = 'McIsaac score: the age-corrected Centor for streptococcal pharyngitis. Temperature > 38 C (+1), absence of cough (+1), tender anterior cervical adenopathy (+1), tonsillar swelling/exudate (+1), and the age adjustment (3-14 +1, 15-44 0, >= 45 -1). The total maps to the estimated probability of group A strep and a testing strategy. It recommends a testing strategy, never writes an antibiotic order (the treat decision stays with the clinician).';
function mcisaacBand(s) {
  if (s <= 0) return { prob: '1-2.5%', mgmt: 'no testing or antibiotic indicated' };
  if (s === 1) return { prob: '5-10%', mgmt: 'no testing or antibiotic in most adults; culture optional' };
  if (s === 2) return { prob: '11-17%', mgmt: 'rapid antigen test or throat culture, treat if positive' };
  if (s === 3) return { prob: '28-35%', mgmt: 'rapid antigen test or throat culture, treat if positive' };
  return { prob: '51-53%', mgmt: 'rapid antigen test or throat culture, or empiric treatment' };
}
export function mcisaacScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = fin(o.age, 0, 120);
  if (age === null) {
    return { valid: false, message: 'Enter the patient age (years); check the clinical features that apply.' };
  }
  const feats = [
    [truthy(o.fever), 'temperature > 38 C'],
    [truthy(o.absentCough), 'absence of cough'],
    [truthy(o.adenopathy), 'tender anterior cervical adenopathy'],
    [truthy(o.exudate), 'tonsillar swelling or exudate'],
  ];
  const points = feats.filter(([v]) => v).length;
  const ageMod = (age >= 3 && age <= 14) ? 1 : (age >= 45 ? -1 : 0);
  const score = points + ageMod;
  const { prob, mgmt } = mcisaacBand(score);
  const named = feats.filter(([v]) => v).map(([, l]) => l);
  const featText = named.length ? named.join(', ') : 'no Centor features';
  const modText = ageMod > 0 ? '+1 (age 3-14)' : (ageMod < 0 ? '-1 (age >= 45)' : '0 (age 15-44)');
  return { valid: true, score, abnormal: score >= 4, bandLabel: `McIsaac ${score}`,
    band: `McIsaac ${score} — group A strep probability ~${prob}; ${mgmt}.`,
    detail: `${points} Centor feature(s) [${featText}] with age modifier ${modText}.`, note: MCI_NOTE };
}
