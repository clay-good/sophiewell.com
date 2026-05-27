// spec-v52 §4.5, §4.10: deterministic PA rule engine.
//
// `runEngine(bundle, rules)` accepts:
//   - bundle: { documents: [{ name, sha256, kind, text, extract }] }
//   - rules:  [{ id, description, severity, citation, check }, ...]
//             (defaults to the STARTER_RULES set in rules.js)
//
// Returns an immutable findings array, one entry per rule, in spec-
// v52 §4.4 order (block, flag, info, pass) and then by rule id.
// Every entry carries:
//   { ruleId, severity, description, citation, status, evidence, note }
// where status is 'pass' | 'flag' | 'block' | 'error'. (The first
// three reflect the rule's declared severity when fired; 'error'
// signals that the rule threw at check-time so the audit trail still
// records that the rule was attempted.)
//
// The engine itself is timestamp-free, fetch-free, and randomness-
// free: same bundle + same rule list -> byte-identical findings.

import { STARTER_RULES } from './rules.js';
import { extractAll } from './extract.js';
import { classifyDocument } from './classify.js';
import { detectPayer, detectPacketPayer } from './payer.js';

const SEVERITY_ORDER = { block: 0, flag: 1, info: 2, pass: 3 };

export function buildBundle(documents, opts) {
  // documents: [{ name, sha256, kind, text }]. extract.text is what
  // the ingest step produced; missing fields default to safe values
  // so the engine does not throw on partial bundles.
  //
  // opts.totalBytes (number, default 0): the wave 52-1f R-PA-045
  // rule needs the on-disk byte total of the dropped files (not the
  // extracted-text length, which differs by an order of magnitude
  // for PDFs). The view passes the sum of File.size; tests can pass
  // a fixture value.
  const docs = (documents || []).map((d) => {
    const text = String(d.text || '');
    return {
      name: String(d.name || ''),
      sha256: String(d.sha256 || ''),
      kind: String(d.kind || ''),
      text,
      role: classifyDocument(text),
      payer: detectPayer(text),
      extract: extractAll(text),
    };
  });
  return {
    documents: docs,
    totalBytes: opts && typeof opts.totalBytes === 'number' ? opts.totalBytes : 0,
    payer: detectPacketPayer(docs),
  };
}

export function runEngine(bundle, rules) {
  const ruleSet = Array.isArray(rules) && rules.length ? rules : STARTER_RULES;
  const findings = [];
  for (const rule of ruleSet) {
    let result;
    let status = 'pass';
    try {
      result = rule.check(bundle) || {};
      if (result.pass === true) {
        status = 'pass';
      } else if (result.pass === false) {
        status = rule.severity || 'flag';
      } else {
        status = 'error';
        result.note = 'Rule check returned no `pass` field.';
      }
    } catch (err) {
      status = 'error';
      result = { note: 'Rule check threw: ' + (err && err.message ? err.message : String(err)) };
    }
    findings.push({
      ruleId: rule.id,
      severity: rule.severity,
      description: rule.description,
      citation: rule.citation,
      status,
      evidence: result.evidence || null,
      note: result.note || null,
    });
  }
  findings.sort((a, b) => {
    const sa = SEVERITY_ORDER[a.status] != null ? SEVERITY_ORDER[a.status] : 99;
    const sb = SEVERITY_ORDER[b.status] != null ? SEVERITY_ORDER[b.status] : 99;
    if (sa !== sb) return sa - sb;
    return a.ruleId.localeCompare(b.ruleId);
  });
  return findings;
}

export function summarizeFindings(findings) {
  const counts = { block: 0, flag: 0, info: 0, pass: 0, error: 0 };
  for (const f of findings) {
    if (counts[f.status] != null) counts[f.status] += 1;
  }
  return counts;
}
