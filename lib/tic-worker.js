// spec-v1604 tool 1: check insurer price files locally, streamed in a Worker so a file of gigabytes
// never sits in the page. No network code; the result carries a receipt naming each file by SHA-256.
import { runTic } from './tic-run.js';

self.addEventListener('message', async (event) => {
  try {
    const message = event.data || {};
    const files = [...(message.files || [])].filter((f) => f instanceof Blob);
    if (message.type !== 'validate' || !files.length) throw new TypeError('Choose an insurer price file.');
    let last = '';
    const { result, receipts } = await runTic(files.map((blob) => ({ blob, name: blob.name })), (index, bytesRead) => {
      const step = `${index}:${Math.floor(bytesRead / (8 * 1024 * 1024))}`;
      if (step === last && bytesRead !== files[index].size) return;
      last = step; self.postMessage({ type: 'progress', index, total: files.length, name: files[index].name, bytesRead, totalBytes: files[index].size });
    });
    self.postMessage({ type: 'validated', ...result, receipt: receipts.receipt, shareableReceipt: receipts.shareable });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
