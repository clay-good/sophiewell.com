// spec-v1625: which build a receipt came from. This checked-in copy says
// 'dev'; scripts/build.mjs writes the deployed copy into dist/ only, with the
// commit (WORKERS_CI_COMMIT_SHA on Cloudflare Workers Builds, else git), so a
// build never rewrites a file in the repository.
export const BUILD = { commit: 'dev' };
