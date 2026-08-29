// spec-v855: the ICSD-3 criteria for narcolepsy, type 1 and type 2.
//
// Source:
//   American Academy of Sleep Medicine. International Classification of Sleep Disorders.
//   3rd ed. Darien, IL: AASM; 2014.
//
//   Both types: daily irrepressible sleep or lapses into sleep for at least 3 months.
//
//   TYPE 1, one of:
//     cataplexy AND a mean sleep latency <= 8 min with >= 2 sleep-onset REM periods
//     CSF hypocretin-1 <= 110 pg/mL (or below a third of the normal mean)
//
//   TYPE 2, all of: the latency findings above, NO cataplexy, hypocretin unmeasured or above
//   110 pg/mL, and the picture not better explained by something else.
//
//   A sleep-onset REM period on the PRECEDING OVERNIGHT STUDY may replace one of the two on
//   the latency test.
//
// CATAPLEXY ALONE IS NOT THE DIAGNOSIS, AND THAT IS THE FIRST REASON FOR THIS TILE. The old
// classification named the disease "narcolepsy with cataplexy" and the habit survived the
// rename. Here cataplexy is HALF of one route: it has to be paired with the latency-test
// findings, or replaced entirely by a low hypocretin.
//
// THE OVERNIGHT STUDY CAN SUPPLY ONE OF THE TWO REM PERIODS. A latency test with one reads as
// negative and gets filed as such when a REM period the night before completes the pair.
//
// A LOW HYPOCRETIN IS TYPE 1 EVEN WITH NO CATAPLEXY. The deficiency is the disease; cataplexy
// is a consequence not every patient has.
//
// THE SAME LATENCY TEST COMES BACK POSITIVE ON TOO LITTLE SLEEP. Insufficient sleep, untreated
// obstructive apnea, a delayed sleep phase and medication or its withdrawal all produce a short
// latency with sleep-onset REM periods, and type 2 carries an explicit exclusion for that.
//
// Pure: no DOM, no clock, no network.

export const NARCOLEPSY_NOTE = 'The narcolepsy criteria of the third International Classification of Sleep Disorders (American Academy of Sleep Medicine, 2014) start from the same requirement for both types: daily irrepressible sleep or lapses into sleep for at least three months. Type 1 is then met by either cataplexy together with a mean sleep latency of 8 minutes or less and two or more sleep-onset REM periods on the latency test, or by a cerebrospinal fluid hypocretin-1 of 110 pg/mL or less, which settles the type on its own. Type 2 needs those same latency findings with no cataplexy, a hypocretin that was not measured or came back above 110 pg/mL, and a picture not better explained by something else. A sleep-onset REM period on the overnight study the night before may replace one of the two on the latency test. Three things about this are commonly read backwards. Cataplexy on its own is not the diagnosis, even though the older classification named the disease after it; here it is half of one route and has to be paired with the latency findings or replaced by the hypocretin result. A latency test showing only one sleep-onset REM period is not necessarily negative, because the overnight study may supply the other. And a low hypocretin makes it type 1 whether or not there is cataplexy, because the deficiency is the disease and cataplexy is a consequence not every patient has. The exclusion in type 2 is there because insufficient sleep, untreated obstructive apnea, a delayed sleep phase and medication or its withdrawal all produce the same short latency with sleep-onset REM periods. It applies a published classification to results already obtained. It does not order a study and it does not select treatment.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const LATENCY_MAX = 8;
const SOREMP_MIN = 2;
const HYPOCRETIN_MAX = 110;

export function narcolepsyCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const sleepiness = truthy(o.dailySleepiness);
  const cataplexy = truthy(o.cataplexy);
  const latency = num(o.meanSleepLatency);
  const soremps = num(o.msltSoremps);
  const psgSoremp = truthy(o.psgSoremp);
  const hypocretin = num(o.hypocretin);
  const othersExcluded = truthy(o.othersExcluded);

  if (latency !== null && (latency < 0 || latency > 20)) {
    return { valid: false, message: 'The mean sleep latency is outside a plausible range of 0 to 20 minutes.' };
  }
  if (soremps !== null && (soremps < 0 || soremps > 5 || !Number.isInteger(soremps))) {
    return { valid: false, message: 'The number of sleep-onset REM periods on the latency test has to be a whole number from 0 to 5.' };
  }
  if (hypocretin !== null && (hypocretin < 0 || hypocretin > 2000)) {
    return { valid: false, message: 'The hypocretin-1 concentration is outside a plausible range of 0 to 2000 pg/mL.' };
  }
  if (!sleepiness && latency === null && hypocretin === null && !cataplexy) {
    return { valid: false, message: 'Record the daily sleepiness, or enter the latency-test results or the hypocretin concentration.' };
  }

  const effectiveSoremps = (soremps === null ? 0 : soremps) + (psgSoremp ? 1 : 0);
  const latencyTested = latency !== null || soremps !== null;
  const latencyPositive = latency !== null && latency <= LATENCY_MAX && effectiveSoremps >= SOREMP_MIN;
  const hypocretinLow = hypocretin !== null && hypocretin <= HYPOCRETIN_MAX;

  const type1 = sleepiness && (hypocretinLow || (cataplexy && latencyPositive));
  const type2 = sleepiness && !type1 && latencyPositive && !cataplexy && !hypocretinLow && othersExcluded;

  let state;
  let route = null;
  let missing = null;
  if (type1) {
    state = 'type 1';
    route = hypocretinLow
      ? `a hypocretin-1 of ${hypocretin} pg/mL, at or below the 110 pg/mL line, which settles the type on its own`
      : 'cataplexy together with a positive latency test';
  } else if (type2) {
    state = 'type 2';
    route = 'a positive latency test without cataplexy, with the hypocretin above the line or unmeasured and other causes excluded';
  } else {
    state = 'the criteria are not met';
    if (!sleepiness) {
      missing = 'Daily irrepressible sleep or lapses into sleep for at least three months is required for both types, and it is not recorded.';
    } else if (cataplexy && !latencyPositive && hypocretin === null) {
      missing = 'Cataplexy is recorded but it is only half of one route. It has to be paired with a mean latency of 8 minutes or less and two or more sleep-onset REM periods, or replaced by a hypocretin result. Neither is here.';
    } else if (!latencyTested && hypocretin === null) {
      missing = 'Neither the latency test nor the hypocretin concentration is recorded, and one of them is needed for either type.';
    } else if (!latencyPositive && !hypocretinLow) {
      missing = `The latency findings do not meet the threshold: a mean latency of 8 minutes or less AND two or more sleep-onset REM periods.${latency !== null && soremps !== null ? ` This study has a mean latency of ${latency} minutes and ${effectiveSoremps} sleep-onset REM period${effectiveSoremps === 1 ? '' : 's'} counted.` : ''}`;
    } else if (latencyPositive && !cataplexy && !othersExcluded) {
      missing = 'The latency findings are met without cataplexy, which is the type 2 route, but type 2 also requires that insufficient sleep, obstructive sleep apnea, a delayed sleep phase and medication or its withdrawal have been excluded. That is not recorded.';
    } else {
      missing = 'The recorded findings do not complete either route.';
    }
  }

  // The error this tile exists to prevent: cataplexy read as the diagnosis.
  const cataplexyNote = cataplexy && !hypocretinLow
    ? 'Cataplexy on its own does not meet these criteria. The older classification named the disease after it, but here it is half of one route: it has to be paired with a mean latency of 8 minutes or less and two or more sleep-onset REM periods, or replaced by a hypocretin at or below 110 pg/mL.'
    : null;

  const substitutionNote = psgSoremp && soremps !== null
    ? `${soremps} sleep-onset REM period${soremps === 1 ? '' : 's'} on the latency test plus one on the overnight study the night before counts as ${effectiveSoremps}.${soremps < SOREMP_MIN && effectiveSoremps >= SOREMP_MIN ? ' The substitution is what makes this test positive; read on the latency test alone it would have been filed as negative.' : ''}`
    : null;

  const missedSubstitutionNote = !psgSoremp && soremps === 1 && latency !== null && latency <= LATENCY_MAX
    ? 'One sleep-onset REM period on the latency test with a latency at or under 8 minutes is one short. A sleep-onset REM period on the overnight study the night before may supply the other, so that study is worth checking before this is filed as negative.'
    : null;

  const hypocretinNote = hypocretinLow && !cataplexy
    ? `A hypocretin-1 of ${hypocretin} pg/mL is type 1 even with no cataplexy. The deficiency is the disease; cataplexy is a consequence not every patient has.`
    : null;

  const exclusionNote = (type2 || (latencyPositive && !cataplexy))
    ? 'Insufficient sleep, untreated obstructive apnea, a delayed sleep phase, and medication or its withdrawal all produce a short latency with sleep-onset REM periods. That is what the exclusion in type 2 is for.'
    : null;

  const scopeNote = 'This applies a published classification to results already obtained. It does not order a study and it does not select treatment.';

  return {
    valid: true,
    type: type1 ? 1 : (type2 ? 2 : null),
    criteriaMet: type1 || type2,
    dailySleepiness: sleepiness,
    cataplexy,
    meanSleepLatency: latency,
    msltSoremps: soremps,
    effectiveSoremps,
    latencyPositive,
    hypocretinLow,
    state,
    route,
    missing,
    cataplexyNote,
    substitutionNote,
    missedSubstitutionNote,
    hypocretinNote,
    exclusionNote,
    scopeNote,
    abnormal: type1 || type2,
    bandLabel: type1 ? 'Type 1' : (type2 ? 'Type 2' : 'Criteria not met'),
    band: type1 || type2
      ? `Narcolepsy ${state} — met by ${route}.`
      : `Narcolepsy criteria — ${state}.`,
    detail: 'Both types need daily irrepressible sleep or lapses into sleep for at least three months. Type 1 is met by cataplexy with a mean sleep latency of 8 minutes or less and two or more sleep-onset REM periods, or by a hypocretin-1 of 110 pg/mL or less on its own. Type 2 needs the same latency findings without cataplexy, with the hypocretin unmeasured or above the line and other causes excluded. A sleep-onset REM period on the preceding overnight study may replace one on the latency test.',
    note: NARCOLEPSY_NOTE,
  };
}
