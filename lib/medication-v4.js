// spec-v4 §5: Group F medication / infusion extensions (utilities 129-135).
// Pure formulas; renderers in views/group-f.js wire these to the form.

// --- 129: Opioid MME ----------------------------------------------------
// rows: [{ drug, mgPerDose, dosesPerDay }]
// factors: [{ drug, mmeFactor, note? }]
export function mmeTotal({ rows, factors }) {
  if (!Array.isArray(rows)) throw new TypeError('rows must be an array');
  const factorMap = new Map(factors.map((f) => [String(f.drug).toLowerCase(), f]));
  let total = 0;
  const breakdown = [];
  for (const r of rows) {
    const f = factorMap.get(String(r.drug || '').toLowerCase());
    if (!f) {
      breakdown.push({ ...r, mme: null, note: 'unknown drug' });
      continue;
    }
    const mg = Number(r.mgPerDose) * Number(r.dosesPerDay);
    const mme = mg * f.mmeFactor;
    total += mme;
    breakdown.push({ ...r, mme, factor: f.mmeFactor, note: f.note || null });
  }
  return { totalMme: total, breakdown };
}

// --- 130: Steroid equivalence -------------------------------------------
// table: [{ drug, equivDoseMg, mineralocorticoid }]. equivDoseMg is the dose
// equivalent to 20 mg hydrocortisone (i.e., the table's pivot dose).
export function steroidEquivalent({ drug, doseMg, target, table }) {
  const fromRow = table.find((r) => r.drug.toLowerCase() === String(drug).toLowerCase());
  const toRow = table.find((r) => r.drug.toLowerCase() === String(target).toLowerCase());
  if (!fromRow || !toRow) return null;
  if (typeof fromRow.equivDoseMg !== 'number' || typeof toRow.equivDoseMg !== 'number') return null;
  // mg of target = doseMg * (toRow.equivDose / fromRow.equivDose)
  return doseMg * (toRow.equivDoseMg / fromRow.equivDoseMg);
}

// --- 131: Benzodiazepine equivalence (Ashton) ---------------------------
// table: [{ drug, equivDoseMg }]. equivDoseMg is the dose equivalent to a
// pivot (e.g., 10 mg diazepam in the Ashton table).
export function benzoEquivalent({ drug, doseMg, target, table }) {
  const fromRow = table.find((r) => r.drug.toLowerCase() === String(drug).toLowerCase());
  const toRow = table.find((r) => r.drug.toLowerCase() === String(target).toLowerCase());
  if (!fromRow || !toRow) return null;
  return doseMg * (toRow.equivDoseMg / fromRow.equivDoseMg);
}

// --- 132: Antibiotic renal dose adjustment ------------------------------
// table row: { drug, crClBands: [{ crClFrom, crClTo, dose, interval }] }.
// crClTo === null means "no upper bound".
export function abxRenalDose({ drug, crCl, table }) {
  const row = table.find((r) => r.drug.toLowerCase() === String(drug).toLowerCase());
  if (!row) return null;
  for (const band of row.crClBands) {
    const lo = band.crClFrom;
    const hi = band.crClTo == null ? Infinity : band.crClTo;
    if (crCl >= lo && crCl < hi) return band;
  }
  return null;
}

// --- 133: Vasopressor dose <-> rate -------------------------------------
// All concentrations and doses computed in mcg/min and mL/hr.
// units: 'mcg/kg/min' or 'mcg/min' (weight-based vs not)
export function vasopressorRateMlHr({ dose, units, weightKg, concUgPerMl }) {
  if (!(concUgPerMl > 0)) throw new RangeError('concentration must be positive');
  let ugPerMin;
  if (units === 'mcg/kg/min') {
    if (!(weightKg > 0)) throw new RangeError('weightKg required for mcg/kg/min');
    ugPerMin = dose * weightKg;
  } else if (units === 'mcg/min') {
    ugPerMin = dose;
  } else {
    throw new RangeError(`unknown units ${units}`);
  }
  // mL/hr = (ug/min / ug/mL) * 60
  return (ugPerMin / concUgPerMl) * 60;
}

export function vasopressorDose({ rateMlHr, units, weightKg, concUgPerMl }) {
  if (!(concUgPerMl > 0)) throw new RangeError('concentration must be positive');
  const ugPerMin = (rateMlHr * concUgPerMl) / 60;
  if (units === 'mcg/kg/min') {
    if (!(weightKg > 0)) throw new RangeError('weightKg required for mcg/kg/min');
    return ugPerMin / weightKg;
  }
  if (units === 'mcg/min') return ugPerMin;
  throw new RangeError(`unknown units ${units}`);
}

// --- 134: TPN macronutrient ---------------------------------------------
// dextrose: 3.4 kcal/g; amino acid: 4 kcal/g; lipid (20% emulsion): 2 kcal/mL.
// Inputs are FINAL bag concentrations (g per 100 mL for AA / dextrose; lipid
// supplied separately as a percent of final volume that is 20% lipid emulsion).
export function tpnMacro({ volumeMl, dextrosePct, aminoAcidPct, lipidPctOfVolume = 0,
  kcalPerG = { dextrose: 3.4, aa: 4 }, lipidKcalPerMl = 2 }) {
  if (!(volumeMl > 0)) throw new RangeError('volumeMl must be positive');
  const dextroseG = (dextrosePct / 100) * volumeMl;
  const aaG = (aminoAcidPct / 100) * volumeMl;
  const lipidMl = (lipidPctOfVolume / 100) * volumeMl;
  const kcalDextrose = dextroseG * kcalPerG.dextrose;
  const kcalAA = aaG * kcalPerG.aa;
  const kcalLipid = lipidMl * lipidKcalPerMl;
  return {
    volumeMl,
    dextroseG, proteinG: aaG, lipidG: lipidMl * 0.2, // 20% lipid = 0.2 g/mL
    kcalDextrose, kcalProtein: kcalAA, kcalLipid,
    totalKcal: kcalDextrose + kcalAA + kcalLipid,
  };
}

// ivToPo() removed in spec-v29 wave 29-2 (Group K/O): the iv-to-po tile
// was a static equivalence table per the sec 7.2 audit decision.

// --- spec-v31 §2.1: Beers deprescribing checker ------------------------
// 2023 American Geriatrics Society Beers Criteria(R) Update Expert Panel.
// J Am Geriatr Soc 2023;71(7):2052-2081. Closed vocabulary of 14 PIM
// medication categories (Table 2), 8 drug-disease comorbidities (Table 3),
// and the highest-severity drug-drug rows from Table 6 (opioid + benzo,
// opioid + gabapentinoid, opioid + Z-drug).
export const BEERS_PIM = {
  'first-gen-antihistamine': {
    label: 'First-generation antihistamine (diphenhydramine, hydroxyzine, promethazine, chlorpheniramine)',
    rationale: 'Strong anticholinergic burden; clearance reduced with age; risk of confusion, dry mouth, constipation, urinary retention.',
    recommendation: 'Avoid (AGS 2023 Table 2, strong recommendation).',
  },
  tca: {
    label: 'Tricyclic antidepressant (amitriptyline, doxepin >6 mg, imipramine, nortriptyline)',
    rationale: 'Strong anticholinergic and sedative effects; orthostatic hypotension; arrhythmogenic.',
    recommendation: 'Avoid (AGS 2023 Table 2, strong recommendation).',
  },
  'muscle-relaxant': {
    label: 'Skeletal-muscle relaxant (cyclobenzaprine, methocarbamol, carisoprodol)',
    rationale: 'Anticholinergic, sedative; poorly tolerated; questionable efficacy at tolerable doses.',
    recommendation: 'Avoid (AGS 2023 Table 2, strong recommendation).',
  },
  benzodiazepine: {
    label: 'Benzodiazepine (any)',
    rationale: 'Increased sensitivity in older adults; risk of cognitive impairment, delirium, falls, fractures, motor-vehicle crashes.',
    recommendation: 'Avoid for insomnia, agitation, or delirium (AGS 2023 Table 2, strong recommendation).',
  },
  'z-drug': {
    label: 'Z-drug hypnotic (zolpidem, zaleplon, eszopiclone)',
    rationale: 'Adverse CNS effects similar to benzodiazepines: delirium, falls, fractures; minimal sleep-improvement benefit.',
    recommendation: 'Avoid (AGS 2023 Table 2, strong recommendation).',
  },
  antipsychotic: {
    label: 'Antipsychotic (first- or second-generation)',
    rationale: 'Increased risk of stroke, cognitive decline, and mortality in older adults with dementia; metabolic effects.',
    recommendation: 'Avoid as first-line for behavioral problems of dementia or delirium unless non-pharmacologic options have failed (AGS 2023 Table 2, strong recommendation).',
  },
  'sulfonylurea-long': {
    label: 'Long-acting sulfonylurea (glyburide, chlorpropamide)',
    rationale: 'Prolonged hypoglycaemia in older adults; SIADH (chlorpropamide).',
    recommendation: 'Avoid (AGS 2023 Table 2, strong recommendation). Prefer shorter-acting agent.',
  },
  'ppi-long': {
    label: 'Proton-pump inhibitor (chronic, >8 weeks)',
    rationale: 'Risk of C. difficile, bone loss/fractures, pneumonia; magnesium depletion.',
    recommendation: 'Avoid scheduled use >8 weeks unless high-risk (chronic NSAID, GI-bleed history, erosive esophagitis) (AGS 2023 Table 2, strong recommendation).',
  },
  'nsaid-systemic': {
    label: 'Systemic NSAID, chronic (ibuprofen, naproxen, diclofenac, indomethacin, ketorolac)',
    rationale: 'GI bleed and peptic ulcer risk; renal injury; HTN; heart-failure exacerbation.',
    recommendation: 'Avoid chronic use unless other alternatives are not effective and gastroprotection is co-administered (AGS 2023 Table 2, strong). Ketorolac and indomethacin: avoid entirely.',
  },
  'alpha-1-blocker-htn': {
    label: 'Peripheral alpha-1 blocker for HTN (doxazosin, prazosin, terazosin)',
    rationale: 'High risk of orthostatic hypotension and associated harms; better alternatives exist.',
    recommendation: 'Avoid as antihypertensive (AGS 2023 Table 2, strong recommendation).',
  },
  'digoxin-high': {
    label: 'Digoxin > 0.125 mg/day or for atrial fibrillation',
    rationale: 'Reduced renal clearance with age; toxicity at higher doses; no proven AFib benefit over rate-control alternatives.',
    recommendation: 'Avoid as first-line in atrial fibrillation or heart failure; cap chronic dose at 0.125 mg/day (AGS 2023 Table 2, strong).',
  },
  'central-alpha-agonist': {
    label: 'Centrally-acting alpha-agonist (clonidine, methyldopa, reserpine)',
    rationale: 'CNS adverse effects; bradycardia; orthostatic hypotension.',
    recommendation: 'Avoid clonidine as first-line for HTN; avoid methyldopa and reserpine entirely (AGS 2023 Table 2, strong).',
  },
  opioid: {
    label: 'Opioid (any, chronic)',
    rationale: 'Falls, fractures, sedation, constipation; respiratory depression risk amplified by co-prescribed CNS depressants.',
    recommendation: 'Use with caution; minimize dose and duration; review at every visit (AGS 2023 Table 4 plus Table 6 drug-drug flags).',
  },
  gabapentinoid: {
    label: 'Gabapentinoid (gabapentin, pregabalin)',
    rationale: 'Sedation, falls; respiratory depression when co-prescribed with opioids or benzodiazepines.',
    recommendation: 'Use with caution; renal-dose adjust; avoid concurrent CNS depressants (AGS 2023 Table 4).',
  },
  'urinary-anticholinergic': {
    label: 'Anticholinergic antimuscarinic for urinary incontinence (oxybutynin, tolterodine, fesoterodine, solifenacin)',
    rationale: 'Anticholinergic burden; cognitive impairment, constipation, urinary retention.',
    recommendation: 'Avoid; if used, prefer mirabegron or non-pharmacologic management (AGS 2023 Table 2, strong).',
  },
};

export const BEERS_DISEASE = {
  'history-of-falls': 'History of falls or fractures',
  'history-of-syncope': 'History of syncope',
  'heart-failure': 'Heart failure',
  'gi-bleed-history': 'History of GI bleed or peptic-ulcer disease',
  parkinsonism: 'Parkinsonism',
  dementia: 'Dementia or cognitive impairment',
  ckd: 'Chronic kidney disease (CrCl < 30)',
  'delirium-history': 'Delirium or delirium history',
};

const BEERS_DISEASE_INTERACTIONS = [
  { drug: 'benzodiazepine',           disease: 'history-of-falls',   text: 'Benzodiazepine + falls/fractures: increased fall risk. Avoid (AGS 2023 Table 3, strong).' },
  { drug: 'benzodiazepine',           disease: 'dementia',           text: 'Benzodiazepine + dementia: worsens cognition; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'benzodiazepine',           disease: 'delirium-history',   text: 'Benzodiazepine + delirium history: high precipitant risk; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'z-drug',                   disease: 'history-of-falls',   text: 'Z-drug + falls/fractures: increased fall risk. Avoid (AGS 2023 Table 3, strong).' },
  { drug: 'z-drug',                   disease: 'dementia',           text: 'Z-drug + dementia: worsens cognition; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'antipsychotic',            disease: 'history-of-falls',   text: 'Antipsychotic + falls/fractures: increased fall and fracture risk. Avoid unless non-pharmacologic options have failed (AGS 2023 Table 3, strong).' },
  { drug: 'antipsychotic',            disease: 'dementia',           text: 'Antipsychotic + dementia: increased stroke and mortality risk; avoid as first-line (AGS 2023 Table 3, strong).' },
  { drug: 'antipsychotic',            disease: 'parkinsonism',       text: 'Antipsychotic + parkinsonism: worsens extrapyramidal symptoms; avoid except quetiapine, clozapine, pimavanserin (AGS 2023 Table 3, strong).' },
  { drug: 'opioid',                   disease: 'history-of-falls',   text: 'Opioid + falls/fractures: increased fall risk. Use with caution and minimize dose (AGS 2023 Table 3, strong).' },
  { drug: 'opioid',                   disease: 'delirium-history',   text: 'Opioid + delirium history: precipitant risk; minimize dose; avoid meperidine (AGS 2023 Table 3, strong).' },
  { drug: 'first-gen-antihistamine',  disease: 'dementia',           text: 'First-gen antihistamine + dementia: anticholinergic burden worsens cognition; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'first-gen-antihistamine',  disease: 'delirium-history',   text: 'First-gen antihistamine + delirium: high precipitant risk; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'tca',                      disease: 'dementia',           text: 'TCA + dementia: anticholinergic burden; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'tca',                      disease: 'history-of-syncope', text: 'TCA + syncope: orthostatic hypotension; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'muscle-relaxant',          disease: 'dementia',           text: 'Muscle relaxant + dementia: anticholinergic burden; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'urinary-anticholinergic',  disease: 'dementia',           text: 'Urinary anticholinergic + dementia: anticholinergic burden worsens cognition; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'alpha-1-blocker-htn',      disease: 'history-of-syncope', text: 'Peripheral alpha-1 blocker + syncope: orthostatic hypotension; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'central-alpha-agonist',    disease: 'history-of-syncope', text: 'Central alpha-agonist + syncope: orthostatic hypotension; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'nsaid-systemic',           disease: 'heart-failure',      text: 'NSAID + heart failure: fluid retention exacerbates HF; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'nsaid-systemic',           disease: 'gi-bleed-history',   text: 'NSAID + GI bleed history: increased bleed risk; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'nsaid-systemic',           disease: 'ckd',                text: 'NSAID + CKD (CrCl < 30): nephrotoxicity; avoid (AGS 2023 Table 3, strong).' },
  { drug: 'digoxin-high',             disease: 'heart-failure',      text: 'Digoxin > 0.125 mg/day + heart failure: no proven mortality benefit at higher doses; toxicity risk; cap at 0.125 mg/day (AGS 2023 Table 3, strong).' },
  { drug: 'digoxin-high',             disease: 'ckd',                text: 'Digoxin + CKD: reduced clearance; cap dose and monitor levels (AGS 2023 Table 3, strong).' },
  { drug: 'gabapentinoid',            disease: 'ckd',                text: 'Gabapentinoid + CKD: required renal dose adjustment (AGS 2023 Table 5; also Table 4 use-with-caution).' },
];

const BEERS_DRUG_DRUG = [
  { drugs: ['opioid', 'benzodiazepine'], text: 'Opioid + benzodiazepine: high respiratory-depression and overdose-death risk. Avoid concurrent use (AGS 2023 Table 6, strong).' },
  { drugs: ['opioid', 'gabapentinoid'],  text: 'Opioid + gabapentinoid: respiratory-depression and overdose-death risk. Avoid concurrent use unless transitioning off opioids (AGS 2023 Table 6, strong).' },
  { drugs: ['opioid', 'z-drug'],         text: 'Opioid + Z-drug hypnotic: additive CNS depression and fall risk. Avoid concurrent use (AGS 2023 Table 6, moderate).' },
];

export function beersCheck({ ageYears, medications = [], comorbidities = [] }) {
  const age = Number(ageYears);
  if (!Number.isFinite(age)) throw new Error('beers-check: ageYears must be a number');
  if (age < 18 || age > 120) throw new Error('beers-check: ageYears must be 18-120');
  if (!Array.isArray(medications)) throw new Error('beers-check: medications must be an array');
  if (!Array.isArray(comorbidities)) throw new Error('beers-check: comorbidities must be an array');
  const meds = [...new Set(medications)];
  const cmb = [...new Set(comorbidities)];
  for (const m of meds) {
    if (!Object.prototype.hasOwnProperty.call(BEERS_PIM, m)) throw new Error(`beers-check: unknown medication category '${m}'`);
  }
  for (const c of cmb) {
    if (!Object.prototype.hasOwnProperty.call(BEERS_DISEASE, c)) throw new Error(`beers-check: unknown comorbidity '${c}'`);
  }
  const pimFlags = meds.map((m) => ({ drug: m, label: BEERS_PIM[m].label, rationale: BEERS_PIM[m].rationale, recommendation: BEERS_PIM[m].recommendation }));
  const diseaseFlags = BEERS_DISEASE_INTERACTIONS
    .filter((row) => meds.includes(row.drug) && cmb.includes(row.disease))
    .map((row) => ({ drug: row.drug, disease: row.disease, text: row.text }));
  const drugDrugFlags = BEERS_DRUG_DRUG
    .filter((row) => row.drugs.every((d) => meds.includes(d)))
    .map((row) => ({ drugs: [...row.drugs], text: row.text }));
  const banners = [];
  if (age < 65) {
    banners.push('Age < 65: Beers Criteria applies to adults aged 65+. The recommendations below are out of band but may still be informative.');
  } else {
    banners.push('AGS 2023 Beers Criteria applies to community-dwelling and institutionalized adults aged 65+.');
  }
  const totalFlags = pimFlags.length + diseaseFlags.length + drugDrugFlags.length;
  const summary = meds.length === 0
    ? 'No medications selected.'
    : (totalFlags === 0
      ? 'No Beers flags identified at this medication list and comorbidity list.'
      : `${totalFlags} Beers flag${totalFlags === 1 ? '' : 's'} identified.`);
  return {
    ageYears: age,
    medications: meds,
    comorbidities: cmb,
    pimFlags,
    diseaseFlags,
    drugDrugFlags,
    totalFlags,
    banners,
    summary,
    text: summary,
  };
}
