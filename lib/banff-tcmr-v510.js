// spec-v510: the Banff grade of acute (active) T cell-mediated rejection in a kidney allograft biopsy.
// Transplant pathology was a whole-concept gap: "banff", "tcmr", "tubulitis", "kidney transplant", and
// "allograft" were all zero-hit across the corpus and app.js.
//
// The three Banff lesion scores the pathologist has already assigned drive one category:
//   i - interstitial inflammation in non-scarred cortex (0-3)
//   t - tubulitis, mononuclear cells per tubular cross-section (0-3)
//   v - intimal arteritis (0-3)
//
// The v score dominates: any v lesion puts the biopsy in grade II or III regardless of i and t. With no
// arteritis, the i/t pair decides between borderline, IA, and IB.
//
// HIGH-STAKES: this applies the published rule to lesion scores a pathologist has already read off a biopsy.
// It does NOT read a biopsy, does NOT score i, t, or v, and is NOT an indication for steroids, thymoglobulin,
// plasmapheresis, or any change in immunosuppression (spec-v11 section 5.3). It covers acute T cell-mediated
// rejection only: antibody-mediated rejection is a separate diagnosis requiring microvascular inflammation,
// C4d, and donor-specific antibody, and chronic active T cell-mediated rejection is scored on different
// lesions (ti and i-IFTA). Intimal arteritis is not specific to rejection. A category of "none" here does not
// exclude rejection on an inadequately sampled biopsy. The treatment decision stays with the transplant
// nephrology and pathology team.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Loupy A, Haas M, Roufosse C, et al. The Banff 2019 Kidney Meeting Report (I): Updates on and
//     clarification of criteria for T cell- and antibody-mediated rejection. Am J Transplant.
//     2020;20(9):2318-2331.
//   - Transplant pathology references reproducing the same borderline definition and the same IA / IB / IIA /
//     IIB / III thresholds.

export const LESIONS = [
  {
    key: 'i',
    label: 'i - interstitial inflammation (non-scarred cortex)',
    options: [
      { value: '0', text: 'i0 - no or trivial inflammation (under 10%)' },
      { value: '1', text: 'i1 - 10 to 25% of cortex inflamed' },
      { value: '2', text: 'i2 - 26 to 50% of cortex inflamed' },
      { value: '3', text: 'i3 - over 50% of cortex inflamed' },
    ],
  },
  {
    key: 't',
    label: 't - tubulitis (mononuclear cells per tubular cross-section)',
    options: [
      { value: '0', text: 't0 - no mononuclear cells in tubules' },
      { value: '1', text: 't1 - 1 to 4 cells per tubular cross-section' },
      { value: '2', text: 't2 - 5 to 10 cells per tubular cross-section' },
      { value: '3', text: 't3 - over 10 cells, or at least 2 areas of basement-membrane destruction' },
    ],
  },
  {
    key: 'v',
    label: 'v - intimal arteritis',
    options: [
      { value: '0', text: 'v0 - no arteritis' },
      { value: '1', text: 'v1 - mild to moderate intimal arteritis in at least one artery' },
      { value: '2', text: 'v2 - severe intimal arteritis, over 25% of the luminal area' },
      { value: '3', text: 'v3 - transmural arteritis, or fibrinoid change and medial smooth-muscle necrosis' },
    ],
  },
];

const NOTE = 'The Banff grade of acute T cell-mediated rejection (Banff 2019 Kidney Meeting Report) is read from three lesion scores a pathologist has already assigned. Any intimal arteritis grades the biopsy II or III on its own: v1 is IIA, v2 is IIB, v3 is III. Without arteritis, tubulitis with only minor inflammation, or i2/i3 with t1 only, is borderline; i2 or i3 with t2 is IA and with t3 is IB. This applies the published rule to entered scores. It does not read a biopsy, and it is not an indication for steroids, thymoglobulin, or any change in immunosuppression. It covers T cell-mediated rejection only: antibody-mediated rejection is a separate diagnosis and chronic active rejection is scored on different lesions. A result of none does not exclude rejection on an inadequately sampled biopsy.';

const GRADES = {
  none: {
    grade: 'No acute T cell-mediated rejection',
    text: 'These lesion scores do not meet the threshold for borderline changes or for any grade of acute T cell-mediated rejection. Interstitial inflammation without tubulitis is not graded here.',
  },
  borderline: {
    grade: 'Borderline changes',
    text: 'Borderline changes, suspicious for acute T cell-mediated rejection: tubulitis with only minor interstitial inflammation, or significant interstitial inflammation with mild tubulitis only.',
  },
  IA: {
    grade: 'Grade IA',
    text: 'Grade IA: significant interstitial inflammation (i2 or i3) with moderate tubulitis (t2), and no intimal arteritis.',
  },
  IB: {
    grade: 'Grade IB',
    text: 'Grade IB: significant interstitial inflammation (i2 or i3) with severe tubulitis (t3), and no intimal arteritis.',
  },
  IIA: {
    grade: 'Grade IIA',
    text: 'Grade IIA: mild to moderate intimal arteritis (v1), with or without interstitial inflammation and tubulitis.',
  },
  IIB: {
    grade: 'Grade IIB',
    text: 'Grade IIB: severe intimal arteritis involving over 25% of the luminal area (v2).',
  },
  III: {
    grade: 'Grade III',
    text: 'Grade III: transmural arteritis, or arterial fibrinoid change with medial smooth-muscle necrosis and accompanying lymphocytic inflammation (v3).',
  },
};

function readScore(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 3) return NaN;
  return n;
}

// input:
//   i, t, v: each 0-3 (all three required).
export function banffTcmr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const i = readScore(o.i);
  const t = readScore(o.t);
  const v = readScore(o.v);

  if ([i, t, v].some((n) => n === null)) {
    return { valid: false, message: 'Enter all three lesion scores: i, t, and v.' };
  }
  if ([i, t, v].some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each lesion score must be a whole number from 0 to 3.' };
  }

  let key;
  if (v === 3) key = 'III';
  else if (v === 2) key = 'IIB';
  else if (v === 1) key = 'IIA';
  else if (t === 0) key = 'none';
  else if (i <= 1) key = 'borderline';
  else if (t === 1) key = 'borderline';
  else if (t === 2) key = 'IA';
  else key = 'IB';

  const g = GRADES[key];
  return {
    valid: true,
    category: key,
    scores: { i, t, v },
    bandLabel: g.grade,
    band: `i${i} t${t} v${v}: ${g.text}`,
    note: NOTE,
  };
}
