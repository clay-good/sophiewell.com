// spec-v1604 tool 2: find negotiated rates in insurer in-network files, streamed in a Worker so a file
// of gigabytes never sits in the page. No network code: the page passes in the fee schedule rows it loaded.
import { runRateLookup } from './tic-rate-run.js';

self.addEventListener('message', async (event) => {
  try {
    const message = event.data || {};
    const files = [...(message.files || [])].filter((f) => f instanceof Blob);
    if (message.type !== 'lookup' || !files.length) throw new TypeError('Choose an insurer in-network rates file.');
    let last = '';
    const { result, csv, receipts } = await runRateLookup(files, message.input || {}, message.mpfs || null, (index, bytesRead) => {
      const step = `${index}:${Math.floor(bytesRead / (8 * 1024 * 1024))}`;
      if (step === last && bytesRead !== files[index].size) return;
      last = step; self.postMessage({ type: 'progress', index, total: files.length, name: files[index].name, bytesRead, totalBytes: files[index].size });
    }, message.opps || null);
    self.postMessage({ type: 'found', ...result, csv, receipt: receipts.receipt, shareableReceipt: receipts.shareable });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
