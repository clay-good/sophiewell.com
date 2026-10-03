// The footer's one line about the offline copy (spec-v1541 §3). No banners,
// prompts or install nags: the browser's own "Add to home screen" is the
// install path, and this line only says what is saved. Its words go through the language layer
// (lib/i18n.js); English is the only language shipped.

import { t, localeTag } from './i18n.js';
import './i18n/en/offline-status.js';

// packStatusText({ complete, date, pct, persisted, update }) -> the line, or '' for none.
export function packStatusText(s) {
  const T = (key, vars) => t('offline-status', key, vars);
  if (s.update) return T('update');
  if (s.complete) {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(s.date || '')
      ? new Date(`${s.date}T00:00:00Z`).toLocaleDateString(localeTag(), { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })
      : null;
    const saved = d ? T('savedOn', { date: d }) : T('saved');
    return s.persisted === false ? `${saved} ${T('mayClear')}` : saved;
  }
  if (Number.isFinite(s.pct)) return T('saving', { pct: s.pct });
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
