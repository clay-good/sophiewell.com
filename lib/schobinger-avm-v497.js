// spec-v497: the Schobinger staging of a PERIPHERAL (extracranial) arteriovenous malformation - the clinical
// staging vascular-anomalies teams use, stages I-IV. Distinct from the cerebral-AVM tiles already in the
// catalog (spetzler-martin, spetzler-ponce), which grade an intracranial AVM for surgical risk on imaging.
// "schobinger" / "vascular anomaly stage" routed to nothing.
//
// HIGH-STAKES: this reports the clinical STAGE the clinician has determined, NOT a diagnosis, an indication
// for embolization or resection, or a prognosis for an individual patient (spec-v11 section 5.3). The
// management decision stays with the vascular-anomalies team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Kohout MP, Hansen M, Pribaz JJ, Mulliken JB. Arteriovenous malformations of the head and neck: natural
//     history and management. Plast Reconstr Surg. 1998;102(3):643-654.
//   - Vascular-anomalies references reproducing the same quiescence (I) / expansion (II) / destruction (III) /
//     decompensation (IV) staging, which is cumulative - each stage carries the findings of the one below it.
//
// Stages (cumulative):
//   I   : quiescence - a pink-bluish stain, warmth, and arteriovenous shunting on Doppler.
//   II  : expansion - stage I plus enlargement, pulsation, thrill, bruit, and tortuous or tense veins.
//   III : destruction - stage II plus dystrophic skin changes, ulceration, bleeding, persistent pain, or
//         tissue necrosis.
//   IV  : decompensation - stage III plus high-output cardiac failure.

const STAGES = {
  I: { stage: 'I', text: 'Schobinger stage I - quiescence: a pink-bluish stain, warmth, and arteriovenous shunting on Doppler.' },
  II: { stage: 'II', text: 'Schobinger stage II - expansion: the stage I findings plus enlargement, pulsation, thrill, bruit, and tortuous or tense veins.' },
  III: { stage: 'III', text: 'Schobinger stage III - destruction: the stage II findings plus dystrophic skin changes, ulceration, bleeding, persistent pain, or tissue necrosis.' },
  IV: { stage: 'IV', text: 'Schobinger stage IV - decompensation: the stage III findings plus high-output cardiac failure.' },
};

const NOTE = 'The Schobinger staging describes the clinical course of a peripheral (extracranial) arteriovenous malformation and is cumulative - each stage carries the findings of the one below it. I: quiescence, a warm stain with shunting on Doppler. II: expansion, with pulsation, thrill, and bruit. III: destruction, with skin breakdown, bleeding, pain, or necrosis. IV: decompensation, with high-output cardiac failure. This reports the stage the clinician has determined, not a diagnosis, an indication for embolization or resection, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   stage: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function schobingerAvm(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Schobinger stage (I, II, III, or IV).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Schobinger stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
