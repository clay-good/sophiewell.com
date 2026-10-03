// A dead link is believed only when it is dead twice.
//
// The 2026-10-01 monthly run (issue #19) reported three fda.gov pages dead with a
// 404 that every later fetch answered with a 200, and one payer PDF dead because
// a single request timed out. Each phantom costs a maintainer a search for a
// replacement that is not needed, and a report that cries wolf is a report
// nobody reads (spec-v1002). So every row the first pass calls dead is fetched
// once more, after the rest of the run, and the later answer is the one kept.
//
// secondLook(rows, isDead, reprobe) -> rows, in the original order. `reprobe(row)`
// returns the replacement row; rows the first pass did not call dead are kept.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function secondLook(rows, isDead, reprobe, { waitMs = 0 } = {}) {
  const dead = rows.filter(isDead);
  if (!dead.length) return rows;
  if (waitMs) await sleep(waitMs);
  const again = new Map();
  for (const row of dead) again.set(row, await reprobe(row));
  return rows.map((row) => again.get(row) || row);
}
