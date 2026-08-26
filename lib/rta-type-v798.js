// spec-v798: renal tubular acidosis typing (types 1, 2 and 4).
//
// Sources:
//   Merck Manual Professional, Renal Tubular Acidosis; and
//   Renal Tubular Acidosis. StatPearls. NCBI Bookshelf NBK519044.
//
// The typing algorithm both sources give, in order:
//   1. serum potassium HIGH                     -> type 4 (hyperkalemic distal)
//   2. potassium not high, urine pH above 5.5   -> type 1 (classic distal)
//   3. potassium not high, urine pH 5.5 or less -> type 2 (proximal)
//
// A fractional excretion of bicarbonate above 15% during bicarbonate loading supports
// type 2, which is the confirmatory test rather than a discriminator in its own right.
//
// THE URINE ANION GAP IS DELIBERATELY NOT USED TO TYPE. The two sources disagree on it:
// one gives a positive gap in type 4 because ammoniagenesis is impaired, the other's table
// gives a negative one. They agree on what the gap is actually for - separating a renal
// cause of a normal-anion-gap acidosis (positive gap, impaired ammonium excretion) from
// gastrointestinal bicarbonate loss (negative gap) - so that is the only thing it is used
// for here, and the disagreement is reported rather than resolved.
//
// Type 3 is not offered: it is a rare combined form, not a step in this algorithm.
//
// Pure: no DOM, no clock, no network.

export const RTA_NOTE = 'Renal tubular acidosis is typed from a short sequence. A high serum potassium points to type 4, the hyperkalemic distal form. With potassium not high, a urine pH above 5.5 during acidosis points to type 1, the classic distal form, where the kidney cannot acidify the urine at all, and a urine pH of 5.5 or less points to type 2, the proximal form, where it can acidify once enough bicarbonate has been lost. A fractional excretion of bicarbonate above 15 percent during bicarbonate loading supports type 2 and is the confirmatory test. The urine anion gap is asked for but deliberately not used to assign a type, because published sources disagree on its direction in type 4 while agreeing on what it is actually for, which is separating a kidney cause of a normal-anion-gap acidosis from gastrointestinal bicarbonate loss. Type 3 is not offered because it is a rare combined form rather than a step in this algorithm, and none of this replaces the confirmatory testing or the search for the underlying cause.';

const POTASSIUM = { low: 'low', normal: 'normal', high: 'high' };

function optNum(v, min, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

export function rtaType(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const potassium = o.potassium === undefined || o.potassium === null || o.potassium === '' ? 'low' : String(o.potassium).trim();
  if (!Object.prototype.hasOwnProperty.call(POTASSIUM, potassium)) {
    return { valid: false, code: 'INVALID_INPUT', field: 'potassium', message: 'Serum potassium must be low, normal or high.', note: RTA_NOTE };
  }

  const urinePh = optNum(o.urinePh, 4, 9);
  if (urinePh === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'urinePh', message: 'Enter a urine pH between 4 and 9.', note: RTA_NOTE };
  const feHco3 = optNum(o.feHco3, 0, 100);
  if (feHco3 === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'feHco3', message: 'Enter a fractional excretion of bicarbonate between 0 and 100 percent.', note: RTA_NOTE };
  const urineAnionGap = optNum(o.urineAnionGap, -100, 100);
  if (urineAnionGap === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'urineAnionGap', message: 'Enter a urine anion gap between -100 and 100 mEq/L.', note: RTA_NOTE };

  let type = null;
  let reason;
  if (potassium === 'high') {
    type = 4;
    reason = 'a high serum potassium points to type 4, the hyperkalemic distal form';
  } else if (urinePh === null) {
    reason = 'enter the urine pH during acidosis to separate type 1 from type 2';
  } else if (urinePh > 5.5) {
    type = 1;
    reason = `a urine pH of ${urinePh} during acidosis, above 5.5, points to type 1: the kidney cannot acidify the urine`;
  } else {
    type = 2;
    reason = `a urine pH of ${urinePh} during acidosis, at or below 5.5, points to type 2: the kidney can acidify once enough bicarbonate has been lost`;
  }

  const support = [];
  if (feHco3 !== null) {
    support.push(feHco3 > 15
      ? `fractional excretion of bicarbonate ${feHco3}%, above 15%, supports type 2`
      : `fractional excretion of bicarbonate ${feHco3}%, at or below 15%, does not support type 2`);
  }
  if (urineAnionGap !== null) {
    support.push(urineAnionGap > 0
      ? `urine anion gap ${urineAnionGap} is positive, favoring a renal cause over gastrointestinal bicarbonate loss`
      : `urine anion gap ${urineAnionGap} is negative, favoring gastrointestinal bicarbonate loss over a renal cause`);
  }

  return {
    valid: true,
    type,
    potassium,
    reason,
    supporting: support,
    abnormal: type !== null,
    bandLabel: type === null ? 'RTA type: not yet determined' : `RTA type ${type}`,
    band: type === null ? `RTA typing incomplete — ${reason}.` : `Renal tubular acidosis type ${type} — ${reason}.`,
    detail: 'Order of the algorithm: a high serum potassium gives type 4; otherwise a urine pH above 5.5 during acidosis gives type 1 and 5.5 or less gives type 2. A fractional excretion of bicarbonate above 15% supports type 2. The urine anion gap is not used to assign a type here, because sources disagree on its direction in type 4; it is reported for what they do agree it does, separating a renal cause from gastrointestinal bicarbonate loss.',
    note: RTA_NOTE,
  };
}
