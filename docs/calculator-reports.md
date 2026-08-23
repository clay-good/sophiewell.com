# Tool report operations

This runbook launches and maintains the anonymous **Report a problem** path.
The public site has no report-reading endpoint. Review uses authenticated
Cloudflare D1 access.

The existing `sophiewell` Pages project continues to serve static files. A
separate `sophiewell-reports` Worker is routed only to
`sophiewell.com/api/reports*`, so normal calculator and asset requests never
invoke it. Public `workers.dev` and version-preview URLs stay disabled so they
cannot bypass the zone WAF.

## Launch checklist

Do not call the feature live until every item is complete. Missing
configuration fails closed and leaves every tool operational.

### 1. Create and bind D1

The production database is `sophiewell-reports` in the US jurisdiction. For a
new environment, create its database from the repository root:

```sh
npx wrangler d1 create sophiewell-reports
```

Record the returned public database UUID in `wrangler.reports.jsonc`, then apply
the checked-in schema:

```sh
npx wrangler d1 migrations apply sophiewell-reports --remote --config wrangler.reports.jsonc
```

The binding name must remain `REPORTS_DB`; a missing binding makes reporting
unavailable without affecting calculations.

### 2. Create Turnstile

In Cloudflare, create a Managed Turnstile widget named `Sophie Well tool
reports`. Allow only `sophiewell.com` and any real production alias that serves
the app. Do not allow unrestricted hostnames, and disable visitor feedback so
failed widgets do not invite visitors to send separate feedback to Cloudflare.

Record the public sitekey in `wrangler.reports.jsonc`. Never put either secret
below in Git:

```sh
npx wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.reports.jsonc
npx wrangler secret put REPORT_HASH_SECRET --config wrangler.reports.jsonc
```

Paste the Turnstile secret into the first prompt. Paste a cryptographically
random value of at least 32 characters into the second. `.env`, `.dev.vars`,
private keys, and Wrangler local state are ignored by Git.

### 3. Add the pre-Worker rate limit

In the `sophiewell.com` zone, create a WAF rate-limiting rule with the strictest
settings the current plan supports:

- Expression: hostname is `sophiewell.com` and request path is exactly
  `/api/reports` or `/api/reports/config`.
- Counting characteristic: source IP.
- Threshold: 20 requests per 10 seconds per IP. This leaves room for a shared
  hospital egress address while stopping concentrated floods.
- Action: block.
- Mitigation duration: 10 seconds, the Free-plan option at this threshold.

Cover both the configuration GET and report POST. This rejects floods before
they invoke the Worker. Turnstile, the 5/day anonymous reporter limit, the
200/day accepted-report ceiling, D1 limits, and Workers request limits remain
independent backstops.

### 4. Deploy and prove the path

Build once, deploy the API Worker, and let the normal Pages deployment publish
the same commit:

```sh
npm run build
npx wrangler deploy --config wrangler.reports.jsonc
```

Then verify:

1. Open a calculator and confirm **Report a problem** appears beside its name.
2. Send an empty-note report and confirm the success message.
3. Send the exact context again and confirm only one D1 row exists.
4. Send a short expectation note and confirm it is saved with the URL, inputs,
   and results.
5. Confirm an invalid Turnstile token returns a bad-request response and writes
   no row.
6. Confirm sensitive tools such as SBAR and MBI submit no inputs, outputs,
   query parameters, or URL state.
7. Confirm ordinary calculation, offline use, print, and MCP execution are
   unchanged.

## Weekly review

List open reports, oldest first and naturally grouped by tool:

```sh
npx wrangler d1 execute sophiewell-reports --remote --config wrangler.reports.jsonc --command "SELECT id, created_at, calculator_id, note, page_url, inputs_json, outputs_json, output_text, output_truncated FROM calculator_reports WHERE status = 'open' ORDER BY calculator_id, created_at;"
```

For each report:

1. Open `page_url` and reproduce the submitted state.
2. Compare saved inputs and results with the current tool.
3. Verify the formula or rule against its primary source.
4. Add a regression test before correcting confirmed behavior.
5. Resolve the report with an audit note:

```sh
npx wrangler d1 execute sophiewell-reports --remote --config wrangler.reports.jsonc --command "UPDATE calculator_reports SET status = 'resolved', resolved_at = datetime('now'), resolution_note = 'Fixed in commit COMMIT; regression test added.' WHERE id = 'REPORT_ID';"
```

Use `wont_fix` only when the saved behavior is correct or outside the tool's
stated scope, and record the reason in `resolution_note`. Remove counters older
than 14 days, resolved reports older than 90 days, and open reports older than
180 days after review:

```sh
npx wrangler d1 execute sophiewell-reports --remote --config wrangler.reports.jsonc --command "DELETE FROM report_limits WHERE bucket < date('now', '-14 days');"
npx wrangler d1 execute sophiewell-reports --remote --config wrangler.reports.jsonc --command "DELETE FROM calculator_reports WHERE (status IN ('resolved', 'wont_fix') AND created_at < datetime('now', '-90 days')) OR created_at < datetime('now', '-180 days');"
```

Cloudflare D1 Time Travel may retain deleted data beyond the application row's
lifetime according to the account plan. Before risky manual changes, record a
Time Travel bookmark so the queue can be restored without keeping exports.

Prioritize plausible formula, dose, unit, or threshold errors, especially when
multiple independent reports identify the same tool.

## Data and cost boundaries

- Pages serves normal traffic without invoking the API Worker.
- Turnstile loads only after the report dialog opens.
- At most 200 reports are accepted per UTC day.
- Accepted traffic writes at most one report and two counter rows.
- Duplicate and over-quota submissions add no rows.
- Raw IP addresses, user agents, identity, email, and Turnstile tokens are not
  stored by the application in D1.
- Sensitive tools and patient-document generators attach no form fields,
  generated output, query parameters, or URL state. Other
  tools skip password, contact, payment, identity, one-time-code, and file
  controls.
- The optional note is limited to 160 characters; the dialog tells users not
  to include patient identifiers.
- Bodies are capped at 24 KB, encoded bodies are rejected, and stored text
  cannot contain terminal-control or bidirectional-override characters.
- The API Worker has no public `workers.dev`, preview, or static-asset surface.

## Kill switch

Deleting `TURNSTILE_SECRET_KEY`, removing `TURNSTILE_SITE_KEY`, or disabling
the Turnstile widget makes reporting fail closed. The user sees a temporary
unavailability message, existing reports remain intact, and every tool
continues to work normally.
