// spec-v1623 step 2: recognition off the main thread. Takes the dropped
// files, returns the inventory (lib/intake.js). Files stay in this tab.

import { inventory } from './intake.js';

self.addEventListener('message', async (event) => {
  const { type, entries } = event.data || {};
  if (type !== 'inventory') return;
  try {
    const result = await inventory(entries || []);
    self.postMessage({ type: 'inventory', result });
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : 'The files could not be read.' });
  }
});
