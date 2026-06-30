// spec-v182 (closing feature spec of the spec-v172 Long-Term Care & Geriatric
// Assessment program, cluster §3.10): continence-severity, caregiver-strain, and
// advanced-wound instruments. v182 ships 5 of its 6 proposed tiles; waterlow is
// deferred (see the deferral note). Each item value, per-item range, band, and
// cutoff was re-fetched and cross-verified against >= 2 independent sources at
// implementation (spec-v97).
//
//   sandvikIncontinence (Group E) - Severity Index = frequency x amount -> 1-12.
//   iciqUiSf            (Group G) - ICIQ-UI Short Form, 3 scored items -> 0-21.
//   modifiedCaregiverStrainIndex (Group G) - MCSI, 13 items 0-2 -> 0-26.
//   caregiverStrainIndex (Group G) - CSI, 13 yes/no -> 0-13, >= 7 high strain.
//   bwat                (Group G) - Bates-Jensen Wound Assessment, 13 items 1-5 -> 13-65.
//
// DEFERRED at implementation (not shipped here):
//   - waterlow: the Waterlow Pressure Ulcer Risk card has detailed per-category
//     sub-weights with documented edition drift (1985 vs the 2005 revised card);
//     the exact current-card weight table could not be byte-verified against >= 2
//     independent sources at implementation. Deferred on sourcing grounds
//     (spec-v97); braden/braden-q/norton-push remain the live pressure-injury
//     risk tiles.
//
// Per the spec-v100 §2 doctrine each consumes the clinician's / patient's answers
// and returns a value or band; none authors a continence / wound / caregiver
// treatment order in Sophie's voice (spec-v11 §5.3). Citations live inline in
// lib/meta.js. No AI, no runtime network call.
//
// SCALES / BANDS / CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97):
//   - sandvikIncontinence: Severity Index = frequency (1 less than monthly .. 4
//     every day/night) x amount (1 drops, 2 small splashes, 3 more); product 1-12;
//     bands 1-2 slight, 3-6 moderate, 8-9 severe, 12 very severe (Sandvik H, et
//     al, J Epidemiol Community Health 1993 / Neurourol Urodyn 2000).
//   - iciqUiSf: sum of the 3 scored items — frequency (0-5), amount (0-6), and
//     overall impact (0-10 VAS); total 0-21; bands 1-5 slight, 6-12 moderate,
//     13-18 severe, 19-21 very severe (Avery K, et al, Neurourol Urodyn 2004).
//     The 4th self-diagnostic item is documented but unscored.
//   - modifiedCaregiverStrainIndex: 13 items each 0 (no) / 1 (yes, sometimes) /
//     2 (yes, regularly); total 0-26; higher = greater strain (Thornton M,
//     Travis SS, J Gerontol B 2003). No official cut.
//   - caregiverStrainIndex: 13 yes/no items, each yes = 1; total 0-13; >= 7
//     indicates a high level of caregiver strain (Robinson BC, J Gerontol 1983).
//   - bwat: 13 wound items each 1 (healthy tissue) to 5 (severe degeneration);
//     total 13-65; lower = healing, higher = degeneration; read as a trajectory
//     across serial scores (Bates-Jensen BM, 1990s).

import { num } from './num.js';

void num;

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return null;
  return n;
}
function yn(v) {
  if (v === true || v === 'yes' || v === '1' || v === 1) return true;
  if (v === false || v === 'no' || v === '0' || v === 0) return false;
  return null;
}

// --- 2.1 Sandvik Severity Index -----------------------------------------------
const SANDVIK_NOTE = 'Sandvik Severity Index for urinary incontinence (Sandvik H, et al, J Epidemiol Community Health 1993; Neurourol Urodyn 2000). Severity Index = frequency of leakage (1 less than once a month, 2 a few times a month, 3 a few times a week, 4 every day/night) × amount of leakage (1 drops, 2 small splashes, 3 more). Product 1–12: 1–2 slight, 3–6 moderate, 8–9 severe, 12 very severe.';

export function sandvikIncontinence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const freq = intIn(o.frequency, 1, 4);
  const amount = intIn(o.amount, 1, 3);
  if (freq === null || amount === null) {
    return { valid: false, message: 'Choose the leakage frequency (1–4) and amount (1–3).' };
  }
  const si = freq * amount; // 1–12
  let band;
  if (si <= 2) band = 'slight (1–2)';
  else if (si <= 6) band = 'moderate (3–6)';
  else if (si <= 9) band = 'severe (8–9)';
  else band = 'very severe (12)';
  return {
    valid: true,
    value: si,
    bandLabel: `Severity Index ${si}`,
    band: `Severity Index ${si} — ${band}`,
    detail: `Frequency ${freq} × amount ${amount}.`,
    note: SANDVIK_NOTE,
  };
}

// --- 2.2 ICIQ-UI-SF -----------------------------------------------------------
const ICIQ_NOTE = 'ICIQ Urinary Incontinence Short Form (Avery K, et al, Neurourol Urodyn 2004). The score is the sum of three items — frequency of leakage (0–5), amount of leakage (0–6), and overall impact on daily life (0–10). Total 0–21: 1–5 slight, 6–12 moderate, 13–18 severe, 19–21 very severe. A fourth self-diagnostic item (when urine leaks) is documented but not scored. The ICIQ is free to use and registered with the ICIQ Group, Bristol; this tile ships the scoring only.';

export function iciqUiSf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const freq = intIn(o.frequency, 0, 5);
  const amount = intIn(o.amount, 0, 6);
  const impact = intIn(o.impact, 0, 10);
  if (freq === null || amount === null || impact === null) {
    return { valid: false, message: 'Score all three items: frequency (0–5), amount (0–6), and impact (0–10).' };
  }
  const total = freq + amount + impact; // 0–21
  let band;
  if (total === 0) band = 'no incontinence (0)';
  else if (total <= 5) band = 'slight (1–5)';
  else if (total <= 12) band = 'moderate (6–12)';
  else if (total <= 18) band = 'severe (13–18)';
  else band = 'very severe (19–21)';
  return {
    valid: true,
    total,
    bandLabel: `ICIQ-UI-SF ${total}/21`,
    band: `ICIQ-UI-SF ${total}/21 — ${band}`,
    detail: `Frequency ${freq} + amount ${amount} + impact ${impact}.`,
    note: ICIQ_NOTE,
  };
}

// --- 2.3 MCSI -----------------------------------------------------------------
const MCSI_ITEMS = ['sleep', 'physical', 'confining', 'family', 'plans', 'otherDemands', 'emotional', 'upsetting', 'changed', 'work', 'financial', 'overwhelmed', 'completelyOverwhelmed'];
const MCSI_NOTE = 'Modified Caregiver Strain Index (Thornton M, Travis SS, J Gerontol B 2003). Thirteen items, each scored 0 (no), 1 (yes, sometimes), or 2 (yes, on a regular basis). Total 0–26; a higher total reflects greater caregiver strain. The MCSI does not define an official cut-point — it is read as a continuous strain measure.';

export function modifiedCaregiverStrainIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = MCSI_ITEMS.map((k) => intIn(o[k], 0, 2));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Rate all 13 MCSI items 0 (no), 1 (sometimes), or 2 (regularly).' };
  }
  const total = vals.reduce((a, b) => a + b, 0); // 0–26
  return {
    valid: true,
    total,
    bandLabel: `MCSI ${total}/26`,
    band: `MCSI ${total}/26 — higher total reflects greater caregiver strain`,
    detail: `Thirteen items each 0–2; ${total} of 26.`,
    note: MCSI_NOTE,
  };
}

// --- 2.4 CSI ------------------------------------------------------------------
const CSI_ITEMS = ['sleep', 'inconvenient', 'physical', 'confining', 'family', 'plans', 'otherDemands', 'emotional', 'upsetting', 'changed', 'work', 'financial', 'overwhelmed'];
const CSI_NOTE = 'Caregiver Strain Index (Robinson BC, J Gerontol 1983). Thirteen yes/no items, each "yes" scoring 1; total 0–13. A total of 7 or more indicates a high level of caregiver strain.';

export function caregiverStrainIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = CSI_ITEMS.map((k) => yn(o[k]));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Answer all 13 CSI items yes or no.' };
  }
  const total = vals.filter(Boolean).length; // 0–13
  const high = total >= 7;
  return {
    valid: true,
    total,
    high,
    bandLabel: `CSI ${total}/13`,
    band: `CSI ${total}/13 — ${high ? 'high level of caregiver strain (≥ 7)' : 'below the high-strain threshold (0–6)'}`,
    detail: `Thirteen yes/no items; ${total} of 13.`,
    note: CSI_NOTE,
  };
}

// --- 2.5 BWAT -----------------------------------------------------------------
const BWAT_ITEMS = ['size', 'depth', 'edges', 'undermining', 'necroticType', 'necroticAmount', 'exudateType', 'exudateAmount', 'skinColor', 'edema', 'induration', 'granulation', 'epithelialization'];
const BWAT_NOTE = 'Bates-Jensen Wound Assessment Tool (BWAT). Thirteen wound characteristics — size, depth, edges, undermining, necrotic tissue type and amount, exudate type and amount, surrounding skin color, peripheral edema and induration, granulation, and epithelialization — each scored 1 (healthy tissue) to 5 (severe degeneration). Total 13–65; a lower total means healing, a higher total degeneration. Read as a trajectory across serial scores, not a single-point band.';

export function bwat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = BWAT_ITEMS.map((k) => intIn(o[k], 1, 5));
  if (vals.some((x) => x === null)) {
    return { valid: false, message: 'Score all 13 BWAT items 1 (healthy) to 5 (severe degeneration).' };
  }
  const total = vals.reduce((a, b) => a + b, 0); // 13–65
  return {
    valid: true,
    total,
    bandLabel: `BWAT ${total}/65`,
    band: `BWAT ${total}/65 — lower is healing, higher is degeneration (track the trajectory)`,
    detail: `Thirteen items each 1–5; ${total} of 65 (floor 13).`,
    note: BWAT_NOTE,
  };
}
