// spec-v62 §2 A1: serial / trend primitive. The bedside fact a single value
// rarely carries is the *rate of change* — the lactate clearance, the sodium
// correction rate against its 24-hour ceiling, the creatinine delta that moves
// a KDIGO stage, the early-warning-score trend. This module is the pure,
// num.js-backed core those trend affordances share. Wave 1 seeds it with the
// sodium-correction rate (the one tile that is itself a correction-rate
// planner); later waves add the other named derived quantities.
//
// Contract (spec-v59 / spec-v53): every field is validated through num()
// (lib/num.js), so a missing/non-finite/out-of-range value throws a
// TypeError/RangeError (caught by the renderer safe() wrapper) rather than
// producing NaN/Infinity. The time interval is the denominator and is rejected
// at or below zero, so no signed-infinity rate can leak.

import { num, r1, r2 } from './num.js';

// trend — the base serial delta. Given a prior and current value and the hours
// between them, returns the observed change, the per-hour rate, and a labeled
// direction (rising / falling / unchanged). The generic core behind the
// early-warning-score trend, the hemoglobin-drop rate, and any other "compare
// it to the last one" affordance. The interval is the denominator and is
// rejected at/below zero, so no signed-infinity rate can leak.
export function trend({ prior, current, hours }) {
  num('prior', prior, { min: -1e9, max: 1e9 });
  num('current', current, { min: -1e9, max: 1e9 });
  num('hours', hours, { min: 0.001, max: 100000 });
  const delta = current - prior;
  return {
    delta: r2(delta),
    ratePerHour: r2(delta / hours),
    direction: delta > 0 ? 'rising' : (delta < 0 ? 'falling' : 'unchanged'),
  };
}

// correctionRate — given a prior and current value of a quantity that is
// corrected over time (serum Na, glucose, etc.), the time elapsed, and the
// published safe per-24h correction ceiling, returns the observed delta, the
// per-hour rate, the rate projected to 24 hours, and whether that projection
// exceeds the ceiling in magnitude (over-rapid correction in either direction).
// Direction-agnostic: the ceiling is compared against the absolute projected
// change, so it flags both over-rapid rise and over-rapid fall.
export function correctionRate({ prior, current, hours, ceilingPer24h }) {
  num('prior', prior, { min: -1e9, max: 1e9 });
  num('current', current, { min: -1e9, max: 1e9 });
  num('hours', hours, { min: 0.001, max: 100000 });
  num('ceilingPer24h', ceilingPer24h, { min: 0.0001, max: 1e9 });
  const delta = current - prior;
  const ratePerHour = delta / hours;
  const projectedPer24h = ratePerHour * 24;
  return {
    delta: r2(delta),
    ratePerHour: r2(ratePerHour),
    projectedPer24h: r1(projectedPer24h),
    exceedsCeiling: Math.abs(projectedPer24h) > ceilingPer24h,
  };
}
