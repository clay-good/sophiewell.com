// A shown value that agrees with the decision made on the unrounded one.
//
// A tool decides on the raw number but prints it rounded, so 49.9956 printed at four significant digits reads
// "50" beside "under 50". These return the value at the fewest digits (from `from` up) at which it falls on the
// same side of every cut-off as the raw value: above, below, or equal only when the raw value is equal.
//
// Pure: no DOM, no clock, no network.

const side = (a, c) => Math.sign(a - c);

function fewest(x, cuts, from, to, round) {
  for (let k = from; k <= to; k += 1) {
    const v = round(x, k);
    // Scaling a huge value by 10^k overflows to Infinity; that is never a better print than the value itself.
    if (Number.isFinite(v) && cuts.every((c) => side(v, c) === side(x, c))) return v;
  }
  return x;
}

// Significant digits, from `from` (default 4).
export const sigSafe = (x, cuts, from = 4) => fewest(x, cuts, from, 15, (v, k) => Number(v.toPrecision(k)));

// Decimal places, from `from` (default 0).
export const dpSafe = (x, cuts, from = 0) => fewest(x, cuts, from, 12, (v, k) => Math.round(v * 10 ** k) / 10 ** k);
