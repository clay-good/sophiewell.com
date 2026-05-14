// spec-v6 §3.3: Lab result interpreter. Pure functions over a bundled
// analyte table that pairs reference ranges with calm, plain-language
// narratives. No external data calls, no live lookups; ranges and
// narratives are hand-maintained.
//
// Source posture:
//   - Reference ranges align with NIH/MedlinePlus, ARUP, and standard
//     internal-medicine references (Harrison's, UpToDate adult labs).
//     These are textbook-stable; small variations between local labs are
//     expected, so every result restates the range used.
//   - Narratives are written to the spec-v6 §3.3 constraint: "would a
//     competent primary care physician be comfortable handing this to a
//     patient at 11pm." No diagnosis, no probability, no disease links.
//
// Flag bands (spec-v6 §3.3):
//   - within-range:        refLow <= v <= refHigh
//   - borderline:          just outside (within a 5% buffer of the bound)
//   - flagged-mild:        clearly outside, not at critical thresholds
//   - flagged-significant: at or beyond a published critical threshold

// Each analyte:
//   id, label, units, refLow, refHigh,
//   criticalLow?, criticalHigh?, source,
//   variants?: sex/pregnancy keys that override ref bounds
//
// All ranges are in the conventional US units stated. SI conversions
// belong to the universal unit converter; this tool intentionally accepts
// only the conventional unit to keep the determinism contract simple.

export const LAB_ANALYTES = {
  // ----- CMP --------------------------------------------------------------
  sodium: {
    label: 'Sodium (Na)', units: 'mEq/L',
    refLow: 135, refHigh: 145,
    criticalLow: 120, criticalHigh: 160,
    source: 'MedlinePlus / Harrison\'s Principles of Internal Medicine, 21e.',
  },
  potassium: {
    label: 'Potassium (K)', units: 'mEq/L',
    refLow: 3.5, refHigh: 5.0,
    criticalLow: 2.5, criticalHigh: 6.5,
    source: 'MedlinePlus / Harrison\'s 21e.',
  },
  chloride: {
    label: 'Chloride (Cl)', units: 'mEq/L',
    refLow: 98, refHigh: 107,
    source: 'MedlinePlus.',
  },
  bicarbonate: {
    label: 'Bicarbonate / CO2', units: 'mEq/L',
    refLow: 22, refHigh: 29,
    criticalLow: 10, criticalHigh: 40,
    source: 'MedlinePlus.',
  },
  bun: {
    label: 'Blood Urea Nitrogen (BUN)', units: 'mg/dL',
    refLow: 7, refHigh: 20,
    source: 'MedlinePlus.',
  },
  creatinine: {
    label: 'Creatinine', units: 'mg/dL',
    refLow: 0.6, refHigh: 1.3,
    variants: {
      'female': { refLow: 0.5, refHigh: 1.1 },
      'male':   { refLow: 0.7, refHigh: 1.3 },
    },
    source: 'NKF / Inker NEJM 2021; MedlinePlus.',
  },
  glucose: {
    label: 'Glucose (fasting)', units: 'mg/dL',
    refLow: 70, refHigh: 99,
    criticalLow: 50, criticalHigh: 400,
    source: 'ADA 2024 Standards of Care.',
  },
  calcium: {
    label: 'Calcium (total)', units: 'mg/dL',
    refLow: 8.6, refHigh: 10.3,
    criticalLow: 7.0, criticalHigh: 12.0,
    source: 'MedlinePlus / ARUP.',
  },
  protein: {
    label: 'Total Protein', units: 'g/dL',
    refLow: 6.0, refHigh: 8.3,
    source: 'MedlinePlus.',
  },
  albumin: {
    label: 'Albumin', units: 'g/dL',
    refLow: 3.5, refHigh: 5.0,
    source: 'MedlinePlus.',
  },
  ast: {
    label: 'AST (SGOT)', units: 'U/L',
    refLow: 10, refHigh: 40,
    source: 'MedlinePlus / ARUP.',
  },
  alt: {
    label: 'ALT (SGPT)', units: 'U/L',
    refLow: 7, refHigh: 56,
    source: 'MedlinePlus / ARUP.',
  },
  alp: {
    label: 'Alkaline Phosphatase', units: 'U/L',
    refLow: 44, refHigh: 147,
    source: 'MedlinePlus.',
  },
  bilirubin: {
    label: 'Total Bilirubin', units: 'mg/dL',
    refLow: 0.1, refHigh: 1.2,
    source: 'MedlinePlus.',
  },

  // ----- CBC --------------------------------------------------------------
  wbc: {
    label: 'White Blood Cell count (WBC)', units: 'x10^3/uL',
    refLow: 4.5, refHigh: 11.0,
    criticalLow: 2.0, criticalHigh: 30.0,
    source: 'MedlinePlus / ARUP.',
  },
  hemoglobin: {
    label: 'Hemoglobin (Hgb)', units: 'g/dL',
    refLow: 12.0, refHigh: 17.5,
    variants: {
      'male':      { refLow: 13.5, refHigh: 17.5 },
      'female':    { refLow: 12.0, refHigh: 15.5 },
      'pregnant':  { refLow: 11.0, refHigh: 14.0 },
    },
    criticalLow: 7.0, criticalHigh: 20.0,
    source: 'MedlinePlus / WHO anemia thresholds.',
  },
  hematocrit: {
    label: 'Hematocrit (Hct)', units: '%',
    refLow: 36, refHigh: 50,
    variants: {
      'male':   { refLow: 41, refHigh: 50 },
      'female': { refLow: 36, refHigh: 44 },
    },
    source: 'MedlinePlus.',
  },
  platelets: {
    label: 'Platelets (Plt)', units: 'x10^3/uL',
    refLow: 150, refHigh: 400,
    criticalLow: 50, criticalHigh: 1000,
    source: 'MedlinePlus / ARUP.',
  },
  mcv: {
    label: 'Mean Corpuscular Volume (MCV)', units: 'fL',
    refLow: 80, refHigh: 100,
    source: 'MedlinePlus.',
  },

  // ----- Lipid panel ------------------------------------------------------
  totalChol: {
    label: 'Total Cholesterol', units: 'mg/dL',
    refLow: 0, refHigh: 199,
    source: 'NHLBI ATP III / 2018 ACC/AHA Cholesterol Guideline.',
  },
  ldl: {
    label: 'LDL Cholesterol', units: 'mg/dL',
    refLow: 0, refHigh: 99,
    source: '2018 ACC/AHA Cholesterol Guideline.',
  },
  hdl: {
    label: 'HDL Cholesterol', units: 'mg/dL',
    refLow: 40, refHigh: 200,
    variants: {
      'female': { refLow: 50, refHigh: 200 },
      'male':   { refLow: 40, refHigh: 200 },
    },
    source: 'NHLBI ATP III.',
  },
  triglycerides: {
    label: 'Triglycerides', units: 'mg/dL',
    refLow: 0, refHigh: 149,
    source: 'NHLBI ATP III.',
  },

  // ----- Other ------------------------------------------------------------
  a1c: {
    label: 'Hemoglobin A1C', units: '%',
    refLow: 4.0, refHigh: 5.6,
    source: 'ADA 2024 Standards of Care, Section 2.',
  },
  tsh: {
    label: 'TSH', units: 'mIU/L',
    refLow: 0.4, refHigh: 4.0,
    source: 'ATA 2014 / Harrison\'s 21e.',
  },
};

// Narrative bank: per-analyte, per-direction, per-severity (band).
// Direction: 'low' | 'high'. Band: 'borderline' | 'mild' | 'significant'.
// Each narrative is one sentence, calm, no probability, no diagnosis.
// Followed by one "ask your clinician" prompt.
//
// "WITHIN" narratives confirm normal in one calm line.
const N = {
  // CMP
  sodium: {
    within: 'Sodium level is within the typical reference range.',
    low:  {
      borderline:  'Sodium is just below the reference range.',
      mild:        'Sodium is low (hyponatremia). Common reasons include certain medications, heart or kidney conditions, and recent vomiting or diarrhea.',
      significant: 'Sodium is significantly low. This is the kind of result a clinician will want to act on promptly.',
    },
    high: {
      borderline:  'Sodium is just above the reference range.',
      mild:        'Sodium is high (hypernatremia), most often related to fluid balance.',
      significant: 'Sodium is significantly high. This is the kind of result a clinician will want to act on promptly.',
    },
    ask: {
      low:  'Ask: "Is this related to a medication I am taking, or to recent fluid losses?"',
      high: 'Ask: "Could this be related to dehydration or to a medication I am taking?"',
    },
  },
  potassium: {
    within: 'Potassium level is within the typical reference range.',
    low:  {
      borderline:  'Potassium is just below the reference range.',
      mild:        'Potassium is low (hypokalemia). Diuretics, vomiting, and diarrhea are common contributors.',
      significant: 'Potassium is significantly low; this can affect the heart rhythm and a clinician will want to act on it promptly.',
    },
    high: {
      borderline:  'Potassium is just above the reference range.',
      mild:        'Potassium is elevated (hyperkalemia). Kidney function and certain medications are common contributors.',
      significant: 'Potassium is significantly high; this can affect the heart rhythm and a clinician will want to act on it promptly.',
    },
    ask: {
      low:  'Ask: "Should we recheck this, and is a potassium supplement appropriate?"',
      high: 'Ask: "Is this related to one of my medications, and do we need to recheck or do an ECG?"',
    },
  },
  chloride: {
    within: 'Chloride is within the typical reference range.',
    low:  { borderline: 'Chloride is just below the reference range.', mild: 'Chloride is low; this often tracks with sodium and acid-base status.', significant: 'Chloride is markedly low; clinician review recommended.' },
    high: { borderline: 'Chloride is just above the reference range.', mild: 'Chloride is high; this often tracks with sodium and acid-base status.', significant: 'Chloride is markedly high; clinician review recommended.' },
    ask:  { low: 'Ask: "Does this fit with the sodium and bicarbonate, or does it suggest something else?"', high: 'Ask: "Does this fit with the sodium and bicarbonate, or does it suggest something else?"' },
  },
  bicarbonate: {
    within: 'Bicarbonate is within the typical reference range.',
    low:  { borderline: 'Bicarbonate is just below the reference range.', mild: 'Bicarbonate is low, which can reflect acid buildup or hyperventilation compensation.', significant: 'Bicarbonate is significantly low; clinician review recommended.' },
    high: { borderline: 'Bicarbonate is just above the reference range.', mild: 'Bicarbonate is high, which can reflect vomiting, diuretic use, or compensation for a breathing pattern.', significant: 'Bicarbonate is significantly high; clinician review recommended.' },
    ask:  { low: 'Ask: "Should we look at an arterial blood gas or check kidney function?"', high: 'Ask: "Could this be related to vomiting or a diuretic I am taking?"' },
  },
  bun: {
    within: 'BUN is within the typical reference range.',
    low:  { borderline: 'BUN is just below the reference range.', mild: 'BUN is low, which can be seen with low protein intake or extra fluid on board.', significant: 'BUN is markedly low; usually not urgent but worth discussing.' },
    high: { borderline: 'BUN is just above the reference range.', mild: 'BUN is elevated. Dehydration, high protein intake, and reduced kidney function are common contributors.', significant: 'BUN is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Is this anything to act on, or just a snapshot of hydration today?"', high: 'Ask: "Is this related to hydration, or is my kidney function the question?"' },
  },
  creatinine: {
    within: 'Creatinine is within the typical reference range.',
    low:  { borderline: 'Creatinine is just below the reference range.', mild: 'Creatinine is low; often related to low muscle mass and usually not urgent.', significant: 'Creatinine is markedly low; usually not urgent but worth discussing.' },
    high: { borderline: 'Creatinine is just above the reference range.', mild: 'Creatinine is elevated, which is one of the main signals of how the kidneys are filtering.', significant: 'Creatinine is significantly elevated; clinician review of kidney function recommended.' },
    ask:  { low: 'Ask: "Should I have an eGFR calculated alongside this?"', high: 'Ask: "What is my eGFR, and has this changed compared to my prior results?"' },
  },
  glucose: {
    within: 'Fasting glucose is within the typical reference range.',
    low:  { borderline: 'Glucose is just below the reference range.', mild: 'Glucose is low (hypoglycemia). Symptoms include shakiness, sweating, and confusion.', significant: 'Glucose is significantly low; clinician review recommended.' },
    high: { borderline: 'Glucose is just above the reference range (impaired fasting glucose territory).', mild: 'Glucose is elevated. A single elevated reading is not a diagnosis; the pattern over time is what matters.', significant: 'Glucose is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Was I truly fasting, and should we recheck this?"', high: 'Ask: "Should we recheck this, look at A1C, or screen for diabetes?"' },
  },
  calcium: {
    within: 'Calcium is within the typical reference range.',
    low:  { borderline: 'Calcium is just below the reference range.', mild: 'Calcium is low; albumin level can affect this reading, so a corrected calcium may be calculated.', significant: 'Calcium is significantly low; clinician review recommended.' },
    high: { borderline: 'Calcium is just above the reference range.', mild: 'Calcium is elevated. Parathyroid status and certain medications are common contributors.', significant: 'Calcium is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "What is the albumin-corrected calcium?"', high: 'Ask: "Should we check parathyroid hormone or vitamin D?"' },
  },
  protein: {
    within: 'Total protein is within the typical reference range.',
    low:  { borderline: 'Total protein is just below the reference range.', mild: 'Total protein is low; often related to liver, kidney, or nutrition factors.', significant: 'Total protein is markedly low; clinician review recommended.' },
    high: { borderline: 'Total protein is just above the reference range.', mild: 'Total protein is elevated; can be seen with dehydration or with abnormal immune proteins.', significant: 'Total protein is markedly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Is this related to my albumin, my kidneys, or nutrition?"', high: 'Ask: "Should we check what fraction of this is immunoglobulins?"' },
  },
  albumin: {
    within: 'Albumin is within the typical reference range.',
    low:  { borderline: 'Albumin is just below the reference range.', mild: 'Albumin is low; common contributors include illness, liver or kidney issues, and protein loss.', significant: 'Albumin is markedly low; clinician review recommended.' },
    high: { borderline: 'Albumin is just above the reference range.', mild: 'Albumin is mildly elevated; most often a dehydration artifact.', significant: 'Albumin is markedly elevated; usually a hydration artifact, but worth discussing.' },
    ask:  { low: 'Ask: "Is this related to my nutrition, liver, or kidneys, and what should we recheck?"', high: 'Ask: "Could I have been dehydrated when this was drawn?"' },
  },
  ast: {
    within: 'AST is within the typical reference range.',
    low:  { borderline: 'AST is just below the reference range.', mild: 'AST is low; usually not clinically important.', significant: 'AST is markedly low; usually not clinically important.' },
    high: { borderline: 'AST is just above the reference range.', mild: 'AST is elevated, which is a non-specific signal that can reflect liver or muscle.', significant: 'AST is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Is this a result we need to act on?"', high: 'Ask: "Should we recheck this and look at ALT, alk phos, and bilirubin together?"' },
  },
  alt: {
    within: 'ALT is within the typical reference range.',
    low:  { borderline: 'ALT is just below the reference range.', mild: 'ALT is low; usually not clinically important.', significant: 'ALT is markedly low; usually not clinically important.' },
    high: { borderline: 'ALT is just above the reference range.', mild: 'ALT is elevated. This is a relatively specific liver signal; medications, alcohol, and fatty liver are common contributors.', significant: 'ALT is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Is this a result we need to act on?"', high: 'Ask: "Should we recheck this, and is any of my medication list relevant?"' },
  },
  alp: {
    within: 'Alkaline phosphatase is within the typical reference range.',
    low:  { borderline: 'Alkaline phosphatase is just below the reference range.', mild: 'Alk phos is low; usually not urgent.', significant: 'Alk phos is markedly low; clinician review recommended.' },
    high: { borderline: 'Alk phos is just above the reference range.', mild: 'Alk phos is elevated; can reflect liver bile-duct or bone activity.', significant: 'Alk phos is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Should we look at this with the other liver labs?"', high: 'Ask: "Is the source of this from the liver or from bone?"' },
  },
  bilirubin: {
    within: 'Total bilirubin is within the typical reference range.',
    low:  { borderline: 'Bilirubin is just below the reference range.', mild: 'Bilirubin is low; not clinically important.', significant: 'Bilirubin is markedly low; not clinically important.' },
    high: { borderline: 'Bilirubin is just above the reference range; Gilbert syndrome is a common harmless cause.', mild: 'Bilirubin is elevated; clinicians look at the direct (conjugated) fraction to interpret.', significant: 'Bilirubin is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Is this anything to act on?"', high: 'Ask: "What is the direct (conjugated) bilirubin, and how do the other liver labs look?"' },
  },

  // CBC
  wbc: {
    within: 'WBC count is within the typical reference range.',
    low:  { borderline: 'WBC is just below the reference range.', mild: 'WBC is low (leukopenia). Recent viral illness and certain medications are common contributors.', significant: 'WBC is significantly low; clinician review recommended.' },
    high: { borderline: 'WBC is just above the reference range.', mild: 'WBC is elevated (leukocytosis), most commonly with infection, inflammation, or stress.', significant: 'WBC is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Should we recheck this, and look at the differential?"', high: 'Ask: "What does the differential show, and is there an infection to look for?"' },
  },
  hemoglobin: {
    within: 'Hemoglobin is within the typical reference range.',
    low:  { borderline: 'Hemoglobin is just below the reference range.', mild: 'Hemoglobin is low (anemia). Iron, B12 / folate, kidney function, and bleeding history are common evaluation steps.', significant: 'Hemoglobin is significantly low; clinician review recommended.' },
    high: { borderline: 'Hemoglobin is just above the reference range.', mild: 'Hemoglobin is elevated; often hydration or smoking-related, sometimes a marrow condition.', significant: 'Hemoglobin is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "What is my iron and ferritin, and what is the MCV telling us?"', high: 'Ask: "Could this be related to smoking or dehydration, and do we need any further workup?"' },
  },
  hematocrit: {
    within: 'Hematocrit is within the typical reference range.',
    low:  { borderline: 'Hematocrit is just below the reference range.', mild: 'Hematocrit is low, which typically tracks with hemoglobin.', significant: 'Hematocrit is significantly low; clinician review recommended.' },
    high: { borderline: 'Hematocrit is just above the reference range.', mild: 'Hematocrit is elevated, which typically tracks with hemoglobin.', significant: 'Hematocrit is significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Should I look at this with the hemoglobin and MCV together?"', high: 'Ask: "Should I look at this with the hemoglobin together, and is hydration the question?"' },
  },
  platelets: {
    within: 'Platelets are within the typical reference range.',
    low:  { borderline: 'Platelets are just below the reference range.', mild: 'Platelets are low (thrombocytopenia). Medications, viral illness, and immune causes are common contributors.', significant: 'Platelets are significantly low; clinician review recommended.' },
    high: { borderline: 'Platelets are just above the reference range.', mild: 'Platelets are elevated (thrombocytosis), often reactive to inflammation or iron deficiency.', significant: 'Platelets are significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Should we recheck this, and is any medication on my list relevant?"', high: 'Ask: "Is this reactive, and should we look at ferritin?"' },
  },
  mcv: {
    within: 'MCV is within the typical reference range (normocytic).',
    low:  { borderline: 'MCV is just below the reference range.', mild: 'MCV is low (microcytic). Iron deficiency and thalassemia trait are the most common causes.', significant: 'MCV is markedly low; clinician review of the cause is recommended.' },
    high: { borderline: 'MCV is just above the reference range.', mild: 'MCV is high (macrocytic). B12 / folate, thyroid, alcohol, and certain medications are common contributors.', significant: 'MCV is markedly high; clinician review of the cause is recommended.' },
    ask:  { low: 'Ask: "What is my iron and ferritin status?"', high: 'Ask: "Should we check B12, folate, and TSH?"' },
  },

  // Lipid
  totalChol: {
    within: 'Total cholesterol is within the desirable range.',
    low:  { borderline: 'Total cholesterol is low; this is generally not a cause for concern.', mild: 'Total cholesterol is low; this is generally not a cause for concern.', significant: 'Total cholesterol is very low; clinician review recommended.' },
    high: { borderline: 'Total cholesterol is borderline-high.', mild: 'Total cholesterol is elevated. The LDL fraction is what most cardiovascular-risk decisions are based on.', significant: 'Total cholesterol is significantly elevated; clinician review of cardiovascular risk recommended.' },
    ask:  { low: 'Ask: "Is this a result we need to act on?"', high: 'Ask: "What does my 10-year cardiovascular risk look like, and is medication appropriate?"' },
  },
  ldl: {
    within: 'LDL cholesterol is in the optimal range.',
    low:  { borderline: 'LDL is low; generally favorable.', mild: 'LDL is low; generally favorable.', significant: 'LDL is markedly low; clinician review recommended.' },
    high: { borderline: 'LDL is near-optimal / above optimal (100-129 mg/dL).', mild: 'LDL is borderline-high to high; cardiovascular-risk context drives the decision about treatment.', significant: 'LDL is very high; clinician review of cardiovascular risk and possible treatment recommended.' },
    ask:  { low: 'Ask: "Is this expected on my current medication?"', high: 'Ask: "What is my ASCVD 10-year risk, and is statin therapy appropriate?"' },
  },
  hdl: {
    within: 'HDL cholesterol is in the typical range.',
    low:  { borderline: 'HDL is borderline-low.', mild: 'HDL is low; physical activity is one of the few interventions that consistently raises it.', significant: 'HDL is very low; clinician review recommended.' },
    high: { borderline: 'HDL is at the upper end of typical.', mild: 'HDL is high; this is generally favorable.', significant: 'HDL is very high; usually favorable.' },
    ask:  { low: 'Ask: "What can I change about activity or diet that meaningfully helps this?"', high: 'Ask: "Is this anything to act on?"' },
  },
  triglycerides: {
    within: 'Triglycerides are in the typical (fasting) range.',
    low:  { borderline: 'Triglycerides are low; generally favorable.', mild: 'Triglycerides are low; generally favorable.', significant: 'Triglycerides are markedly low; clinician review recommended.' },
    high: { borderline: 'Triglycerides are borderline-high.', mild: 'Triglycerides are elevated. Was this truly a fasting sample?', significant: 'Triglycerides are significantly elevated; clinician review recommended.' },
    ask:  { low: 'Ask: "Is this anything to act on?"', high: 'Ask: "Was this fasting, and should we look at LDL and the broader cardiovascular picture?"' },
  },

  // Other
  a1c: {
    within: 'A1C is in the non-diabetic range.',
    low:  { borderline: 'A1C is just below the reference range; usually not clinically important.', mild: 'A1C is low.', significant: 'A1C is markedly low; clinician review recommended.' },
    high: { borderline: 'A1C is in the prediabetes range (5.7-6.4%).', mild: 'A1C is in the diabetes range (6.5% or higher). A single elevated A1C does not establish a diagnosis on its own.', significant: 'A1C is significantly elevated; clinician review of diabetes management recommended.' },
    ask:  { low: 'Ask: "Is this anything to act on?"', high: 'Ask: "What is my diagnosis category, and what is the target A1C for me?"' },
  },
  tsh: {
    within: 'TSH is within the typical reference range.',
    low:  { borderline: 'TSH is just below the reference range.', mild: 'TSH is low. Hyperthyroidism, certain medications, and recovery from illness are common contributors.', significant: 'TSH is markedly low; clinician review of thyroid function recommended.' },
    high: { borderline: 'TSH is just above the reference range.', mild: 'TSH is elevated. Hypothyroidism is the most common reason.', significant: 'TSH is markedly elevated; clinician review of thyroid function recommended.' },
    ask:  { low: 'Ask: "Should we check free T4 and T3, and review my medications?"', high: 'Ask: "Should we check free T4, and is thyroid hormone replacement appropriate?"' },
  },
};

// Pick the right reference bounds, applying sex / pregnancy variants.
function pickBounds(analyte, opts) {
  if (!analyte.variants) return { refLow: analyte.refLow, refHigh: analyte.refHigh };
  const sex = (opts && opts.sex) || null;
  const pregnant = !!(opts && opts.pregnant);
  if (pregnant && analyte.variants.pregnant) return analyte.variants.pregnant;
  if (sex && analyte.variants[sex]) return analyte.variants[sex];
  return { refLow: analyte.refLow, refHigh: analyte.refHigh };
}

// Compute the flag band per spec-v6 §3.3.
//   - within-range:        refLow <= v <= refHigh
//   - borderline:          |v - bound| <= 5% of the reference span (or 0.05)
//   - flagged-mild:        outside that buffer but not at critical thresholds
//   - flagged-significant: at or beyond a published critical threshold
function classify(value, bounds, criticalLow, criticalHigh) {
  const { refLow, refHigh } = bounds;
  if (value >= refLow && value <= refHigh) {
    return { flag: 'within-range', direction: null };
  }
  const span = Math.max(refHigh - refLow, 0.05);
  const buffer = Math.max(span * 0.05, 0.05);
  const direction = value < refLow ? 'low' : 'high';
  if (direction === 'low' && criticalLow != null && value <= criticalLow) {
    return { flag: 'flagged-significant', direction: 'low' };
  }
  if (direction === 'high' && criticalHigh != null && value >= criticalHigh) {
    return { flag: 'flagged-significant', direction: 'high' };
  }
  if (direction === 'low' && value >= refLow - buffer) {
    return { flag: 'borderline', direction: 'low' };
  }
  if (direction === 'high' && value <= refHigh + buffer) {
    return { flag: 'borderline', direction: 'high' };
  }
  return { flag: 'flagged-mild', direction };
}

// Public: interpret a single lab value.
//   analyteId: a key of LAB_ANALYTES
//   value: numeric value in the analyte's conventional units
//   opts: { sex: 'male'|'female', pregnant: bool }
// Returns: { analyte, value, units, refLow, refHigh, flag, direction,
//            narrative, ask, source }
export function interpretLab(analyteId, value, opts = {}) {
  const analyte = LAB_ANALYTES[analyteId];
  if (!analyte) throw new Error(`Unknown analyte: ${analyteId}`);
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError('value must be a finite number');
  }

  const bounds = pickBounds(analyte, opts);
  const cls = classify(value, bounds, analyte.criticalLow, analyte.criticalHigh);

  const narrativeBlock = N[analyteId];
  let narrative = '';
  let ask = '';
  if (narrativeBlock) {
    if (cls.flag === 'within-range') {
      narrative = narrativeBlock.within;
    } else {
      const severityKey = cls.flag === 'borderline' ? 'borderline'
                         : cls.flag === 'flagged-mild' ? 'mild'
                         : 'significant';
      narrative = (narrativeBlock[cls.direction] && narrativeBlock[cls.direction][severityKey]) || '';
      ask = (narrativeBlock.ask && narrativeBlock.ask[cls.direction]) || '';
    }
  }

  return {
    analyte: analyte.label,
    value,
    units: analyte.units,
    refLow: bounds.refLow,
    refHigh: bounds.refHigh,
    flag: cls.flag,
    direction: cls.direction,
    narrative,
    ask,
    source: analyte.source,
  };
}

// Convenience: interpret a batch of entries. Each entry: { analyteId, value }.
// Shared opts (sex, pregnant) apply to all entries.
export function interpretLabs(entries, opts = {}) {
  if (!Array.isArray(entries)) throw new TypeError('entries must be an array');
  return entries.map((e) => interpretLab(e.analyteId, e.value, opts));
}

// Grouping shown in the renderer. Pure data; no DOM.
export const LAB_GROUPS = [
  { id: 'cbc',   label: 'CBC',            ids: ['wbc', 'hemoglobin', 'hematocrit', 'platelets', 'mcv'] },
  { id: 'cmp',   label: 'CMP',            ids: ['sodium', 'potassium', 'chloride', 'bicarbonate', 'bun', 'creatinine', 'glucose', 'calcium', 'protein', 'albumin', 'ast', 'alt', 'alp', 'bilirubin'] },
  { id: 'lipid', label: 'Lipid panel',    ids: ['totalChol', 'ldl', 'hdl', 'triglycerides'] },
  { id: 'misc',  label: 'A1C / Thyroid',  ids: ['a1c', 'tsh'] },
];
