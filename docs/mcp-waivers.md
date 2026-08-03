# MCP waiver ledger (spec-v632)

The honest record of catalog tiles that are **not** exposed as MCP tools, each with
a reason. Together with the exposed set in `docs/mcp-coverage.md`, this accounts
for **every** catalog tile: `scripts/check-mcp-catalog.mjs` asserts that
`exposed ∪ waived == all UTILITIES tiles`, with no tile in both and no tile in
neither. So a new computational tile cannot silently ship without an MCP adapter -
it must be exposed or given a waiver line here.

Reasons are a fixed vocabulary:

- `template-generator` - output is boilerplate text (a letter, checklist, form, or
  question list) an LLM already writes natively; determinism adds nothing.
- `bespoke-shape` - inputs do not fit the flat typed-field contract (variable-length
  row lists, HTML-checkbox `on` values); needs custom handling before exposure.
- `redundant` - the capability is already exposed by a dedicated MCP tool.
- `wrong-input-modality` - input is an uploaded binary document, not typed fields.
- `pending-adapter` - a normal calculator with a pure lib compute that simply has
  no adapter yet (tracked for a future wave, e.g. spec-v628).
- `time-dependent` - a workflow timer whose value is a live clock reading; exposing
  it deterministically needs an explicit as-of time input (spec-v628).
- `outputs-recommendation` - a decision tree whose terminal output is a
  prophylaxis / management recommendation, not a computed quantity (posture).
- `static-reference` - a fixed reference table with no inputs and nothing to compute.

## Waived

- `mppr` - bespoke-shape
- `modifier-x-selector` - bespoke-shape
- `appeal-letter` - template-generator
- `hipaa-roa` - template-generator
- `hipaa-auth` - template-generator
- `roi` - template-generator
- `discharge-instr` - template-generator
- `wallet-card` - template-generator
- `sbar-template` - template-generator
- `prep` - template-generator
- `prior-auth` - template-generator
- `specialty-visit` - template-generator
- `ems-doc` - template-generator
- `unit-converter-v4` - redundant
- `pa-lint` - wrong-input-modality
- `ews-escalation` - time-dependent
- `sepsis-bundle-clock` - time-dependent
- `code-blue-clock` - time-dependent
- `device-day-counter` - time-dependent
- `tetanus` - outputs-recommendation
- `rabies-pep` - outputs-recommendation
- `bbp-exposure` - outputs-recommendation
- `co-cn-antidote` - static-reference
- `sti-screening` - static-reference
