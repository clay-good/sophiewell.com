// spec-v517: the Premature Infant Pain Profile (PIPP), the seven-indicator procedural pain score for preterm
// and term newborns. Companion gap in the neonatal pain cluster: the catalog already carries NIPS, CRIES,
// N-PASS, FLACC, and COMFORT-B, but "pipp" and "premature infant pain" were zero-hit across the corpus and
// app.js - and PIPP is the one that adjusts for the two things that make a preterm look calm when they are
// not: gestational age and behavioral state.
//
// Seven indicators, each 0-3, total 0-21:
//   contextual  - gestational age, behavioral state (scored BEFORE the procedure)
//   physiologic - maximum heart-rate rise, minimum oxygen-saturation fall (from the 30-second baseline)
//   facial      - brow bulge, eye squeeze, nasolabial furrow (percent of the observation period)
//
// The contextual pair is the point of the instrument: a 26-week infant in quiet sleep starts at 5 before any
// facial or physiologic change, because that infant mounts a smaller response to the same pain.
//
// HIGH-STAKES: this sums an observer's own ratings around one procedure. It is NOT a diagnosis, NOT a measure
// of pain at rest or of ongoing or postoperative pain, and NOT a drug or dose recommendation (spec-v11
// section 5.3). A low score does not mean the procedure did not hurt: a sick, sedated, paralyzed, or
// exhausted infant may not mount the facial or physiologic response the score is built on. Treat the
// procedure, not only the number. The analgesia decision stays with the neonatal team.
//
// INDICATORS AND CUT POINTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Stevens B, Johnston C, Petryshen P, Taddio A. Premature Infant Pain Profile: development and initial
//     validation. Clin J Pain. 1996;12(1):13-22.
//   - Neonatal pain references reproducing the same seven indicators, the same 0-3 per-indicator scale, the
//     same gestational-age and behavioral-state bands, and the same 0-21 range.

export const PIPP_INDICATORS = [
  {
    key: 'ga',
    label: 'Gestational age',
    options: [
      { value: '0', text: '0 - 36 weeks or more' },
      { value: '1', text: '1 - 32 weeks to 35 weeks 6 days' },
      { value: '2', text: '2 - 28 weeks to 31 weeks 6 days' },
      { value: '3', text: '3 - less than 28 weeks' },
    ],
  },
  {
    key: 'state',
    label: 'Behavioral state before the procedure',
    options: [
      { value: '0', text: '0 - active and awake, eyes open, facial movements' },
      { value: '1', text: '1 - quiet and awake, eyes open, no facial movements' },
      { value: '2', text: '2 - active and asleep, eyes closed, facial movements' },
      { value: '3', text: '3 - quiet and asleep, eyes closed, no facial movements' },
    ],
  },
  {
    key: 'hr',
    label: 'Maximum heart-rate rise from baseline',
    options: [
      { value: '0', text: '0 - 0 to 4 beats per minute' },
      { value: '1', text: '1 - 5 to 14 beats per minute' },
      { value: '2', text: '2 - 15 to 24 beats per minute' },
      { value: '3', text: '3 - 25 beats per minute or more' },
    ],
  },
  {
    key: 'spo2',
    label: 'Minimum oxygen-saturation fall from baseline',
    options: [
      { value: '0', text: '0 - 0 to 2.4 percent' },
      { value: '1', text: '1 - 2.5 to 4.9 percent' },
      { value: '2', text: '2 - 5.0 to 7.4 percent' },
      { value: '3', text: '3 - 7.5 percent or more' },
    ],
  },
  {
    key: 'brow',
    label: 'Brow bulge',
    options: [
      { value: '0', text: '0 - none, less than 10 percent of the time' },
      { value: '1', text: '1 - minimum, 10 to 39 percent of the time' },
      { value: '2', text: '2 - moderate, 40 to 69 percent of the time' },
      { value: '3', text: '3 - maximum, 70 percent of the time or more' },
    ],
  },
  {
    key: 'squeeze',
    label: 'Eye squeeze',
    options: [
      { value: '0', text: '0 - none, less than 10 percent of the time' },
      { value: '1', text: '1 - minimum, 10 to 39 percent of the time' },
      { value: '2', text: '2 - moderate, 40 to 69 percent of the time' },
      { value: '3', text: '3 - maximum, 70 percent of the time or more' },
    ],
  },
  {
    key: 'furrow',
    label: 'Nasolabial furrow',
    options: [
      { value: '0', text: '0 - none, less than 10 percent of the time' },
      { value: '1', text: '1 - minimum, 10 to 39 percent of the time' },
      { value: '2', text: '2 - moderate, 40 to 69 percent of the time' },
      { value: '3', text: '3 - maximum, 70 percent of the time or more' },
    ],
  },
];

const MAX_TOTAL = PIPP_INDICATORS.length * 3; // 21
const MINIMAL_AT = 6;
const MODERATE_ABOVE = 12;

const NOTE = 'The Premature Infant Pain Profile (Stevens and colleagues 1996) scores seven indicators 0 to 3 around one procedure, for a total of 0 to 21. Two of them are contextual and are scored before the procedure begins: gestational age and behavioral state. That is the point of the instrument, because a more preterm infant, and an infant in quiet sleep, mounts a smaller response to the same pain. A total of 6 or less is commonly read as minimal or no pain and a total above 12 as moderate to severe pain. It sums what an observer rates. It is not a diagnosis, not a measure of pain at rest or of ongoing or postoperative pain, and not a drug or dose recommendation. A low score does not mean the procedure did not hurt: a sick, sedated, paralyzed, or exhausted infant may not mount the response the score is built on.';

function readScore(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 3) return NaN;
  return n;
}

function bandFor(total) {
  if (total <= MINIMAL_AT) return 'commonly read as minimal or no pain';
  if (total <= MODERATE_ABOVE) return 'above the minimal-pain range and at or below the total of 12 commonly read as moderate to severe pain';
  return 'commonly read as moderate to severe pain';
}

// input:
//   ga, state, hr, spo2, brow, squeeze, furrow: each 0-3 (all seven required).
export function pipp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = PIPP_INDICATORS.map((ind) => readScore(o[ind.key]));

  if (vals.some((n) => n === null)) {
    return { valid: false, message: 'Score all seven indicators (each 0 to 3).' };
  }
  if (vals.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each indicator must be a whole number from 0 to 3.' };
  }

  const total = vals.reduce((a, b) => a + b, 0);
  const contextual = vals[0] + vals[1];

  return {
    valid: true,
    total,
    contextual,
    minimalPain: total <= MINIMAL_AT,
    moderateToSevere: total > MODERATE_ABOVE,
    bandLabel: `PIPP ${total} of ${MAX_TOTAL}`,
    band: `PIPP total ${total} of ${MAX_TOTAL}, ${bandFor(total)}. ${contextual} of that comes from gestational age and behavioral state, scored before the procedure.`,
    note: NOTE,
  };
}
