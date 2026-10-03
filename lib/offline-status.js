// The footer's one line about the offline copy (spec-v1541 §3). No banners,
// prompts or install nags: the browser's own "Add to home screen" is the
// install path, and this line only says what is saved.

// packStatusText({ complete, date, pct, persisted, update }) -> the line, or '' for none.
export function packStatusText(s) {
  if (s.update) return 'An update is ready. It will be used the next time you open the site.';
  if (s.complete) {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(s.date || '')
      ? new Date(`${s.date}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })
      : null;
    const saved = d ? `Saved for offline use, version of ${d}.` : 'Saved for offline use.';
    return s.persisted === false ? `${saved} The phone may clear the saved copy when storage runs low.` : saved;
  }
  if (Number.isFinite(s.pct)) return `Saving for offline use... ${s.pct}%.`;
  return '';
}

// installOfflineStatus(line, container, storage): keep `line` in step with the
// service worker. `container` is navigator.serviceWorker; `storage` is
// navigator.storage, asked once to keep the copy after the first complete pack.
export function installOfflineStatus(line, container, storage) {
  if (!line || !container) return;
  const state = {};
  const hadController = !!container.controller;
  const show = () => {
    const text = packStatusText(state);
    line.textContent = text;
    line.hidden = !text;
  };
  const keep = () => {
    if (state.persisted !== undefined || !storage || typeof storage.persist !== 'function') return;
    state.persisted = null;
    Promise.resolve(storage.persisted ? storage.persisted() : false)
      .then((already) => already || storage.persist())
      .then((ok) => { state.persisted = !!ok; show(); })
      .catch(() => {});
  };
  container.addEventListener('message', (event) => {
    const d = event.data || {};
    if (d.type === 'pack-progress' && !state.complete) {
      state.pct = d.pct;
      show();
    } else if (d.type === 'pack-status') {
      state.complete = !!d.complete;
      state.date = d.date;
      if (state.complete) keep();
      show();
    }
  });
  if (typeof container.startMessages === 'function') container.startMessages();
  container.ready.then((reg) => {
    if (reg.active) reg.active.postMessage({ type: 'pack-status' });
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state !== 'activated') return;
        if (hadController && state.complete) { state.update = true; show(); }
        else worker.postMessage({ type: 'pack-status' });
      });
    });
  }).catch(() => {});
}
