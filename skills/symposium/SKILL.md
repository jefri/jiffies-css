---
name: symposium
description: Use when a work product needs review from several distinct expert perspectives at once — independent reviewers run in parallel, then their findings collide — rather than one reviewer with one set of blind spots. Jeopardy! search applied to general:review. The reviewer cast lives in references/characters.md.
---

# Symposium Review

> "Each of you in turn must make a speech in praise... and when the first has
> spoken, the one on his right shall follow, and so on round."
> — after Plato, *Symposium* 177d

## Overview

Jeopardy! search (see `research:using-research`) is an anti-monoculture move for
*searching*: before issuing a query, generate 3–5 variant phrasings, because any
single phrasing carries the blind spots of the words you happened to choose.
Running the variants in parallel surfaces what one query would have missed.

A **Symposium review** applies the same move to *reviewing* (see
`general:review`). A single reviewer carries the blind spots of one expertise,
one temperament, one set of priors. The fix is the same: run several distinct
perspectives in parallel, then let them collide. Where Jeopardy! diversifies the
query, the Symposium diversifies the reviewer.

The cast is a panel of standing reviewers, deliberately complementary and
non-overlapping, with at least one adversary whose charter is to attack the
premise rather than be fair to it. Productive disagreement is the point. A review
where all voices agree has told you less than one where two are still arguing.

**The reviewer cast for this project lives in `references/`** — one file per voice,
indexed by the manifest `references/characters.md`, with shared context in
`references/project-under-review.md` and `references/tensions.md`.

## The Three-Phase Protocol

Each voice runs the same three phases. The voices are independent through phases
1 and 2 and only meet in 3 — independence is what makes the later collision
informative.

| Phase | Skill | What happens |
|-------|-------|--------------|
| 1. Build background | `research:*` | Each reviewer dispatches the research skills named in its profile to build its own grounding, using Jeopardy! search on its own query variants. Reviewers do **not** read each other's notes yet. Each writes findings to its own notes file. |
| 2. Independent review | `general:review` | Each reviewer reviews the task through its own lens, biases, and characteristic questions, grounded only in its Phase 1 research. Output: a standalone review — findings, severity, verdict — in that reviewer's voice. No reviewer has seen any other's review. |
| 3. Discussion | the symposium proper | The reviews are put on the table together. The voices respond to each other: where they agree, where they clash, what one caught that another missed, which disagreements are real (a genuine trade-off) versus apparent (a misunderstanding one side can resolve). |

A reviewer is instantiated as a subagent per phase. Give it this file, the shared
context (`references/project-under-review.md` and `references/tensions.md`), and
**only its own profile** from `references/` — never another voice's profile. A
reviewer that has read the rest of the panel anticipates their critiques and
converges toward them, which is the monoculture the Symposium exists to break;
staying blind to the others until Phase 3 is what keeps each review independent.
The tension map names where a voice sits relative to the panel — it does not leak
the others' actual reviews, which stay unseen until Phase 3. See
`references/characters.md` for the roster and `general:dispatching-parallel-agents`
for the fan-out in phases 1 and 2.

## Convening the Symposium

1. Consult the manifest `references/characters.md` for the roster. Give each voice
   this file, the shared context (`references/project-under-review.md`,
   `references/tensions.md`), **its own profile only**, and the task under review.
   Never hand a voice another voice's profile.
2. Run **Phase 1** (`research:*`) for all voices in parallel; each writes its own
   notes.
3. Run **Phase 2** (`general:review`) for all voices independently; each writes
   its own review through its lens.
4. Run **Phase 3**: put the reviews on the table, work the Tension Map in
   `references/tensions.md`, and synthesize consensus + live disagreements + the
   decisions the disagreements force.
5. The output of a Symposium is **not a single verdict**. It is a complete review and set of recommendatiosn for the topic they are reviewing. The output replaces the simple rubric of the general:review skill.

## Adapting the Cast

The cast in `references/` is written for this project: its voices reference the
specific claims under review. When applying the Symposium to a different work
product, revise the roster, not the protocol:

- Keep the shape — complementary, non-overlapping, at least one adversary by
  charter, one voice per file, indexed by `references/characters.md`.
- Replace `references/project-under-review.md` with the new target's load-bearing
  claims, and re-aim each lens at them.
- Rebuild `references/tensions.md` to predict where *these* voices will clash, so
  Phase 3 has somewhere to start.
