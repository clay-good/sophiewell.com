// spec-v1602 tool 1: read a claims file (CARIN Blue Button) off the UI thread. No network code.
import { run } from './carin-run.js';

self.addEventListener('message', (event) => {
  try {
    const message = event.data || {};
    if (message.type !== 'read') throw new TypeError('Choose a claims file.');
    const { result, csv, receipts } = run(message.files || [], message.options || {});
    self.postMessage({ type: 'read', ...result, csv, receipt: receipts.receipt, shareableReceipt: receipts.shareable });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
