// spec-v1515: stream CMS hospital-price files locally without buffering the whole file.
import { runHpt } from './hpt-run.js';

let lastProgress = 0;

self.addEventListener('message', async (event) => {
  try {
    const message = event.data || {};
    if (message.type !== 'validate' || !(message.file instanceof Blob)) throw new TypeError('Choose a CSV or JSON hospital price file.');
    const file = message.file; lastProgress = 0;
    const { result, receipts } = await runHpt(file, file.name, (bytesRead) => {
      if (bytesRead - lastProgress < 8 * 1024 * 1024 && bytesRead !== file.size) return;
      lastProgress = bytesRead; self.postMessage({ type: 'progress', bytesRead, totalBytes: file.size });
    });
    // spec-v1625: the findings are the hashed result; see lib/hpt-run.js.
    self.postMessage({ type: 'validated', fileName: file.name, fileSize: file.size, ...result, receipt: receipts.receipt, shareableReceipt: receipts.shareable });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
