// spec-v1501 §3 / spec-v1515: read 005010X217 278 prior authorization RESPONSES (BHT02 11). For each patient
// event (HL EV, loop 2000E) and service (HL SS, loop 2000F) it reports the HCR decision -- the raw action code
// grouped as approved, partly approved, denied, pended, modified, cancelled, contact the payer, deferred or no
// action -- with the review or tracking number (HCR02), the raw reason code (HCR03), the certification dates
// (DTP AAH), service dates (DTP 472), the service code, any AAA rejection (raw reason and follow-up codes) and
// the payer's MSG text. Layout read in the CMS esMD X12N 278 companion guide (examples with HCR*A4**0U and the
// UTN in HCR02). It never ships X12 code descriptions.

function splitFile(input) {
  const text = String(input ?? '').replace(/^﻿/, '').trimStart();
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
  const sets = []; let groups = 0;
  for (let index = 1; index < segments.length - 1;) {
    requireSegment(segments[index], 'GS', `Expected GS at segment ${segments[index]?.position || index + 1}.`);
    const start = index;
    while (index < segments.length && segments[index].id !== 'GE') index += 1;
    requireSegment(segments[index], 'GE', 'The functional group is truncated: GE trailer is missing.');
    const group = segments.slice(start, index + 1); const gs = group[0]; const ge = group.at(-1);
    if (String(gs.elements[5] || '') !== String(ge.elements[1] || '')) throw new RangeError('GS06 and GE02 group control numbers do not match.');
    let count = 0;
    for (let i = 1; i < group.length - 1;) {
      requireSegment(group[i], 'ST', `Expected ST at segment ${group[i]?.position || 0}.`);
      const s = i;
      while (i < group.length && group[i].id !== 'SE') i += 1;
      requireSegment(group[i], 'SE', 'The transaction is truncated: SE trailer is missing.');
      const set = group.slice(s, i + 1); const st = set[0]; const se = set.at(-1);
      if (st.elements[0] !== '278') throw new RangeError(`ST01 at segment ${st.position} is not 278.`);
      if (String(st.elements[1] || '') !== String(se.elements[1] || '')) throw new RangeError('ST02 and SE02 transaction control numbers do not match.');
      if (Number(se.elements[0]) !== set.length) throw new RangeError(`SE01 says ${se.elements[0]} segments, but the transaction contains ${set.length}.`);
      const version = st.elements[2] || gs.elements[7] || '';
      if (!String(version).includes('X217')) throw new RangeError(`Unsupported 278 version ${version || '(not reported)'}; use 005010X217.`);
      sets.push({ set, version }); count += 1; i += 1;
    }
    if (Number(ge.elements[0]) !== count) throw new RangeError('GE01 does not match the number of transaction sets.');
    groups += 1; index += 1;
  }
  if (Number(iea.elements[0]) !== groups) throw new RangeError('IEA01 does not match the number of functional groups.');
  if (!sets.length) throw new RangeError('The interchange contains no 278 transaction sets.');
  return { sets, component: isa.elements[15] || ':' };
}

// HCR01 action codes, grouped only.
export const DECISION = { A1: 'approved', A2: 'partly approved', A3: 'denied', A4: 'pended', A6: 'modified', C: 'cancelled', CT: 'contact the payer', D: 'deferred', NA: 'no action required' };
const ORDER = { rejected: 0, denied: 1, 'partly approved': 2, modified: 3, 'contact the payer': 4, pended: 5, deferred: 6, cancelled: 7, 'no decision': 8, 'no action required': 9, approved: 10 };

function isoDate(value) {
  const raw = String(value || '').trim();
  return raw.split('-').map((d) => (/^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d)).join(' to ');
}

function parseTransaction(segments, version, component) {
  const bht = segments.find((s) => s.id === 'BHT');
  if (bht && bht.elements[1] === '13') throw new RangeError('This is a 278 request (BHT02 13), not a response: this reader reads the payer\'s answer.');
  const decisions = [];
  let level = ''; let payer = ''; let requester = ''; let patientName = ''; let memberId = '';
  let current = null;
  const rejects = [];
  const close = () => { if (current) decisions.push(current); current = null; };
  for (const segment of segments) {
    const e = segment.elements;
    if (segment.id === 'HL') {
      close();
      level = e[2] || '';
      if (level === '22' || level === '23') { patientName = ''; memberId = ''; }
      if (level === 'EV' || level === 'SS') {
        current = { level: level === 'EV' ? 'patient event' : 'service', payer, requester, patientName, memberId, trace: '', serviceType: '', code: '', actionCode: '', decision: 'no decision', reviewNumber: '', reasonCode: '', certified: '', serviceDates: '', rejections: [], message: '', segmentPosition: segment.position };
      }
    } else if (segment.id === 'NM1') {
      const name = [e[3], e[2]].filter(Boolean).join(' ');
      if (level === '20') payer = name;
      else if (level === '21') requester = name;
      else if ((level === '22' || level === '23') && (e[0] === 'IL' || e[0] === 'QC')) { patientName = name; memberId = e[8] || memberId; }
    } else if (segment.id === 'AAA') {
      const r = { level: level || 'interchange', valid: e[0] || '', reason: e[2] || '', followUp: e[3] || '', segmentPosition: segment.position };
      if (current) current.rejections.push(r); else rejects.push(r);
    } else if (current && segment.id === 'TRN') {
      if (!current.trace) current.trace = e[1] || '';
    } else if (current && segment.id === 'UM') {
      current.serviceType = e[2] || '';
    } else if (current && segment.id === 'HCR') {
      current.actionCode = e[0] || '';
      current.decision = DECISION[current.actionCode] || 'unknown code';
      current.reviewNumber = e[1] || '';
      current.reasonCode = e[2] || '';
    } else if (current && segment.id === 'DTP') {
      if (e[0] === 'AAH') current.certified = isoDate(e[2]);
      else if (e[0] === '472') current.serviceDates = isoDate(e[2]);
    } else if (current && /^SV[1-3]$/.test(segment.id)) {
      const parts = String(e[0] || '').split(component);
      current.code = parts.slice(1).join(component) || parts[0] || '';
    } else if (current && segment.id === 'MSG') {
      current.message = e[0] || '';
    }
  }
  close();
  for (const d of decisions) if (d.rejections.length && d.decision === 'no decision') d.decision = 'rejected';
  if (!decisions.length && !rejects.length) throw new RangeError('The 278 response contains no patient event or service level (HL EV or SS) and no AAA rejection.');
  return { version, decisions, rejects };
}

export function read278(input) {
  const { segments, element, terminator } = splitFile(input);
  const { sets, component } = transactionSets(segments);
  const transactions = sets.map(({ set, version }) => parseTransaction(set, version, component));
  const decisions = transactions.flatMap((t) => t.decisions).sort((a, b) => (ORDER[a.decision] ?? 8) - (ORDER[b.decision] ?? 8));
  const rejects = transactions.flatMap((t) => t.rejects);
  const count = (k) => decisions.filter((d) => d.decision === k).length;
  return {
    valid: true, elementSeparator: element, segmentTerminator: terminator, componentSeparator: component, transactions, decisions, rejects,
    summary: { transactionCount: transactions.length, decisions: decisions.length, approved: count('approved'), denied: count('denied'), pended: count('pended'), rejected: count('rejected') + (decisions.length ? 0 : rejects.length), other: decisions.length - count('approved') - count('denied') - count('pended') - count('rejected') },
  };
}
