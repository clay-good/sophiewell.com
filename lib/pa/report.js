// spec-v52 §4.6: deterministic PA report builder.
//
// Wave 52-6a ships the JSON-flavored half of the §4.6 contract: a
// `buildJsonReport(bundle, findings, opts)` function that emits the
// structured packet Sophie's downstream tooling consumes. The DOCX
// half (the human-facing .docx download) lands in wave 52-6b alongside
// the vendored docx.js dependency.
//
// Structure (mirrors the §4.6 enumeration):
//   1. coverPage      -- packet identity + dataset version + disclaimer
//   2. executiveSummary -- counts per severity + list of block findings
//   3. findings       -- one entry per rule with remediation hint
//   4. evidenceLedger -- every extracted value with per-document pointer
//   5. extractedData  -- the full per-document extract.* JSON
//   6. auditTrail     -- rule list + dataset version + file hashes + ts
//
// Determinism (§4.10): same `bundle` + `findings` + `opts` produces
// byte-identical JSON output (modulo the deliberately-passed-in
// `generatedAt` timestamp from `opts.generatedAt`; when omitted the
// field is `null` so the report is fully byte-stable for golden tests).

import { redactBundle, redactText } from './redact.js';
import { summarizeFindings } from './engine.js';

const RULESET_VERSION = '1.0.0';
const REPORT_FORMAT_VERSION = '1';

const DISCLAIMER =
  'Sophie Prior-Auth Packet Linter is a deterministic checklist. It is not '
  + 'medical advice. It is not legal advice. It is not coding advice. It does '
  + 'not transmit anything to any payer. Your packet stays in this browser '
  + 'tab; we never see your data. Findings reflect what Sophie\'s ruleset '
  + 'checks; they are not a guarantee of payer approval. A passing report '
  + 'does not mean the packet will be approved; a failing report does not '
  + 'mean the packet will be denied. The clinical adequacy of every document '
  + 'is the reviewer\'s responsibility. Sophie\'s ruleset is versioned and '
  + 'cites every source; verify citations against current payer policy '
  + 'before relying on any finding for a clinical or revenue decision.';

// Per-rule remediation hints. Keyed by the rule id prefix so adding a
// rule does not require a hint entry; the default falls through.
const REMEDIATION_BY_PREFIX = {
  'R-PA-CMS-': 'Attach the missing CMS documentation (NCD / LCD / IOM citation) and resubmit.',
  'R-PA-MA-':  'Attach the missing MA documentation (organization-determination type, network status, plan name + ID).',
  'R-PA-MCD-': 'Attach the missing Medicaid documentation (recipient ID, eligibility window, MCO / FFS routing).',
  'R-PA-RAD-': 'Attach the missing radiology supporting documentation (ACR AC, conservative management, contrast workup).',
  'R-PA-INF-': 'Attach the missing infusion supporting documentation (NDC, weight-based dose, site of care, FDA indication).',
  'R-PA-SURG-': 'Attach the missing surgical supporting documentation (conservative management, imaging, ASA, consent).',
  'R-PA-BH-':  'Attach the missing behavioral-health documentation (DSM-5-TR, treatment plan, risk assessment, prior level of care).',
  'R-PA-GEN-': 'Attach the missing genetic-testing documentation (family history, genetic counseling, panel scope, genetic consent).',
};
function remediationFor(ruleId) {
  for (const prefix of Object.keys(REMEDIATION_BY_PREFIX)) {
    if (ruleId.startsWith(prefix)) return REMEDIATION_BY_PREFIX[prefix];
  }
  return 'Address the rule\'s `note` field and resubmit.';
}

function evidenceLedgerForDoc(doc) {
  const e = doc.extract || {};
  const ledger = {};
  if (e.patientName) ledger.patientName = e.patientName;
  if (e.dob) ledger.dob = e.dob;
  if (e.memberId) ledger.memberId = e.memberId;
  if (Array.isArray(e.npis) && e.npis.length) ledger.npis = e.npis;
  if (Array.isArray(e.tins) && e.tins.length) ledger.tins = e.tins;
  if (Array.isArray(e.cpts) && e.cpts.length) ledger.cpts = e.cpts;
  if (Array.isArray(e.icd10) && e.icd10.length) ledger.icd10 = e.icd10;
  if (Array.isArray(e.pos) && e.pos.length) ledger.pos = e.pos;
  if (Array.isArray(e.dates) && e.dates.length) ledger.dates = e.dates;
  if (Array.isArray(e.serviceDates) && e.serviceDates.length) ledger.serviceDates = e.serviceDates;
  if (e.quantity !== null && e.quantity !== undefined) ledger.quantity = e.quantity;
  if (e.weight) ledger.weight = e.weight;
  if (e.height) ledger.height = e.height;
  if (e.frequency) ledger.frequency = e.frequency;
  if (e.signature) ledger.signature = e.signature;
  if (Array.isArray(e.ssns) && e.ssns.length) ledger.ssnCount = e.ssns.length; // count only; do not echo SSNs
  return ledger;
}

// Optional `opts.generatedAt` is a caller-supplied ISO string. We do
// NOT call `new Date()` so the engine remains timestamp-free per §4.10.
function buildJsonReportInner(bundle, findings, opts) {
  const generatedAt = (opts && opts.generatedAt) || null;
  const counts = summarizeFindings(findings);
  const blockFindings = findings.filter((f) => f.status === 'block');

  return {
    coverPage: {
      title: 'Sophie PA Packet Lint Report',
      packetSize: bundle.documents.length,
      detectedPayer: bundle.payer || 'unknown',
      datasetVersion: RULESET_VERSION,
      reportFormatVersion: REPORT_FORMAT_VERSION,
      generatedAt,
      disclaimer: DISCLAIMER,
    },
    executiveSummary: {
      totalRulesEvaluated: findings.length,
      counts,
      blockFindings: blockFindings.map((f) => ({ ruleId: f.ruleId, description: f.description })),
    },
    findings: findings.map((f) => ({
      ruleId: f.ruleId,
      severity: f.severity,
      status: f.status,
      description: f.description,
      citation: f.citation,
      evidence: f.evidence,
      note: f.note,
      remediation: (f.status === 'block' || f.status === 'flag') ? remediationFor(f.ruleId) : null,
    })),
    evidenceLedger: bundle.documents.map((d) => ({
      document: d.name,
      sha256: d.sha256,
      kind: d.kind,
      role: d.role,
      payer: d.payer,
      ledger: evidenceLedgerForDoc(d),
    })),
    extractedData: bundle.documents.map((d) => ({
      document: d.name,
      sha256: d.sha256,
      extract: d.extract,
    })),
    auditTrail: {
      rulesetVersion: RULESET_VERSION,
      reportFormatVersion: REPORT_FORMAT_VERSION,
      ruleIds: findings.map((f) => f.ruleId),
      documentHashes: bundle.documents.map((d) => ({ document: d.name, sha256: d.sha256 })),
      totalBytes: bundle.totalBytes || 0,
      generatedAt,
    },
  };
}

export function buildJsonReport(bundle, findings, opts) {
  return buildJsonReportInner(bundle, findings || [], opts || {});
}

// Convenience: produce the same structure with PHI masked. The `findings`
// pass through with evidence + note redacted; the per-document text +
// extract block are redacted via `redactBundle`. Disclaimer + cover-page
// metadata are unchanged.
export function buildRedactedJsonReport(bundle, findings, opts) {
  const redactedBundle = redactBundle({ ...bundle, findings }, { redactFindings: true });
  const redactedFindings = redactedBundle.findings || (findings || []).map((f) => ({
    ...f,
    evidence: f.evidence ? redactText(f.evidence) : f.evidence,
    note: f.note ? redactText(f.note) : f.note,
  }));
  return buildJsonReportInner(redactedBundle, redactedFindings, opts || {});
}
