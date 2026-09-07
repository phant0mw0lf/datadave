# datadave.dev

Data & AI blog. Astro 7 (static output, no adapter), Tailwind 4, deployed to
Cloudflare Workers Static Assets. Content is Markdown/MDX in the repo — git
is the CMS, there's no external database or headless CMS.

## Commands

Everything runs through `make` (see `make help`). The underlying npm
scripts still exist because Cloudflare's build environment calls
`npm run build` directly, not `make` — keep both in sync if you change one.

- `make dev` — dev server on :4321
- `make post TITLE="..."` — scaffold a new post with today's date and
  `draft: true`; use this instead of hand-copying an old post's frontmatter
- `make check` — typecheck + content schema validation, then build
- `make preview` — production build via Astro (drafts hidden, unlike `dev`)
- `make serve` — production build via the real Workers runtime (`wrangler dev`)
- `make deploy` — manual deploy; normally Cloudflare deploys on push to `main`

## Commits & PRs

Use Conventional Commits (`feat:`, `fix:`, `perf:`, `docs:`, `chore:`,
`refactor:` …) for every commit message **and** for PR titles. One type per
commit — split a change into multiple commits rather than inventing
combined types like `perf/a11y:`.

Merge PRs with **rebase merge** (not squash), so those semantic commits
land on `main` individually — that keeps `git log`/`git blame` granular
and lets a single `perf:` or `fix:` be reverted on its own. Squash only
when a branch's history is genuinely noisy (WIP commits), and give the
squash commit a conventional message.

**`typescript` is pinned to `^6.0.3` on purpose — don't bump it to 7.x.**
Tested it: TypeScript 7 is the new native/Go-based compiler rewrite and
doesn't expose the programmatic API `@astrojs/language-server` needs yet, so
`astro check` (and `make check`) hard-fails with it installed (`npm run
build` alone still works, which makes this easy to miss in a partial test).
Tracked upstream: https://github.com/withastro/roadmap/discussions/1321 —
safe to revisit once that lands.

## Content model

Schema lives in `src/content.config.ts` (Content Layer API — `glob` loader,
**not** the legacy `src/content/config.ts`). Every route that lists or
filters posts goes through `src/lib/posts.ts` (`getPosts`, `getTags`,
`getPostsByTag`) rather than calling `getCollection('blog')` directly — that
file is the one place the draft-filtering rule lives, and it must stay that
way so pages can't drift out of sync on what counts as "published."

Frontmatter fields: `title`, `description`, `pubDate`, `updatedDate?`,
`tags` (drives the `/tags/<tag>/` pages automatically), `draft`, `lang`,
`heroImage?`. See `src/content/blog/hello-world.mdx` for a filled-out
example.

Posts render at `/blog/<id>/`, where `<id>` is the filename (no `slug`
field — that's a legacy-collections concept; Content Layer entries use
`id`, derived from the file path under `src/content/blog/`).

## Site metadata

All author/site strings (name, email, GitHub, LinkedIn, description) live
in `src/consts.ts` as a single `SITE` object. Don't hardcode them elsewhere
— About page, footer, RSS feed, and JSON-LD all import from there.

## i18n

Only English is published. The `lang` field on posts and the file layout
already anticipate German being added later (see the plan/README for the
exact steps) — don't build routing or a language switcher until there's
actually a German post to serve.

## Styling

Tailwind 4, configured CSS-first in `src/styles/global.css` via `@theme` —
there is no `tailwind.config.js`, don't create one. Dark mode toggles a
`.dark` class on `<html>`; the class is set by an inline `<script>` in
`BaseHead.astro` that must run before first paint, or toggling flashes the
wrong theme on load.

## Design system

Palette is GitHub's own light/dark UI tokens (`--color-bg/fg/fg-muted/
border/accent` in `global.css`), which is also why the Shiki code-block
theme is `github-light`/`github-dark-default` in `astro.config.mjs` — one
system instead of two.

**The `--tag-0` through `--tag-5` categorical tag colors must stay in a
plain `:root`/`.dark` block, never inside `@theme`.** Tailwind 4's theme
parser doesn't recognize `tag` as a namespace and silently drops every
entry past the first when they're declared inside `@theme` — this broke
the palette once already this session (all six tags rendered as the same
color, no error, no warning). These tokens are only ever consumed via
`var(--tag-N)` in inline `style` attributes (see `src/lib/tagColor.ts`,
`TagPill.astro`), never as a generated utility class, so they don't need to
be inside `@theme` in the first place.

`--tag-N` as a background is white-text-on-solid in light mode but a tint
(`color-mix(in oklab, var(--tag-N) 15%, transparent)`) with `var(--tag-N)`
as the text color in dark mode — see the `.tag-pill` rule in `global.css`.
White-on-solid fails WCAG AA contrast for several of the six colors in dark
mode; don't revert to it without rechecking contrast.

## Mermaid diagrams

` ```mermaid ` fences render to client-side SVG via `astro-mermaid`. Two
things about the setup are deliberate and easy to "simplify" wrongly:

- **`autoTheme: false` in `astro.config.mjs`.** With `autoTheme` on, the
  integration forces Mermaid's stock `default`/`dark` themes and ignores
  `theme: 'base'` — the only theme that takes a full custom palette. We want
  the GitHub Primer palette (same reasoning as the Shiki theme choice), so
  `autoTheme` has to be off.
- **The palette lives in `src/lib/mermaidTheme.ts`** as literal hex, mirrored
  from the `--color-*` tokens in `global.css` (Mermaid runs color math over
  them, so `var()` can't be used). The integration bakes in the light set at
  build time; `src/components/MermaidTheme.astro` (rendered from
  `BaseLayout`) swaps to the dark set on load and re-renders on every theme
  toggle. `mermaid` (~1 MB) is only ever reached through a dynamic `import()`
  guarded by a `pre.mermaid` DOM check, so diagram-free pages ship none of it.

Fonts are self-hosted (`public/fonts/`, generated `src/styles/fonts.css`) —
IBM Plex Sans for body/UI, IBM Plex Mono for dates/tags/code, Fraunces for
display. **Fraunces is reserved for the post/page `<h1>` only** (see
`PostLayout.astro`, `index.astro`) — don't reach for it elsewhere,
including prose section headings (`.prose h2`/`h3` in `global.css` are
deliberately IBM Plex Sans, not Fraunces — an earlier italic-Fraunces
version of those was tried and reverted, it read as too "designed"
mid-article). The rest of the UI stays IBM Plex Sans on purpose, so the
display face doesn't show up anywhere except that one signature moment.

## Development

Humans run `make dev`, which is `npm run dev` in the foreground — normal
for an interactive terminal.

**Agents should not use `make dev`** — it blocks, since `make` doesn't
background the process for you. Use background mode directly instead:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
- [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
