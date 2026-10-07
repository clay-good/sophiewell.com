// spec-v1501 §3 / spec-v1515: read 005010X231A1 999 implementation acknowledgments. A 999 answers one
// submitted functional group (AK1): for each transaction set in it (AK2) the segment errors (IK3), element
// errors (IK4) and the set's acknowledgment code (IK5), then the group's code and counts (AK9).
// It reports raw codes and positions and classifies each set as accepted, accepted with errors, or
// rejected; it never ships X12 code descriptions. The counts in AK9 are checked against the AK2 loops.

function splitFile(input) {
  const text = String(input ?? '').replace(/^﻿/, '').trimStart();
  if (!text.startsWith('ISA') || text.length < 4) throw new RangeError('The acknowledgment must begin with an ISA interchange header.');
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
  const sets = [];
  let groups = 0;
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
      if (st.elements[0] !== '999') throw new RangeError(`ST01 at segment ${st.position} is not 999.`);
      if (String(st.elements[1] || '') !== String(se.elements[1] || '')) throw new RangeError('ST02 and SE02 transaction control numbers do not match.');
      if (Number(se.elements[0]) !== set.length) throw new RangeError(`SE01 says ${se.elements[0]} segments, but the transaction contains ${set.length}.`);
      const version = st.elements[2] || gs.elements[7] || '';
      if (!String(version).includes('X231')) throw new RangeError(`Unsupported 999 version ${version || '(not reported)'}; use 005010X231A1.`);
      sets.push({ set, version }); count += 1; i += 1;
    }
    if (Number(ge.elements[0]) !== count) throw new RangeError('GE01 does not match the number of transaction sets.');
    groups += 1; index += 1;
  }
  if (Number(iea.elements[0]) !== groups) throw new RangeError('IEA01 does not match the number of functional groups.');
  if (!sets.length) throw new RangeError('The interchange contains no 999 transaction sets.');
  return { sets, component: isa.elements[15] || ':' };
}

// IK501 and AK901 codes, classified only. A and E accept the set (E with errors noted); M, R, W and X reject it.
// AK901 adds P: some sets in the group were accepted.
const SET_OUTCOME = { A: 'accepted', E: 'accepted with errors', M: 'rejected', R: 'rejected', W: 'rejected', X: 'rejected' };
const GROUP_OUTCOME = { A: 'accepted', E: 'accepted with errors', P: 'partially accepted', R: 'rejected', M: 'rejected', W: 'rejected', X: 'rejected' };

function parseTransaction(segments, version, component) {
  let ak1 = null; let ak9 = null;
  const acks = [];
  let current = null; let lastIk3 = null;
  for (const segment of segments) {
    const e = segment.elements;
    if (segment.id === 'AK1') ak1 = { functionalId: e[0] || '', groupControl: e[1] || '', version: e[2] || '' };
    else if (segment.id === 'AK2') {
      current = { setId: e[0] || '', control: e[1] || '', version: e[2] || '', errors: [], code: '', setErrorCodes: [], outcome: 'not acknowledged', segmentPosition: segment.position };
      acks.push(current); lastIk3 = null;
    } else if (current && segment.id === 'IK3') {
      lastIk3 = { segment: e[0] || '', position: e[1] || '', loop: e[2] || '', code: e[3] || '', elements: [], segmentPosition: segment.position };
      current.errors.push(lastIk3);
    } else if (current && segment.id === 'IK4') {
      const pos = String(e[0] || '').split(component);
      const err = { element: pos[0] || '', component: pos[1] || '', reference: e[1] || '', code: e[2] || '', badValue: e[3] || '', segmentPosition: segment.position };
      if (lastIk3) lastIk3.elements.push(err);
      else current.errors.push({ segment: '', position: '', loop: '', code: '', elements: [err], segmentPosition: segment.position });
    } else if (current && segment.id === 'IK5') {
      current.code = e[0] || '';
      current.setErrorCodes = e.slice(1).filter(Boolean);
      current.outcome = SET_OUTCOME[current.code] || 'unknown code';
    } else if (segment.id === 'AK9') {
      ak9 = { code: e[0] || '', included: Number(e[1]), received: Number(e[2]), accepted: Number(e[3]), errorCodes: e.slice(4).filter(Boolean), segmentPosition: segment.position };
    }
  }
  if (!ak1) throw new RangeError('The 999 has no AK1 segment naming the group it acknowledges.');
  if (!ak9) throw new RangeError('The 999 has no AK9 segment with the group acknowledgment.');
  const findings = [];
  const missing = acks.filter((a) => !a.code);
  if (missing.length) findings.push(`${missing.length} transaction set${missing.length === 1 ? '' : 's'} (AK2) ${missing.length === 1 ? 'has' : 'have'} no IK5 acknowledgment code.`);
  if (acks.length && Number.isFinite(ak9.received) && ak9.received !== acks.length) findings.push(`AK9 says ${ak9.received} transaction sets were received, but the 999 acknowledges ${acks.length}.`);
  const acceptedCount = acks.filter((a) => a.outcome === 'accepted' || a.outcome === 'accepted with errors').length;
  if (acks.length && Number.isFinite(ak9.accepted) && ak9.accepted !== acceptedCount) findings.push(`AK9 says ${ak9.accepted} transaction sets were accepted, but ${acceptedCount} of the AK2 loops ${acceptedCount === 1 ? 'carries' : 'carry'} an accepting IK5 code.`);
  return {
    version, functionalId: ak1.functionalId, groupControl: ak1.groupControl, groupVersion: ak1.version,
    groupCode: ak9.code, groupOutcome: GROUP_OUTCOME[ak9.code] || 'unknown code', included: ak9.included, received: ak9.received, accepted: ak9.accepted,
    groupErrorCodes: ak9.errorCodes, acks, findings,
  };
}

export function read999(input) {
  const { segments, element, terminator } = splitFile(input);
  const { sets, component } = transactionSets(segments);
  const transactions = sets.map(({ set, version }) => parseTransaction(set, version, component));
  const acks = transactions.flatMap((t) => t.acks.map((a) => ({ ...a, groupControl: t.groupControl, functionalId: t.functionalId })));
  return {
    valid: true, elementSeparator: element, segmentTerminator: terminator, componentSeparator: component, transactions, acks,
    summary: {
      groups: transactions.length,
      groupsRejected: transactions.filter((t) => t.groupOutcome === 'rejected').length,
      sets: acks.length,
      accepted: acks.filter((a) => a.outcome === 'accepted').length,
      acceptedWithErrors: acks.filter((a) => a.outcome === 'accepted with errors').length,
      rejected: acks.filter((a) => a.outcome === 'rejected').length,
      errors: acks.reduce((n, a) => n + a.errors.length, 0),
      findings: transactions.flatMap((t) => t.findings),
    },
  };
}
