// spec-v1515: structural and arithmetic checks for X12 837P/837I claim files.
// Segment layouts and raw code values are facts; no X12 descriptions ship.
import { icd10Validate, mbiValidate, npiValidate } from './billing-v83.js';
import { todayUtc } from './pa/date.js';

function cents(value, label) {
  const match = /^(\d{1,11})(?:\.(\d{1,2}))?$/.exec(String(value ?? '').trim());
  if (!match) throw new RangeError(`${label} must be a non-negative dollar amount with no more than 2 decimal places.`);
  return Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'));
}

function splitFile(input) {
  const text = String(input ?? '').replace(/^\uFEFF/, '').trimStart();
  if (!text.startsWith('ISA') || text.length < 4) throw new RangeError('The file must begin with an ISA interchange header.');
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
      if (st.elements[0] !== '837') throw new RangeError(`ST01 at segment ${st.position} is not 837.`);
      if (String(st.elements[1] || '') !== String(se.elements[1] || '')) throw new RangeError('ST02 and SE02 transaction control numbers do not match.');
      if (Number(se.elements[0]) !== set.length) throw new RangeError(`SE01 says ${se.elements[0]} segments, but the transaction contains ${set.length}.`);
      groupSets.push({ set, version: st.elements[2] || group[0].elements[7] || '' }); index += 1;
    }
    if (Number(group.at(-1).elements[0]) !== groupSets.length) throw new RangeError('GE01 does not match the number of transaction sets.');
    sets.push(...groupSets);
  }
  if (!sets.length) throw new RangeError('The interchange contains no 837 transaction sets.');
  return sets;
}

function dateParts(value) {
  const raw = String(value || '').trim();
  const digits = /^\d{12}$/.test(raw) ? raw.slice(0, 8) : raw.replace(/-/g, '');
  if (!/^\d{8}$/.test(digits)) return null;
  const parsed = new Date(`${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10).replace(/-/g, '') !== digits ? null : parsed;
}

function formatDate(value) {
  const parsed = dateParts(value);
  return parsed ? parsed.toISOString().slice(0, 10) : '';
}

function finding(check, message, position) { return { check, message, segmentPosition: position }; }

function safeNpi(value) {
  try { return npiValidate({ npi: value }).valid; } catch { return false; }
}

function safeIcd(value) {
  try { return icd10Validate({ code: value }).valid; } catch { return false; }
}

function safeMbi(value) {
  try { return mbiValidate({ mbi: value }).valid; } catch { return false; }
}

function parseTransaction(segments, version, now) {
  const professional = String(version).includes('X222');
  const institutional = String(version).includes('X223');
  if (!professional && !institutional) throw new RangeError(`Unsupported 837 version ${version || '(not reported)'}; use 005010X222A1 or 005010X223A2.`);
  const claims = [];
  let context = { patientName: '', memberId: '', payerName: '', payerId: '', npis: [] };
  let claim = null; let line = null;
  const finish = () => {
    if (!claim) return;
    claim.lineChargeCents = claim.lines.reduce((sum, item) => sum + item.chargeCents, 0);
    if (claim.chargeCents !== claim.lineChargeCents) claim.findings.push(finding('charge total', `Claim charge ${(claim.chargeCents / 100).toFixed(2)} does not equal line charges ${(claim.lineChargeCents / 100).toFixed(2)}.`, claim.segmentPosition));
    const npis = [...context.npis, ...claim.npis];
    for (const npi of npis) if (!safeNpi(npi.value)) claim.findings.push(finding('NPI', `NPI ${npi.value || '(blank)'} fails its 10-digit format or check digit.`, npi.position));
    if ((/MEDICARE/i.test(context.payerName) || context.payerId === '00882') && !safeMbi(context.memberId)) claim.findings.push(finding('MBI', `Member identifier ${context.memberId || '(blank)'} does not match the MBI position grammar.`, context.memberPosition));
    const admission = claim.admissionDate ? dateParts(claim.admissionDate) : null;
    const discharge = claim.dischargeDate ? dateParts(claim.dischargeDate) : null;
    if (claim.admissionDate && !admission) claim.findings.push(finding('admission date', `Admission date ${claim.admissionDate} is not YYYYMMDD or YYYY-MM-DD.`, claim.admissionPosition));
    if (claim.dischargeDate && !discharge) claim.findings.push(finding('discharge date', `Discharge date ${claim.dischargeDate} is not YYYYMMDD or YYYY-MM-DD.`, claim.dischargePosition));
    if (admission && discharge && admission > discharge) claim.findings.push(finding('date order', `Admission ${formatDate(claim.admissionDate)} is after discharge ${formatDate(claim.dischargeDate)}.`, claim.dischargePosition));
    const today = todayUtc(now);
    for (const service of claim.serviceDates) {
      const parsed = dateParts(service.value);
      if (!parsed) claim.findings.push(finding('service date', `Service date ${service.value || '(blank)'} is not YYYYMMDD or YYYY-MM-DD.`, service.position));
      else if (parsed > today) claim.findings.push(finding('service date', `Service date ${formatDate(service.value)} is in the future.`, service.position));
    }
    claim.clean = claim.findings.length === 0;
    delete claim.npis; delete claim.serviceDates; delete claim.admissionPosition; delete claim.dischargePosition;
    claims.push(claim); claim = null; line = null;
  };
  const diagnosisQualifiers = new Set(['ABF', 'ABJ', 'ABK', 'APR', 'BF', 'BK', 'PR']);
  for (const segment of segments) {
    if (segment.id === 'HL' && segment.elements[2] === '20') {
      finish(); context = { patientName: '', memberId: '', payerName: '', payerId: '', npis: [] };
    } else if (segment.id === 'HL' && segment.elements[2] === '22') {
      finish();
      context = { ...context, patientName: '', memberId: '', payerName: '', payerId: '', memberPosition: null };
    } else if (segment.id === 'NM1') {
      const entity = segment.elements[0]; const name = [segment.elements[3], segment.elements[2]].filter(Boolean).join(' ');
      const identifier = String(segment.elements[8] || '').trim(); const qualifier = segment.elements[7];
      if (entity === 'IL') context = { ...context, patientName: name, memberId: identifier, memberPosition: segment.position };
      else if (entity === 'PR') context = { ...context, payerName: segment.elements[2] || '', payerId: identifier };
      if (qualifier === 'XX') {
        const npi = { value: identifier, position: segment.position };
        if (claim) claim.npis.push(npi); else context.npis = [...context.npis, npi];
      }
    } else if (segment.id === 'CLM') {
      finish();
      claim = {
        reference: String(segment.elements[0] || '').trim(), type: professional ? '837P' : '837I',
        patientName: context.patientName, memberId: context.memberId, payerName: context.payerName,
        chargeCents: cents(segment.elements[1], `CLM02 at segment ${segment.position}`), lineChargeCents: 0,
        segmentPosition: segment.position, admissionDate: '', dischargeDate: '', admissionPosition: null, dischargePosition: null,
        diagnoses: [], lines: [], npis: [], serviceDates: [], findings: [], clean: false,
      };
    } else if (claim && (segment.id === 'SV1' || segment.id === 'SV2')) {
      const chargeIndex = segment.id === 'SV1' ? 1 : 2;
      line = { chargeCents: cents(segment.elements[chargeIndex], `${segment.id}${String(chargeIndex + 1).padStart(2, '0')} at segment ${segment.position}`), segmentPosition: segment.position, serviceDate: '' };
      claim.lines.push(line);
    } else if (claim && segment.id === 'HI') {
      for (const composite of segment.elements) {
        const parts = String(composite).split(':'); const code = parts[1];
        if (!code || !diagnosisQualifiers.has(parts[0])) continue;
        claim.diagnoses.push(code);
        if (!safeIcd(code)) claim.findings.push(finding('ICD-10-CM', `Diagnosis code ${code} fails the ICD-10-CM structural grammar.`, segment.position));
      }
    } else if (claim && segment.id === 'DTP') {
      const qualifier = segment.elements[0]; const value = String(segment.elements[2] || '').trim();
      if (qualifier === '472') {
        const [start, end] = value.split('-');
        claim.serviceDates.push({ value: start, position: segment.position });
        if (end) claim.serviceDates.push({ value: end, position: segment.position });
        if (line) line.serviceDate = end ? `${formatDate(start)} to ${formatDate(end)}` : formatDate(start);
      } else if (qualifier === '434') {
        const [start, end] = value.split('-');
        claim.serviceDates.push({ value: start, position: segment.position }, { value: end || start, position: segment.position });
      } else if (qualifier === '435') {
        claim.admissionDate = value; claim.admissionPosition = segment.position;
      } else if (qualifier === '096') {
        claim.dischargeDate = value; claim.dischargePosition = segment.position;
      }
    }
  }
  finish();
  if (!claims.length) throw new RangeError('The 837 transaction contains no CLM claim segments.');
  return { version, type: professional ? '837P' : '837I', claims };
}

export function check837(input, now) {
  const { segments, element, terminator } = splitFile(input);
  const sets = transactionSets(segments);
  const transactions = sets.map(({ set, version }) => parseTransaction(set, version, now));
  const claims = transactions.flatMap((transaction) => transaction.claims);
  return {
    valid: true, elementSeparator: element, segmentTerminator: terminator, transactions, claims,
    summary: { transactionCount: transactions.length, claimCount: claims.length, cleanClaims: claims.filter((claim) => claim.clean).length, failingClaims: claims.filter((claim) => !claim.clean).length, findingCount: claims.reduce((sum, claim) => sum + claim.findings.length, 0) },
  };
}
