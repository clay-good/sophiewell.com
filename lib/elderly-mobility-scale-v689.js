// spec-v689: Elderly Mobility Scale (EMS).
//
// A seven-item performance measure of functional mobility in frail older people, used in
// rehabilitation to gauge safety for independent living. Source:
//   Smith R. Validation and reliability of the Elderly Mobility Scale. Physiotherapy.
//   1994;80(11):744-747 (with the 1994 correction, 80(12):879); Prosser L, Canby A.
//   Further validation of the Elderly Mobility Scale for measurement of mobility of
//   hospitalized elderly people. Clin Rehabil. 1997;11(4):338-343.
//
// Seven items, summed to a maximum of 20:
//   Lying to sitting: independent 2 / help of 1 person 1 / help of 2+ 0
//   Sitting to lying: independent 2 / help of 1 person 1 / help of 2+ 0
//   Sit to stand: independent < 3 s 3 / independent > 3 s 2 / needs help of 1 (verbal or
//     physical) 1 / needs help of 2+ 0
//   Standing: stands without support and reaches within arm's length 3 / stands without
//     support but needs help to reach 2 / stands but requires support 1 / stands only with
//     physical support of 1 person 0
//   Gait: independent (incl. use of sticks) 3 / independent with a frame 2 / mobile with a
//     walking aid but erratic/unsafe turning 1 / needs physical assistance or constant
//     supervision 0
//   Timed 6 m walk: under 15 s 3 / 16-30 s 2 / over 30 s 1 (no 0 option)
//   Functional reach: over 20 cm 4 / 10-20 cm 2 / under 10 cm 0
//
// Bands: 14-20 independent in basic ADLs (generally safe for home, may need home help);
// 10-13 borderline safe mobility (needs some help with maneuvers); < 10 dependent (needs
// help with basic ADLs, may need a home-care package or long-term care).
//
// Pure: no DOM, no clock, no network.

export const EMS_NOTE = 'Elderly Mobility Scale (EMS) (Smith R, Physiotherapy 1994;80(11):744-747; Prosser L, Canby A, Clin Rehabil 1997;11(4):338-343). A seven-item performance measure of functional mobility in frail older people used in rehabilitation, summed to a maximum of 20. The items and their top scores are lying to sitting (2), sitting to lying (2), sit to stand (3, best if independent under 3 seconds), standing and reaching within arm reach (3), gait (3, best if independent including with sticks), a timed 6 metre walk (3 if under 15 seconds, 2 if 16 to 30, 1 if over 30, with no zero), and functional reach (4 if over 20 cm, 2 if 10 to 20 cm, 0 if under 10 cm). A total of 14 to 20 indicates independence in basic activities of daily living and is generally safe for home (perhaps with home help); 10 to 13 is borderline mobility that needs some help with maneuvers; under 10 indicates dependence and a likely need for a care package or long-term care. It is a functional-mobility measure to guide rehabilitation and discharge planning, and it supports rather than replaces clinical judgment.';

function optIn(v, allowed) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || !allowed.includes(n)) return null;
  return n;
}

const ITEMS = [
  { key: 'lyingToSitting', allowed: [0, 1, 2] },
  { key: 'sittingToLying', allowed: [0, 1, 2] },
  { key: 'sitToStand', allowed: [0, 1, 2, 3] },
  { key: 'standing', allowed: [0, 1, 2, 3] },
  { key: 'gait', allowed: [0, 1, 2, 3] },
  { key: 'timedWalk', allowed: [1, 2, 3] },
  { key: 'functionalReach', allowed: [0, 2, 4] },
];

function band(total) {
  if (total >= 14) return { tier: 'independent', label: 'independent in basic ADLs (generally safe for home)' };
  if (total >= 10) return { tier: 'borderline', label: 'borderline mobility (needs some help with maneuvers)' };
  return { tier: 'dependent', label: 'dependent (needs help with basic ADLs)' };
}

export function elderlyMobilityScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const it of ITEMS) {
    const v = optIn(o[it.key], it.allowed);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: it.key, message: `Select a valid score for ${it.key}.`, note: EMS_NOTE };
    }
    total += v;
  }

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    // Flag the dependent band (< 10) as the actionable low-mobility result.
    abnormal: total < 10,
    bandLabel: `EMS ${total} of 20`,
    band: `EMS ${total} of 20 — ${b.label}.`,
    detail: 'Bands: 14-20 independent, 10-13 borderline, under 10 dependent. Higher is better mobility.',
    note: EMS_NOTE,
  };
}
