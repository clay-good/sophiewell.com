// scripts/data/builders/index.mjs -- the live dataset builders run.mjs runs,
// in the spec-v1621 §3 order. Each exports:
//   { id, label, agency, sourceUrl, cadence, recordBounds, shardKey,
//     discover(http) -> { url, parts?, edition, effectiveFrom?, expiresOn, nextExpected? },
//     parse(bytes, found) -> { records, ancillary? },
//     stableCanaries?, canaries?: { [edition]: [...] } | null, shape? }
// A dataset with a live builder here must not also be written by
// scripts/build-data.mjs.

import mpfs from './mpfs.mjs';
import drg from './drg.mjs';
import mue from './mue.mjs';
import nadac from './nadac.mjs';

export const BUILDERS = [mpfs, drg, mue, nadac];
