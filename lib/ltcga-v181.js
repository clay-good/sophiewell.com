// spec-v181 (cluster §3.9 of the spec-v172 Long-Term Care & Geriatric Assessment
// program): long-term-care infection surveillance & antimicrobial stewardship —
// the Revised McGeer surveillance definitions and the Loeb minimum criteria for
// initiating antibiotics. Two deterministic criteria-logic evaluations; each
// consumes the clinician's observed, site-specific findings and returns a
// categorical MEETS / DOES NOT MEET (McGeer) or MET / NOT MET (Loeb)
// determination, naming the satisfied criteria and the blocking gap when not met.
// There is NO numeric score and NO weighting — the published per-site boolean
// rule is encoded literally (spec-v100 §5 / spec-v97).
//
//   mcgeerCriteria      (Group G) — Revised McGeer surveillance definitions.
//   loebMinimumCriteria (Group G) — Loeb minimum criteria for initiating abx.
//
// Every criterion, body-site definition, temperature threshold, and boolean rule
// was re-fetched and cross-verified VERBATIM against >= 2 independent sources at
// implementation (spec-v97), NEVER recalled:
//   1. Stone ND, Ashraf MS, Calder J, et al. Surveillance definitions of
//      infections in long-term care facilities: revisiting the McGeer criteria.
//      Infect Control Hosp Epidemiol. 2012;33(10):965-977 (Tables 2-6, primary).
//   2. Missouri DHSS "Updated McGeer Criteria for Infection Surveillance Tool"
//      and "Loeb Minimum Criteria … Quick Reference Chart"; Minnesota DOH
//      "Minimum Criteria for Initiation of Antibiotics in LTC Residents" card.
//   The Loeb 5-site set is byte-identical across the MN card and MO chart; the
//   McGeer syndrome rules are byte-identical between Stone 2012 and the MO tool.
//
// SCOPE / DEFERRALS (spec-v97 free-reproducibility + spec-v172 §4):
//   - mcgeerCriteria ships the cross-verified surveillance syndromes the field
//     tools (Stone 2012 + the MO/MN/CDC-NHSN references) publish for direct
//     determination: UTI (with / without indwelling catheter), respiratory
//     (common cold / pharyngitis, influenza-like illness, pneumonia, lower-RTI),
//     skin & soft-tissue (cellulitis / wound, conjunctivitis), and
//     gastrointestinal (gastroenteritis). The Stone 2012 systemic
//     primary-bloodstream / unexplained-febrile-episode definitions and the
//     dermatologic sub-syndromes whose McGeer rule reduces to "rash + a
//     provider's diagnosis" (scabies, oral candidiasis, fungal, HSV, VZV) are
//     NOT shipped here: the former could not be byte-verified against a 2nd
//     independent field source, and the latter are physician-diagnosis
//     tautologies, not a computable findings-to-determination rule. The
//     surveillance laboratory definitions of norovirus and C. difficile are
//     likewise out of scope (LabID, not a bedside findings rule).
//   - These are SURVEILLANCE (McGeer) and STEWARDSHIP-INITIATION-SUPPORT (Loeb)
//     instruments. McGeer is for infection tracking/reporting — it is not a
//     diagnosis and not a treatment trigger. Loeb is decision support for when
//     the minimum threshold to START antibiotics is met — it does not order and
//     does not withhold therapy; the prescriber and local protocol decide
//     (spec-v11 §5.3, spec-v100 §2 clause 5). Citations live inline in
//     lib/meta.js. No AI, no runtime network call.
//
// "Fever" and "leukocytosis" appear as single clinician-determined checkboxes
// (the clinician applies the published Table 2 threshold — Fever = single oral
// > 37.8 °C / 100 °F, or repeated oral > 37.3 °C / 99 °F or rectal > 37.5 °C /
// 99.5 °F, or a single site > 1.1 °C / 2 °F over baseline; Leukocytosis =
// > 14,000 leukocytes/mm3 or a left shift). The Loeb "Fever" checkbox carries
// Loeb's own threshold (> 37.9 °C / 100 °F or >= 1.5 °C / 2.4 °F above baseline).

import { num } from './num.js';

void num;

function present(v) {
  return v === true || v === 'yes' || v === '1' || v === 1 || v === 'on' || v === 'true';
}
function countTrue(c, keys) {
  return keys.reduce((n, k) => n + (present(c[k]) ? 1 : 0), 0);
}
function anyTrue(c, keys) {
  return keys.some((k) => present(c[k]));
}

// ---------------------------------------------------------------------------
// 2.1 Revised McGeer surveillance definitions (Stone 2012)
// ---------------------------------------------------------------------------
const MCGEER_NOTE = 'Revised McGeer surveillance definitions (Stone ND, et al, Infect Control Hosp Epidemiol 2012). A surveillance case definition for counting facility-acquired infections for tracking and reporting — it is NOT a diagnosis and NOT a treatment trigger. Fever and leukocytosis use the McGeer Table 2 thresholds. Some definitions require microbiologic / radiographic confirmation; surveillance is applied retrospectively when that information is available.';

export const MCGEER_SITES = [
  {
    value: 'uti-no-catheter',
    label: 'Urinary tract — without indwelling catheter',
    criteria: [
      { key: 'acuteDysuria', label: 'Acute dysuria' },
      { key: 'acutePainGU', label: 'Acute pain, swelling, or tenderness of the testes, epididymis, or prostate' },
      { key: 'fever', label: 'Fever (Table 2)' },
      { key: 'leukocytosis', label: 'Leukocytosis (Table 2)' },
      { key: 'cvaPain', label: 'Acute costovertebral angle pain or tenderness' },
      { key: 'suprapubicPain', label: 'Suprapubic pain' },
      { key: 'grossHematuria', label: 'Gross hematuria' },
      { key: 'incontinence', label: 'New or marked increase in incontinence' },
      { key: 'urgency', label: 'New or marked increase in urgency' },
      { key: 'frequency', label: 'New or marked increase in frequency' },
      { key: 'voidedCulture', label: 'Voided urine ≥ 10^5 cfu/mL of ≤ 2 species of microorganisms' },
      { key: 'inOutCulture', label: 'In-and-out catheter urine ≥ 10^2 cfu/mL of any number of organisms' },
    ],
    rule(c) {
      const febLeuk = present(c.fever) || present(c.leukocytosis);
      const localizing = ['cvaPain', 'suprapubicPain', 'grossHematuria', 'incontinence', 'urgency', 'frequency'];
      const localizingNoCva = ['suprapubicPain', 'grossHematuria', 'incontinence', 'urgency', 'frequency'];
      const subA = present(c.acuteDysuria) || present(c.acutePainGU);
      const subB = febLeuk && countTrue(c, localizing) >= 1;
      const subC = !febLeuk && countTrue(c, localizingNoCva) >= 2;
      const clinical = subA || subB || subC;
      const micro = present(c.voidedCulture) || present(c.inOutCulture);
      const met = clinical && micro;
      let blocker = null;
      if (!met) {
        if (!clinical && !micro) blocker = 'needs both a clinical sign/symptom criterion and a positive urine culture';
        else if (!clinical) blocker = 'a clinical sign/symptom criterion (acute dysuria, or fever/leukocytosis plus a localizing finding, or ≥ 2 localizing findings) is not met';
        else blocker = 'a positive urine culture (voided ≥ 10^5 cfu/mL of ≤ 2 species, or in-and-out ≥ 10^2 cfu/mL) is required';
      }
      return { met, blocker };
    },
  },
  {
    value: 'uti-catheter',
    label: 'Urinary tract — with indwelling catheter',
    criteria: [
      { key: 'feverRigorsHypotension', label: 'Fever, rigors, or new-onset hypotension (with no alternate site of infection)' },
      { key: 'msDeclineLeukocytosis', label: 'Acute change in mental status or acute functional decline (no alternate diagnosis) with leukocytosis' },
      { key: 'suprapubicOrCva', label: 'New-onset suprapubic pain or costovertebral angle pain or tenderness' },
      { key: 'purulentDischarge', label: 'Purulent discharge from around the catheter' },
      { key: 'acutePainGU', label: 'Acute pain, swelling, or tenderness of the testes, epididymis, or prostate' },
      { key: 'catheterCulture', label: 'Catheter urine specimen ≥ 10^5 cfu/mL of any organism(s)' },
    ],
    rule(c) {
      const clinical = countTrue(c, ['feverRigorsHypotension', 'msDeclineLeukocytosis', 'suprapubicOrCva', 'purulentDischarge', 'acutePainGU']) >= 1;
      const micro = present(c.catheterCulture);
      const met = clinical && micro;
      let blocker = null;
      if (!met) {
        if (!clinical && !micro) blocker = 'needs at least 1 clinical criterion and a catheter culture ≥ 10^5 cfu/mL';
        else if (!clinical) blocker = 'at least 1 clinical criterion is required';
        else blocker = 'a catheter urine specimen ≥ 10^5 cfu/mL of any organism is required';
      }
      return { met, blocker };
    },
  },
  {
    value: 'common-cold',
    label: 'Respiratory — common cold syndrome or pharyngitis',
    criteria: [
      { key: 'runnyNose', label: 'Runny nose or sneezing' },
      { key: 'stuffyNose', label: 'Stuffy nose (congestion)' },
      { key: 'soreThroat', label: 'Sore throat or hoarseness or difficulty swallowing' },
      { key: 'dryCough', label: 'Dry cough' },
      { key: 'swollenGlands', label: 'Swollen or tender glands in the neck (cervical lymphadenopathy)' },
    ],
    rule(c) {
      const n = countTrue(c, ['runnyNose', 'stuffyNose', 'soreThroat', 'dryCough', 'swollenGlands']);
      const met = n >= 2;
      return { met, blocker: met ? null : `at least 2 criteria must be present (${n} present)` };
    },
  },
  {
    value: 'influenza-like',
    label: 'Respiratory — influenza-like illness',
    criteria: [
      { key: 'fever', label: 'Fever (Table 2)' },
      { key: 'chills', label: 'Chills' },
      { key: 'headacheEyePain', label: 'New headache or eye pain' },
      { key: 'myalgias', label: 'Myalgias or body aches' },
      { key: 'malaise', label: 'Malaise or loss of appetite' },
      { key: 'soreThroat', label: 'Sore throat' },
      { key: 'dryCough', label: 'New or increased dry cough' },
    ],
    rule(c) {
      const sub = countTrue(c, ['chills', 'headacheEyePain', 'myalgias', 'malaise', 'soreThroat', 'dryCough']);
      const met = present(c.fever) && sub >= 3;
      let blocker = null;
      if (!met) {
        if (!present(c.fever)) blocker = 'fever is required for influenza-like illness';
        else blocker = `at least 3 influenza-like subcriteria are required (${sub} present)`;
      }
      return { met, blocker };
    },
  },
  {
    value: 'pneumonia',
    label: 'Respiratory — pneumonia',
    criteria: [
      { key: 'cxrPneumonia', label: 'Chest radiograph interpreted as pneumonia or a new infiltrate' },
      { key: 'newCough', label: 'New or increased cough' },
      { key: 'newSputum', label: 'New or increased sputum production' },
      { key: 'o2desat', label: 'O₂ saturation < 94% on room air, or a > 3% reduction from baseline' },
      { key: 'lungExam', label: 'New or changed lung examination abnormalities' },
      { key: 'pleuriticPain', label: 'Pleuritic chest pain' },
      { key: 'rr25', label: 'Respiratory rate ≥ 25 breaths/min' },
      { key: 'constFever', label: 'Constitutional: fever (Table 2)' },
      { key: 'constLeukocytosis', label: 'Constitutional: leukocytosis (Table 2)' },
      { key: 'constMentalStatus', label: 'Constitutional: acute change in mental status (CAM, all 4)' },
      { key: 'constFunctionalDecline', label: 'Constitutional: acute functional decline (3-point ADL rise)' },
    ],
    rule(c) {
      const resp = countTrue(c, ['newCough', 'newSputum', 'o2desat', 'lungExam', 'pleuriticPain', 'rr25']);
      const constitutional = anyTrue(c, ['constFever', 'constLeukocytosis', 'constMentalStatus', 'constFunctionalDecline']);
      const met = present(c.cxrPneumonia) && resp >= 1 && constitutional;
      let blocker = null;
      if (!met) {
        const gaps = [];
        if (!present(c.cxrPneumonia)) gaps.push('a chest radiograph showing pneumonia or a new infiltrate');
        if (resp < 1) gaps.push('at least 1 respiratory subcriterion');
        if (!constitutional) gaps.push('at least 1 constitutional criterion');
        blocker = `needs ${gaps.join(', ')}`;
      }
      return { met, blocker };
    },
  },
  {
    value: 'lower-rti',
    label: 'Respiratory — lower respiratory tract (bronchitis / tracheobronchitis)',
    criteria: [
      { key: 'cxrNegative', label: 'Chest radiograph not performed, or negative for pneumonia / new infiltrate' },
      { key: 'newCough', label: 'New or increased cough' },
      { key: 'newSputum', label: 'New or increased sputum production' },
      { key: 'o2desat', label: 'O₂ saturation < 94% on room air, or a > 3% reduction from baseline' },
      { key: 'lungExam', label: 'New or changed lung examination abnormalities' },
      { key: 'pleuriticPain', label: 'Pleuritic chest pain' },
      { key: 'rr25', label: 'Respiratory rate ≥ 25 breaths/min' },
      { key: 'constFever', label: 'Constitutional: fever (Table 2)' },
      { key: 'constLeukocytosis', label: 'Constitutional: leukocytosis (Table 2)' },
      { key: 'constMentalStatus', label: 'Constitutional: acute change in mental status (CAM, all 4)' },
      { key: 'constFunctionalDecline', label: 'Constitutional: acute functional decline (3-point ADL rise)' },
    ],
    rule(c) {
      const resp = countTrue(c, ['newCough', 'newSputum', 'o2desat', 'lungExam', 'pleuriticPain', 'rr25']);
      const constitutional = anyTrue(c, ['constFever', 'constLeukocytosis', 'constMentalStatus', 'constFunctionalDecline']);
      const met = present(c.cxrNegative) && resp >= 2 && constitutional;
      let blocker = null;
      if (!met) {
        const gaps = [];
        if (!present(c.cxrNegative)) gaps.push('no chest radiograph or a negative radiograph (a positive radiograph is pneumonia, not lower-RTI)');
        if (resp < 2) gaps.push(`at least 2 respiratory subcriteria (${resp} present)`);
        if (!constitutional) gaps.push('at least 1 constitutional criterion');
        blocker = `needs ${gaps.join(', ')}`;
      }
      return { met, blocker };
    },
  },
  {
    value: 'skin',
    label: 'Skin & soft tissue — cellulitis / soft tissue / wound infection',
    criteria: [
      { key: 'pus', label: 'Pus present at a wound, skin, or soft-tissue site' },
      { key: 'heat', label: 'New or increasing heat at the affected site' },
      { key: 'redness', label: 'New or increasing redness at the affected site' },
      { key: 'swelling', label: 'New or increasing swelling at the affected site' },
      { key: 'tenderness', label: 'New or increasing tenderness at the affected site' },
      { key: 'serousDrainage', label: 'New or increasing serous drainage at the affected site' },
      { key: 'constitutional', label: 'A constitutional criterion (Table 2: fever, leukocytosis, acute mental-status change, or functional decline)' },
    ],
    rule(c) {
      const signs = countTrue(c, ['heat', 'redness', 'swelling', 'tenderness', 'serousDrainage', 'constitutional']);
      const met = present(c.pus) || signs >= 4;
      return { met, blocker: met ? null : `needs pus at the site, or at least 4 of the local signs / a constitutional criterion (${signs} present)` };
    },
  },
  {
    value: 'conjunctivitis',
    label: 'Eye — conjunctivitis',
    criteria: [
      { key: 'pusEye', label: 'Pus appearing from one or both eyes, present for ≥ 24 hours' },
      { key: 'erythema', label: 'New or increased conjunctival erythema, with or without itching' },
      { key: 'pain', label: 'New or increased conjunctival pain, present for ≥ 24 hours' },
    ],
    rule(c) {
      const n = countTrue(c, ['pusEye', 'erythema', 'pain']);
      const met = n >= 1;
      return { met, blocker: met ? null : 'at least 1 conjunctivitis criterion must be present' };
    },
  },
  {
    value: 'gastroenteritis',
    label: 'Gastrointestinal — gastroenteritis',
    criteria: [
      { key: 'diarrhea', label: 'Diarrhea (≥ 3 liquid or watery stools above normal in 24 h)' },
      { key: 'vomiting', label: 'Vomiting (≥ 2 episodes in 24 h)' },
      { key: 'stoolPathogen', label: 'Stool specimen positive for a pathogen (e.g., Salmonella, Shigella, E. coli O157:H7, Campylobacter, rotavirus)' },
      { key: 'nausea', label: 'Nausea' },
      { key: 'abdPain', label: 'Abdominal pain or tenderness' },
    ],
    rule(c) {
      const stoolPlus = present(c.stoolPathogen) && anyTrue(c, ['nausea', 'vomiting', 'abdPain', 'diarrhea']);
      const met = present(c.diarrhea) || present(c.vomiting) || stoolPlus;
      return { met, blocker: met ? null : 'needs diarrhea (≥ 3 stools/24 h), or vomiting (≥ 2 episodes/24 h), or a positive stool pathogen plus a GI symptom' };
    },
  },
];

export function mcgeerCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const site = MCGEER_SITES.find((s) => s.value === o.site);
  if (!site) {
    return { valid: false, message: 'Select the suspected infection site.' };
  }
  const c = {};
  for (const cr of site.criteria) c[cr.key] = present(o[cr.key]);
  const anyChecked = site.criteria.some((cr) => c[cr.key]);
  if (!anyChecked) {
    return { valid: false, message: `Check the findings present for ${site.label}.` };
  }
  const r = site.rule(c);
  const satisfied = site.criteria.filter((cr) => c[cr.key]).map((cr) => cr.label);
  return {
    valid: true,
    site: site.label,
    meets: r.met,
    determination: r.met
      ? `MEETS the Revised McGeer surveillance definition — ${site.label}`
      : `DOES NOT MEET the Revised McGeer surveillance definition — ${site.label}`,
    satisfied,
    blocker: r.met ? null : r.blocker,
    note: MCGEER_NOTE,
  };
}

// ---------------------------------------------------------------------------
// 2.2 Loeb minimum criteria for initiating antibiotics (Loeb 2001)
// ---------------------------------------------------------------------------
const LOEB_NOTE = 'Loeb minimum criteria for initiating antibiotics in LTC residents (Loeb M, et al, Infect Control Hosp Epidemiol 2001). Decision support for when the minimum threshold to START antimicrobials is met — it does not order and does not withhold therapy; the prescriber and the facility’s local protocol decide. "Fever" = > 37.9 °C / 100 °F or a ≥ 1.5 °C / 2.4 °F increase above baseline. Cloudy or foul-smelling urine is not a valid indication; asymptomatic bacteriuria should not be treated.';

export const LOEB_SITES = [
  {
    value: 'uti-no-catheter',
    label: 'Urinary tract — without indwelling catheter',
    criteria: [
      { key: 'acuteDysuria', label: 'Acute dysuria' },
      { key: 'fever', label: 'Fever (> 37.9 °C / 100 °F or ≥ 1.5 °C / 2.4 °F above baseline)' },
      { key: 'urgency', label: 'New or worsening urinary urgency' },
      { key: 'frequency', label: 'New or worsening urinary frequency' },
      { key: 'suprapubicPain', label: 'New or worsening suprapubic pain' },
      { key: 'grossHematuria', label: 'New or worsening gross hematuria' },
      { key: 'cvaTenderness', label: 'New or worsening costovertebral angle tenderness' },
      { key: 'incontinence', label: 'New or worsening urinary incontinence' },
    ],
    rule(c) {
      const localizing = countTrue(c, ['urgency', 'frequency', 'suprapubicPain', 'grossHematuria', 'cvaTenderness', 'incontinence']);
      const met = present(c.acuteDysuria) || (present(c.fever) && localizing >= 1);
      return { met, blocker: met ? null : 'needs acute dysuria, or fever plus at least 1 new/worsening localizing urinary finding' };
    },
  },
  {
    value: 'uti-catheter',
    label: 'Urinary tract — with indwelling catheter',
    criteria: [
      { key: 'fever', label: 'Fever (> 37.9 °C / 100 °F or ≥ 1.5 °C / 2.4 °F above baseline)' },
      { key: 'cvaTenderness', label: 'New costovertebral angle tenderness' },
      { key: 'rigors', label: 'Rigors' },
      { key: 'delirium', label: 'New onset of delirium' },
    ],
    rule(c) {
      const n = countTrue(c, ['fever', 'cvaTenderness', 'rigors', 'delirium']);
      const met = n >= 1;
      return { met, blocker: met ? null : 'needs at least 1 of fever, new CVA tenderness, rigors, or new-onset delirium' };
    },
  },
  {
    value: 'respiratory',
    label: 'Lower respiratory tract',
    criteria: [
      { key: 'tempGt102', label: 'Fever > 38.9 °C / 102 °F' },
      { key: 'fever', label: 'Fever (> 37.9 °C / 100 °F or ≥ 1.5 °C / 2.4 °F above baseline)' },
      { key: 'cough', label: 'Cough' },
      { key: 'productiveCough', label: 'Productive cough' },
      { key: 'rr25', label: 'Respiratory rate > 25 breaths/min' },
      { key: 'pulse100', label: 'Pulse > 100 beats/min' },
      { key: 'rigors', label: 'Rigors' },
      { key: 'delirium', label: 'New onset delirium' },
      { key: 'copdOver65', label: 'Afebrile resident with COPD and > 65 years' },
      { key: 'afebrileNoCopd', label: 'Afebrile resident without COPD' },
      { key: 'newCough', label: 'New or increased cough' },
      { key: 'purulentSputum', label: 'Purulent sputum production' },
      { key: 'newInfiltrate', label: 'New infiltrate on chest x-ray thought to represent pneumonia' },
    ],
    rule(c) {
      const path1 = present(c.tempGt102) && anyTrue(c, ['rr25', 'productiveCough']);
      const path2 = present(c.fever) && present(c.cough) && anyTrue(c, ['pulse100', 'rr25', 'rigors', 'delirium']);
      const path3 = present(c.copdOver65) && present(c.newCough) && present(c.purulentSputum);
      const path4 = present(c.afebrileNoCopd) && present(c.newCough) && present(c.purulentSputum) && anyTrue(c, ['rr25', 'delirium']);
      const path5 = present(c.newInfiltrate) && anyTrue(c, ['fever', 'rr25', 'productiveCough']);
      const met = path1 || path2 || path3 || path4 || path5;
      return { met, blocker: met ? null : 'no Loeb respiratory path is satisfied (fever > 102 °F with cough/RR > 25; or fever + cough + one of pulse > 100 / RR > 25 / rigors / delirium; or the afebrile-COPD, afebrile-non-COPD, or new-infiltrate paths)' };
    },
  },
  {
    value: 'skin',
    label: 'Skin & soft tissue',
    criteria: [
      { key: 'purulentDrainage', label: 'New or increasing purulent drainage at a wound, skin, or soft-tissue site' },
      { key: 'fever', label: 'Fever (> 37.9 °C / 100 °F or ≥ 1.5 °C / 2.4 °F above baseline)' },
      { key: 'redness', label: 'Redness' },
      { key: 'tenderness', label: 'Tenderness' },
      { key: 'warmth', label: 'Warmth' },
      { key: 'swelling', label: 'New or increasing swelling' },
    ],
    rule(c) {
      const signs = countTrue(c, ['fever', 'redness', 'tenderness', 'warmth', 'swelling']);
      const met = present(c.purulentDrainage) || signs >= 2;
      return { met, blocker: met ? null : `needs new/increasing purulent drainage, or at least 2 of fever / redness / tenderness / warmth / new swelling (${signs} present)` };
    },
  },
  {
    value: 'fever-unknown',
    label: 'Fever with an unknown focus of infection',
    criteria: [
      { key: 'fever', label: 'Fever (> 37.9 °C / 100 °F or ≥ 1.5 °C / 2.4 °F above baseline)' },
      { key: 'delirium', label: 'New onset delirium' },
      { key: 'rigors', label: 'Rigors' },
    ],
    rule(c) {
      const met = present(c.fever) && anyTrue(c, ['delirium', 'rigors']);
      let blocker = null;
      if (!met) {
        if (!present(c.fever)) blocker = 'fever is required';
        else blocker = 'fever must be accompanied by new-onset delirium or rigors';
      }
      return { met, blocker };
    },
  },
];

export function loebMinimumCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const site = LOEB_SITES.find((s) => s.value === o.site);
  if (!site) {
    return { valid: false, message: 'Select the suspected infection site.' };
  }
  const c = {};
  for (const cr of site.criteria) c[cr.key] = present(o[cr.key]);
  const anyChecked = site.criteria.some((cr) => c[cr.key]);
  if (!anyChecked) {
    return { valid: false, message: `Check the findings present for ${site.label}.` };
  }
  const r = site.rule(c);
  const satisfied = site.criteria.filter((cr) => c[cr.key]).map((cr) => cr.label);
  return {
    valid: true,
    site: site.label,
    met: r.met,
    determination: r.met
      ? `Minimum criteria MET to initiate antibiotics — ${site.label}`
      : `Minimum criteria NOT MET to initiate antibiotics — ${site.label}`,
    satisfied,
    blocker: r.met ? null : r.blocker,
    note: LOEB_NOTE,
  };
}
