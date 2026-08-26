// spec-v791: HRS 2014 criteria for the diagnosis of cardiac sarcoidosis.
//
// Source:
//   Birnie DH, Sauer WH, Bogun F, et al. HRS expert consensus statement on the diagnosis
//   and management of arrhythmias associated with cardiac sarcoidosis. Heart Rhythm.
//   2014;11(7):1305-1323. (PMID 24819193.)
//
// Two independent pathways, and they are NOT cumulative - one is enough on its own:
//
//   Histological (definite)
//     an endomyocardial biopsy showing non-caseating granuloma with no alternative cause
//
//   Clinical (probable) - ALL THREE are required:
//     (a) a histological diagnosis of EXTRACARDIAC sarcoidosis
//     (b) one or more qualifying cardiac manifestations
//     (c) other causes for those manifestations reasonably excluded
//
// The qualifying cardiac manifestations:
//     cardiomyopathy or heart block responsive to steroid or immunosuppressant
//     unexplained reduced left ventricular ejection fraction, 40% or less
//     unexplained sustained ventricular tachycardia, spontaneous or induced
//     Mobitz type II second-degree or third-degree heart block
//     patchy uptake on dedicated cardiac FDG-PET consistent with sarcoidosis
//     late gadolinium enhancement on cardiac MRI consistent with sarcoidosis
//     gallium uptake consistent with sarcoidosis
//
// Some renderings group the ventricular tachycardia and the heart-block items into a single
// criterion; either way one of them alone satisfies (b), so the grouping does not change any
// answer this returns.
//
// Pure: no DOM, no clock, no network.

export const CARDIAC_SARCOID_NOTE = 'The HRS 2014 criteria (Birnie DH, Sauer WH, Bogun F, et al, Heart Rhythm 2014;11(7):1305-1323) diagnose cardiac sarcoidosis by either of two independent routes. The histological route needs only one thing: an endomyocardial biopsy showing non-caseating granuloma with no alternative cause, which is a definite diagnosis on its own. The clinical route needs all three of a histological diagnosis of sarcoidosis somewhere outside the heart, at least one qualifying cardiac finding, and the reasonable exclusion of other causes for that finding, and it yields a probable diagnosis. The qualifying cardiac findings are a cardiomyopathy or heart block that responds to steroid or immunosuppressant, an unexplained ejection fraction of 40 percent or less, unexplained sustained ventricular tachycardia, Mobitz type II or third-degree heart block, patchy uptake on cardiac FDG-PET, late gadolinium enhancement on cardiac MRI, or gallium uptake, each in a pattern consistent with sarcoidosis. Failing to meet the criteria does not exclude the disease, because endomyocardial biopsy misses patchy involvement often, and this decides nothing about immunosuppression or a defibrillator.';

const CARDIAC_FINDINGS = [
  { arg: 'steroidResponsive', text: 'steroid or immunosuppressant-responsive cardiomyopathy or heart block' },
  { arg: 'lowEf', text: 'unexplained left ventricular ejection fraction 40% or less' },
  { arg: 'sustainedVt', text: 'unexplained sustained ventricular tachycardia' },
  { arg: 'heartBlock', text: 'Mobitz type II or third-degree heart block' },
  { arg: 'petUptake', text: 'patchy uptake on cardiac FDG-PET' },
  { arg: 'cmrLge', text: 'late gadolinium enhancement on cardiac MRI' },
  { arg: 'galliumUptake', text: 'gallium uptake consistent with sarcoidosis' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function cardiacSarcoidosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const biopsy = truthy(o.myocardialGranuloma);
  const extracardiac = truthy(o.extracardiacSarcoid);
  const excluded = truthy(o.otherCausesExcluded);
  const findings = CARDIAC_FINDINGS.filter((f) => truthy(o[f.arg])).map((f) => f.text);

  const missing = [];
  let tier;
  let label;
  if (biopsy) {
    tier = 'definite';
    label = 'definite cardiac sarcoidosis by the histological pathway';
  } else {
    if (!extracardiac) missing.push('a histological diagnosis of extracardiac sarcoidosis');
    if (findings.length === 0) missing.push('at least one qualifying cardiac finding');
    if (!excluded) missing.push('reasonable exclusion of other causes');
    if (missing.length === 0) {
      tier = 'probable';
      label = 'probable cardiac sarcoidosis by the clinical pathway';
    } else {
      tier = 'not-met';
      label = `criteria not met — still needed: ${missing.join('; ')}`;
    }
  }

  return {
    valid: true,
    tier,
    pathway: biopsy ? 'histological' : 'clinical',
    cardiacFindings: findings,
    missing,
    abnormal: tier !== 'not-met',
    bandLabel: tier === 'definite' ? 'Cardiac sarcoidosis: definite' : tier === 'probable' ? 'Cardiac sarcoidosis: probable' : 'Cardiac sarcoidosis: criteria not met',
    band: `HRS 2014 — ${label}.`,
    detail: 'Two independent pathways. Histological: an endomyocardial biopsy showing non-caseating granuloma with no alternative cause is definite on its own. Clinical: a histological diagnosis of extracardiac sarcoidosis AND one or more qualifying cardiac findings AND reasonable exclusion of other causes gives a probable diagnosis. All three parts of the clinical pathway are required; a cardiac finding alone is not enough.',
    note: CARDIAC_SARCOID_NOTE,
  };
}
