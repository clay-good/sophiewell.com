// The page must not scroll sideways. On failure, name the elements that stick
// out: a bare "378 > 321" from a CI engine nobody runs locally (Linux WebKit)
// says nothing about which element to fix.

import { expect } from '@playwright/test';

export async function expectNoHScroll(page, label = 'page') {
  const r = await page.evaluate(() => {
    const doc = document.documentElement;
    const client = doc.clientWidth;
    const wide = [];
    if (doc.scrollWidth > client + 1) {
      for (const n of document.body.querySelectorAll('*')) {
        const b = n.getBoundingClientRect();
        if (b.width && b.right > client + 1 && ![...n.children].some((c) => c.getBoundingClientRect().right > client + 1)) {
          const cls = typeof n.className === 'string' && n.className ? `.${n.className.trim().split(/\s+/).join('.')}` : '';
          wide.push(`${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ''}${cls} right=${Math.round(b.right)} "${(n.textContent || n.value || '').trim().slice(0, 40)}"`);
        }
      }
    }
    return { scroll: doc.scrollWidth, client, wide: wide.slice(0, 8) };
  });
  expect(r.scroll, `${label}: scrollWidth ${r.scroll} > clientWidth ${r.client}; widest: ${r.wide.join(' | ')}`).toBeLessThanOrEqual(r.client + 1);
}
