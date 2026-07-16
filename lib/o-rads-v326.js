// spec-v326: ACR O-RADS US v2022 risk categories (ovarian-adnexal ultrasound). The
// radiologist selects the risk category; the tile reports the descriptor, the risk-of-
// malignancy band, and a general management direction. The catalog carries BI-RADS,
// Lung-RADS, and ACR TI-RADS but had no O-RADS ("o-rads" had zero corpus hits); it is the
// standard ovarian-adnexal-mass US risk system. "o-rads" / "ovarian mass risk category"
// routed to nothing.
//
// HIGH-STAKES: this reports the RISK CATEGORY the radiologist has assigned and its general
// management direction, NOT a diagnosis or an order (spec-v11 §5.3). Per the O-RADS
// governing concepts, management is guidance based on average risk and is modified by
// symptoms, personal/family history, and clinical judgement; the decision stays with the
// clinician and the patient.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Andreotti RF, Timmerman D, Strachowski LM, et al. O-RADS US Risk Stratification and
//     Management System: A Consensus Guideline from the ACR O-RADS Committee. Radiology.
//     2020;294(1):48-57 (updated in the ACR O-RADS US v2022 assessment categories).
//   - ACR O-RADS US v2022 assessment-category material and secondary reproductions, which
//     agree on the 0-5 categories and the 0% / < 1% / 1-<10% / 10-<50% / >= 50% risk bands.
//
// Categories (risk of malignancy in parentheses):
//   0 : incomplete evaluation (technically inadequate).
//   1 : normal premenopausal ovary (0%).
//   2 : almost certainly benign (< 1%).
//   3 : low risk (1% to < 10%).
//   4 : intermediate risk (10% to < 50%).
//   5 : high risk (>= 50%).

const CATEGORIES = {
  0: {
    label: 'O-RADS 0',
    text: 'O-RADS 0 — incomplete evaluation (technically inadequate; the ovary is not seen when it is expected). Management: further evaluation, such as a repeat or specialist ultrasound or MRI.',
    high: false,
  },
  1: {
    label: 'O-RADS 1',
    text: 'O-RADS 1 — normal premenopausal ovary (0% risk of malignancy). Management: no follow-up needed.',
    high: false,
  },
  2: {
    label: 'O-RADS 2',
    text: 'O-RADS 2 — almost certainly benign (less than 1% risk of malignancy), such as a classic simple cyst, hemorrhagic cyst, endometrioma, or dermoid. Management: none or optional follow-up, depending on the lesion, its size, and menopausal status.',
    high: false,
  },
  3: {
    label: 'O-RADS 3',
    text: 'O-RADS 3 — low risk (1% to less than 10% risk of malignancy). Management: ultrasound in specialist hands or MRI, or management by a specialist, depending on the lesion.',
    high: false,
  },
  4: {
    label: 'O-RADS 4',
    text: 'O-RADS 4 — intermediate risk (10% to less than 50% risk of malignancy). Management: MRI or referral to a gynecologist or gynecologic oncologist.',
    high: true,
  },
  5: {
    label: 'O-RADS 5',
    text: 'O-RADS 5 — high risk (at least 50% risk of malignancy). Management: referral to a gynecologic oncologist.',
    high: true,
  },
};

const NOTE = 'ACR O-RADS US v2022 risk categories (ovarian-adnexal ultrasound). 0: incomplete evaluation, further imaging needed. 1: normal premenopausal ovary (0%). 2: almost certainly benign (< 1%), none or optional follow-up. 3: low risk (1% to < 10%), specialist ultrasound or MRI. 4: intermediate risk (10% to < 50%), MRI or gynecology, gynecologic-oncology referral. 5: high risk (>= 50%), gynecologic-oncology referral. Risk is assigned from the lesion lexicon (size, locularity, solid components, color score, ascites, peritoneal nodules). Per the O-RADS governing concepts, management is guidance based on average risk and no acute symptoms, and may be modified by symptoms, personal or family history (e.g. BRCA), and clinical judgement. This reports the category and its general management, not a diagnosis or an order.';

// input:
//   category: 0 | 1 | 2 | 3 | 4 | 5
export function oRads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.category == null ? '' : o.category).trim();
  const c = CATEGORIES[raw];
  if (!c) {
    return { valid: false, message: 'Select the O-RADS category (0, 1, 2, 3, 4, or 5).' };
  }
  return {
    valid: true,
    category: Number(raw),
    highRisk: c.high,
    abnormal: c.high,
    bandLabel: c.label,
    band: c.text,
    note: NOTE,
  };
}
