// spec-v1623 step 1: the first bytes of a file, which is all recognition
// reads. Blob.slice means a 20 GB price file costs the same as a 2 KB one.

export const HEAD_BYTES = 262144;

// readHead(file, bytes) -> Uint8Array of at most `bytes` from the start.
export async function readHead(file, bytes = HEAD_BYTES) {
  return new Uint8Array(await file.slice(0, bytes).arrayBuffer());
}
