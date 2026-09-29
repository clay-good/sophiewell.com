// spec-v1515: read factual structure and raw values from 005010X279A1 271 responses.
// Labels below are project-authored; X12 code-list descriptions do not ship.

const BENEFIT_LABELS = Object.freeze({
  '1': 'Active coverage', '6': 'Inactive coverage', A: 'Coinsurance', B: 'Copayment',
  C: 'Deductible', D: 'Benefit information', E: 'Excluded', G: 'Out-of-pocket limit',
  H: 'No stated limit', I: 'Not covered', N: 'Restricted benefit', U: 'Contact another entity',
});
const COVERAGE_LABELS = Object.freeze({
  IND: 'Individual', FAM: 'Family', EMP: 'Employee', SPO: 'Spouse', DEP: 'Dependents',
  ECH: 'Employee and children', ESP: 'Employee and spouse', SPC: 'Spouse and children',
});
const SERVICE_LABELS = Object.freeze({
  '1': 'Medical care', '30': 'Health plan coverage', '33': 'Chiropractic', '35': 'Dental',
  '47': 'Hospital', '48': 'Hospital inpatient', '50': 'Hospital outpatient',
  '86': 'Emergency care', '88': 'Pharmacy', '98': 'Professional care', AL: 'Vision',
});
const PERIOD_LABELS = Object.freeze({
  '6': 'hour', '7': 'day', '13': '24 hours', '22': 'service year', '23': 'calendar year',
  '24': 'year to date', '25': 'contract', '26': 'episode', '27': 'visit',
  '28': 'remaining', '29': 'remaining in the calendar year', '30': 'lifetime',
  '31': 'remaining lifetime', '32': 'benefit period', '33': 'remaining benefit period',
});
const NETWORK_LABELS = Object.freeze({ Y: 'In network', N: 'Out of network', W: 'Network does not apply', U: 'Network not stated' });
const REFERENCE_LABELS = Object.freeze({ '18': 'Plan number', '1L': 'Group or policy number', '6P': 'Group number', IG: 'Policy number' });

function splitFile(input) {
  const text = String(input ?? '').replace(/^\uFEFF/, '').trimStart();
  if (!text.startsWith('ISA') || text.length < 4) throw new RangeError('The response must begin with an ISA interchange header.');
  const element = text[3];
  if (/\r|\n/.test(element)) throw new RangeError('The ISA element separator is invalid.');
  let terminator = text.length > 105 ? text[105] : '';
  if (!terminator || /[A-Za-z0-9]/.test(terminator)) terminator = text.includes('~') ? '~' : '\n';
  const segments = text.split(terminator).map((raw) => raw.trim()).filter(Boolean).map((raw, index) => {
    const parts = raw.split(element);
    return { id: parts[0], elements: parts.slice(1), position: index + 1 };
  });
  return { segments, element, terminator };
}

function requireSegment(segment, id, message) {
  if (!segment || segment.id !== id) throw new RangeError(message);
}

function transactionSets(segments) {
  requireSegment(segments[0], 'ISA', 'The ISA interchange header is missing.');
  requireSegment(segments.at(-1), 'IEA', 'The interchange is truncated: IEA trailer is missing.');
  const isa = segments[0]; const iea = segments.at(-1);
  if (String(isa.elements[12] || '') !== String(iea.elements[1] || '')) throw new RangeError('ISA13 and IEA02 interchange control numbers do not match.');
  const groups = [];
  for (let index = 1; index < segments.length - 1;) {
    requireSegment(segments[index], 'GS', `Expected GS at segment ${segments[index]?.position || index + 1}.`);
    const start = index;
    while (index < segments.length && segments[index].id !== 'GE') index += 1;
    requireSegment(segments[index], 'GE', 'The functional group is truncated: GE trailer is missing.');
    const group = segments.slice(start, index + 1); const gs = group[0]; const ge = group.at(-1);
    if (String(gs.elements[5] || '') !== String(ge.elements[1] || '')) throw new RangeError('GS06 and GE02 group control numbers do not match.');
    groups.push(group); index += 1;
  }
  if (Number(iea.elements[0]) !== groups.length) throw new RangeError('IEA01 does not match the number of functional groups.');
  const sets = [];
  for (const group of groups) {
    const groupSets = [];
    for (let index = 1; index < group.length - 1;) {
      requireSegment(group[index], 'ST', `Expected ST at segment ${group[index]?.position || 0}.`);
      const start = index;
      while (index < group.length && group[index].id !== 'SE') index += 1;
      requireSegment(group[index], 'SE', 'The transaction is truncated: SE trailer is missing.');
      const set = group.slice(start, index + 1); const st = set[0]; const se = set.at(-1);
      if (st.elements[0] !== '271') throw new RangeError(`ST01 at segment ${st.position} is not 271.`);
      if (String(st.elements[1] || '') !== String(se.elements[1] || '')) throw new RangeError('ST02 and SE02 transaction control numbers do not match.');
      if (Number(se.elements[0]) !== set.length) throw new RangeError(`SE01 says ${se.elements[0]} segments, but the transaction contains ${set.length}.`);
      const version = st.elements[2] || group[0].elements[7] || '';
      if (!String(version).includes('X279')) throw new RangeError(`Unsupported 271 version ${version || '(not reported)'}; use 005010X279A1.`);
      groupSets.push({ set, version }); index += 1;
    }
    if (Number(group.at(-1).elements[0]) !== groupSets.length) throw new RangeError('GE01 does not match the number of transaction sets.');
    sets.push(...groupSets);
  }
  if (!sets.length) throw new RangeError('The interchange contains no 271 transaction sets.');
  return { sets, repetition: isa.elements[10] || '^' };
}

function dateValue(format, value) {
  const raw = String(value || '').trim();
  const one = (item) => /^\d{8}$/.test(item) ? `${item.slice(0, 4)}-${item.slice(4, 6)}-${item.slice(6, 8)}` : item;
  if (format === 'RD8') { const [start, end] = raw.split('-'); return end ? `${one(start)} to ${one(end)}` : one(start); }
  return one(raw);
}

function decimal(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

const rawLabel = (map, code, fallback) => map[code] || `${fallback} ${code || '(blank)'}`;

function parseBenefit(segment, repetition) {
  const e = segment.elements;
  const amount = decimal(e[6]); const percent = decimal(e[7]);
  const serviceCodes = String(e[2] || '').split(repetition).filter(Boolean);
  return {
    informationCode: e[0] || '', informationLabel: rawLabel(BENEFIT_LABELS, e[0], 'Benefit code'),
    coverageLevel: e[1] || '', coverageLabel: rawLabel(COVERAGE_LABELS, e[1], 'Coverage level'),
    serviceTypeCodes: serviceCodes, serviceTypeLabels: serviceCodes.map((code) => rawLabel(SERVICE_LABELS, code, 'Service type')),
    insuranceType: e[3] || '', description: e[4] || '',
    timePeriod: e[5] || '', timePeriodLabel: rawLabel(PERIOD_LABELS, e[5], 'Time period'),
    amount, percent, quantityQualifier: e[8] || '', quantity: decimal(e[9]),
    authorizationRequired: e[10] || '', network: e[11] || '', networkLabel: rawLabel(NETWORK_LABELS, e[11], 'Network code'),
    procedure: e[12] || '', dates: [], messages: [], segmentPosition: segment.position,
  };
}

function benefitKey(benefit) {
  return [benefit.informationCode, benefit.coverageLevel, benefit.serviceTypeCodes.join('^'), benefit.network].join('|');
}

function money(value) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function benefitSubject(benefit) {
  const coverage = benefit.coverageLevel ? benefit.coverageLabel : '';
  const service = benefit.serviceTypeLabels.length ? benefit.serviceTypeLabels.join(', ') : '';
  return [coverage, benefit.informationLabel, service && service !== 'Health plan coverage' ? `for ${service}` : '', benefit.network ? benefit.networkLabel.toLowerCase() : ''].filter(Boolean).join(' ');
}

function summarizeBenefits(benefits) {
  const remaining = new Map(benefits.filter((item) => item.timePeriod === '29' && item.amount != null).map((item) => [benefitKey(item), item.amount]));
  return benefits.map((item) => {
    const subject = benefitSubject(item);
    if (item.amount != null) {
      const suffix = item.timePeriod ? ` for the ${item.timePeriodLabel}` : '';
      const rest = item.timePeriod === '23' ? remaining.get(benefitKey(item)) : null;
      return `${subject}: ${money(item.amount)}${suffix}${rest == null ? '' : `; ${money(rest)} remaining`}.`;
    }
    if (item.percent != null) return `${subject}: ${(item.percent * 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}%.`;
    if (item.informationCode === '1' || item.informationCode === '6') {
      const dates = item.dates.map((date) => date.value).join('; ');
      return `${item.informationLabel}${dates ? `: ${dates}` : ''}.`;
    }
    return `${subject}${item.description ? `: ${item.description}` : '.'}`;
  }).filter((line, index, all) => all.indexOf(line) === index);
}

function parseTransaction(segments, version, repetition) {
  const people = []; const transactionErrors = [];
  let person = null; let benefit = null;
  const finish = () => {
    if (!person) return;
    person.coverage.push(...person.benefits.filter((item) => item.informationCode === '1' || item.informationCode === '6').map((item) => ({ status: item.informationCode === '1' ? 'active' : 'inactive', dates: item.dates, segmentPosition: item.segmentPosition })));
    person.summary = summarizeBenefits(person.benefits);
    people.push(person); person = null; benefit = null;
  };
  for (const segment of segments) {
    if (segment.id === 'HL' && (segment.elements[2] === '22' || segment.elements[2] === '23')) {
      finish(); person = { relationship: segment.elements[2] === '22' ? 'subscriber' : 'dependent', name: '', memberId: '', planIdentifiers: [], coverage: [], benefits: [], errors: [], summary: [] }; benefit = null;
    } else if (segment.id === 'NM1' && person && (segment.elements[0] === 'IL' || segment.elements[0] === '03')) {
      person.name = [segment.elements[3], segment.elements[2]].filter(Boolean).join(' ');
      person.memberId = String(segment.elements[8] || '');
    } else if (segment.id === 'REF' && person && REFERENCE_LABELS[segment.elements[0]]) {
      person.planIdentifiers.push({ qualifier: segment.elements[0], label: REFERENCE_LABELS[segment.elements[0]], value: segment.elements[1] || '', segmentPosition: segment.position });
    } else if (segment.id === 'EB' && person) {
      benefit = parseBenefit(segment, repetition); person.benefits.push(benefit);
    } else if (segment.id === 'DTP' && person) {
      const date = { qualifier: segment.elements[0] || '', format: segment.elements[1] || '', value: dateValue(segment.elements[1], segment.elements[2]), raw: segment.elements[2] || '', segmentPosition: segment.position };
      if (benefit) benefit.dates.push(date); else person.coverage.push({ status: 'reported', dates: [date], segmentPosition: segment.position });
    } else if (segment.id === 'MSG' && benefit) {
      benefit.messages.push(segment.elements[0] || '');
    } else if (segment.id === 'AAA') {
      const error = { rejectReasonCode: segment.elements[2] || '', followUpCode: segment.elements[3] || '', segmentPosition: segment.position };
      if (person) person.errors.push(error); else transactionErrors.push(error);
    }
  }
  finish();
  if (!people.length && !transactionErrors.length) throw new RangeError('The 271 transaction contains no subscriber, dependent or AAA response.');
  return { version, people, errors: transactionErrors };
}

export function read271(input) {
  const { segments, element, terminator } = splitFile(input);
  const { sets, repetition } = transactionSets(segments);
  const transactions = sets.map(({ set, version }) => parseTransaction(set, version, repetition));
  const people = transactions.flatMap((transaction) => transaction.people);
  const benefits = people.flatMap((person) => person.benefits.map((benefit) => ({ ...benefit, personName: person.name, memberId: person.memberId })));
  const errorCount = transactions.reduce((sum, transaction) => sum + transaction.errors.length, 0) + people.reduce((sum, person) => sum + person.errors.length, 0);
  return {
    valid: true, elementSeparator: element, segmentTerminator: terminator, repetitionSeparator: repetition,
    transactions, people, benefits,
    summary: { transactionCount: transactions.length, personCount: people.length, benefitCount: benefits.length, activePeople: people.filter((person) => person.coverage.some((item) => item.status === 'active')).length, inactivePeople: people.filter((person) => person.coverage.some((item) => item.status === 'inactive')).length, errorCount },
  };
}
