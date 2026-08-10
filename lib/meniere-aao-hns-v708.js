// spec-v708: AAO-HNS hearing stage for Meniere's disease.
//
// The American Academy of Otolaryngology-Head and Neck Surgery hearing-stage classification
// for definite Meniere's disease, based on the four-tone pure-tone average. Source:
//   Committee on Hearing and Equilibrium guidelines for the diagnosis and evaluation of
//   therapy in Meniere's disease. Otolaryngol Head Neck Surg. 1995;113(3):181-185.
//
//   PTA = mean of the pure-tone thresholds at 500, 1000, 2000, and 3000 Hz (dB HL), from the
//   worst audiogram in the 6 months before treatment.
//
//   Stage 1: PTA <= 25 dB
//   Stage 2: 26-40 dB
//   Stage 3: 41-70 dB
//   Stage 4: > 70 dB
//
// Staging applies only to definite Meniere's disease. Pure: no DOM, no clock, no network.

export const MENIERE_NOTE = "AAO-HNS hearing stage for Meniere's disease (Committee on Hearing and Equilibrium, Otolaryngol Head Neck Surg 1995;113(3):181-185). It stages hearing in definite Meniere's disease from the four-tone pure-tone average - the arithmetic mean of the thresholds at 500, 1000, 2000, and 3000 Hz, in dB HL, taken from the worst audiogram in the 6 months before treatment. Stage 1 is a pure-tone average of 25 dB or less, stage 2 is 26 to 40, stage 3 is 41 to 70, and stage 4 is above 70 dB; stages 1 and 2 represent early or potentially reversible hearing loss and stages 3 and 4 more fixed, advanced loss. It classifies hearing for staging and outcome reporting in definite Meniere's disease only, and it supports rather than replaces the full audiologic and clinical evaluation.";

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function stageOf(pta) {
  if (pta <= 25) return 1;
  if (pta <= 40) return 2;
  if (pta <= 70) return 3;
  return 4;
}
const STAGE_LABEL = { 1: 'stage 1 (mildest)', 2: 'stage 2', 3: 'stage 3', 4: 'stage 4 (most advanced)' };

export function meniereAaoHns(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const keys = ['threshold500', 'threshold1000', 'threshold2000', 'threshold3000'];
  const vals = [];
  for (const k of keys) {
    const v = num(o[k]);
    if (!Number.isFinite(v) || v < -20 || v > 130) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Enter the pure-tone threshold at ${k.replace('threshold', '')} Hz (dB HL).`, note: MENIERE_NOTE };
    }
    vals.push(v);
  }

  const pta = (vals[0] + vals[1] + vals[2] + vals[3]) / 4;
  const rounded = Math.round(pta * 10) / 10;
  const stage = stageOf(pta);

  return {
    valid: true,
    pta: rounded,
    stage,
    tier: `stage-${stage}`,
    abnormal: stage >= 3,
    bandLabel: `Meniere hearing stage ${stage}`,
    band: `Meniere hearing ${STAGE_LABEL[stage]} — PTA ${rounded} dB.`,
    detail: `PTA (mean of 500/1000/2000/3000 Hz) = ${rounded} dB. Stages: 1 <= 25, 2 26-40, 3 41-70, 4 > 70 dB. Applies to definite Meniere's disease.`,
    note: MENIERE_NOTE,
  };
}
