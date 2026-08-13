// spec-v731: Infant Breastfeeding Assessment Tool (IBFAT).
//
// A brief 4-item observational measure of an infant's breastfeeding behavior at a feed.
// Source:
//   Matthews MK. Developing an instrument to assess infant breastfeeding behaviour in the
//   early neonatal period. Midwifery. 1988;4(4):154-165. (PMID 3210979.)
//
// Four items, each scored 0-3 (best response = 3), summed to a total of 0-12:
//   Readiness to feed (behavioral state)
//   Rooting
//   Fixing (latching on)
//   Sucking pattern
//
// Higher = more effective feeding. A total of 10-12 indicates effective feeding behavior.
// Only neutral item-topic labels are used; the item anchor wording is copyrighted.
//
// Pure: no DOM, no clock, no network.

export const IBFAT_NOTE = "Infant Breastfeeding Assessment Tool (IBFAT) (Matthews MK, Midwifery 1988;4(4):154-165), a brief four-item observational measure of an infant's breastfeeding behavior at a feed. Four items - readiness to feed based on the behavioral state, rooting, fixing or latching on, and the sucking pattern - are each scored from 0 to 3, with the best response scoring 3, and summed to a total of 0 to 12. A higher total means more effective feeding, and a total of 10 to 12 indicates effective feeding behavior. It describes the feeding at a single observed feed to support breastfeeding assessment and lactation support, it is not a diagnosis, and it supports rather than replaces the clinical and lactation evaluation.";

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return null;
  return n;
}

const ITEMS = ['readiness', 'rooting', 'fixing', 'sucking'];

export function ibfat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const k of ITEMS) {
    const v = optIn(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Score ${k} from 0 to 3.`, note: IBFAT_NOTE };
    }
    total += v;
  }

  const effective = total >= 10;
  return {
    valid: true,
    score: total,
    tier: effective ? 'effective' : 'less-effective',
    // A total under 10 (less effective feeding) is the actionable state for lactation support.
    abnormal: !effective,
    bandLabel: `IBFAT ${total} of 12`,
    band: `IBFAT ${total} of 12 — ${effective ? 'effective feeding behavior' : 'less effective feeding behavior'} (10-12 effective).`,
    detail: effective
      ? 'Total 10-12: effective feeding behavior. Higher is better; reassess at subsequent feeds as needed.'
      : 'Total under 10: less effective feeding - offer lactation support and reassess.',
    note: IBFAT_NOTE,
  };
}
