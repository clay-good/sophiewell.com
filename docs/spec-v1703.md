# spec-v1703 — The shared plot component

> Status: **SHIPPED (2026-11-07)**. Closes task 0.1 of
> [drug-interaction-kinetics](../openspec/changes/drug-interaction-kinetics/tasks.md) (which is now fully built) and
> of [biosignal-analysis](../openspec/changes/biosignal-analysis/tasks.md).

## What shipped

| Piece | What it does |
|---|---|
| `lib/plot.js` | Pure geometry: round ticks that enclose the data, a decade log axis, path data in a fixed 320 x 200 viewBox, and the text alternative |
| `plot()` in `lib/components.js` | A `<figure class="plot">`: the SVG (`role="img"`, `aria-label` naming what is plotted and its range), a caption with a key when there is more than one series, and the values in a `.lookup-table` inside `<details>` |
| `styles.css` "Plot" | Tokens only. Series 0 is the teal accent; 1 is dashed `--text-secondary`; 2 is dotted `--text-muted`, so no line is told apart by color alone |
| `docs/design.md` 4 and 7 | The component row and its gate row |

First users: `dose-history-level` (as given against on schedule), `enzyme-recovery-time` (percent of baseline over
time) and `emax-hill-effect` (effect against log concentration).

## Rules

- The plot renders in a sibling of `#q-results`, not inside it: the live region announces the answer, not a table of
  plotted values.
- A plot is never the only place a number appears: the table under it carries the plotted values, and every answer is
  complete without it.

## Proof

- `test/unit/plot-geometry.test.js`: ticks enclose the data (0 to 16.9 gives 0 to 20), decade ticks on a log axis,
  every path point inside the plotting box, the text alternative.
- `test/integration/plot-accessible.spec.js`: on each of the three tiles at 320px, one SVG with `role="img"` and a
  text alternative, none inside the live region, a value table of more than two rows, a rendered width between 200 and
  320px, and no sideways scroll.
