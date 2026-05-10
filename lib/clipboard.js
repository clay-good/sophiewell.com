// Clipboard helpers per spec-v2 section 3.2.
// - copyText(value) writes plain text via the Clipboard API.
// - formatCopyAll(items) builds the labeled multi-line summary for "Copy all".
//   Each item is { label, value, units? }. Output: "Label: Value Units".
//   Plain text only. No markdown. No HTML.

export async function copyText(value) {
  const text = String(value);
  // Async Clipboard API can reject with NotAllowedError when the document
  // is not focused or the permission is denied (W3C Clipboard API §6.3).
  // Catch and fall through to the legacy textarea path so the click never
  // surfaces an uncaught promise rejection.
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch { /* fall through to execCommand fallback */ }
  }
  // Fallback: hidden textarea + execCommand('copy'). Works on older browsers
  // and in contexts where the async API is blocked.
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function formatCopyAll(items) {
  if (!Array.isArray(items)) throw new TypeError('items must be an array');
  return items.map((it) => {
    if (!it || typeof it !== 'object') return '';
    const label = String(it.label || '').trim();
    const value = it.value == null ? '' : String(it.value);
    const units = it.units ? ` ${String(it.units)}` : '';
    return label ? `${label}: ${value}${units}` : `${value}${units}`;
  }).filter(Boolean).join('\n');
}

// Build a Copy button. If `value` is a function, it is called at click time
// (so the latest live-rendered output is captured). `live` is the
// aria-live element that should announce "copied" to screen readers.
export function copyButton(value, { label = 'Copy', live } = {}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy-btn';
  btn.textContent = label;
  btn.addEventListener('click', async () => {
    const v = typeof value === 'function' ? value() : value;
    let ok = false;
    try { ok = await copyText(v); } catch { ok = false; }
    if (live) live.textContent = ok ? 'copied' : 'copy failed';
    btn.dataset.copied = ok ? '1' : '0';
    setTimeout(() => { if (live) live.textContent = ''; }, 1500);
  });
  return btn;
}
