#!/usr/bin/env node
// spec-v982: every gate in the lint chain has to be findable by the person it
// stops.
//
// CI is the first conversation a contributor has with this repository, and it is
// one-sided: a check fails, prints its own name, and that is all. Two of the
// fifteen in `npm run lint` were explained nowhere -- not in CONTRIBUTING, not in
// docs/ -- so a stranger whose PR was refused by `check-tile-copy` had no way to
// learn what it wanted.
//
// This is the smallest rule that keeps that from happening again: a script may
// not join the lint chain without being named somewhere a reader can find it.
// It does not check that the explanation is GOOD -- nothing can -- only that the
// gate is not anonymous.
//
// Offline; runs in `npm run lint` alongside the gates it is about.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// spec-v985: follow `npm run <name>` through to the script it names.
//
// The chain calls every gate directly today, so reading `scripts/<x>.mjs` out of
// the one string found all of them -- and would go on reporting clean the first
// time someone factored a step out behind `npm run check:pa-staleness`, which
// package.json already defines. A gate hidden behind one level of indirection
// would become anonymous again with nothing to say so. Same shape of blindness
// as spec-v984's two-space indent.
export function lintChainScripts(pkgJson, entry = 'lint') {
  const scripts = (pkgJson && pkgJson.scripts) || {};
  const found = [];
  const seen = new Set();
  const walk = (name, depth) => {
    if (depth > 8 || seen.has(name) || !scripts[name]) return;   // depth guard: a script may reference itself
    seen.add(name);
    const chain = String(scripts[name]);
    for (const m of chain.matchAll(/scripts\/([A-Za-z0-9_-]+\.mjs)/g)) {
      if (!found.includes(m[1])) found.push(m[1]);
    }
    for (const m of chain.matchAll(/npm run ([A-Za-z0-9:_-]+)/g)) walk(m[1], depth + 1);
  };
  walk(entry, 0);
  return found;
}

export function undocumented(scripts, corpus) {
  return scripts.filter((s) => !corpus.includes(s));
}

function main() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const scripts = lintChainScripts(pkg);

  const texts = [readFileSync(join(ROOT, 'CONTRIBUTING.md'), 'utf8')];
  const docs = join(ROOT, 'docs');
  if (existsSync(docs)) {
    for (const f of readdirSync(docs)) {
      if (f.endsWith('.md')) texts.push(readFileSync(join(docs, f), 'utf8'));
    }
  }
  const corpus = texts.join('\n');

  const missing = undocumented(scripts, corpus);
  if (missing.length) {
    console.error('check-gates-documented: violations.');
    for (const m of missing) {
      console.error(`  scripts/${m} is in the lint chain and named in neither CONTRIBUTING.md nor docs/.`);
    }
    console.error('  Add it to the gate table in CONTRIBUTING.md ("The gates, and what each is for").');
    process.exit(1);
  }
  console.log(`check-gates-documented: clean (${scripts.length} lint-chain gates, all named in CONTRIBUTING.md or docs/).`);
}

if (process.argv[1] && process.argv[1].endsWith('check-gates-documented.mjs')) main();
