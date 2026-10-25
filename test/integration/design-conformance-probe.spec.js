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

  const css = readFileSync(join(ROOT, 'styles.css'), 'utf8');
  const hexLiterals = (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;

  console.log('[design-conformance] views with a raw file input (migrate to dropzone):',
    rawFileInputs.length, rawFileInputs.join(', ') || '(none)');
  console.log('[design-conformance] views using inline style (move to shared classes):',
    inlineStyles.length, inlineStyles.join(', ') || '(none)');
  console.log('[design-conformance] hex color literals in styles.css (candidates to tokenize):',
    hexLiterals);
});
