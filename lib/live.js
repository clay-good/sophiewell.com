// Live-render helper per spec-v2.md section 2.3.
// - No submit button.
// - Re-renders on every input change with a 50ms debounce.
// - Output region uses aria-live="polite" (set by the caller on the element).
// - On invalid input, the previous valid render persists (no flash, no modal).

export function debounce(fn, ms = 50) {
  let timer = null;
  let lastArgs;
  const run = () => { fn(...lastArgs); timer = null; };
  return (...args) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, ms);
  };
}

export function liveRender({ inputs, render, ms = 50 }) {
  if (!Array.isArray(inputs)) throw new TypeError('liveRender: inputs must be an array of element ids');
  const debounced = debounce(() => {
    try { render(); } catch { /* keep prior render on invalid input */ }
  }, ms);
  for (const id of inputs) {
    const el = document.getElementById(id);
    if (!el) continue;
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, debounced);
  }
  // Initial render so the user sees something immediately.
  try { render(); } catch { /* ignore */ }
}
