// spec-v885: the revised NIOSH lifting equation.
//
// Source:
//   Waters TR, Putz-Anderson V, Garg A, Fine LJ. Revised NIOSH equation for the design and
//   evaluation of manual lifting tasks. Ergonomics. 1993;36(7):749-776.
//   Waters TR, Putz-Anderson V, Garg A. Applications Manual for the Revised NIOSH Lifting
//   Equation. DHHS (NIOSH) Publication No. 94-110; 1994.
//
//   RWL = LC x HM x VM x DM x AM x FM x CM, where the load constant LC is 51 lb.
//     HM = 10 / H          horizontal distance H in inches, 10 to 25
//     VM = 1 - 0.0075 x |V - 30|    vertical height V at the origin, 0 to 70 inches
//     DM = 0.82 + 1.8 / D  vertical travel distance D in inches, 10 to 70
//     AM = 1 - 0.0032 x A  asymmetry angle A in degrees, 0 to 135
//     FM                   from the published frequency table
//     CM                   from the published coupling table
//
//   Lifting index LI = load weight / RWL.
//
// THE LIFTING INDEX IS A DESIGN NUMBER, NOT A PREDICTION ABOUT A PERSON, AND THAT IS WHY THIS
// TILE EXISTS. An index above 1.0 says the task exceeds what the equation recommends for most
// healthy workers. It does not say that this worker will be injured, and an index at or below 1.0
// does not say that nobody will be.
//
// EVERY MULTIPLIER HAS A DOMAIN, AND OUTSIDE IT THE EQUATION DOES NOT APPLY. A horizontal
// distance above 25 inches, a vertical height above 70, or an asymmetry angle above 135 degrees
// each set their multiplier to zero, which makes the recommended weight limit zero. That is the
// equation saying the task is outside what it can evaluate, not that the safe weight is nothing.
//
// IT COVERS TWO-HANDED, SMOOTH, UNHURRIED LIFTS ONLY. Carrying, pushing, pulling, one-handed
// lifts, lifting while seated or kneeling, lifting in a constrained space, unstable loads, poor
// footing, and hot or humid conditions are all outside it, and the equation gives no warning of
// its own when they apply.
//
// Pure: no DOM, no clock, no network.

export const NIOSH_NOTE = 'The revised NIOSH lifting equation (Waters and colleagues, Ergonomics, 1993) multiplies a load constant of 51 pounds by six task multipliers to give a recommended weight limit, and divides the actual load by that limit to give a lifting index. The multipliers come from the horizontal distance from the ankles to the hands, the vertical height of the hands at the start of the lift, the vertical travel distance, the asymmetry angle of the trunk, the lifting frequency and duration, and the quality of the hand-to-object coupling. Three things about it are worth stating plainly. The lifting index is a design number rather than a prediction about a person: an index above 1.0 says the task exceeds what the equation recommends for most healthy workers, not that this worker will be injured, and an index at or below 1.0 does not say that nobody will be. Every multiplier has a domain and outside it the equation does not apply: a horizontal distance above 25 inches, a vertical height above 70 inches, or an asymmetry angle above 135 degrees each drive their multiplier to zero and the recommended weight limit with it, which is the equation saying the task is outside what it can evaluate rather than that the safe weight is nothing. And it covers two-handed, smooth, unhurried lifts only, so carrying, pushing, pulling, one-handed lifts, lifting while seated or kneeling, lifting in a constrained space, unstable loads, poor footing and hot or humid conditions are all outside it, and the equation gives no warning of its own when they apply. It computes a published equation from measurements already taken. It does not decide whether a task is safe for a particular person.';

export const LOAD_CONSTANT_LB = 51;
export const H_MIN = 10;
export const H_MAX = 25;
export const V_MAX = 70;
export const D_MIN = 10;
export const D_MAX = 70;
export const A_MAX = 135;

// The published coupling multipliers. The good/fair split depends on the vertical height, which
// is why fair is two values rather than one.
export const COUPLINGS = [
  { value: 'good', text: 'Good: a handle, or a comfortable full-hand grip' },
  { value: 'fair', text: 'Fair: a poor handle, or a grip requiring a flexed wrist' },
  { value: 'poor', text: 'Poor: no handle, an irregular or unstable load' },
];

// Frequency multipliers from the published table, by lifts per minute, work duration and the
// vertical band the table splits on. Positions are 0.2, 0.5, then 1 through 15 lifts per minute,
// so an integer rate L sits at index L + 1. The two vertical bands are identical up to 8 lifts
// per minute and diverge above it, which is the part of the table most often flattened.
const FREQUENCY_TABLE = {
  short: {
    under30: [1.00, 0.97, 0.94, 0.91, 0.88, 0.84, 0.80, 0.75, 0.70, 0.60, 0.52, 0.45, 0.41, 0.37, 0.00, 0.00, 0.00],
    over30: [1.00, 0.97, 0.94, 0.91, 0.88, 0.84, 0.80, 0.75, 0.70, 0.60, 0.52, 0.45, 0.41, 0.37, 0.34, 0.31, 0.28],
  },
  moderate: {
    under30: [0.95, 0.92, 0.88, 0.84, 0.79, 0.72, 0.60, 0.50, 0.42, 0.35, 0.30, 0.26, 0.00, 0.00, 0.00, 0.00, 0.00],
    over30: [0.95, 0.92, 0.88, 0.84, 0.79, 0.72, 0.60, 0.50, 0.42, 0.35, 0.30, 0.26, 0.23, 0.21, 0.00, 0.00, 0.00],
  },
  long: {
    under30: [0.85, 0.81, 0.75, 0.65, 0.55, 0.45, 0.35, 0.27, 0.22, 0.18, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
    over30: [0.85, 0.81, 0.75, 0.65, 0.55, 0.45, 0.35, 0.27, 0.22, 0.18, 0.15, 0.13, 0.00, 0.00, 0.00, 0.00, 0.00],
  },
};

export const DURATIONS = [
  { value: 'short', text: 'One hour or less' },
  { value: 'moderate', text: 'More than one hour, up to two' },
  { value: 'long', text: 'More than two hours, up to eight' },
];

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);
const round2 = (n) => Math.round(n * 100) / 100;

export function frequencyMultiplier(liftsPerMinute, duration, verticalInches) {
  const row = FREQUENCY_TABLE[duration] || FREQUENCY_TABLE.short;
  const band = verticalInches !== null && verticalInches >= 30 ? row.over30 : row.under30;
  if (liftsPerMinute <= 0.2) return band[0];
  if (liftsPerMinute <= 0.5) return band[1];
  const idx = Math.ceil(liftsPerMinute) + 1;
  // Beyond 15 lifts per minute the published table ends, and the multiplier is zero.
  return idx > band.length - 1 ? 0 : band[idx];
}

export function couplingMultiplier(coupling, verticalInches) {
  if (coupling === 'good') return 1.00;
  if (coupling === 'fair') return verticalInches !== null && verticalInches >= 30 ? 1.00 : 0.95;
  return verticalInches !== null && verticalInches >= 30 ? 0.90 : 0.90;
}

export function nioshLifting(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const load = num(o.loadWeightLb);
  const h = num(o.horizontalInches);
  const v = num(o.verticalInches);
  const d = num(o.travelInches);
  const a = num(o.asymmetryDegrees);
  const f = num(o.liftsPerMinute);
  const duration = oneOf(DURATIONS, o.duration, 'short');
  const coupling = oneOf(COUPLINGS, o.coupling, 'good');

  for (const [label, value, lo, hi] of [
    ['load weight in pounds', load, 0, 500],
    ['horizontal distance in inches', h, 0, 100],
    ['vertical height in inches', v, 0, 100],
    ['vertical travel distance in inches', d, 0, 100],
    ['asymmetry angle in degrees', a, 0, 180],
    ['lifts per minute', f, 0, 20],
  ]) {
    if (value !== null && (value < lo || value > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }

  if (load === null || h === null || v === null || d === null) {
    return { valid: false, message: 'Enter the load weight, the horizontal distance, the vertical height at the start of the lift, and the vertical travel distance.' };
  }

  // The published rules for the edges of each multiplier's domain.
  const outOfRange = [];
  const hm = h > H_MAX ? (outOfRange.push(`a horizontal distance of ${h} inches, beyond the ${H_MAX} inch limit`), 0)
    : h < H_MIN ? 1.00
      : round2(H_MIN / h);
  const vm = v > V_MAX ? (outOfRange.push(`a vertical height of ${v} inches, beyond the ${V_MAX} inch limit`), 0)
    : round2(1 - 0.0075 * Math.abs(v - 30));
  const dm = d > D_MAX ? (outOfRange.push(`a travel distance of ${d} inches, beyond the ${D_MAX} inch limit`), 0)
    : d < D_MIN ? 1.00
      : round2(0.82 + 1.8 / d);
  const angle = a === null ? 0 : a;
  const am = angle > A_MAX ? (outOfRange.push(`an asymmetry angle of ${angle} degrees, beyond the ${A_MAX} degree limit`), 0)
    : round2(1 - 0.0032 * angle);
  const fm = f === null ? 1.00 : frequencyMultiplier(f, duration, v);
  const cm = couplingMultiplier(coupling, v);

  const rwl = round2(LOAD_CONSTANT_LB * hm * vm * dm * am * fm * cm);
  const li = rwl > 0 ? round2(load / rwl) : null;

  const indexBand = li === null
    ? 'not-evaluable'
    : li <= 1
      ? 'within'
      : li <= 3
        ? 'above'
        : 'well-above';

  const action = {
    'not-evaluable': `The recommended weight limit computes to 0 lb because ${outOfRange.length ? outOfRange.join(', and ') : 'a multiplier is zero'}. That is the equation saying this task is outside what it can evaluate, not that the safe weight is nothing.`,
    within: `Recommended weight limit ${rwl} lb, lifting index ${li}. At or below 1.0, which is the range the equation is designed around.`,
    above: `Recommended weight limit ${rwl} lb, lifting index ${li}. Above 1.0, so the task exceeds what the equation recommends for most healthy workers.`,
    'well-above': `Recommended weight limit ${rwl} lb, lifting index ${li}. Well above 1.0; the equation's authors describe indices in this range as unacceptable for most workers.`,
  }[indexBand];

  // The reason the tile exists, on every result.
  const designNumberNote = 'The lifting index is a design number, not a prediction about a person. Above 1.0 says the task exceeds what the equation recommends for most healthy workers; it does not say this worker will be injured, and at or below 1.0 does not say that nobody will be.';

  const domainNote = outOfRange.length
    ? 'A multiplier at its domain limit is set to zero by the published rules, which drives the whole limit to zero. Redesign the task until it is inside the equation, or evaluate it another way.'
    : null;

  const scopeOfEquationNote = 'It covers two-handed, smooth, unhurried lifts. Carrying, pushing, pulling, one-handed lifts, lifting while seated or kneeling, lifting in a constrained space, unstable loads, poor footing and hot or humid conditions are all outside it, and the equation gives no warning of its own when they apply.';

  const multiplierNote = `Multipliers: horizontal ${hm}, vertical ${vm}, distance ${dm}, asymmetry ${am}, frequency ${fm}, coupling ${cm}, on a load constant of ${LOAD_CONSTANT_LB} lb.`;

  const scopeNote = 'This computes a published equation from measurements already taken. It does not decide whether a task is safe for a particular person.';

  return {
    valid: true,
    rwl,
    li,
    indexBand,
    multipliers: { hm, vm, dm, am, fm, cm },
    outOfRange,
    action,
    multiplierNote,
    designNumberNote,
    domainNote,
    scopeOfEquationNote,
    scopeNote,
    abnormal: indexBand === 'above' || indexBand === 'well-above' || indexBand === 'not-evaluable',
    bandLabel: li === null ? 'Outside the equation' : `Lifting index ${li}`,
    band: action,
    detail: `The recommended weight limit is ${LOAD_CONSTANT_LB} lb multiplied by six task multipliers: horizontal distance, vertical height at the start, vertical travel distance, asymmetry angle, lifting frequency and duration, and hand-to-object coupling. The lifting index is the load divided by that limit.`,
    note: NIOSH_NOTE,
  };
}
