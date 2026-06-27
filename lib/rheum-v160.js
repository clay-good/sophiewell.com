// spec-v160 (third feature spec of the spec-v157 Subspecialty Depth program):
// four rheumatology activity / classification instruments that complete the RA
// PRO, the PsA activity index, and the two SLE classification criteria. v147/
// v148/v156 shipped the physician/PRO activity scores; this fills the routine US
// RA PRO (RAPID3), the PsA activity index (DAPSA), and the two SLE criteria.
// v160 runs no AI and makes no runtime network call.
//
//   rapid3          - Routine Assessment of Patient Index Data 3 (PRO, 0–30)
//   dapsa           - Disease Activity in Psoriatic Arthritis
//   sliccSle        - SLICC 2012 SLE classification criteria
//   sle2019EularAcr - 2019 EULAR/ACR SLE classification criteria (weighted)
//
// Per the spec-v100 §2 doctrine rapid3/dapsa are bounded weighted sums; sliccSle
// and sle2019EularAcr are deterministic rule logic where every valid input
// resolves to a single classified/not-classified verdict (the §2 classification
// clarification). Citations live inline in lib/meta.js; the renderers in
// views/group-v160.js render the spec-v50 §3 posture note (classification
// criteria are for study/standardization, not a substitute for clinical
// diagnosis) and defer the diagnosis/treatment to the clinician (spec-v11 §5.3).
//
// CUTOFFS / WEIGHTS / CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent sources at implementation.
// SOURCE-GOVERNANCE:
//   - rapid3 (Pincus T, et al, J Rheumatol 2008;35(11):2136-2147): three 0–10
//     components — physical function (MDHAQ FN, 10 items each 0–3 summed 0–30
//     then DIVIDED BY 3 → 0–10), pain VAS, patient-global VAS — summed to 0–30.
//     Categories: near-remission ≤ 3, low 3.1–6, moderate 6.1–12, high > 12.
//   - dapsa (Schoels MM, et al, Ann Rheum Dis 2016;75(5):811-818; cutoffs Schoels
//     2010): TJC68 + SJC66 + patient-global VAS (0–10) + pain VAS (0–10) + CRP in
//     mg/dL (NOT mg/L — the chief unit trap). Cutoffs: remission ≤ 4, low 5–14,
//     moderate 15–28, high > 28.
//   - sliccSle (Petri M, et al, Arthritis Rheum 2012;64(8):2677-2686): 11 clinical
//     + 6 immunologic criteria. Classify if ≥ 4 criteria with ≥ 1 clinical AND
//     ≥ 1 immunologic; OR biopsy-proven lupus nephritis with positive ANA or
//     anti-dsDNA (the shortcut pathway, which can classify with < 4 total).
//   - sle2019EularAcr (Aringer M, et al, Arthritis Rheumatol 2019;71(9):1400-1412):
//     ANA ≥ 1:80 ever is a HARD ENTRY GATE. 7 clinical + 3 immunologic domains;
//     only the HIGHEST-WEIGHTED item per domain counts. Classify if entry met AND
//     weighted total ≥ 10 AND ≥ 1 clinical criterion. Weights re-fetched verbatim
//     and cross-verified (Merck Manual + Aringer 2019 full text), zero
//     discrepancies.

import { num, r1 } from './num.js';

function scale010(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10) return null;
  return n;
}
function nonneg(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}
function checked(v) {
  return v === true || v === 'yes' || v === '1' || v === 1;
}

// --- 2.1 RAPID3 --------------------------------------------------------------
const RAPID3_NOTE = 'Routine Assessment of Patient Index Data 3 (Pincus T, et al, J Rheumatol 2008;35(11):2136-2147): three patient-reported components, each rescaled to 0–10 — physical function (the 10-item MDHAQ FN, each item 0–3 summed to 0–30 then divided by 3), pain VAS, and patient-global VAS — summed to RAPID3 0–30. Categories: near-remission ≤ 3, low 3.1–6, moderate 6.1–12, high > 12. The MDHAQ ÷3 transform is what makes the function component a correct 0–10.';

export function rapid3(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  // Function may be entered as the raw 0–30 MDHAQ FN sum (preferred) or as a
  // pre-divided 0–10 value; we take the raw sum and divide by 3.
  const fnRaw = nonneg(o.fnRaw, 30);
  const pain = scale010(o.pain);
  const global = scale010(o.global);
  const missing = [];
  if (fnRaw === null) missing.push('MDHAQ function sum (0–30)');
  if (pain === null) missing.push('pain VAS (0–10)');
  if (global === null) missing.push('patient-global VAS (0–10)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const fn = fnRaw / 3;
  const score = r1(num('RAPID3', fn + pain + global, { min: 0, max: 30 }));
  let band; let abnormal;
  if (score <= 3) { band = 'near-remission'; abnormal = false; }
  else if (score <= 6) { band = 'low severity'; abnormal = true; }
  else if (score <= 12) { band = 'moderate severity'; abnormal = true; }
  else { band = 'high severity'; abnormal = true; }
  return {
    valid: true,
    score,
    fn: r1(fn),
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `RAPID3 ${score}/30 — ${band}.`,
    detail: `Function ${r1(fn)} (MDHAQ ${fnRaw}÷3) + pain ${pain} + global ${global}. Categories: near-remission ≤ 3, low 3.1–6, moderate 6.1–12, high > 12.`,
    note: RAPID3_NOTE,
  };
}

// --- 2.2 DAPSA ---------------------------------------------------------------
const DAPSA_NOTE = 'Disease Activity in Psoriatic Arthritis (Schoels MM, et al, Ann Rheum Dis 2016;75(5):811-818; cutoffs Schoels 2010): DAPSA = 68-joint tender count + 66-joint swollen count + patient-global VAS (0–10) + pain VAS (0–10) + CRP in mg/dL. CRP is in mg/dL, NOT mg/L — an mg/L value would inflate the score roughly tenfold. Cutoffs: remission ≤ 4, low 5–14, moderate 15–28, high > 28.';

export function dapsa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tjc = nonneg(o.tjc68, 68);
  const sjc = nonneg(o.sjc66, 66);
  const global = scale010(o.global);
  const pain = scale010(o.pain);
  const crp = nonneg(o.crp, 100); // mg/dL
  const missing = [];
  if (tjc === null) missing.push('68-joint tender count');
  if (sjc === null) missing.push('66-joint swollen count');
  if (global === null) missing.push('patient-global VAS (0–10)');
  if (pain === null) missing.push('pain VAS (0–10)');
  if (crp === null) missing.push('CRP (mg/dL)');
  if (missing.length) {
    return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  }
  const score = r1(num('DAPSA', tjc + sjc + global + pain + crp, { min: 0, max: 300 }));
  let band; let abnormal;
  if (score <= 4) { band = 'remission'; abnormal = false; }
  else if (score <= 14) { band = 'low disease activity'; abnormal = true; }
  else if (score <= 28) { band = 'moderate disease activity'; abnormal = true; }
  else { band = 'high disease activity'; abnormal = true; }
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: band.replace(/^./, (m) => m.toUpperCase()),
    band: `DAPSA ${score} — ${band}.`,
    detail: `TJC68 ${tjc} + SJC66 ${sjc} + global ${global} + pain ${pain} + CRP ${crp} mg/dL. Cutoffs: remission ≤ 4, low 5–14, moderate 15–28, high > 28.`,
    note: DAPSA_NOTE,
  };
}

// --- 2.3 SLICC 2012 ----------------------------------------------------------
const SLICC_NOTE = 'SLICC 2012 SLE classification criteria (Petri M, et al, Arthritis Rheum 2012;64(8):2677-2686): 11 clinical and 6 immunologic criteria. Classifies as SLE if ≥ 4 criteria are met with at least 1 clinical AND at least 1 immunologic; OR biopsy-proven lupus nephritis (compatible with SLE) in the presence of ANA or anti-dsDNA — the shortcut pathway, which can classify with fewer than 4 total criteria. A classification standard for study cohorts, not a clinical diagnosis.';

const SLICC_CLINICAL = ['acuteCutaneous', 'chronicCutaneous', 'oralNasalUlcers', 'alopecia', 'synovitis', 'serositis', 'renal', 'neurologic', 'hemolyticAnemia', 'leukopenia', 'thrombocytopenia'];
const SLICC_IMMUNO = ['ana', 'antiDsDna', 'antiSm', 'antiphospholipid', 'lowComplement', 'directCoombs'];

export function sliccSle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const clin = SLICC_CLINICAL.filter((k) => checked(o[k])).length;
  const imm = SLICC_IMMUNO.filter((k) => checked(o[k])).length;
  const total = clin + imm;
  const biopsyNephritis = checked(o.biopsyNephritis);
  const anaOrDsDna = checked(o.ana) || checked(o.antiDsDna);

  const biopsyPath = biopsyNephritis && anaOrDsDna;
  const countPath = total >= 4 && clin >= 1 && imm >= 1;
  const classifies = biopsyPath || countPath;
  let pathway = 'none';
  if (biopsyPath) pathway = 'biopsy-proven lupus nephritis + ANA/anti-dsDNA';
  else if (countPath) pathway = '≥ 4 criteria with ≥ 1 clinical and ≥ 1 immunologic';

  return {
    valid: true,
    clinical: clin,
    immunologic: imm,
    total,
    classifies,
    abnormal: classifies,
    bandLabel: classifies ? 'Meets SLICC criteria' : 'Does not meet SLICC criteria',
    band: classifies
      ? `Meets SLICC 2012 criteria for SLE — ${pathway}.`
      : `Does not meet SLICC 2012 criteria (${total} criteria: ${clin} clinical, ${imm} immunologic).`,
    detail: classifies
      ? `${clin} clinical + ${imm} immunologic = ${total} total. Either pathway classifies; the satisfied pathway is named.`
      : 'Needs ≥ 4 criteria with ≥ 1 clinical and ≥ 1 immunologic, or biopsy-proven lupus nephritis with ANA or anti-dsDNA.',
    note: SLICC_NOTE,
  };
}

// --- 2.4 2019 EULAR/ACR ------------------------------------------------------
const SLE2019_NOTE = 'The 2019 European League Against Rheumatism / American College of Rheumatology SLE classification criteria (Aringer M, et al, Arthritis Rheumatol 2019;71(9):1400-1412): a positive antinuclear antibody at ≥ 1:80 ever is a hard entry gate. Across 7 clinical and 3 immunologic domains only the single highest-weighted item per domain counts. Classifies as SLE if the entry criterion is met AND the weighted total is ≥ 10 AND at least one clinical criterion is present. A classification standard, not a clinical diagnosis.';

// Each domain: the items it offers, mapped to the published weight. Only the
// MAX selected weight in a domain counts (within-domain max-weight rule).
const SLE2019_DOMAINS = [
  { key: 'constitutional', clinical: true, items: { fever: 2 } },
  { key: 'hematologic', clinical: true, items: { leukopenia: 3, thrombocytopenia: 4, hemolysis: 4 } },
  { key: 'neuropsychiatric', clinical: true, items: { delirium: 2, psychosis: 3, seizure: 5 } },
  { key: 'mucocutaneous', clinical: true, items: { alopecia: 2, oralUlcers: 2, subacuteOrDiscoid: 4, acuteCutaneous: 6 } },
  { key: 'serosal', clinical: true, items: { effusion: 5, pericarditis: 6 } },
  { key: 'musculoskeletal', clinical: true, items: { jointInvolvement: 6 } },
  { key: 'renal', clinical: true, items: { proteinuria: 4, biopsyClass2or5: 8, biopsyClass3or4: 10 } },
  { key: 'antiphospholipid', clinical: false, items: { antiphospholipid: 2 } },
  { key: 'complement', clinical: false, items: { lowC3orC4: 3, lowC3andC4: 4 } },
  { key: 'sleAntibodies', clinical: false, items: { dsDnaOrSm: 6 } },
];

export function sle2019EularAcr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const entry = checked(o.anaEntry);
  let total = 0;
  let clinicalPresent = false;
  const active = [];
  for (const d of SLE2019_DOMAINS) {
    let domainMax = 0; let domainItem = '';
    for (const [item, weight] of Object.entries(d.items)) {
      if (checked(o[item]) && weight > domainMax) { domainMax = weight; domainItem = item; }
    }
    if (domainMax > 0) {
      total += domainMax;
      if (d.clinical) clinicalPresent = true;
      active.push(`${d.key}:${domainItem} (+${domainMax})`);
    }
  }
  total = num('SLE-2019 total', total, { min: 0, max: 100 });

  let classifies; let reason;
  if (!entry) {
    classifies = false;
    reason = 'entry criterion (ANA ≥ 1:80) not met';
  } else if (!clinicalPresent) {
    classifies = false;
    reason = 'no clinical criterion present (≥ 1 required)';
  } else if (total < 10) {
    classifies = false;
    reason = `weighted total ${total} below the threshold of 10`;
  } else {
    classifies = true;
    reason = `entry met, weighted total ${total} ≥ 10 with ≥ 1 clinical criterion`;
  }

  return {
    valid: true,
    entry,
    total,
    classifies,
    abnormal: classifies,
    bandLabel: classifies ? 'Meets 2019 EULAR/ACR criteria' : 'Does not meet 2019 EULAR/ACR criteria',
    band: entry
      ? `${classifies ? 'Meets' : 'Does not meet'} 2019 EULAR/ACR criteria for SLE (weighted total ${total}) — ${reason}.`
      : 'Entry criterion not met — ANA ≥ 1:80 is required before scoring; not classified as SLE.',
    detail: active.length
      ? `Counted (highest-weighted item per domain): ${active.join(', ')}. Classify if entry met, total ≥ 10, and ≥ 1 clinical.`
      : 'No weighted criteria selected. Classify if entry met, total ≥ 10, and ≥ 1 clinical.',
    note: SLE2019_NOTE,
  };
}
