// spec-v1439: uterine activity in labor -- contraction frequency (tachysystole) and Montevideo units.
//
// Sources, read 2026-09-24:
//   Frey HA, Tuuli MG, Roehl KA, Odibo AO, Macones GA, Cahill AG. Can contraction patterns predict
//     neonatal outcomes? J Matern Fetal Neonatal Med 2014;27(14):1422- (PMC4059778), restating the
//     ACOG definition: "Tachysystole, defined as more than five contractions in a 10-minute period,
//     averaged over a 30-minute window, is described as abnormal", and ACOG's own caveat that
//     "contraction frequency alone is a partial assessment of uterine activity". In 2,355 deliveries,
//     tachysystole was more common with adverse neonatal outcome (21% vs 15%) but a model with it
//     "did not adequately predict the adverse outcome (AUC=0.61)".
//   Spong CY, Berghella V, Wenstrom KD, Mercer BM, Saade GR. Preventing the first cesarean delivery.
//     Obstet Gynecol 2012;120(5):1181-1193 (PMC3548444): first-stage arrest turns on "adequate
//     contractions (eg >200 Montevideo units)".
//   Montevideo units need an intrauterine pressure catheter: amplitude and baseline tone cannot be
//     measured by external tocometry (Acta Obstet Gynecol Scand 2026, PMC13125349); the active
//     pressure of each contraction is its peak minus the basal tone (Front Med 2026, PMC12999783).
//
// MVU over one 10-minute window = number of contractions x (average peak - baseline tone), which is
// the same sum as adding each contraction's peak above tone. Pure: no DOM, no clock, no network.

// The 0-20 count and 0-200 mmHg limits below are transcription checks, not clinical thresholds:
// twenty contractions in ten minutes is one every thirty seconds, and no source here states a
// pressure envelope. They refuse a typo; they grade nothing.
function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}
function count(v) {
  if (isBlank(v)) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 20 ? n : NaN;
}
function mmHg(v) {
  if (isBlank(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 200 ? n : NaN;
}

export function uterineActivity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const windows = [count(o.w1), count(o.w2), count(o.w3)];
  const missing = ['the first', 'the second', 'the third'].filter((_, i) => windows[i] === null);
  if (missing.length) {
    return { valid: false, message: `Enter the contractions counted in ${missing.join(', ')} 10-minute window${missing.length === 1 ? '' : 's'}: tachysystole is averaged over 30 minutes.` };
  }
  if (windows.some(Number.isNaN)) return { valid: false, message: 'Each 10-minute count must be a whole number from 0 to 20.' };
  const mean = Math.round(((windows[0] + windows[1] + windows[2]) / 3) * 10) / 10;
  const tachysystole = mean > 5;

  const notes = [
    'Frequency alone is a partial assessment of uterine activity (ACOG); read it with the fetal heart rate tracing.',
  ];
  // Montevideo units: optional, all three IUPC values or none.
  const n = count(o.mvuCount);
  const peak = mmHg(o.peak);
  const tone = mmHg(o.tone);
  const given = [n, peak, tone].filter((x) => x !== null).length;
  let mvu = null;
  let mvuText = '';
  if (given > 0 && given < 3) {
    return { valid: false, message: 'For Montevideo units enter all three from the intrauterine pressure catheter: contractions in one 10-minute window, their average peak, and the baseline tone. Or leave all three blank.' };
  }
  if (given === 3) {
    if ([n, peak, tone].some(Number.isNaN)) return { valid: false, message: 'Pressures must be 0 to 200 mmHg and the count a whole number from 0 to 20.' };
    if (peak < tone) return { valid: false, message: 'The average peak is below the baseline tone; check the tracing.' };
    mvu = Math.round(n * (peak - tone));
    mvuText = ` Montevideo units: ${mvu} (${n} x ${Math.round((peak - tone) * 10) / 10} mmHg above tone), ${mvu > 200 ? 'above' : 'not above'} the 200 used as an example of adequate contractions in labor-arrest definitions.`;
    notes.push('Montevideo units need an intrauterine pressure catheter: an external monitor cannot measure amplitude or tone.');
  } else {
    notes.push('No intrauterine pressure values were entered, so Montevideo units were not calculated.');
  }
  if (tachysystole) notes.push('In a large cohort, tachysystole was more common before adverse neonatal outcomes (21% vs 15%) but did not predict them well on its own (AUC 0.61).');

  const band = `${mean} contractions per 10 minutes averaged over 30 minutes: ${tachysystole ? 'tachysystole (more than 5).' : 'not tachysystole (5 or fewer).'}${mvuText}`;
  return {
    valid: true,
    abnormal: tachysystole,
    mean,
    tachysystole,
    mvu,
    band,
    bandLabel: tachysystole ? `Tachysystole (${mean} per 10 min)` : `${mean} per 10 min`,
    notes,
    note: 'Tachysystole as ACOG defines it, restated in Frey HA et al, J Matern Fetal Neonatal Med 2014; the 200 Montevideo unit example from Spong CY et al, Obstet Gynecol 2012.',
  };
}
