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
      // spec-v52 wave 52-1k: optional view-layer signal that the parser
      // threw on this file (encrypted PDF, password-protected DOCX,
      // corrupted bytes). Consumed by R-PA-043 / R-PA-044.
      parseError: d.parseError ? String(d.parseError) : '',
      role: classifyDocument(text),
      payer: detectPayer(text),
      extract: extractAll(text),
    };
  });
  // spec-v52 §4.10 / §8.4: canonicalize document order so the report is
  // invariant under the drop order of the input files. The key is the
  // content hash (sha256) first -- identical files always sort identically
  // regardless of how the user dropped them -- with the file name as a
  // stable tiebreak. Findings, the evidence ledger, and the extracted-data
  // appendix all follow this order, so reordering the input list does not
  // change the report JSON (the §8.4 reorder-invariance property).
  docs.sort((a, b) => {
    if (a.sha256 !== b.sha256) return a.sha256 < b.sha256 ? -1 : 1;
    return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
  });
  return {
    documents: docs,
    totalBytes: opts && typeof opts.totalBytes === 'number' ? opts.totalBytes : 0,
    payer: detectPacketPayer(docs),
  };
}

// spec-v52 §4.5.6 (stale-source disabling): return the disabling source for a
// rule, or null. A rule is disabled when any source it is anchored to (its
// per-rule `sources` metadata, wave 52-6h) appears in `disabled` -- a Map or
// plain object sourceId -> { since, reason } produced by
// `disabledSourceMap(ledger)`. Pure.
function disablingSourceFor(rule, disabled) {
  if (!disabled) return null;
  const isMap = disabled instanceof Map;
  const has = isMap ? (id) => disabled.has(id) : (id) => Object.prototype.hasOwnProperty.call(disabled, id);
  const get = isMap ? (id) => disabled.get(id) : (id) => disabled[id];
  for (const src of (rule && rule.sources) || []) {
    if (has(src)) {
      const meta = get(src) || {};
      return { sourceId: src, since: meta.since || null, reason: meta.reason || '' };
    }
  }
  return null;
}

// runEngine(bundle, rules, opts). opts.disabledSources (Map | object) marks
// ledger sources the maintainer has taken offline (spec-v52 §4.5.6); rules
// anchored to a disabled source are skipped with a `disabled` finding instead
// of being run, and the report's audit trail records why.
export function runEngine(bundle, rules, opts) {
  const ruleSet = Array.isArray(rules) && rules.length ? rules : STARTER_RULES;
  const disabled = opts && opts.disabledSources ? opts.disabledSources : null;
  const findings = [];
  for (const rule of ruleSet) {
    const off = disablingSourceFor(rule, disabled);
    if (off) {
      const since = off.since ? ' as of ' + off.since : '';
      const reason = off.reason ? ' -- ' + off.reason : '';
      findings.push({
        ruleId: rule.id,
        severity: rule.severity,
        description: rule.description,
        citation: rule.citation,
        status: 'disabled',
        evidence: null,
        note: 'Rule disabled: source "' + off.sourceId + '" is unavailable' + since + reason
          + '. The rule did not run and will run again once the source is re-pointed (docs/pa-maintenance.md).',
      });
      continue;
    }
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
  const counts = { block: 0, flag: 0, info: 0, pass: 0, error: 0, disabled: 0 };
  for (const f of findings) {
    if (counts[f.status] != null) counts[f.status] += 1;
  }
  return counts;
}
