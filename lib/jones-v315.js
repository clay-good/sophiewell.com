// spec-v315: 2015 revised Jones criteria for the diagnosis of acute rheumatic fever
// (ARF) — a major standard diagnostic criteria set with no prior tile (the "Jones"
// corpus hits were the unrelated Ireton-Jones energy equation / a COPD test). The
// 2015 AHA revision is risk-stratified (low-risk vs moderate/high-risk populations)
// and adds subclinical (echo) carditis; this classifies a presentation as meeting or
// not meeting the criteria for an initial or recurrent episode.
//
// HIGH-STAKES: this reports the CLASSIFICATION RESULT (criteria met / not met), NOT a
// diagnosis or an order (spec-v11 §5.3). The diagnosis stays with the clinician, who
// has determined each manifestation and excluded mimics.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against two
// sources that agree:
//   - Gewitz MH, Baltimore RS, Tani LY, et al. Revision of the Jones Criteria for the
//     diagnosis of acute rheumatic fever in the era of Doppler echocardiography: a
//     scientific statement from the American Heart Association. Circulation.
//     2015;131(20):1806-1818.
//   - Burke RJ, Chang C. Update on the diagnosis of acute rheumatic fever: 2015 Jones
//     criteria. (PMC4829161), which reproduces the same risk-stratified table.
//
// Diagnosis (with evidence of preceding group A strep, except isolated chorea):
//   Initial ARF   : 2 major, or 1 major + 2 minor.
//   Recurrent ARF : 2 major, or 1 major + 2 minor, or 3 minor.
// Major (low-risk): carditis (clinical/subclinical), polyarthritis, chorea, erythema
//   marginatum, subcutaneous nodules. Minor (low-risk): polyarthralgia, fever
//   >= 38.5 C, ESR >= 60 mm/h and/or CRP >= 3 mg/dL, prolonged PR (if no carditis).
// Major (moderate/high-risk): carditis, monoarthritis OR polyarthritis OR
//   polyarthralgia, chorea, erythema marginatum, subcutaneous nodules. Minor
//   (moderate/high-risk): monoarthralgia, fever >= 38 C, ESR >= 30 and/or CRP >= 3,
//   prolonged PR (if no carditis).

function on(v) { return v === true; }

const NOTE = '2015 revised Jones criteria (AHA; Gewitz 2015). Diagnosis requires evidence of preceding group A streptococcal infection (except isolated Sydenham chorea, which is sufficient on its own). Initial ARF: 2 major, or 1 major + 2 minor. Recurrent ARF: 2 major, or 1 major + 2 minor, or 3 minor. Criteria are risk-stratified: low-risk populations use polyarthritis (major) / polyarthralgia (minor) and fever >= 38.5 C, ESR >= 60 mm/h and/or CRP >= 3 mg/dL; moderate/high-risk populations also count monoarthritis and polyarthralgia as major and monoarthralgia as minor, with fever >= 38 C and ESR >= 30 and/or CRP >= 3. A prolonged PR interval counts only when carditis is absent. Isolated indolent carditis is also a recognized standalone presentation per the guideline (clinician judgment). This reports whether the criteria are met, not a diagnosis or an order, which stays with the clinician.';

// input:
//   riskPopulation: 'low' | 'modhigh' (default 'low')
//   episode: 'initial' | 'recurrent' (default 'initial')
//   gasEvidence: bool (evidence of preceding group A strep)
//   carditis, chorea, erythemaMarginatum, subcutaneousNodules: bool (always major)
//   polyarthritis: bool (major, both tiers)
//   monoarthritis: bool (major in moderate/high-risk only)
//   polyarthralgia: bool (major in moderate/high-risk; minor in low-risk)
//   monoarthralgia: bool (minor in moderate/high-risk only)
//   fever, elevatedAcuteReactants, prolongedPr: bool (minor, both tiers;
//     prolongedPr counts only if carditis is absent)
export function jonesCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const low = o.riskPopulation !== 'modhigh';
  const recurrent = o.episode === 'recurrent';

  const major = [];
  const minor = [];

  if (on(o.carditis)) major.push('carditis (clinical and/or subclinical)');
  if (on(o.chorea)) major.push('Sydenham chorea');
  if (on(o.erythemaMarginatum)) major.push('erythema marginatum');
  if (on(o.subcutaneousNodules)) major.push('subcutaneous nodules');
  if (on(o.polyarthritis)) major.push('polyarthritis');
  // Joint manifestations that depend on the risk tier.
  if (!low && on(o.monoarthritis)) major.push('monoarthritis');
  if (on(o.polyarthralgia)) {
    if (low) minor.push('polyarthralgia');
    else major.push('polyarthralgia');
  }
  if (!low && on(o.monoarthralgia)) minor.push('monoarthralgia');

  // Minor criteria (both tiers). Thresholds differ by tier but are clinician-judged
  // (the labels carry them); the compute counts the checked criterion.
  if (on(o.fever)) minor.push(low ? 'fever >= 38.5 C' : 'fever >= 38 C');
  if (on(o.elevatedAcuteReactants)) minor.push(low ? 'ESR >= 60 mm/h and/or CRP >= 3 mg/dL' : 'ESR >= 30 mm/h and/or CRP >= 3 mg/dL');
  // Prolonged PR counts as a minor criterion only when carditis is absent.
  if (on(o.prolongedPr) && !on(o.carditis)) minor.push('prolonged PR interval');

  const majors = major.length;
  const minors = minor.length;

  // Chorea (and indolent carditis) may present as the sole manifestation; isolated
  // chorea is diagnostic on its own and does not require GAS evidence.
  const choreaAlone = on(o.chorea) && majors === 1 && minors === 0;

  const baseMet = majors >= 2 || (majors >= 1 && minors >= 2);
  const countMet = recurrent ? (baseMet || minors >= 3) : baseMet;

  let category, met, band;
  const episodeWord = recurrent ? 'recurrent' : 'initial';
  if (choreaAlone) {
    category = 'met';
    met = true;
    band = 'Meets the 2015 Jones criteria for acute rheumatic fever — isolated Sydenham chorea is sufficient on its own (no other manifestation or group A strep evidence required).';
  } else if (countMet && on(o.gasEvidence)) {
    category = 'met';
    met = true;
    band = `Meets the 2015 Jones criteria for ${episodeWord} acute rheumatic fever — ${majors} major and ${minors} minor manifestation${minors === 1 ? '' : 's'} with evidence of preceding group A strep.`;
  } else if (countMet && !on(o.gasEvidence)) {
    category = 'needs-gas';
    met = false;
    band = `Manifestation count met (${majors} major, ${minors} minor), but a diagnosis requires evidence of preceding group A strep (except isolated chorea). Not met until that is documented.`;
  } else {
    category = 'not met';
    met = false;
    band = `Does not meet the 2015 Jones criteria for ${episodeWord} acute rheumatic fever — ${majors} major and ${minors} minor manifestation${minors === 1 ? '' : 's'} (need 2 major, or 1 major + 2 minor${recurrent ? ', or 3 minor' : ''}).`;
  }

  const label = met ? 'Meets Jones criteria' : category === 'needs-gas' ? 'Count met; needs group A strep evidence' : 'Does not meet Jones criteria';

  return {
    valid: true,
    category,
    met,
    majors,
    minors,
    major,
    minor,
    riskPopulation: low ? 'low' : 'modhigh',
    episode: episodeWord,
    abnormal: met,
    bandLabel: label,
    band,
    note: NOTE,
  };
}
