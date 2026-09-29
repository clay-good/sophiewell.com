// spec-v1515: read factual structure and raw values from 005010X212 and X214 277 files.
// This module classifies workflow outcome but never ships X12 code descriptions.

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
      if (st.elements[0] !== '277') throw new RangeError(`ST01 at segment ${st.position} is not 277.`);
      if (String(st.elements[1] || '') !== String(se.elements[1] || '')) throw new RangeError('ST02 and SE02 transaction control numbers do not match.');
      if (Number(se.elements[0]) !== set.length) throw new RangeError(`SE01 says ${se.elements[0]} segments, but the transaction contains ${set.length}.`);
      const version = st.elements[2] || group[0].elements[7] || '';
      if (!String(version).includes('X212') && !String(version).includes('X214')) throw new RangeError(`Unsupported 277 version ${version || '(not reported)'}; use 005010X212 or 005010X214.`);
      groupSets.push({ set, version }); index += 1;
    }
    if (Number(group.at(-1).elements[0]) !== groupSets.length) throw new RangeError('GE01 does not match the number of transaction sets.');
    sets.push(...groupSets);
  }
  if (!sets.length) throw new RangeError('The interchange contains no 277 transaction sets.');
  return { sets, component: isa.elements[15] || ':' };
}

function isoDate(value) {
  const raw = String(value || '').trim();
  return /^\d{8}$/.test(raw) ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw;
}

function amount(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function statusComposite(value, component) {
  const [category = '', status = '', entity = ''] = String(value || '').split(component);
  return { category, status, entity, raw: String(value || '') };
}

function classify(statuses, acknowledgment) {
  if (statuses.some((item) => item.actionCode === 'U' || ['A3', 'A4', 'A8', 'F2'].includes(item.category) || (acknowledgment && item.category === 'A7'))) return 'rejected';
  if (statuses.some((item) => item.actionCode === 'WQ' || ['A0', 'A1', 'A2', 'F0', 'F1', 'F3', 'F4'].includes(item.category))) return 'accepted';
  return 'pending';
}

function parseTransaction(segments, version, component) {
  const acknowledgment = String(version).includes('X214');
  const claims = [];
  let personActive = false; let patientName = ''; let memberId = ''; let provider = ''; let claim = null; let serviceCode = '';
  const fresh = () => ({ reference: '', trace: '', payerClaimId: '', patientAccount: '', patientName, memberId, provider, serviceCodes: [], statuses: [], outcome: 'pending', amount: null });
  const finish = () => {
    if (!claim || !claim.statuses.length) { claim = null; serviceCode = ''; return; }
    claim.reference = claim.payerClaimId || claim.patientAccount || claim.reference || claim.trace || '(not reported)';
    claim.serviceCodes = [...new Set(claim.serviceCodes.filter(Boolean))];
    claim.outcome = classify(claim.statuses, acknowledgment);
    claims.push(claim); claim = null; serviceCode = '';
  };
  for (const segment of segments) {
    if (segment.id === 'HL') {
      finish();
      personActive = ['22', '23', 'PT'].includes(segment.elements[2]);
      if (personActive) { patientName = ''; memberId = ''; }
    } else if (segment.id === 'NM1') {
      const entity = segment.elements[0];
      if (personActive && (entity === 'IL' || entity === 'QC')) {
        patientName = [segment.elements[3], segment.elements[2]].filter(Boolean).join(' '); memberId = segment.elements[8] || '';
      } else if (entity === '85') provider = segment.elements[2] || '';
    } else if (personActive && segment.id === 'TRN') {
      finish(); claim = fresh(); claim.trace = segment.elements[1] || '';
    } else if (personActive && segment.id === 'REF') {
      claim ||= fresh(); const qualifier = segment.elements[0]; const value = segment.elements[1] || '';
      if (qualifier === '1K') claim.payerClaimId = value;
      else if (qualifier === 'EJ') claim.patientAccount = value;
      else if (qualifier === 'D9') claim.reference = value;
    } else if (personActive && segment.id === 'SVC') {
      serviceCode = String(segment.elements[0] || '').split(component).slice(1).join(component) || segment.elements[0] || '';
      claim ||= fresh(); claim.serviceCodes.push(serviceCode);
    } else if (personActive && segment.id === 'STC') {
      claim ||= fresh();
      const primary = statusComposite(segment.elements[0], component);
      // CMS examples place additional status composites after the blank payment fields.
      const extras = segment.elements.slice(8, 11).map((value) => statusComposite(value, component)).filter((item) => item.raw);
      const statusAmount = amount(segment.elements[3]);
      if (statusAmount != null) claim.amount = statusAmount;
      claim.statuses.push({ ...primary, additional: extras, effectiveDate: isoDate(segment.elements[1]), actionCode: segment.elements[2] || '', amount: statusAmount, serviceCode, segmentPosition: segment.position });
    }
  }
  finish();
  if (!claims.length) throw new RangeError('The 277 transaction contains no claim-level STC status segments.');
  return { version, type: acknowledgment ? '277CA' : '277', claims };
}

export function read277(input) {
  const { segments, element, terminator } = splitFile(input);
  const { sets, component } = transactionSets(segments);
  const transactions = sets.map(({ set, version }) => parseTransaction(set, version, component));
  const claims = transactions.flatMap((transaction) => transaction.claims.map((claim) => ({ ...claim, responseType: transaction.type })));
  const ordered = [...claims].sort((a, b) => ({ rejected: 0, pending: 1, accepted: 2 }[a.outcome] - { rejected: 0, pending: 1, accepted: 2 }[b.outcome]));
  return {
    valid: true, elementSeparator: element, segmentTerminator: terminator, componentSeparator: component,
    transactions, claims: ordered,
    summary: { transactionCount: transactions.length, claimCount: claims.length, accepted: claims.filter((claim) => claim.outcome === 'accepted').length, rejected: claims.filter((claim) => claim.outcome === 'rejected').length, pending: claims.filter((claim) => claim.outcome === 'pending').length, statusCount: claims.reduce((sum, claim) => sum + claim.statuses.length, 0) },
  };
}
