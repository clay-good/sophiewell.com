// Probe (not a gate): spec-v1063 excludes *-probe.spec.js unless RUN_PROBES=1.
// This finder sizes the remaining design-system-cleanup waves (docs/design.md,
// openspec/changes/design-system-cleanup) by listing the spots in source that do
// not yet use the shared components. It is static analysis -- it reads files, it
// never launches a page -- and it never fails; it only reports.
//
//   RUN_PROBES=1 npx playwright test test/integration/design-conformance-probe.spec.js --project=chromium
import { test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('design-conformance finder: non-conforming spots by category', () => {
  const viewsDir = join(ROOT, 'views');
  const views = readdirSync(viewsDir).filter((f) => f.endsWith('.js'));

  const rawFileInputs = [];
  const inlineStyles = [];
  for (const file of views) {
    const src = readFileSync(join(viewsDir, file), 'utf8');
    // A native file input built in a view that does not route through dropzone().
    if (/type:\s*'file'/.test(src) && !/\bdropzone\s*\(/.test(src)) rawFileInputs.push(file);
    // Presentation that bypasses shared classes + tokens.
    if (/\bstyle:\s*['"`]/.test(src) || /\.style\.[a-zA-Z]/.test(src)) inlineStyles.push(file);
  }

  // Wave 3.3 sizing: a `resultRow` call that states three or more labeled
  // numbers and has not opted into the stat grid (`{ stats: true }`) is a
  // candidate -- a panel of numbers still rendered as a stack of sentences.
  const statCandidates = [];
  for (const file of views) {
    const lines = readFileSync(join(viewsDir, file), 'utf8').split('\n');
    let open = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!/resultRow\(/.test(lines[i])) continue;
      let call = '';
      for (let j = i; j < Math.min(lines.length, i + 40); j++) {
        call += `${lines[j]}\n`;
        if (/^\s*(\]\s*)?\)\s*;\s*$/.test(lines[j])) break;
      }
      const labels = (call.match(/\{\s*label:/g) || []).length;
      if (labels >= 3 && !/stats:\s*true/.test(call)) open++;
    }
    if (open) statCandidates.push(`${file}:${open}`);
  }

  const css = readFileSync(join(ROOT, 'styles.css'), 'utf8');
  const hexLiterals = (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;

  console.log('[design-conformance] views with a raw file input (migrate to dropzone):',
    rawFileInputs.length, rawFileInputs.join(', ') || '(none)');
  console.log('[design-conformance] views using inline style (move to shared classes):',
    inlineStyles.length, inlineStyles.join(', ') || '(none)');
  console.log('[design-conformance] hex color literals in styles.css (candidates to tokenize):',
    hexLiterals);
  console.log('[design-conformance] multi-number results not yet on the stat grid (file:calls):',
    statCandidates.reduce((n, s) => n + Number(s.split(':')[1]), 0),
    statCandidates.join(', ') || '(none)');
});
