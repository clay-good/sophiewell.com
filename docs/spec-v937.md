# spec-v937 — A test that ran a build

## The failure

CI run 33341175164 on `a7ecfe53` failed the unit job. One test failed:

```
# build-hub-pages: dist/ does not exist. Run after the main build copies static assets.
not ok 612 - test/unit/hub-reachability.test.js
```

`test/unit/hub-reachability.test.js` (spec-v936) imports `HUBS` from
`scripts/build-hub-pages.mjs`. That file ended with a bare

```js
main().catch(...)
```

so **importing it ran a full hub build**. Locally that quietly succeeded, because a `dist/`
was sitting there from an earlier build. The CI unit job runs before anything is built, so
`main()` hit its own missing-`dist/` guard and exited 1, and the test that imported it failed.

The test was right about the catalog; it was wrong about what an import costs.

## The fix

The guard the `check-*.mjs` gates already use — run `main()` only when this file is the
entry point:

```js
if (process.argv[1] && process.argv[1].endsWith('build-hub-pages.mjs')) {
  main().catch((err) => { console.error('build-hub-pages: failed', err); process.exit(1); });
}
```

`scripts/build.mjs` spawns the script as `node <root>/scripts/build-hub-pages.mjs`, so the
build is unaffected: it still writes six hub pages.

## Proof

| Check | Result |
| --- | --- |
| The missing-`dist/` message is inside `main()` (line 332; `main()` opens at 330) | so the guard removes the failure mode by construction |
| `import('./scripts/build-hub-pages.mjs')` under a different `argv[1]` | prints nothing, exports `HUBS` |
| `node scripts/build-hub-pages.mjs` | `wrote 6 audience hub pages under dist/for/` |
| `node --test test/unit/hub-reachability.test.js` | 1 pass, 0 fail |

## The lesson

A local pass is not a CI pass when the difference between the two machines is *build output
lying around*. A unit test may read what the build reads; it may not **be** the build. Any
`scripts/*.mjs` a test imports for its exports needs the entry-point guard.
