// spec-v1476: ASAS criteria for inflammatory back pain, the feeder for asas-axspa's "inflammatory
// back pain" item.
//
// Sources, read 2026-09-25:
//   Sieper J, van der Heijde D, Landewe R, et al. New criteria for inflammatory back pain in patients
//     with chronic back pain: a real patient exercise by experts from the Assessment of
//     SpondyloArthritis international Society (ASAS). Ann Rheum Dis. 2009;68(6):784-788 (the original).
//   The items as stated in open sources that apply them, which agree on the five items and the rule:
//     PMC8917757: "ASAS criteria for inflammatory back pain criteria include 4 of the 5 following:
//       improvement with exercise, pain at night, insidious onset, age at onset < 40 years, and no
//       improvement with rest".
//     PMC12367853: "at least four out of five parameters present: (1) age at onset <= 40 years; (2)
//       insidious onset; (3) improvement with exercise; (4) no improvement with rest; and (5) pain at
//       night (with improvement upon getting up)". The two restate the age item differently (< 40 and
//       <= 40); the item is asked as "under 40" and the difference is named.
//   Accuracy in referred chronic back pain: RMD Open 2018 (DIVERS, PMC6336095), Table 3: for axial
//     spondyloarthritis, ASAS IBP sensitivity 74.4% to 83.9% and specificity 31.1% to 39.5% across
//     assessors.
//
// The criteria apply to chronic back pain (3 months or more). A checkbox left unticked is an item not
// present, the house convention for a criteria list. Pure: no DOM, no clock, no network.

const truthy = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes';

export const IBP_ITEMS = [
  { key: 'ageUnder40', text: 'age at onset under 40' },
  { key: 'insidious', text: 'insidious onset' },
  { key: 'exercise', text: 'improvement with exercise' },
  { key: 'noRestRelief', text: 'no improvement with rest' },
  { key: 'nightPain', text: 'pain at night, improving on getting up' },
];

export function asasIbp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!truthy(o.chronic)) {
    return {
      valid: false,
      message: 'Choose whether the back pain has lasted 3 months or more: the ASAS criteria are defined for chronic back pain only.',
    };
  }
  const present = IBP_ITEMS.filter((it) => truthy(o[it.key]));
  const absent = IBP_ITEMS.filter((it) => !truthy(o[it.key]));
  const n = present.length;
  const met = n >= 4;
  const notes = [
    met
      ? 'This answers yes to the "inflammatory back pain" feature of the ASAS classification criteria for axial spondyloarthritis.'
      : 'This does not give the "inflammatory back pain" feature of the ASAS classification criteria for axial spondyloarthritis.',
    'Inflammatory back pain is weak evidence on its own. Among patients referred with chronic back pain, the ASAS criteria found axial spondyloarthritis with a sensitivity of 74% to 84% but a specificity of only 31% to 39% (RMD Open 2018).',
    'Restatements of the criteria write the age item both as under 40 and as 40 or under; it only matters at exactly 40.',
  ];
  return {
    valid: true,
    met,
    count: n,
    present: present.map((it) => it.text),
    abnormal: met,
    band: met
      ? `Meets the ASAS criteria for inflammatory back pain: ${n} of 5 (${present.map((it) => it.text).join(', ')}); 4 are needed.`
      : `Does not meet the ASAS criteria for inflammatory back pain: ${n} of 5, and 4 are needed${absent.length ? ` (not present: ${absent.map((it) => it.text).join(', ')})` : ''}.`,
    bandLabel: `${n} of 5${met ? ', met' : ', not met'}`,
    notes,
    note: 'Sieper J et al, Ann Rheum Dis 2009 (ASAS experts); items as restated in open studies that apply them. It classifies the back pain, not the patient; it is not a diagnosis of spondyloarthritis.',
  };
}
