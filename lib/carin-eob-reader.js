// spec-v1602 tool 1: carin-eob-reader. Reads a claims file from an insurer's Patient Access API --
// ExplanationOfBenefit resources in the CARIN Blue Button profiles (STU 2.x), as a FHIR Bundle, NDJSON or
// one resource -- into a table of claims, totals by year, and flags worth asking about, each stating the
// fact it rests on. A flag is never "you were overcharged". An amount the file does not state is missing,
// never zero. Adjustment and denial reasons are shown as codes only.
// Written against the CARIN Blue Button guide 2.2.0 (its ExplanationOfBenefit examples are the test fixtures).
// Source package: hl7.fhir.us.carin-bb version 2.2.0. (scripts/data/watch-upstream.mjs compares it with the registry.)

const ADJ = 'http://terminology.hl7.org/CodeSystem/adjudication';
const C4BB_ADJ = 'http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBAdjudication';
const DISC = 'http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBAdjudicationDiscriminator';

// The amount categories read, by the code that carries each (FHIR adjudication or CARIN C4BBAdjudication).
export const AMOUNTS = {
  billed: [[ADJ, 'submitted']],
  allowed: [[ADJ, 'eligible']],
  deductible: [[ADJ, 'deductible']],
  copay: [[ADJ, 'copay']],
  coinsurance: [[C4BB_ADJ, 'coinsurance']],
  noncovered: [[C4BB_ADJ, 'noncovered']],
  planPaid: [[C4BB_ADJ, 'paidtoprovider'], [C4BB_ADJ, 'paidtopatient']],
  benefit: [[ADJ, 'benefit']],
  memberLiability: [[C4BB_ADJ, 'memberliability']],
};

// CPT Preventive Medicine Services, new and established patient visits: a cost share on one of these
// is worth asking about under 45 CFR 147.130. Other preventive services need the planned code list.
const PREVENTIVE_VISIT = /^993(8[1-7]|9[1-7])$/;
// Emergency department: E/M codes 99281-99285, place of service 23, revenue codes 0450-0459.
const EMERGENCY_CPT = /^9928[1-5]$/;
const EMERGENCY_REV = /^045\d$/;

// payment.type (C4BBPayerAdjudicationStatus) when present, else EOB.outcome (FHIR processing outcome).
export const OUTCOME_LABEL = { paid: 'Paid', denied: 'Denied', partiallypaid: 'Partly paid', complete: 'Processed', partial: 'Partly processed', queued: 'Queued', error: 'Processing error' };

const codes = (cc) => ((cc && cc.coding) || []).map((c) => ({ system: c.system || '', code: String(c.code ?? '') }));
const has = (cc, system, code) => codes(cc).some((c) => c.system === system && c.code === code);
const cents = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 100) : null);

// resources(text) -> the resources in a Bundle, NDJSON or a single resource.
export function resources(text) {
  const t = String(text).replace(/^﻿/, '').trim();
  if (!t) throw new SyntaxError('The file is empty.');
  if (t.startsWith('{')) {
    let one;
    try { one = JSON.parse(t); } catch {
      // NDJSON: one resource per line.
      return t.split(/\r?\n/).filter((l) => l.trim()).map((l, i) => { try { return JSON.parse(l); } catch { throw new SyntaxError(`Line ${i + 1} is not a JSON resource.`); } });
    }
    if (one.resourceType === 'Bundle') return (one.entry || []).map((e) => e && e.resource).filter(Boolean);
    return [one];
  }
  throw new SyntaxError('The file is not FHIR JSON or NDJSON.');
}

function amountsOf(adjudications) {
  const out = {};
  for (const [key, list] of Object.entries(AMOUNTS)) {
    const hits = (adjudications || []).filter((a) => list.some(([s, c]) => has(a.category, s, c)) && a.amount && cents(a.amount.value) != null);
    out[key] = hits.length ? hits.reduce((n, a) => n + cents(a.amount.value), 0) : null;
  }
  return out;
}

// A claim-level amount from EOB.total; when total does not state it, the sum of the items' -- but only
// when every item states it. Otherwise it is missing.
function claimAmounts(eob) {
  const fromTotal = amountsOf((eob.total || []).map((t) => ({ category: t.category, amount: t.amount })));
  const items = (eob.item || []).map((it) => amountsOf(it.adjudication));
  const out = {};
  for (const key of Object.keys(AMOUNTS)) {
    if (fromTotal[key] != null) out[key] = fromTotal[key];
    else if (items.length && items.every((a) => a[key] != null)) out[key] = items.reduce((n, a) => n + a[key], 0);
    else out[key] = null;
  }
  if (out.planPaid == null && out.benefit != null) out.planPaid = out.benefit;
  if (out.memberLiability == null && [out.deductible, out.copay, out.coinsurance, out.noncovered].some((v) => v != null)) {
    out.memberLiability = [out.deductible, out.copay, out.coinsurance, out.noncovered].reduce((n, v) => n + (v || 0), 0);
    out.memberLiabilityDerived = true;
  }
  return out;
}

const statusOf = (adjudications, which) => {
  const a = (adjudications || []).find((x) => has(x.category, DISC, which));
  const c = a && codes(a.reason)[0];
  return c ? c.code : null;
};

const reasonCodes = (adjudications) => (adjudications || [])
  .filter((a) => has(a.category, DISC, 'rejectreason') || has(a.category, DISC, 'adjustmentreason') || has(a.category, ADJ, 'denialreason'))
  .flatMap((a) => codes(a.reason).map((c) => c.code)).filter(Boolean);

function nameFor(ref, index) {
  if (!ref) return '';
  if (ref.display) return ref.display;
  const r = ref.reference && index.get(ref.reference.replace(/^#/, ''));
  if (r && r.name) return typeof r.name === 'string' ? r.name : [r.name[0]?.given?.join(' '), r.name[0]?.family].filter(Boolean).join(' ');
  return ref.reference || '';
}

// readClaims(text) -> { claims, skipped } ; claims carry their amounts in cents.
export function readClaims(text) {
  const all = resources(text);
  const index = new Map(all.filter((r) => r.resourceType && r.id).map((r) => [`${r.resourceType}/${r.id}`, r]));
  const eobs = all.filter((r) => r.resourceType === 'ExplanationOfBenefit');
  const claims = eobs.map((eob) => {
    for (const c of eob.contained || []) if (c.resourceType && c.id) index.set(c.id, c);
    const items = (eob.item || []).map((it) => ({
      code: codes(it.productOrService)[0]?.code || '',
      revenue: codes(it.revenue)[0]?.code || '',
      date: it.servicedDate || it.servicedPeriod?.start || '',
      pos: codes(it.locationCodeableConcept)[0]?.code || '',
      amounts: amountsOf(it.adjudication),
      reasons: reasonCodes(it.adjudication),
      rejected: (it.adjudication || []).some((a) => has(a.category, DISC, 'rejectreason')),
      network: statusOf(it.adjudication, 'benefitpaymentstatus'),
    }));
    const type = codes(eob.type)[0]?.code || '';
    const sub = codes(eob.subType)[0]?.code || '';
    const date = eob.billablePeriod?.start || items.map((i) => i.date).filter(Boolean).sort()[0] || '';
    return {
      id: (eob.identifier || [])[0]?.value || eob.id || '',
      type: sub ? `${type} (${sub})` : type, date: date.slice(0, 10),
      provider: nameFor(eob.provider, index),
      outcome: codes(eob.payment?.type)[0]?.code || eob.outcome || '',
      network: statusOf(eob.adjudication, 'billingnetworkstatus') || statusOf(eob.adjudication, 'benefitpaymentstatus') || [...new Set(items.map((i) => i.network).filter(Boolean))].join('/') || '',
      amounts: claimAmounts(eob),
      reasons: [...new Set([...reasonCodes(eob.adjudication), ...items.flatMap((i) => i.reasons)])],
      items,
    };
  });
  return { claims, skipped: all.length - eobs.length };
}

export const usd = (c) => (c == null ? 'not stated' : `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

// flags(claims, { coinsurancePct }) -> [{ claim, flag, fact, tool }]
export function flagsFor(claims, { coinsurancePct } = {}) {
  const out = [];
  const seen = new Map();
  for (const c of claims) {
    if (c.outcome === 'denied' || c.outcome === 'partiallypaid') {
      out.push({ claim: c.id, flag: c.outcome === 'denied' ? 'Denied' : 'Partly denied', fact: `The file marks this claim ${c.outcome === 'denied' ? 'denied' : 'partly paid'}${c.reasons.length ? `, with reason code${c.reasons.length === 1 ? '' : 's'} ${c.reasons.join(', ')}` : ''}.`, tool: 'denial-next-step' });
    } else {
      const rejected = c.items.filter((it) => it.rejected);
      if (rejected.length) out.push({ claim: c.id, flag: 'Line denied', fact: `The file gives a reject reason on ${rejected.length === 1 ? `line ${rejected[0].code || rejected[0].revenue}` : `${rejected.length} lines`}: ${[...new Set(rejected.flatMap((it) => it.reasons))].join(', ') || 'no code stated'}.`, tool: 'denial-next-step' });
    }
    for (const it of c.items) {
      const itShare = it.amounts.memberLiability ?? ([it.amounts.deductible, it.amounts.copay, it.amounts.coinsurance].some((v) => v != null) ? (it.amounts.deductible || 0) + (it.amounts.copay || 0) + (it.amounts.coinsurance || 0) : null);
      if (PREVENTIVE_VISIT.test(it.code) && itShare > 0) out.push({ claim: c.id, flag: 'Preventive visit with cost sharing', fact: `Code ${it.code} on ${it.date || c.date} is a preventive medicine visit, and the file shows ${usd(itShare)} for you to pay. Most plans (not grandfathered ones) must cover recommended preventive care in network without cost sharing.`, tool: 'preventive-cost-share-check' });
      const emergency = EMERGENCY_CPT.test(it.code) || it.pos === '23' || EMERGENCY_REV.test(it.revenue);
      const oon = (it.network || c.network || '').includes('outofnetwork');
      if (emergency && oon && itShare > 0) out.push({ claim: c.id, flag: 'Out-of-network emergency care', fact: `Line ${it.code || it.revenue} on ${it.date || c.date} is emergency care marked out of network, with ${usd(itShare)} for you to pay. Under the No Surprises Act, most plans must cost-share emergency care as if it were in network.`, tool: 'nsa-cost-share' });
      if (it.code && itShare > 0 && c.outcome !== 'denied') {
        const key = `${c.provider}|${it.date || c.date}|${it.code}`;
        if (seen.has(key) && seen.get(key) !== c.id) out.push({ claim: c.id, flag: 'Possible duplicate', fact: `${c.provider || 'The same provider'} billed ${it.code} on ${it.date || c.date} on claim ${seen.get(key)} too, and you were charged on both.`, tool: null });
        else if (!seen.has(key)) seen.set(key, c.id);
      }
      if (coinsurancePct != null && it.amounts.coinsurance != null && it.amounts.allowed != null) {
        const base = it.amounts.allowed - (it.amounts.deductible || 0) - (it.amounts.copay || 0);
        const expect = Math.round(base * coinsurancePct / 100);
        if (Math.abs(expect - it.amounts.coinsurance) > 1) out.push({ claim: c.id, flag: 'Coinsurance differs from your plan\'s rate', fact: `Line ${it.code} on ${it.date || c.date}: ${coinsurancePct}% of ${usd(base)} (allowed ${usd(it.amounts.allowed)} less deductible ${usd(it.amounts.deductible || 0)} and copay ${usd(it.amounts.copay || 0)}) is ${usd(expect)}; the file shows ${usd(it.amounts.coinsurance)}.`, tool: null });
      }
    }
  }
  return out;
}

// totalsByYear(claims) -> [{ year, claims, billed, allowed, planPaid, memberLiability, missing }]
export function totalsByYear(claims) {
  const by = new Map();
  for (const c of claims) {
    const year = c.date.slice(0, 4) || 'no date';
    const t = by.get(year) || { year, claims: 0, billed: 0, allowed: 0, planPaid: 0, memberLiability: 0, missing: { billed: 0, allowed: 0, planPaid: 0, memberLiability: 0 } };
    t.claims += 1;
    for (const k of ['billed', 'allowed', 'planPaid', 'memberLiability']) { if (c.amounts[k] == null) t.missing[k] += 1; else t[k] += c.amounts[k]; }
    by.set(year, t);
  }
  return [...by.values()].sort((a, b) => a.year.localeCompare(b.year));
}

export function readEob(text, options = {}) {
  let parsed;
  try { parsed = readClaims(text); } catch (e) { return { valid: false, message: e instanceof Error ? e.message : String(e) }; }
  if (!parsed.claims.length) return { valid: false, message: 'The file holds no ExplanationOfBenefit (claim) resources.' };
  const flags = flagsFor(parsed.claims, options);
  const years = totalsByYear(parsed.claims);
  const n = parsed.claims.length;
  const band = `${n.toLocaleString('en-US')} claim${n === 1 ? '' : 's'}${years.length === 1 ? ` in ${years[0].year}` : ''}; ${flags.length ? `${flags.length.toLocaleString('en-US')} worth asking about.` : 'nothing flagged.'}`;
  return { valid: true, band, claims: parsed.claims, flags, years };
}

export const CSV_HEADERS = ['Claim', 'Type', 'Date', 'Provider', 'Network', 'Outcome', 'Billed', 'Allowed', 'Plan paid', 'You pay', 'Deductible', 'Copay', 'Coinsurance', 'Not covered', 'Reason codes'];
const dollars = (c) => (c == null ? '' : (c / 100).toFixed(2));
export const csvRow = (c) => [c.id, c.type, c.date, c.provider, c.network, c.outcome, dollars(c.amounts.billed), dollars(c.amounts.allowed), dollars(c.amounts.planPaid), dollars(c.amounts.memberLiability), dollars(c.amounts.deductible), dollars(c.amounts.copay), dollars(c.amounts.coinsurance), dollars(c.amounts.noncovered), c.reasons.join(' ')];
