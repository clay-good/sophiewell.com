// spec-v1515: stream CMS hospital-price files locally without buffering the whole file.
import { validateHptFile } from './hpt-stream-v1515.js';
import { sha256Blob } from './sha256.js';
import { recognize, LIMITS } from './file-kinds.js';
import { receiptFor } from './receipt-worker.js';

let lastProgress = 0;

self.addEventListener('message', async (event) => {
  try {
    const message = event.data || {};
    if (message.type !== 'validate' || !(message.file instanceof Blob)) throw new TypeError('Choose a CSV or JSON hospital price file.');
    const file = message.file; lastProgress = 0;
    const result = await validateHptFile(file, (bytesRead) => {
      if (bytesRead - lastProgress < 8 * 1024 * 1024 && bytesRead !== file.size) return;
      lastProgress = bytesRead; self.postMessage({ type: 'progress', bytesRead, totalBytes: file.size });
    });
    // spec-v1625: the file is hashed in a second streamed pass (a price file
    // can be gigabytes; nothing is held whole), and the findings are the result.
    const head = new Uint8Array(await file.slice(0, LIMITS.headBytes).arrayBuffer());
    const kind = recognize(head, { name: file.name });
    const facts = [{ name: file.name, size: file.size, sha256: await sha256Blob(file), kind: kind.kind, evidence: kind.evidence }];
    const { receipt, shareable } = receiptFor('hpt-file-check', facts, result);
    self.postMessage({ type: 'validated', fileName: file.name, fileSize: file.size, ...result, receipt, shareableReceipt: shareable });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
