// spec-v95 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
// six deterministic neurology outcome scales and structural grading systems that
// close the catalog's longitudinal-neurology gap. It shipped the acute scores
// (nihss, ich-score, hunt-hess-wfns, four-score, abcd2) but nothing for the next
// visit -- the functional-outcome endpoint, the TBI outcome, the Parkinson stage,
// the AVM surgical grade, the facial-nerve recovery grade, the migraine
// disability band.
//
//   mrs            - modified Rankin Scale (van Swieten 1988)
//   gose           - Glasgow Outcome Scale - Extended + legacy GOS map (Wilson 1998)
//   hoehnYahr      - Hoehn & Yahr Parkinson staging, original + modified (1967)
//   spetzlerMartin - Spetzler-Martin AVM grade + supplemented Lawton-Young (1986/2010)
//   houseBrackmann - House-Brackmann facial-nerve function grade (1985)
//   midas          - Migraine Disability Assessment (Stewart 2001)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v21.js wire these to the home grid.
// mrs / gose / hoehnYahr / houseBrackmann are ordinal selectors with no
// arithmetic -- they map a single grade to a fixed descriptor and band, and an
// out-of-range / blank selection returns a surfaced valid:false fallback rather
// than a silent blank or a wrong band (spec-v59). spetzlerMartin sums bounded
// integer components (the core grade is clamped to 1-5, the supplemented total to
// 2-10 by construction). midas coerces blanks to 0, clamps each day-count to the
// 92-day 3-month ceiling, sums the five disability questions, and reports the
// ancillary frequency/intensity items without scoring them. None authors an
// outcome, prognosis, or treatment order in Sophie's voice (spec-v11 §5.3) -- each
// surfaces the scale's grade and the cited source's own per-band descriptor.

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
// Coerce a day-count: blank -> 0; otherwise clamp to [0, 92] (a 3-month recall
// window cannot exceed ~92 days per item).
const days = (v) => { const f = fin(v); if (f == null || f < 0) return 0; return f > 92 ? 92 : f; };

// --- 2.1 mrs - modified Rankin Scale ------------------------------------------
// A single 7-point ordinal grade (0-6) mapped to the source's verbatim
// descriptor, plus the "good outcome (0-2)" dichotomy used as a stroke-trial
// primary endpoint and its complementary "poor outcome (3-6)" framing.
const MRS_DESC = {
  0: 'No symptoms at all',
  1: 'No significant disability despite symptoms; able to carry out all usual duties and activities',
  2: 'Slight disability; unable to carry out all previous activities but able to look after own affairs without assistance',
  3: 'Moderate disability; requiring some help, but able to walk without assistance',
  4: 'Moderately severe disability; unable to walk without assistance and unable to attend to own bodily needs without assistance',
  5: 'Severe disability; bedridden, incontinent and requiring constant nursing care and attention',
  6: 'Dead',
};
export function mrs({ grade } = {}) {
  const g = fin(grade);
  if (g == null || !Number.isInteger(g) || g < 0 || g > 6) {
    return {
      valid: false,
      band: 'Select a modified Rankin grade 0-6.',
      note: 'The modified Rankin Scale is a single 7-point functional-outcome grade (van Swieten 1988).',
    };
  }
  const goodOutcome = g <= 2;
  const dichotomy = goodOutcome ? 'good outcome (0–2)' : 'poor outcome (3–6)';
  return {
    valid: true,
    grade: g,
    descriptor: MRS_DESC[g],
    goodOutcome,
    dichotomy,
    band: `Modified Rankin grade ${g}: ${MRS_DESC[g]} — ${dichotomy}.`,
    note: 'Modified Rankin Scale (van Swieten 1988): 0 no symptoms; 1 no significant disability; 2 slight disability; 3 moderate disability (walks unassisted); 4 moderately severe (cannot walk/attend needs unaided); 5 severe (bedridden, constant care); 6 dead. The "good outcome (0-2)" dichotomy is the common stroke-trial primary endpoint; the disposition stays with the clinician.',
  };
}

// --- 2.2 gose - Glasgow Outcome Scale - Extended ------------------------------
// An 8-category structured-interview outcome (1-8) mapped to its descriptor and
// to the legacy 5-point GOS (3/4 -> severe disability, 5/6 -> moderate
// disability, 7/8 -> good recovery).
const GOSE = {
  1: { label: 'Dead', gos: 1, gosLabel: 'Dead' },
  2: { label: 'Vegetative state', gos: 2, gosLabel: 'Vegetative state' },
  3: { label: 'Lower severe disability', gos: 3, gosLabel: 'Severe disability' },
  4: { label: 'Upper severe disability', gos: 3, gosLabel: 'Severe disability' },
  5: { label: 'Lower moderate disability', gos: 4, gosLabel: 'Moderate disability' },
  6: { label: 'Upper moderate disability', gos: 4, gosLabel: 'Moderate disability' },
  7: { label: 'Lower good recovery', gos: 5, gosLabel: 'Good recovery' },
  8: { label: 'Upper good recovery', gos: 5, gosLabel: 'Good recovery' },
};
export function gose({ category } = {}) {
  const c = fin(category);
  if (c == null || !Number.isInteger(c) || c < 1 || c > 8) {
    return {
      valid: false,
      band: 'Select a GOS-E category 1-8.',
      note: 'The Glasgow Outcome Scale - Extended is an 8-category structured-interview TBI outcome (Wilson 1998).',
    };
  }
  const m = GOSE[c];
  return {
    valid: true,
    gose: c,
    descriptor: m.label,
    gos: m.gos,
    gosLabel: m.gosLabel,
    band: `GOS-E ${c}: ${m.label} — maps to legacy GOS ${m.gos} (${m.gosLabel}).`,
    note: 'GOS-E (Wilson 1998): 1 dead; 2 vegetative; 3 lower / 4 upper severe disability; 5 lower / 6 upper moderate disability; 7 lower / 8 upper good recovery. Legacy GOS map: 1->1, 2->2, 3/4->3 severe disability, 5/6->4 moderate disability, 7/8->5 good recovery. Reports the category and the source descriptor only.',
  };
}

// --- 2.3 hoehnYahr - Hoehn & Yahr Parkinson disease staging -------------------
// The original 1-5 scale, plus the modified scale with the 0 / 1.5 / 2.5
// half-steps. Each stage maps to its descriptor; the result names which variant
// (original vs modified) the selected stage belongs to.
const HY = {
  '0': { desc: 'No signs of disease', variant: 'modified' },
  '1': { desc: 'Unilateral involvement only', variant: 'original' },
  '1.5': { desc: 'Unilateral and axial involvement', variant: 'modified' },
  '2': { desc: 'Bilateral involvement without impairment of balance', variant: 'original' },
  '2.5': { desc: 'Mild bilateral disease with recovery on the pull test', variant: 'modified' },
  '3': { desc: 'Mild to moderate bilateral disease; some postural instability; physically independent', variant: 'original' },
  '4': { desc: 'Severe disability; still able to walk or stand unassisted', variant: 'original' },
  '5': { desc: 'Wheelchair bound or bedridden unless aided', variant: 'original' },
};
export function hoehnYahr({ stage } = {}) {
  const key = stage == null ? '' : String(stage);
  if (!Object.prototype.hasOwnProperty.call(HY, key)) {
    return {
      valid: false,
      band: 'Select a Hoehn & Yahr stage (original 1-5, or modified 0 / 1.5 / 2.5).',
      note: 'Hoehn & Yahr (1967) stages Parkinson disease; the modified scale adds the 0, 1.5 and 2.5 half-steps.',
    };
  }
  const m = HY[key];
  const variantNote = m.variant === 'modified'
    ? 'modified scale (half-step)'
    : 'original and modified scales';
  return {
    valid: true,
    stage: key,
    descriptor: m.desc,
    variant: m.variant,
    band: `Hoehn & Yahr stage ${key} (${variantNote}): ${m.desc}.`,
    note: 'Hoehn & Yahr (1967): 1 unilateral; 2 bilateral without balance impairment; 3 mild-moderate bilateral with postural instability, independent; 4 severe but walks/stands unaided; 5 wheelchair-bound or bedridden unless aided. The modified scale adds 0 (no disease), 1.5 (unilateral + axial) and 2.5 (mild bilateral, recovers on pull test).',
  };
}

// --- 2.4 spetzlerMartin - Spetzler-Martin AVM grade (+ Lawton-Young) ----------
// Core grade = nidus size (1-3) + eloquent location (0-1) + deep venous drainage
// (0-1), summed 1-5. The supplemented Spetzler-Martin-Lawton-Young total adds
// patient age band (1-3) + unruptured presentation (0-1) + diffuse nidus (0-1),
// summed 2-10. Each input is a closed selector so the sums are clamped by
// construction; the component breakdown is surfaced so the grade is auditable.
const SM_SIZE = { '1': 1, '2': 2, '3': 3 };
const SM_AGE = { '1': 1, '2': 2, '3': 3 };
const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' };
function smInterp(grade) {
  // Source surgical-risk framing: lower grades carry lower combined morbidity.
  if (grade <= 2) return 'lower surgical risk (grade I–II)';
  if (grade === 3) return 'intermediate surgical risk (grade III)';
  return 'higher surgical risk (grade IV–V)';
}
export function spetzlerMartin({ size, eloquent, deepVenous, ageBand, unruptured, diffuse } = {}) {
  if (!Object.prototype.hasOwnProperty.call(SM_SIZE, String(size))) {
    return {
      valid: false,
      band: 'Select the nidus size (< 3 cm, 3–6 cm, or > 6 cm).',
      note: 'Spetzler-Martin (1986) grades an AVM by nidus size, eloquence and deep venous drainage.',
    };
  }
  const sizePts = SM_SIZE[String(size)];
  const eloqPts = onFlag(eloquent) ? 1 : 0;
  const deepPts = onFlag(deepVenous) ? 1 : 0;
  const core = sizePts + eloqPts + deepPts; // 1-5
  // Supplementary Lawton-Young: age band is a selector; the other two are flags.
  const agePts = Object.prototype.hasOwnProperty.call(SM_AGE, String(ageBand)) ? SM_AGE[String(ageBand)] : null;
  const unrupturedPts = onFlag(unruptured) ? 1 : 0;
  const diffusePts = onFlag(diffuse) ? 1 : 0;
  const hasSupplement = agePts != null;
  const supplementedTotal = hasSupplement ? core + agePts + unrupturedPts + diffusePts : null; // 2-10
  const components = {
    size: sizePts, eloquent: eloqPts, deepVenous: deepPts,
    age: agePts, unruptured: unrupturedPts, diffuse: diffusePts,
  };
  const parts = [`Spetzler-Martin grade ${ROMAN[core]} (core sum ${core}): ${smInterp(core)}`];
  if (hasSupplement) parts.push(`supplemented Spetzler-Martin–Lawton-Young total ${supplementedTotal}`);
  return {
    valid: true,
    core,
    grade: ROMAN[core],
    supplementedTotal,
    components,
    band: `${parts.join('; ')}.`,
    note: 'Spetzler-Martin (1986): nidus size (< 3 cm = 1, 3-6 cm = 2, > 6 cm = 3) + eloquent location (1) + deep venous drainage (1), grade I-V. Supplementary Lawton-Young (2010): age (< 20 = 1, 20-40 = 2, > 40 = 3) + unruptured presentation (1) + diffuse nidus (1); the supplemented total (2-10) refines selection. Lower scores carry lower combined surgical morbidity/mortality per the source.',
  };
}

// --- 2.5 houseBrackmann - facial nerve function grading -----------------------
// A single 6-grade ordinal selector (I-VI) mapped to the source's per-grade
// gross / at-rest / motion descriptor.
const HB = {
  1: { roman: 'I', desc: 'Normal facial function in all areas' },
  2: { roman: 'II', desc: 'Mild dysfunction: slight weakness on close inspection; normal symmetry and tone at rest; forehead moderate-to-good motion, eye complete closure with minimum effort, mouth slight asymmetry' },
  3: { roman: 'III', desc: 'Moderate dysfunction: obvious but not disfiguring difference; normal symmetry and tone at rest; forehead slight-to-moderate motion, eye complete closure with effort, mouth slightly weak with maximum effort' },
  4: { roman: 'IV', desc: 'Moderately severe dysfunction: obvious weakness and/or disfiguring asymmetry; normal symmetry and tone at rest; forehead no motion, eye incomplete closure, mouth asymmetric with maximum effort' },
  5: { roman: 'V', desc: 'Severe dysfunction: only barely perceptible motion; asymmetry at rest; forehead no motion, eye incomplete closure, mouth slight movement' },
  6: { roman: 'VI', desc: 'Total paralysis: no movement' },
};
export function houseBrackmann({ grade } = {}) {
  const g = fin(grade);
  if (g == null || !Number.isInteger(g) || g < 1 || g > 6) {
    return {
      valid: false,
      band: 'Select a House-Brackmann grade I-VI.',
      note: 'House-Brackmann (1985) grades facial-nerve function I (normal) to VI (total paralysis).',
    };
  }
  const m = HB[g];
  return {
    valid: true,
    grade: g,
    roman: m.roman,
    descriptor: m.desc,
    band: `House-Brackmann grade ${m.roman}: ${m.desc}.`,
    note: 'House-Brackmann facial nerve grading (1985): I normal; II mild dysfunction; III moderate; IV moderately severe; V severe; VI total paralysis. Each grade keys to symmetry and tone at rest and to forehead, eye and mouth motion. Reports the grade only.',
  };
}

// --- 2.6 midas - Migraine Disability Assessment -------------------------------
// Sum of five disability questions over the prior 3 months -> grade I (0-5),
// II (6-10), III (11-20), IV (>= 21). Ancillary items A (headache-frequency days)
// and B (average pain intensity 0-10) are reported but NOT summed into the score.
function midasBand(total) {
  if (total <= 5) return { grade: 'I', label: 'little or no disability', range: '0–5' };
  if (total <= 10) return { grade: 'II', label: 'mild disability', range: '6–10' };
  if (total <= 20) return { grade: 'III', label: 'moderate disability', range: '11–20' };
  return { grade: 'IV', label: 'severe disability', range: '≥ 21' };
}
export function midas({ q1, q2, q3, q4, q5, freq, intensity } = {}) {
  const d = [days(q1), days(q2), days(q3), days(q4), days(q5)];
  const total = d.reduce((s, x) => s + x, 0);
  const b = midasBand(total);
  const freqDays = days(freq);
  const intensityRaw = fin(intensity);
  const intensityVal = intensityRaw == null ? null : Math.min(Math.max(intensityRaw, 0), 10);
  return {
    valid: true,
    total,
    grade: b.grade,
    bandLabel: b.label,
    range: b.range,
    freq: freqDays,
    intensity: intensityVal,
    band: `MIDAS ${total}: grade ${b.grade}, ${b.label} (${b.range}).`,
    note: 'MIDAS (Stewart 2001) sums five prior-3-month disability questions: days of missed work/school, days of >= 50% reduced work productivity, days of missed household work, days of >= 50% reduced household productivity, days of missed family/social/leisure activity. Grade I 0-5 little/none, II 6-10 mild, III 11-20 moderate, IV >= 21 severe. Items A (headache days) and B (pain intensity 0-10) are reported but not scored.',
  };
}
