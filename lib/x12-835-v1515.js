// spec-v1515: structural and arithmetic reader for X12 835 005010X221A1.
// Segment layouts are facts; no X12 description text or internal code labels ship.
import { eraBalance } from './billing-v83.js';

const GROUPS = ['CO', 'PR', 'OA', 'PI'];

function cents(value, label) {
  const text = String(value ?? '').trim();
  const match = /^(-?)(\d{1,11})(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) throw new RangeError(`${label} must be a dollar amount with no more than 2 decimal places.`);
  const amount = Number(match[2]) * 100 + Number((match[3] || '').padEnd(2, '0'));
  return match[1] ? -amount : amount;
}

function splitFile(input) {
  const text = String(input ?? '').replace(/^\uFEFF/, '').trimStart();
  if (!text.startsWith('ISA') || text.length < 4) throw new RangeError('The file must begin with an ISA interchange header.');
  const element = text[3];
  if (/\r|\n/.test(element)) throw new RangeError('The ISA element separator is invalid.');
  let terminator = text.length > 105 && text.slice(0, 4) === `ISA${element}` ? text[105] : '';
  if (!terminator || /[A-Za-z0-9]/.test(terminator)) terminator = text.includes('~') ? '~' : '\n';
  const segments = text.split(terminator).map((raw) => raw.trim()).filter(Boolean).map((raw, index) => {
    const parts = raw.split(element);
    return { id: parts[0], elements: parts.slice(1), position: index + 1 };
  });
  if (!segments.length || segments[0].id !== 'ISA') throw new RangeError('The ISA interchange header is missing.');
  return { segments, element, terminator };
}

function requireSegment(segment, id, message) {
  if (!segment || segment.id !== id) throw new RangeError(message);
}

function parseCas(segment) {
  const group = String(segment.elements[0] || '').toUpperCase();
  if (!GROUPS.includes(group)) throw new RangeError(`CAS at segment ${segment.position} has an unsupported adjustment group.`);
  const adjustments = [];
  for (let index = 1; index < segment.elements.length; index += 3) {
    const reason = String(segment.elements[index] || '').trim();
    const amount = segment.elements[index + 1];
    if (!reason && (amount === '' || amount === undefined)) continue;
    if (!reason || amount === '' || amount === undefined) throw new RangeError(`CAS at segment ${segment.position} has an incomplete reason and amount pair.`);
    adjustments.push({ group, reason, amountCents: cents(amount, `CAS amount at segment ${segment.position}`) });
  }
  return adjustments;
}

const blankTotals = () => ({ CO: 0, PR: 0, OA: 0, PI: 0 });

function addAdjustments(totals, adjustments) {
  for (const item of adjustments) totals[item.group] += item.amountCents;
}

function balance(billedCents, paidCents, adjustments) {
  const totals = blankTotals();
  addAdjustments(totals, adjustments);
  // A reversal (CLP02 22) sends its amounts negative. eraBalance checks a claim as a person types it and
  // refuses a negative billed or paid amount, so the same arithmetic is done here with the signs as sent.
  if (billedCents < 0 || paidCents < 0) {
    const sumAdjCents = totals.CO + totals.PR + totals.OA + totals.PI;
    const residualCents = billedCents - paidCents - sumAdjCents;
    return { billedCents, paidCents, coCents: totals.CO, prCents: totals.PR, oaCents: totals.OA, piCents: totals.PI, sumAdjCents, residualCents, balanced: residualCents === 0, patientResponsibilityCents: totals.PR, note: 'A reversal: the amounts are negative, and billed - paid - adjustments is checked as sent.', adjustmentTotals: totals };
  }
  return { ...eraBalance({ billedCents, paidCents, coCents: totals.CO, prCents: totals.PR, oaCents: totals.OA, piCents: totals.PI }), adjustmentTotals: totals };
}

function finishClaim(claim) {
  for (const line of claim.serviceLines) line.balance = balance(line.billedCents, line.paidCents, line.adjustments);
  const allAdjustments = [...claim.adjustments, ...claim.serviceLines.flatMap((line) => line.adjustments)];
  claim.balance = balance(claim.billedCents, claim.paidCents, allAdjustments);
  claim.patientResponsibilityMatches = claim.patientResponsibilityCents === claim.balance.patientResponsibilityCents;
  claim.balance.balanced = claim.balance.balanced && claim.patientResponsibilityMatches;
  return claim;
}

function parseTransaction(segments, transactionIndex) {
  const bpr = segments.find((segment) => segment.id === 'BPR');
  if (!bpr || !bpr.elements[1]) throw new RangeError(`Transaction ${transactionIndex} is missing BPR02 payment amount.`);
  const trace = segments.find((segment) => segment.id === 'TRN');
  const claims = [];
  const providerAdjustments = [];
  let payerName = '';
  let claim = null;
  let service = null;
  for (const segment of segments) {
    if (segment.id === 'N1' && segment.elements[0] === 'PR') {
      payerName = String(segment.elements[1] || segment.elements[3] || '').trim();
    } else if (segment.id === 'CLP') {
      if (claim) claims.push(finishClaim(claim));
      claim = {
        patientControlNumber: String(segment.elements[0] || '').trim(),
        statusCode: String(segment.elements[1] || '').trim(),
        billedCents: cents(segment.elements[2], `CLP03 at segment ${segment.position}`),
        paidCents: cents(segment.elements[3], `CLP04 at segment ${segment.position}`),
        patientResponsibilityCents: cents(segment.elements[4] || '0', `CLP05 at segment ${segment.position}`),
        payerClaimControlNumber: String(segment.elements[6] || '').trim(),
        patientName: '', memberId: '', serviceDate: '', renderingProvider: '', adjustments: [], remarks: [], serviceLines: [],
        segmentPosition: segment.position,
      };
      service = null;
    } else if (segment.id === 'SVC' && claim) {
      const procedureCode = String(segment.elements[0] || '').trim();
      const procedureParts = procedureCode.split(':');
      service = {
        procedureCode,
        billingCode: procedureParts.length > 1 ? procedureParts[1] : procedureParts[0],
        modifiers: procedureParts.slice(2).filter(Boolean),
        billedCents: cents(segment.elements[1], `SVC02 at segment ${segment.position}`),
        paidCents: cents(segment.elements[2], `SVC03 at segment ${segment.position}`),
        serviceDate: '', renderingProvider: '', adjustments: [], remarks: [], segmentPosition: segment.position,
      };
      claim.serviceLines.push(service);
    } else if (segment.id === 'LQ' && claim && segment.elements[0] === 'HE') {
      // Remittance advice remark codes (RARCs), as codes only.
      (service || claim).remarks.push(String(segment.elements[1] || '').trim());
    } else if (segment.id === 'CAS' && claim) {
      const values = parseCas(segment);
      (service ? service.adjustments : claim.adjustments).push(...values);
    } else if (segment.id === 'NM1' && claim) {
      if (['QC', 'IL'].includes(segment.elements[0])) {
        const last = String(segment.elements[2] || '').trim();
        const first = String(segment.elements[3] || '').trim();
        if (!claim.patientName) claim.patientName = [first, last].filter(Boolean).join(' ');
        if (!claim.memberId) claim.memberId = String(segment.elements[8] || '').trim();
      } else if (segment.elements[0] === '82') {
        const provider = String(segment.elements[8] || segment.elements[2] || '').trim();
        if (service) service.renderingProvider = provider;
        else claim.renderingProvider = provider;
      }
    } else if (segment.id === 'DTM' && claim) {
      const qualifier = segment.elements[0];
      if (service && qualifier === '472') service.serviceDate = String(segment.elements[1] || '').trim();
      else if (!service && ['232', '233'].includes(qualifier) && !claim.serviceDate) claim.serviceDate = String(segment.elements[1] || '').trim();
    } else if (segment.id === 'PLB') {
      for (let index = 2; index < segment.elements.length; index += 2) {
        const reference = String(segment.elements[index] || '').trim();
        const amount = segment.elements[index + 1];
        if (!reference && (amount === '' || amount === undefined)) continue;
        if (!reference || amount === '' || amount === undefined) throw new RangeError(`PLB at segment ${segment.position} has an incomplete reference and amount pair.`);
        providerAdjustments.push({ reference, amountCents: cents(amount, `PLB amount at segment ${segment.position}`) });
      }
    }
  }
  if (claim) claims.push(finishClaim(claim));
  if (!claims.length) throw new RangeError(`Transaction ${transactionIndex} contains no CLP claim segments.`);
  const paymentCents = cents(bpr.elements[1], `BPR02 in transaction ${transactionIndex}`);
  const claimPaidCents = claims.reduce((sum, item) => sum + item.paidCents, 0);
  const providerAdjustmentCents = providerAdjustments.reduce((sum, item) => sum + item.amountCents, 0);
  const paymentResidualCents = claimPaidCents - providerAdjustmentCents - paymentCents;
  return {
    traceNumber: String(trace?.elements[1] || '').trim(), payerName,
    paymentDate: String(bpr.elements[15] || '').trim(),
    paymentCents, claimPaidCents, providerAdjustmentCents, paymentResidualCents,
    balanced: paymentResidualCents === 0,
    providerAdjustments, claims,
  };
}

export function parse835(input) {
  const { segments, element, terminator } = splitFile(input);
  requireSegment(segments.at(-1), 'IEA', 'The interchange is truncated: IEA trailer is missing.');
  const isa = segments[0];
  const iea = segments.at(-1);
  if (String(isa.elements[12] || '') !== String(iea.elements[1] || '')) throw new RangeError('ISA13 and IEA02 interchange control numbers do not match.');
  const groups = [];
  for (let index = 1; index < segments.length - 1;) {
    requireSegment(segments[index], 'GS', `Expected GS at segment ${segments[index]?.position || index + 1}.`);
    const start = index;
    while (index < segments.length && segments[index].id !== 'GE') index += 1;
    requireSegment(segments[index], 'GE', 'The functional group is truncated: GE trailer is missing.');
    const groupSegments = segments.slice(start, index + 1);
    const gs = groupSegments[0]; const ge = groupSegments.at(-1);
    if (String(gs.elements[5] || '') !== String(ge.elements[1] || '')) throw new RangeError('GS06 and GE02 group control numbers do not match.');
    groups.push(groupSegments);
    index += 1;
  }
  if (Number(iea.elements[0]) !== groups.length) throw new RangeError('IEA01 does not match the number of functional groups.');
  const transactions = [];
  for (const group of groups) {
    const sets = [];
    for (let index = 1; index < group.length - 1;) {
      requireSegment(group[index], 'ST', `Expected ST at segment ${group[index]?.position || 0}.`);
      const start = index;
      while (index < group.length && group[index].id !== 'SE') index += 1;
      requireSegment(group[index], 'SE', 'The transaction is truncated: SE trailer is missing.');
      const set = group.slice(start, index + 1);
      const st = set[0]; const se = set.at(-1);
      if (st.elements[0] !== '835') throw new RangeError(`ST01 at segment ${st.position} is not 835.`);
      if (String(st.elements[1] || '') !== String(se.elements[1] || '')) throw new RangeError('ST02 and SE02 transaction control numbers do not match.');
      if (Number(se.elements[0]) !== set.length) throw new RangeError(`SE01 says ${se.elements[0]} segments, but the transaction contains ${set.length}.`);
      sets.push(set);
      index += 1;
    }
    if (Number(group.at(-1).elements[0]) !== sets.length) throw new RangeError('GE01 does not match the number of transaction sets.');
    for (const set of sets) transactions.push(parseTransaction(set, transactions.length + 1));
  }
  const claims = transactions.flatMap((transaction, transactionIndex) => transaction.claims.map((claim) => ({ ...claim, transactionIndex })));
  const serviceLines = claims.flatMap((claim) => claim.serviceLines);
  return {
    valid: true, elementSeparator: element, segmentTerminator: terminator,
    transactions, claims,
    summary: {
      transactionCount: transactions.length,
      claimCount: claims.length,
      serviceLineCount: serviceLines.length,
      balancedClaims: claims.filter((claim) => claim.balance.balanced).length,
      balancedServiceLines: serviceLines.filter((line) => line.balance.balanced).length,
      balancedPayments: transactions.filter((transaction) => transaction.balanced).length,
      patientResponsibilityCents: claims.reduce((sum, claim) => sum + claim.balance.patientResponsibilityCents, 0),
    },
  };
}
