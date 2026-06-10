// HIPAA / regulatory deadline math. Deterministic date arithmetic only;
// no judgment about whether a breach occurred.
//
// HIPAA Breach Notification Rule (45 CFR 164.404, 164.406, 164.408):
//   - Discovery date = first day on which the breach is known, or by
//     exercising reasonable diligence would have been known, to the
//     covered entity (45 CFR 164.404(a)(2)).
//   - Individual notice: "without unreasonable delay" and in no case later
//     than 60 calendar days after discovery (164.404(b)).
//   - Media notice (>= 500 affected residents of a state/jurisdiction):
//     same 60-day deadline (164.406(b)).
//   - HHS Secretary notice:
//       * >= 500 individuals: contemporaneously with individual notice
//         (no later than 60 days after discovery) (164.408(b)).
//       * < 500 individuals: annual log, due no later than 60 days after
//         the end of the calendar year in which the breach was discovered
//         (164.408(c)).
//
// Returned dates are ISO YYYY-MM-DD strings in UTC; the regulation uses
// "calendar days" without a timezone qualifier, so the calculator treats
// the discovery date as UTC midnight to avoid DST/locale drift.
//
// spec-v63 OA1: the UTC-midnight date primitives now live in lib/deadline.js
// (the shared regulatory-deadline engine); breach-clock consumes them so its
// 60-calendar-day math runs through the same audited code path as every other
// ops deadline tile. The result is byte-identical to the prior inline version
// (regression-pinned by test/unit/regulatory.test.js).

import { parseIsoStrict, fmtUtc as fmt, addCalendarDaysUtc as addDaysUtc } from './deadline.js';

export function breachNotificationDeadlines({ discoveryDate, affectedIndividuals }) {
  const start = parseIsoStrict(discoveryDate, 'discoveryDate');
  if (typeof affectedIndividuals !== 'number' || !Number.isFinite(affectedIndividuals)
      || affectedIndividuals < 0 || !Number.isInteger(affectedIndividuals)) {
    throw new TypeError('affectedIndividuals must be a non-negative integer');
  }

  // 60 calendar days after discovery, inclusive of the discovery date as day 0.
  // 164.404(b) wording: "in no case later than 60 calendar days after the
  // discovery". We surface the deadline date itself.
  const day60 = addDaysUtc(start, 60);

  // HHS annual log (sub-500 breaches): due 60 days after the end of the
  // calendar year of discovery.
  const yearEnd = new Date(Date.UTC(start.getUTCFullYear(), 11, 31));
  const hhsAnnual = addDaysUtc(yearEnd, 60);

  const isLarge = affectedIndividuals >= 500;
  const recipients = ['Affected individual(s) (45 CFR 164.404(b))'];
  if (isLarge) {
    recipients.push('Prominent media outlets serving the state/jurisdiction (45 CFR 164.406(b))');
    recipients.push('HHS Secretary, contemporaneously with individual notice (45 CFR 164.408(b))');
  } else {
    recipients.push(`HHS Secretary, via the annual log (45 CFR 164.408(c)) due ${fmt(hhsAnnual)}`);
  }

  return {
    discoveryDate: fmt(start),
    individualNoticeDeadline: fmt(day60),
    mediaNoticeDeadline: isLarge ? fmt(day60) : null,
    hhsNoticeDeadline: isLarge ? fmt(day60) : fmt(hhsAnnual),
    affectedIndividuals,
    threshold: isLarge ? '>=500 individuals: large-breach rules apply' : '<500 individuals: annual log to HHS',
    recipients,
    citation: '45 CFR §§164.404, 164.406, 164.408.',
    note: 'This calculator surfaces the regulatory deadline only. The Privacy Rule requires "without unreasonable delay" — covered entities should not wait until day 60 if notice can reasonably be sent sooner.',
  };
}

// --- spec-v63 OA3: generator completeness linting -------------------------
// The v52 document linter (pa-lint) is the sanctioned §3 tile shape that checks
// a document against a rule's required elements. OA3 extends that pattern at
// small scale to the other generators: each one's required elements are carried
// here as data with the governing CFR anchor, and `lintGenerator(kind, present)`
// returns one finding per element (present / missing) so the renderer can show
// "completeness check: what's missing to satisfy the rule." Pure: no I/O, no
// clock; it validates structure, it does not adjudicate or give legal advice.
export const GENERATOR_ELEMENTS = Object.freeze({
  // 45 CFR 164.508(c)(1): the core elements of a valid HIPAA authorization.
  'hipaa-auth': {
    title: '45 CFR 164.508(c) authorization core elements',
    elements: [
      { key: 'phi', label: 'Specific, meaningful description of the PHI to be used or disclosed', anchor: '45 CFR 164.508(c)(1)(i)' },
      { key: 'discloser', label: 'The person(s) authorized to make the use or disclosure', anchor: '45 CFR 164.508(c)(1)(ii)' },
      { key: 'recipient', label: 'The person(s) to whom the disclosure may be made', anchor: '45 CFR 164.508(c)(1)(iii)' },
      { key: 'purpose', label: 'A description of each purpose of the use or disclosure', anchor: '45 CFR 164.508(c)(1)(iv)' },
      { key: 'expiration', label: 'An expiration date or expiration event', anchor: '45 CFR 164.508(c)(1)(v)' },
      { key: 'individual', label: 'Signature of the individual (or personal representative) and date', anchor: '45 CFR 164.508(c)(1)(vi)' },
    ],
  },
  // 45 CFR 164.524: the practical elements of a right-of-access request.
  'hipaa-roa': {
    title: '45 CFR 164.524 right-of-access request elements',
    elements: [
      { key: 'individual', label: 'The individual (and identifier) making the request', anchor: '45 CFR 164.524(b)(1)' },
      { key: 'entity', label: 'The covered entity / record holder addressed', anchor: '45 CFR 164.524(b)(1)' },
      { key: 'records', label: 'The designated record set / specific records requested', anchor: '45 CFR 164.524(a)(1)' },
      { key: 'format', label: 'The form and format requested', anchor: '45 CFR 164.524(c)(2)' },
      { key: 'delivery', label: 'Where and how to send the records', anchor: '45 CFR 164.524(c)(3)' },
    ],
  },
  // 42 CFR 405.944(b): the content a Medicare redetermination request must
  // contain (the appeal-letter generator's required elements).
  'appeal-letter': {
    title: '42 CFR 405.944(b) redetermination request elements',
    elements: [
      { key: 'name', label: 'Beneficiary / patient name', anchor: '42 CFR 405.944(b)(1)' },
      { key: 'memberId', label: 'Medicare / member number', anchor: '42 CFR 405.944(b)(2)' },
      { key: 'service', label: 'The specific service(s) or item(s) and the date(s) at issue', anchor: '42 CFR 405.944(b)(3)' },
      { key: 'reason', label: 'The reason the party disagrees with the determination', anchor: '42 CFR 405.944(b)(4)' },
      { key: 'basis', label: 'The coverage / medical-necessity basis cited (diagnosis)', anchor: '42 CFR 405.940 (initial determination appealed)' },
    ],
  },
  // 45 CFR 164.404(c)(1): the required content of an individual breach notice.
  'breach-notice': {
    title: '45 CFR 164.404(c)(1) breach-notice content elements',
    elements: [
      { key: 'what', label: 'A brief description of what happened, incl. the breach and discovery dates', anchor: '45 CFR 164.404(c)(1)(A)' },
      { key: 'types', label: 'The types of unsecured PHI involved', anchor: '45 CFR 164.404(c)(1)(B)' },
      { key: 'steps', label: 'Steps individuals should take to protect themselves', anchor: '45 CFR 164.404(c)(1)(C)' },
      { key: 'mitigation', label: 'What the covered entity is doing to investigate, mitigate, and protect', anchor: '45 CFR 164.404(c)(1)(D)' },
      { key: 'contact', label: 'Contact procedures (toll-free number, email, website, or postal address)', anchor: '45 CFR 164.404(c)(1)(E)' },
    ],
  },
});

export function lintGenerator(kind, present) {
  const spec = GENERATOR_ELEMENTS[String(kind)];
  if (!spec) return null;
  let set;
  if (present instanceof Set) set = present;
  else if (Array.isArray(present)) set = new Set(present);
  else set = new Set(Object.keys(present || {}).filter((k) => present[k]));
  const findings = spec.elements.map((e) => ({
    key: e.key, label: e.label, anchor: e.anchor, present: set.has(e.key),
  }));
  const missing = findings.filter((f) => !f.present);
  return { title: spec.title, findings, missing, complete: missing.length === 0 };
}
