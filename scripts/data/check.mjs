// scripts/data/check.mjs -- spec-v1621 §2, §4 and §5.
//
// What a freshly parsed dataset must satisfy before it is written, and the
// one decision the weekly workflow makes from the run summary: merge its own
// pull request, or wait for a person.

export const MAX_COUNT_CHANGE = 0.2;

// A canary is a known value from the edition's own publication:
//   { label, value: (records, ancillary) => actual, expect: number | string | { min, max } }
// A number expected exactly is compared to 4 decimal places (CMS prints
// weights and RVUs to four).
function canaryPasses(actual, expect) {
  if (expect && typeof expect === 'object') {
    return typeof actual === 'number' && actual >= expect.min && actual <= expect.max;
  }
  if (typeof expect === 'number') return typeof actual === 'number' && Math.abs(actual - expect) < 5e-5;
  return actual === expect;
}

// checkDataset({ records, ancillary, recordBounds, previousCount, canaries, shape })
//   -> { ok, problems[], canaryResults[] }
// `shape(record)` returns a problem string or null; the first 5 are reported.
export function checkDataset({ records, ancillary = {}, recordBounds, previousCount, canaries = [], shape }) {
  const problems = [];
  const n = records.length;
  if (recordBounds && (n < recordBounds.min || n > recordBounds.max)) {
    problems.push(`${n} records, outside the expected ${recordBounds.min}-${recordBounds.max}`);
  }
  if (previousCount && Math.abs(n - previousCount) / previousCount > MAX_COUNT_CHANGE) {
    problems.push(`record count moved ${Math.round(((n - previousCount) / previousCount) * 100)}% (${previousCount} -> ${n})`);
  }
  if (shape) {
    const bad = [];
    for (let i = 0; i < n && bad.length < 5; i += 1) {
      const p = shape(records[i]);
      if (p) bad.push(`record ${i + 1}: ${p}`);
    }
    problems.push(...bad);
  }
  const canaryResults = canaries.map((c) => {
    let actual;
    try { actual = c.value(records, ancillary); } catch (err) { actual = `error: ${err.message}`; }
    const ok = canaryPasses(actual, c.expect);
    if (!ok) problems.push(`canary "${c.label}": expected ${JSON.stringify(c.expect)}, got ${JSON.stringify(actual)}`);
    return { label: c.label, ok, actual };
  });
  return { ok: problems.length === 0, problems, canaryResults };
}

// decidePublish(summary) -> { action: 'none' | 'merge' | 'review', reasons[] }
//
// summary.datasets[]: { id, status: 'unchanged' | 'updated' | 'failed' | 'gated',
//   problems[], sameEditionHashChange?, editionWithoutCanaries? }
//
// Merge only when every dataset is unchanged, updated cleanly, or gated off,
// at least one was updated, and nothing needs a person: no failure, no
// problem, no publisher re-post of the same edition, no new edition whose
// canaries nobody has recorded yet.
export function decidePublish(summary) {
  const reasons = [];
  const ds = (summary && summary.datasets) || [];
  for (const d of ds) {
    if (d.status === 'failed') reasons.push(`${d.id}: the builder failed${d.problems && d.problems.length ? ` (${d.problems[0]})` : ''}; the previous data was kept`);
    else if (d.problems && d.problems.length) reasons.push(`${d.id}: ${d.problems.join('; ')}`);
    if (d.sameEditionHashChange) reasons.push(`${d.id}: the publisher re-posted ${d.edition || 'the same edition'} with different content`);
    if (d.editionWithoutCanaries) reasons.push(`${d.id}: ${d.edition || 'a new edition'} has no canaries recorded yet; add them from the release notes`);
  }
  if (reasons.length) return { action: 'review', reasons };
  if (!ds.some((d) => d.status === 'updated')) return { action: 'none', reasons: [] };
  return { action: 'merge', reasons: [] };
}
