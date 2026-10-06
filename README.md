<p align="center">
  <img src="logo.png" alt="Sophie Well logo" width="120" height="120">
</p>

<h1 align="center">sophiewell.com</h1>

<p align="center">
  <strong>2050 free healthcare calculators that run entirely in your browser.</strong><br>
  No accounts, no ads, no telemetry, no AI.
</p>

<p align="center">
  <a href="https://sophiewell.com">Live site</a> ·
  <a href="https://sophiewell.com/commitments/">Commitments</a>
</p>

<!--
  Machine-checked count (scripts/check-catalog-truth.mjs reads the line
  below; keep it in sync with UTILITIES.length in app.js):
  At v1563 close the catalog is 2050
  deterministic tiles.
-->

## What it is

Clinical calculators, scores, drips, and dosing math for the nurse on
shift, and for the doctors, pharmacists, respiratory therapists, EMS
providers, billers, and coders working alongside. The catalog also carries
the measurement and process tools the same shift runs on: reference change
values and method agreement for the laboratory, and handoff structures,
checklist phases and event-review frameworks for quality and safety.

Each calculator does one thing:

| | |
|---|---|
| **In** | The values you already have. It opens pre-filled with a worked example — a described patient, not a form of zeros — so you can see the expected format before you type over it. |
| **Out** | One number or grade, plus how the source says to read it. |
| **Or not** | When a value it needs is missing, it says which one instead of answering. A score that only adds points will still flag risk on what you have entered, but it will not call a patient well on measurements nobody took — and it will not raise an alarm from an empty form either. When it does answer on a partly filled form, it says how much of the form it used. |
| **Proof** | The method and primary citations together, one click away under "How this is calculated". 1,972 of the 2,050 link straight through to the source paper, and every one of those links is checked to resolve **and** to open the paper the citation names, not merely a paper. Twelve more say "Search PubMed for this source" because no index carries the book chapter or pre-1946 paper they cite. |

For example, on [Wells Score for PE](https://sophiewell.com/#wells-pe)
you tick the criteria that apply and get
`Wells PE total: 4.5 (Moderate probability)`.

Calculations run locally, and after one visit every tool keeps working offline. Nothing leaves your device
unless you deliberately choose **Report a problem**; that action sends the
canonical tool URL and an optional short note to a private maintenance queue.
Current bounded inputs and results are included only when you select the
unchecked context option. No report URL contains query parameters or URL state.
Sensitive tools never attach form entries or generated text. There are
no accounts or
background telemetry.

## Use it

Go to [sophiewell.com](https://sophiewell.com) and type what you need.

Or bring a file: drop a remittance (835), claim (837), eligibility (271) or
claim-status (277) file, a hospital or insurer price file, the claims file your health plan gives you, a prior-authorization packet,
or a CSV of fills, patients or claims on the home page, and the tool that
reads it opens with the file already in it. Several files, a folder or a zip
open a list of what each file is and which tool reads it. A health record
downloaded from a patient portal (C-CDA or FHIR) or an Apple Health export
shows which calculators it can fill -- kidney, liver, cholesterol and heart
risk -- with the values it used and their dates. Files are read in your
browser and never uploaded, and their values never go into a link.

To run your own copy: clone this repository, run `npm run dev`, open
http://localhost:4173.

## For AI agents (MCP)

The same calculators are available to agents through a local
[Model Context Protocol](https://modelcontextprotocol.io) server, so an
agent gets the right number plus a citation instead of guessing. It runs
on your machine over stdio: no hosting, no network, no telemetry.
Setup is in [mcp/README.md](mcp/README.md).

## More

The medication-access upload workbench is in development. All four adherence
tools can load CSV or TSV fill histories locally, with an explicit column-mapping
step, a row-level preview, and full or patient-redacted CSV downloads. Generic
batch execution has started with the patient-definition check; other calculators are
still planned. The prescription matcher accepts four local files and returns its
audit trail with full or redacted downloads. The 835 reader validates remittance
envelopes and balance arithmetic, then exports a claim table locally. Denial-pattern
and contract-underpayment reports run on those same local remittances. The appeal
worklist accepts mapped CSV/TSV claims or 835 files, asks the reader to identify each
payer's rule set, and exports full or patient-redacted deadline lists. The 837 checker
validates professional and institutional claim structure, identifiers, dates and charge
totals before submission. The 271 reader turns a local file or pasted eligibility
response into a plain coverage and benefit summary with raw codes beside each label.
The 277 reader lists rejected claim acknowledgments first and keeps every raw status
code available for verification. The hospital price transparency checker streams CMS
v3.0.0 CSV or JSON files and reports structural deficiencies by row or JSON path. See
[the implementation status](docs/spec-v1501.md#build-status).

- [CHANGELOG.md](CHANGELOG.md): what's new
- [mcp/README.md](mcp/README.md): use the calculators from an MCP client
- [docs/architecture.md](docs/architecture.md): how it's built
- [docs/product-decisions.md](docs/product-decisions.md): durable interface decisions
- [docs/incomplete-input-program.md](docs/incomplete-input-program.md): what a tool does with a value it was not given
- [CONTRIBUTING.md](CONTRIBUTING.md): what changes are accepted, and how to add a calculator
- [SECURITY.md](SECURITY.md): report a vulnerability privately, not as an issue

If a calculator disagrees with the source it cites, that is the highest-priority
report the project takes:
[open a wrong-number issue](https://github.com/clay-good/sophiewell.com/issues/new?template=wrong-number.yml).

## License

[MIT](LICENSE)
