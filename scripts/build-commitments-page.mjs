#!/usr/bin/env node
// spec-v50 §4: builds the public-facing /commitments/ page that lists
// Sophie's eight posture commitments alongside the automated checks
// enforcing each one. Pure HTML, no JS, no per-page styles.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://sophiewell.com';
const CANONICAL = `${SITE}/commitments/`;
const TITLE = 'Sophie Well commitments - what we promise, enforced in CI';
const DESCRIPTION = 'Eight machine-checked commitments: no ads, no login, no telemetry, no third-party fetch, no AI, no cookies, no paid tier, MIT-licensed forever. Each is enforced by an automated check on every commit.';

const COMMITMENTS = [
  {
    n: '1',
    heading: 'No outbound network calls',
    body: 'Sophie does not call any server, ever. Every calculation runs in your browser. Closing the page or going offline does not change what Sophie can do.',
    enforcement: "_headers pins Content-Security-Policy connect-src 'self'. scripts/check-commitments.mjs asserts that shape on every build.",
    checkPath: 'scripts/check-commitments.mjs',
    spec: 'spec-v50 §3.1',
  },
  {
    n: '2',
    heading: 'No third-party scripts',
    body: "Sophie loads no code from anyone else's servers. All JavaScript is part of the page you downloaded.",
    enforcement: "_headers pins script-src 'self'. The grep-check rule and the commitments check both deny any third-party script vendor.",
    checkPath: 'scripts/grep-check.mjs',
    spec: 'spec-v50 §3.2',
  },
  {
    n: '3',
    heading: 'No cookies',
    body: 'Sophie sets no cookies, ever. There is no cookie banner because there is nothing to consent to.',
    enforcement: 'grep-check denies any cookie-writing API call in source files outside the test suite.',
    checkPath: 'scripts/grep-check.mjs',
    spec: 'spec-v50 §3.3',
  },
  {
    n: '4',
    heading: 'No persistent storage outside an allowlist',
    body: "Sophie remembers your theme and your offline cache, and nothing else. No identifiers, no usage data, no 'recently used' list, no preferences sync.",
    enforcement: 'check-commitments.mjs reads scripts/storage-allowlist.json and asserts every localStorage.setItem / sessionStorage.setItem / caches.open uses a key on the allowlist.',
    checkPath: 'scripts/check-commitments.mjs',
    spec: 'spec-v50 §3.4',
  },
  {
    n: '5',
    heading: 'No analytics, telemetry, or beaconing',
    body: "Sophie does not measure you. No analytics, no session recording, no error reporting to anyone else's server, no 'anonymous usage data.'",
    enforcement: 'grep-check denies a list of analytics / RUM / error-reporting vendor identifiers in any source file. The CSP connect-src self also blocks the network half at runtime.',
    checkPath: 'scripts/grep-check.mjs',
    spec: 'spec-v50 §3.5',
  },
  {
    n: '6',
    heading: 'No AI / LLM dependencies',
    body: "Sophie has no AI. Every number Sophie shows you is the output of a deterministic formula with a peer-reviewed citation. There is no model, no embedding, no 'AI-assisted' anything. Sophie will never add AI; if it does, it is a fork, not Sophie.",
    enforcement: 'check-commitments.mjs scans source for AI-vendor substrings in import / require / string-literal contexts, and asserts no AI-vendor package appears in package.json dependencies.',
    checkPath: 'scripts/check-commitments.mjs',
    spec: 'spec-v50 §3.6',
  },
  {
    n: '7',
    heading: 'No login, account, or paid tier',
    body: 'Sophie has no login, no account, and no paid features. The site has one tier. It is free. It will stay free.',
    enforcement: 'grep-check denies auth and paywall vendor identifiers. check-commitments.mjs asserts no auth / paywall package appears in package.json dependencies.',
    checkPath: 'scripts/check-commitments.mjs',
    spec: 'spec-v50 §3.7',
  },
  {
    n: '8',
    heading: 'MIT-licensed forever; SBOM published every build',
    body: 'Sophie is MIT-licensed. The license never changes. Every build publishes a Software Bill of Materials listing every runtime file, every source file, and every development dependency.',
    enforcement: 'check-commitments.mjs asserts package.json license === "MIT" and LICENSE first line begins with "MIT License". scripts/build-sbom.mjs runs on every build.',
    checkPath: 'scripts/check-commitments.mjs',
    spec: 'spec-v50 §3.8',
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function commitmentHtml(c) {
  return `        <section class="commitments-item" id="c-${c.n}" aria-labelledby="c-${c.n}-h">
          <h2 id="c-${c.n}-h"><span class="commitments-num">${c.n}.</span> ${esc(c.heading)}</h2>
          <p class="commitments-body">${esc(c.body)}</p>
          <p class="commitments-enforcement"><strong>How it is enforced:</strong> ${esc(c.enforcement)} <a href="https://github.com/clay-good/sophiewell.com/blob/main/${esc(c.checkPath)}" rel="noopener" target="_blank">View the check &rarr;</a> (${esc(c.spec)})</p>
        </section>`;
}

function pageHtml() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sophie Well', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Commitments', item: CANONICAL },
    ],
  };
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <meta name="referrer" content="no-referrer" />
    <meta name="color-scheme" content="dark" />

    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <meta name="author" content="Clay Good" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${CANONICAL}" />
    <link rel="author" href="https://claygood.com" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sophie Well" />
    <meta property="og:url" content="${CANONICAL}" />
    <meta property="og:title" content="${esc(TITLE)}" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${CANONICAL}" />
    <meta property="twitter:title" content="${esc(TITLE)}" />
    <meta property="twitter:description" content="${esc(DESCRIPTION)}" />

    <link rel="stylesheet" href="/styles.css" />
    <script src="/theme.js" defer></script>

    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
  </head>
  <body class="commitments-page">
    <header class="topbar" role="banner">
      <div class="topbar-inner">
        <a class="topbar-home" href="/">
          <img src="/logo.png" alt="" width="28" height="28" />
          <span>Sophie Well</span>
        </a>
      </div>
    </header>

    <main id="main" class="commitments-main" tabindex="-1">
      <article class="commitments-article">
        <h1>Sophie&rsquo;s commitments</h1>
        <p class="commitments-lede">
          Sophie Well is public infrastructure. These are the eight
          guarantees Sophie makes about itself. Each one is a sentence
          of plain English plus an automated check that fails CI on
          every commit if the rule is violated.
        </p>
        <p class="commitments-meta">
          Defined in <a href="https://github.com/clay-good/sophiewell.com/blob/main/docs/spec-v50.md" rel="noopener" target="_blank">spec-v50</a>.
          Source of the checks: <a href="https://github.com/clay-good/sophiewell.com/tree/main/scripts" rel="noopener" target="_blank">scripts/</a>.
        </p>

${COMMITMENTS.map(commitmentHtml).join('\n\n')}

        <section class="commitments-footnote">
          <h2>Change process</h2>
          <p>
            Changing any commitment requires amending spec-v50 by name in a
            pull request, alongside the corresponding change to the
            automated check. The process is documented in
            <a href="https://github.com/clay-good/sophiewell.com/blob/main/CONTRIBUTING.md" rel="noopener" target="_blank">CONTRIBUTING.md</a>.
            Found a way to bypass one of these checks? File an issue at
            <a href="https://github.com/clay-good/sophiewell.com/issues" rel="noopener" target="_blank">github.com/clay-good/sophiewell.com/issues</a>.
          </p>
        </section>
      </article>
    </main>

    <footer class="site-footer" role="contentinfo">
      <p><a href="/">&larr; Back to Sophie Well</a></p>
    </footer>
  </body>
</html>
`;
}

async function main() {
  const outDir = join(DIST, 'commitments');
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), pageHtml(), 'utf8');
  console.log(`build-commitments-page: wrote /commitments/ (${COMMITMENTS.length} commitments).`);
}

main().catch((err) => { console.error('build-commitments-page: failed', err); process.exit(1); });
