// spec-v645: CHEOPS (Children's Hospital of Eastern Ontario Pain Scale).
//
// The companion gap in a rich pediatric-pain cluster (flacc, nips, npass, cries,
// comfort-b, pipp were all built; CHEOPS was missing). An observational
// postoperative pain scale for children roughly 1-7 years. Source:
//   McGrath PJ, Johnson G, Goodman JT, Schillinger J, Dunn J, Chapman JA. CHEOPS:
//   a behavioral scale for rating postoperative pain in children. In: Fields HL,
//   Dubner R, Cervero F, eds. Advances in Pain Research and Therapy, Vol 9.
//   New York: Raven Press; 1985:395-402.
//
// Six behavioral items with NON-UNIFORM scoring: Cry (1-3), Facial (0-2), Verbal
// (0-2), Torso (1-2), Touch (1-2), Legs (1-2). The total ranges 4 to 13 (the floor
// is 4, not 3, because Cry has no zero option while four items floor at 1). The
// original chapter prescribes NO single clinical cutoff; later adopters use
// different thresholds (>= 6 most common, but >= 5 and >= 8 tiers also circulate),
// so this reports the total as the primary output and names the thresholds as
// advisory rather than asserting one verdict.
//
// Pure: no DOM, no clock, no network.

const CRY = { nocry: 1, moaning: 2, crying: 2, scream: 3 };
const FACIAL = { smiling: 0, composed: 1, grimace: 2 };
const VERBAL = { positive: 0, none: 1, other: 1, pain: 2, both: 2 };
const TORSO = { neutral: 1, shifting: 2, tense: 2, shivering: 2, upright: 2, restrained: 2 };
const TOUCH = { nottouching: 1, reaching: 2, touching: 2, grabbing: 2, restrained: 2 };
const LEGS = { neutral: 1, squirming: 2, drawnup: 2, standing: 2, restrained: 2 };

export const CHEOPS_ITEMS = [
  { key: 'cry', map: CRY, label: 'Cry' },
  { key: 'facial', map: FACIAL, label: 'Facial' },
  { key: 'verbal', map: VERBAL, label: 'Verbal (child)' },
  { key: 'torso', map: TORSO, label: 'Torso' },
  { key: 'touch', map: TOUCH, label: 'Touch (wound)' },
  { key: 'legs', map: LEGS, label: 'Legs' },
];

export const CHEOPS_MIN = 4;
export const CHEOPS_MAX = 13;

export const CHEOPS_NOTE = 'CHEOPS (Children’s Hospital of Eastern Ontario Pain Scale; McGrath PJ, Johnson G, Goodman JT, et al, 1985) — an observational postoperative pain scale for children roughly 1-7 years. Six behaviors are rated: cry (no cry 1, moaning 2, crying 2, scream 3), facial (smiling 0, composed 1, grimace 2), verbal (positive 0, none or non-pain complaint 1, pain complaint or both 2), torso (neutral 1, otherwise 2), whether the child touches the wound (not touching 1, otherwise 2), and legs (neutral 1, otherwise 2). The total ranges 4 to 13, with the floor at 4 because cry has no zero option. The original scale prescribes no single treatment cutoff; adopters vary, and a score of 6 or more is the most commonly cited threshold for analgesia (schemes using 5 or 8 also appear). It is a bedside pain-behavior rating, not a diagnosis; the analgesia decision stays with the clinician.';

export function cheops(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const bad = [];
  const parts = [];
  let total = 0;
  for (const it of CHEOPS_ITEMS) {
    const raw = o[it.key];
    if (raw === '' || raw === null || raw === undefined) { missing.push(it.key); continue; }
    const key = String(raw).trim().toLowerCase();
    if (!(key in it.map)) { bad.push(`${it.key} = "${raw}"`); continue; }
    total += it.map[key];
    parts.push(`${it.label} ${key} (${it.map[key]})`);
  }
  if (missing.length) {
    return { valid: false, code: 'MISSING_INPUT', field: missing[0], message: `Rate every behavior. Still needed: ${missing.join(', ')}.` };
  }
  if (bad.length) {
    return { valid: false, code: 'UNKNOWN_INPUT', message: `Unrecognized behavior for: ${bad.join('; ')}.` };
  }
  const advisory = total >= 6;
  return {
    valid: true,
    total,
    min: CHEOPS_MIN,
    max: CHEOPS_MAX,
    abnormal: advisory,
    bandLabel: `CHEOPS ${total} of ${CHEOPS_MAX}`,
    detail: parts.join('; ') + '.',
    thresholdNote: 'No single authoritative cutoff: a score of 6 or more is the most commonly cited threshold for analgesia, though schemes using 5 or 8 also appear. Read the total alongside the child and the clinical context.',
    note: CHEOPS_NOTE,
  };
}
