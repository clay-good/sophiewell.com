#!/usr/bin/env node
// spec-seo Phase 2 (§5): generate one pre-rendered HTML page per tile at
// `dist/tools/<id>/index.html`. Each page is a real indexable URL with
// SEO-shaped <title>, <meta description>, canonical, a visible <h1>,
// a templated prose block (description / when to use / source), and
// a "Open the calculator" link back into the SPA at `/#<id>`.
//
// The script is template-only for the first cut: prose is generated
// deterministically from META + the tile description in index.html.
// Phase 2 follow-on PRs can replace any individual tile's templated
// prose with hand-authored copy in `data/tool-copy/<id>.json`.
//
// Source-of-truth:
//   - tile id, name, group, audiences: UTILITIES in app.js
//   - tile short description:           tc-desc <span> in index.html
//   - citation / source / example:      META in lib/meta.js
//
// Output: `dist/tools/<id>/index.html`. The dev source tree does not
// contain `dist/`; this script only runs as part of `npm run build`.

import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://sophiewell.com';

const GROUP_LABELS = {
  A: 'Code Reference',
  C: 'Patient Bill & Insurance Literacy',
  E: 'Clinical Math & Conversions',
  F: 'Medication & Infusion',
  G: 'Clinical Scoring & Reference',
  H: 'Workflow & Templates',
  I: 'Field Medicine',
  J: 'Public Health Decision Trees',
  K: 'Lab Reference',
  L: 'Forms & Numbers Literacy',
  N: 'Literacy Helpers',
  O: 'Patient Safety',
};

// --- Parse UTILITIES from app.js. We can't import app.js under Node
// because it pulls in views that touch the DOM at module init; parse
// the literal instead. (Same approach as build-ld.mjs / build-sitemap.mjs.)
async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('build-tool-pages: could not find UTILITIES in app.js');
  const tiles = [];
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    const name = line.match(/name:\s*'([^']+)'/);
    const group = line.match(/group:\s*'([^']+)'/);
    if (id && name && group) {
      tiles.push({ id: id[1], name: name[1], group: group[1] });
    }
  }
  if (tiles.length === 0) throw new Error('build-tool-pages: zero tiles parsed.');
  return tiles;
}

// --- Parse tile descriptions from index.html. The button block uses
// `tc-desc` <span>. Description text may contain a literal `<`, so we
// match through the close-tag explicitly rather than `[^<]+`.
async function loadDescriptions() {
  const html = await readFile(join(ROOT, 'index.html'), 'utf8');
  const out = new Map();
  const rx = /data-tool="([^"]+)"[\s\S]*?<span class="tc-desc">([\s\S]*?)<\/span>/g;
  let m;
  while ((m = rx.exec(html))) {
    if (!out.has(m[1])) out.set(m[1], m[2].trim());
  }
  return out;
}

// --- Load META directly (lib/meta.js is a pure module, no DOM access).
async function loadMeta() {
  const mod = await import(new URL('../lib/meta.js', import.meta.url));
  return mod.META;
}

// --- Per-tile prose overrides (spec-seo §5.4 + §14.2). Hand-authored
// copy lives at `data/tool-copy/<id>.json`. Recognized fields:
//   { whatThisIs?: string, whenToUse?: string }
// Either may be omitted; missing fields fall back to the templated
// defaults. Phase 2 follow-on PRs author one of these per top-50 tile.
async function loadToolCopy(id) {
  const path = new URL(`../data/tool-copy/${id}.json`, import.meta.url);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (err) {
    console.warn(`build-tool-pages: skipping malformed data/tool-copy/${id}.json (${err.message})`);
    return null;
  }
}

// --- spec-seo §7.2 classifier. Maps each tile to a schema.org
// additionalType. The page @type stays at MedicalWebPage (clinical
// surface) or WebPage so the base node is always validator-clean;
// additionalType layers on the more specific intent (MedicalCalculator,
// HowTo, Dataset, SoftwareApplication) Google's rich-result pipelines
// look for. Sets are explicit (not heuristic) so a contributor adding
// a new tile makes a deliberate choice about its discovery surface.
const HOW_TO_TILES = new Set([
  // Group C decoders + template generators
  'decoder', 'eob-decoder', 'msn-decoder', 'insurance-card',
  'abn-explainer', 'appeal-letter', 'hipaa-roa',
  // Group H workflow templates
  'prep', 'prior-auth', 'hipaa-auth', 'roi', 'discharge-instr',
  'specialty-visit', 'wallet-card', 'sbar-template',
  // Group I documentation helper
  'ems-doc',
  // Group L printable forms
  'cms1500', 'ub04',
]);
const DATASET_TILES = new Set([
  // Group A code lookups
  'icd10', 'hcpcs', 'cpt', 'ndc', 'pos-codes', 'modifier-codes',
  'revenue-codes', 'carc', 'rarc', 'hcpcs-mod', 'pos-lookup',
  'tob-decode', 'rev-table', 'nubc-codes', 'drg-lookup', 'apc-lookup',
  'pcs-lookup', 'rxnorm-lookup', 'ndc-rxnorm',
  // Group G drug-condition lookup
  'beers',
  // Group J reference table
  'sti-screening',
  // Group K lab references
  'lab-adult', 'lab-peds', 'tdm-levels', 'tox-levels',
  // Group L glossary
  'eob-glossary',
  // Group I hazmat / pocket guide tables
  'dot-erg', 'niosh-pg',
]);
const REFERENCE_TILES = new Set([
  // Group G pure-table clinical references
  'asa', 'mallampati', 'mrs', 'peds-vitals', 'lab-ranges',
  // Group F reference tables
  'high-alert', 'peds-dose', 'anticoag-reversal', 'iv-to-po',
  // Group I reference tables
  'adult-arrest-ref', 'peds-arrest-ref', 'hypothermia', 'heat-illness',
  'toxidromes', 'cpr-numeric', 'tccc', 'co-cn-antidote',
  // Group O patient-safety card
  'high-alert-card',
]);

function classify(tile) {
  // Math / scoring / clinical-decision tiles are MedicalCalculator.
  // The HowTo / Dataset / Reference allowlists override that default
  // for tiles that semantically aren't a calculator.
  if (HOW_TO_TILES.has(tile.id)) {
    return { ldType: 'WebPage', additionalType: 'https://schema.org/HowTo', kind: 'howto' };
  }
  if (DATASET_TILES.has(tile.id)) {
    return { ldType: 'WebPage', additionalType: 'https://schema.org/Dataset', kind: 'dataset' };
  }
  if (REFERENCE_TILES.has(tile.id)) {
    return { ldType: 'MedicalWebPage', additionalType: null, kind: 'reference' };
  }
  if (['E', 'F', 'G', 'I'].includes(tile.group)) {
    return { ldType: 'MedicalWebPage', additionalType: 'https://schema.org/MedicalCalculator', kind: 'calculator' };
  }
  // Group C regulatory + Group N literacy + everything else.
  return { ldType: 'WebPage', additionalType: null, kind: 'webpage' };
}

// --- Minimal HTML escaper for templated text. Outputs are written to
// disk, never executed; the escape exists so a description that mentions
// `< 90 mmHg` does not break the surrounding markup.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clampTitle(s, max = 65) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

function clampDescription(s, max = 158) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

function pickRelated(tiles, current, max = 4) {
  return tiles
    .filter((t) => t.group === current.group && t.id !== current.id)
    .slice(0, max);
}

// --- Per-tile prose block (templated). The blocks reuse what META
// already says when META has it, otherwise fall back to the tile
// description. Hand-authored copy can replace any of these in a
// later PR by reading from `data/tool-copy/<id>.json` (not wired here).
function buildPageHtml({ tile, desc, meta, related, copy }) {
  const groupLabel = GROUP_LABELS[tile.group] || tile.group;
  const seoTitle = clampTitle(`${tile.name} - Free, in your browser · Sophie Well`);
  const seoDesc = clampDescription(
    `${desc} Free, runs in your browser, no signup, no tracking. Sophie Well.`
  );
  const canonical = `${SITE}/tools/${tile.id}/`;
  const hashUrl = `${SITE}/#${tile.id}`;

  const citationHtml = meta?.citation
    ? `<p>${esc(meta.citation)}</p>`
    : '';
  const sourceHtml = meta?.source?.label
    ? `<p class="src-stamp"><strong>Source:</strong> ${esc(meta.source.label)}</p>`
    : '';
  const exampleHtml = meta?.example?.expected
    ? `<p><strong>Worked example:</strong> ${esc(meta.example.expected)}</p>`
    : '';

  const relatedHtml = related.length
    ? `<nav class="tp-related" aria-label="Related tools">
        <h2>Related tools</h2>
        <ul>
${related.map((r) => `          <li><a href="${SITE}/tools/${r.id}/">${esc(r.name)}</a></li>`).join('\n')}
        </ul>
      </nav>`
    : '';

  // spec-seo §7.2: per-tool JSON-LD type via classify(). Dataset
  // tiles also emit a sibling Dataset node so Google Dataset Search
  // picks them up; HowTo tiles emit a minimal three-step Open ->
  // Enter -> Read recipe so the additionalType isn't load-bearing
  // alone.
  const { ldType, additionalType, kind } = classify(tile);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sophie Well', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: groupLabel, item: `${SITE}/#g-${tile.group}` },
      { '@type': 'ListItem', position: 3, name: tile.name, item: canonical },
    ],
  };
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': ldType,
    name: tile.name,
    description: desc,
    url: canonical,
    isAccessibleForFree: true,
    inLanguage: 'en',
    author: { '@type': 'Person', name: 'Clay Good', url: 'https://claygood.com' },
    publisher: { '@type': 'Organization', name: 'Sophie Well', url: SITE },
    isPartOf: { '@id': `${SITE}/#webapp` },
  };
  if (additionalType) pageLd.additionalType = additionalType;
  if (meta?.citation) pageLd.citation = meta.citation;

  // Dataset sibling node (separate <script>) for Group A / K / L
  // lookups that ship a real bundled table. Google Dataset Search is
  // a low-competition vertical for this kind of content.
  const datasetLd = (kind === 'dataset')
    ? {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: tile.name,
        description: desc,
        url: canonical,
        keywords: [tile.name, groupLabel],
        isAccessibleForFree: true,
        license: 'https://github.com/clay-good/sophiewell.com/blob/main/LICENSE',
        creator: { '@type': 'Person', name: 'Clay Good', url: 'https://claygood.com' },
        ...(meta?.source?.label ? { sourceOrganization: { '@type': 'Organization', name: meta.source.label } } : {}),
      }
    : null;

  // Minimal HowTo recipe for decoders + template generators. Google's
  // HowTo rich result needs an explicit step list; without it the
  // additionalType is just a hint.
  const howToLd = (kind === 'howto')
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: tile.name,
        description: desc,
        totalTime: 'PT2M',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Open the tool', text: `Open ${tile.name} in your browser at ${hashUrl}. No signup, no install.` },
          { '@type': 'HowToStep', position: 2, name: 'Enter your inputs', text: 'Each field is pre-filled with a worked example so you can see the expected format. Overwrite the values with your own.' },
          { '@type': 'HowToStep', position: 3, name: 'Read the result', text: 'The output is computed deterministically. The References region under the result links to the primary source.' },
        ],
      }
    : null;

  const whatThisIsText = copy?.whatThisIs
    || `${tile.name} is one of 178 deterministic tools in Sophie Well's ${groupLabel} group. ${desc}`;
  const whenToUseText = copy?.whenToUse
    || `Use this tool when you need a quick, citable reference. Every calculation runs entirely in your browser - no inputs leave your device, no account is required, no AI is involved. The site enforces a strict Content Security Policy and ships no analytics or third-party CDN.`;

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

    <title>${esc(seoTitle)}</title>
    <meta name="description" content="${esc(seoDesc)}" />
    <meta name="author" content="Clay Good" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="author" href="https://claygood.com" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Sophie Well" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(seoTitle)}" />
    <meta property="og:description" content="${esc(seoDesc)}" />
    <meta property="og:image" content="${SITE}/logo.png" />
    <meta property="og:locale" content="en_US" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${canonical}" />
    <meta property="twitter:title" content="${esc(seoTitle)}" />
    <meta property="twitter:description" content="${esc(seoDesc)}" />
    <meta property="twitter:image" content="${SITE}/logo.png" />

    <script type="application/ld+json">
${JSON.stringify(pageLd, null, 2)}
    </script>
    <script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
    </script>
${datasetLd ? `    <script type="application/ld+json">\n${JSON.stringify(datasetLd, null, 2)}\n    </script>\n` : ''}${howToLd ? `    <script type="application/ld+json">\n${JSON.stringify(howToLd, null, 2)}\n    </script>\n` : ''}
    <link rel="stylesheet" href="/styles.css" />
    <script src="/theme.js"></script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="topbar" role="banner">
      <a href="/" class="topbar-brand" aria-label="Sophie Well, home">
        <img src="/logo.png" alt="Sophie Well logo" width="32" height="32" />
        <span>Sophie Well</span>
      </a>
    </header>

    <div class="container">
      <main id="main" class="tool-page">
        <nav class="tp-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> / </span>
          <span>${esc(groupLabel)}</span>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">${esc(tile.name)}</span>
        </nav>

        <h1 class="tp-h1">${esc(tile.name)}</h1>
        <p class="tp-lede">${esc(desc)}</p>

        <p class="tp-cta">
          <a class="tp-open" href="${hashUrl}">Open the ${esc(tile.name)} →</a>
          <span class="muted">Runs in your browser. No signup, no tracking.</span>
        </p>

        <section class="tp-what" aria-labelledby="tp-what-h">
          <h2 id="tp-what-h">What this is</h2>
          <p>${esc(whatThisIsText)}</p>
        </section>

        <section class="tp-when" aria-labelledby="tp-when-h">
          <h2 id="tp-when-h">When to use it</h2>
          <p>${esc(whenToUseText)}</p>
        </section>

        <section class="tp-refs" aria-labelledby="tp-refs-h">
          <h2 id="tp-refs-h">References</h2>
          ${citationHtml}
          ${sourceHtml}
          ${exampleHtml}
          <p class="muted">Sophie Well is a reference and educational tool. Not medical, legal, or financial advice. Does not replace clinician judgment, professional billing review, or legal counsel.</p>
        </section>

        ${relatedHtml}

        <p class="tp-author muted">Built by <a href="https://claygood.com" rel="noopener" target="_blank">Clay Good</a>. Source on <a href="https://github.com/clay-good/sophiewell.com" rel="noopener" target="_blank">GitHub</a>.</p>
      </main>
    </div>
  </body>
</html>
`;
}

async function ensureDir(p) { await mkdir(p, { recursive: true }); }

async function main() {
  if (!existsSync(DIST)) {
    console.error('build-tool-pages: dist/ does not exist. Run after the main build copies static assets.');
    process.exit(1);
  }
  // Clean any prior tool pages so a removed tile does not linger in dist/.
  const toolsDir = join(DIST, 'tools');
  if (existsSync(toolsDir)) await rm(toolsDir, { recursive: true, force: true });
  await ensureDir(toolsDir);

  const [tiles, descriptions, meta] = await Promise.all([
    loadUtilities(), loadDescriptions(), loadMeta(),
  ]);

  let written = 0;
  let withCopy = 0;
  for (const tile of tiles) {
    const desc = descriptions.get(tile.id) || `${tile.name} - a deterministic tool in Sophie Well's ${GROUP_LABELS[tile.group] || tile.group} group.`;
    const copy = await loadToolCopy(tile.id);
    if (copy) withCopy += 1;
    const html = buildPageHtml({
      tile,
      desc,
      meta: meta[tile.id],
      related: pickRelated(tiles, tile),
      copy,
    });
    const out = join(toolsDir, tile.id);
    await ensureDir(out);
    await writeFile(join(out, 'index.html'), html, 'utf8');
    written += 1;
  }
  console.log(`build-tool-pages: wrote ${written} pre-rendered tool pages under dist/tools/ (${withCopy} with hand-authored copy).`);
}

main().catch((err) => { console.error('build-tool-pages: failed', err); process.exit(1); });
