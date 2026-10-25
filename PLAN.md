# Plan

A system design learning site that teaches each principle on its own page, ties it to real outages (COEs/postmortems) and to how companies solved the same problem, and includes a full AI infrastructure track.

## Decisions

| Area | Choice |
|---|---|
| App | React 19 + TypeScript + Vite, single-page app |
| Hosting | GitHub Pages, deployed by GitHub Actions on push to `main` |
| Routing | React Router `HashRouter` (deep links work on Pages without a server) |
| Content | MDX files in the repo, typed frontmatter, validated at build time |
| Search | MiniSearch, index built at build time and loaded on first use |
| Diagrams | Mermaid, lazy-loaded |
| Look | Warm white `#FAF7F2`, light black `#2A2A2A`, sage green accent (`#5F7356` fills, `#56694D` text), 6px corners, Inter + JetBrains Mono, dark mode |
| Mobile | Mobile-first: drawer navigation under 1024px, full-screen search on phones, 44px touch targets, stacked tables, full-screen diagrams, safe-area insets, no horizontal page scroll |
| Accessibility | WCAG AA contrast for all text pairs, keyboard navigation, reduced-motion support |

## Page template

Every principle: **The problem it solves → How it works → Trade-offs → In the real world → Interview angle**, followed by automatic sections: *Learn from failures* (postmortems), *In the real world* (case studies), *Related principles* and *Sources*.

Every postmortem: **What happened → Root cause → What changed → Lessons**, with company, date, duration and impact in the header.

## Principles (74)

| # | Category | Count |
|---|---|---|
| 1 | Foundations | 8 |
| 2 | Scaling & Traffic | 8 |
| 3 | Data & Storage | 10 |
| 4 | Caching | 5 |
| 5 | Distributed Systems | 10 |
| 6 | Async & Messaging | 6 |
| 7 | Reliability & Ops | 9 |
| 8 | Security & APIs | 5 |
| 9 | AI Infrastructure | 13 |

## Phases (one stacked PR each)

| Phase | Branch | Deliverable |
|---|---|---|
| 1. Scaffold | `phase-1-scaffold` | App shell, theme, mobile layout, search, MDX pipeline, content validation, deploy workflow, 3 sample pages |
| 2. Core | `phase-2-core-principles` | Foundations, Scaling, Data, Caching (31 principles) |
| 3. Real world | `phase-3-real-world` | 20 postmortem summaries, 15 case studies, reading list of engineering blogs and UI design systems |
| 4. Advanced | `phase-4-advanced-principles` | Distributed systems, Messaging, Reliability, Security (30 principles) |
| 5. AI infra | `phase-5-ai-infra` | 13 AI infrastructure principles and AI case studies |
| 6. Learning tools | `phase-6-learning-tools` | Progress tracking, learning paths, practice problems, strict link checking |
| 7. More practice | `phase-7-more-practice` | 10 more practice problems (16 total) and a practice ladder path |

Each phase branches from the previous one, and its PR targets the previous phase's branch. Merge them in order, starting with phase 1 into `main`.

## Status

Phases 1–7 are implemented: 74 principles, 20 postmortems, 19 case studies, 16 practice problems, 6 learning paths, progress tracking and a reading list. Possible next steps: an installable PWA with offline reading, quizzes, and periodic link checks of cited sources.

## Content rules

- Summaries are original writing that link to the source; no large quoted passages.
- Facts and figures come from the cited source.
- Every cross-reference must resolve: the build runs the content check in strict mode.
