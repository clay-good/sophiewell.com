# spec-v927 — Peak up, plateau flat

## Why

`airway resistance` and `peak plateau` were zero-hit across the 1707 tile names. The catalog had
driving pressure, compliance, mechanical power and the ventilatory ratio — everything about the
lung, and nothing about the tube.

## What it does

**Resistance = (peak inspiratory pressure − plateau pressure) / inspiratory flow in L/s**

Everything above the plateau is spent pushing gas through the tube and airways rather than
distending the lung. Up to about 10 cmH₂O/L/s is usual on a passive adult through an
endotracheal tube.

## The distinction it exists to make

| What moved | What it means |
| --- | --- |
| Peak rises, **plateau unchanged** | a **resistance** problem — secretions, a kinked or bitten tube, bronchospasm |
| **Plateau rises** | a **compliance** problem — edema, consolidation, pneumothorax, abdominal pressure, chest wall |

The peak on its own cannot tell those apart, and treating one as the other wastes time on the
wrong intervention. That line prints on every result, whatever the number comes to.

## The four conditions, all stated on every result

- **A real plateau.** From an end-inspiratory hold with no flow. A number read off the waveform
  without a hold is not a plateau. An *equal* peak and plateau returns 0 and says explicitly that
  this usually means no hold was performed, rather than reporting a resistance of zero as a
  finding.
- **Constant square-wave flow**, in volume control. Under pressure control or a decelerating
  pattern, the flow at end-inspiration is not the flow that produced the peak.
- **The tube is part of what is measured.** A smaller endotracheal tube raises the number with no
  airway disease at all, so the trend in one patient says more than the absolute.
- **A passive patient.** Any inspiratory effort changes the pressures the ventilator reads, and
  the arithmetic cannot see that it happened.

A plateau higher than the peak is **refused**, not computed — it cannot happen, and the message
says which number to check.

## Files

New: `lib/airway-resistance-v927.js`, `views/group-v927.js`,
`mcp/adapters/airway-resistance-v927.js`, `test/unit/airway-resistance.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Tobin's *Principles and Practice of Mechanical Ventilation* (3rd ed.) and Hess 2014 (*Respir
Care*), which carry the same formula, the same conditions and the same peak-versus-plateau
teaching. Neither issuer is in `ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1707 → 1708.
