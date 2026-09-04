// spec-v1055: one definition of "the numbers a documented example claims".
//
// Two sweeps ask the same question of every calculator that ships a worked
// example -- does what it produces carry the numbers its `expected` string
// documents? One asks it of the browser (test/integration/example-correctness),
// the other of the agent surface (test/mcp/mcp-compute). Each had its own copy
// of the extractor and the tolerance rule, and the copies had drifted:
//
//   - spec-v1023 taught the browser that a digit glued to a letter is part of a
//     LABEL, not a value -- "T1" is a trimester, "G2" a GOLD grade, "S3" a heart
//     sound. The MCP copy never learned it, so it was asserting that the result
//     of `sugammadex` must contain a number near 2 because its example mentions
//     the train-of-four count "T2".
//   - Neither knew that the digit in a UNIT is not a value either. "m^2",
//     "cmH2O", "mL/kg/hr" -- `bsa`'s example says "1.85 m^2; 1.84 m^2" and both
//     sweeps were reading two extra facts of "2" out of the units.
//
// Neither drift broke a build: a spurious fact is usually satisfied by some real
// number in the output, which is exactly why it went unnoticed -- the check was
// quietly asserting less than it looked like it asserted.
//
// This module is the single definition. A rule that two callers each implement
// is a rule with two behaviours.

// Pull the numeric claims out of a documented `expected` string.
export function numericFacts(s) {
  const facts = [];
  const re = /(~)?(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?(\s*%)?/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const raw = m[0];
    const value = Number(m[2]);
    // A 4-digit year-shaped integer is a citation, not a result.
    if (Number.isInteger(value) && value >= 1900 && value <= 2100 && /^\d{4}$/.test(m[2])) continue;
    // spec-v1023: a digit glued to a letter is part of a label. spec-v1055: a
    // digit after a caret or inside a unit is part of the unit -- "m^2", the 2
    // of "cmH2O".
    const before = s[m.index + (m[1] ? m[1].length : 0) - 1];
    if (before && /[A-Za-z^]/.test(before)) continue;
    facts.push({
      value,
      raw,
      isApprox: !!m[1],
      rangeEnd: m[3] ? Number(m[3]) : null,
      isPercent: !!m[4],
    });
  }
  return facts;
}

// Tolerance: explicit ~ means +/-15%; ranges accept any value in range;
// otherwise +/-2% relative or 0.05 absolute (whichever is larger), so 5.0
// matches 5, 2.0 matches 2 and 22.86 matches 22.9.
export function toleranceWindow(fact) {
  const tol = fact.isApprox ? Math.max(Math.abs(fact.value) * 0.15, 1)
            : Math.max(Math.abs(fact.value) * 0.02, 0.05);
  const lo = (fact.rangeEnd != null ? Math.min(fact.value, fact.rangeEnd) : fact.value) - tol;
  const hi = (fact.rangeEnd != null ? Math.max(fact.value, fact.rangeEnd) : fact.value) + tol;
  return [lo, hi];
}

export function numbersIn(haystack) {
  return [...String(haystack).matchAll(/\d+(?:\.\d+)?/g)].map((x) => Number(x[0]));
}

// Does SOME number in the haystack fall in this fact's window?
export function matchesLoosely(haystack, fact) {
  const [lo, hi] = toleranceWindow(fact);
  return numbersIn(haystack).some((n) => n >= lo && n <= hi);
}

// spec-v1048: does every fact have a number of its OWN? A matching, not a
// search -- one output number must not stand in for two documented ones.
// Returns the first fact that cannot be matched, or null when all can.
export function firstFactWithoutItsOwnNumber(haystack, facts) {
  const nums = numbersIn(haystack);
  const windows = facts.map(toleranceWindow);
  const takenBy = new Array(nums.length).fill(-1);
  const augment = (fi, seen) => {
    for (let ni = 0; ni < nums.length; ni += 1) {
      if (seen[ni]) continue;
      const [lo, hi] = windows[fi];
      if (!(nums[ni] >= lo && nums[ni] <= hi)) continue;
      seen[ni] = true;
      if (takenBy[ni] === -1 || augment(takenBy[ni], seen)) { takenBy[ni] = fi; return true; }
    }
    return false;
  };
  for (let fi = 0; fi < facts.length; fi += 1) {
    if (!augment(fi, new Array(nums.length).fill(false))) return facts[fi];
  }
  return null;
}
