// spec-v641: 2022 ACR/EULAR Classification Criteria for Eosinophilic
// Granulomatosis with Polyangiitis (EGPA, formerly Churg-Strauss syndrome).
//
// The fifth and final 2022 ACR/EULAR vasculitis tile, completing the set with
// gca-acr-eular-2022, takayasu-acr-eular-2022, gpa-acr-eular-2022 and
// mpa-acr-eular-2022. Source:
//   Grayson PC, Ponte C, Suppiah R, et al. 2022 American College of
//   Rheumatology/EULAR Classification Criteria for Eosinophilic Granulomatosis
//   with Polyangiitis. Arthritis Rheumatol. 2022;74(3):386-392. doi:10.1002/art.41982
//   (co-published Ann Rheum Dis. 2022;81(3):309-314, doi:10.1136/annrheumdis-2021-221794).
//
// Applied only once a diagnosis of small- or medium-vessel vasculitis has been
// made and mimics excluded (a consideration, stated in the note; no scored
// absolute-requirement gate). Seven weighted items are summed. TWO distinctive
// contrasts with GPA/MPA: (1) blood eosinophilia is the HEAVIEST POSITIVE item
// here (+5), the reverse of GPA/MPA where it is -4; (2) the classification
// threshold is >= 6, one point HIGHER than GPA/MPA (>= 5). Two items are negative
// (cANCA/PR3 -3, hematuria -1). The total ranges -4 to +14 (validation sensitivity
// 85%, specificity 99%).
//
// Pure: no DOM, no clock, no network. Same return contract as the family.

import { num } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

export const EGPA_NOTE = '2022 ACR/EULAR Classification Criteria for Eosinophilic Granulomatosis with Polyangiitis (Grayson PC, Ponte C, Suppiah R, et al, Arthritis Rheumatol 2022;74(3):386-392) — applied only once a diagnosis of small- or medium-vessel vasculitis has been made and mimics excluded. Seven weighted items are summed: maximum blood eosinophil count ≥ 1 x10^9/L +5; obstructive airway disease +3; nasal polyps +3; extravascular eosinophilic-predominant inflammation +2; mononeuritis multiplex or motor neuropathy not due to radiculopathy +1; and two NEGATIVE items — positive cANCA or anti-PR3 antibody -3, and hematuria -1. The total ranges -4 to +14; a cumulative score ≥ 6 (one point higher than the GPA/MPA threshold) classifies as eosinophilic granulomatosis with polyangiitis (sensitivity 85%, specificity 99%). It is a classification rule, not a diagnosis or a treatment order.';

const EGPA_ITEMS = [
  { key: 'eosinophilia', label: 'maximum blood eosinophil count ≥ 1 x10^9/L', pts: 5 },
  { key: 'airwayObstruction', label: 'obstructive airway disease', pts: 3 },
  { key: 'nasalPolyps', label: 'nasal polyps', pts: 3 },
  { key: 'extravascularEos', label: 'extravascular eosinophilic-predominant inflammation', pts: 2 },
  { key: 'mononeuritis', label: 'mononeuritis multiplex or motor neuropathy not due to radiculopathy', pts: 1 },
  { key: 'cAncaPr3', label: 'positive cANCA or anti-PR3 antibody', pts: -3 },
  { key: 'hematuria', label: 'hematuria', pts: -1 },
];

const signed = (pts) => `${pts > 0 ? '+' : ''}${pts}`;

export function egpaAcrEular2022(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const parts = [];
  for (const it of EGPA_ITEMS) {
    if (onFlag(o[it.key])) { total += it.pts; parts.push(`${it.label} (${signed(it.pts)})`); }
  }
  const t = num('2022 EGPA total', total, { min: -4, max: 14 });
  const isEgpa = t >= 6;
  return {
    valid: true,
    score: t,
    bandLabel: isEgpa ? 'Classified as EGPA' : 'Not classified',
    abnormal: isEgpa,
    band: isEgpa
      ? `2022 ACR/EULAR ${t}/14 — ≥ 6: classify as eosinophilic granulomatosis with polyangiitis.`
      : `2022 ACR/EULAR ${t}/14 — < 6: does not meet the classification threshold.`,
    detail: (parts.length ? parts.join('; ') : 'no weighted items present') + '.',
    note: EGPA_NOTE,
  };
}
