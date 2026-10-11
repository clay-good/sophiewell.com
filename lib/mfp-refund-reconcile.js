// spec-v1510 tool 7: mfp-refund-reconcile. A pharmacy's dispensing claims for drugs with a Medicare negotiated
// price, matched to the refunds the Medicare Transaction Facilitator remits as X12 835 files, by prescription
// reference number and fill number. Per the MTF 835 companion guide (CMS, draft): CLP01 is the prescription
// reference number followed by "FILL" and the fill number; CLP03 the standard default refund amount (SDRA);
// CLP04 what the manufacturer paid; CLP07 the MTF's internal claim number (REF*F8 names the original on a
// reversal); SVC01-2 the NDC-11; DTM*472 the date of service; CAS*PI*307 an adjustment to the SDRA, with one of
// RARCs N907-N911 in LQ*HE saying why; BPR16 the payment date.
//
// Per claim: refunded in full, short (with the reason code when the 835 gives one), late (paid after the
// expected date), missing (no refund by the as-of date and past the expected date), not yet due, or paid more
// than once. The expected date is the one mfp-refund-check uses: 21 days from the date of service, then up to
// 5 business days of banking (CMS fact sheet for dispensing entities, April 2026). The as-of date is the latest
// 835 payment date unless the reader enters one, so no answer depends on today's clock.
//
// Pure: the caller passes parsed 835 claims (lib/x12-835-v1515.js parse835) and the claim rows.

import { inputFault } from './num.js';
import { ndcDigits } from './ndc.js';
import { parseIsoStrict, addCalendarDaysUtc, isBusinessDay } from './deadline.js';

export const MAX_CLAIMS = 100000;
export const RARC = {
  N907: 'no refund: the manufacturer identified the claim as 340B-eligible with a ceiling price below the MFP',
  N908: 'no refund: the manufacturer says the drug was bought at the MFP up front',
  N909: 'the manufacturer paid by a method other than the standard default refund',
  N910: 'no refund at this time: contact the manufacturer about eligibility',
  N911: 'not yet payable: the Part D plan must correct its prescription drug event data',
};
const cents = (x) => Math.round(Number(x) * 100);
export const money = (c) => `${c < 0 ? '-' : ''}$${(Math.abs(c) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const iso = (d) => d.toISOString().slice(0, 10);
const ymd = (s) => (/^\d{8}$/.test(String(s || '')) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null);
const addBusiness = (d, n) => { let x = d; let left = n; while (left > 0) { x = addCalendarDaysUtc(x, 1); if (isBusinessDay(x)) left -= 1; } return x; };
export const expectedBy = (dos) => iso(addBusiness(addCalendarDaysUtc(parseIsoStrict(dos), 21), 5));

// The claim key both sides share: the prescription reference number and the fill number, digits only
// apart from a leading-zero difference.
const norm = (s) => String(s ?? '').trim().toUpperCase().replace(/^0+(?=\d)/, '');
export const keyOf = (rx, fill) => `${norm(rx)}|${norm(fill || '0')}`;
export function splitClp01(v) {
  const m = /^(.*?)\s*FILL\s*(\d+)$/i.exec(String(v || '').trim());
  return m ? { rx: m[1], fill: m[2] } : { rx: String(v || '').trim(), fill: '' };
}

function claimsFromText(text) {
  return String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [rx, fill, service_date, ndc, quantity, wac, mfp] = line.split(/\s*[,\t]\s*/);
    return { rx, fill, service_date, ndc, quantity, wac, mfp };
  });
}

function readClaim(c, line) {
  if (blank(c.rx)) return { line, error: 'no prescription number' };
  let dos;
  try { dos = iso(parseIsoStrict(String(c.service_date ?? '').trim())); } catch { return { line, error: 'enter the date of service as YYYY-MM-DD' }; }
  let expectedSdra = null;
  if (!blank(c.wac) || !blank(c.mfp)) {
    const f = inputFault([['the quantity', c.quantity, 0.001, 1e6, 'units'], ['WAC per unit', c.wac, 0, 1e6, 'dollars'], ['the MFP per unit', c.mfp, 0, 1e6, 'dollars']]);
    if (f) return { line, error: f };
    expectedSdra = cents(Math.max(0, Number(c.wac) - Number(c.mfp)) * Number(c.quantity));
  }
  return { line, rx: String(c.rx).trim(), fill: String(c.fill ?? '').trim() || '0', dos, ndc: ndcDigits(c.ndc), expectedSdra, expected: expectedBy(dos) };
}

// remits(parsed835s) -> one record per 835 claim: { key, sdra, paid, status, mtfClaim, original, ndc, dos,
// paidOn, remarks }.
export function remitsFrom(parsed) {
  const out = [];
  for (const p of parsed) {
    for (const t of p.transactions) {
      for (const c of t.claims) {
        const { rx, fill } = splitClp01(c.patientControlNumber);
        const line = c.serviceLines[0] || {};
        const remarks = [...(c.remarks || []), ...c.serviceLines.flatMap((s) => s.remarks || [])];
        out.push({
          key: keyOf(rx, fill), rx, fill, sdra: c.billedCents, paid: c.paidCents, status: c.statusCode,
          mtfClaim: c.payerClaimControlNumber, ndc: ndcDigits(line.billingCode), dos: ymd(line.serviceDate),
          paidOn: ymd(t.paymentDate), remarks: [...new Set(remarks)],
        });
      }
    }
  }
  return out;
}

// mfpRefundReconcile({ claims | claimRows, remits, asOf })
export function mfpRefundReconcile(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = Array.isArray(o.claimRows) ? o.claimRows : claimsFromText(o.claims);
  if (!raw.length) return { valid: false, message: 'Enter the claims, one per line: prescription number, fill number, date of service, NDC, quantity, and WAC and MFP per unit if you have them.' };
  if (raw.length > MAX_CLAIMS) return { valid: false, message: `Up to ${MAX_CLAIMS.toLocaleString('en-US')} claims at a time.` };
  const remits = Array.isArray(o.remits) ? o.remits : [];
  if (!remits.length) return { valid: false, message: 'Choose the Medicare Transaction Facilitator 835 remittance files.' };
  let asOf = null;
  if (!blank(o.asOf)) { try { asOf = iso(parseIsoStrict(String(o.asOf).trim())); } catch { return { valid: false, message: 'Enter the as-of date as YYYY-MM-DD, or leave it blank for the latest 835 payment date.' }; } }
  asOf ||= remits.map((r) => r.paidOn).filter(Boolean).sort().at(-1) || null;
  if (!asOf) return { valid: false, message: 'The 835 files carry no payment date (BPR16); enter the as-of date.' };

  // Net out reversals: a CLP02 22 claim cancels the payment its REF*F8 names (or, without one, one earlier
  // payment for the same prescription and fill).
  const byKey = new Map();
  for (const r of remits) {
    if (!byKey.has(r.key)) byKey.set(r.key, []);
    if (r.status === '22') {
      const list = byKey.get(r.key);
      const i = list.findIndex((x) => !x.reversed);
      if (i >= 0) list[i].reversed = true;
    } else byKey.get(r.key).push({ ...r });
  }
  const rows = raw.map((c, i) => readClaim(c || {}, i + 1)).map((c) => {
    if (c.error) return { line: c.line, status: 'invalid', reason: c.error };
    const pays = (byKey.get(keyOf(c.rx, c.fill)) || []).filter((x) => !x.reversed);
    const paid = pays.reduce((n, x) => n + x.paid, 0);
    const sdra = pays.length ? Math.max(...pays.map((x) => x.sdra)) : null;
    const remarks = [...new Set(pays.flatMap((x) => x.remarks))];
    const paidOn = pays.map((x) => x.paidOn).filter(Boolean).sort()[0] || null;
    const base = { line: c.line, rx: c.rx, fill: c.fill, dos: c.dos, expected: c.expected, sdra, expectedSdra: c.expectedSdra, paid, paidOn, remarks, refunds: pays.length };
    if (!pays.length) {
      return c.expected < asOf
        ? { ...base, status: 'missing', reason: `no refund by ${asOf}; expected by ${c.expected}` }
        : { ...base, status: 'not yet due', reason: `expected by ${c.expected}` };
    }
    const why = remarks.filter((r) => RARC[r]).map((r) => `${r}: ${RARC[r]}`);
    const findings = [];
    if (pays.length > 1) findings.push(`paid ${pays.length} times (${pays.map((x) => money(x.paid)).join(', ')})`);
    if (c.expectedSdra != null && sdra != null && c.expectedSdra !== sdra) findings.push(`the 835's standard default refund ${money(sdra)} differs from (WAC - MFP) x quantity, ${money(c.expectedSdra)}`);
    const owed = c.expectedSdra ?? sdra;
    if (owed != null && paid < owed) findings.push(`paid ${money(paid)} of ${money(owed)}${why.length ? ` (${why.join('; ')})` : ', with no reason code'}`);
    if (paidOn && paidOn > c.expected) findings.push(`paid ${paidOn}, after the expected ${c.expected}`);
    const status = pays.length > 1 ? 'duplicate' : (owed != null && paid < owed ? 'short' : paidOn && paidOn > c.expected ? 'late' : 'refunded');
    return { ...base, status, reason: findings.join('; ') || 'refunded in full' };
  });
  const good = rows.filter((r) => r.status !== 'invalid');
  const count = (s) => good.filter((r) => r.status === s).length;
  const owedOpen = good.reduce((n, r) => {
    const owed = r.expectedSdra ?? r.sdra;
    if (r.status === 'missing' && owed != null) return n + owed;
    if (r.status === 'short' && !r.remarks.some((x) => RARC[x])) return n + (owed - r.paid);
    return n;
  }, 0);
  const matched = new Set(good.map((r) => keyOf(r.rx, r.fill)));
  const unmatched = [...byKey.keys()].filter((k) => !matched.has(k) && byKey.get(k).some((x) => !x.reversed)).length;
  const band = `${plural(good.length, 'claim')} as of ${asOf}: ${count('refunded')} refunded, ${count('short')} short, ${count('late')} late, ${count('missing')} missing, ${count('duplicate')} paid more than once, ${count('not yet due')} not yet due.${owedOpen ? ` ${money(owedOpen)} is open on missing refunds and short ones the 835 gives no reason for.` : ''}`;
  const notes = [
    'The expected date is 21 days from the date of service plus up to 5 business days of banking (CMS fact sheet for dispensing entities, April 2026); the as-of date is the latest 835 payment date unless one is entered.',
  ];
  if (unmatched) notes.push(`${plural(unmatched, 'refund')} in the 835 files matched no claim entered.`);
  if (!good.some((r) => r.expectedSdra != null)) notes.push('Without WAC and MFP per unit, each refund is checked against the standard default refund the 835 itself states.');
  return { valid: true, rows, band, abnormal: count('missing') + count('short') + count('duplicate') + count('late') > 0, asOf, owedOpen, notes };
}

export const CSV_RESULT_HEADERS = ['sophiewell_expected_by', 'sophiewell_refund_paid', 'sophiewell_status', 'sophiewell_reason'];
export const csvResult = (r) => (r.status === 'invalid' ? ['', '', 'invalid', r.reason] : [r.expected, (r.paid / 100).toFixed(2), r.status, r.reason]);
