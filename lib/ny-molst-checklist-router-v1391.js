// spec-v1391: New York MOLST -- which legal requirements checklist applies.
//
// Source: NYSDOH MOLST page (health.ny.gov, page revised June 2025, with the MOLST Dear Administrator
// Letter of June 2025), read 2026-09-18. The checklists, by the Department's own titles:
//   #1 Adult patients with medical decision-making capacity (any setting).
//   #2 Adult patients without capacity who have a health care proxy (any setting).
//   #3 Adult hospital, hospice, or nursing home patients without capacity and without a proxy, where
//      the decision-maker is a Family Health Care Decisions Act (FHCDA) surrogate.
//   #4 The same patients for whom no FHCDA surrogate from the surrogate list is available.
//   #5 Adult patients in the community without capacity who do not have a proxy.
//   #6 Minor patients for whom decisions are made under the FHCDA.
//   OPWDD checklist: patients of ANY AGE with developmental disabilities who lack medical decision-
//      making capacity and do not have a health care proxy; it "must always be attached" to the MOLST.
// Review: the orders "should be reviewed and may be revised" by a physician, NP, or PA when the
// patient moves to a different setting and when preferences or medical conditions change.
//
// Pure: no DOM, no clock, no network.

export const MOLST_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const AGES = [
  { value: 'adult', text: 'Adult (18 or older)' },
  { value: 'minor', text: 'Minor' },
];
export const SETTINGS = [
  { value: 'facility', text: 'Hospital, hospice, or nursing home' },
  { value: 'community', text: 'Community (home, clinic, office)' },
];

const st = (v) => (v === 'yes' || v === 'no' ? v : null);

const CL = {
  1: 'Checklist #1: adult patients with medical decision-making capacity (any setting)',
  2: 'Checklist #2: adult patients without capacity who have a health care proxy (any setting)',
  3: 'Checklist #3: adult hospital, hospice, or nursing home patients without capacity or a proxy, with an FHCDA surrogate',
  4: 'Checklist #4: adult hospital, hospice, or nursing home patients without capacity or a proxy, and no FHCDA surrogate available',
  5: 'Checklist #5: adult patients in the community without capacity who do not have a proxy',
  6: 'Checklist #6: minor patients for whom decisions are made under the FHCDA',
  opwdd: 'OPWDD MOLST checklist: a person of any age with a developmental disability who lacks capacity and has no health care proxy',
};

export function nyMolstChecklistRouter(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = AGES.find((a) => a.value === o.age);
  if (!age) return { valid: false, message: 'Choose adult or minor. A minor has its own checklist.' };
  const dd = st(o.dd);
  if (!dd) return { valid: false, message: 'Answer whether the person has an intellectual or developmental disability. Without capacity or a proxy, that needs the OPWDD checklist.' };

  let key;
  let why;
  if (age.value === 'adult') {
    const cap = st(o.capacity);
    if (!cap) return { valid: false, message: 'Answer whether the patient has medical decision-making capacity.' };
    if (cap === 'yes') { key = 1; why = 'The patient decides for themselves.'; }
    else {
      const proxy = st(o.proxy);
      if (!proxy) return { valid: false, message: 'Answer whether the patient has a health care proxy.' };
      if (proxy === 'yes') { key = 2; why = 'The health care agent decides.'; }
      else if (dd === 'yes') { key = 'opwdd'; why = 'A developmental disability, no capacity, and no proxy: the OPWDD checklist must always be attached to the MOLST.'; }
      else {
        const setting = SETTINGS.find((s) => s.value === o.setting);
        if (!setting) return { valid: false, message: 'Choose the setting. Hospitals, hospices, and nursing homes use different checklists from the community.' };
        if (setting.value === 'community') { key = 5; why = 'In the community without capacity or a proxy.'; }
        else {
          const sur = st(o.surrogate);
          if (!sur) return { valid: false, message: 'Answer whether an FHCDA surrogate from the surrogate list is available.' };
          key = sur === 'yes' ? 3 : 4;
          why = sur === 'yes' ? 'An FHCDA surrogate decides.' : 'No one on the FHCDA surrogate list is available.';
        }
      }
    }
  } else if (dd === 'yes' && st(o.proxy) !== 'yes') {
    key = 'opwdd';
    why = 'The OPWDD checklist covers a person of any age with a developmental disability who lacks capacity and has no proxy.';
  } else {
    key = 6;
    why = 'Decisions for a minor are made under the FHCDA.';
  }
  return {
    valid: true,
    checklist: key,
    abnormal: false,
    bandLabel: key === 'opwdd' ? 'OPWDD MOLST checklist' : `Checklist #${key}`,
    band: `${CL[key]}. ${why}`,
    reviewNote: 'Review the orders, and revise them if needed, when the patient moves to a different setting and when their preferences or medical condition change. A physician, NP, or PA does this.',
    formNote: 'MOLST is the only authorized New York form for both a nonhospital DNR and a nonhospital DNI order. This follows the Department\'s MOLST page and checklists as revised in June 2025.',
  };
}
