// spec-v953: the visible group name, and the five files that each keep a copy.
//
// `GROUP_LABELS` is what a reader sees above a list of tools -- "Clinical Scoring & Risk",
// "EMS & Field Medicine". It is declared FIVE times: once in app.js for the live app, and once
// each in the three builders that render it onto the pre-rendered pages (the /tools/ index, the
// audience hubs, and every tool page), plus the audit-coverage report.
//
// Nothing held them in step, and one had already drifted: `scripts/audit-coverage.mjs` was
// missing group B entirely, so its report printed "B B" for the 25 billing-and-reimbursement
// tiles. The four reader-facing copies still agreed, which is luck rather than design -- the
// next label edit had four chances to leave one behind.
//
// This module is the shared, pure half so a unit test can prove the rule bites without
// touching the filesystem; scripts/check-catalog-truth.mjs runs it over the real files.

// Every file that declares GROUP_LABELS. app.js is first because it is the source of truth --
// it is the one the live app reads.
export const LABEL_FILES = [
  'app.js',
  'scripts/build-tool-pages.mjs',
  'scripts/build-tools-index.mjs',
  'scripts/build-hub-pages.mjs',
  'scripts/audit-coverage.mjs',
];

// parseGroupLabels(text) -> { A: 'Billing & Coding', ... } | null when the file declares none.
export function parseGroupLabels(text) {
  const start = text.indexOf('GROUP_LABELS = {');
  if (start === -1) return null;
  const end = text.indexOf('};', start);
  if (end === -1) return null;
  const out = {};
  for (const m of text.slice(start, end).matchAll(/^\s*'?([A-Z])'?:\s*'([^']*)'/gm)) out[m[1]] = m[2];
  return out;
}

// findLabelDrift({ path, labels }[]) -> [string]. The first entry is the source of truth.
export function findLabelDrift(files) {
  const out = [];
  const [truth, ...rest] = files;
  if (!truth || !truth.labels) return ['app.js declares no GROUP_LABELS; the source of truth is gone'];
  for (const f of rest) {
    if (!f.labels) {
      out.push(`${f.path} declares no GROUP_LABELS (it used to; ${truth.path} still does)`);
      continue;
    }
    for (const key of Object.keys(truth.labels)) {
      if (!(key in f.labels)) {
        out.push(`${f.path} is missing group ${key} ("${truth.labels[key]}"), so it prints the bare letter`);
      } else if (f.labels[key] !== truth.labels[key]) {
        out.push(`${f.path} calls group ${key} "${f.labels[key]}" where ${truth.path} calls it "${truth.labels[key]}"`);
      }
    }
    for (const key of Object.keys(f.labels)) {
      if (!(key in truth.labels)) {
        out.push(`${f.path} names a group ${key} ("${f.labels[key]}") that ${truth.path} does not have`);
      }
    }
  }
  return out;
}
