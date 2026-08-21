# spec-v768 — answer_query says what it returns

## What was wrong

`answer_query` returns `via`, `unstated`, `unstatedNote`, `missing`, `candidates`
and `message`, and its `outputSchema` declared none of them. An agent reading the
schema could not discover `unstated` — the field whose entire job is to warn that
a score was computed without something the calculator asks for. A score that is
incomplete and a score that is complete came back looking identical to anything
that trusted the declared shape.

Five of the six were introduced with the fields themselves (spec-v758, v762);
`message` on the BAD_ARGS path predates both.

## What it does now

Every key the tool can return is declared, each with a description written for
the agent that has to act on it — what the value means, and what to do about it.

## Proof

`test/mcp/mcp-output-contract.test.js` computes the union of keys every
`answer_query` path actually returns and asserts each one is declared. It found
`message` on its first run, which is how a gate should earn its place.

402 MCP tests pass.
