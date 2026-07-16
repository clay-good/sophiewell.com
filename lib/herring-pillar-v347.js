// spec-v347: Herring lateral pillar classification of Legg-Calve-Perthes disease (groups A, B, B/C
// border, C) — grades the childhood osteonecrosis of the femoral head by the height of the LATERAL
// PILLAR of the capital femoral epiphysis at the fragmentation stage, the modern prognostic standard.
// It complements the Catterall classification (which grades total epiphyseal involvement); the
// catalog had the Catterall tile but no Herring lateral-pillar tile. "herring classification" /
// "lateral pillar perthes" routed to nothing.
//
// HIGH-STAKES: this reports the Herring GROUP the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// prognosis also depends strongly on the child's age at onset; the group alone is not the outcome.
// The management decision stays with the pediatric orthopedic surgeon.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Herring JA, Neustadt JB, Williams JJ, Early JS, Browne RH. The lateral pillar classification of
//     Legg-Calve-Perthes disease. J Pediatr Orthop. 1992;12(2):143-150 (groups A/B/C).
//   - Herring JA, Kim HT, Browne R. Legg-Calve-Perthes disease. Part I. J Bone Joint Surg Am.
//     2004;86(10):2103-2120 (adds the B/C border group).
//   - Pediatric-orthopedic references (Orthobullets / "Classifications in Brief" Clin Orthop Relat Res
//     2013) reproducing the same A / B / B-C-border / C lateral-pillar-height definitions.
//
// Groups (lateral-pillar height at fragmentation):
//   A     : lateral pillar not involved — no loss of height, no density change. The best prognosis.
//   B     : lateral pillar maintains MORE THAN 50% of its original height.
//   B/C   : the border group (added 2004) — a narrow (2-3 mm) lateral pillar with > 50% height, OR a
//   border  poorly ossified pillar with ~50% height, OR exactly 50% height with central depression.
//           Flagged.
//   C     : lateral pillar is LESS THAN 50% of its original height. The poorest prognosis. Flagged.

const GROUPS = {
  A: { group: 'A', poor: false, text: 'Herring group A — the lateral pillar is not involved: no loss of height and no density change. The best prognosis.' },
  B: { group: 'B', poor: false, text: 'Herring group B — the lateral pillar maintains more than 50% of its original height.' },
  BC: { group: 'B/C border', poor: true, text: 'Herring group B/C border — a narrow (2-3 mm) lateral pillar with > 50% height, or a poorly ossified pillar with about 50% height, or exactly 50% height with central depression. An intermediate, poorer-prognosis group.' },
  C: { group: 'C', poor: true, text: 'Herring group C — the lateral pillar is less than 50% of its original height. The poorest-prognosis group.' },
};

const NOTE = 'The Herring lateral pillar classification (Herring 1992; B/C border added 2004) grades Legg-Calve-Perthes disease by the height of the lateral pillar of the capital femoral epiphysis at fragmentation. A: pillar not involved (best prognosis). B: pillar > 50% of original height. B/C border: narrow or poorly ossified pillar at about 50% height. C: pillar < 50% of original height (poorest prognosis). The prognosis also depends strongly on the child’s age at onset; the group alone is not the outcome. The management decision stays with the pediatric orthopedic surgeon. This reports the group the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { A: 'A', B: 'B', C: 'C', BC: 'BC', 'B/C': 'BC', 'BC BORDER': 'BC', 'B/C BORDER': 'BC' };

// input:
//   group: 'A' / 'B' / 'BC' (or 'B/C') / 'C' (case-insensitive)
export function herringPillar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.group == null ? '' : o.group).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = GROUPS[key];
  if (!t) {
    return { valid: false, message: 'Select the Herring group (A, B, B/C border, or C).' };
  }
  return {
    valid: true,
    group: t.group,
    poor: t.poor,
    abnormal: t.poor,
    bandLabel: `Herring group ${t.group}`,
    band: t.text,
    note: NOTE,
  };
}
