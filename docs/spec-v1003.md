# spec-v1003 — A sentence was being rendered as a link

## The finding

`app.js` turns a dataset's `Source: <label>` line into a link whenever the manifest carries a
`sourceUrl`:

```js
if (m && m.sourceUrl) {
  stamp.appendChild(el('a', { class: 'source-link', href: m.sourceUrl, ... }));
}
```

The comment above it said the field is *"the agency's canonical page, verified by the data
pipeline"*. Nothing verified it. **Eleven manifests carried a sentence there**, and the renderer
made each one an `href`:

| manifest | value |
| --- | --- |
| `abx-renal`, `prehospital-meds`, `vasopressor-doses`, `iv-to-po` | `"FDA labels via DailyMed"`, `"FDA DailyMed labeling"`, `"FDA labels (subset)"`, `"FDA labels"` |
| `steroid-equiv` | `"standard pharmacology references; original by project author"` |
| `tpn-rules` | `"standard nutrition references"` |
| `cpt-summaries`, `eob-glossary` | `"project-author-original-content"` |
| `crosswalks` | `"CMS publications and X12 external code lists"` |
| `clinical` | `"published clinical literature (citations only; computations live in app.js)"` |
| `aha-reference`, `environmental`, `toxidromes` | guideline names in prose |
| `mci-triage` | a real URL **with a note appended** — `https://www.start-triage.com/ ; JumpSTART (CHOC Children's)` |

A relative `href` resolves against the page, so a reader on `abx-renal` who clicked "Source: FDA
labels via DailyMed" opened `sophiewell.com/FDA%20labels%20via%20DailyMed` in a new tab.
`mci-triage` is worse in one way — it *parses* as a URL, so it opened
`start-triage.com/%20;%20JumpSTART%20(CHOC%20Children's)`, a 404 on a real domain.

**Seven live tiles** were affected: `abx-renal`, `naloxone`, `peds-weight-dose`, `steroid-equiv`,
`tpn-macro`, `vasopressor`, and the MCI triage tile. The pre-rendered `/tools/<id>/` pages were
never affected — they print the label as plain text and have no link — so this was a browser-app
bug only, which is why no page-copy gate saw it.

## The fix, in both halves

**The renderer refuses to link a non-URL.** `isHttpUrl()` requires an absolute `http:`/`https:`
URL with no whitespace; anything else falls to the existing `else` branch and renders the label as
plain text, which is the right answer when there is no page to point at. It also stops
`javascript:` and `data:` ever reaching an `href` from a data file.

**The data stops carrying non-URLs.** Where a canonical page exists it is now named — DailyMed for
the four FDA-label sets, `start-triage.com` alone for `mci-triage`, the AHA ECC guidelines page,
the WMS clinical practice guidelines index, ATSDR. Where none exists, the field is `null`, which
renders plain text honestly.

**`scripts/check-source-urls.mjs`** joins `npm run lint`: `sourceUrl` must be absent, `null`, or an
absolute http(s) URL with no whitespace. Offline and deterministic, so it belongs in the chain;
whether the page is still *there* stays a network question for the two link checkers.

## Proof

`check-source-urls` clean over 47 manifests, 40 of them linkable. Eight unit tests pin the
detector, including both shapes that actually shipped — prose, and a URL with a note appended —
plus `javascript:`. Full lint chain and 13,074 unit tests pass, and the fourteen manifest edits
change one `sourceUrl` line each and nothing else (`npm run data:verify` clean).
