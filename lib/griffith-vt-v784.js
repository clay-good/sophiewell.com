// spec-v784: Griffith algorithm for wide-complex tachycardia (VT vs SVT with aberrancy).
//
// Source:
//   Griffith MJ, Garratt CJ, Mounsey P, Camm AJ. Ventricular tachycardia as default
//   diagnosis in broad complex tachycardia. Lancet. 1994;343(8894):386-388.
//   (PMID 7905552.)
//
// The algorithm is deliberately INVERTED relative to Brugada and Vereckei. Those look for
// features of VT; Griffith assumes VT and only steps away from it when the QRS looks like
// a textbook bundle branch block:
//
//   RBBB pattern (V1 mainly positive) - SVT only if BOTH:
//     rSR' in V1
//     RS in V6 with the R taller than the S
//
//   LBBB pattern (V1 mainly negative) - SVT only if ALL THREE:
//     rS or QS in V1 and V2
//     delay to the S nadir under 70 ms
//     an R wave in V6 with no Q wave
//
// Anything else is called VT. That default is the point: reported sensitivity for VT is
// about 94% and specificity about 40%, so a VT answer here is a weak claim and an SVT
// answer is the one that carries information.
//
// Pure: no DOM, no clock, no network.

export const GRIFFITH_NOTE = 'The Griffith algorithm (Griffith MJ, Garratt CJ, Mounsey P, Camm AJ, Lancet 1994;343(8894):386-388) approaches a wide-complex tachycardia backwards from the Brugada and Vereckei algorithms. Instead of hunting for features of ventricular tachycardia, it assumes ventricular tachycardia and only concludes supraventricular tachycardia with aberrancy when the QRS looks like a textbook bundle branch block. With a right bundle pattern that means an rSR prime in V1 together with an RS in V6 whose R is taller than its S. With a left bundle pattern it means an rS or QS in V1 and V2, a delay to the S nadir under 70 milliseconds, and an R wave in V6 with no Q wave. Anything short of that is called ventricular tachycardia. Reported sensitivity for ventricular tachycardia is about 94 percent and specificity about 40 percent, so the ventricular tachycardia answer is a safe default rather than a positive finding, and right ventricular outflow tract tachycardias are known to be misread as supraventricular by this rule. A wide-complex tachycardia in an unstable patient is treated as ventricular tachycardia and cardioverted regardless of what any algorithm says; this classifies a tracing and orders nothing.';

const PATTERNS = new Set(['rbbb', 'lbbb']);

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function griffithVt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const pattern = o.pattern === undefined || o.pattern === null || o.pattern === '' ? 'rbbb' : String(o.pattern).trim();
  if (!PATTERNS.has(pattern)) {
    return { valid: false, code: 'INVALID_INPUT', field: 'pattern', message: 'Pattern must be rbbb (V1 mainly positive) or lbbb (V1 mainly negative).', note: GRIFFITH_NOTE };
  }

  const checks = pattern === 'rbbb'
    ? [
      { ok: truthy(o.rsrV1), text: 'rSR prime in V1' },
      { ok: truthy(o.rsV6RTaller), text: 'RS in V6 with R taller than S' },
    ]
    : [
      { ok: truthy(o.rsOrQsV1V2), text: 'rS or QS in V1 and V2' },
      { ok: truthy(o.nadirUnder70), text: 'delay to the S nadir under 70 ms' },
      { ok: truthy(o.rNoQV6), text: 'R wave in V6 with no Q wave' },
    ];

  const met = checks.filter((c) => c.ok);
  const missing = checks.filter((c) => !c.ok);
  const typical = missing.length === 0;
  const patternLabel = pattern === 'rbbb' ? 'right bundle' : 'left bundle';
  const diagnosis = typical ? 'SVT with aberrancy' : 'VT';

  return {
    valid: true,
    pattern,
    diagnosis,
    typical,
    metCriteria: met.map((c) => c.text),
    missingCriteria: missing.map((c) => c.text),
    // VT is the algorithm's default answer and the one that changes management.
    abnormal: !typical,
    bandLabel: `Griffith: ${diagnosis}`,
    band: typical
      ? `Griffith: SVT with aberrancy — every ${patternLabel} criterion is met.`
      : `Griffith: VT by default — the ${patternLabel} pattern is not textbook (${missing.map((c) => c.text).join('; ')}).`,
    detail: pattern === 'rbbb'
      ? 'Right bundle pattern needs both an rSR prime in V1 and an RS in V6 whose R is taller than its S. Either one missing means VT by default. Sensitivity for VT is about 94 percent and specificity about 40 percent, so VT here is a safe default rather than a positive finding.'
      : 'Left bundle pattern needs all three of an rS or QS in V1 and V2, a delay to the S nadir under 70 ms, and an R wave in V6 with no Q wave. Any one missing means VT by default. Sensitivity for VT is about 94 percent and specificity about 40 percent, so VT here is a safe default rather than a positive finding.',
    note: GRIFFITH_NOTE,
  };
}
