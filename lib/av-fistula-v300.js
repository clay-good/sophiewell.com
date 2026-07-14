// spec-v300: Arteriovenous fistula (AVF) maturation — the "Rule of 6s" (a noted
// catalog gap from the spec-v293 search sweep). Given the measured internal
// fistula blood flow, vein inner diameter, and vein depth from the skin, the tile
// reports which of the three Rule-of-6s thresholds are met and whether all three
// are satisfied (highly predictive of functional maturation).
//
// This reports the cited rule's own criteria, NOT a cannulation decision
// (spec-v11 §5.3) — whether a fistula is ready to cannulate stays with the
// clinician; the 2019 KDOQI update itself bases maturation primarily on clinical
// judgment.
//
// THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against
// two independent sources that agree on the diameter/flow/depth 6-6-600 thresholds:
//   - NKF-KDOQI Clinical Practice Guidelines and Recommendations for Vascular
//     Access. Am J Kidney Dis. 2006;48(Suppl 1):S176-S247 (the 2006 "rule of 6s":
//     vessel diameter >6 mm, blood flow >600 mL/min, depth <6 mm; evaluate for
//     failure to mature if not usable by ~6 weeks).
//   - Al Shakarchi J, et al. / Bashar K, and the JVS 2022 validation (Rules of 6
//     criteria predict dialysis fistula maturation; J Vasc Surg. 2022 — satisfying
//     all criteria has PPV >90%; NPV if not all met is only ~47%).
// The 2019 KDOQI vascular-access update abandons fixed criteria for clinical
// judgment; the note carries that caveat.

const THRESHOLD = { flow: 600, diameter: 6, depth: 6 };

const NOTE = 'AVF "Rule of 6s" (2006 KDOQI): a maturing fistula should reach a blood flow of at least 600 mL/min, a vein inner diameter of at least 6 mm, and a depth of no more than 6 mm from the skin, and is evaluated for failure to mature if not usable by about 6 weeks. Meeting all three criteria is highly predictive of functional maturation (positive predictive value >90%); NOT meeting them does not reliably predict failure (negative predictive value only ~47%). The 2019 KDOQI update bases maturation primarily on clinical judgment rather than fixed criteria. This reports the cited rule\'s criteria, not a cannulation decision, which stays with the clinician.';

function parse(raw) {
  if (raw === '' || raw === undefined || raw === null) return null;
  const n = Number(typeof raw === 'string' ? raw.trim() : raw);
  if (!Number.isFinite(n) || n < 0) throw new RangeError('Flow, diameter, and depth must be non-negative numbers.');
  return n;
}

// input.flow (mL/min), input.diameter (mm), input.depth (mm). Returns the
// per-criterion pass flags and the all-met result.
export function avfRuleOf6s(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const flow = parse(o.flow);
  const diameter = parse(o.diameter);
  const depth = parse(o.depth);
  if (flow === null || diameter === null || depth === null) {
    return { valid: false, message: 'Enter the fistula blood flow, vein diameter, and vein depth.' };
  }

  const flowOk = flow >= THRESHOLD.flow;
  const diameterOk = diameter >= THRESHOLD.diameter;
  const depthOk = depth <= THRESHOLD.depth;
  const metCount = [flowOk, diameterOk, depthOk].filter(Boolean).length;
  const allMet = metCount === 3;

  const parts = [
    `flow ${flow} ${flowOk ? '≥' : '<'} ${THRESHOLD.flow} mL/min`,
    `diameter ${diameter} ${diameterOk ? '≥' : '<'} ${THRESHOLD.diameter} mm`,
    `depth ${depth} ${depthOk ? '≤' : '>'} ${THRESHOLD.depth} mm`,
  ];
  const band = allMet
    ? `All three Rule of 6s criteria met (${parts.join(', ')}): highly predictive of functional maturation (PPV >90%).`
    : `${metCount} of 3 Rule of 6s criteria met (${parts.join(', ')}): not all criteria met — this does not reliably predict failure to mature (NPV ~47%); clinical judgment governs.`;

  return {
    valid: true,
    flow,
    diameter,
    depth,
    flowOk,
    diameterOk,
    depthOk,
    metCount,
    allMet,
    abnormal: !allMet,
    bandLabel: allMet ? 'All criteria met' : `${metCount} of 3 met`,
    band,
    note: NOTE,
  };
}
