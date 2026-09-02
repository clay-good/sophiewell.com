#!/usr/bin/env node
// spec-v976: the GitHub issue and pull-request templates are the first thing a
// stranger reads, and they make promises the repository has to keep.
//
// Three of those promises are copies of something stated elsewhere, which is the
// shape that always drifts here (the README once said 1145 tiles against a
// catalog of 1564; the citation disclosure had three different names at once):
//
//   1. CONTRIBUTING.md tells a reporter to prefix a commitment violation with
//      `commitment-bypass:`. The template's `title:` has to actually start with it.
//   2. SECURITY.md says report privately, do NOT open a public issue, and gives
//      an address. The templates route people there, so they must name the same
//      address and must not invite a public security issue.
//   3. The commitments are eight. A template that names a different number is
//      telling a stranger something untrue about what the project guarantees.
//
// It also parses each template far enough to catch the two mistakes that make
// GitHub silently fall back to a blank issue form: a missing `name:`/`body:`, or
// a field marked required with no id.
//
// Deliberately not a YAML parser. This checks the handful of claims that can be
// wrong in a way a reader would notice; a real parser here would be a dependency
// bought for nothing.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIR = join(ROOT, '.github', 'ISSUE_TEMPLATE');
const errors = [];

const read = (p) => readFileSync(join(ROOT, p), 'utf8');

if (!existsSync(DIR)) {
  console.error('check-issue-templates: .github/ISSUE_TEMPLATE/ is missing.');
  process.exit(1);
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
const forms = files.filter((f) => !f.startsWith('config.'));
if (!forms.length) errors.push('no issue forms in .github/ISSUE_TEMPLATE/');

for (const f of forms) {
  const text = readFileSync(join(DIR, f), 'utf8');
  if (!/^name:\s*\S/m.test(text)) errors.push(`${f}: no top-level name:, so GitHub will not offer it`);
  if (!/^description:\s*\S/m.test(text)) errors.push(`${f}: no top-level description:`);
  if (!/^body:\s*$/m.test(text)) errors.push(`${f}: no body:, so the form renders empty`);
  // Every block that asks for input needs an id, or the answer is dropped.
  const blocks = text.split(/\n  - type: /).slice(1);
  for (const b of blocks) {
    const type = b.split('\n')[0].trim();
    if (type === 'markdown') continue;
    if (!/^\s{4}id:\s*\S/m.test(b)) errors.push(`${f}: a "${type}" field has no id:, so its answer is discarded`);
  }
  if (/\btabs?\t/.test(text) || /\t/.test(text)) errors.push(`${f}: contains a tab; YAML forbids tabs for indentation`);
}

// 1. The prefix CONTRIBUTING documents.
const contributing = read('CONTRIBUTING.md');
const prefix = (contributing.match(/title prefix\s+`([a-z-]+:)`/) || [])[1];
if (!prefix) {
  errors.push('CONTRIBUTING.md no longer documents an issue title prefix for a commitment bypass');
} else {
  const bypass = forms.find((f) => f.includes('commitment-bypass'));
  if (!bypass) errors.push(`CONTRIBUTING.md documents the "${prefix}" prefix but there is no template for it`);
  else {
    const title = (readFileSync(join(DIR, bypass), 'utf8').match(/^title:\s*"?([^"\n]+)/m) || [])[1] || '';
    if (!title.startsWith(prefix)) {
      errors.push(`${bypass}: title is "${title}" but CONTRIBUTING.md documents the prefix "${prefix}"`);
    }
  }
}

// 2. The security address, and no invitation to file publicly.
const security = read('SECURITY.md');
const email = (security.match(/`([^`@\s]+@[^`\s]+)`/) || [])[1];
if (!email) errors.push('SECURITY.md no longer states a reporting address');
const all = [...forms, ...files.filter((f) => f.startsWith('config.'))]
  .map((f) => readFileSync(join(DIR, f), 'utf8')).join('\n');
if (email && !all.includes(email)) {
  errors.push(`no issue template routes a security report to ${email}, the address SECURITY.md gives`);
}
for (const f of forms) {
  const text = readFileSync(join(DIR, f), 'utf8');
  if (/vulnerabilit/i.test(text) && !/do not open a public issue|email it privately|instead of opening/i.test(text)) {
    errors.push(`${f}: mentions vulnerabilities without sending the reporter to the private path SECURITY.md requires`);
  }
}

// 3. The number of commitments.
// Counted from the numbered entries of the COMMITMENTS array itself, which is
// what build-commitments-page.mjs renders and reports.
const commitmentsSrc = read('scripts/build-commitments-page.mjs');
const arrayBody = commitmentsSrc.slice(commitmentsSrc.indexOf('const COMMITMENTS = ['));
const count = (arrayBody.slice(0, arrayBody.indexOf('\n];')).match(/^\s*n: '\d+',$/gm) || []).length;
if (!count) errors.push('cannot read the commitment count out of scripts/build-commitments-page.mjs');
const stated = [...all.matchAll(/\b(eight|nine|seven|ten|\d+)\s+(?:public\s+)?commitments\b/gi)].map((m) => m[1].toLowerCase());
const WORDS = { seven: 7, eight: 8, nine: 9, ten: 10 };
for (const s of stated) {
  const n = WORDS[s] !== undefined ? WORDS[s] : Number(s);
  if (n !== count) errors.push(`an issue template says "${s} commitments"; build-commitments-page.mjs ships ${count}`);
}

if (errors.length) {
  console.error('check-issue-templates: violations.');
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`check-issue-templates: clean (${forms.length} forms, prefix "${prefix}" matches CONTRIBUTING, security reports routed to ${email}, ${count} commitments stated consistently).`);
