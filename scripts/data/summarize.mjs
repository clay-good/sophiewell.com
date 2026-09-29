#!/usr/bin/env node
// scripts/data/summarize.mjs -- spec-v1621 §4 and §5.
//
// Turns data-refresh-summary.json into the Markdown that heads the weekly
// pull request: the decision and its reasons first, then one line per live
// dataset. Also prints the decision alone with --decision, for the workflow.
//
// Usage: node scripts/data/summarize.mjs data-refresh-summary.json [--decision]

import { readFileSync } from 'node:fs';

export function summaryMarkdown(summary) {
  const d = summary.decision || { action: 'none', reasons: [] };
  const out = [];
  if (d.action === 'review') {
    out.push('**Needs a person (`data-review`).** This pull request will not merge itself:', '');
    for (const r of d.reasons) out.push(`- ${r}`);
  } else if (d.action === 'merge') {
    out.push('**Every check passed; this pull request merges itself.**');
  } else {
    out.push('No live dataset changed.');
  }
  out.push('', '| Dataset | Status | Edition | Records |', '|---|---|---|---|');
  for (const s of summary.datasets || []) {
    const edition = s.editionBefore && s.edition && s.editionBefore !== s.edition ? `${s.editionBefore} -> ${s.edition}` : (s.edition || s.editionBefore || '');
    out.push(`| ${s.id} | ${s.status}${s.problems && s.problems.length ? ` (${s.problems.length} problem${s.problems.length === 1 ? '' : 's'})` : ''} | ${edition} | ${s.recordCount ?? ''} |`);
  }
  return out.join('\n') + '\n';
}

if (process.argv[1] && process.argv[1].endsWith('summarize.mjs')) {
  const summary = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  process.stdout.write(process.argv.includes('--decision') ? `${(summary.decision || {}).action || 'none'}\n` : summaryMarkdown(summary));
}
