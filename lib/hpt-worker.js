// spec-v1515: stream CMS hospital-price files locally without buffering the whole file.
import { validateHptFile } from './hpt-stream-v1515.js';

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
    self.postMessage({ type: 'validated', fileName: file.name, fileSize: file.size, ...result });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
