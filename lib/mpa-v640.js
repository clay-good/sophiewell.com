// spec-v640: 2022 ACR/EULAR Classification Criteria for Microscopic Polyangiitis
// (MPA).
//
// The fourth of the 2022 ACR/EULAR vasculitis series in the catalog, completing
// the ANCA-associated pair with gpa-acr-eular-2022 (both share the small/medium-
// vessel context and the eosinophil/ENT negatives, but MPA leans on MPO-ANCA).
// Source:
//   Suppiah R, Robson JC, Grayson PC, et al. 2022 American College of
//   Rheumatology/EULAR Classification Criteria for Microscopic Polyangiitis.
//   Arthritis Rheumatol. 2022;74(3):400-406. doi:10.1002/art.41983
//   (co-published Ann Rheum Dis. 2022;81(3):321-326, doi:10.1136/annrheumdis-2021-221796).
//
// Applied only once a diagnosis of small- or medium-vessel vasculitis has been
// made and mimics excluded (a consideration, stated in the note; no scored
// absolute-requirement gate). Six weighted items are summed, THREE of them
// NEGATIVE: nasal involvement -3 and positive cANCA/PR3 -1 point toward GPA, and
// blood eosinophils >= 1 x10^9/L -4 points toward EGPA. Positive pANCA/MPO carries
// the heaviest weight at +6. The total ranges -8 to +12; a cumulative score >= 5
// classifies as MPA (validation sensitivity 91%, specificity 94%).
//
// Pure: no DOM, no clock, no network. Same return contract as the family.

import { num } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

export const MPA_NOTE = '2022 ACR/EULAR Classification Criteria for Microscopic Polyangiitis (Suppiah R, Robson JC, Grayson PC, et al, Arthritis Rheumatol 2022;74(3):400-406) — applied only once a diagnosis of small- or medium-vessel vasculitis has been made and mimics excluded. Six weighted items are summed: positive pANCA or anti-MPO antibody +6; pauci-immune glomerulonephritis on biopsy +3; fibrosis or interstitial lung disease on chest imaging +3; and three NEGATIVE items that point elsewhere — nasal involvement (bloody discharge, ulcers, crusting, congestion, blockage, or septal defect/perforation) -3, positive cANCA or anti-PR3 antibody -1, and a blood eosinophil count ≥ 1 x10^9/L -4. The total ranges -8 to +12; a cumulative score ≥ 5 classifies as microscopic polyangiitis (sensitivity 91%, specificity 94%). It is a classification rule, not a diagnosis or a treatment order.';

const MPA_ITEMS = [
  { key: 'pAncaMpo', label: 'positive pANCA or anti-MPO antibody', pts: 6 },
  { key: 'pauciGn', label: 'pauci-immune glomerulonephritis on biopsy', pts: 3 },
  { key: 'fibrosisIld', label: 'fibrosis or interstitial lung disease on chest imaging', pts: 3 },
  { key: 'nasal', label: 'nasal involvement (bloody discharge, ulcers, crusting, congestion, blockage, or septal defect/perforation)', pts: -3 },
  { key: 'cAncaPr3', label: 'positive cANCA or anti-PR3 antibody', pts: -1 },
  { key: 'eosinophilia', label: 'blood eosinophil count ≥ 1 x10^9/L', pts: -4 },
];

const signed = (pts) => `${pts > 0 ? '+' : ''}${pts}`;

export function mpaAcrEular2022(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const parts = [];
  for (const it of MPA_ITEMS) {
    if (onFlag(o[it.key])) { total += it.pts; parts.push(`${it.label} (${signed(it.pts)})`); }
  }
  const t = num('2022 MPA total', total, { min: -8, max: 12 });
  const isMpa = t >= 5;
  return {
    valid: true,
    score: t,
    bandLabel: isMpa ? 'Classified as MPA' : 'Not classified',
    abnormal: isMpa,
    band: isMpa
      ? `2022 ACR/EULAR ${t}/12 — ≥ 5: classify as microscopic polyangiitis.`
      : `2022 ACR/EULAR ${t}/12 — < 5: does not meet the classification threshold.`,
    detail: (parts.length ? parts.join('; ') : 'no weighted items present') + '.',
    note: MPA_NOTE,
  };
}
