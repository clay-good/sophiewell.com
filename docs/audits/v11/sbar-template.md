# v11 audit - SBAR Handoff Template (`sbar-template`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Institute for Healthcare Improvement (IHI) SBAR communication toolkit — "Situation, Background, Assessment, Recommendation" four-section structured handoff. IHI continues to publish the same four-letter structure as of audit date; no schema drift.

## Boundary examples added
- META example: S "Mrs. Chen in 412B, post-op day 1, complaining of chest pressure.", B "68F, CABG yesterday, hx HTN/DM, on aspirin/atorvastatin.", A "Vitals stable but new ST changes on telemetry; concerned for ischemia.", R "Request bedside evaluation, repeat ECG, troponin." -> renderer renders a `<pre>` block with four labelled sections in IHI order.
- Empty inputs: blank section bodies render as `(blank)`, preserving the four-section structure so a partial handoff still passes the IHI shape check.
- Copy-to-clipboard path: button writes the same `<pre>` text via `navigator.clipboard.writeText`; failure surfaces "Copy failed" label without throwing.

## Cross-implementation differential
- N/A (template). The differential is "does the rendered output preserve the IHI four-section labelled order?" — confirmed by hand-reading `views/group-v5.js sbar-template`.

## Edge-input handling notes
- Whitespace in textarea inputs is preserved as-is; the renderer does not trim or reformat user prose (intentional — SBAR is verbatim handoff).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Four labelled textareas (S, B, A, R); copy button is keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
