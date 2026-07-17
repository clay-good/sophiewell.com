# spec-v392.md — Hill classification (GE flap valve) tile

> Status: **SHIPPED (2026-07-17).** Builds the `hill-flap-valve` tile — the Hill classification of the
> gastroesophageal flap valve (grades I-IV). Catalog **1243 → 1244**, group G.

## Why

The catalog carries the GI-endoscopy reflux tiles (Los Angeles esophagitis, Prague C&M) but not the Hill
classification — the only endoscopic grading of the gastroesophageal flap valve / esophagogastric-junction
competence, which correlates with hiatal hernia and GERD. `hill grade` / `gastroesophageal flap valve`
routed to nothing. Found on a fresh GI-endoscopy morphology sweep.

## What it does

The endoscopist picks the grade (from a retroflexed view of the cardia); the tile reports the grade, its
ridge/valve description, and whether it is an abnormal (grade III-IV) flap valve.

- `lib/hill-flap-valve-v392.js` — pure grade → description. **I:** a prominent ridge closely approximated
  to the scope (normal). **II:** a less pronounced ridge that may open with respiration. **III:** a
  diminished ridge that fails to close around the scope — flagged. **IV:** no ridge, the junction stays
  open — flagged. Grades III-IV carry the hiatal-hernia association. Accepts I/II/III/IV or 1-4.
- `views/group-v392.js` (RV392) — one select (dom `hill-grade`), real `<label for>`.
- `lib/meta.js` — Hill 1996 (Gastrointest Endosc) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v113 → v114); corpus → 1244.

**HIGH-STAKES:** it reports the Hill grade the endoscopist has determined on retroflexion, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Grades III-IV are the
classically abnormal (flap-valve-incompetent) grades, but the management decision stays with the treating
team.

## Sourcing (spec-v97)

- **Citation:** Hill LD, Kozarek RA, Kraemer SJ, et al. The gastroesophageal flap valve: in vitro and in
  vivo observations. *Gastrointest Endosc.* 1996;44(5):541-547 (the I-IV grading on retroflexion).
- Cross-verified against GI-endoscopy references reproducing the same ridge / approximation grading and
  the hiatal-hernia association (I-II without hernia, III-IV with hernia).

## Verification

Lint (all catalog-truth surfaces at 1244), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade III renders the flagged "diminished ridge / fails to close" description, grade I flips to
the normal "prominent ridge", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the endoscopist selects; it does not read the endoscopy video, measure a hiatal
hernia, or recommend treatment. The MCP adapter + golden-probe promotion follow in a separate wave.
