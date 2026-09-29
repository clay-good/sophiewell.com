// spec-v1516 tools 2 and 4: pure aggregation over parsed 835 remittances.
import { denialCategoryForCode } from './denial-next-step-v1516.js';

const moneyPattern = /^(\d{1,11})(?:\.(\d{1,2}))?$/;

function cents(value, label) {
  const match = moneyPattern.exec(String(value ?? '').trim().replace(/^\$/, ''));
  if (!match) throw new RangeError(`${label} must be a non-negative dollar amount with no more than 2 decimal places.`);
  return Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'));
}

function percent(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > 1_000) throw new RangeError(`${label} must be more than 0% and no more than 1,000%.`);
  return number;
}

function add(map, label, amountCents) {
  const key = String(label || 'Not reported');
  map.set(key, (map.get(key) || 0) + amountCents);
}

function rows(map) {
  return [...map].map(([label, amountCents]) => ({ label, amountCents })).sort((a, b) => b.amountCents - a.amountCents || a.label.localeCompare(b.label));
}

function paymentMonth(value) {
  const digits = String(value || '').replace(/-/g, '');
  return /^\d{8}$/.test(digits) ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}` : 'Date not reported';
}

function paymentDate(value) {
  const digits = String(value || '').replace(/-/g, '');
  return /^\d{8}$/.test(digits) ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}` : '';
}

export function appealCandidates(files = []) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Read at least one 835 file.');
  const candidates = [];
  for (const file of files) for (const transaction of file.result.transactions) {
    const payer = transaction.payerName || 'Payer not reported';
    const denialDate = paymentDate(transaction.paymentDate);
    if (!denialDate) throw new RangeError(`${file.name || 'An 835 file'} has a payment date that cannot be used for an appeal deadline.`);
    for (const claim of transaction.claims) {
      const adjustments = [...claim.adjustments, ...claim.serviceLines.flatMap((line) => line.adjustments)];
      const appealCents = adjustments.reduce((sum, item) => {
        const category = denialCategoryForCode(item.reason);
        return category?.kind === 'appeal' && item.amountCents > 0 ? sum + item.amountCents : sum;
      }, 0);
      if (appealCents > 0) candidates.push({
        sourceFile: file.name,
        reference: claim.patientControlNumber,
        payer,
        denialDate,
        amountCents: appealCents,
      });
    }
  }
  return { candidates, payers: [...new Set(candidates.map((row) => row.payer))].sort((a, b) => a.localeCompare(b)) };
}

export function denialPatternReport(files = []) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Read at least one 835 file.');
  const maps = { category: new Map(), reason: new Map(), payer: new Map(), billingCode: new Map(), provider: new Map(), month: new Map() };
  const detail = [];
  for (const file of files) {
    for (const transaction of file.result.transactions) {
      const payer = transaction.payerName || 'Payer not reported';
      const month = paymentMonth(transaction.paymentDate);
      for (const claim of transaction.claims) {
        const collect = (adjustments, billingCode, provider) => {
          for (const item of adjustments) {
            const category = denialCategoryForCode(item.reason)?.name || 'Unmapped reason code';
            const reason = `${item.group}-${item.reason}`;
            add(maps.category, category, item.amountCents); add(maps.reason, reason, item.amountCents);
            add(maps.payer, payer, item.amountCents); add(maps.billingCode, billingCode, item.amountCents);
            add(maps.provider, provider, item.amountCents); add(maps.month, month, item.amountCents);
            detail.push({ sourceFile: file.name, month, payer, patientAccount: claim.patientControlNumber, billingCode: billingCode || '', renderingProvider: provider || '', group: item.group, reason: item.reason, category, amountCents: item.amountCents });
          }
        };
        collect(claim.adjustments, '', claim.renderingProvider);
        for (const line of claim.serviceLines) collect(line.adjustments, line.billingCode, line.renderingProvider || claim.renderingProvider);
      }
    }
  }
  const byCategory = rows(maps.category);
  const totalCents = byCategory.reduce((sum, row) => sum + row.amountCents, 0);
  const positiveCategoryCents = byCategory.reduce((sum, row) => sum + Math.max(0, row.amountCents), 0);
  const topCategoryShare = positiveCategoryCents > 0 && byCategory.length ? Math.round(Math.max(0, byCategory[0].amountCents) / positiveCategoryCents * 1000) / 10 : null;
  const months = rows(maps.month).sort((a, b) => a.label.localeCompare(b.label));
  const dated = months.filter((row) => row.label !== 'Date not reported');
  let monthChange = null;
  if (dated.length >= 2) {
    const current = dated.at(-1); const previous = dated.at(-2);
    monthChange = { previousMonth: previous.label, currentMonth: current.label, previousCents: previous.amountCents, currentCents: current.amountCents, changeCents: current.amountCents - previous.amountCents, changePercent: previous.amountCents ? Math.round((current.amountCents - previous.amountCents) / Math.abs(previous.amountCents) * 1000) / 10 : null };
  }
  return { valid: true, totalCents, adjustmentCount: detail.length, topCategoryShare, monthChange, byCategory, byReason: rows(maps.reason), byPayer: rows(maps.payer), byBillingCode: rows(maps.billingCode), byProvider: rows(maps.provider), detail };
}

function normalized(value) { return String(value ?? '').trim().toUpperCase(); }

function feeRate(row, index) {
  const direct = String(row.contracted_amount ?? '').trim();
  const reference = String(row.reference_amount ?? '').trim();
  const rate = String(row.contract_percent ?? '').trim();
  if (direct && (reference || rate)) throw new RangeError(`Fee row ${index + 1}: use either contracted amount or reference amount plus contract percent.`);
  if (direct) return cents(direct, `Fee row ${index + 1} contracted amount`);
  if (!reference || !rate) throw new RangeError(`Fee row ${index + 1}: enter a contracted amount, or both reference amount and contract percent.`);
  return Math.round(cents(reference, `Fee row ${index + 1} reference amount`) * percent(rate, `Fee row ${index + 1} contract percent`) / 100);
}

export function underpaymentCheck(files = [], feeRows = []) {
  if (!Array.isArray(files) || !files.length) throw new TypeError('Read at least one 835 file.');
  if (!Array.isArray(feeRows) || !feeRows.length) throw new TypeError('Read a fee schedule.');
  const fees = new Map();
  feeRows.forEach((row, index) => {
    const code = normalized(row.billing_code);
    if (!code) throw new RangeError(`Fee row ${index + 1}: enter a billing code.`);
    const modifier = normalized(row.modifier);
    const key = `${code}|${modifier}`;
    if (fees.has(key)) throw new RangeError(`Fee row ${index + 1}: ${code}${modifier ? ` with modifier ${modifier}` : ''} appears more than once.`);
    fees.set(key, feeRate(row, index));
  });
  const lines = [];
  let unmatched = 0;
  for (const file of files) for (const transaction of file.result.transactions) for (const claim of transaction.claims) for (const line of claim.serviceLines) {
    const modifier = normalized(line.modifiers.join(':'));
    const key = `${normalized(line.billingCode)}|${modifier}`;
    const fallback = `${normalized(line.billingCode)}|`;
    const expectedCents = fees.get(key) ?? fees.get(fallback);
    if (expectedCents === undefined) { unmatched += 1; continue; }
    const allowedCents = line.billedCents - line.balance.adjustmentTotals.CO;
    const varianceCents = expectedCents - allowedCents;
    lines.push({ sourceFile: file.name, payer: transaction.payerName || 'Payer not reported', patientAccount: claim.patientControlNumber, payerClaimControl: claim.payerClaimControlNumber, serviceDate: line.serviceDate || claim.serviceDate, billingCode: line.billingCode, modifier, renderingProvider: line.renderingProvider || claim.renderingProvider, expectedCents, allowedCents, varianceCents, underpaid: varianceCents > 0 });
  }
  const underpaid = lines.filter((line) => line.underpaid).sort((a, b) => b.varianceCents - a.varianceCents);
  const byPayerMap = new Map(); const byCodeMap = new Map();
  underpaid.forEach((line) => { add(byPayerMap, line.payer, line.varianceCents); add(byCodeMap, line.billingCode, line.varianceCents); });
  return { valid: true, matchedLines: lines.length, unmatchedLines: unmatched, underpaidLines: underpaid.length, varianceCents: underpaid.reduce((sum, line) => sum + line.varianceCents, 0), lines, underpaid, byPayer: rows(byPayerMap), byBillingCode: rows(byCodeMap) };
}
