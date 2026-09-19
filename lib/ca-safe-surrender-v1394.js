// spec-v1394: California safely surrendered baby -- eligibility and the site's duties, Health &
// Safety Code 1255.7.
//
// Source: leginfo text read 2026-09-18.
//   (a), (b) A safe-surrender site (a designated hospital location, or a county- or fire-agency-
//     designated site) accepts physical custody of a child "72 hours old or younger" from a parent
//     or person with lawful custody. A qualified person places a coded, confidential ankle bracelet
//     on the child, offers the surrendering person a matching copy, and offers a medical
//     information questionnaire (which may be declined).
//   (c) The site ensures a medical screening examination and any necessary care; no parental consent
//     is needed.
//   (d)(1) "As soon as possible, but in no event later than 48 hours after" accepting custody, the
//     site notifies child protective services or the county child welfare agency.
//   (f) Before a dependency petition is filed, a person who asks for the child back while the site
//     still has custody gets the child back, unless abuse or neglect is known or suspected (the
//     surrender alone is not a basis for a report).
//   (g) After the petition, if the person returns "within 14 days of the voluntary surrender", the
//     agency verifies identity, assesses them, and may ask the court to dismiss.
//   (h) A site acting in good faith is not liable for accepting a child who turns out to be older
//     than 72 hours.
//
// Only California is covered: the NY, NJ, and TX safe-haven laws were not read.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime, addHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const SS_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function day(t) {
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function caSafeSurrender(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.ageHours)) return { valid: false, message: "Enter the infant's age in hours at surrender, or an estimate. Eligibility is 72 hours old or younger." };
  const age = Number(String(o.ageHours).trim());
  if (!Number.isFinite(age) || age < 0 || age > 8760) return { valid: false, message: "Enter the infant's age in hours." };
  if (isBlank(o.surrendered)) return { valid: false, message: 'Enter when custody was accepted. The 48-hour notice and the 14-day window run from it.' };
  const t = parseDateTime(o.surrendered);
  if (t === null) return { valid: false, message: 'Enter the surrender as a date and time.' };

  const eligible = age <= 72;
  const cps = addHours(t, 48);
  const reclaimAt = t + 14 * 86400000;
  const steps = [
    `Notify child protective services or the county child welfare agency as soon as possible, and no later than ${formatDeadline(t, cps.endWall, 'custody was accepted')} (1255.7(d)(1)). Send any medical information received, with the surrendering person's identifying details removed.`,
    'Ensure a medical screening examination and any necessary care; no parental consent is needed (1255.7(c)).',
    `A person who returns within 14 days, by ${day(reclaimAt)} (14 calendar days after the surrender), may reclaim the child: from the site before a petition is filed, or through the agency after (1255.7(f), (g)).`,
  ];
  const bracelet = o.bracelet === 'yes' || o.bracelet === 'no' ? o.bracelet : null;
  if (bracelet === 'no') steps.unshift('Place the coded, confidential ankle bracelet now, and offer the matching copy and the medical questionnaire to the person surrendering the child (1255.7(b)).');
  else if (bracelet === null) steps.unshift('Place a coded, confidential ankle bracelet, and offer the matching copy and the medical questionnaire (1255.7(b)).');

  return {
    valid: true,
    eligible,
    cpsBy: cps.end,
    abnormal: !eligible,
    bandLabel: eligible ? `Eligible; notify CPS by ${cps.end.replace('T', ' ')}` : 'Older than 72 hours',
    band: eligible
      ? `Eligible: ${age} hours old, within the 72 hours for a safe surrender. Notify CPS within 48 hours.`
      : `At ${age} hours the child is older than the 72 hours 1255.7 covers. A site that accepts the child in good faith is still protected (1255.7(h)); care for the child and notify child protective services.`,
    steps,
    caveats: [...cps.caveats],
    scopeNote: 'California only: the New York, New Jersey, and Texas safe-haven laws are not covered here.',
    postureNote: scopeSentence(SS_VERIFIED),
  };
}
