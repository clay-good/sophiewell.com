<p align="center">
  <img src="logo.png" alt="Sophie Well logo" width="120" height="120">
</p>

<h1 align="center">sophiewell.com</h1>

<p align="center">
  <strong>1564 free healthcare calculators that run entirely in your browser.</strong><br>
  No servers, no accounts, no ads, no telemetry, no AI.
</p>

<p align="center">
  <a href="https://sophiewell.com">Live site</a> ·
  <a href="https://sophiewell.com/commitments/">Commitments</a>
</p>

<!--
  Machine-checked count (scripts/check-catalog-truth.mjs reads the line
  below; keep it in sync with UTILITIES.length in app.js):
  At v292 close the catalog is 1564
  deterministic tiles.
-->

## What it is

Clinical calculators, scores, drips, and dosing math for the nurse on
shift, and for the doctors, pharmacists, respiratory therapists, EMS
providers, billers, and coders working alongside.

Each calculator does one thing:

| | |
|---|---|
| **In** | The values you already have. Every field opens pre-filled with a worked example, so you can see the expected format before you type. |
| **Out** | One number or grade, plus how the source says to read it. |
| **Proof** | The primary citation, one click away under "Citation and how to read this." |

For example, on [Wells Score for PE](https://sophiewell.com/#wells-pe)
you tick the criteria that apply and get
`Wells PE total 4.5 (PE-likely group, moderate probability)`.

Nothing you type leaves your device. After the page loads there are no
network calls, no accounts, and it keeps working offline.

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

## License

[MIT](LICENSE)
