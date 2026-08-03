// spec-v638: 2022 ACR/EULAR Takayasu Arteritis Classification Criteria.
//
// The large-vessel-vasculitis companion to the built gca-acr-eular-2022 tile,
// published in the same 2022 ACR/EULAR series. Source (verified from Figure 1,
// the official criteria box, p. 1876):
//   Grayson PC, Ponte C, Suppiah R, et al. 2022 American College of
//   Rheumatology/EULAR Classification Criteria for Takayasu Arteritis.
//   Arthritis Rheumatol. 2022;74(12):1872-1880. doi:10.1002/art.42324
//   (co-published Ann Rheum Dis. 2022;81(12):1654-1660, doi:10.1136/ard-2022-223482).
//
// Two ABSOLUTE requirements must both be met before scoring: age <= 60 at
// diagnosis, and evidence of vasculitis on imaging. The criteria are applied only
// once a diagnosis of medium- or large-vessel vasculitis has been made and mimics
// excluded. Ten weighted items then sum to a maximum of 19; a cumulative score
// >= 5 classifies as Takayasu arteritis (sensitivity 93.8%, specificity 99.2%).
// No item carries a negative weight (unlike the companion GCA criteria).
//
// Pure: no DOM, no clock, no network. Same return contract as gcaAcrEular2022.

import { num } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

export const TAKAYASU_NOTE = '2022 ACR/EULAR Takayasu Arteritis Classification Criteria (Grayson PC, Ponte C, Suppiah R, et al, Arthritis Rheumatol 2022;74(12):1872-1880) — applied only once a diagnosis of medium- or large-vessel vasculitis has been made and mimics excluded, with two absolute requirements: age ≤ 60 at diagnosis and evidence of vasculitis on imaging. The weighted items are: abdominal aorta involvement with renal or mesenteric involvement (+3); the number of affected arterial territories (one +1, two +2, three or more +3); +2 each for angina/ischemic cardiac pain, arm or leg claudication, a vascular bruit, a reduced upper-extremity pulse, and a carotid-artery abnormality; and +1 each for female sex, an arm systolic blood-pressure difference ≥ 20 mmHg, and symmetric involvement of paired arteries — maximum 19. A cumulative score ≥ 5 classifies as Takayasu arteritis (sensitivity 93.8%, specificity 99.2%). It is a classification rule, not a diagnosis or a treatment order.';

// Checkbox items (present/absent). The arterial-territory count is a separate
// select handled below because it is weighted +1/+2/+3, not a flag.
const TAKAYASU_ITEMS = [
  { key: 'female', label: 'female sex', pts: 1 },
  { key: 'angina', label: 'angina or ischemic cardiac pain', pts: 2 },
  { key: 'claudication', label: 'arm or leg claudication', pts: 2 },
  { key: 'bruit', label: 'vascular bruit', pts: 2 },
  { key: 'reducedPulse', label: 'reduced pulse in upper extremity', pts: 2 },
  { key: 'carotid', label: 'carotid artery abnormality', pts: 2 },
  { key: 'bpDiff', label: 'arm SBP difference ≥ 20 mmHg', pts: 1 },
  { key: 'symmetric', label: 'symmetric involvement of paired arteries', pts: 1 },
  { key: 'abdoAorta', label: 'abdominal aorta with renal or mesenteric involvement', pts: 3 },
];

// Number of affected arterial territories: select one. '' / 'none' -> 0.
const TERRITORY_PTS = { none: 0, one: 1, two: 2, three: 3 };

export function takayasuAcrEular2022(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!onFlag(o.ageEntry) || !onFlag(o.imagingEntry)) {
    return {
      valid: true,
      applicable: false,
      abnormal: false,
      bandLabel: 'Criteria not applicable',
      band: 'Entry requirements not met — the 2022 criteria apply only when BOTH absolute requirements hold: age ≤ 60 at diagnosis AND evidence of vasculitis on imaging (after a diagnosis of medium/large-vessel vasculitis with mimics excluded).',
      detail: 'Confirm both absolute requirements before scoring.',
      note: TAKAYASU_NOTE,
    };
  }
  let total = 0;
  const parts = [];
  for (const it of TAKAYASU_ITEMS) {
    if (onFlag(o[it.key])) { total += it.pts; parts.push(`${it.label} (+${it.pts})`); }
  }
  const terrKey = o.territories == null ? 'none' : String(o.territories);
  const terrPts = TERRITORY_PTS[terrKey] || 0;
  if (terrPts > 0) {
    const terrLabel = terrKey === 'three' ? 'three or more arterial territories' : `${terrKey} arterial territor${terrKey === 'one' ? 'y' : 'ies'}`;
    total += terrPts;
    parts.push(`${terrLabel} (+${terrPts})`);
  }
  const t = num('2022 Takayasu total', total, { min: 0, max: 19 });
  const isTak = t >= 5;
  return {
    valid: true,
    applicable: true,
    score: t,
    bandLabel: isTak ? 'Classified as Takayasu arteritis' : 'Not classified',
    abnormal: isTak,
    band: isTak
      ? `2022 ACR/EULAR ${t}/19 — ≥ 5: classify as Takayasu arteritis.`
      : `2022 ACR/EULAR ${t}/19 — < 5: does not meet the classification threshold.`,
    detail: (parts.length ? parts.join('; ') : 'no weighted items present') + '.',
    note: TAKAYASU_NOTE,
  };
}
