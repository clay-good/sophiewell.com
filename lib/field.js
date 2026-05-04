// Field-Medicine pure functions per spec-v3 section 5.1.

const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;

function num(name, v, { min = 0, max = Infinity } = {}) {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError(`${name} must be a finite number`);
  if (v < min || v > max) throw new RangeError(`${name} out of range [${min}, ${max}]`);
  return v;
}

// ---- Utility 64: Pediatric weight-to-dose ------------------------------
// Returns a per-medication standard dose in mg or units. Doses come from
// FDA labeling and standard prehospital pediatric resuscitation literature.
// Caller is expected to apply local protocol; this is math only.
export const PEDS_DOSE_RECIPES = {
  // dose: per-kg amount (mg/kg unless units says otherwise). cap: max single dose. units: 'mg'|'units'.
  'epinephrine-iv-io':       { label: 'Epinephrine 0.01 mg/kg IV/IO',           perKg: 0.01,  cap: 1,     units: 'mg' },
  'epinephrine-im-anaphyl':  { label: 'Epinephrine 0.01 mg/kg IM (anaphylaxis)',perKg: 0.01,  cap: 0.3,   units: 'mg' },
  'atropine':                { label: 'Atropine 0.02 mg/kg (min 0.1 mg)',       perKg: 0.02,  cap: 0.5,   units: 'mg', min: 0.1 },
  'amiodarone':              { label: 'Amiodarone 5 mg/kg IV/IO bolus',         perKg: 5,     cap: 300,   units: 'mg' },
  'naloxone':                { label: 'Naloxone 0.1 mg/kg IV/IM/IN',            perKg: 0.1,   cap: 2,     units: 'mg' },
  'dextrose-d10':            { label: 'Dextrose 0.5 g/kg as D10 (5 mL/kg)',     perKg: 5,     cap: null,  units: 'mL of D10' },
  'fluid-bolus-ns':          { label: 'Normal saline bolus 20 mL/kg',           perKg: 20,    cap: null,  units: 'mL' },
};

export function pedsDose({ weightKg, recipe }) {
  num('weightKg', weightKg, { min: 0.1, max: 250 });
  const r = PEDS_DOSE_RECIPES[recipe];
  if (!r) throw new TypeError(`unknown recipe: ${recipe}`);
  let dose = weightKg * r.perKg;
  if (r.min != null && dose < r.min) dose = r.min;
  if (r.cap != null && dose > r.cap) dose = r.cap;
  return { dose: r3(dose), units: r.units, label: r.label, capped: r.cap != null && weightKg * r.perKg > r.cap };
}

// ---- Utility 67: Defibrillation energy ---------------------------------
export function defibEnergy({ population, scenario, weightKg, shockNumber = 1, waveform = 'biphasic' }) {
  if (population === 'adult') {
    if (scenario === 'vf-pvt') {
      return waveform === 'biphasic'
        ? { joules: '120-200 J (manufacturer specific); 200 J if unknown', notes: 'Biphasic adult VF/pVT' }
        : { joules: '360 J', notes: 'Monophasic adult VF/pVT' };
    }
    if (scenario === 'cardioversion-svt-narrow-regular') return { joules: '50-100 J synchronized', notes: 'Adult unstable narrow regular SVT' };
    if (scenario === 'cardioversion-afib') return { joules: '120-200 J synchronized', notes: 'Adult unstable atrial fibrillation' };
    if (scenario === 'cardioversion-vt-monomorphic') return { joules: '100 J synchronized', notes: 'Adult unstable monomorphic VT' };
    throw new TypeError(`unknown adult scenario: ${scenario}`);
  }
  if (population === 'pediatric') {
    num('weightKg', weightKg, { min: 1, max: 80 });
    if (scenario === 'vf-pvt') {
      const first = 2 * weightKg;
      const subsequent = 4 * weightKg;
      const j = shockNumber === 1 ? first : Math.min(subsequent, 10 * weightKg);
      return { joules: `${r2(j)} J`, notes: shockNumber === 1 ? '2 J/kg first shock' : '4 J/kg subsequent (max 10 J/kg or adult dose)' };
    }
    if (scenario === 'cardioversion') {
      const first = 0.5 * weightKg;
      const subsequent = 2 * weightKg;
      return { joules: `${r2(shockNumber === 1 ? first : subsequent)} J synchronized`,
               notes: shockNumber === 1 ? '0.5-1 J/kg first synchronized shock' : '2 J/kg subsequent synchronized' };
    }
    throw new TypeError(`unknown pediatric scenario: ${scenario}`);
  }
  throw new TypeError(`unknown population: ${population}`);
}

// ---- Utility 68: Cincinnati Prehospital Stroke Scale -------------------
// Three signs, each scored as 0 normal or 1 abnormal. Any one positive sign
// is considered a positive screen.
export function cincinnatiStroke({ facialDroop, armDrift, abnormalSpeech }) {
  for (const [k, v] of Object.entries({ facialDroop, armDrift, abnormalSpeech })) num(k, v, { min: 0, max: 1 });
  const total = facialDroop + armDrift + abnormalSpeech;
  return { total, positive: total > 0, signs: { facialDroop, armDrift, abnormalSpeech } };
}

// ---- Utility 69: FAST and BE-FAST --------------------------------------
// Boolean inputs. Any positive checkbox flips `positive` true. The BE-FAST
// extension is just two extra signs.
export function fast(answers, { extended = false } = {}) {
  const items = ['face', 'arms', 'speech'];
  if (extended) items.unshift('balance', 'eyes');
  const positive = items.some((k) => Boolean(answers[k]));
  return { positive, items, scored: Object.fromEntries(items.map((k) => [k, Boolean(answers[k])])) };
}

// ---- Utility 70: CDC Field Triage Guidelines ---------------------------
// Inputs are step-by-step boolean answers. The first step that triggers
// returns the destination recommendation; later steps are still informative.
export function fieldTriage(answers) {
  const step1 = ['gcs-le-13', 'sbp-lt-110-adult-or-shock-pediatric', 'rr-lt-10-or-gt-29-or-respiratory-distress'];
  const step2 = ['penetrating-head-neck-torso', 'amputation-proximal-wrist-ankle', 'pelvic-fracture-suspected',
                 'long-bone-fractures-multi', 'crushed-degloved', 'chest-wall-instability',
                 'open-or-depressed-skull', 'paralysis'];
  const step3 = ['fall-adult-gt-20-or-pediatric-gt-10', 'mvc-high-risk',
                 'auto-vs-ped-bicyclist-thrown-impact-gt-20', 'motorcycle-crash-gt-20mph'];
  const step4 = ['older-adult', 'pediatric', 'anticoagulant-use', 'pregnancy-gt-20wk', 'burns'];

  const has = (ids) => ids.some((id) => Boolean(answers[id]));

  if (has(step1)) return { destination: 'Highest-level trauma center', step: 1, reason: 'Step 1: vitals or consciousness criterion met.' };
  if (has(step2)) return { destination: 'Highest-level trauma center', step: 2, reason: 'Step 2: anatomy-of-injury criterion met.' };
  if (has(step3)) return { destination: 'Trauma center (consider)', step: 3, reason: 'Step 3: high-risk mechanism present. Agency-protocol decision.' };
  if (has(step4)) return { destination: 'Use clinical judgment; consult medical control', step: 4, reason: 'Step 4: special considerations present.' };
  return { destination: 'Closest appropriate facility', step: 0, reason: 'No triage criteria met.' };
}

// ---- Utility 71: START adult triage ------------------------------------
// Inputs are sequenced answers per the START algorithm.
export function startTriage({ canWalk, isBreathing, breathsAfterReposition, respiratoryRate, hasRadialPulseAndCapRefillUnder2s, followsCommands }) {
  if (canWalk) return { category: 'Minor (green)', reason: 'Patient can walk.' };
  if (!isBreathing) {
    if (breathsAfterReposition === false) return { category: 'Expectant (black)', reason: 'No breathing after airway repositioning.' };
    if (breathsAfterReposition === true) return { category: 'Immediate (red)', reason: 'Breathing only after airway repositioning.' };
    return { category: 'Expectant (black)', reason: 'Not breathing.' };
  }
  num('respiratoryRate', respiratoryRate, { min: 0 });
  if (respiratoryRate > 30) return { category: 'Immediate (red)', reason: 'Respiratory rate > 30.' };
  if (!hasRadialPulseAndCapRefillUnder2s) return { category: 'Immediate (red)', reason: 'Absent radial pulse or capillary refill > 2s.' };
  if (!followsCommands) return { category: 'Immediate (red)', reason: 'Cannot follow simple commands.' };
  return { category: 'Delayed (yellow)', reason: 'Walking-no, breathing yes, RR <= 30, perfusion intact, follows commands.' };
}

// ---- Utility 72: JumpSTART pediatric triage (ages 1-8) -----------------
export function jumpStartTriage({ canWalk, isBreathing, breathsAfterRescue, respiratoryRate, palpablePulse, avpuAppropriate }) {
  if (canWalk) return { category: 'Minor (green)', reason: 'Child can walk.' };
  if (!isBreathing) {
    if (breathsAfterRescue === true) return { category: 'Immediate (red)', reason: 'Breathing returned after 5 rescue breaths.' };
    return { category: 'Expectant (black)', reason: 'Apnea persists after 5 rescue breaths.' };
  }
  num('respiratoryRate', respiratoryRate, { min: 0 });
  if (respiratoryRate < 15 || respiratoryRate > 45) return { category: 'Immediate (red)', reason: 'Respiratory rate outside 15-45.' };
  if (!palpablePulse) return { category: 'Immediate (red)', reason: 'No palpable peripheral pulse.' };
  if (!avpuAppropriate) return { category: 'Immediate (red)', reason: 'AVPU inappropriate (P inappropriate or U).' };
  return { category: 'Delayed (yellow)', reason: 'Breathing, RR 15-45, pulse present, AVPU appropriate.' };
}

// ---- Utility 73: Burn surface area -------------------------------------
// Rule of Nines: standard adult percentages.
export const RULE_OF_NINES_ADULT = {
  head:                    9,
  'arm-left':              9,
  'arm-right':             9,
  'leg-left':              18,
  'leg-right':             18,
  'trunk-anterior':        18,
  'trunk-posterior':       18,
  perineum:                1,
};
export function ruleOfNines(selected) {
  let total = 0;
  for (const [k, v] of Object.entries(RULE_OF_NINES_ADULT)) {
    if (selected && selected[k]) total += v;
  }
  return { tbsa: Math.min(100, total) };
}

// Lund-Browder: takes a map of region -> percent affected (caller has
// already adjusted by age via the chart). Sums the entered percentages.
export function lundBrowder(percents) {
  let total = 0;
  for (const v of Object.values(percents || {})) {
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) total += v;
  }
  return { tbsa: r2(Math.min(100, total)) };
}

// ---- Utility 74: Burn fluid resuscitation ------------------------------
// Parkland: 4 mL/kg/% over 24h, half in first 8h. Modified Brooke: 2 mL/kg/%.
// hoursSinceInjury optional; if given, computes remaining-in-first-8h.
export function burnFluid({ weightKg, tbsaPercent, hoursSinceInjury }) {
  num('weightKg', weightKg, { min: 0.1, max: 400 });
  num('tbsaPercent', tbsaPercent, { min: 0, max: 100 });
  const parkland24 = 4 * weightKg * tbsaPercent;
  const brooke24 = 2 * weightKg * tbsaPercent;
  const out = {
    parkland: { total24h: r2(parkland24), first8h: r2(parkland24 / 2), remaining16h: r2(parkland24 / 2) },
    brooke:   { total24h: r2(brooke24),   first8h: r2(brooke24 / 2),   remaining16h: r2(brooke24 / 2) },
  };
  if (Number.isFinite(hoursSinceInjury) && hoursSinceInjury >= 0 && hoursSinceInjury < 8) {
    const remaining = 8 - hoursSinceInjury;
    out.parkland.remainingInFirst8h = r2((parkland24 / 2) * (remaining / 8));
    out.brooke.remainingInFirst8h   = r2((brooke24   / 2) * (remaining / 8));
    out.parkland.ratePerHourRemainingFirst8h = r2(out.parkland.remainingInFirst8h / remaining);
    out.brooke.ratePerHourRemainingFirst8h   = r2(out.brooke.remainingInFirst8h   / remaining);
  }
  return out;
}

// ---- Utility 80: Naloxone dosing ---------------------------------------
// Returns the standard initial dose, redose interval, and notes by patient
// size and route. Doses come from FDA labeling; CDC opioid overdose guidance
// recommends repeating until response or max escalation.
export function naloxoneDose({ population, route, weightKg }) {
  const r = (s) => s;
  if (population === 'adult') {
    const m = {
      iv:  { initial: '0.4-2 mg IV', redose: 'Repeat q2-3 min as needed; titrate to adequate respirations.', max: 'Higher doses (10 mg) may be required with synthetic opioids; if no response after 10 mg, reconsider diagnosis.' },
      im:  { initial: '0.4-2 mg IM', redose: 'Repeat q2-3 min as needed.', max: 'Higher doses with synthetic opioids per CDC guidance.' },
      in:  { initial: '4 mg intranasal (1 spray each nostril)', redose: 'Repeat q2-3 min until response; alternate nostrils.', max: 'No fixed maximum; titrate to respirations.' },
      sc:  { initial: '0.4-2 mg SC', redose: 'Repeat q2-3 min as needed.', max: 'Less reliable absorption; prefer IV/IM/IN.' },
    };
    if (!m[route]) throw new TypeError(`unknown route: ${route}`);
    return { population, route, dose: m[route].initial, redose: m[route].redose, max: m[route].max };
  }
  if (population === 'pediatric') {
    num('weightKg', weightKg, { min: 1, max: 80 });
    const perKg = 0.1;
    const cap = 2;
    const computed = Math.min(weightKg * perKg, cap);
    return {
      population, route, weightKg,
      dose: `${r3(computed)} mg ${route.toUpperCase()} (0.1 mg/kg, max ${cap} mg adult dose)`,
      redose: 'Repeat q2-3 min as needed.',
      max: 'Higher cumulative doses may be required with synthetic opioids.',
    };
  }
  throw new TypeError(`unknown population: ${population}`);
}

// ---- Utility 81: EMS documentation checklist ---------------------------
// bank: parsed contents of data/workflow/ems-runtypes.json.
export function selectEmsChecklist(bank, runTypeId) {
  const rt = (bank.runTypes || []).find((r) => r.id === runTypeId);
  if (!rt) return null;
  return { id: rt.id, name: rt.name, items: rt.items.slice() };
}

// ---- Utility 77: Pediatric ETT size ------------------------------------
// Cuffed: age/4 + 3.5. Uncuffed: age/4 + 4. Depth: 3 * tube size cm.
export function pediatricEtt({ ageYears, cuffed }) {
  num('ageYears', ageYears, { min: 0, max: 18 });
  const sizeMm = (ageYears / 4) + (cuffed ? 3.5 : 4);
  const depthCm = sizeMm * 3;
  return { sizeMm: r2(sizeMm), depthCm: r2(depthCm), cuffed: !!cuffed };
}
