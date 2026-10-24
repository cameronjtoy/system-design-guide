# System Design Guide

A mobile-friendly React site for learning system design from first principles, real-world outages and how tech companies solved hard scaling problems, with a dedicated track on AI infrastructure.

**Live site:** https://cameronjtoy.github.io/system-design-guide/

See [PLAN.md](PLAN.md) for the roadmap.

## Running locally

```bash
npm install
npm run dev            # http://localhost:5173/system-design-guide/
npm run build          # validate content, typecheck, build to dist/
npm run preview        # serve the production build
npm run check:content  # validate frontmatter and cross-links (add -- --strict to fail on warnings)
```

Requires Node 22.18 or newer (the content scripts are TypeScript run directly by Node).

## How it's built

- **React 19 + TypeScript + Vite**, with **React Router** in hash mode (`/#/principles/...`) so deep links work on GitHub Pages.
- **MDX** for content. Each page is a `.mdx` file under `src/content/`, loaded lazily as its own chunk.
- A small Vite plugin (`scripts/vite-plugin-content.ts`) reads every file's frontmatter at build time and exposes it as `virtual:content` (page metadata) and `virtual:search-docs` (the search index, loaded only when search opens).
- **MiniSearch** for in-browser search, **Mermaid** for diagrams (loaded only on pages that have one).
- Plain CSS with design tokens in `src/styles/tokens.css` and CSS Modules per component.

Pushing to `main` deploys via `.github/workflows/deploy.yml`. Every pull request is built by `.github/workflows/ci.yml`.

## Writing content

### Principles

`src/content/principles/<category>/<slug>.mdx`. The folder name is the category (see `CATEGORIES` in `src/content/meta.ts`) and the filename is the URL slug.

```yaml
---
title: Caching strategies
summary: One or two sentences shown under the title and on cards.
difficulty: beginner        # beginner | intermediate | advanced
order: 1                    # position within the category
tags: [cache-aside, redis]
companies: [Meta, Amazon]
related: [cache-invalidation, cache-stampede]   # other principle slugs
sources:
  - title: Scaling Memcache at Facebook
    url: https://www.usenix.org/...
---
```

Recommended sections: *The problem it solves*, *How it works*, *Trade-offs*, *In the real world*, *Interview angle*. Related principles, linked postmortems and case studies, and sources are added to the bottom of the page automatically.

### Postmortems

`src/content/postmortems/<slug>.mdx`

```yaml
---
title: The S3 outage caused by one mistyped command
summary: ...
company: Amazon Web Services
date: 2017-02-28
duration: About 4 hours        # optional
impact: What users experienced.
principles: [cell-based-architecture, static-stability]
sources: [...]
---
```

Recommended sections: *What happened*, *Root cause*, *What changed*, *Lessons*.

### Case studies

`src/content/case-studies/<slug>.mdx` with `company`, `year` (number) and `principles` in place of the postmortem fields.

### Practice problems

`src/content/practice/<slug>.mdx` with `difficulty`, `order` and `principles`. Recommended sections: *The problem*, *Requirements*, *Estimate the scale*, hints, *A reference design*, *Deep dives and trade-offs*, *What interviewers look for*. Wrap hints and solutions in `<Reveal title="Hint 1: …">…</Reveal>` (leave a blank line after the opening tag so Markdown inside it renders).

### Learning paths

`src/content/paths.ts` defines the paths at `/#/paths`. Each step is `"<collection>/<slug>"`, for example `"principles/caching-strategies"` or `"practice/design-chat-app"`. Steps are validated by `check:content`.

### Reading list

`src/content/reading.ts` holds the curated links shown at `/#/reading`, grouped into engineering blogs, incident report collections, papers, books and UI design systems. Prefer primary sources written by the people who built the system.

### Components available in MDX

- `<Callout type="tip | example | warning | interview | note" title="Optional">…</Callout>`
- A ` ```mermaid ` code block renders as a diagram.
- Links starting with `/` (e.g. `[sharding](/principles/sharding-and-partitioning)`) navigate inside the app.
- `<Reveal title="…">…</Reveal>` for collapsible hints and solutions.
- Tables with three or more columns turn into stacked cards on phones.

### Validation

`npm run build` runs `check:content --strict`, so any reference to a page that doesn't exist (in `related`, `principles`, internal links or learning paths) fails the build.

### Progress tracking

"Mark as learned" state is stored in the reader's browser (`localStorage`) through `src/lib/progress.ts`; nothing is sent to a server.

### Sources and copyright

Summaries are written in our own words and always link to the original article. Don't paste large passages from the source.
