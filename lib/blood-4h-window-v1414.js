// spec-v1414: the 4-hour window for a blood component, and the rate that finishes inside it.
//
// Source, read 2026-09-24: AABB, American Red Cross, America's Blood Centers, and the Armed Services
// Blood Program. Circular of Information for the Use of Human Blood and Blood Components (2024
// edition; FDA recognizes it as an extension of the container label). "Instructions for Use":
//   10. "the rate of infusion should initially be slow" -- no number is given.
//   13. "Transfusion of blood or blood components should start before expiration and finish within
//       4 hours after entering the container."
// Red Blood Cells: "If the anticipated infusion rate must be so slow that the entire unit cannot be
// infused within 4 hours, it is appropriate to order smaller aliquots for transfusion."
//
// Arithmetic only: the window is 240 minutes from the moment the container is entered (spiked).
// Pure: no DOM, no clock, no network.

const WINDOW_MIN = 240;

function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}
function num(v) {
  if (isBlank(v)) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : NaN;
}
function hm(min) {
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} min`;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}

export function blood4hWindow(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vol = num(o.volumeMl);
  const rate = num(o.rateMlHr);
  const elapsedIn = num(o.elapsedMin);

  if (vol === null) return { valid: false, message: 'Enter the volume left in the bag (mL).' };
  if (Number.isNaN(vol) || vol <= 0) return { valid: false, message: 'The volume left in the bag must be greater than 0 mL.' };
  if (Number.isNaN(rate) || (rate !== null && rate <= 0)) {
    return { valid: false, message: 'The pump rate must be greater than 0 mL/h, or leave it blank for the rate that finishes in time.' };
  }
  if (Number.isNaN(elapsedIn) || (elapsedIn !== null && elapsedIn < 0)) {
    return { valid: false, message: 'The minutes since the bag was spiked cannot be negative; leave it blank for a bag not yet spiked.' };
  }
  const elapsed = elapsedIn === null ? 0 : elapsedIn;
  const started = elapsedIn !== null && elapsedIn > 0;

  if (elapsed >= WINDOW_MIN) {
    return {
      valid: true,
      abnormal: true,
      pastWindow: true,
      minutesLeft: 0,
      minRateMlHr: null,
      band: `Past the 4-hour window: the bag was entered ${hm(elapsed)} ago, and the Circular of Information says a component should finish within 4 hours of entering the container. Ask the transfusion service before running any more of it.`,
      bandLabel: 'Past 4 hours',
      steps: [],
      note: NOTE,
    };
  }

  const left = WINDOW_MIN - elapsed;
  const minRate = Math.ceil((vol / left) * 60);
  const need = rate === null ? null : (vol / rate) * 60;
  if (!Number.isFinite(minRate) || (need !== null && !Number.isFinite(need))) {
    return { valid: false, message: 'Check the volume and the rate: together they give no time a pump could run.' };
  }
  const steps = [];
  let band;
  let abnormal = false;
  let finishes = null;

  if (rate === null) {
    band = `At least ${minRate} mL/h to run ${vol} mL in the ${hm(left)} left of the 4-hour window.`;
  } else {
    finishes = need <= left;
    if (finishes) {
      band = `Finishes in time: ${vol} mL at ${rate} mL/h takes ${hm(need)}, ending ${hm(left - need)} before the 4-hour limit.`;
    } else {
      abnormal = true;
      band = `Will not finish in time: ${vol} mL at ${rate} mL/h takes ${hm(need)}, ${hm(need - left)} past the 4-hour limit. It needs at least ${minRate} mL/h.`;
      steps.push('If the patient cannot take the rate that finishes in time, the Circular says to order smaller aliquots rather than let the unit run past 4 hours.');
    }
  }
  if (!started) {
    steps.push('The clock starts when the bag is entered (spiked). Start slowly and watch closely at first: the Circular calls for a slow initial rate and gives no number, so the first-minutes rate is your facility\'s policy.');
  }

  return {
    valid: true,
    abnormal,
    pastWindow: false,
    minutesLeft: Math.round(left),
    minRateMlHr: minRate,
    finishesInTime: finishes,
    band,
    bandLabel: rate === null ? `${minRate} mL/h or faster` : (finishes ? 'Finishes within 4 hours' : `Needs ${minRate} mL/h or faster`),
    steps,
    note: NOTE,
  };
}

const NOTE = 'AABB, American Red Cross, America\'s Blood Centers, and Armed Services Blood Program, Circular of Information for the Use of Human Blood and Blood Components (2024): a component should finish within 4 hours after the container is entered. '
  + 'The minimum rate is the volume left divided by the time left, rounded up; it says nothing about whether the patient\'s circulation tolerates that rate, which is a clinical judgment.';
