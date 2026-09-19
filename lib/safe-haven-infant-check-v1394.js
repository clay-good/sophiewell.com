// spec-v1394: safe-haven infant surrender -- New York, New Jersey, and Texas. California has its own
// tool (ca-safe-surrender, Health & Safety Code 1255.7).
//
// Sources, read 2026-09-19:
//   TX Family Code 262.301-262.309 (official mirror tcss.legis.texas.gov; 262.302 as amended by SB 780,
//     effective September 1, 2023). A designated emergency infant care provider (an EMS provider, a
//     hospital, a licensed freestanding emergency medical care facility, a fire department, or a
//     qualifying child-placing agency) takes possession, without a court order, of a child who
//     "appears to be 60 days old or younger" if a parent voluntarily delivers the child -- to an
//     employee, or in a newborn safety device inside the facility -- and did not express an intent to
//     return. No duty (and no right, unless the child appears abused or neglected) to detain or
//     pursue the parent, who may stay anonymous; a voluntary medical-history form may be offered.
//     The provider does what is needed to protect the child's health and safety (262.302(c)) and
//     notifies the Department of Family and Protective Services "not later than the close of the
//     first business day after" taking possession (262.303(a)). Records are confidential (262.308).
//   NJ N.J.S.A. 30:4C-15.7 (FindLaw, current as of January 1, 2024): a child who "is or appears to be
//     no more than 30 days old", left without an expressed intent to return at a police station, a
//     24-hour fire station or ambulance, first aid, or rescue squad, or a licensed general hospital.
//     The person need not give a name. The receiving site gives the care needed to protect the
//     child's health and safety; fire, police, and squad staff take the child to a hospital
//     emergency department; the hospital notifies the Division of Child Protection and Permanency
//     "no later than the first business day after taking possession".
//   NY Penal Law 260.00 (nysenate text via newyork.public.law, updated September 22, 2014): the
//     parent is not guilty of abandonment if the child is not more than 30 days old, is left with an
//     appropriate person or in a suitable location with prompt notice of where, and with intent that
//     the child be safe and cared for. It is a defense for the parent; the New York statutes read set
//     no steps or deadline for the person who receives the child.
//
// Deadlines "by the first business day after" are read as the end of that business day in the
// state's legal-holiday calendar.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { stateOptions, parseDateTime, nextBusinessDay, parseDate, scopeSentence } from './state-calendar.js';

export const SH_VERIFIED = '2026-09-19';
export const SH_STATES = stateOptions(['NY', 'NJ', 'TX']);
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const LIMIT = { NY: 30, NJ: 30, TX: 60 };
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function dayText(t) {
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function safeHavenInfantCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const st = SH_STATES.find((s) => s.value === o.state);
  if (!st) return { valid: false, message: 'Choose New York, New Jersey, or Texas. For California, use the California Safely Surrendered Baby Checklist.' };
  if (isBlank(o.ageDays)) return { valid: false, message: `Enter the infant's age in days, or an estimate. The ${st.text} limit is ${LIMIT[st.value]} days.` };
  const age = Number(String(o.ageDays).trim());
  if (!Number.isFinite(age) || age < 0 || age > 366) return { valid: false, message: "Enter the infant's age in days." };
  const limit = LIMIT[st.value];

  if (st.value === 'NY') {
    const within = age <= limit;
    return {
      valid: true,
      eligible: within,
      abnormal: !within,
      bandLabel: within ? 'Within New York\'s 30 days' : 'Older than 30 days',
      band: within
        ? `At ${age} days old the child is within the 30 days of New York's safe-haven defense (Penal Law 260.00(2)). The defense protects the parent who leaves the child with an appropriate person or in a suitable location and promptly says where.`
        : `At ${age} days old the child is older than the 30 days New York's safe-haven defense covers (Penal Law 260.00(2)). Care for the child and follow your facility's child-protection policy.`,
      steps: ['Give the child whatever care is needed now.', 'The New York statutes read set no steps or deadline for the person who receives the child. Follow your facility\'s policy for an abandoned infant.'],
      postureNote: scopeSentence(SH_VERIFIED),
    };
  }

  if (o.intentToReturn !== 'yes' && o.intentToReturn !== 'no') return { valid: false, message: 'Answer whether the parent said they intend to come back for the child. The law applies only when they did not.' };
  if (isBlank(o.received)) return { valid: false, message: 'Enter when the child was received. The notice deadline runs from it.' };
  const t = parseDateTime(o.received);
  if (t === null) return { valid: false, message: 'Enter when the child was received as a date and time.' };

  const within = age <= limit;
  const returning = o.intentToReturn === 'yes';
  const noticeDay = parseDate(nextBusinessDay(st.value, t));
  const agency = st.value === 'TX' ? 'the Department of Family and Protective Services' : 'the Division of Child Protection and Permanency';
  const ref = st.value === 'TX' ? 'Family Code 262.303(a)' : 'N.J.S.A. 30:4C-15.7';
  const notice = `Notify ${agency} by the close of ${dayText(noticeDay)}, the first business day after the child was received (${ref}).`;

  const steps = st.value === 'TX'
    ? [
      'Do whatever is needed to protect the child\'s health and safety (262.302(c)).',
      o.abuse === 'yes'
        ? 'The child appears abused or neglected, so the provider may detain or pursue the parent (262.302(b)); report it as your abuse-reporting duty requires.'
        : o.abuse === 'no'
          ? 'Do not detain or pursue the parent, and do not ask who they are; they may stay anonymous. Offer the voluntary form for the child\'s medical history (262.302(b)).'
          : 'Do not detain or pursue the parent unless the child appears abused or neglected; the parent may stay anonymous. Offer the voluntary form for the child\'s medical history (262.302(b)). Signs of abuse or neglect were not entered.',
      notice,
      'Keep every record identifying the parent confidential (262.308).',
    ]
    : [
      'Give the care needed to protect the child\'s health and safety. The person leaving the child need not give a name (30:4C-15.7).',
      'At a police station, fire station, or ambulance, first aid, or rescue squad, take the child to a hospital emergency department.',
      `The hospital: ${notice.charAt(0).toLowerCase()}${notice.slice(1)}`,
    ];

  let bandLabel;
  let band;
  if (returning) {
    bandLabel = 'Not a safe-haven delivery';
    band = `The parent said they intend to return, so ${st.value === 'TX' ? 'Family Code 262.302' : 'N.J.S.A. 30:4C-15.7'} does not apply as written. Care for the child and follow your abuse and neglect reporting duties.`;
  } else if (!within) {
    bandLabel = `Older than ${limit} days`;
    band = `At ${age} days old the child is older than the ${limit} days ${st.text}'s safe-haven law covers${st.value === 'TX' ? ' (the test is whether the child appears 60 days old or younger)' : ' (the test is whether the child is or appears 30 days old or younger)'}. Care for the child and follow your abuse and neglect reporting duties.`;
  } else {
    bandLabel = `Eligible; notify by close of ${dayText(noticeDay)}`;
    band = `Eligible: ${age} days old, within ${st.text}'s ${limit} days. ${notice}`;
  }
  return {
    valid: true,
    eligible: within && !returning,
    noticeBy: new Date(noticeDay).toISOString().slice(0, 10),
    abnormal: returning || !within,
    bandLabel,
    band,
    steps: within && !returning ? steps : steps.slice(0, 1),
    postureNote: scopeSentence(SH_VERIFIED),
  };
}
