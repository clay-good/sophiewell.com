<p align="center">
  <img src="logo.png" alt="Sophie Well logo" width="120" height="120">
</p>

<h1 align="center">sophiewell.com</h1>

<p align="center">
  <strong>1616 free healthcare calculators that run entirely in your browser.</strong><br>
  No accounts, no ads, no telemetry, no AI.
</p>

<p align="center">
  <a href="https://sophiewell.com">Live site</a> ·
  <a href="https://sophiewell.com/commitments/">Commitments</a>
</p>

<!--
  Machine-checked count (scripts/check-catalog-truth.mjs reads the line
  below; keep it in sync with UTILITIES.length in app.js):
  At v292 close the catalog is 1616
  deterministic tiles.
-->

## What it is

Clinical calculators, scores, drips, and dosing math for the nurse on
shift, and for the doctors, pharmacists, respiratory therapists, EMS
providers, billers, and coders working alongside.

Each calculator does one thing:

| | |
|---|---|
| **In** | The values you already have. It opens pre-filled with a worked example, so you can see the expected format before you type over it. |
| **Out** | One number or grade, plus how the source says to read it. |
| **Proof** | The method and primary citations together, one click away under "How this is calculated". |

For example, on [Wells Score for PE](https://sophiewell.com/#wells-pe)
you tick the criteria that apply and get
`Wells PE total 4.5 (PE-likely group, moderate probability)`.

Calculations run locally and keep working offline. Nothing leaves your device
unless you deliberately choose **Report a problem**; that action sends the
canonical tool URL and an optional short note to a private maintenance queue.
Current bounded inputs and results are included only when you select the
unchecked context option. No report URL contains query parameters or URL state.
Sensitive tools never attach form entries or generated text. There are
no accounts or
background telemetry.

## Use it

Go to [sophiewell.com](https://sophiewell.com) and type what you need.

To run your own copy: clone this repository, run `npm run dev`, open
http://localhost:4173.

## For AI agents (MCP)

The same calculators are available to agents through a local
[Model Context Protocol](https://modelcontextprotocol.io) server, so an
agent gets the right number plus a citation instead of guessing. It runs
on your machine over stdio: no hosting, no network, no telemetry.
Setup is in [mcp/README.md](mcp/README.md).

## More

- [CHANGELOG.md](CHANGELOG.md): what's new
- [mcp/README.md](mcp/README.md): use the calculators from an MCP client
- [docs/architecture.md](docs/architecture.md): how it's built
- [docs/product-decisions.md](docs/product-decisions.md): durable interface decisions

## License

[MIT](LICENSE)
