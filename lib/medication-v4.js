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

// --- 135: IV-to-PO conversion reference ---------------------------------
export function ivToPo({ drug, ivDoseMg, table }) {
  const row = table.find((r) => r.drug.toLowerCase() === String(drug).toLowerCase());
  if (!row) return null;
  // bioavailability F: equivalent PO dose ~= IV dose / F. (For 1:1 drugs F~1.)
  const poDose = row.bioavailability > 0 ? ivDoseMg / row.bioavailability : null;
  return { ...row, poDoseMg: poDose };
}
