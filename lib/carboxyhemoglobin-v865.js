// spec-v865: reading a carboxyhemoglobin level, and why the number does not decide.
//
// Source:
//   Weaver LK. Carbon monoxide poisoning. N Engl J Med. 2009;360(12):1217-1225.
//
//   Baseline: under about 3 percent in a non-smoker; up to about 10 percent in a smoker.
//   Above baseline confirms exposure. It does not grade it.
//
//   Approximate elimination half-life, which is what makes a later level lower than the peak:
//     room air                   about 4 to 5 hours
//     high-flow 100 percent      about 60 to 90 minutes
//     hyperbaric oxygen          about 20 to 30 minutes
//
// THE LEVEL DOES NOT CORRELATE WITH SEVERITY, AND THAT IS WHY THIS TILE EXISTS. It confirms
// exposure and nothing more. Severity and the decision to treat rest on the clinical picture --
// loss of consciousness, neurologic findings, cardiac ischemia, pregnancy, symptoms persisting
// on oxygen -- not on the number.
//
// A PULSE OXIMETER READS CARBOXYHEMOGLOBIN AS OXYHEMOGLOBIN, so the saturation is falsely
// NORMAL OR HIGH. This is the opposite failure from methemoglobin, where the reading plateaus
// low. A normal saturation in someone pulled from a fire means nothing at all.
//
// THE ARTERIAL OXYGEN TENSION IS NORMAL TOO, because it measures oxygen dissolved in plasma
// rather than what the hemoglobin can carry.
//
// OXYGEN STARTED BEFORE THE SAMPLE MEANS THE LEVEL UNDERSTATES THE PEAK, and it falls fast
// enough that an hour of high-flow oxygen roughly halves it.
//
// Pure: no DOM, no clock, no network.

export const COHB_NOTE = 'Carboxyhemoglobin is hemoglobin bound to carbon monoxide, which it holds far more tightly than oxygen and which also shifts the remaining hemoglobin so that it releases oxygen less readily. A level above about 3 percent in a non-smoker, or above about 10 percent in a smoker, confirms exposure. It does not grade it. This is the single most important thing about the measurement: the level does not correlate with the severity of poisoning and does not predict outcome, so severity and the decision to treat rest on the clinical picture rather than on the number, and a modest level in someone who lost consciousness is still a serious poisoning. Two routine tests read reassuringly. A standard pulse oximeter cannot tell carboxyhemoglobin from oxyhemoglobin and reports the sum, so the saturation comes back normal or high however severe the poisoning is; this is the opposite failure from methemoglobin, where the reading plateaus low instead. The arterial oxygen tension is normal too, because it measures oxygen dissolved in plasma rather than what the hemoglobin can carry. Only co-oximetry, on a blood sample or with a dedicated pulse co-oximeter, measures carboxyhemoglobin. The other thing that misleads is timing: carbon monoxide is cleared with a half-life of roughly four to five hours on room air, about sixty to ninety minutes on high-flow oxygen, and about twenty to thirty minutes on hyperbaric oxygen, so a level drawn after oxygen was started understates the peak, sometimes by a wide margin. High-flow oxygen is given to anyone suspected of exposure without waiting for a level. Hyperbaric oxygen is considered on the clinical features, and the numeric thresholds quoted for it vary between sources, which is a further reason not to let the number decide. It reads a measured level against a baseline. It does not grade severity, decide hyperbaric oxygen, or replace the regional poison center.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const NONSMOKER_BASELINE = 3;
const SMOKER_BASELINE = 10;

// Each of these is a clinical feature consistently listed as a reason to escalate. None of them
// is a number, which is the point.
export const SEVERE_FEATURES = [
  { key: 'unconscious', text: 'Loss of consciousness at any point' },
  { key: 'neurologic', text: 'Any neurologic finding, including confusion' },
  { key: 'cardiac', text: 'Cardiac ischemia, arrhythmia, or a raised troponin' },
  { key: 'pregnant', text: 'Pregnancy' },
  { key: 'persistent', text: 'Symptoms persisting after high-flow oxygen' },
];

const HALF_LIFE = {
  none: 'about 4 to 5 hours on room air',
  'high-flow': 'about 60 to 90 minutes on high-flow oxygen',
  hyperbaric: 'about 20 to 30 minutes on hyperbaric oxygen',
};

export function carboxyhemoglobin(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const level = num(o.level);
  if (level === null) {
    return { valid: false, message: 'Enter the carboxyhemoglobin level as a percentage, measured by co-oximetry.' };
  }
  if (level < 0 || level > 100) {
    return { valid: false, message: 'The carboxyhemoglobin level is outside its range of 0 to 100 percent.' };
  }
  const spo2 = num(o.spo2);
  if (spo2 !== null && (spo2 < 0 || spo2 > 100)) {
    return { valid: false, message: 'The pulse oximeter reading is outside its range of 0 to 100 percent.' };
  }
  const hoursOnOxygen = num(o.hoursOnOxygen);
  if (hoursOnOxygen !== null && (hoursOnOxygen < 0 || hoursOnOxygen > 100)) {
    return { valid: false, message: 'The time on oxygen is outside a plausible range of 0 to 100 hours.' };
  }

  const smoker = on(o.smoker);
  const oxygen = ['none', 'high-flow', 'hyperbaric'].includes(o.oxygen) ? o.oxygen : null;
  const features = SEVERE_FEATURES.filter((f) => on(o[f.key]));

  const baseline = smoker ? SMOKER_BASELINE : NONSMOKER_BASELINE;
  const aboveBaseline = level > baseline;

  const state = aboveBaseline
    ? `${level} percent, above the ${smoker ? 'smoker' : 'non-smoker'} baseline of about ${baseline} percent, which confirms exposure`
    : `${level} percent, within the ${smoker ? 'smoker' : 'non-smoker'} baseline of about ${baseline} percent`;

  // The reason the tile exists, stated on every result.
  const notSeverityNote = 'The level confirms exposure. It does not grade it: carboxyhemoglobin does not correlate with the severity of poisoning and does not predict outcome, so a modest level in someone who lost consciousness is still a serious poisoning.';

  const featuresNote = features.length
    ? `${features.length === 1 ? 'A feature that drives the decision is' : 'Features that drive the decision are'} present: ${features.map((f) => f.text.toLowerCase()).join('; ')}. These, not the number, are what escalation rests on, and hyperbaric oxygen is considered on them.`
    : 'None of the features that drive the decision was entered: loss of consciousness, a neurologic finding, cardiac ischemia, pregnancy, or symptoms persisting on oxygen. Those, not the number, are what escalation rests on.';

  const timingNote = oxygen && oxygen !== 'none'
    ? `Oxygen was already running when this was drawn, so the level understates the peak. Carbon monoxide clears with a half-life of ${HALF_LIFE[oxygen]}${hoursOnOxygen !== null ? `, and ${hoursOnOxygen} ${hoursOnOxygen === 1 ? 'hour' : 'hours'} had passed` : ''}.`
    : oxygen === 'none'
      ? `On room air the half-life is ${HALF_LIFE.none.replace('about ', 'about ')}, so a level drawn late still understates the peak.`
      : 'Whether oxygen had been started before the sample was drawn was not entered. It matters: on high-flow oxygen the half-life is about 60 to 90 minutes, so a level drawn after treatment began understates the peak.';

  const belowBaselineNote = !aboveBaseline
    ? 'A level within the baseline does not exclude poisoning, because oxygen given before the sample brings it down quickly. If the history and the symptoms fit, they outrank this number.'
    : null;

  const smokerNote = smoker
    ? `A smoker carries up to about ${SMOKER_BASELINE} percent at baseline, so ${aboveBaseline ? 'the comparison here is against that higher line, not the non-smoker one' : 'this level may be no more than that baseline'}.`
    : null;

  const oximeterNote = spo2 !== null
    ? `A pulse oximeter reading of ${spo2} percent means nothing here. A standard oximeter cannot tell carboxyhemoglobin from oxyhemoglobin and reports the sum, so the saturation reads normal or high however severe the poisoning is.`
    : 'A standard pulse oximeter cannot tell carboxyhemoglobin from oxyhemoglobin and reports the sum, so the saturation reads normal or high however severe the poisoning is. Only co-oximetry measures this.';

  const gasNote = 'The arterial oxygen tension is normal too, because it measures oxygen dissolved in plasma rather than what the hemoglobin can carry.';

  const oxygenFirstNote = 'High-flow oxygen is given to anyone suspected of exposure without waiting for a level.';

  const scopeNote = 'This reads a measured level against a baseline. It does not grade severity, decide hyperbaric oxygen, or replace the regional poison center.';

  return {
    valid: true,
    level,
    smoker,
    baseline,
    aboveBaseline,
    spo2,
    oxygen,
    hoursOnOxygen,
    featureCount: features.length,
    features: features.map((f) => f.text),
    state,
    notSeverityNote,
    featuresNote,
    timingNote,
    belowBaselineNote,
    smokerNote,
    oximeterNote,
    gasNote,
    oxygenFirstNote,
    scopeNote,
    abnormal: aboveBaseline || features.length > 0,
    bandLabel: aboveBaseline ? 'Exposure confirmed' : 'Within baseline',
    band: `Carboxyhemoglobin ${state}.`,
    detail: `Above about ${NONSMOKER_BASELINE} percent in a non-smoker, or about ${SMOKER_BASELINE} percent in a smoker, confirms exposure. The level does not grade severity and does not predict outcome. Carbon monoxide clears with a half-life of about 4 to 5 hours on room air, 60 to 90 minutes on high-flow oxygen, and 20 to 30 minutes on hyperbaric oxygen, so a level drawn after oxygen was started understates the peak.`,
    note: COHB_NOTE,
  };
}
