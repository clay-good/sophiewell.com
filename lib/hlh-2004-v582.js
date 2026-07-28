// spec-v582: the HLH-2004 diagnostic criteria for hemophagocytic lymphohistiocytosis. A COMPANION-GAP on a
// different axis: the catalog already has `hscore-hlh`, the HScore, which returns a PROBABILITY of reactive
// hemophagocytic syndrome in adults. HLH-2004 is a CRITERIA CHECKLIST from a pediatric treatment protocol.
// Different construction, different population, different output. `grep -c "id: 'hlh-2004'" app.js` was 0.
//
// **THE MOLECULAR PATH BYPASSES THE CRITERIA ENTIRELY.** Table I opens "The diagnosis HLH can be established
// if one of either 1 or 2 below is fulfilled", where 1 is "A molecular diagnosis consistent with HLH". A
// patient with a confirmed causative mutation meets the guideline with ZERO of the eight clinical criteria.
// Any implementation that only counts criteria will report such a patient as not meeting HLH-2004, which is
// backwards.
//
// **"NO EVIDENCE OF MALIGNANCY" IS A NINTH BULLET, NOT A NINTH CRITERION.** The primary table prints it in
// list (A) alongside the clinical items, but the requirement is five of EIGHT, and the eight are fever,
// splenomegaly, cytopenias, hypertriglyceridemia and/or hypofibrinogenemia, hemophagocytosis, low NK-cell
// activity, ferritin and sCD25. Counting the malignancy bullet gives nine and inflates every total by one.
// This tool asks it, reports it, and deliberately does NOT count it.
//
// **THE PRIMARY GIVES NO FEVER THRESHOLD.** Table I says only "Fever". The 38.5 degrees C threshold that
// appears in many widely reproduced secondary tables is not in the source, so the tool asks fever as a
// clinical judgment and says where the number people expect came from -- it does not silently adopt it.
//
// **TWO OF THE EIGHT ARE SEND-OUT ASSAYS.** NK-cell activity and soluble CD25 are specialized tests whose
// results routinely arrive days after the question is asked, and NK-cell activity has NO universal cutoff:
// the source defines it as "according to local laboratory reference", so the tool takes the local lab's
// verdict rather than a number. That means "not yet met" and "cannot yet be evaluated" are different states,
// and this tool separates them: with 4 of 6 available criteria met and 2 pending, the diagnosis is NOT
// excluded, and reporting a flat "does not meet HLH-2004" in that situation is the dangerous failure here,
// because untreated HLH is rapidly fatal.
//
// **TWO OF THE EIGHT ARE THEMSELVES COMPOUND.** Cytopenias require 2 of 3 LINEAGES (and carry a separate
// hemoglobin threshold for infants under 4 weeks), and criterion 4 is an OR of two unrelated labs,
// triglycerides and fibrinogen. So the eight criteria are not eight yes/no questions.
//
// HIGH-STAKES: these are diagnostic criteria from a treatment protocol. Meeting them is not an instruction
// to start etoposide and dexamethasone, and the criteria do not identify the trigger -- infection,
// malignancy and rheumatologic disease all drive secondary HLH and each needs its own treatment. Failing
// them does not exclude HLH, particularly early or with results pending (spec-v11 section 5.3).
//
// THRESHOLDS AND OPERATORS RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97): the criteria table
// was extracted verbatim from the primary full text and every comparison operator re-checked against an
// independent reproduction, because the primary PDF loses the >= and <= glyphs.
//   - Henter JI, Horne A, Arico M, et al. HLH-2004: diagnostic and therapeutic guidelines for
//     hemophagocytic lymphohistiocytosis. Pediatr Blood Cancer. 2007;48(2):124-131, Table I.
//
// UNIT CONVERSIONS ARE EXACT AND STATED: hemoglobin 90 g/L = 9 g/dL; fibrinogen 1.5 g/L = 150 mg/dL;
// ferritin ug/L and ng/mL are numerically identical; triglycerides 265 mg/dL is the source's own figure.

export const CRITERIA_REQUIRED = 5;
export const CRITERIA_TOTAL = 8;

export const HB_THRESHOLD = 9;            // g/dL, source 90 g/L
export const HB_THRESHOLD_INFANT = 10;    // g/dL, source 100 g/L, infants under 4 weeks
export const PLT_THRESHOLD = 100;         // x10^9/L
export const ANC_THRESHOLD = 1.0;         // x10^9/L
export const LINEAGES_REQUIRED = 2;
export const TRIG_THRESHOLD = 265;        // mg/dL, source >= 3.0 mmol/L i.e. >= 265 mg/dL
export const FIBRINOGEN_THRESHOLD = 150;  // mg/dL, source <= 1.5 g/L
export const FERRITIN_THRESHOLD = 500;    // ug/L (= ng/mL)
export const SCD25_THRESHOLD = 2400;      // U/mL

export const FEVER_NOTE = 'The primary table says only "Fever", with NO temperature threshold. The 38.5 degrees C figure carried by many secondary reproductions is not in the source, so this is asked as a clinical judgment.';
export const NK_NOTE = 'The source defines this as low or absent "according to local laboratory reference". There is no universal cutoff, so the local laboratory’s verdict is the input.';
export const MALIGNANCY_NOTE = '"No evidence of malignancy" is printed in the primary table but is NOT one of the eight criteria - the requirement is five of eight, and counting it gives nine. It is reported here and deliberately not counted.';

const NOTE = 'The HLH-2004 diagnostic criteria (Henter and colleagues 2007, Table I) establish hemophagocytic lymphohistiocytosis if EITHER a molecular diagnosis consistent with HLH is present, OR five of eight criteria are met. The molecular path bypasses the criteria entirely: a patient with a confirmed causative mutation meets the guideline with zero clinical criteria, and an implementation that only counts criteria reports such a patient backwards. The eight are fever, splenomegaly, cytopenias affecting 2 of 3 lineages (hemoglobin under 9 g/dL, or under 10 g/dL in infants under 4 weeks; platelets under 100 x10^9/L; neutrophils under 1.0 x10^9/L), hypertriglyceridemia at or above 265 mg/dL and/or hypofibrinogenemia at or below 150 mg/dL, hemophagocytosis in bone marrow, spleen or lymph nodes, low or absent NK-cell activity by local laboratory reference, ferritin at or above 500 micrograms/L, and soluble CD25 at or above 2400 U/mL. Two of the eight are themselves compound, since cytopenias require 2 of 3 lineages and the fourth criterion is an OR of two unrelated labs, so the eight are not eight yes/no questions. "No evidence of malignancy" appears in the primary table but is not one of the eight and is not counted here. The primary gives no fever threshold; the 38.5 degrees C figure in many secondary tables is not in the source. Two criteria, NK-cell activity and soluble CD25, are send-out assays that routinely return days later, and NK-cell activity has no universal cutoff, so "not yet met" and "cannot yet be evaluated" are different states and are separated here: with results pending the diagnosis is not excluded. These are diagnostic criteria from a treatment protocol. Meeting them is not an instruction to start etoposide and dexamethasone. They do not identify the trigger, and infection, malignancy and rheumatologic disease all drive secondary HLH and each needs its own treatment. Failing them does not exclude HLH, particularly early or with results pending. Distinct from the HScore, which returns a probability of reactive hemophagocytic syndrome in adults; this is a criteria checklist derived in a pediatric protocol.';

function readTri(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return 'yes';
  if (['no', 'n', 'false', '0'].includes(s)) return 'no';
  if (['unknown', 'pending', 'not-done', 'notdone'].includes(s)) return 'pending';
  throw new Error(`${name} must be yes, no or pending.`);
}
function readNum(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['unknown', 'pending', 'not-done', 'notdone'].includes(s)) return 'pending';
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} must be a number that is 0 or more, or "pending".`);
  return n;
}

// Each criterion resolves to true (met), false (not met) or null (cannot yet be evaluated).
function cytopenias(o) {
  const infant = readTri(o.infantUnder4Weeks, 'Infant under 4 weeks') === 'yes';
  const hbLimit = infant ? HB_THRESHOLD_INFANT : HB_THRESHOLD;
  const hb = readNum(o.hemoglobin, 'Hemoglobin');
  const plt = readNum(o.platelets, 'Platelets');
  const anc = readNum(o.neutrophils, 'Neutrophils');
  const vals = [
    { v: hb, met: (x) => x < hbLimit },
    { v: plt, met: (x) => x < PLT_THRESHOLD },
    { v: anc, met: (x) => x < ANC_THRESHOLD },
  ];
  if (vals.some((x) => x.v === null)) return { value: null, detail: 'all three lineages required' };
  const known = vals.filter((x) => x.v !== 'pending');
  const low = known.filter((x) => x.met(x.v)).length;
  const pending = vals.length - known.length;
  if (low >= LINEAGES_REQUIRED) return { value: true, detail: `${low} of 3 lineages low`, hbLimit };
  if (low + pending >= LINEAGES_REQUIRED) return { value: null, detail: `${low} low, ${pending} pending`, hbLimit };
  return { value: false, detail: `${low} of 3 lineages low, ${LINEAGES_REQUIRED} required`, hbLimit };
}

function orCriterion(a, b) {
  if (a === true || b === true) return true;
  if (a === null || b === null) return null;
  return false;
}

// Soluble CD25 carries its own status control rather than a magic value in the number box, because it is the
// one assay in the set whose turnaround is routinely measured in days: `scd25Status` of 'pending' makes the
// criterion unevaluable and the number is ignored.
//
// input: molecularDiagnosis, fever, splenomegaly, infantUnder4Weeks, hemoglobin (g/dL),
// platelets and neutrophils (x10^9/L), triglycerides and fibrinogen (mg/dL), hemophagocytosis,
// nkCellActivity, ferritin (ug/L), scd25 (U/mL), noEvidenceOfMalignancy.
// yes/no items also accept "pending"; numeric items also accept "pending".
export function hlh2004(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let mol, fever, spleen, hemophag, nk, malignancy, cyto, trig, fib, ferr, scd;
  try {
    mol = readTri(o.molecularDiagnosis, 'Molecular diagnosis');
    fever = readTri(o.fever, 'Fever');
    spleen = readTri(o.splenomegaly, 'Splenomegaly');
    hemophag = readTri(o.hemophagocytosis, 'Hemophagocytosis');
    nk = readTri(o.nkCellActivity, 'NK-cell activity');
    malignancy = readTri(o.noEvidenceOfMalignancy, 'No evidence of malignancy');
    cyto = cytopenias(o);
    trig = readNum(o.triglycerides, 'Triglycerides');
    fib = readNum(o.fibrinogen, 'Fibrinogen');
    ferr = readNum(o.ferritin, 'Ferritin');
    const scdStatus = readTri(o.scd25Status === 'resulted' ? 'no' : o.scd25Status, 'Soluble CD25 status');
    scd = (o.scd25Status === 'pending' || scdStatus === 'pending') ? 'pending' : readNum(o.scd25, 'Soluble CD25');
  } catch (err) {
    return { valid: false, message: err.message };
  }

  const tri = (v) => (v === null ? undefined : v === 'pending' ? null : v === 'yes');
  const num = (v, met) => (v === null ? undefined : v === 'pending' ? null : met(v));

  const raw = {
    fever: tri(fever),
    splenomegaly: tri(spleen),
    cytopenias: cyto.value === undefined ? undefined : cyto.value,
    lipids: undefined,
    hemophagocytosis: tri(hemophag),
    nkCellActivity: nk === null ? undefined : nk === 'pending' ? null : nk === 'yes',
    ferritin: num(ferr, (x) => x >= FERRITIN_THRESHOLD),
    scd25: num(scd, (x) => x >= SCD25_THRESHOLD),
  };
  const trigMet = num(trig, (x) => x >= TRIG_THRESHOLD);
  const fibMet = num(fib, (x) => x <= FIBRINOGEN_THRESHOLD);
  raw.lipids = (trigMet === undefined || fibMet === undefined) ? undefined : orCriterion(trigMet, fibMet);
  if (cyto.value === null && cyto.detail === 'all three lineages required') raw.cytopenias = undefined;

  const missing = Object.entries(raw).filter(([, v]) => v === undefined).map(([k]) => k);
  if (mol === null) return { valid: false, message: 'Answer whether a molecular diagnosis consistent with HLH is present. It is an ALTERNATIVE PATH: it establishes the diagnosis on its own, with none of the eight criteria.' };
  if (malignancy === null) return { valid: false, message: 'Answer the malignancy question. It is reported but NOT counted: the requirement is five of eight, and the malignancy bullet is not one of the eight.' };
  if (missing.length) {
    return { valid: false, message: `Answer every criterion, or mark it pending. Still needed: ${missing.join(', ')}. Use "pending" for a send-out assay that has not returned - pending is not the same as not met.` };
  }

  const entries = Object.entries(raw);
  const met = entries.filter(([, v]) => v === true).map(([k]) => k);
  const pending = entries.filter(([, v]) => v === null).map(([k]) => k);
  const notMet = entries.filter(([, v]) => v === false).map(([k]) => k);

  const criteriaMet = met.length;
  const reachable = criteriaMet + pending.length;
  const criteriaPathMet = criteriaMet >= CRITERIA_REQUIRED;
  const molecularPathMet = mol === 'yes';
  const meetsGuideline = molecularPathMet || criteriaPathMet;
  // With assays outstanding the criteria path is undecided, not failed.
  const undecided = !meetsGuideline && mol !== 'yes' && reachable >= CRITERIA_REQUIRED;

  let band;
  if (molecularPathMet && !criteriaPathMet) band = 'Meets HLH-2004 by the molecular path';
  else if (meetsGuideline) band = 'Meets HLH-2004';
  else if (undecided) band = 'Not yet decided - results pending';
  else band = 'Does not meet HLH-2004';

  const parts = [];
  parts.push(`${criteriaMet} of ${CRITERIA_TOTAL} criteria met${pending.length ? `, ${pending.length} still pending (${pending.join(', ')})` : ''}. ${CRITERIA_REQUIRED} of ${CRITERIA_TOTAL} are required.`);
  if (molecularPathMet) {
    parts.push('A molecular diagnosis consistent with HLH is present, and that ESTABLISHES the diagnosis ON ITS OWN - the criteria count does not have to be reached.');
  }
  if (undecided) {
    parts.push(`This is NOT a negative result. ${criteriaMet} met plus ${pending.length} pending can still reach ${CRITERIA_REQUIRED}, so HLH is not excluded. NK-cell activity and soluble CD25 are send-out assays that routinely return days later, and reporting "does not meet HLH-2004" while they are outstanding is the dangerous error here, because untreated HLH is rapidly fatal.`);
  }
  if (!meetsGuideline && !undecided) {
    parts.push('Failing the criteria does not exclude HLH, particularly early in the course.');
  }
  parts.push(malignancy === 'yes'
    ? `No evidence of malignancy. ${MALIGNANCY_NOTE}`
    : `Malignancy is present or not excluded. ${MALIGNANCY_NOTE} Malignancy-associated HLH is a recognized entity, so this does not rule the diagnosis out.`);
  parts.push(`Cytopenias: ${cyto.detail}${cyto.hbLimit === HB_THRESHOLD_INFANT ? ` (infant hemoglobin threshold ${HB_THRESHOLD_INFANT} g/dL applied)` : ''}. The fourth criterion is an OR of triglycerides and fibrinogen, so the eight criteria are not eight yes/no questions.`);
  parts.push(FEVER_NOTE);
  parts.push(NK_NOTE);
  parts.push('These are diagnostic criteria from a treatment protocol; meeting them is not an instruction to start etoposide and dexamethasone, and they do not identify the trigger.');

  return {
    valid: true,
    criteriaMet,
    criteriaRequired: CRITERIA_REQUIRED,
    criteriaTotal: CRITERIA_TOTAL,
    metCriteria: met,
    pendingCriteria: pending,
    unmetCriteria: notMet,
    molecularPathMet,
    criteriaPathMet,
    meetsGuideline,
    undecided,
    noEvidenceOfMalignancy: malignancy === 'yes',
    infantHemoglobinThresholdApplied: cyto.hbLimit === HB_THRESHOLD_INFANT,
    band,
    bandLabel: `${band} (${criteriaMet} of ${CRITERIA_TOTAL})`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
