// spec-v1515 tool 7: pas-bundle-check. A Da Vinci Prior Authorization Support request or response bundle
// checked against the guide's profiles at the pinned version (data/pas-profiles): the bundle, its Claim or
// ClaimResponse, every resource a reference reaches (against the target profile the referencing element
// names), and the guide's extensions. Errors and warnings carry the element path. FHIRPath invariants are not
// evaluated, and codes from X12, CPT and NUBC value sets (which cannot ship) are not checked against a list;
// the result says so. Pure: the caller passes the profile set.
// Source package: hl7.fhir.us.davinci-pas version 2.2.1. (Must equal PIN in scripts/data/builders/pas-profiles.mjs;
// scripts/data/watch-upstream.mjs compares it with the registry.)

import { createChecker } from './fhir-profile-check.js';
const PAS = 'http://hl7.org/fhir/us/davinci-pas/StructureDefinition/';
const canon = (u) => String(u || '').split('|')[0];
export const BUNDLE_PROFILES = {
  request: `${PAS}profile-pas-request-bundle`, response: `${PAS}profile-pas-response-bundle`,
  inquiry: `${PAS}profile-pas-inquiry-request-bundle`, 'inquiry-response': `${PAS}profile-pas-inquiry-response-bundle`,
};
// profileSet(records, valueSets) -> the set createChecker takes, keyed by canonical url.
export const profileSet = (records, valueSets = {}) => ({ profiles: Object.fromEntries(records.map((r) => [r.url, r])), valueSets });

// checkPasBundle(bundle, set) -> { valid, kind, errors, warnings, findings, invariants } or { valid: false, message }.
export function checkPasBundle(bundle, set) {
  const findings = []; const add = (severity, location, message) => findings.push({ severity, location, message });
  if (!bundle || bundle.resourceType !== 'Bundle') return { valid: false, message: 'This is not a FHIR Bundle: it has no resourceType "Bundle".' };
  const checker = createChecker(set);
  const entries = bundle.entry || [];
  const first = entries[0] && entries[0].resource;
  const declared = ((bundle.meta && bundle.meta.profile) || []).map(canon).find((p) => Object.values(BUNDLE_PROFILES).includes(p));
  const firstProfiles = ((first && first.meta && first.meta.profile) || []).map(canon);
  const kind = declared ? Object.keys(BUNDLE_PROFILES).find((k) => BUNDLE_PROFILES[k] === declared)
    : first && first.resourceType === 'ClaimResponse' ? (firstProfiles.some((p) => p.endsWith('claiminquiryresponse')) ? 'inquiry-response' : 'response')
      : first && first.resourceType === 'Claim' ? (firstProfiles.some((p) => p.endsWith('claim-inquiry')) ? 'inquiry' : 'request') : null;
  if (!kind) return { valid: false, message: 'The bundle\'s first entry is neither a Claim nor a ClaimResponse, so it is not a prior authorization request or response.' };
  const byRef = new Map();
  entries.forEach((e, i) => {
    const r = e.resource; if (!r) return;
    if (e.fullUrl) byRef.set(e.fullUrl, { r, i });
    if (r.resourceType && r.id) byRef.set(`${r.resourceType}/${r.id}`, { r, i });
  });
  const done = new Set();
  const visit = (r, profile, at) => {
    const key = `${at}|${canon(profile)}`; if (done.has(key)) return; done.add(key);
    checker.check(r, profile, at, add, ctx);
  };
  const ctx = {
    onReference(ref, type, at) {
      if (!ref || !ref.reference) return;
      const hit = byRef.get(ref.reference) || byRef.get(ref.reference.replace(/^.*\/(\w+\/[^/]+)$/, '$1'));
      if (!hit) { add('warning', at, `points at ${ref.reference}, which is not in the bundle.`); return; }
      const targets = ((type && type.targetProfile) || []).map(canon).filter((p) => set.profiles[p]);
      const own = ((hit.r.meta && hit.r.meta.profile) || []).map(canon).filter((p) => targets.includes(p));
      const profile = own[0] || (targets.length === 1 ? targets[0] : targets.find((p) => set.profiles[p].type === hit.r.resourceType));
      if (profile) visit(hit.r, profile, `Bundle.entry[${hit.i}].resource`);
    },
    checkExtension(ext, profile, at) { if (set.profiles[canon(profile)]) visit(ext, profile, at); },
  };
  visit(bundle, BUNDLE_PROFILES[kind], 'Bundle');
  const head = first.resourceType === 'Claim'
    ? (firstProfiles.find((p) => set.profiles[p] && set.profiles[p].type === 'Claim') || `${PAS}${kind === 'inquiry' ? 'profile-claim-inquiry' : 'profile-claim'}`)
    : (firstProfiles.find((p) => set.profiles[p] && set.profiles[p].type === 'ClaimResponse') || `${PAS}${kind === 'inquiry-response' ? 'profile-claiminquiryresponse' : 'profile-claimresponse'}`);
  visit(first, head, 'Bundle.entry[0].resource');
  const errors = findings.filter((f) => f.severity === 'error').length;
  const invariants = [...done].reduce((n, key) => n + ((set.profiles[canon(key.split('|').slice(1).join('|'))] || { elements: [] }).elements.reduce((m, e) => m + (e.inv || 0), 0)), 0);
  const label = { request: 'prior authorization request', response: 'prior authorization response', inquiry: 'inquiry request', 'inquiry-response': 'inquiry response' }[kind];
  const band = errors ? `${errors.toLocaleString('en-US')} ${errors === 1 ? 'error' : 'errors'} against the Da Vinci PAS profiles in this ${label} bundle.` : `No errors against the Da Vinci PAS profiles in this ${label} bundle.`;
  return { valid: true, kind, label, band, errors, warnings: findings.length - errors, findings, invariants, checked: done.size };
}
