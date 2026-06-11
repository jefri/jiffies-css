# Refactor plan — design_system.md coherence pass

Post-green review of the completed spec against design.md Metrics §2–§4. Suite
green (33 tests). No CSS touched; anchors unchanged.

- [x] **Magic Constant / wrong value** `design_system.md` §2.2 (~line 111): h1/h6
  sizes are wrong. `pow(1.25, 7−n)` gives h1 = 1.25^6 ≈ 3.81rem (≈61px), h6 =
  1.25^1 = 1.25rem (≈20px), per DR-3's ladder. Fix the stated values.
- [x] **Comment that obscures / mis-citation** §2.2 grounding line: attributes
  "Open Props" to DR-3; DR-3 cites Tim Brown / Material / Utopia. Correct it.
- [x] **Inconsistent Names / internal contradiction** §5.3 vs §4 intro: §5.3 lists
  a `.breadcrumbs` edge-class, but §4 fixes the closed edge-class list to
  `.secondary/.contrast/.outline`. Reframe §5.3 to the classless ideal
  (`nav[aria-label] > ol`) and record the shipped `ol.breadcrumbs` class as a gap.
- [x] **Inconsistent Names** §5.1/§5.4 call `.fluid` an edge-class; it is a layout
  utility, not a component variant. Clarify.
