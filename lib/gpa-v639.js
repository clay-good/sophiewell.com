// spec-v639: 2022 ACR/EULAR Classification Criteria for Granulomatosis with
// Polyangiitis (GPA).
//
// The third of the 2022 ACR/EULAR vasculitis series in the catalog, after
// gca-acr-eular-2022 and takayasu-acr-eular-2022. Source (verified verbatim from
// Figure 1, the official criteria box):
//   Robson JC, Grayson PC, Ponte C, et al. 2022 American College of
//   Rheumatology/EULAR Classification Criteria for Granulomatosis With
//   Polyangiitis. Arthritis Rheumatol. 2022;74(3):393-399. doi:10.1002/art.41986
//   (co-published Ann Rheum Dis. 2022;81(3):315-320, doi:10.1136/annrheumdis-2021-221795).
//
// Applied only once a diagnosis of small- or medium-vessel vasculitis has been
// made and mimics excluded (a consideration, stated in the note; unlike the
// Takayasu/GCA large-vessel criteria there is no scored absolute-requirement
// gate). Ten weighted items are summed, TWO of them NEGATIVE (positive pANCA/MPO
// -1, and blood eosinophils >= 1 x10^9/L -4): the negatives point toward MPA and
// EGPA respectively, so a naive all-positive implementation misclassifies. The
// total ranges -5 to +17; a cumulative score >= 5 classifies as GPA (validation
// sensitivity 93%, specificity 94%).
//
// Pure: no DOM, no clock, no network. Same return contract as the family.

import { num } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

export const GPA_NOTE = '2022 ACR/EULAR Classification Criteria for Granulomatosis with Polyangiitis (Robson JC, Grayson PC, Ponte C, et al, Arthritis Rheumatol 2022;74(3):393-399) — applied only once a diagnosis of small- or medium-vessel vasculitis has been made and mimics excluded. Ten weighted items are summed: nasal involvement (bloody discharge, ulcers, crusting, congestion, blockage, or septal defect/perforation) +3; cartilaginous involvement +2; conductive or sensorineural hearing loss +1; positive cANCA or anti-PR3 antibody +5; pulmonary nodules, mass, or cavitation on imaging +2; granuloma, extravascular granulomatous inflammation, or giant cells on biopsy +2; nasal/paranasal sinus inflammation, consolidation, or effusion, or mastoiditis on imaging +1; pauci-immune glomerulonephritis on biopsy +1; and two NEGATIVE items that point elsewhere — positive pANCA or anti-MPO antibody -1, and a blood eosinophil count ≥ 1 x10^9/L -4. The total ranges -5 to +17; a cumulative score ≥ 5 classifies as granulomatosis with polyangiitis (sensitivity 93%, specificity 94%). It is a classification rule, not a diagnosis or a treatment order.';

const GPA_ITEMS = [
  { key: 'nasal', label: 'nasal involvement (bloody discharge, ulcers, crusting, congestion, blockage, or septal defect/perforation)', pts: 3 },
  { key: 'cartilage', label: 'cartilaginous involvement', pts: 2 },
  { key: 'hearingLoss', label: 'conductive or sensorineural hearing loss', pts: 1 },
  { key: 'cAnca', label: 'positive cANCA or anti-PR3 antibody', pts: 5 },
  { key: 'pulmNodule', label: 'pulmonary nodules, mass, or cavitation on imaging', pts: 2 },
  { key: 'granuloma', label: 'granuloma, extravascular granulomatous inflammation, or giant cells on biopsy', pts: 2 },
  { key: 'sinus', label: 'nasal/paranasal sinus inflammation, consolidation, or effusion, or mastoiditis on imaging', pts: 1 },
  { key: 'pauciGn', label: 'pauci-immune glomerulonephritis on biopsy', pts: 1 },
  { key: 'pAnca', label: 'positive pANCA or anti-MPO antibody', pts: -1 },
  { key: 'eosinophilia', label: 'blood eosinophil count ≥ 1 x10^9/L', pts: -4 },
];

const signed = (pts) => `${pts > 0 ? '+' : ''}${pts}`;

export function gpaAcrEular2022(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const parts = [];
  for (const it of GPA_ITEMS) {
    if (onFlag(o[it.key])) { total += it.pts; parts.push(`${it.label} (${signed(it.pts)})`); }
  }
  const t = num('2022 GPA total', total, { min: -5, max: 17 });
  const isGpa = t >= 5;
  return {
    valid: true,
    score: t,
    bandLabel: isGpa ? 'Classified as GPA' : 'Not classified',
    abnormal: isGpa,
    band: isGpa
      ? `2022 ACR/EULAR ${t}/17 — ≥ 5: classify as granulomatosis with polyangiitis.`
      : `2022 ACR/EULAR ${t}/17 — < 5: does not meet the classification threshold.`,
    detail: (parts.length ? parts.join('; ') : 'no weighted items present') + '.',
    note: GPA_NOTE,
  };
}
