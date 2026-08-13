// spec-v715: Basic Erosive Wear Examination (BEWE).
//
// A standardized screening index that grades dental erosive tooth wear across the dentition.
// Source:
//   Bartlett D, Ganss C, Lussi A. Basic Erosive Wear Examination (BEWE): a new scoring system
//   for scientific and clinical needs. Clin Oral Investig. 2008;12(Suppl 1):S65-S68.
//   (PMID 18228057.)
//
// The mouth is divided into 6 sextants. Within each sextant the single MOST-affected surface is
// scored 0-3:
//   0 = no erosive tooth wear
//   1 = initial loss of surface texture
//   2 = distinct defect, hard-tissue loss < 50% of the surface area
//   3 = hard-tissue loss >= 50% of the surface area
// The BEWE total is the SUM of the highest score from each of the 6 sextants (range 0-18).
//
// Cumulative-score risk levels and management guidance:
//   0-2   none        - routine maintenance and observation (about 3-year recall)
//   3-8   low         - oral-hygiene and dietary assessment, fluoride (about 2-year recall)
//   9-13  medium      - as above, plus avoid placing restorations; monitor (6-12 month recall)
//   >= 14 high        - as above, plus consider restorations (6-12 month recall)
//
// Pure: no DOM, no clock, no network.

export const BEWE_NOTE = 'Basic Erosive Wear Examination (BEWE) (Bartlett D, Ganss C, Lussi A, Clin Oral Investig 2008;12(Suppl 1):S65-S68), a standardized screening index for dental erosive tooth wear. The mouth is divided into six sextants, and within each the single most-affected surface is scored from 0 to 3: 0 for no erosive wear, 1 for an initial loss of surface texture, 2 for a distinct defect with hard-tissue loss under half of the surface, and 3 for hard-tissue loss of half or more. The BEWE total is the sum of the highest score in each of the six sextants, from 0 to 18. A cumulative score of 0 to 2 is none and needs only routine maintenance, 3 to 8 is low and prompts oral-hygiene and dietary assessment and fluoride, 9 to 13 is medium and adds avoiding the placement of restorations with closer monitoring, and 14 or more is high and additionally warrants considering restorations. It is a screening and monitoring index to guide management and follow-up intervals, not a diagnosis of the cause, and it supports rather than replaces the full dental examination and clinical judgment.';

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return null;
  return n;
}

const SEXTANTS = ['sextant1', 'sextant2', 'sextant3', 'sextant4', 'sextant5', 'sextant6'];

function band(total) {
  if (total <= 2) return { tier: 'none', label: 'no / negligible erosive wear' };
  if (total <= 8) return { tier: 'low', label: 'low-risk erosive wear' };
  if (total <= 13) return { tier: 'medium', label: 'medium-risk erosive wear' };
  return { tier: 'high', label: 'high-risk erosive wear' };
}

export function bewe(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const s of SEXTANTS) {
    const v = optIn(o[s]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: s, message: `Score ${s} from 0 to 3 (highest-scoring surface).`, note: BEWE_NOTE };
    }
    total += v;
  }

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    // Medium or high (>= 9) is where restorative management and close monitoring begin.
    abnormal: total >= 9,
    bandLabel: `BEWE ${total} of 18`,
    band: `BEWE ${total} of 18 — ${b.label}.`,
    detail: 'Risk levels: 0-2 none (routine), 3-8 low (hygiene/diet, fluoride), 9-13 medium (avoid restorations, monitor), >= 14 high (consider restorations). Sum of the highest score in each of 6 sextants.',
    note: BEWE_NOTE,
  };
}
