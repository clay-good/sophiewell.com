// spec-v751: the curated topic clusters, extracted from
// scripts/build-topic-pages.mjs so scripts/build-tool-pages.mjs can read them
// without importing that module (which runs its build on import). One source of
// truth for both: the hub pages themselves, and the "More in <topic>" link the
// static tool pages now carry.
//
// Curated topic clusters. Tile ids must exist in UTILITIES; a build-
// time sanity check below drops unknown ids with a warning so the
// build never emits a dead link.
export const TOPICS = {
  cardiology: {
    slug: 'cardiology',
    label: 'Cardiology',
    h1: 'Cardiology calculators and decision tools',
    title: 'Cardiology Calculators - QTc, Wells, CHA2DS2-VASc · Sophie Well',
    description: 'Free cardiology calculators with citations: QTc, Wells PE/DVT, CHA2DS2-VASc, HAS-BLED, HEART, TIMI, GRACE, ASCVD, PREVENT, Sgarbossa. No signup.',
    lede: 'Bedside cardiology math and rule-out scores with the primary citation under every result. QTc by Bazett, Fridericia, Framingham, and Hodges; Wells PE and DVT with the Geneva alternative; CHA2DS2-VASc and HAS-BLED for atrial fibrillation; HEART, TIMI, and GRACE for chest pain risk stratification; ASCVD and PREVENT for primary prevention; Sgarbossa for STEMI in LBBB.',
    tiles: [
      'qtc', 'qtc-suite', 'wells-pe', 'wells-pe-geneva', 'wells-dvt',
      'wells-dvt-caprini', 'perc', 'chads', 'hasbled', 'heart', 'timi',
      'timi-stemi', 'grace', 'ascvd', 'prevent', 'sgarbossa', 'rcri',
      'ecg-axis', 'lvh-criteria', 'duke-treadmill', 'cardiac-power-output',
      'aortic-valve-area', 'cincinnati', 'fast',
    ],
  },
  'medication-safety': {
    slug: 'medication-safety',
    label: 'Medication safety',
    h1: 'Medication safety calculators and references',
    title: 'Medication Safety - MME, Naloxone, Beers · Sophie Well',
    description: 'Free medication-safety tools: opioid MME (CDC 2022), naloxone dosing, renal antibiotic dosing, vasopressor math, steroid + benzo equivalencies.',
    lede: 'Tools sized for the moments where a wrong dose hurts somebody: opioid morphine milligram equivalents under the CDC 2022 update, naloxone dosing by weight, anticoagulation reversal, steroid and benzodiazepine equivalencies, renal antibiotic dose adjustments, vasopressor reference, and insulin infusion math.',
    tiles: [
      'opioid-mme', 'naloxone',
      'anticoag-reversal', 'steroid-equiv', 'benzo-equiv',
      'abx-renal', 'vasopressor', 'insulin-drip', 'drip-rate',
      'weight-dose', 'peds-dose', 'peds-weight-dose', 'conc-rate',
      'tpn-macro', 'time-to-dose',
    ],
  },
  triage: {
    slug: 'triage',
    label: 'Triage and acuity',
    h1: 'Triage and acuity tools',
    title: 'Triage Tools - START, JumpSTART, qSOFA, NIHSS · Sophie Well',
    description: 'Free triage and acuity tools: START and JumpSTART MCI triage, field-trauma triage, qSOFA/SOFA, Cincinnati and FAST stroke, PEWS, ABCD2, NEXUS.',
    lede: 'Decision tools for "who is sickest, who goes first, who can wait." START and JumpSTART mass-casualty triage, the 2021 CDC field trauma triage criteria, qSOFA and SOFA, shock index, Cincinnati and FAST stroke screens, NIHSS, ABCD2 for TIA, PEWS for pediatric acuity, AVPU/GCS, and the NEXUS C-spine rule.',
    tiles: [
      'start-triage', 'jumpstart-triage', 'field-triage', 'qsofa-sofa',
      'shock-index', 'cincinnati', 'fast', 'nihss', 'abcd2', 'pews',
      'avpu-gcs', 'gcs', 'nexus-cspine', 'em-time', 'apgar',
    ],
  },
  nephrology: {
    slug: 'nephrology',
    label: 'Nephrology and acid-base',
    h1: 'Nephrology and acid-base tools',
    title: 'Nephrology Tools - eGFR CKD-EPI 2021, Anion Gap · Sophie Well',
    description: 'Free nephrology and acid-base tools: eGFR (CKD-EPI 2021, race-free), Cockcroft-Gault, FeNa/FeUrea, KDIGO AKI staging, anion gap, Winters, ABG, SAAG.',
    lede: 'Renal function, fluid, electrolyte, and acid-base math with the primary citation under every result. eGFR under the 2021 race-free CKD-EPI equation, Cockcroft-Gault, FeNa and FeUrea, KDIGO AKI staging, anion gap (with delta-delta and corrected variants), osmolal gap, SAAG, Winters formula, ABG interpretation, maintenance fluids, sodium correction with the free-water deficit, corrected calcium and sodium.',
    tiles: [
      'egfr', 'egfr-suite', 'ckd-epi-cystatin', 'cockcroft-gault', 'fena-feurea',
      'kdigo-aki', 'ckd-staging', 'uacr-upcr', 'ktv-urr', 'mehran-cin',
      'anion-gap', 'corrected-anion-gap', 'anion-gap-dd', 'osmolal-gap',
      'saag', 'winters', 'abg', 'sodium-correction', 'free-water-deficit',
      'corrected-sodium', 'corrected-calcium', 'corrected-ca-na',
      'maint-fluids', 'iron-ganzoni',
    ],
  },
  'obstetrics-pediatrics': {
    slug: 'obstetrics-pediatrics',
    label: 'Obstetrics and pediatrics',
    h1: 'Obstetrics and pediatrics tools',
    title: 'Obstetrics & Pediatrics - APGAR, PEWS, Bishop, EDD · Sophie Well',
    description: 'Free OB and peds tools: estimated due date, pregnancy dating, Bishop, APGAR, weight-to-dose, ETT size, JumpSTART, PEWS. No signup.',
    lede: 'OB and pediatric tools: estimated due date and pregnancy dating, the Bishop score for cervical favorability, APGAR scoring, pediatric weight-to-dose and unit conversions, pediatric ETT sizing, JumpSTART MCI triage, PEWS for pediatric acuity, Mentzer for microcytic anemia.',
    tiles: [
      'due-date', 'preg-dating', 'bishop', 'apgar',
      'peds-dose', 'peds-weight-dose', 'peds-weight-conv', 'peds-ett',
      'jumpstart-triage', 'pews', 'mentzer', 'epds',
    ],
  },
  'behavioral-health': {
    slug: 'behavioral-health',
    label: 'Behavioral health',
    h1: 'Behavioral health screeners',
    title: 'Behavioral Health Screeners - PHQ-9, GAD-7, AUDIT-C · Sophie Well',
    description: 'Free behavioral-health screeners: PHQ-9 depression, GAD-7 anxiety, AUDIT-C and CAGE alcohol, EPDS postpartum, Mini-Cog, CIWA and COWS withdrawal.',
    lede: 'Validated screeners for the everyday primary-care, OB, and inpatient visit: PHQ-9 for depression, GAD-7 for anxiety, AUDIT-C and CAGE for alcohol use, EPDS for postpartum mood, Mini-Cog for cognition, CIWA-Ar for alcohol withdrawal, and COWS for opioid withdrawal. Every screener ships a worked example and the primary citation.',
    tiles: ['phq9', 'gad7', 'auditc', 'cage', 'epds', 'mini-cog', 'ciwa', 'cows'],
  },
  'billing-and-coding': {
    slug: 'billing-and-coding',
    label: 'Billing and coding',
    h1: 'Medical billing and coding calculators',
    title: 'Billing & Coding Calculators - E/M time, NDC, HIPAA · Sophie Well',
    description: 'Free medical billing and coding calculators: Medicare MPFS payment, NCCI and MUE claim edits, E/M leveling, patient cost-share, and DRG and APC pricing.',
    lede: 'Calculators that compute a deterministic billing or coding output: the MPFS reimbursement engine (what Medicare actually pays a line, after every reduction), the claim-edit decision engines (will this line deny, and which modifier unlocks it), the E/M and time-based coding engines (how the visit codes in every setting, plus critical-care, prolonged-service, therapy, and anesthesia units), the drug and infusion engines (how many billing units a dose is, when JW/JZ applies, and which infusion is the initial code), the patient-responsibility engines (what the patient actually owes: Medicare cost-share, coordination of benefits, the contractual write-off, and the No Surprises Act cap), the claim-integrity validators (a bad NPI/MBI/ICD-10 code or an out-of-balance 835 caught before the clearinghouse rejects it), the facility pricers (IPPS DRG and OPPS APC), the time-based E/M selector, the NDC 10/11 converter, and the HIPAA breach-notification clock.',
    tiles: [
      'rvu-payment', 'mppr', 'bilateral-pay', 'multi-surgeon-pay', 'sequestration-adjust',
      'ncci-ptp', 'mue-check', 'modifier-x-selector', 'global-period', 'modifier-order',
      'em-mdm-2023', 'critical-care-time', 'split-shared', 'prolonged-services', 'therapy-units', 'anesthesia-units',
      'ndc-hcpcs-units', 'drug-wastage', 'infusion-hierarchy',
      'medicare-cost-share', 'cob-calc', 'allowed-amount', 'nsa-cost-share',
      'npi-validate', 'mbi-validate', 'icd10-validate', 'era-balance', 'drg-payment', 'apc-payment',
      'em-time', 'ndc-convert', 'breach-clock',
    ],
  },
  'patient-literacy': {
    slug: 'patient-literacy',
    label: 'Patient and insurance literacy',
    h1: 'Patient and insurance literacy tools',
    title: 'Patient & Insurance Literacy - Appeal, HIPAA · Sophie Well',
    description: 'Sophie\'s patient-literacy generators: appeal-letter builder, HIPAA Right of Access request, plain-language lab result interpreter, medication wallet card.',
    lede: 'Generators that assemble a tailored document from your inputs: the appeal letter, the HIPAA Right of Access request, the plain-language lab result interpreter, and the patient medication wallet card.',
    tiles: [
      'appeal-letter', 'hipaa-roa', 'lab-interpret', 'wallet-card',
    ],
  },
};
