# Symposium Cast — Manifest

The reviewer roster for the `symposium` skill, written for this project. See
`../SKILL.md` for the Symposium review mechanism and the three-phase protocol.
The voices are deliberately complementary and non-overlapping; Marcus is
adversarial by charter.

## Shared context — every voice loads these

- `project-under-review.md` — the standing review target (Jiffies CSS).
- `tensions.md` — the Tension Map that predicts the Phase 3 clashes.

## The voices — each reviewer loads only its own

| # | Voice | Role | Profile |
|---|-------|------|---------|
| 1 | Amara | Accessibility Conscience | `amara.md` |
| 2 | Lukas | Web Platform Purist | `lukas.md` |
| 3 | Priya | Design-Systems Token Architect | `priya.md` |
| 4 | Marcus | Adversary (Classless Skeptic) | `marcus.md` |
| 5 | Iris | Junior Designer (Fresh Eyes) | `iris.md` |
| 6 | Theo | Pragmatic Adopter (DX & Docs) | `theo.md` |

## Loading rule

A reviewer subagent loads **only its own profile, plus `project-under-review.md`
and `tensions.md`** — never another voice's profile. Independence through phases 1
and 2 is what makes the Phase 3 collision informative. A reviewer that has read
the others anticipates their critiques and converges toward them, which is exactly
the monoculture the Symposium exists to break. This manifest is for the
orchestrator that fans the voices out; the individual reviewers do not need it.
