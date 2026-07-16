// spec-v324: Wexner (Cleveland Clinic) fecal incontinence score. Sums five items — the
// frequency of incontinence to solid stool, liquid stool, and gas, plus wearing a pad and
// lifestyle alteration — each on a 0-4 frequency scale, for a total of 0-20. The catalog
// had no fecal-incontinence severity score ("wexner" had zero corpus hits; the only
// "fecal incontinence" mentions were in the unrelated FAST dementia staging). "wexner" /
// "fecal incontinence score" routed to nothing.
//
// HIGH-STAKES: this reports the CITED SEVERITY SCORE from the frequencies the clinician or
// patient enters, NOT a diagnosis or a treatment order (spec-v11 §5.3).
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Jorge JMN, Wexner SD. Etiology and management of fecal incontinence. Dis Colon
//     Rectum. 1993;36(1):77-97 (the original Cleveland Clinic Incontinence Score).
//   - Multiple reproductions (ScienceDirect, Pathway.md) of the same five items and the
//     0 (never) to 4 (daily) frequency scale, total 0-20.
//
// Five items, each scored 0-4:
//   solid, liquid, gas  : incontinence to solid stool / liquid stool / gas.
//   pad                 : wears a pad.
//   lifestyle           : lifestyle alteration.
// Frequency scale: 0 never; 1 rarely (< 1/month); 2 sometimes (>= 1/month, < 1/week);
//   3 usually (>= 1/week, < 1/day); 4 always (>= 1/day).
// Total 0 (perfect continence) to 20 (complete incontinence).

const ITEMS = ['solid', 'liquid', 'gas', 'pad', 'lifestyle'];
const SIGNIFICANT = 9; // a commonly cited (not fixed) threshold for clinically significant FI

function toItem(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return n;
}

const NOTE = 'Wexner (Cleveland Clinic) fecal incontinence score (Jorge & Wexner 1993). Five items — incontinence to solid stool, liquid stool, and gas, plus wearing a pad and lifestyle alteration — each on a 0-4 frequency scale (0 never; 1 rarely, less than once a month; 2 sometimes, at least monthly but less than weekly; 3 usually, at least weekly but less than daily; 4 always, at least daily). Total 0-20: 0 is perfect continence and 20 is complete incontinence; higher scores indicate more severe incontinence. A score at or above 9 is a commonly cited threshold for clinically significant incontinence, but there is no single official cut-point. This reports the cited severity score, not a diagnosis or a treatment order.';

// input: solid, liquid, gas, pad, lifestyle -- each 0-4 (missing defaults to 0)
export function wexner(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = {};
  for (const k of ITEMS) {
    const n = toItem(o[k]);
    if (Number.isNaN(n) || n < 0 || n > 4 || !Number.isInteger(n)) {
      return { valid: false, message: `Each item (${ITEMS.join(', ')}) must be a whole number 0-4.` };
    }
    vals[k] = n;
  }

  const total = ITEMS.reduce((s, k) => s + vals[k], 0);
  const significant = total >= SIGNIFICANT;

  let band;
  if (total === 0) {
    band = 'Wexner score 0 of 20 — perfect continence.';
  } else {
    band = `Wexner (Cleveland Clinic) fecal incontinence score ${total} of 20. Higher scores indicate more severe incontinence (20 is complete incontinence).${significant ? ' At or above 9, a commonly cited threshold for clinically significant incontinence (not a fixed cut-point).' : ''}`;
  }

  return {
    valid: true,
    total,
    items: vals,
    significant,
    abnormal: significant,
    bandLabel: `Wexner ${total}/20`,
    band,
    note: NOTE,
  };
}
